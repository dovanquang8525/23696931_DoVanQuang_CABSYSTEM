'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const h=require('./runtime-http.cjs');
const target=path.join(__dirname,'../.local/recovery-state.json');
async function main(){
  const phase=process.argv[2];
  if(phase==='prepare'){
    await h.poll(()=>h.request('GET','/ready'),r=>r.status===200);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    const phone='0'+crypto.randomInt(100000000,1000000000);
    fs.writeFileSync(target,JSON.stringify({phone,email:phone+'@example.test',
      password:'Demo-'+crypto.randomBytes(12).toString('hex')}),{flag:'wx',mode:0o600});
    console.log('Recovery state prepared locally.');return;
  }
  const state=JSON.parse(fs.readFileSync(target,'utf8'));
  if(phase==='during'){
    await h.poll(()=>h.request('GET','/ready'),r=>r.status===503);
    const account=h.expect(await h.request('POST','/api/v1/auth/register',{phone:state.phone,email:state.email,password:state.password}),201,'register during broker outage');
    state.aid=account.aid;
    const auth=h.expect(await h.request('POST','/api/v1/auth/login',{email:state.email,password:state.password}),200,'login during broker outage');
    h.expect(await h.request('GET','/api/v1/customers/me',undefined,auth.accessToken),503,'profile awaits event');
    fs.writeFileSync(target,JSON.stringify(state),{mode:0o600});h.record('rabbit-outage');return;
  }
  if(phase!=='after')throw new Error('Choose prepare, during or after');
  await h.poll(()=>h.request('GET','/ready'),r=>r.status===200,60000);
  const auth=h.expect(await h.request('POST','/api/v1/auth/login',{email:state.email,password:state.password}),200,'login after recovery');
  const profile=await h.poll(()=>h.request('GET','/api/v1/customers/me',undefined,auth.accessToken),r=>r.status===200);
  assert.equal(profile.data.aid,state.aid);
  const repeated=h.expect(await h.request('GET','/api/v1/customers/me',undefined,auth.accessToken),200,'stable recovered profile');
  assert.equal(repeated.cid,profile.data.cid);h.record('rabbit-recovery');
}
void main().catch(error=>{console.error('Recovery check failed: '+String(error.message).split('\n')[0]);process.exitCode=1;});
