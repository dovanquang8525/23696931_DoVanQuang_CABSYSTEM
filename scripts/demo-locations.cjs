'use strict';
const {grpc,fail}=require('./rpc-security.cjs');
// These are declared demo fixtures, not live GPS or map routing.
const presets=Object.freeze({A:{latitude:10.8,longitude:106.7,label:'Diem A'},
  B:{latitude:10.81,longitude:106.71,label:'Diem B'}});
async function provisionLocations(db,service){
  const names=['booking_service','driver_service','trip_service'].includes(service)?['A','B']:[];
  for(const name of names)await db.collection('demo_locations').updateOne({_id:name},
    {$setOnInsert:{...presets[name],createdAt:new Date()}},{upsert:true});
}
async function readLocation(db,name){
  if(typeof name!=='string'||! /^[A-Z][A-Z0-9]{0,15}$/.test(name))
    fail(grpc.status.INVALID_ARGUMENT,'INVALID_INPUT','Invalid location code.');
  const row=await db.collection('demo_locations').findOne({_id:name});
  if(!row)fail(grpc.status.INVALID_ARGUMENT,'INVALID_INPUT','Location code does not exist.');
  if(!Number.isFinite(row.latitude)||Math.abs(row.latitude)>90||!Number.isFinite(row.longitude)||Math.abs(row.longitude)>180)
    fail(grpc.status.UNAVAILABLE,'DEPENDENCY_UNAVAILABLE','Demo location is unavailable.');
  return {latitude:row.latitude,longitude:row.longitude};
}
module.exports={presets,provisionLocations,readLocation};
