'use strict';
// Prepare one isolated state at a time; assigned/inprogress keep the seed Driver busy.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const h=require('./runtime-http.cjs');
async function main(){
  const mode=process.argv[2];
  if(!['assigned','inprogress','completed','failed','callback-negative'].includes(mode))throw new Error('Choose assigned, inprogress, completed, failed or callback-negative');
  const customer=await h.login('0909000001'),driver=await h.login('0909000011');
  const run=await h.ride(customer,driver),vars={booking_id:run.booking.bookingId,trip_id:run.tripId};
  if(mode==='inprogress'){
    h.expect(await h.request('POST','/api/v1/trips/'+run.tripId+'/arrival',{},driver),200,'fixture arrival');
    h.expect(await h.request('POST','/api/v1/trips/'+run.tripId+'/start',{},driver),200,'fixture start');
    vars.known_inprogress_trip_id=run.tripId;
  }else if(mode!=='assigned'){
    await h.complete(run.tripId,driver);vars.known_completed_unpaid_trip_id=run.tripId;
    if(mode==='failed'||mode==='callback-negative'){
      const payment=h.expect(await h.request('POST','/api/v1/trips/'+run.tripId+'/payments',{},customer,{'Idempotency-Key':crypto.randomUUID()}),201,'fixture payment');
      Object.assign(vars,{payment_id:payment.paymentId,payment_reference:payment.referenceCode,payment_amount:String(payment.amount)});
      if(mode==='failed'){h.expect((await h.callback(payment,'FAILED')).response,200,'fixture FAILED');vars.failed_payment_id=payment.paymentId;}
      else vars.callback_payment_id=payment.paymentId;
    }
  }else vars.known_assigned_trip_id=run.tripId;
  const folder=path.join(__dirname,'../.local/fixtures');fs.mkdirSync(folder,{recursive:true});
  const file=path.join(folder,mode+'-'+Date.now()+'.json');fs.writeFileSync(file,JSON.stringify(vars,null,2),{flag:'wx'});
  console.log('Fixture IDs: '+path.relative(path.join(__dirname,'..'),file));
  if(mode==='assigned'||mode==='inprogress')console.log('This fixture keeps Driver 1 busy. Finish/cancel it before preparing another ride.');
}
void main().catch(error=>{console.error('Fixture preparation failed: '+String(error.message).split('\n')[0]);process.exitCode=1;});
