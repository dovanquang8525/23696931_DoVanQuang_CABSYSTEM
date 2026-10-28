'use strict';
const {createClient}=require('redis');
const {required,port}=require('./runtime-config.cjs');
async function main(){
  const mode=process.argv[2];
  if(!['--preview','--execute'].includes(mode)||process.env.NODE_ENV!=='development')throw new Error('Explicit local reset mode required');
  const client=createClient({socket:{host:required('REDIS_HOST'),port:port('REDIS_PORT',6379),connectTimeout:3000,reconnectStrategy:false},
    password:required('REDIS_PASSWORD'),database:Number(process.env.REDIS_DATABASE||0)});
  client.on('error',()=>{});let count=0;
  try{
    await client.connect();
    for await(const key of client.scanIterator({MATCH:'cab:rate:*',COUNT:100})){
      if(typeof key!=='string'||!key.startsWith('cab:rate:'))throw new Error('Key outside reset scope');
      count+=mode==='--execute'?await client.del(key):1;
    }
    console.log('CAB rate counters: '+count+'; '+(mode==='--preview'?'PREVIEW_ONLY':'deleted'));
  }finally{if(client.isOpen)await client.quit();}
}
void main().catch(()=>{console.error('CAB rate reset refused/failed; Redis data outside cab:rate:* was not targeted.');process.exitCode=1;});
