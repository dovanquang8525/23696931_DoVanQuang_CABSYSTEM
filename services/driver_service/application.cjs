'use strict';
const b = require('../../scripts/business.cjs');
const {createBus} = require('../../scripts/event-bus.cjs');
const {encrypt,decrypt,dataKey} = require('../../scripts/driver-crypto.cjs');
const {provisionLocations,readLocation}=require('../../scripts/demo-locations.cjs');
async function create({db,client,server}) {
  dataKey();
  await provisionLocations(db,'driver_service');
  const c = b.context('driver_service',db,client), drivers = db.collection('driver_profiles');
  await drivers.createIndex({accountId:1},{unique:true});
  await drivers.createIndex({did:1},{unique:true,partialFilterExpression:{did:{$type:'string'}}});
  await drivers.createIndex({'vehicle.plate_number':1},{unique:true,partialFilterExpression:{'vehicle.plate_number':{$type:'string'}}});
  const bus = await createBus({service:'driver_service',db,client,publishOutbox:true,async consume(event,session) {
    const p = event.payload;
    if (event.eventType === 'account.registered' && p.role === 'DRIVER') {
      const id = new b.ObjectId();
      await drivers.updateOne({accountId:p.accountId},{$setOnInsert:{_id:id,driver_id:p.did,accountId:p.accountId,
        full_name:p.fullName,did:p.did,...(p.email ? {email:p.email}:{}),
        ...(p.plateNumber?{registrationPlateNumber:p.plateNumber}:{}),approval_status:'DRAFT',is_online:false,version:1}}, {upsert:true,session});
    }
    if (['trip.completed','trip.canceled'].includes(event.eventType)) {
      await drivers.updateOne({driver_id:p.driverId,active_trip_id:p.tripId},
        {$unset:{active_trip_id:'',reservation:''},$inc:{version:1}},{session});
    }
  }});
  async function view(row) {
    const access=await c.invoke('auth','getAccountAccess',{account_id:row.accountId});
    return {...b.pick(row,['driver_id','did','full_name','email','approval_status','is_online','location','vehicle','active_trip_id',
      'rejection_reason','submitted_at','reviewed_at']),account_id:access.aid,
      ...(row.vehicle?.plate_number||row.registrationPlateNumber?{plate_number:row.vehicle?.plate_number||row.registrationPlateNumber}:{}),
      ...(row.licenseNumberEncrypted ? {license_number:decrypt(row.licenseNumberEncrypted)}:{})};
  }
  async function mine(call) {
    const {claims} = await c.actor(call,['DRIVER']);
    const row = await drivers.findOne({accountId:claims.sub});
    if (!row) b.fail(b.grpc.status.UNAVAILABLE,'PROFILE_NOT_READY','Driver profile is not ready yet.');
    return row;
  }
  const publicView = row => ({driver_id:row.driver_id,did:row.did,full_name:row.full_name,vehicle:row.vehicle});
  const dispatch = row => ({driver:publicView(row),driver_account_id:row.accountId,location:row.location,
    is_online:row.is_online,...(row.active_trip_id ? {active_trip_id:row.active_trip_id}:{}),
    ...(row.reservation ? {reservation_operation_id:row.reservation.operation_id,reserved_booking_id:row.reservation.booking_id}:{})});
  async function eligible(row) {
    if (!row || row.approval_status !== 'APPROVED' || !row.is_online || row.active_trip_id || row.reservation ||
      !row.vehicle?.is_active || row.vehicle.vehicle_type !== 'BIKE' || !row.location) return false;
    const account = await c.invoke('auth','getAccountAccess',{account_id:row.accountId});
    return account.status === 'ACTIVE' && account.role === 'DRIVER';
  }
  async function nearby(location,admin=false) {
    const result = [];
    const filter=admin?{location:{$exists:true}}:{approval_status:'APPROVED',is_online:true,active_trip_id:{$exists:false},reservation:{$exists:false}};
    for (const row of await drivers.find(filter).toArray()) {
      if (!row.location) continue;
      const km = b.distance(location,row.location);
      if (km <= 1 && (admin || await eligible(row))) result.push({driver:publicView(row),distance_km:km,location:row.location,
        ...(admin?{admin_profile:await view(row),approval_status:row.approval_status,is_online:row.is_online,
          location_is_fresh:Date.now()-Date.parse(row.location.updated_at)<=120000}:{})});
    }
    return result.sort((a,z)=>a.distance_km-z.distance_km || a.driver.driver_id.localeCompare(z.driver.driver_id));
  }
  async function edit(row, update, filter = {}) {
    const saved = await drivers.findOneAndUpdate({_id:row._id,version:row.version,...filter},
      {$set:update,$inc:{version:1}},{returnDocument:'after'});
    if (!saved) b.conflict();
    return saved;
  }
  async function get(id) { const row = await drivers.findOne({driver_id:b.v.id(id)}); if (!row) b.missing(); return row; }
  function reservationView(row) { return {...row.reservation,driver_id:row.driver_id,dispatch_data:dispatch(row)}; }
  const handlers = {
    async GetMyDriver(i,call) { b.v.fields(i,[]); return view(await mine(call)); },
    async GetDriver(i,call) {
      b.v.fields(i,['driver_id'],['driver_id']); const {claims}=await c.actor(call,['DRIVER','ADMIN']);
      const row=await get(i.driver_id); if (claims.role !== 'ADMIN' && row.accountId !== claims.sub) b.forbidden(); return view(row);
    },
    async UpdateMyDriver(i,call) {
      b.v.fields(i,['full_name','email','license_number']); const row=await mine(call);
      if (!['DRAFT','REJECTED'].includes(row.approval_status) || row.reservation || row.active_trip_id) b.conflict();
      const update={};
      if (i.full_name !== undefined) update.full_name=b.v.text(i.full_name,100);
      if (i.email !== undefined) update.email=b.v.email(i.email);
      if (i.license_number !== undefined) update.licenseNumberEncrypted=encrypt(b.v.text(i.license_number,50));
      if (!Object.keys(update).length) b.v.invalid(); return view(await edit(row,update));
    },
    async GetMyVehicle(i,call) { b.v.fields(i,[]); const row=await mine(call); if (!row.vehicle) b.missing(); return row.vehicle; },
    async UpsertMyVehicle(i,call) {
      b.v.fields(i,['plate_number','model','color'],['plate_number','model','color']); const row=await mine(call);
      if (row.active_trip_id || row.reservation) b.conflict();
      const vehicle={vehicle_id:row.vehicle?.vehicle_id || await b.allocateId(db,'v'),driver_id:row.driver_id,
        plate_number:b.v.text(i.plate_number,20),model:b.v.text(i.model,100),color:b.v.text(i.color,30),vehicle_type:'BIKE',is_active:true};
      return (await edit(row,{vehicle})).vehicle;
    },
    async SubmitDriver(i,call) {
      b.v.fields(i,[]); const row=await mine(call);
      if (row.approval_status === 'PENDING') return view(row);
      if (!['DRAFT','REJECTED'].includes(row.approval_status) || !row.licenseNumberEncrypted) b.conflict();
      const vehicle=row.vehicle || (row.registrationPlateNumber?{vehicle_id:await b.allocateId(db,'v'),
        driver_id:row.driver_id,plate_number:row.registrationPlateNumber,vehicle_type:'BIKE',model:'BIKE',color:'Khong ro',is_active:true}:undefined);
      if(!vehicle?.is_active)b.conflict();
      return view(await edit(row,{vehicle,approval_status:'PENDING',submitted_at:b.now()}));
    },
    async DecideDriverApproval(i,call) {
      b.v.fields(i,['driver_id','decision','reason'],['driver_id','decision']); const {claims}=await c.actor(call,['ADMIN']);
      if (!['APPROVED','REJECTED'].includes(i.decision)) b.v.invalid();
      const reason=i.reason === undefined ? undefined : b.v.text(i.reason,300);
      if (i.decision === 'REJECTED' && !reason) b.v.invalid();
      if (i.decision === 'APPROVED' && i.reason !== undefined) b.v.invalid();
      return c.tx(async session=>{
        const row=await drivers.findOne({driver_id:b.v.id(i.driver_id)},{session}); if (!row) b.missing();
        if (row.approval_status !== 'PENDING') b.conflict();
        const reviewed=b.now(); const saved=await drivers.findOneAndUpdate({_id:row._id,version:row.version,approval_status:'PENDING'},
          {$set:{approval_status:i.decision,reviewed_at:reviewed,reviewedBy:claims.sub,...(reason ? {rejection_reason:reason}:{} )},
            ...(!reason?{$unset:{rejection_reason:''}}:{}),$inc:{version:1}}, {session,returnDocument:'after'});
        if (!saved) b.conflict();
        await c.emit('driver.approval_changed',row.driver_id,{driverId:row.driver_id,recipientAccountId:row.accountId,
          approvalStatus:i.decision,reviewedAt:reviewed,...(reason?{rejectionReason:reason}:{})},session,saved.version);
        return view(saved);
      });
    },
    async SetAvailability(i,call) {
      b.v.fields(i,['is_online'],['is_online']); if (typeof i.is_online !== 'boolean') b.v.invalid();
      const row=await mine(call);
      if (i.is_online && (row.approval_status !== 'APPROVED' || !row.vehicle?.is_active || !row.location)) b.conflict();
      const saved=await edit(row,{is_online:i.is_online}); return {driver_id:saved.driver_id,is_online:saved.is_online};
    },
    async UpdateDriverLocation(i,call) {
      b.v.fields(i,['latitude','longitude','location_code']);
      const row=await mine(call),hasCode=Object.hasOwn(i,'location_code');
      if(hasCode&&(Object.hasOwn(i,'latitude')||Object.hasOwn(i,'longitude')))b.v.invalid();
      const location={...(hasCode?await readLocation(db,i.location_code):b.coords(i)),updated_at:b.now()};
      return (await edit(row,{location})).location;
    },
    async ListDrivers(i,call) {
      b.v.fields(i,['paging','approval_status'],['paging']); await c.actor(call,['ADMIN']);
      if (i.approval_status && !['DRAFT','PENDING','APPROVED','REJECTED'].includes(i.approval_status)) b.v.invalid();
      return b.page(drivers,i.approval_status?{approval_status:i.approval_status}:{},i.paging,view,{_id:-1});
    },
    async ListNearbyDrivers(i,call) {
      b.v.fields(i,['location','paging','location_code'],['paging']); const {claims}=await c.actor(call,['CUSTOMER','ADMIN']);
      if(Object.hasOwn(i,'location')===Object.hasOwn(i,'location_code'))b.v.invalid();
      const point=i.location_code!==undefined?await readLocation(db,i.location_code):b.coords(i.location);
      const {page,limit}=b.v.pagination(i.paging),items=await nearby(point,claims.role==='ADMIN');
      return {items:items.slice((page-1)*limit,page*limit),page,limit,total_items:items.length};
    },
    async FindCandidates(i) {
      b.v.fields(i,['pickup','limit'],['pickup','limit']); if (!Number.isInteger(i.limit)||i.limit<1||i.limit>5) b.v.invalid();
      return {items:(await nearby(b.coords(i.pickup))).slice(0,i.limit)};
    },
    async GetDriverByAccount(i,call) {
      b.v.fields(i,['account_id'],['account_id']); const {claims}=await c.actor(call,['DRIVER']);
      if (b.v.objectId(i.account_id)!==claims.sub) b.forbidden();
      const row=await drivers.findOne({accountId:claims.sub});
      if (!row) b.fail(b.grpc.status.UNAVAILABLE,'PROFILE_NOT_READY','Driver profile is not ready yet.');
      return {driver_id:row.driver_id,account_id:row.accountId};
    },
    async GetDispatchData(i) { b.v.fields(i,['driver_id'],['driver_id']); return dispatch(await get(i.driver_id)); },
    async ReserveDriver(i) {
      b.v.fields(i,['driver_id','booking_id','operation_id'],['driver_id','booking_id','operation_id']);
      b.v.id(i.booking_id); b.key(i.operation_id); const row=await get(i.driver_id);
      if (row.reservation?.operation_id === i.operation_id && row.reservation.booking_id === i.booking_id) return reservationView(row);
      if (!await eligible(row)) b.conflict();
      return reservationView(await edit(row,{reservation:{booking_id:i.booking_id,operation_id:i.operation_id,phase:'RESERVED'}}));
    },
    async ConfirmReservation(i) {
      b.v.fields(i,['driver_id','booking_id','operation_id','trip_id'],['driver_id','booking_id','operation_id','trip_id']);
      b.v.id(i.trip_id); const row=await get(i.driver_id);
      if (row.reservation?.operation_id!==i.operation_id || row.reservation.booking_id!==i.booking_id) b.conflict();
      if (row.active_trip_id && row.active_trip_id!==i.trip_id) b.conflict();
      return reservationView(await edit(row,{active_trip_id:i.trip_id,reservation:{...row.reservation,trip_id:i.trip_id,phase:'CONFIRMED'}}));
    },
    async ReleaseReservation(i) {
      b.v.fields(i,['driver_id','booking_id','operation_id','reason'],['driver_id','booking_id','operation_id','reason']);
      const row=await get(i.driver_id);
      if (row.active_trip_id) b.conflict();
      await drivers.updateOne({_id:row._id,'reservation.operation_id':i.operation_id,'reservation.booking_id':i.booking_id,active_trip_id:{$exists:false}},
        {$unset:{reservation:''},$inc:{version:1}}); return {};
    },
    async UpdateLocationFromTrip(i) {
      b.v.fields(i,['driver_id','trip_id','location','source_time'],['driver_id','trip_id','location','source_time']);
      b.v.id(i.driver_id); b.v.id(i.trip_id);
      const location={...b.coords(i.location),updated_at:i.source_time};
      if (!Number.isFinite(Date.parse(i.source_time))) b.v.invalid();
      const row=await drivers.findOneAndUpdate({driver_id:i.driver_id,active_trip_id:i.trip_id,
        $or:[{'location.updated_at':{$lte:i.source_time}},{location:{$exists:false}}]},{$set:{location},$inc:{version:1}},{returnDocument:'after'});
      if (!row) b.conflict(); return row.location;
    }
  };
  b.addHandlers(server,'driver',handlers);
  return {isReady:bus.isReady,close:bus.close};
}
module.exports={create};
