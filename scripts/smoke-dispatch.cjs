'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const h=require('./runtime-http.cjs');
const body={pickup:{latitude:10.8,longitude:106.7},destination:{latitude:10.81,longitude:106.71}};
async function invite(token,bid){
  const r=await h.poll(()=>h.request('GET','/api/v1/drivers/me/invitations?status=PENDING',undefined,token),
    r=>r.status===200&&r.data.items.some(i=>i.bid===bid));
  return r.data.items.find(i=>i.bid===bid);
}
async function main(){
  const customer=await h.login('0909000001'),first=await h.login('0909000011'),second=await h.login('0909000012');
  async function refresh(){
    await h.refresh(first);
    h.expect(await h.request('PUT','/api/v1/drivers/me/location',{latitude:10.8005,longitude:106.7},second),200,'second Driver position');
    h.expect(await h.request('PUT','/api/v1/drivers/me/availability',{isOnline:true},second),200,'second Driver online');
  }
  async function create(){return h.expect(await h.request('POST','/api/v1/bookings',body,customer,{'Idempotency-Key':crypto.randomUUID()}),201,'dispatch Booking');}
  async function cancel(id){h.expect(await h.request('POST','/api/v1/bookings/'+id+'/cancellation',{reason:'Fixture complete',confirmed:true},customer),200,'cleanup assigned fixture');}
  async function released(token){await h.poll(()=>h.request('GET','/api/v1/drivers/me',undefined,token),r=>r.status===200&&!r.data.tid);}
  await refresh();
  const rejected=await create(),offer=await invite(first,rejected.bid);
  h.expect(await h.request('POST','/api/v1/invitations/'+offer.iid+'/response',{decision:'REJECT'},first),200,'reject first invitation');
  const next=await invite(second,rejected.bid);
  h.expect(await h.request('POST','/api/v1/invitations/'+next.iid+'/response',{decision:'ACCEPT'},second),200,'next candidate accepts');
  await cancel(rejected.bid);await released(second);
  await refresh();
  const timed=await create(),expired=await invite(first,timed.bid);
  const replacement=await inviteWithLongDeadline(second,timed.bid);
  h.expect(await h.request('POST','/api/v1/invitations/'+expired.iid+'/response',{decision:'ACCEPT'},first),409,'expired offer rejected');
  h.expect(await h.request('POST','/api/v1/invitations/'+replacement.iid+'/response',{decision:'ACCEPT'},second),200,'timeout advances candidate');
  await cancel(timed.bid);await released(second);
  await refresh();
  const a=await create(),z=await create(),ai=await invite(first,a.bid),zi=await invite(first,z.bid);
  const results=await Promise.all([h.request('POST','/api/v1/invitations/'+ai.iid+'/response',{decision:'ACCEPT'},first),
    h.request('POST','/api/v1/invitations/'+zi.iid+'/response',{decision:'ACCEPT'},first)]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  const lost=results[0].status===409?a:z,winner=results[0].status===200?a:z;
  const fallback=await invite(second,lost.bid);
  const assigned=h.expect(await h.request('POST','/api/v1/invitations/'+fallback.iid+'/response',{decision:'ACCEPT'},second),200,'concurrent loser recovers with next Driver');
  const original=h.expect(await h.request('GET','/api/v1/bookings/'+winner.bid,undefined,customer),200,'concurrent winner');
  assert.notEqual(original.trip.did,assigned.invitation.did);assert.notEqual(original.trip.tid,assigned.tid);
  await cancel(winner.bid);await cancel(lost.bid);await released(first);await released(second);
  h.expect(await h.request('PUT','/api/v1/drivers/me/availability',{isOnline:false},second),200,'restore second Driver offline');
}
async function inviteWithLongDeadline(token,id){
  const r=await h.poll(()=>h.request('GET','/api/v1/drivers/me/invitations?status=PENDING',undefined,token),
    r=>r.status===200&&r.data.items.some(i=>i.bid===id),45000);return r.data.items.find(i=>i.bid===id);
}
void main().then(()=>h.record('dispatch')).catch(error=>{h.record('dispatch',error);console.error('Dispatch check failed: '+String(error.message).split('\n')[0]);process.exitCode=1;});
