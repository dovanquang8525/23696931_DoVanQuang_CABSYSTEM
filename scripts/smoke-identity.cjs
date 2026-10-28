'use strict';
// HTTP smoke through Gateway only. Does not establish DB encryption or full grading PASS.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:' + (process.env.GATEWAY_PORT || '3000');
const record = {runId:crypto.randomUUID(),startedAt:new Date().toISOString(),
  baseUrl,scope:'Auth/Customer HTTP smoke; not full acceptance',checks:[],fixtures:{}};
const phone = () => '0' + crypto.randomInt(100000000,1000000000).toString();
const password = crypto.randomBytes(18).toString('hex');
async function request(name,method,route,expected,{body,token,check}={}) {
  const started = Date.now();
  const response = await fetch(baseUrl + '/api/v1' + route, {method,
    headers:{...(body ? {'Content-Type':'application/json'} : {}),...(token ? {Authorization:'Bearer '+token} : {})},
    ...(body ? {body:JSON.stringify(body)} : {}),signal:AbortSignal.timeout(8000)});
  const result = await response.json();
  const entry={name,method,route,expected,actual:response.status,requestId:response.headers.get('x-request-id'),
    elapsedMs:Date.now()-started,status:response.status===expected?'PASS':'FAIL'};
  record.checks.push(entry);
  console.log(entry.status+' '+name+' HTTP '+response.status);
  assert.equal(response.status,expected,name+(result.code ? ' ('+result.code+')' : ''));
  if (check) {
    try { check(result,response); } catch(error) { entry.status='FAIL'; throw error; }
  }
  return result;
}
async function run() {
  const aPhone=phone(), bPhone=phone();
  const aEmail=aPhone+'@example.test',bEmail=bPhone+'@example.test';
  const a=await request('register Customer','POST','/auth/register',201,{body:{
    phone:aPhone,password,email:aEmail},check:r=>{assert.deepEqual(Object.keys(r).sort(),['aid','cid','role']);assert.match(r.cid,/^c[0-9]+$/);}});
  record.fixtures.aid=a.aid;
  await request('duplicate phone rejected','POST','/auth/register',409,{body:{
    phone:aPhone,password,email:aEmail}});
  await request('public ADMIN rejected','POST','/auth/register',400,{body:{
    phone:phone(),password,email:'admin-attempt@example.test',cid:'cadmin',role:'ADMIN'}});
  const session=await request('login Customer','POST','/auth/login',200,{body:{email:aEmail,password}});
  const token=session.accessToken;
  assert.ok(token);
  assert.deepEqual(Object.keys(session).sort(),['accessToken','account']);
  assert.deepEqual(Object.keys(session.account).sort(),['aid','cid','role']);
  assert.equal(session.account.aid,a.aid);
  await request('wrong password rejected','POST','/auth/login',401,{body:{email:aEmail,password:password+'wrong'}});
  await request('identity verified','GET','/auth/me',200,{token,check:r=>{
    assert.equal(r.aid,a.aid); assert.equal(r.role,'CUSTOMER'); assert.equal(r.status,'ACTIVE');
    assert.equal(Object.hasOwn(r,'passwordHash'),false);
  }});
  const deadline=Date.now()+5000;
  let profile;
  while (!profile) {
    const response=await fetch(baseUrl+'/api/v1/customers/me',{headers:{Authorization:'Bearer '+token},
      signal:AbortSignal.timeout(6000)});
    const result=await response.json();
    if (response.status===200) {
      assert.equal(result.aid,a.aid); profile=result;
      record.checks.push({name:'Customer profile event synchronization',expected:200,actual:200,status:'PASS'});
    } else {
      assert.equal(response.status,503); assert.equal(result.code,'PROFILE_NOT_READY');
      assert.ok(Date.now()<deadline,'Customer profile did not synchronize within 5 seconds');
      await new Promise(resolve=>setTimeout(resolve,250));
    }
  }
  record.fixtures.cid=profile.cid;
  await request('get own Customer by ID','GET','/customers/'+profile.cid,200,{token});
  await request('update Customer','PATCH','/customers/me',200,{token,body:{name:'  Updated Customer  ',
    email:'smoke@example.test'},check:r=>assert.equal(r.name,'Updated Customer')});
  await request('protected fields rejected','PATCH','/customers/me',400,{token,body:{role:'ADMIN'}});
  await request('XSS input rejected','PATCH','/customers/me',400,{token,body:{name:'<script>alert(1)</script>'}});
  await request('NoSQL object rejected','POST','/auth/login',400,{body:{email:{$ne:null},password}});
  await request('SQL string rejected','POST','/auth/login',400,{body:{email:"' OR 1=1 --",password}});
  const parts=token.split('.');
  parts[2]=(parts[2][0]==='A'?'B':'A')+parts[2].slice(1);
  await request('JWT tampering rejected','GET','/auth/me',401,{token:parts.join('.')});
  await request('missing JWT rejected','GET','/customers/me',401);
  await request('Customer cannot list all profiles','GET','/admin/customers',403,{token});
  await request('register second Customer','POST','/auth/register',201,{body:{
    phone:bPhone,password,email:bEmail}});
  const other=await request('login second Customer','POST','/auth/login',200,{body:{email:bEmail,password}});
  await request('cross Customer ownership rejected','GET','/customers/'+profile.cid,403,{token:other.accessToken});
  const driverPhone=phone();
  const driverInput={phone:driverPhone,password,email:driverPhone+'@example.test',plateNumber:'DEMO-'+driverPhone};
  const otp=await request('first Driver registration requests OTP','POST','/auth/register',202,{body:driverInput});
  assert.equal(otp.status,'OTP_REQUIRED');
  assert.equal(Object.hasOwn(otp,'accessToken'),false);
  assert.equal(Object.hasOwn(otp,'aid'),false);
  assert.match(otp.mockCode,/^[0-9]{6}$/,'OTP_MOCK_MODE=true is required for this local smoke');
  await request('OTP cooldown enforced','POST','/auth/otp-challenges',429,{body:{
    phone:driverPhone},check:(_,r)=>assert.ok(Number(r.headers.get('retry-after'))>=1)});
  const wrong=(Number(otp.mockCode)+1)%1000000;
  await request('wrong OTP rejected','POST','/auth/otp-challenges/'+otp.oid+'/verify',400,{body:{
    phone:driverPhone,code:String(wrong).padStart(6,'0')}});
  await request('correct OTP verified','POST','/auth/otp-challenges/'+otp.oid+'/verify',200,{body:{
    phone:driverPhone,code:otp.mockCode}});
  const driver=await request('Driver account consumes registration OTP','POST','/auth/register',201,{body:{...driverInput,code:otp.mockCode}});
  record.fixtures.driverAccountId=driver.aid;
  assert.equal(Object.hasOwn(driver,'profileStatus'),false);
  await request('consumed OTP cannot be verified again','POST','/auth/otp-challenges/'+otp.oid+'/verify',400,{body:{
    phone:driverPhone,code:otp.mockCode}});
  record.result='PASS';
  console.log('Identity HTTP smoke passed. Driver profile/onboarding and DB/recovery tests remain pending.');
}
run().catch(error=>{
  record.result='FAIL';
  // Do not print response bodies, request payloads, credentials or tokens.
  record.failure=error instanceof assert.AssertionError?'Assertion failed; inspect the named check above.':
    'HTTP or dependency failure; inspect Gateway/service logs locally.';
  console.error(record.failure);
  process.exitCode=1;
}).finally(()=>{
  record.finishedAt=new Date().toISOString();
  const directory=path.resolve(__dirname,'../.local');
  fs.mkdirSync(directory,{recursive:true});
  const target=path.join(directory,'identity-run.'+record.runId+'.json');
  fs.writeFileSync(target,JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log('Sanitized evidence: .local/'+path.basename(target));
});
