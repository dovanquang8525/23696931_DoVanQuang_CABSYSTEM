'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const argon2=require('argon2');
const {ObjectId}=require('mongodb');
const {repairSeedAdmin,accountId}=require('./seed.cjs');
const {argonOptions}=require('../services/auth_service/application.cjs');
async function legacyAdmin(){
  return {_id:new ObjectId(accountId(0)),seedTag:'cab-demo-v1',role:'ADMIN',status:'ACTIVE',
    phone:'0909000000',passwordHash:await argon2.hash('old-admin-password',argonOptions)};
}
test('explicit repair migrates legacy Admin email and password without changing identity',async()=>{
  const row=await legacyAdmin();let change;
  assert.equal(await repairSeedAdmin({async updateOne(filter,update){change={filter,update};return {matchedCount:1};}},row,'quang123'),true);
  assert.deepEqual(change.filter._id,row._id);
  assert.equal(change.filter.passwordHash,row.passwordHash);
  assert.deepEqual(change.filter.email,{$exists:false});
  assert.equal(change.update.$set.email,'admin@cab.local');
  assert.equal(await argon2.verify(change.update.$set.passwordHash,'quang123'),true);
  assert.deepEqual(Object.keys(change.update.$set).sort(),['email','passwordHash','updatedAt']);
});
test('matching seeded Admin is left unchanged',async()=>{
  const row=await legacyAdmin();row.email='admin@cab.local';
  assert.equal(await repairSeedAdmin({async updateOne(){assert.fail('Unexpected write');}},row,'old-admin-password'),false);
});
test('repair refuses non-seed, non-admin, disabled or renamed accounts',async()=>{
  const row=await legacyAdmin();
  for(const fields of [{seedTag:'other'},{_id:new ObjectId()},{role:'CUSTOMER'},
    {status:'DISABLED'},{email:'other@example.test'},{phone:'0909000001'}]){
    await assert.rejects(repairSeedAdmin({async updateOne(){assert.fail('Unexpected write');}},
      {...row,...fields},'quang123'),/identity differs/);
  }
});
test('repair detects a concurrent account update',async()=>{
  await assert.rejects(repairSeedAdmin({async updateOne(){return {matchedCount:0};}},
    await legacyAdmin(),'quang123'),/changed during repair/);
});
