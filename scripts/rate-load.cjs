'use strict';
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const h=require('./runtime-http.cjs');
async function main(){
  const count=Number(process.env.CAB_LOAD_REQUESTS||1200);
  if(!Number.isInteger(count)||count<1000||count>10000)throw new Error('CAB_LOAD_REQUESTS must be 1000..10000');
  const token=await h.login('0909000001'),key=crypto.randomUUID(),statuses={},ids=new Set();let retryAfterPresent=true;
  const started=performance.now();
  const results=await Promise.allSettled(Array.from({length:count},()=>h.request('POST','/api/v1/bookings',
    {pickup:{latitude:0,longitude:0},destination:{latitude:0.01,longitude:0.01}},token,{'Idempotency-Key':key})));
  const seconds=(performance.now()-started)/1000;
  for(const result of results){
    if(result.status==='rejected'){statuses.NETWORK_ERROR=(statuses.NETWORK_ERROR||0)+1;continue;}
    const r=result.value;statuses[r.status]=(statuses[r.status]||0)+1;
    if(r.status===429)retryAfterPresent&&=Number(r.headers.get('retry-after'))>=1;
    if(r.status===200||r.status===201)ids.add(r.data.bookingId);
  }
  const health=await h.request('GET','/health');
  const report={at:new Date().toISOString(),sent:count,durationSeconds:seconds,
    completedRequestsPerSecond:count/seconds,over1000CompletedPerSecond:count/seconds>1000,statuses,
    uniqueBookingIds:ids.size,retryAfterPresent,gatewayHealthy:health.status===200};
  const folder=path.join(__dirname,'../.local/evidence');fs.mkdirSync(folder,{recursive:true});
  fs.writeFileSync(path.join(folder,'rate-load-'+Date.now()+'.json'),JSON.stringify(report,null,2),{flag:'wx'});
  console.log(JSON.stringify(report,null,2));
  assert.ok(statuses[429]>0,'expected rate limiting');assert.ok(retryAfterPresent);assert.ok(ids.size<=1);
  assert.equal(health.status,200);assert.ok(Object.keys(statuses).every(s=>['200','201','429'].includes(s)),'unexpected errors under load');
  if(!report.over1000CompletedPerSecond)console.log('Rate limiting checked; the PDF throughput target is NOT VERIFIED by this run.');
}
void main().catch(error=>{console.error('Load check failed: '+String(error.message).split('\n')[0]);process.exitCode=1;});
