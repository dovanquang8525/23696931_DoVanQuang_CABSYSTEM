'use strict';
const fs=require('node:fs');
const path=require('node:path');
const YAML=require('yaml');
const Ajv=require('ajv');
const b=require('../../scripts/business.cjs');
const {required}=require('../../scripts/runtime-config.cjs');
const {verify}=require('../../scripts/mock-signature.cjs');
const {createBus}=require('../../scripts/event-bus.cjs');
const callbackSchema=YAML.parse(fs.readFileSync(path.join(__dirname,'../../docs/api/07-payments.yaml'),'utf8')).components.schemas.MockCallback;
const validateCallback=new Ajv({strict:false}).compile(callbackSchema);
async function create({db,client,server}){
  const secret=required('MOCK_CALLBACK_SECRET'),c=b.context('payment_service',db,client);
  const payments=db.collection('payments'),callbacks=db.collection('mock_callbacks'),guards=db.collection('trip_guards');
  await payments.createIndex({trip_id:1,attempt_number:1},{unique:true});
  await payments.createIndex({trip_id:1,idempotencyKey:1},{unique:true});
  await payments.createIndex({reference_code:1},{unique:true});
  await payments.createIndex({trip_id:1},{unique:true,partialFilterExpression:{status:{$in:['PENDING','COMPLETED']}}});
  const bus=await createBus({service:'payment_service',db,client,publishOutbox:true});
  async function get(id,session){const row=await payments.findOne({payment_id:b.v.id(id)},{session});if(!row)b.missing();return row;}
  async function trip(id,call){return (await c.invoke('trip','getTripForPayment',{trip_id:b.v.id(id)},call)).trip;}
  async function own(id,call){
    const {claims}=await c.actor(call,['CUSTOMER','ADMIN']),row=await get(id);
    if(claims.role!=='ADMIN'&&row.customerAccountId!==claims.sub)b.forbidden();return row;
  }
  async function attempt(tripId,failedId,key,call){
    const {claims}=await c.actor(call,['CUSTOMER']);b.key(key);
    const payloadHash=b.hash({tripId,failedId:failedId||null});
    function replay(row){
      if(row.customerAccountId!==claims.sub)b.forbidden();
      if(row.payloadHash!==payloadHash)b.fail(b.grpc.status.ABORTED,'IDEMPOTENCY_CONFLICT','Key was used with different input.');
      return row.responseSnapshot;
    }
    const old=await payments.findOne({trip_id:tripId,idempotencyKey:key});if(old)return replay(old);
    const current=await trip(tripId,call);
    if(current.status!=='COMPLETED'||!Number.isSafeInteger(current.fare_amount)||current.fare_amount<0)b.conflict();
    let created=false;
    let result;
    try{result=await c.tx(async session=>{
      created=false;
      // A local per-trip write serializes create/retry with concurrent callbacks.
      await guards.updateOne({_id:tripId},{$inc:{version:1}},{upsert:true,session});
      const previous=await payments.findOne({trip_id:tripId,idempotencyKey:key},{session});if(previous)return replay(previous);
      const rows=await payments.find({trip_id:tripId},{session}).sort({attempt_number:-1}).toArray();
      if(rows.some(x=>x.status==='PENDING'||x.status==='COMPLETED')||rows.length>=3)b.conflict();
      if(failedId){if(!rows.length||rows[0].payment_id!==failedId||rows[0].status!=='FAILED')b.conflict();}
      else if(rows.length)b.conflict();
      const id=new b.ObjectId(),publicId=await b.allocateId(db,'p',session),row={_id:id,payment_id:publicId,trip_id:tripId,method:'MOCK_ONLINE',status:'PENDING',
        amount:current.fare_amount,currency:'VND',reference_code:'CAB-'+publicId,attempt_number:rows.length+1,
        created_at:b.now(),customerAccountId:claims.sub,idempotencyKey:key,payloadHash};
      row.responseSnapshot=b.views.payment(row);await payments.insertOne(row,{session});created=true;return row.responseSnapshot;
    });}catch(e){
      if(e.code!==11000)throw e;
      const row=await payments.findOne({trip_id:tripId,idempotencyKey:key});if(!row)b.conflict();result=replay(row);created=false;
    }
    if(created){const metadata=new b.grpc.Metadata();metadata.set('cab-created','true');call.sendMetadata(metadata);}
    return result;
  }
  b.addHandlers(server,'payment',{
    async CreatePayment(i,call){b.v.fields(i,['trip_id','idempotency_key'],['trip_id','idempotency_key']);return attempt(b.v.id(i.trip_id),undefined,i.idempotency_key,call);},
    async RetryPayment(i,call){
      b.v.fields(i,['failed_payment_id','idempotency_key'],['failed_payment_id','idempotency_key']);
      const row=await own(i.failed_payment_id,call);return attempt(row.trip_id,row.payment_id,i.idempotency_key,call);
    },
    async GetPayment(i,call){b.v.fields(i,['payment_id'],['payment_id']);return b.views.payment(await own(i.payment_id,call));},
    async ListPayments(i,call){
      b.v.fields(i,['paging','trip_id','status'],['paging']);await c.actor(call,['ADMIN']);const filter={};
      if(i.trip_id)filter.trip_id=b.v.id(i.trip_id);
      if(i.status){if(!['PENDING','COMPLETED','FAILED'].includes(i.status))b.v.invalid();filter.status=i.status;}
      return b.page(payments,filter,i.paging,b.views.payment);
    },
    async GetPaymentSummary(i,call){
      b.v.fields(i,['trip_id'],['trip_id']);await c.actor(call,['CUSTOMER','ADMIN']);const current=await trip(i.trip_id,call);
      const rows=await payments.find({trip_id:i.trip_id}).sort({attempt_number:1}).toArray();
      return {trip_id:i.trip_id,...(current.fare_amount!==undefined?{fare_amount:current.fare_amount}:{}),currency:'VND',
        has_completed:rows.some(x=>x.status==='COMPLETED'),latest_status:rows.at(-1)?.status||'NOT_STARTED',attempts:rows.map(b.views.payment)};
    },
    async HandleMockCallback(i){
      b.v.fields(i,['raw_body','signature','timestamp'],['raw_body','signature','timestamp']);
      if(!Buffer.isBuffer(i.raw_body)||i.raw_body.length>65536||!Number.isSafeInteger(i.timestamp)||i.timestamp<0||
        !verify(i.raw_body,i.timestamp,i.signature,secret))b.fail(b.grpc.status.UNAUTHENTICATED,'INVALID_CALLBACK_SIGNATURE','Invalid callback signature.');
      let data;try{data=JSON.parse(i.raw_body.toString('utf8'));}catch{b.v.invalid();}
      if(!validateCallback(data)||data.timestamp!==i.timestamp)b.fail(b.grpc.status.INVALID_ARGUMENT,'INVALID_CALLBACK_DATA','Invalid callback data.');
      const payloadHash=b.hash(data);
      return c.tx(async session=>{
        const row=await get(data.pid,session);
        if(row.reference_code!==data.referenceCode||row.amount!==data.amount||data.currency!=='VND')b.fail(b.grpc.status.INVALID_ARGUMENT,'INVALID_CALLBACK_DATA','Callback does not match payment.');
        const seen=await callbacks.findOne({_id:data.eventId},{session});
        if(seen){
          if(seen.payloadHash!==payloadHash)b.fail(b.grpc.status.ABORTED,'IDEMPOTENCY_CONFLICT','Callback event ID was reused.');
          return {payment_id:row.payment_id,accepted:true,duplicate:true,status:seen.status};
        }
        if(Math.abs(Math.floor(Date.now()/1000)-data.timestamp)>300)b.fail(b.grpc.status.INVALID_ARGUMENT,'INVALID_CALLBACK_DATA','Callback timestamp is outside the allowed window.');
        if(row.status!=='PENDING'&&row.status!==data.result)b.conflict();
        await guards.updateOne({_id:row.trip_id},{$inc:{version:1}},{upsert:true,session});
        if(row.status==='PENDING'){
          const time=b.now();
          const saved=await payments.updateOne({_id:row._id,status:'PENDING'},{$set:{status:data.result,
            ...(data.result==='COMPLETED'?{confirmed_at:time}:{failure_code:'MOCK_DECLINED'})}},{session});
          if(!saved.modifiedCount)b.conflict();
          const payload={paymentId:row.payment_id,tripId:row.trip_id,customerAccountId:row.customerAccountId,
            ...(data.result==='COMPLETED'?{amount:row.amount,currency:'VND',completedAt:time}:
              {attemptNumber:row.attempt_number,failureCode:'MOCK_DECLINED',failedAt:time})};
          await c.emit(data.result==='COMPLETED'?'payment.completed':'payment.failed',row.payment_id,payload,session,2);
        }
        await callbacks.insertOne({_id:data.eventId,payloadHash,paymentId:row.payment_id,status:data.result,processedAt:new Date()},{session});
        return {payment_id:row.payment_id,accepted:true,duplicate:row.status!=='PENDING',status:data.result};
      });
    }
  });
  return {isReady:bus.isReady,close:bus.close};
}
module.exports={create};
