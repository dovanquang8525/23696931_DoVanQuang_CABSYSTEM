'use strict';
const b = require('../../scripts/business.cjs');
const {createBus} = require('../../scripts/event-bus.cjs');
const {provisionLocations,readLocation}=require('../../scripts/demo-locations.cjs');
async function create({db,client,server}) {
  await provisionLocations(db,'trip_service');
  const c=b.context('trip_service',db,client), trips=db.collection('trips');
  await trips.createIndex({booking_id:1},{unique:true});
  await trips.createIndex({driver_id:1},{unique:true,partialFilterExpression:{status:{$in:['ASSIGNED','ARRIVED','IN_PROGRESS']}}});
  const bus=await createBus({service:'trip_service',db,client,publishOutbox:true});
  async function get(id,session) { const row=await trips.findOne({trip_id:b.v.id(id)},{session}); if (!row) b.missing(); return row; }
  async function owned(id,call,roles=['CUSTOMER','DRIVER','ADMIN']) {
    const {claims}=await c.actor(call,roles),row=await get(id);
    if (!row.assignmentConfirmed) b.fail(b.grpc.status.UNAVAILABLE,'ASSIGNMENT_IN_PROGRESS','Assignment is being recovered.');
    if (claims.role!=='ADMIN' && row[claims.role==='CUSTOMER'?'customerAccountId':'driverAccountId']!==claims.sub) b.forbidden();
    return row;
  }
  async function transition(id,call,from,to,stamp,type,reason) {
    await owned(id,call,to==='CANCELED'?['CUSTOMER']:['DRIVER']);
    return c.tx(async session=>{
      const row=await get(id,session);
      if (row[stamp]) return b.views.trip(row); // Return the saved milestone without publishing twice.
      if (!from.includes(row.status)) b.conflict();
      const time=b.now(),version=row.version+1;
      const amount=to==='COMPLETED'?b.fare(row.distance_km,row.pricing_snapshot):undefined;
      const update={status:to,[stamp]:time,version,...(amount!==undefined?{fare_amount:amount}:{}),
        ...(reason?{cancelReason:reason,canceledBy:row.customerAccountId}:{})};
      const saved=await trips.findOneAndUpdate({_id:row._id,version:row.version,status:row.status},{$set:update},{session,returnDocument:'after'});
      if (!saved) b.conflict();
      if (type) {
        const payload={tripId:row.trip_id,bookingId:row.booking_id,driverId:row.driver_id,
          customerAccountId:row.customerAccountId,driverAccountId:row.driverAccountId,
          [to==='COMPLETED'?'completedAt':to==='CANCELED'?'canceledAt':'arrivedAt']:time};
        if (to==='COMPLETED') Object.assign(payload,{fareAmount:amount===undefined?null:amount,aggregateVersion:version});
        if (to==='CANCELED') Object.assign(payload,{reason,fee:0,aggregateVersion:version});
        await c.emit(type,row.trip_id,payload,session,version);
      }
      if (to==='COMPLETED' && amount===undefined) console.error('trip_service: FARE_PENDING; tripId='+row.trip_id);
      return b.views.trip(saved);
    });
  }
  const assignmentView=row=>({trip:b.views.trip(row),assignment_confirmed:row.assignmentConfirmed,operation_id:row.operationId});
  async function recalculate(id) {
    const row=await get(id); if (row.status!=='COMPLETED') b.conflict();
    const amount=b.fare(row.distance_km,row.pricing_snapshot);
    if (amount!==undefined && row.fare_amount===undefined) await trips.updateOne({_id:row._id,status:'COMPLETED',fare_amount:{$exists:false}},{$set:{fare_amount:amount}});
    return b.views.trip(await get(id));
  }
  const handlers={
    async CreateTrip(i) {
      b.v.fields(i,['operation_id','booking_id','customer_id','customer_account_id','driver_id','driver_account_id','vehicle_id',
        'pickup','destination','distance_km','pricing_snapshot','driver_snapshot'],['operation_id','booking_id','customer_id',
        'customer_account_id','driver_id','driver_account_id','vehicle_id','pickup','destination','distance_km','pricing_snapshot','driver_snapshot']);
      for (const k of ['booking_id','customer_id','customer_account_id','driver_id','driver_account_id','vehicle_id']) (k.endsWith('account_id')?b.v.objectId:b.v.id)(i[k]);
      b.key(i.operation_id); b.coords(i.pickup); b.coords(i.destination);
      if (b.distance(i.pickup,i.destination)===0 || !Number.isFinite(i.distance_km) || i.distance_km<0 ||
          b.fare(i.distance_km,i.pricing_snapshot)===undefined || i.driver_snapshot.driver_id!==i.driver_id ||
          i.driver_snapshot.vehicle?.vehicle_id!==i.vehicle_id) b.v.invalid();
      let row=await trips.findOne({booking_id:i.booking_id});
      if (!row) {
        const id=new b.ObjectId();
        row={_id:id,trip_id:await b.allocateId(db,'t'),...b.pick(i,['booking_id','customer_id','driver_id','vehicle_id','pickup',
          'destination','distance_km','pricing_snapshot']),customerAccountId:i.customer_account_id,driverAccountId:i.driver_account_id,
          driver:i.driver_snapshot,vehicle_type:'BIKE',currency:'VND',assigned_at:b.now(),status:'ASSIGNED',
          operationId:i.operation_id,assignmentConfirmed:false,version:1};
        try { await trips.insertOne(row); }
        catch(e) { if (e.code!==11000) throw e; row=await trips.findOne({booking_id:i.booking_id}); if (!row) b.conflict(); }
      }
      if (row.operationId!==i.operation_id || row.driver_id!==i.driver_id) b.conflict();
      return assignmentView(row);
    },
    async ActivateAssignment(i) {
      b.v.fields(i,['operation_id','booking_id','trip_id'],['operation_id','booking_id','trip_id']);
      const row=await get(i.trip_id);
      if (row.operationId!==i.operation_id || row.booking_id!==i.booking_id) b.conflict();
      const decision=await c.invoke('booking','getAssignmentDecision',{booking_id:i.booking_id,operation_id:i.operation_id});
      if (decision.decision!=='COMMIT' || decision.expected_trip_id!==row.trip_id || decision.driver_id!==row.driver_id ||
          decision.vehicle_id!==row.vehicle_id) b.conflict();
      await trips.updateOne({_id:row._id},{$set:{assignmentConfirmed:true}}); return assignmentView({...row,assignmentConfirmed:true});
    },
    async GetTripByBooking(i) {
      b.v.fields(i,['booking_id'],['booking_id']); const row=await trips.findOne({booking_id:b.v.id(i.booking_id)});
      if (!row) b.missing(); return assignmentView(row);
    },
    async GetTrip(i,call) { b.v.fields(i,['trip_id'],['trip_id']); return b.views.trip(await owned(i.trip_id,call)); },
    async ArriveTrip(i,call) { b.v.fields(i,['trip_id'],['trip_id']); return transition(i.trip_id,call,['ASSIGNED'],'ARRIVED','arrived_at','trip.arrived'); },
    async StartTrip(i,call) { b.v.fields(i,['trip_id'],['trip_id']); return transition(i.trip_id,call,['ARRIVED'],'IN_PROGRESS','started_at'); },
    async CompleteTrip(i,call) { b.v.fields(i,['trip_id'],['trip_id']); return transition(i.trip_id,call,['IN_PROGRESS'],'COMPLETED','completed_at','trip.completed'); },
    async CancelTrip(i,call) { b.v.fields(i,['trip_id','reason'],['trip_id','reason']); return transition(i.trip_id,call,['ASSIGNED','ARRIVED'],'CANCELED','canceled_at','trip.canceled',b.v.text(i.reason,300)); },
    async UpdateTripLocation(i,call) {
      b.v.fields(i,['trip_id','location','location_code'],['trip_id']); const row=await owned(i.trip_id,call,['DRIVER']);
      if(Object.hasOwn(i,'location')===Object.hasOwn(i,'location_code'))b.v.invalid();
      const point=i.location_code!==undefined?await readLocation(db,i.location_code):b.coords(i.location);
      const location={...point,updated_at:b.now()};
      const saved=await trips.findOneAndUpdate({_id:row._id,status:'IN_PROGRESS'},{$set:{latest_location:location},$inc:{version:1}},{returnDocument:'after'});
      if (!saved) b.conflict();
      await c.invoke('driver','updateLocationFromTrip',{driver_id:row.driver_id,trip_id:row.trip_id,location:point,source_time:location.updated_at},call);
      return location;
    },
    async ListTrips(i,call) {
      b.v.fields(i,['paging','customer_id','driver_id','status'],['paging']); await c.actor(call,['ADMIN']);
      const filter={assignmentConfirmed:true};
      for (const k of ['customer_id','driver_id']) if (i[k]) filter[k]=b.v.id(i[k]);
      if (i.status) { if (!['ASSIGNED','ARRIVED','IN_PROGRESS','COMPLETED','CANCELED'].includes(i.status)) b.v.invalid(); filter.status=i.status; }
      return b.page(trips,filter,i.paging,b.views.trip,{assigned_at:-1,_id:-1});
    },
    async GetTripForPayment(i,call) {
      b.v.fields(i,['trip_id'],['trip_id']); const row=await owned(i.trip_id,call,['CUSTOMER','ADMIN']);
      return {trip:b.views.trip(row),customer_account_id:row.customerAccountId,driver_account_id:row.driverAccountId};
    },
    async GetTripForReview(i,call) {
      b.v.fields(i,['trip_id'],['trip_id']); const row=await owned(i.trip_id,call,['CUSTOMER','DRIVER','ADMIN']);
      return {trip:b.views.trip(row),customer_account_id:row.customerAccountId,driver_account_id:row.driverAccountId};
    },
    async RecalculateFare(i) { b.v.fields(i,['trip_id'],['trip_id']); return recalculate(i.trip_id); }
  };
  b.addHandlers(server,'trip',handlers);
  let working=false;
  const timer=setInterval(async()=>{
    if (working) return; working=true;
    try { for (const row of await trips.find({status:'COMPLETED',fare_amount:{$exists:false}}).limit(20).toArray()) await recalculate(row.trip_id); }
    catch { console.error('trip_service: fare recovery deferred'); } finally {working=false;}
  },5000);
  return {isReady:bus.isReady,async close(){clearInterval(timer);await bus.close();}};
}
module.exports={create};
