'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {sign}=require('./mock-signature.cjs');
const {required}=require('./runtime-config.cjs');
async function main(){
  const args=process.argv.slice(2);let packet;
  if(args[0]==='--replay')packet=JSON.parse(fs.readFileSync(path.resolve(args[1]),'utf8'));
  else{
    const [paymentId,referenceCode,amount,result]=args;
    if(!/^[0-9a-f]{24}$/.test(paymentId||'')||!referenceCode||!Number.isSafeInteger(Number(amount))||Number(amount)<0||!['COMPLETED','FAILED'].includes(result))
      throw new Error('Usage: mock-payment.cjs paymentId referenceCode amount COMPLETED|FAILED, or --replay local-packet.json');
    const timestamp=Math.floor(Date.now()/1000),raw=JSON.stringify({eventId:crypto.randomUUID(),paymentId,referenceCode,amount:Number(amount),currency:'VND',result,timestamp});
    packet={raw,timestamp,signature:sign(Buffer.from(raw),timestamp,required('MOCK_CALLBACK_SECRET'))};
    const folder=path.join(__dirname,'../.local/callbacks');fs.mkdirSync(folder,{recursive:true});
    const target=path.join(folder,paymentId+'-'+Date.now()+'.json');fs.writeFileSync(target,JSON.stringify(packet,null,2),{flag:'wx',mode:0o600});
    console.log('Replay packet: '+path.relative(path.join(__dirname,'..'),target));
  }
  const base=process.env.CAB_BASE_URL||'http://localhost:3000';
  const response=await fetch(base+'/api/v1/payments/mock/callback',{method:'POST',headers:{'Content-Type':'application/json',
    'X-Mock-Signature':packet.signature,'X-Mock-Timestamp':String(packet.timestamp)},body:packet.raw,signal:AbortSignal.timeout(10000)});
  console.log('HTTP '+response.status+' '+JSON.stringify(await response.json()));if(!response.ok)process.exitCode=1;
}
void main().catch(error=>{console.error(String(error.message).split('\n')[0]);process.exitCode=1;});
