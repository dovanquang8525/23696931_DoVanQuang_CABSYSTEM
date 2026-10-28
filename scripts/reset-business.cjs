'use strict';
// Explicit local maintenance command; never called by startup/seed.
const {MongoClient}=require('mongodb');
const {services,ownDatabase,mongoUri}=require('./runtime-config.cjs');
async function main(){
  const [service,mode]=process.argv.slice(2);
  if(!services.includes(service)||!['--preview','--execute'].includes(mode))throw new Error('Invalid maintenance arguments');
  if(process.env.NODE_ENV!=='development')throw new Error('Reset is local development only');
  const config=ownDatabase(service);
  if(['admin','config','local'].includes(config.name))throw new Error('System database is outside reset scope');
  const client=new MongoClient(mongoUri(config.username,config.password),{serverSelectionTimeoutMS:5000});
  try{
    await client.connect();const db=client.db(config.name);
    const owner=await db.collection('_cab_metadata').findOne({_id:'ownership'});
    if(owner?.owner!==service)throw new Error('Database owner does not match service');
    const collections=(await db.listCollections({}, {nameOnly:true}).toArray()).filter(c=>c.name!=='_cab_metadata'&&!c.name.startsWith('system.'));
    for(const entry of collections){
      const collection=db.collection(entry.name);
      if(mode==='--preview')console.log(JSON.stringify({service,database:config.name,collection:entry.name,documents:await collection.countDocuments({}),action:'PREVIEW_ONLY'}));
      else console.log(JSON.stringify({service,database:config.name,collection:entry.name,deleted:(await collection.deleteMany({})).deletedCount}));
    }
    console.log(service+': '+(mode==='--preview'?'preview only; nothing deleted.':'business documents removed; ownership, users and indexes preserved.'));
  }finally{await client.close();}
}
void main().catch(()=>{console.error('Business reset refused/failed; check development mode, owner metadata and dependencies. No secret printed.');process.exitCode=1;});
