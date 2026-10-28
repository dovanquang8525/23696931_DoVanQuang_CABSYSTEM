'use strict';
const assert=require('node:assert/strict');
const {MongoClient}=require('mongodb');
const {ownDatabase,mongoUri}=require('./runtime-config.cjs');
const {decrypt}=require('./driver-crypto.cjs');
async function main(){
  const service=process.argv[2],config=ownDatabase(service),client=new MongoClient(mongoUri(config.username,config.password));
  try{
    await client.connect();const db=client.db(config.name);
    if(service==='auth_service'){
      const rows=await db.collection('accounts').find({}).limit(100).toArray();assert.ok(rows.length>0);
      for(const row of rows){assert.match(row.passwordHash,/^\$argon2id\$/);assert.equal(row.password,undefined);}
    }else if(service==='driver_service'){
      const rows=await db.collection('driver_profiles').find({licenseNumberEncrypted:{$exists:true}}).limit(100).toArray();assert.ok(rows.length>0);
      for(const row of rows){assert.equal(row.licenseNumber,undefined);assert.equal(row.license_number,undefined);
        assert.ok(row.licenseNumberEncrypted);assert.ok(decrypt(row.licenseNumberEncrypted).length>0);}
    }else throw new Error('Choose auth_service or driver_service');
    console.log('RUNTIME_VERIFIED: '+service+' sensitive-field sample checked (up to 100 records); no sensitive values printed. This does not prove full-disk encryption.');
  }finally{await client.close();}
}
void main().catch(()=>{console.error('Storage verification failed.');process.exitCode=1;});
