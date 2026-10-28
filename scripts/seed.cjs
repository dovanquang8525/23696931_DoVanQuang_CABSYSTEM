'use strict';
// Run inside each owning service. No service connects to another service database.
const argon2=require('argon2');
const {MongoClient,ObjectId}=require('mongodb');
const b=require('./business.cjs');
const {ownDatabase,mongoUri,required}=require('./runtime-config.cjs');
const {argonOptions}=require('../services/auth_service/application.cjs');
const {encrypt}=require('./driver-crypto.cjs');
const tag='cab-demo-v1';
let phase='configuration';
const accountId=n=>'100000000000000000'+String(n).padStart(6,'0');
const people=[{n:0,phone:'0909000000',role:'ADMIN',name:'Demo Admin'},
  {n:1,phone:'0909000001',role:'CUSTOMER',name:'Demo Customer'},
  {n:2,phone:'0909000002',role:'CUSTOMER',name:'Other Customer'},
  ...Array.from({length:5},(_,j)=>({n:11+j,phone:'09090000'+String(11+j),role:'DRIVER',name:'Demo Driver '+(j+1)}))];
for(const person of people){
  person.email=person.n===0?'admin@cab.local':person.role==='CUSTOMER'?'fixture.c'+person.n+'@cab.local':'fixture.d'+(person.n-10)+'@cab.local';
  if(person.role==='CUSTOMER')person.cid='cseed'+String(person.n).padStart(2,'0');
  if(person.role==='DRIVER')person.did='dseed'+String(person.n-10).padStart(2,'0');
}
function seedPassword(){
  const index=process.argv.indexOf('--password');
  if(index!==-1){if(!process.argv.includes('--admin-only'))throw new Error('Password argument requires admin-only bootstrap');return b.v.password(process.argv[index+1]);}
  return b.v.password(required('SEED_PASSWORD'));
}
async function repairSeedAdmin(accounts, existing, password) {
  if (existing._id.toHexString() !== accountId(0) || existing.seedTag !== tag ||
      existing.role !== 'ADMIN' || existing.status !== 'ACTIVE' || existing.phone !== people[0].phone ||
      (existing.email !== undefined && existing.email !== people[0].email)) {
    throw new Error('Admin repair refused: existing identity differs from the active seeded Admin');
  }
  const matches = await argon2.verify(existing.passwordHash, password);
  if (matches && existing.email === people[0].email) return false;
  const result = await accounts.updateOne({_id:existing._id,seedTag:tag,role:'ADMIN',status:'ACTIVE',
    phone:people[0].phone,passwordHash:existing.passwordHash,
    email:existing.email === undefined ? {$exists:false} : existing.email}, {$set:{
      email:people[0].email, passwordHash:matches ? existing.passwordHash : await argon2.hash(password,argonOptions),
      updatedAt:new Date()}});
  if (result.matchedCount !== 1) throw new Error('Admin repair refused: account changed during repair');
  return true;
}
async function seed(service,db,client){
  const c=b.context(service,db,client);
  if(service==='auth_service'){
    phase='Auth seed password validation';
    const password=seedPassword();
    phase='Auth accounts and outbox';
    for(const p of people.filter(p=>!process.argv.includes('--admin-only')||p.role==='ADMIN')){
      const existing=await db.collection('accounts').findOne({phone:p.phone});
      if(existing){
        if(existing.seedTag!==tag||existing._id.toHexString()!==accountId(p.n))throw new Error('Seed phone belongs to existing data; refusing overwrite');
        if(p.role==='ADMIN'){
          if(process.argv.includes('--repair-admin')){
            const changed=await repairSeedAdmin(db.collection('accounts'),existing,password);
            console.log(changed ? 'Seeded Admin email/password repaired.' : 'Seeded Admin already matches; no changes.');
          }else console.log('Existing seeded Admin retained; email/password unchanged. For explicit repair use --admin-only --repair-admin --password <password>.');
        }
        continue;
      }
      const id=new ObjectId(accountId(p.n)),time=new Date(),passwordHash=await argon2.hash(password,argonOptions);
      await c.tx(async session=>{
        await db.collection('accounts').insertOne({_id:id,phone:p.phone,email:p.email,
          ...(p.cid?{cid:p.cid}:{}),...(p.did?{did:p.did}:{}),passwordHash,role:p.role,status:'ACTIVE',
          seedTag:tag,createdAt:time,updatedAt:time},{session});
        if(p.role!=='ADMIN')await c.emit('account.registered',id.toHexString(),{accountId:id.toHexString(),role:p.role,
          fullName:p.name,email:p.email,...(p.cid?{cid:p.cid}:{did:p.did})},session);
      });
    }
  }else if(service==='driver_service'){
    phase='Driver profiles and vehicles';
    for(let j=0;j<5;j++){
      let row;
      for(let attempt=0;attempt<40;attempt++){
        row=await db.collection('driver_profiles').findOne({accountId:accountId(11+j)});
        if(row)break;await new Promise(resolve=>setTimeout(resolve,500));
      }
      if(!row)throw new Error('Driver consumer profile not ready');
      if(row.seedConfigured)continue;
      if(row.approval_status!=='DRAFT'||row.vehicle||row.reservation||row.active_trip_id)throw new Error('Driver already modified; refusing seed overwrite');
      const status=['APPROVED','APPROVED','PENDING','DRAFT','APPROVED'][j];
      await db.collection('driver_profiles').updateOne({_id:row._id,version:row.version},{$set:{
        seedConfigured:tag,approval_status:status,is_online:j===0||j===4,
        licenseNumberEncrypted:encrypt('DEMO-LICENSE-'+(j+1)),
        location:{latitude:10.8+j*0.0002,longitude:106.7,updated_at:new Date(Date.now()-(j===4?180000:0)).toISOString()},
        vehicle:{vehicle_id:new ObjectId().toHexString(),driver_id:row.driver_id,plate_number:'DEMO-'+(j+1),
          vehicle_type:'BIKE',model:'Demo Bike',color:'Black',is_active:true}},$inc:{version:1}});
    }
  }else if(service==='booking_service'){
    phase='Customer profile over gRPC';
    // Retrieve Customer profile over gRPC with a seed-only signed identity, never a cross-DB read.
    const jwt=require('jsonwebtoken');
    const token=jwt.sign({sub:accountId(1),role:'CUSTOMER'},required('JWT_SECRET'),
      {algorithm:'HS256',issuer:'cab-auth',audience:'cab-api',expiresIn:300});
    let profile;
    for(let attempt=0;attempt<40;attempt++){
      try{profile=await b.invoke('customer','getCustomerByAccount',{account_id:accountId(1)},{caller:service,token});break;}
      catch(error){if(![b.grpc.status.UNAVAILABLE,b.grpc.status.DEADLINE_EXCEEDED].includes(error.code))throw error;}
      await new Promise(resolve=>setTimeout(resolve,500));
    }
    if(!profile)throw new Error('Customer consumer profile not ready');
    phase='Booking history fixtures';
    for(let j=1;j<=5;j++){
      const id=new ObjectId('200000000000000000'+String(j).padStart(6,'0')),time=new Date(Date.now()-j*60000).toISOString();
      const existing=await db.collection('bookings').findOne({_id:id});
      if(existing){if(existing.seedTag!==tag)throw new Error('Seed ID collision');continue;}
      const row={_id:id,booking_id:id.toHexString(),customer_id:profile.customer_id,customerAccountId:accountId(1),
        pickup:{latitude:0,longitude:0},destination:{latitude:0.01,longitude:0.01},vehicle_type:'BIKE',status:'NO_DRIVER',
        distance_km:b.distance({latitude:0,longitude:0},{latitude:0.01,longitude:0.01}),
        pricing_snapshot:{base_fare:10000,rate_per_km:5000,rounding_unit:1000},created_at:time,updated_at:time,
        seedTag:tag,idempotencyKey:'seed-history-'+j,payloadHash:'seed-history',version:2,candidates:[],cursor:0};
      row.responseSnapshot=b.views.booking(row);await db.collection('bookings').insertOne(row);
    }
  }else throw new Error('Seed is supported only for Auth, Driver and Booking');
}
async function main(){
  const service=process.argv[2];
  if(process.argv.includes('--repair-admin') && (service!=='auth_service' ||
      !process.argv.includes('--admin-only') || !process.argv.includes('--password'))){
    throw new Error('Admin repair requires auth_service --admin-only --repair-admin --password <password>');
  }
  if(service==='auth_service'){
    const password=seedPassword();
    if(password.length===0)throw new Error('SEED_PASSWORD must contain at least 1 character');
  }
  const config=ownDatabase(service),client=new MongoClient(mongoUri(config.username,config.password));
  phase='MongoDB connection';
  try{await client.connect();await seed(service,client.db(config.name),client);console.log(service+': seed complete; existing business data preserved.');}
  finally{b.closeClients();await client.close();}
}
function failureMessage(error){
  // Only known messages/configuration names are safe to print; never dump driver errors or URIs.
  const missing=/^Missing configuration: ([A-Z][A-Z0-9_]*)$/.exec(error?.message||'');
  if(missing)return 'Missing configuration: '+missing[1]+'. Run npm run setup:local, then recreate the affected container.';
  const known=new Set(['SEED_PASSWORD must contain at least 1 character',
    'Admin repair requires auth_service --admin-only --repair-admin --password <password>',
    'Admin repair refused: existing identity differs from the active seeded Admin',
    'Admin repair refused: account changed during repair',
    'Seed phone belongs to existing data; refusing overwrite','Driver consumer profile not ready',
    'Driver already modified; refusing seed overwrite','Customer consumer profile not ready','Seed ID collision']);
  if(known.has(error?.message))return error.message;
  const code=typeof error?.code==='number'?String(error.code):/^[A-Z0-9_]{1,64}$/.test(error?.code||'')?error.code:'UNCLASSIFIED';
  return 'Dependency or seed operation failed; code='+code+'.';
}
if(require.main===module)void main().catch(error=>{
  console.error('Seed failed ['+process.argv[2]+'; '+phase+']: '+failureMessage(error));
  console.error('No data was deleted.');process.exitCode=1;
});
module.exports={people,accountId,repairSeedAdmin};
