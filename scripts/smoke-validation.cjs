'use strict';
// Local demo regression. Creates new test accounts; never changes existing credentials.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const h=require('./runtime-http.cjs');
const cases=[];
async function check(name,method,url,body,expected,token,verify){
  const result=await h.request(method,url,body,token);
  const row={name,expected,actual:result.status,status:'FAIL'};cases.push(row);
  assert.equal(result.status,expected,name);
  if(verify)verify(result.data);
  row.status='PASS';return result.data;
}
const unique=()=>crypto.randomUUID().replaceAll('-','');
const input=()=>({email:'validation.'+unique()+'@example.test',password:'123',phone:'p-'+unique()});
async function main(){
  await h.poll(()=>h.request('GET','/ready'),r=>r.status===200,60000);
  const primary={email:'quang123@gmail.com',password:'123',phone:'0123'};
  const registration=await h.request('POST','/api/v1/auth/register',primary);
  assert.ok([201,409].includes(registration.status),'Primary registration must succeed or preserve a duplicate');
  cases.push({name:'1 CUSTOMER exact demo registration',actual:registration.status,
    status:registration.status===201?'PASS':'EXISTING',note:registration.status===409?'Existing email/phone preserved; login is checked next.':undefined});
  const session=await check('2 CUSTOMER demo login','POST','/api/v1/auth/login',
    {email:primary.email,password:primary.password},200,undefined,data=>assert.ok(data.accessToken));
  const token=session.accessToken;
  const profile=await h.poll(()=>h.request('GET','/api/v1/customers/me',undefined,token),r=>r.status===200);
  assert.ok(profile.data.cid);
  await check('Phone response keeps String and leading zero','GET','/api/v1/auth/me',undefined,200,token,data=>{
    assert.equal(data.phone,'0123');assert.equal(typeof data.phone,'string');assert.equal(data.passwordHash,undefined);
  });
  await check('3 one-character password','POST','/api/v1/auth/register',{...input(),password:'a'},201);
  await check('4 short numeric phone','POST','/api/v1/auth/register',{
    ...input(),phone:'0'+crypto.randomInt(10000,100000)},201);
  await check('5 alphabetic phone','POST','/api/v1/auth/register',{...input(),phone:'abc'+unique()},201);
  await check('6 empty password','POST','/api/v1/auth/register',{...input(),password:''},400);
  await check('7 empty phone','POST','/api/v1/auth/register',{...input(),phone:''},400);
  await check('8 invalid email','POST','/api/v1/auth/register',{...input(),email:'invalid-email'},400);
  await check('9 incorrect one-character login password','POST','/api/v1/auth/login',{email:primary.email,password:'x'},401);
  await check('Duplicate phone remains rejected','POST','/api/v1/auth/register',{...input(),phone:'0123'},409);
  for(const field of ['phone','password']){
    for(const value of [null,123,{$ne:null}])await check(field+' rejects '+(value===null?'null':typeof value),
      'POST','/api/v1/auth/register',{...input(),[field]:value},400);
    const missing=input();delete missing[field];
    await check('Missing '+field,'POST','/api/v1/auth/register',missing,400);
  }
  await check('Phone whitespace only','POST','/api/v1/auth/register',{...input(),phone:'   '},400);
  const driver={...input(),password:'a',phone:'driver-'+unique(),plateNumber:'VAL-'+unique().slice(0,12)};
  const otp=await check('11 Driver alphabetic phone and short password start OTP','POST','/api/v1/auth/register',driver,202,
    undefined,data=>{assert.equal(data.status,'OTP_REQUIRED');assert.match(data.mockCode,/^\d{6}$/);assert.equal(data.aid,undefined);});
  await check('Driver has no account before OTP','POST','/api/v1/auth/login',{email:driver.email,password:driver.password},401);
  await check('Driver OTP cooldown unchanged','POST','/api/v1/auth/register',driver,429);
  await check('Driver wrong OTP rejected','POST','/api/v1/auth/register',{
    ...driver,code:String((Number(otp.mockCode)+1)%1000000).padStart(6,'0')},400);
  await check('Driver OTP bound to password','POST','/api/v1/auth/register',{...driver,password:'b',code:otp.mockCode},400);
  await check('Driver correct OTP completes account','POST','/api/v1/auth/register',{...driver,code:otp.mockCode},201,
    undefined,data=>assert.match(data.did,/^d[0-9]+$/));
  const driverSession=await check('Driver short password login','POST','/api/v1/auth/login',
    {email:driver.email,password:driver.password},200);
  const driverToken=driverSession.accessToken;
  await h.poll(()=>h.request('GET','/api/v1/drivers/me',undefined,driverToken),r=>r.status===200);
  await check('Driver license unchanged','PATCH','/api/v1/drivers/me',{licenseNumber:'VALIDATION-DEMO'},200,driverToken);
  await check('Driver submit PENDING unchanged','POST','/api/v1/drivers/me/submissions',{},200,driverToken,
    data=>assert.equal(data.approvalStatus,'PENDING'));
  await check('25 SQL payload rejected','POST','/api/v1/auth/login',{email:"' OR 1=1 --",password:'anything'},400);
  await check('25 NoSQL object rejected','POST','/api/v1/auth/login',{email:{$ne:null},password:'a'},400);
  await check('26 XSS name rejected','PATCH','/api/v1/customers/me',{name:'<script>alert(1)</script>'},400,token);
  const parts=token.split('.'),payload=JSON.parse(Buffer.from(parts[1],'base64url'));
  payload.role='ADMIN';parts[1]=Buffer.from(JSON.stringify(payload)).toString('base64url');
  await check('27 tampered role rejected','GET','/api/v1/admin/drivers',undefined,401,parts.join('.'));
  await check('28 CUSTOMER cannot call DRIVER','GET','/api/v1/drivers/me',undefined,403,token);
  await check('Missing JWT still rejected','GET','/api/v1/customers/me',undefined,401);
  // Item 10 is verified independently inside auth_service with its own DB credentials.
}
let failure;
main().catch(error=>{failure=error;console.error('Validation smoke failed: '+error.message);process.exitCode=1;})
  .finally(()=>{
    const folder=path.join(__dirname,'../.local/evidence');fs.mkdirSync(folder,{recursive:true});
    const file=path.join(folder,'validation-'+Date.now()+'.json');
    fs.writeFileSync(file,JSON.stringify({at:new Date().toISOString(),status:failure?'FAIL':'PASS',cases,
      databaseHashCheck:'Run separately in auth_service; not inferred from HTTP.',
      ...(failure?{error:failure.message}:{})},null,2),{flag:'wx'});
    console.log('Validation HTTP checks: '+cases.filter(x=>x.status==='PASS').length+' PASS; evidence: '+path.relative(path.join(__dirname,'..'),file));
  });
