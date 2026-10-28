'use strict';
const amqp=require('amqplib');
const {rabbitConfig}=require('./runtime-config.cjs');
const topology=require('../docs/events/topology.json');
async function main(){
  const mode=process.argv[2];
  if(!['--preview','--execute'].includes(mode)||process.env.NODE_ENV!=='development')throw new Error('Explicit local reset mode required');
  // Empty retry queues before destinations so TTL redelivery cannot refill a queue already purged.
  const names=topology.queues.flatMap(q=>[...q.retryDelaysSeconds.map(n=>q.name+'.retry.'+n+'s'),q.name,q.deadLetterQueue]);
  const connection=await amqp.connect(rabbitConfig());connection.on('error',()=>{});
  try{
    const channel=await connection.createChannel();
    const rows=[];
    for(const name of names){const row=await channel.checkQueue(name);rows.push(row);}
    if(mode==='--execute'&&rows.some(row=>row.consumerCount!==0))throw new Error('Stop all CAB consumers before purging');
    for(const row of rows){
      if(mode==='--execute'){const purged=await channel.purgeQueue(row.queue);console.log(row.queue+': purged '+purged.messageCount);}
      else console.log(row.queue+': PREVIEW messages='+row.messageCount+' consumers='+row.consumerCount);
    }
    await channel.close();
  }finally{await connection.close();}
}
void main().catch(()=>{console.error('CAB queue reset refused/failed. Check consumer shutdown and configured vhost; no exchange or queue was deleted.');process.exitCode=1;});
