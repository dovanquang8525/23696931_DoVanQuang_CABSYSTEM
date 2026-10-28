'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const b=require('./business.cjs');
const routes=require('../gateway/identity-routes.cjs');
const encryption=require('./driver-crypto.cjs');
const {sign,verify}=require('./mock-signature.cjs');
test('Haversine, boundary coordinates and fare retain unrounded distance',()=>{
  assert.equal(b.distance({latitude:0,longitude:0},{latitude:0,longitude:0}),0);
  assert.ok(Math.abs(b.distance({latitude:0,longitude:0},{latitude:0,longitude:1})-111.1949)<0.001);
  assert.throws(()=>b.coords({latitude:91,longitude:0}),b.DomainError);
  assert.throws(()=>b.coords({latitude:0,longitude:0,driverId:'injected'}),b.DomainError);
  const pricing={base_fare:10000,rate_per_km:5000,rounding_unit:1000};
  assert.equal(b.fare(2,pricing),20000);assert.equal(b.fare(2.01,pricing),21000);
  assert.equal(b.fare(2,undefined),undefined);assert.equal(b.fare(NaN,pricing),undefined);
});
test('license encryption is randomized, reversible and authenticated',()=>{
  const previous=process.env.DRIVER_DATA_KEY_BASE64;
  process.env.DRIVER_DATA_KEY_BASE64=Buffer.alloc(32,23).toString('base64');
  try{
    const a=encryption.encrypt('DEMO-LICENSE-01'),z=encryption.encrypt('DEMO-LICENSE-01');
    assert.notDeepEqual(a,z);assert.equal(encryption.decrypt(a),'DEMO-LICENSE-01');
    assert.ok(!JSON.stringify(a).includes('DEMO-LICENSE-01'));
    assert.throws(()=>encryption.decrypt({...a,tag:Buffer.alloc(16).toString('base64')}));
  }finally{if(previous===undefined)delete process.env.DRIVER_DATA_KEY_BASE64;else process.env.DRIVER_DATA_KEY_BASE64=previous;}
});
test('mock HMAC signs original UTF-8 bytes including whitespace',()=>{
  const raw=Buffer.from('{"name":"Tiếng Việt", "amount":20000}'),secret='unit-secret',timestamp=100;
  const signature=sign(raw,timestamp,secret);
  assert.equal(verify(raw,timestamp,signature,secret),true);
  assert.equal(verify(Buffer.from(JSON.stringify(JSON.parse(raw))),timestamp,signature,secret),false);
  assert.equal(verify(raw,timestamp+1,signature,secret),false);
  assert.equal(verify(raw,timestamp,signature+'0',secret),false);
});
test('47 routes compile; static nearby path wins over driver ID and health has root paths',()=>{
  assert.equal(routes.routes.length,47);
  assert.equal(routes.match('GET','/api/v1/drivers/nearby').operation,'listNearbyDrivers');
  assert.equal(routes.match('GET','/health').operation,'gatewayHealth');
  assert.equal(routes.match('POST','/api/v1/bookings').service,'booking');
  assert.equal(routes.match('POST','/api/v1/booking'),undefined);
});
test('REST mapping nests paging/location, keeps idempotency out of body, and forwards raw callback',()=>{
  const url=new URL('http://local/api/v1/drivers/nearby?latitude=-10.8&longitude=106.7');
  const route=routes.match('GET',url.pathname),query=routes.validate(route,url,undefined);
  assert.deepEqual(routes.input(route,undefined,query,{}),{location:{latitude:-10.8,longitude:106.7},paging:{page:1,limit:10}});
  const create=routes.match('POST','/api/v1/bookings'),body={pickup:{latitude:0,longitude:0},destination:{latitude:1,longitude:1}};
  assert.throws(()=>routes.validate(create,new URL('http://local/api/v1/bookings'),body,{}),b.DomainError);
  assert.throws(()=>routes.validate(create,new URL('http://local/api/v1/bookings'),{...body,vehicleType:'BIKE'},{'idempotency-key':'a'}),b.DomainError);
  const callback=routes.match('POST','/api/v1/payments/mock/callback'),raw=Buffer.from('{ "a": 1 }');
  assert.equal(routes.input(callback,{}, {},{'x-mock-signature':'signature','x-mock-timestamp':'1'},raw).raw_body,raw);
});
test('REST response mapper distinguishes null fare, absent resources, availability and empty arrays',()=>{
  const result=routes.output({booking:{booking_id:'id'},trip_availability:'TRIP_UNAVAILABLE',payment_availability:'PAYMENT_UNAVAILABLE',eta:{status:'UNAVAILABLE'}});
  assert.equal(result.tripAvailability,'UNAVAILABLE');assert.ok(!('trip' in result));assert.ok(!('paymentSummary' in result));
  assert.deepEqual(routes.output({trip_id:'id',currency:'VND',has_completed:false,latest_status:'NOT_STARTED'}),
    {tripId:'id',currency:'VND',hasCompleted:false,latestStatus:'NOT_STARTED',attempts:[],fareAmount:null});
  assert.deepEqual(routes.output({page:1,limit:10,total_items:0}),{page:1,limit:10,totalItems:0,items:[]});
  assert.deepEqual(routes.output({full_name:'Driver',did:'d01'}),{name:'Driver',did:'d01'});
  const route=routes.match('PATCH','/api/v1/drivers/me');
  assert.deepEqual(routes.input(route,{name:'Driver'},{},{}),{full_name:'Driver'});
});
test('protobuf wire preserves explicit false/zero and Gateway restores missing repeated fields',()=>{
  const method=b.definition('payment').PaymentService.service.GetPaymentSummary;
  const raw=method.responseSerialize({trip_id:'000000000000000000000001',currency:'VND',has_completed:false,latest_status:'NOT_STARTED',attempts:[]});
  const result=routes.output(method.responseDeserialize(raw));
  assert.equal(result.hasCompleted,false);assert.equal(result.fareAmount,null);assert.deepEqual(result.attempts,[]);
  const route=routes.match('GET','/api/v1/trips/000000000000000000000001/payment-summary');
  assert.equal(route.responses.get(200)(result),true);
  const page=b.definition('customer').CustomerService.service.ListCustomers;
  const output=routes.output(page.responseDeserialize(page.responseSerialize({page:1,limit:10,total_items:0,items:[]})));
  assert.equal(output.totalItems,0);assert.deepEqual(output.items,[]);
});
test('OpenAPI exclusive bounds retain strict and inclusive boundaries without mutating the source',()=>{
  const Ajv=require('ajv'),ajv=new Ajv();
  const source={type:'object',properties:{distanceKm:{type:'number',minimum:0,exclusiveMinimum:true}},required:['distanceKm']};
  const original=JSON.stringify(source),validate=ajv.compile(routes.normalizeSchema(source));
  assert.equal(validate({distanceKm:0}),false);
  assert.equal(validate({distanceKm:-0.001}),false);
  assert.equal(validate({distanceKm:0.001}),true);
  assert.equal(JSON.stringify(source),original);
  const exclusiveMax=ajv.compile(routes.normalizeSchema({type:'number',maximum:1,exclusiveMaximum:true}));
  assert.equal(exclusiveMax(1),false);assert.equal(exclusiveMax(0.999),true);
  const inclusive=ajv.compile(routes.normalizeSchema({type:'number',minimum:0,exclusiveMinimum:false,maximum:1,exclusiveMaximum:false}));
  assert.equal(inclusive(0),true);assert.equal(inclusive(1),true);
  const numeric=ajv.compile(routes.normalizeSchema({type:'number',exclusiveMinimum:0}));
  assert.equal(numeric(0),false);assert.equal(numeric(0.001),true);
});
test('identity v2 wire keeps profile codes/email and REST uses name with server ObjectIds',()=>{
  const id='000000000000000000000001',time='2026-10-27T00:00:00.000Z';
  const auth=b.definition('auth').AuthService.service;
  const input={email:'cus01@gmail.com',phone:'0909212109',password:'quang123'};
  const decoded=auth.Register.requestDeserialize(auth.Register.requestSerialize(input));
  assert.equal(decoded.cid,undefined);assert.equal(decoded.email,input.email);assert.equal(decoded.role,undefined);
  const stage={...input,plate_number:'59A12345',code:'123456'};
  const pending=auth.Register.requestDeserialize(auth.Register.requestSerialize(stage));
  assert.equal(pending.plate_number,'59A12345');assert.equal(pending.code,'123456');
  const login=auth.Login.requestDeserialize(auth.Login.requestSerialize({email:input.email,password:input.password}));
  assert.equal(login.email,input.email);assert.equal(login.phone,undefined);
  const customer=b.definition('customer').CustomerService.service.GetMyCustomer;
  const c=routes.output(customer.responseDeserialize(customer.responseSerialize({customer_id:id,account_id:id,cid:'c01',
    full_name:'c01',email:input.email,created_at:time,updated_at:time})));
  assert.equal(c.customerId,id);assert.equal(c.cid,'c01');assert.equal(c.name,'c01');assert.equal(c.fullName,undefined);
  assert.equal(routes.match('GET','/api/v1/customers/me').responses.get(200)(c),true);
  const driver=b.definition('driver').DriverService.service.GetMyDriver;
  const d=routes.output(driver.responseDeserialize(driver.responseSerialize({driver_id:id,account_id:id,did:'d01',
    full_name:'d01',email:'dri01@gmail.com',approval_status:'DRAFT',is_online:false})));
  assert.equal(d.driverId,id);assert.equal(d.did,'d01');assert.equal(d.name,'d01');assert.equal(d.isOnline,false);
  assert.equal(routes.match('GET','/api/v1/drivers/me').responses.get(200)(d),true);
});
test('manual location-code requests preserve codes, reject mixed coordinates and allow OTP-required response',()=>{
  const booking=routes.match('POST','/api/v1/bookings'),url=new URL('http://local/api/v1/bookings'),headers={'idempotency-key':'b01'};
  assert.doesNotThrow(()=>routes.validate(booking,url,{pickupCode:'A',destinationCode:'B'},headers));
  assert.throws(()=>routes.validate(booking,url,{pickupCode:'A',destinationCode:'B',pickup:{latitude:0,longitude:0}},headers),b.DomainError);
  assert.deepEqual(routes.input(booking,{pickupCode:'A',destinationCode:'B'},{},headers),{pickup_code:'A',destination_code:'B',idempotency_key:'b01'});
  const nearby=routes.match('GET','/api/v1/drivers/nearby'),query=routes.validate(nearby,new URL('http://local/api/v1/drivers/nearby?locationCode=A&page=1&limit=2'));
  assert.deepEqual(routes.input(nearby,undefined,query,{}),{location_code:'A',paging:{page:1,limit:2}});
  const reg=routes.match('POST','/api/v1/auth/register');
  assert.equal(reg.responses.get(202)({status:'OTP_REQUIRED',otpId:'000000000000000000000001',expiresAt:'2026-10-27T00:00:00Z',mockCode:'123456'}),true);
});
test('generated profile codes skip existing accounts and keep counters scoped to each role/transaction',async()=>{
  const {allocateProfileCode}=require('./profile-codes.cjs'),session={id:'unit-session'},values=new Map();
  const db={collection(name){return name==='profile_code_counters'?{async findOneAndUpdate(query,update,options){
    assert.equal(options.session,session);const n=(values.get(query._id)||0)+1;values.set(query._id,n);return {value:n};
  }}:{async findOne(query,options){assert.equal(options.session,session);return query.cid==='c01'?{_id:'existing'}:null;}};}};
  assert.deepEqual(await allocateProfileCode(db,'CUSTOMER',session),{field:'cid',code:'c02'});
  assert.deepEqual(await allocateProfileCode(db,'DRIVER',session),{field:'did',code:'d01'});
  await assert.rejects(()=>allocateProfileCode(db,'ADMIN',session));
});
test('location fixtures do not overwrite edited DB points and return only coordinates',async()=>{
  const {provisionLocations,readLocation}=require('./demo-locations.cjs'),rows=new Map([['A',{latitude:1,longitude:2,label:'edited'}]]);
  const db={collection(){return {async updateOne(q,u){if(!rows.has(q._id))rows.set(q._id,u.$setOnInsert);},async findOne(q){return rows.get(q._id)||null;}};}};
  await provisionLocations(db,'booking_service');
  assert.deepEqual(await readLocation(db,'A'),{latitude:1,longitude:2});
  assert.deepEqual(await readLocation(db,'B'),{latitude:10.81,longitude:106.71});
  await assert.rejects(()=>readLocation(db,'UNKNOWN'),e=>e.status===b.grpc.status.INVALID_ARGUMENT);
});
