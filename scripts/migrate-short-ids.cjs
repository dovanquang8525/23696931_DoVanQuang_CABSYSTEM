'use strict';
// Explicit maintenance only. Stop application containers first; never deletes documents.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {MongoClient,BSON}=require('mongodb');
const {EJSON}=BSON;
const {services,ownDatabase,mongoUri}=require('./runtime-config.cjs');
const oid=x=>typeof x==='string'?x:x?.toHexString?.();
const hex=x=>typeof x==='string'&&/^[0-9a-f]{24}$/.test(x);
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fields={customer_id:'c',customerId:'c',driver_id:'d',driverId:'d',booking_id:'b',bookingId:'b',
  trip_id:'t',tripId:'t',active_trip_id:'t',activeTripId:'t',expected_trip_id:'t',vehicle_id:'v',vehicleId:'v',
  payment_id:'p',paymentId:'p',failed_payment_id:'p',failedPaymentId:'p',invitation_id:'i',invitationId:'i',
  review_id:'r',reviewId:'r',notification_id:'n',notificationId:'n',otp_id:'o',otpId:'o',reserved_booking_id:'b'};
function makePlan(folder){
  const source=Object.fromEntries(services.map(service=>{
    const file=path.join(folder,service+'.backup.json');
    const value=EJSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
    assert.equal(value.service,service);return [service,value];
  }));
  const maps=Object.fromEntries('acdbtpnrivo'.split('').map(p=>[p,{}])),used=Object.fromEntries(Object.keys(maps).map(p=>[p,new Set()]));
  const next=Object.fromEntries(Object.keys(maps).map(p=>[p,0]));
  const rows=(service,name)=>source[service].collections[name]||[];
  function reserve(prefix,old,code){
    assert.ok(typeof code==='string'&&new RegExp('^'+prefix+'[a-z0-9]{1,15}$').test(code),'Invalid existing public code');
    if(maps[prefix][old])assert.equal(maps[prefix][old],code,'Conflicting profile codes');
    else {assert.ok(!used[prefix].has(code),'Duplicate public code');maps[prefix][old]=code;used[prefix].add(code);}
    if(new RegExp('^'+prefix+'[0-9]+$').test(code))next[prefix]=Math.max(next[prefix],Number(code.slice(1)));
  }
  function alloc(prefix,old){
    if(maps[prefix][old])return maps[prefix][old];
    let code;do{code=prefix+String(++next[prefix]).padStart(2,'0');}while(used[prefix].has(code));
    reserve(prefix,old,code);return code;
  }
  const accounts=rows('auth_service','accounts'),profiles={CUSTOMER:rows('customer_service','customer_profiles'),DRIVER:rows('driver_service','driver_profiles')};
  for(const a of accounts){if(a.aid)reserve('a',oid(a._id),a.aid);}
  for(const role of ['CUSTOMER','DRIVER'])for(const profile of profiles[role]){
    const prefix=role==='CUSTOMER'?'c':'d',field=prefix+'id',a=accounts.find(x=>oid(x._id)===profile.accountId);
    assert.ok(a,'Profile has no owning Account; resolve before migration');
    if(profile[field]&&a[field])assert.equal(profile[field],a[field]);
    const code=profile[field]||a[field];if(code)reserve(prefix,role==='CUSTOMER'?oid(profile._id):profile.driver_id,code);
  }
  // Preserve codes even if a corresponding profile is temporarily absent.
  for(const role of ['CUSTOMER','DRIVER'])for(const a of accounts.filter(x=>x.role===role)){
    const prefix=role==='CUSTOMER'?'c':'d',field=prefix+'id';
    if(a[field]&&!used[prefix].has(a[field]))reserve(prefix,'account:'+oid(a._id),a[field]);
  }
  const entities=[['booking_service','bookings','booking_id','b'],['booking_service','invitations','invitation_id','i'],
    ['trip_service','trips','trip_id','t'],['payment_service','payments','payment_id','p'],
    ['notification_service','notifications','notification_id','n'],['rating_service','reviews','review_id','r'],
    ['auth_service','otp_challenges','oid','o']];
  for(const [service,name,field,prefix]of entities)for(const row of rows(service,name)){
    const old=field==='oid'?oid(row._id):row[field];
    if(row[field]&&!hex(row[field]))reserve(prefix,old,row[field]);
  }
  for(const d of profiles.DRIVER)if(d.vehicle?.vehicle_id&&!hex(d.vehicle.vehicle_id))reserve('v',d.vehicle.vehicle_id,d.vehicle.vehicle_id);
  for(const a of accounts)alloc('a',oid(a._id));
  for(const role of ['CUSTOMER','DRIVER'])for(const profile of profiles[role])alloc(role==='CUSTOMER'?'c':'d',role==='CUSTOMER'?oid(profile._id):profile.driver_id);
  for(const [service,name,field,prefix]of entities)for(const row of rows(service,name))alloc(prefix,field==='oid'?oid(row._id):row[field]);
  for(const d of profiles.DRIVER)if(d.vehicle)alloc('v',d.vehicle.vehicle_id);
  const accountCodes={};
  for(const role of ['CUSTOMER','DRIVER'])for(const a of accounts.filter(x=>x.role===role)){
    const prefix=role==='CUSTOMER'?'c':'d',field=prefix+'id',profile=profiles[role].find(p=>p.accountId===oid(a._id));
    accountCodes[oid(a._id)]=profile?maps[prefix][role==='CUSTOMER'?oid(profile._id):profile.driver_id]:(a[field]||alloc(prefix,'account:'+oid(a._id)));
  }
  let orphanReferences=0;
  function convert(prefix,value){
    if(!hex(value))return value;
    if(!maps[prefix][value]){alloc(prefix,value);orphanReferences++;}
    return maps[prefix][value];
  }
  function rewrite(value,key){
    if(Array.isArray(value))return value.map(v=>rewrite(v,key));
    if(!value||typeof value!=='object')return fields[key]?convert(fields[key],value):['candidates','candidateDrivers'].includes(key)?convert('d',value):value;
    if(value._bsontype||value instanceof Date||Buffer.isBuffer(value))return value;
    const out={};for(const [k,v]of Object.entries(value))out[k]=k==='_id'?v:rewrite(v,k);
    if(out.related_entity_id){const prefix={BOOKING:'b',TRIP:'t',PAYMENT:'p',DRIVER:'d'}[out.related_entity_type];if(prefix)out.related_entity_id=convert(prefix,out.related_entity_id);}
    return out;
  }
  const plan={version:1,createdAt:new Date().toISOString(),services:{},orphanReferences:0};
  for(const service of services){
    const collections={};
    for(const [name,documents]of Object.entries(source[service].collections)){
      // Delivered event envelopes and inbox hashes are immutable historical evidence.
      if(['outbox_events','inbox_events','trip_guards','id_counters','profile_code_counters','_cab_metadata','otp_cooldowns'].includes(name))continue;
      collections[name]=documents.map(original=>{
        const row=rewrite(original);
        if(service==='auth_service'&&name==='accounts'){
          row.aid=maps.a[oid(original._id)];
          if(['CUSTOMER','DRIVER'].includes(row.role))row[row.role==='CUSTOMER'?'cid':'did']=accountCodes[oid(original._id)];
        }
        if(service==='auth_service'&&name==='otp_challenges')row.oid=maps.o[oid(original._id)];
        if(service==='customer_service'&&name==='customer_profiles')row.cid=maps.c[oid(original._id)];
        if(service==='driver_service'&&name==='driver_profiles')row.did=row.driver_id;
        if(service==='payment_service'&&name==='payments'){
          row.reference_code='CAB-'+row.payment_id;
          if(row.responseSnapshot)row.responseSnapshot.reference_code=row.reference_code;
          const previous=rows(service,name).find(p=>p.trip_id===original.trip_id&&p.attempt_number===original.attempt_number-1);
          row.payloadHash=hash({tripId:row.trip_id,failedId:previous?maps.p[previous.payment_id]:null});
        }
        if(service==='notification_service'&&name==='notifications')row.content=row.type+' — '+row.related_entity_id;
        return {before:original,after:row};
      });
    }
    const prefixes={auth_service:['a','o'],driver_service:['v'],booking_service:['b','i'],trip_service:['t'],payment_service:['p'],notification_service:['n'],rating_service:['r'],customer_service:[]}[service];
    plan.services[service]={database:source[service].database,collections,counters:Object.fromEntries(prefixes.map(p=>[p,next[p]])),
      profileCounters:service==='auth_service'?{CUSTOMER:next.c,DRIVER:next.d}:undefined};
  }
  for(const p of Object.values(plan.services))for(const prefix of Object.keys(p.counters))p.counters[prefix]=next[prefix];
  plan.orphanReferences=orphanReferences;
  fs.writeFileSync(path.join(folder,'plan.private.json'),EJSON.stringify(plan,null,2),{flag:'wx',mode:0o600});
  fs.writeFileSync(path.join(folder,'id-map.private.json'),JSON.stringify(maps,null,2),{flag:'wx',mode:0o600});
  console.log(JSON.stringify({plan:'created',preservedProfileCodes:true,orphanReferences,
    services:Object.fromEntries(Object.entries(plan.services).map(([s,p])=>[s,Object.values(p.collections).reduce((n,r)=>n+r.length,0)]))}));
}
async function main(){
  const [mode,service,file]=process.argv.slice(2);
  if(mode==='plan'){makePlan(service);return;}
  assert.ok(['export','apply','verify'].includes(mode)&&services.includes(service),'Explicit migration mode/service required');
  const config=ownDatabase(service),client=new MongoClient(mongoUri(config.username,config.password));
  try{
    await client.connect();const db=client.db(config.name);
    assert.equal((await db.collection('_cab_metadata').findOne({_id:'ownership'}))?.owner,service);
    if(mode==='export'){
      assert.equal(await db.collection('outbox_events').countDocuments({publishedAt:null}),0,'Drain outbox before migration');
      const collections={};for(const c of await db.listCollections({}, {nameOnly:true}).toArray())if(!c.name.startsWith('system.'))collections[c.name]=await db.collection(c.name).find({}).toArray();
      process.stdout.write(EJSON.stringify({service,database:config.name,collections}));return;
    }
    const p=EJSON.parse(fs.readFileSync(file,'utf8')).services[service];assert.equal(p.database,config.name);
    if(mode==='apply')await client.withSession(session=>session.withTransaction(async()=>{
      for(const [name,pairs]of Object.entries(p.collections)){
        assert.equal(await db.collection(name).countDocuments({},{session}),pairs.length,'Collection changed after backup');
        for(const pair of pairs){
          const current=await db.collection(name).findOne({_id:pair.before._id},{session});
          const equal=(a,b)=>EJSON.stringify(a)===EJSON.stringify(b);
          if(equal(current,pair.after))continue;
          assert.ok(equal(current,pair.before),'Document changed after backup; refusing overwrite');
          await db.collection(name).replaceOne({_id:pair.before._id},pair.after,{session});
        }
      }
      for(const [prefix,value]of Object.entries(p.counters))await db.collection('id_counters').updateOne({_id:prefix},{$max:{value}},{upsert:true,session});
      for(const [role,value]of Object.entries(p.profileCounters||{}))await db.collection('profile_code_counters').updateOne({_id:role},{$max:{value}},{upsert:true,session});
    },{readConcern:{level:'snapshot'},writeConcern:{w:'majority'},maxCommitTimeMS:10000}));
    for(const [name,pairs]of Object.entries(p.collections)){
      assert.equal(await db.collection(name).countDocuments({}),pairs.length);
      for(const pair of pairs)assert.equal(EJSON.stringify(await db.collection(name).findOne({_id:pair.after._id})),EJSON.stringify(pair.after));
    }
    console.log(service+': '+mode+' verified; document counts and _id preserved.');
  }finally{await client.close();}
}
if(require.main===module)main().catch(()=>{console.error('Short-ID migration stopped; inspect backup/plan locally. No delete operation is used.');process.exitCode=1;});
module.exports={makePlan};
