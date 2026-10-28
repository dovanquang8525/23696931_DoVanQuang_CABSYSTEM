'use strict';
// Each service allocates its own public IDs atomically in its own database.
async function allocateId(db,prefix,session){
  if(!['a','b','t','p','n','r','v','i','o'].includes(prefix))throw new Error('Unknown public ID prefix');
  const row=await db.collection('id_counters').findOneAndUpdate({_id:prefix},{$inc:{value:1}},
    {upsert:true,session,returnDocument:'after'});
  if(!Number.isSafeInteger(row.value)||row.value<1)throw new Error('Invalid ID counter');
  const value=prefix+String(row.value).padStart(2,'0');
  if(value.length>16)throw new Error('Public ID space exhausted');
  return value;
}
module.exports={allocateId};
