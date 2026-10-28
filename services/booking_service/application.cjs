'use strict';
const crypto=require('node:crypto');
const b=require('../../scripts/business.cjs');
const {createBus}=require('../../scripts/event-bus.cjs');
const {provisionLocations,readLocation}=require('../../scripts/demo-locations.cjs');
async function create({db,client,server}) {
  await provisionLocations(db,'booking_service');
  const c=b.context('booking_service',db,client),bookings=db.collection('bookings'),invitations=db.collection('invitations');
  await bookings.createIndex({customer_id:1,idempotencyKey:1},{unique:true});
  await invitations.createIndex({booking_id:1},{unique:true,partialFilterExpression:{status:'PENDING'}});
  await invitations.createIndex({driver_id:1,status:1,expires_at:1});
  const bus=await createBus({service:'booking_service',db,client,publishOutbox:true,async consume(event,session) {
    const p=event.payload;
    const update={status:event.eventType==='trip.completed'?'COMPLETED':'CANCELED',updated_at:event.occurredAt};
    if(event.eventType==='trip.canceled') update.cancellation={booking_id:p.bookingId,trip_id:p.tripId,status:'CANCELED',reason:p.reason,fee_amount:0,canceled_at:p.canceledAt};
    await bookings.updateOne({booking_id:p.bookingId,trip_id:p.tripId,status:'ASSIGNED'},{$set:update,$inc:{version:1}},{session});
  }});
  async function get(id,session) {const row=await bookings.findOne({booking_id:b.v.id(id)},{session});if(!row)b.missing();return row;}
  async function customer(call) {
    const {claims}=await c.actor(call,['CUSTOMER']);
    const profile=await c.invoke('customer','getCustomerByAccount',{account_id:claims.sub},call);
    return {claims,profile};
  }
  async function own(id,call) {
    const {claims}=await c.actor(call,['CUSTOMER','ADMIN']),row=await get(id);
    if(claims.role!=='ADMIN'&&row.customerAccountId!==claims.sub)b.forbidden();return row;
  }
  const decision=row=>({booking_id:row.booking_id,operation_id:row.operation.id,decision:row.operation.decision,
    phase:row.operation.phase,driver_id:row.operation.driverId,vehicle_id:row.operation.vehicleId || '',
    ...(row.operation.tripId?{expected_trip_id:row.operation.tripId}:{})});
  const locks=new Map();
  async function serial(id,work) {
    const previous=locks.get(id)||Promise.resolve(),task=previous.catch(()=>{}).then(work);locks.set(id,task);
    try{return await task;}finally{if(locks.get(id)===task)locks.delete(id);}
  }
  async function advance(id) {
    let row=await get(id);const op=row.operation;
    if(!op||op.phase==='DONE'||op.decision==='ABORT')return;
    if(op.decision==='COMMIT') { await activate(row); return; }
    const reservation={driver_id:op.driverId,booking_id:id,operation_id:op.id};
    let held;
    try{held=await c.invoke('driver','reserveDriver',reservation);}
    catch(error){
      if(op.phase!=='RESERVING'||![b.grpc.status.ABORTED,b.grpc.status.FAILED_PRECONDITION].includes(error.code))throw error;
      // A definitive Reserve rejection precedes any CreateTrip. Never release an uncertain write.
      await c.tx(async session=>{
        await bookings.updateOne({_id:row._id,'operation.id':op.id,'operation.phase':'RESERVING'},{$unset:{operation:''},$inc:{version:1}},{session});
        await invitations.updateOne({invitation_id:op.invitationId,status:'PENDING'},{$set:{status:'REJECTED',responded_at:b.now()}},{session});
      });return;
    }
    const dispatch=held.dispatch_data;
    await bookings.updateOne({_id:row._id,'operation.id':op.id,'operation.phase':'RESERVING'},{$set:{'operation.phase':'CREATING','operation.vehicleId':dispatch.driver.vehicle.vehicle_id,'operation.dispatch':dispatch}});
    row=await get(id);
    const created=await c.invoke('trip','createTrip',{operation_id:op.id,booking_id:id,customer_id:row.customer_id,
      customer_account_id:row.customerAccountId,driver_id:op.driverId,driver_account_id:dispatch.driver_account_id,
      vehicle_id:dispatch.driver.vehicle.vehicle_id,pickup:row.pickup,destination:row.destination,distance_km:row.distance_km,
      pricing_snapshot:row.pricing_snapshot,driver_snapshot:dispatch.driver});
    const tripId=created.trip.trip_id;
    await c.invoke('driver','confirmReservation',{...reservation,trip_id:tripId});
    await c.tx(async session=>{
      const current=await get(id,session);if(current.operation.id!==op.id)b.conflict();
      if(current.operation.decision==='COMMIT')return;
      await bookings.updateOne({_id:row._id,'operation.id':op.id},{$set:{status:'ASSIGNED',trip_id:tripId,
        driver_id:op.driverId,driverAccountId:dispatch.driver_account_id,updated_at:b.now(),
        'operation.tripId':tripId,'operation.vehicleId':dispatch.driver.vehicle.vehicle_id,'operation.decision':'COMMIT','operation.phase':'ACTIVATING'},$inc:{version:1}},{session});
      await invitations.updateOne({invitation_id:op.invitationId},{$set:{status:'ACCEPTED',responded_at:b.now()}},{session});
    });
    await activate(await get(id));
  }
  async function activate(row) {
    const id=row.booking_id,op=row.operation,tripId=op.tripId,dispatch=op.dispatch;
    await c.invoke('trip','activateAssignment',{operation_id:op.id,booking_id:id,trip_id:tripId});
    await c.tx(async session=>{
      const current=await get(id,session);if(current.operation.phase==='DONE')return;
      await bookings.updateOne({_id:row._id,'operation.id':op.id},{$set:{'operation.phase':'DONE'}},{session});
      await c.emit('booking.assigned',id,{bookingId:id,tripId,customerAccountId:row.customerAccountId,
        driverAccountId:dispatch.driver_account_id,driverPublicSnapshot:b.camel(dispatch.driver)},session,current.version);
    });
  }
  async function search(id) {
    let row=await get(id);if(row.operation){await advance(id);return;}
    if(row.status!=='SEARCHING')return;
    if(!row.candidates){
      const found=await c.invoke('driver','findCandidates',{pickup:row.pickup,limit:5});
      await bookings.updateOne({_id:row._id,candidates:{$exists:false},status:'SEARCHING'},{$set:{candidates:(found.items||[]).map(x=>x.driver.driver_id),cursor:0}});
      row=await get(id);
    }
    const pending=await invitations.findOne({booking_id:id,status:'PENDING'});
    if(pending&&pending.expires_at>b.now())return;
    if(pending)await c.tx(async session=>{
      const current=await get(id,session);if(current.operation||current.status!=='SEARCHING')return;
      await bookings.updateOne({_id:row._id,version:current.version},{$inc:{version:1}},{session});
      await invitations.updateOne({_id:pending._id,status:'PENDING',expires_at:{$lte:b.now()}},{$set:{status:'EXPIRED'}},{session});
    });
    row=await get(id);if(row.operation||row.status!=='SEARCHING')return;
    for(let n=row.cursor;n<row.candidates.length;n++){
      const data=await c.invoke('driver','getDispatchData',{driver_id:row.candidates[n]});
      if(!data.is_online||data.active_trip_id||data.reservation_operation_id||!data.location||
        Date.now()-Date.parse(data.location.updated_at)>120000||b.distance(row.pickup,data.location)>1){
        await bookings.updateOne({_id:row._id,status:'SEARCHING'},{$max:{cursor:n+1}});continue;
      }
      await c.tx(async session=>{
        const current=await get(id,session);if(current.operation||current.status!=='SEARCHING')return;
        if(await invitations.findOne({booking_id:id,status:'PENDING'},{session}))return;
        const invId=new b.ObjectId(),expires=new Date(Date.now()+30000).toISOString();
        await bookings.updateOne({_id:row._id,version:current.version},{$set:{cursor:n+1},$inc:{version:1}},{session});
        await invitations.insertOne({_id:invId,invitation_id:invId.toHexString(),booking_id:id,driver_id:row.candidates[n],
          pickup:row.pickup,destination:row.destination,vehicle_type:'BIKE',status:'PENDING',expires_at:expires},{session});
        await c.emit('booking.invitation_created',invId.toHexString(),{invitationId:invId.toHexString(),bookingId:id,
          driverAccountId:data.driver_account_id,expiresAt:expires},session);
      });return;
    }
    await c.tx(async session=>{
      const current=await get(id,session);if(current.operation||current.status!=='SEARCHING')return;
      if(await invitations.findOne({booking_id:id,status:'PENDING'},{session}))return;
      await bookings.updateOne({_id:row._id,version:current.version},{$set:{status:'NO_DRIVER',updated_at:b.now()},$inc:{version:1}},{session});
      await c.emit('booking.no_driver',id,{bookingId:id,customerAccountId:row.customerAccountId,status:'NO_DRIVER'},session,current.version+1);
    });
  }
  const handlers={
    async CreateBooking(i,call){
      b.v.fields(i,['pickup','destination','pickup_code','destination_code','idempotency_key'],['idempotency_key']);
      const key=b.key(i.idempotency_key),hasCodes=Object.hasOwn(i,'pickup_code')||Object.hasOwn(i,'destination_code');
      let request,pickup,destination;
      if(hasCodes){
        if(Object.hasOwn(i,'pickup')||Object.hasOwn(i,'destination')||
          typeof i.pickup_code!=='string'||typeof i.destination_code!=='string'||
          !/^[A-Z][A-Z0-9]{0,15}$/.test(i.pickup_code)||!/^[A-Z][A-Z0-9]{0,15}$/.test(i.destination_code)||
          i.pickup_code===i.destination_code)b.v.invalid();
        request={pickupCode:i.pickup_code,destinationCode:i.destination_code};
      }else{pickup=b.coords(i.pickup);destination=b.coords(i.destination);request={pickup,destination};}
      const {claims,profile}=await customer(call),payloadHash=b.hash(request);
      function replay(row){
        if(row.payloadHash!==payloadHash)b.fail(b.grpc.status.ABORTED,'IDEMPOTENCY_CONFLICT','Key was used with different input.');
        return row.responseSnapshot;
      }
      const old=await bookings.findOne({customer_id:profile.customer_id,idempotencyKey:key});if(old)return replay(old);
      if(hasCodes){pickup=await readLocation(db,i.pickup_code);destination=await readLocation(db,i.destination_code);}
      if(b.distance(pickup,destination)===0)b.v.invalid();
      const id=new b.ObjectId(),time=b.now();
      const row={_id:id,booking_id:id.toHexString(),customer_id:profile.customer_id,customerAccountId:claims.sub,
        pickup,destination,vehicle_type:'BIKE',status:'SEARCHING',distance_km:b.distance(pickup,destination),
        pricing_snapshot:{base_fare:10000,rate_per_km:5000,rounding_unit:1000},created_at:time,updated_at:time,
        idempotencyKey:key,payloadHash,...(hasCodes?{routeCodes:request}:{}),version:1};row.responseSnapshot=b.views.booking(row);
      try{await c.tx(async session=>{
        await bookings.insertOne(row,{session});
        await c.emit('booking.created',row.booking_id,{bookingId:row.booking_id,customerAccountId:claims.sub,status:'SEARCHING'},session);
      });}catch(e){if(e.code!==11000)throw e;const saved=await bookings.findOne({customer_id:profile.customer_id,idempotencyKey:key});if(!saved)throw e;return replay(saved);}
      const metadata=new b.grpc.Metadata();metadata.set('cab-created','true');call.sendMetadata(metadata);
      return row.responseSnapshot;
    },
    async ListMyBookings(i,call){const {profile}=await customer(call);return b.page(bookings,{customer_id:profile.customer_id},i,b.views.booking);},
    async ListBookings(i,call){
      b.v.fields(i,['paging','customer_id','driver_id','status'],['paging']);await c.actor(call,['ADMIN']);const f={};
      for(const k of ['customer_id','driver_id'])if(i[k])f[k]=b.v.id(i[k]);
      if(i.status){if(!['SEARCHING','ASSIGNED','COMPLETED','CANCELED','NO_DRIVER'].includes(i.status))b.v.invalid();f.status=i.status;}
      return b.page(bookings,f,i.paging,b.views.booking);
    },
    async GetBooking(i,call){
      b.v.fields(i,['booking_id'],['booking_id']);const row=await own(i.booking_id,call);
      const result={booking:b.views.booking(row),trip_availability:'NOT_CREATED',payment_availability:'NOT_APPLICABLE',eta:{status:'NOT_APPLICABLE'}};
      if(!row.trip_id)return result;
      let trip;
      try{trip=await c.invoke('trip','getTrip',{trip_id:row.trip_id},call);result.trip=trip;result.trip_availability='TRIP_AVAILABLE';}
      catch(e){if(![b.grpc.status.UNAVAILABLE,b.grpc.status.DEADLINE_EXCEEDED].includes(e.code))throw e;result.trip_availability='TRIP_UNAVAILABLE';result.payment_availability='PAYMENT_UNAVAILABLE';result.eta={status:'UNAVAILABLE'};return result;}
      if(['ASSIGNED','ARRIVED'].includes(trip.status)){
        result.eta={status:'UNAVAILABLE'};
        if(trip.status==='ARRIVED')result.eta={status:'AVAILABLE',minutes:0,calculated_at:b.now()};
        else try{const data=await c.invoke('driver','getDispatchData',{driver_id:trip.driver_id});
          if(data.location&&Date.now()-Date.parse(data.location.updated_at)<=120000)result.eta={status:'AVAILABLE',minutes:Math.ceil(b.distance(data.location,row.pickup)*3),calculated_at:b.now()};
        }catch{}
      }
      if(trip.status==='COMPLETED'){
        try{result.payment_summary=await c.invoke('payment','getPaymentSummary',{trip_id:row.trip_id},call);result.payment_availability='PAYMENT_AVAILABLE';}
        catch(e){if(![b.grpc.status.UNAVAILABLE,b.grpc.status.DEADLINE_EXCEEDED].includes(e.code))throw e;result.payment_availability='PAYMENT_UNAVAILABLE';}
      }
      return result;
    },
    async PreviewBookingCancellation(i,call){
      b.v.fields(i,['booking_id','reason'],['booking_id','reason']);b.v.text(i.reason,300);
      const row=await own(i.booking_id,call);await c.actor(call,['CUSTOMER']);
      let allowed=row.status==='SEARCHING'&&!row.operation;
      if(row.trip_id){const trip=await c.invoke('trip','getTrip',{trip_id:row.trip_id},call);allowed=['ASSIGNED','ARRIVED'].includes(trip.status);}
      return {booking_id:row.booking_id,allowed,fee_amount:0,currency:'VND'};
    },
    async CancelBooking(i,call){
      b.v.fields(i,['booking_id','reason','confirmed'],['booking_id','reason','confirmed']);
      const reason=b.v.text(i.reason,300);if(i.confirmed!==true)b.v.invalid();
      const initial=await own(i.booking_id,call);await c.actor(call,['CUSTOMER']);
      return serial(initial.booking_id,async()=>{
        let row=await own(i.booking_id,call);if(row.cancellation)return row.cancellation;
        if(row.operation&&row.operation.phase!=='DONE')b.conflict();
        if(row.trip_id){
          await bookings.updateOne({_id:row._id,cancelIntent:{$exists:false}},{$set:{cancelIntent:reason}});
          row=await get(row.booking_id);
          const trip=await c.invoke('trip','cancelTrip',{trip_id:row.trip_id,reason:row.cancelIntent},call);
          const result={booking_id:row.booking_id,trip_id:row.trip_id,status:'CANCELED',reason:row.cancelIntent,fee_amount:0,canceled_at:trip.canceled_at};
          await bookings.updateOne({_id:row._id,cancellation:{$exists:false}},{$set:{cancellation:result,status:'CANCELED',updated_at:trip.canceled_at}});
          return (await get(row.booking_id)).cancellation;
        }
        return c.tx(async session=>{
          row=await get(i.booking_id,session);if(row.cancellation)return row.cancellation;
          if(row.status!=='SEARCHING'||row.operation)b.conflict();
          const result={booking_id:row.booking_id,status:'CANCELED',reason,fee_amount:0,canceled_at:b.now()};
          await bookings.updateOne({_id:row._id,version:row.version},{$set:{status:'CANCELED',cancellation:result,canceledBy:row.customerAccountId,updated_at:result.canceled_at},$inc:{version:1}},{session});
          await invitations.updateMany({booking_id:row.booking_id,status:'PENDING'},{$set:{status:'CANCELED'}},{session});
          await c.emit('booking.canceled',row.booking_id,{bookingId:row.booking_id,customerAccountId:row.customerAccountId,reason,canceledAt:result.canceled_at},session,row.version+1);
          return result;
        });
      });
    },
    async ListMyInvitations(i,call){
      b.v.fields(i,['paging','status'],['paging']);const {claims}=await c.actor(call,['DRIVER']);
      const driver=await c.invoke('driver','getDriverByAccount',{account_id:claims.sub},call),filter={driver_id:driver.driver_id};
      if(i.status){if(!['PENDING','ACCEPTED','REJECTED','EXPIRED','CANCELED'].includes(i.status))b.v.invalid();filter.status=i.status;}
      return b.page(invitations,filter,i.paging,b.views.invitation,{_id:-1});
    },
    async RespondInvitation(i,call){
      b.v.fields(i,['invitation_id','decision'],['invitation_id','decision']);b.v.id(i.invitation_id);
      if(!['ACCEPT','REJECT'].includes(i.decision))b.v.invalid();
      const {claims}=await c.actor(call,['DRIVER']),driver=await c.invoke('driver','getDriverByAccount',{account_id:claims.sub},call);
      const inv=await invitations.findOne({invitation_id:i.invitation_id});if(!inv)b.missing();if(inv.driver_id!==driver.driver_id)b.forbidden();
      return serial(inv.booking_id,async()=>{
        await c.tx(async session=>{
          const current=await invitations.findOne({_id:inv._id},{session}),row=await get(inv.booking_id,session);
          if(current.status===(i.decision==='ACCEPT'?'ACCEPTED':'REJECTED'))return;
          if(row.operation?.invitationId===i.invitation_id&&i.decision==='ACCEPT')return;
          if(current.status!=='PENDING'||current.expires_at<=b.now()||row.status!=='SEARCHING'||row.operation)b.conflict();
          if(i.decision==='REJECT'){
            await bookings.updateOne({_id:row._id,version:row.version},{$inc:{version:1}},{session});
            await invitations.updateOne({_id:inv._id},{$set:{status:'REJECTED',responded_at:b.now()}},{session});
          }else await bookings.updateOne({_id:row._id,version:row.version},{$set:{operation:{id:crypto.randomUUID(),
            invitationId:i.invitation_id,driverId:driver.driver_id,decision:'PENDING',phase:'RESERVING'}},$inc:{version:1}},{session});
        });
        if(i.decision==='ACCEPT')await advance(inv.booking_id);
        const saved=await invitations.findOne({_id:inv._id}),row=await get(inv.booking_id);
        if(i.decision==='ACCEPT'&&saved.status!=='ACCEPTED')b.conflict();
        return {invitation:b.views.invitation(saved),booking:b.views.booking(row),...(row.trip_id?{trip_id:row.trip_id}:{})};
      });
    },
    async GetAssignmentDecision(i){b.v.fields(i,['booking_id','operation_id'],['booking_id','operation_id']);const row=await get(i.booking_id);if(row.operation?.id!==i.operation_id)b.missing();return decision(row);},
    async GetAssignmentOperation(i){b.v.fields(i,['operation_id'],['operation_id']);const row=await bookings.findOne({'operation.id':b.key(i.operation_id)});if(!row)b.missing();return decision(row);}
  };
  b.addHandlers(server,'booking',handlers);
  let working=false,stopped=false;
  const timer=setInterval(async()=>{
    if(working||stopped)return;working=true;
    try{
      for(const row of await bookings.find({$or:[{status:'SEARCHING'},{'operation.phase':{$in:['CREATING','ACTIVATING','RESERVING']}}]}).limit(100).toArray()){
        if(stopped)break;
        try{await serial(row.booking_id,()=>search(row.booking_id));}
        catch{console.error('booking_service: recovery deferred; bookingId='+row.booking_id);}
      }
    }catch{console.error('booking_service: worker dependency unavailable');}finally{working=false;}
  },500);
  return {isReady:bus.isReady,async close(){stopped=true;clearInterval(timer);await Promise.allSettled([...locks.values()]);await bus.close();}};
}
module.exports={create};
