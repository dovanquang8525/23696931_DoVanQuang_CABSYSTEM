'use strict';
// Allocation lives in Auth's own transaction, never in process memory.
async function allocateProfileCode(db,role,session){
  if(!['CUSTOMER','DRIVER'].includes(role))throw new Error('Unsupported profile code type');
  const prefix=role==='CUSTOMER'?'c':'d',field=role==='CUSTOMER'?'cid':'did';
  for(let attempt=0;attempt<1000;attempt++){
    const counter=await db.collection('profile_code_counters').findOneAndUpdate({_id:role},{$inc:{value:1}},
      {upsert:true,session,returnDocument:'after'});
    if(!Number.isSafeInteger(counter.value)||counter.value<1)throw new Error('Invalid profile code counter');
    const code=prefix+String(counter.value).padStart(2,'0');
    if(code.length>16)throw new Error('Profile code space exhausted');
    if(!await db.collection('accounts').findOne({[field]:code},{session,projection:{_id:1}}))return {field,code};
  }
  throw new Error('Profile code allocation requires maintenance');
}
module.exports={allocateProfileCode};
