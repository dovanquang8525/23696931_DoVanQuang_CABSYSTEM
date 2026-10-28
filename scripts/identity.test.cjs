'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const v = require('./identity-validation.cjs');
const {identity, DomainError} = require('./rpc-security.cjs');
const {otpDigest, argonOptions,registrationInput,registrationDigest} = require('../services/auth_service/application.cjs');
const {checkEnvelope} = require('./event-bus.cjs');
const routes = require('../gateway/identity-routes.cjs');
test('Customer pages expose cid and aid and reject long/unknown fields', () => {
  const page = routes.match('GET', '/api/v1/admin/customers').responses.get(200);
  const legacy = {cid:'c01',aid:'a01',
    name:'Legacy Customer',createdAt:'2026-10-27T00:00:00Z',updatedAt:'2026-10-27T00:00:00Z'};
  const response = {items:[legacy,{...legacy,cid:'c01'}],page:2,limit:10,totalItems:14};
  assert.equal(page(response), true);
  assert.equal(page({...response,items:[{...legacy,cid:'invalid'}]}), false);
  assert.equal(page({...response,items:[{...legacy,passwordHash:'secret'}]}), false);
  assert.equal(routes.match('GET','/api/v1/customers/me').responses.get(200)(legacy), true);
});
test('Driver pages expose did and aid and reject unknown fields', () => {
  const validate = routes.match('GET', '/api/v1/admin/drivers').responses.get(200);
  const legacy = {did:'d01',aid:'a01',
    name:'Legacy Driver',approvalStatus:'DRAFT',isOnline:false};
  const page = {items:[legacy,{...legacy,did:'d01'}],page:1,limit:10,totalItems:2};
  assert.equal(validate(page), true);
  assert.equal(validate({...page,items:[{...legacy,did:'invalid'}]}), false);
  assert.equal(validate({...page,items:[{...legacy,passwordHash:'secret'}]}), false);
  assert.equal(routes.match('GET','/api/v1/drivers/me').responses.get(200)(legacy), true);
});
test('registration has no session; login returns a compact session', () => {
  const validate = routes.match('POST', '/api/v1/auth/register').responses.get(201);
  const aid = 'a01';
  const response = {aid, role: 'CUSTOMER', cid: 'c01'};
  assert.equal(validate(response), true);
  assert.equal(validate({...response, accessToken: 'test-token'}), false);
  assert.equal(validate({...response, profileStatus: 'PENDING'}), false);
  assert.equal(validate({aid, role: 'DRIVER', did: 'd01'}), true);
  const login = routes.match('POST', '/api/v1/auth/login').responses.get(200);
  const session = {accessToken: 'test-token', account: response};
  assert.equal(login(session), true);
  assert.equal(login({...session, expiresAt: '2026-10-27T12:00:00Z'}), false);
  assert.equal(login({...session, account: {...response, status: 'ACTIVE'}}), false);
  const wire = require('./business.cjs').definition('auth').AuthService.service.Login;
  const decoded = routes.output(wire.responseDeserialize(wire.responseSerialize({access_token: 'test-token',
    account: {account_id: aid, role: 'CUSTOMER', cid: 'c01'}})));
  assert.deepEqual(decoded, session);
});
test('password keeps whitespace and counts Unicode characters without trimming', () => {
  assert.equal(v.password('  abcdef  '), '  abcdef  ');
  assert.equal(v.password('😀'.repeat(64)), '😀'.repeat(64));
  assert.equal(v.password('😀'.repeat(65)), '😀'.repeat(65));
  assert.equal(v.password('a'), 'a');
  assert.equal(v.password('quang123'),'quang123');
  assert.equal(v.password('123'),'123');
  for (const value of ['',null,undefined,123,{$ne:null}]) assert.throws(()=>v.password(value),DomainError);
});
test('validation rejects NoSQL objects, ownership injection and HTML', () => {
  assert.throws(() => v.phone({$ne:null}), DomainError);
  assert.throws(() => v.text('<script>x</script>',100), DomainError);
  assert.throws(() => v.fields({full_name:'A',role:'ADMIN'}, ['full_name']), DomainError);
  assert.equal(v.text('  Demo  ',100), 'Demo');
});
test('demo Phone/Password policy agrees between Gateway and Auth while retaining email and type checks', () => {
  const register=routes.match('POST','/api/v1/auth/register');
  const url=new URL('http://local/api/v1/auth/register');
  const base={email:'quang123@gmail.com',password:'123',phone:'0123'};
  for(const phone of ['0123','123','abc123','a']) {
    for(const password of ['123','a',' ','long'.repeat(30),'😀']) {
      const input={...base,phone,password};
      assert.doesNotThrow(()=>routes.validate(register,url,input));
      assert.equal(registrationInput(input).phone,phone);
      assert.equal(registrationInput(input).password,password);
    }
  }
  assert.equal(v.phone(' 0123 '),'0123');
  for(const key of ['phone','password']) {
    for(const value of ['',null,123,{$ne:null},[]]) {
      const input={...base,[key]:value};
      assert.throws(()=>routes.validate(register,url,input),DomainError);
      assert.throws(()=>registrationInput(input),DomainError);
    }
    const missing={...base};delete missing[key];
    assert.throws(()=>routes.validate(register,url,missing),DomainError);
    assert.throws(()=>registrationInput(missing),DomainError);
  }
  assert.throws(()=>registrationInput({...base,phone:'   '}),DomainError);
  for(const email of ['invalid',{$ne:null},null]) {
    assert.throws(()=>routes.validate(register,url,{...base,email}),DomainError);
    assert.throws(()=>registrationInput({...base,email}),DomainError);
  }
  for(const endpoint of ['/api/v1/auth/otp-challenges','/api/v1/auth/otp-challenges/o01/verify']) {
    const route=routes.match('POST',endpoint),input=endpoint.endsWith('/verify')?{phone:'abc123',code:'123456'}:{phone:'abc123'};
    assert.doesNotThrow(()=>routes.validate(route,new URL('http://local'+endpoint),input));
  }
});
test('OTP HMAC binds ID, phone, purpose and code', () => {

  const input = {otpId:'000000000000000000000001',phone:'0900000001',purpose:'DRIVER_REGISTRATION',code:'123456'};

  const secret = 'unit-only-secret';

  assert.notEqual(otpDigest(input,secret), otpDigest({...input,phone:'0900000002'},secret));

  assert.notEqual(otpDigest(input,secret), otpDigest({...input,otpId:'000000000000000000000002'},secret));

  assert.notEqual(otpDigest(input,secret), otpDigest(input,secret+'changed'));

});
test('JWT verifies algorithm, signature, issuer, audience, expiration and subject', () => {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'synthetic-unit-key-do-not-use-in-runtime';
  try {
    const claims = {sub:'000000000000000000000001',role:'CUSTOMER'};
    const options = {algorithm:'HS256',issuer:'cab-auth',audience:'cab-api',expiresIn:3600};
    const token = jwt.sign(claims,process.env.JWT_SECRET,options);
    assert.equal(identity(token).role,'CUSTOMER');
    const parts = token.split('.');
    parts[2] = (parts[2][0] === 'A' ? 'B' : 'A') + parts[2].slice(1);
    assert.throws(() => identity(parts.join('.')), DomainError);
    assert.throws(() => identity(jwt.sign(claims,'wrong-key',options)), DomainError);
    assert.throws(() => identity(jwt.sign(claims,process.env.JWT_SECRET,{...options,algorithm:'HS384'})), DomainError);
    assert.throws(() => identity(jwt.sign(claims,process.env.JWT_SECRET,{...options,issuer:'wrong'})), DomainError);
    assert.throws(() => identity(jwt.sign(claims,process.env.JWT_SECRET,{...options,audience:'wrong'})), DomainError);
    assert.throws(() => identity(jwt.sign(claims,process.env.JWT_SECRET,{...options,expiresIn:-1})), DomainError);
    assert.throws(() => identity(jwt.sign({...claims,sub:'invalid'},process.env.JWT_SECRET,options)), DomainError);
  } finally {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  }
});
test('Argon2id salt differs and stored hash verifies only the correct password', async () => {
  const password='SyntheticPassword-123';
  const a=await argon2.hash(password,argonOptions), b=await argon2.hash(password,argonOptions);
  assert.match(a,/^\$argon2id\$/);
  assert.notEqual(a,b);
  assert.equal(await argon2.verify(a,password),true);
  assert.equal(await argon2.verify(a,password+'wrong'),false);
});
test('event validation rejects secret fields and aggregate identity mismatch', () => {

  const event={eventId:'f7817673-d709-542e-b5b7-d6f91db8e202',eventType:'account.registered',

    occurredAt:'2026-10-27T00:00:00Z',producer:'auth_service',aggregateId:'000000000000000000000001',

    aggregateVersion:1,correlationId:'unit-only',payload:{accountId:'000000000000000000000001',

      role:'CUSTOMER',fullName:'Demo',email:'cus01@gmail.com',cid:'c01'}};

  assert.equal(checkEnvelope(event),event);

  assert.throws(() => checkEnvelope({...event,payload:{...event.payload,password:'secret'}}));

  assert.throws(() => checkEnvelope({...event,aggregateId:'000000000000000000000002'}));

});
test('REST validation rejects public ADMIN, unknown fields and invalid pagination', () => {
  const register = routes.match('POST','/api/v1/auth/register');
  const url = new URL('http://gateway.local/api/v1/auth/register');
  const valid={phone:'0909212109',email:'cus01@gmail.com',password:'quang123'};
  assert.doesNotThrow(() => routes.validate(register,url,valid));
  assert.throws(() => routes.validate(register,url,{...valid,role:'ADMIN'}),DomainError);
  assert.throws(() => routes.validate(register,url,{...valid,cid:'self'}),DomainError);
  const list = routes.match('GET','/api/v1/admin/customers');
  assert.throws(() => routes.validate(list,new URL('http://gateway.local/api/v1/admin/customers?limit=51')),DomainError);
  assert.throws(() => routes.validate(list,new URL('http://gateway.local/api/v1/admin/customers?page=1&page=2')),DomainError);
});
test('registration starts Driver OTP before account creation and rejects client identity/role fields',()=>{
  const register=routes.match('POST','/api/v1/auth/register'),url=new URL('http://local/api/v1/auth/register');
  const customer={phone:'0909212109',email:'cus01@gmail.com',password:'quang123'};
  const first={phone:'0909212110',email:'dri01@gmail.com',password:'quang123',plateNumber:'59A12345'};
  const driver={...first,code:'123456'};
  assert.doesNotThrow(()=>routes.validate(register,url,first));
  assert.doesNotThrow(()=>routes.validate(register,url,driver));
  for(const body of [{...customer,did:'d01'},{...customer,cid:'c01'},{...customer,code:'123456'},
    {...driver,oid:'000000000000000000000001'},{...first,code:'12'},{...customer,name:'extra'},{...customer,password:''}]){
    assert.throws(()=>routes.validate(register,url,body),DomainError);
  }
  assert.equal(v.loginEmail(' Cus01@GMAIL.COM '),'cus01@gmail.com');
  assert.equal(v.profileCode('c01','c'),'c01');
  assert.throws(()=>v.profileCode('d01','c'),DomainError);
  const login=routes.match('POST','/api/v1/auth/login'),loginUrl=new URL('http://local/api/v1/auth/login');
  assert.doesNotThrow(()=>routes.validate(login,loginUrl,{email:'cus01@gmail.com',password:'quang123'}));
  assert.throws(()=>routes.validate(login,loginUrl,{phone:customer.phone,password:'quang123'}),DomainError);
  assert.throws(()=>routes.validate(login,loginUrl,{email:{$ne:null},password:'quang123'}),DomainError);
  const otp=routes.match('POST','/api/v1/auth/otp-challenges'),otpUrl=new URL('http://local/api/v1/auth/otp-challenges');
  assert.doesNotThrow(()=>routes.validate(otp,otpUrl,{phone:driver.phone}));
  assert.throws(()=>routes.validate(otp,otpUrl,{phone:driver.phone,purpose:'DRIVER_REGISTRATION'}),DomainError);
  assert.equal(routes.input(otp,{phone:driver.phone},{},{}).purpose,'DRIVER_REGISTRATION');
  assert.equal(registrationInput(customer).role,'CUSTOMER');
  const input={...customer,phone:first.phone,email:first.email,plate_number:first.plateNumber,code:'123456'};
  assert.equal(registrationInput(input).role,'DRIVER');
  assert.equal(registrationInput({...customer,plate_number:first.plateNumber}).needsOtp,true);
  assert.equal(registrationInput(input).needsOtp,false);
  assert.throws(()=>registrationInput({...customer,role:'ADMIN'}),DomainError);
  assert.throws(()=>registrationInput({...customer,did:'d01'}),DomainError);
  const noProof={...input};delete noProof.code;assert.equal(registrationInput(noProof).needsOtp,true);
  assert.notEqual(registrationDigest(registrationInput(input),'test-secret'),
    registrationDigest(registrationInput({...input,plate_number:'DIFFERENT'}),'test-secret'));
  assert.notEqual(registrationDigest(registrationInput(input),'test-secret'),
    registrationDigest(registrationInput({...input,password:'different-password'}),'test-secret'));
});
