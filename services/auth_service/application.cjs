'use strict';
const crypto = require('node:crypto');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const {ObjectId} = require('mongodb');
const {required} = require('../../scripts/runtime-config.cjs');
const {grpc, fail, authorization, safeEqual, addHandlers} = require('../../scripts/rpc-security.cjs');
const v = require('../../scripts/identity-validation.cjs');
const {createBus} = require('../../scripts/event-bus.cjs');
const {allocateProfileCode}=require('../../scripts/profile-codes.cjs');
const argonOptions = {type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1};
function otpDigest({otpId, phone, purpose, code}, secret = required('OTP_HMAC_SECRET')) {
  return crypto.createHmac('sha256', secret).update([otpId, phone, purpose, code].join('\n')).digest('hex');
}
function accountView(row) {
  return {account_id: row._id.toHexString(), phone: row.phone, role: row.role, status: row.status,
    email:row.email,...(row.cid?{cid:row.cid}:{}),...(row.did?{did:row.did}:{})};
}
function issueSession(row) {
  const issuedAt = Math.floor(Date.now() / 1000), expiresAt = issuedAt + 3600;
  const accessToken = jwt.sign({sub: row._id.toHexString(), role: row.role, iat: issuedAt, exp: expiresAt},
    required('JWT_SECRET'), {algorithm: 'HS256', issuer: 'cab-auth', audience: 'cab-api'});
  return {access_token: accessToken, account: {account_id: row._id.toHexString(), role: row.role,
    ...(row.cid ? {cid: row.cid} : {}), ...(row.did ? {did: row.did} : {})}};
}
function registrationInput(input){
  v.fields(input,['phone','password','email','plate_number','code'],['phone','password','email']);
  const phone=v.phone(input.phone),password=v.password(input.password),email=v.loginEmail(input.email);
  const driver=Object.hasOwn(input,'plate_number'),role=driver?'DRIVER':'CUSTOMER';
  const hasCode=Object.hasOwn(input,'code');
  if(!driver&&hasCode)v.invalid();
  const plateNumber=driver?v.text(input.plate_number,20):undefined;
  if(hasCode&&(typeof input.code!=='string'||!/^\d{6}$/.test(input.code)))v.invalid();
  return {phone,password,email,role,plateNumber,needsOtp:driver&&!hasCode};
}
function registrationDigest(data,secret=required('OTP_HMAC_SECRET')){
  return crypto.createHmac('sha256',secret).update('driver-registration\n'+JSON.stringify({
    email:data.email,phone:data.phone,plateNumber:data.plateNumber,password:data.password})).digest('hex');
}
async function create({db, client, server}) {
  required('JWT_SECRET'); required('OTP_HMAC_SECRET');
  if ((process.env.JWT_ALGORITHM || 'HS256') !== 'HS256' ||
      (process.env.JWT_ISSUER || 'cab-auth') !== 'cab-auth' ||
      (process.env.JWT_AUDIENCE || 'cab-api') !== 'cab-api' ||
      Number(process.env.JWT_EXPIRES_IN_SECONDS || 3600) !== 3600) throw new Error('JWT configuration differs from contract');
  const accounts = db.collection('accounts'), challenges = db.collection('otp_challenges');
  const cooldowns = db.collection('otp_cooldowns'), outbox = db.collection('outbox_events');
  await accounts.createIndex({phone: 1}, {unique: true});
  await accounts.createIndex({email:1},{unique:true,partialFilterExpression:{email:{$type:'string'}}});
  await accounts.createIndex({cid:1},{unique:true,partialFilterExpression:{cid:{$type:'string'}}});
  await accounts.createIndex({did:1},{unique:true,partialFilterExpression:{did:{$type:'string'}}});
  for(const role of ['CUSTOMER','DRIVER'])await db.collection('profile_code_counters').updateOne({_id:role},
    {$setOnInsert:{value:0}},{upsert:true});
  await challenges.createIndex({phone: 1, purpose: 1, createdAt: -1});
  const dummyHash = await argon2.hash(crypto.randomBytes(32).toString('hex'), argonOptions);
  const bus = await createBus({service: 'auth_service', db, client, publishOutbox: true});
  async function activeIdentity(call) {
    const {claims} = authorization(call);
    const row = await accounts.findOne({_id: new ObjectId(claims.sub)});
    if (!row || row.role !== claims.role) fail(grpc.status.UNAUTHENTICATED, 'INVALID_TOKEN', 'Invalid access token.');
    if (row.status !== 'ACTIVE') fail(grpc.status.PERMISSION_DENIED, 'ACCOUNT_DISABLED', 'Account is not active.');
    return row;
  }
  const tx = work => client.withSession(session => session.withTransaction(() => work(session),
    {readConcern: {level: 'snapshot'}, writeConcern: {w: 'majority'}, maxCommitTimeMS: 5000}));
  const methods = {
    async RequestOtp(input,_call,registration) {
      v.fields(input, ['phone','purpose'], ['phone','purpose']);
      const phone = v.phone(input.phone);
      if (input.purpose !== 'DRIVER_REGISTRATION') v.invalid();
      const otpId = new ObjectId(), now = new Date(), expiresAt = new Date(now.getTime() + 300000);
      const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
      try {
        await tx(async session => {
          const cooldown = await cooldowns.findOne({_id: phone + ':DRIVER_REGISTRATION'}, {session});
          if (cooldown?.nextAllowedAt > now) fail(grpc.status.RESOURCE_EXHAUSTED, 'RATE_LIMITED',
            'Wait before requesting another OTP.', Math.max(1, Math.ceil((cooldown.nextAllowedAt - now) / 1000)));
          await cooldowns.updateOne({_id: phone + ':DRIVER_REGISTRATION'}, {$set: {
            nextAllowedAt: new Date(now.getTime() + 60000)}}, {upsert: true, session});
          await challenges.updateMany({phone, purpose: input.purpose, invalidatedAt: {$exists: false},
            consumedAt: {$exists: false}}, {$set: {invalidatedAt: now}}, {session});
          await challenges.insertOne({_id: otpId, phone, purpose: input.purpose, failedAttempts: 0,
            codeHash: otpDigest({otpId: otpId.toHexString(), phone, purpose: input.purpose, code}),
            createdAt: now, expiresAt,...(registration?{registration}:{})}, {session});
        });
      } catch (error) {
        if (error.code === 11000) fail(grpc.status.RESOURCE_EXHAUSTED, 'RATE_LIMITED', 'Wait before requesting another OTP.', 60);
        throw error;
      }
      return {otp_id: otpId.toHexString(), expires_at: expiresAt.toISOString(),
        ...(process.env.OTP_MOCK_MODE === 'true' ? {mock_code: code} : {})};
    },
    async VerifyOtp(input) {
      v.fields(input, ['otp_id','phone','code'], ['otp_id','phone','code']);
      const otpId = v.id(input.otp_id), phone = v.phone(input.phone);
      if (typeof input.code !== 'string' || !/^[0-9]{6}$/.test(input.code)) v.invalid();
      const result = await tx(async session => {
        const row = await challenges.findOne({_id: new ObjectId(otpId), phone,
          purpose: 'DRIVER_REGISTRATION'}, {session});
        const now = new Date();
        if (!row || row.expiresAt <= now || row.invalidatedAt || row.consumedAt ||
            row.verifiedAt || row.failedAttempts >= 5) return {invalid: true};
        if (!safeEqual(row.codeHash, otpDigest({otpId, phone, purpose: row.purpose, code: input.code}))) {
          await challenges.updateOne({_id: row._id}, {$inc: {failedAttempts: 1}}, {session});
          return {invalid: true};
        }
        await challenges.updateOne({_id: row._id}, {$set: {verifiedAt: now}}, {session});
        return {otp_id: otpId, verified: true, expires_at: row.expiresAt.toISOString()};
      });
      if (result.invalid) fail(grpc.status.INVALID_ARGUMENT, 'INVALID_INPUT', 'OTP is invalid or no longer available.');
      return result;
    },
    async Register(input, call) {
      const data=registrationInput(input),{phone,password,email,role,plateNumber,needsOtp}=data;
      if (await accounts.findOne({$or:[{phone},{email}]}, {projection: {_id: 1}})) {
        fail(grpc.status.ALREADY_EXISTS, 'DUPLICATE_RESOURCE', 'Email or phone is already registered.');
      }
      if(needsOtp){
        const passwordHash=await argon2.hash(password,argonOptions);
        const otp=await methods.RequestOtp({phone,purpose:'DRIVER_REGISTRATION'},call,
          {email,plateNumber,passwordHash,requestHash:registrationDigest(data)});
        const metadata=new grpc.Metadata();metadata.set('cab-registration-otp','true');call.sendMetadata(metadata);
        return {status:'OTP_REQUIRED',...otp};
      }
      const customerHash=role==='CUSTOMER'?await argon2.hash(password,argonOptions):undefined;
      const accountId = new ObjectId(), eventId = crypto.randomUUID();
      const now = new Date(), supplied = call.metadata.get('x-correlation-id');
      const correlationId = typeof supplied[0] === 'string' && supplied[0].length <= 128 && supplied[0].length
        ? supplied[0] : crypto.randomUUID();
      const result=await tx(async session => {
        let passwordHash=customerHash;
        if (role === 'DRIVER') {
          const proof=await challenges.findOne({phone,purpose:'DRIVER_REGISTRATION',registration:{$exists:true}},
            {session,sort:{createdAt:-1,_id:-1}});
          if(!proof||proof.consumedAt||proof.invalidatedAt||proof.expiresAt<=new Date()||proof.failedAttempts>=5||
              !proof.registration||!safeEqual(proof.registration.requestHash,registrationDigest(data)))return {invalid:true};
          if(!safeEqual(proof.codeHash,otpDigest({otpId:proof._id.toHexString(),phone,purpose:'DRIVER_REGISTRATION',code:input.code}))){
            await challenges.updateOne({_id:proof._id},{$inc:{failedAttempts:1}},{session});return {invalid:true};
          }
          await challenges.updateOne({_id:proof._id},{$set:{verifiedAt:new Date(),consumedAt:new Date()}},{session});
          passwordHash=proof.registration.passwordHash;
        }
        const {field:codeField,code}=await allocateProfileCode(db,role,session);
        const account = {_id: accountId, phone, email,[codeField]:code,passwordHash,role,status: 'ACTIVE',
          createdAt: now, updatedAt: now};
        await accounts.insertOne(account, {session});
        const envelope = {eventId, eventType: 'account.registered', occurredAt: now.toISOString(),
          producer: 'auth_service', aggregateId: accountId.toHexString(), aggregateVersion: 1, correlationId,
          payload: {accountId: accountId.toHexString(),role,fullName:code,email,[codeField]:code,
            ...(plateNumber?{plateNumber}:{})}};
        await outbox.insertOne({_id: eventId, envelope, createdAt: now, publishedAt: null}, {session});
        return {account};
      });
      if(result.invalid)fail(grpc.status.INVALID_ARGUMENT,'INVALID_INPUT','OTP is invalid, expired, used or does not match the registration.');
      const account = result.account;
      return {account_id: accountId.toHexString(), role,
        ...(role === 'CUSTOMER' ? {cid: account.cid} : {did: account.did})};
    },
    async Login(input) {
      v.fields(input, ['email','password'], ['email','password']);
      const email=v.loginEmail(input.email),password=v.password(input.password);
      const row=await accounts.findOne({email});
      const correct = await argon2.verify(row?.passwordHash || dummyHash, password);
      if (!row || !correct || row.status !== 'ACTIVE') {
        fail(grpc.status.UNAUTHENTICATED, 'INVALID_TOKEN', 'Email or password is incorrect.');
      }
      return issueSession(row);
    },
    async GetIdentity(input, call) { v.fields(input, []); return accountView(await activeIdentity(call)); },
    async GetAccountAccess(input) {
      v.fields(input, ['account_id'], ['account_id']);
      const row = await accounts.findOne({_id: new ObjectId(v.id(input.account_id))});
      if (!row) fail(grpc.status.NOT_FOUND, 'NOT_FOUND', 'Account does not exist.');
      return {account_id: row._id.toHexString(), role: row.role, status: row.status};
    }
  };
  addHandlers(server, 'auth', methods);
  return {isReady: bus.isReady, close: bus.close};
}
module.exports = {create, otpDigest, argonOptions,registrationInput,registrationDigest};
