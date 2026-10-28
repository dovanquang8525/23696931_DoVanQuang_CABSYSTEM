'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {sign}=require('./mock-signature.cjs');
const base=(process.env.CAB_BASE_URL||'http://localhost:3000').replace(/\/$/,'');
const evidence=[];
async function request(method,url,body,token,headers={}){
  if(method==='POST'&&body===undefined)body={};
  const response=await fetch(base+url,{method,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),
    ...(token?{Authorization:'Bearer '+token}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
  const data=await response.json();return {status:response.status,data,headers:response.headers};
}
function expect(result,status,label){
  assert.equal(result.status,status,label+' HTTP status');evidence.push({case:label,status:'RUNTIME_VERIFIED',httpStatus:status,at:new Date().toISOString()});return result.data;
}
async function poll(work,accept,timeout=30000){
  const until=Date.now()+timeout;
  do{const result=await work();if(accept(result))return result;await new Promise(resolve=>setTimeout(resolve,400));}while(Date.now()<until);
  throw new Error('Runtime polling deadline exceeded');
}
async function login(phone){
  const person=require('./seed.cjs').people.find(p=>p.phone===phone);
  if(!person)throw new Error('Unknown developer fixture account');
  const password=person.role==='ADMIN'?(process.env.CAB_ADMIN_PASSWORD||process.env.SEED_PASSWORD):process.env.SEED_PASSWORD;
  const data=expect(await request('POST','/api/v1/auth/login',{email:person.email,password}),200,'login '+person.email);
  assert.equal(typeof data.accessToken,'string');return data.accessToken;
}
async function refresh(driver){
  expect(await request('PUT','/api/v1/drivers/me/location',{locationCode:'A'},driver),200,'refresh driver location from DB point A');
  expect(await request('PUT','/api/v1/drivers/me/availability',{isOnline:true},driver),200,'driver online');
}
async function ride(customer,driver){
  await poll(()=>request('GET','/api/v1/drivers/me',undefined,driver),r=>r.status===200&&!r.data.activeTripId);
  await refresh(driver);
  const key=crypto.randomUUID(),body={pickupCode:'A',destinationCode:'B'};
  const booking=expect(await request('POST','/api/v1/bookings',body,customer,{'Idempotency-Key':key}),201,'create booking');
  assert.equal(booking.vehicleType,'BIKE');assert.equal(booking.status,'SEARCHING');assert.ok(!booking.tripId);
  const invitations=await poll(()=>request('GET','/api/v1/drivers/me/invitations?status=PENDING',undefined,driver),
    r=>r.status===200&&r.data.items.some(i=>i.bookingId===booking.bookingId));
  const invitation=invitations.data.items.find(i=>i.bookingId===booking.bookingId);
  const accepted=expect(await request('POST','/api/v1/invitations/'+invitation.invitationId+'/response',{decision:'ACCEPT'},driver),200,'accept invitation');
  assert.equal(accepted.booking.status,'ASSIGNED');assert.ok(accepted.tripId);
  return {booking,invitation,tripId:accepted.tripId,key,body};
}
async function complete(tripId,driver){
  expect(await request('POST','/api/v1/trips/'+tripId+'/arrival',undefined,driver),200,'arrive');
  expect(await request('POST','/api/v1/trips/'+tripId+'/start',undefined,driver),200,'start');
  expect(await request('PUT','/api/v1/trips/'+tripId+'/location',{locationCode:'B'},driver),200,'trip location from DB point B');
  const trip=expect(await request('POST','/api/v1/trips/'+tripId+'/completion',undefined,driver),200,'complete');
  assert.equal(trip.status,'COMPLETED');assert.equal(trip.fareAmount,1000*Math.ceil((10000+5000*trip.distanceKm)/1000));return trip;
}
async function callback(payment,result,extra={},signatureOverride){
  const timestamp=extra.timestamp ?? Math.floor(Date.now()/1000);
  const body={eventId:crypto.randomUUID(),paymentId:payment.paymentId,referenceCode:payment.referenceCode,
    amount:payment.amount,currency:'VND',result,timestamp,...extra};
  const raw=JSON.stringify(body),signature=signatureOverride||sign(Buffer.from(raw),timestamp,process.env.MOCK_CALLBACK_SECRET);
  const headers={'Content-Type':'application/json','X-Mock-Timestamp':String(timestamp),'X-Mock-Signature':signature};
  async function send(){const r=await fetch(base+'/api/v1/payments/mock/callback',{method:'POST',headers,body:raw,signal:AbortSignal.timeout(10000)});return {status:r.status,data:await r.json()};}
  return {response:await send(),send,body};
}
function record(name,error){
  const root=path.join(__dirname,'../.local/evidence');fs.mkdirSync(root,{recursive:true});
  const file=path.join(root,name+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json');
  fs.writeFileSync(file,JSON.stringify({suite:name,status:error?'FAILED':'RUNTIME_VERIFIED',completedAt:new Date().toISOString(),
    cases:evidence,...(error?{error:String(error.message).split('\n')[0]}:{})},null,2),{flag:'wx'});
  console.log('Evidence: '+path.relative(path.join(__dirname,'..'),file));
}
module.exports={request,expect,poll,login,refresh,ride,complete,callback,record,evidence};
