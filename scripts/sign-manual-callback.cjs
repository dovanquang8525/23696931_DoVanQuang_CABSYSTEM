'use strict';
// Offline calculator only. All request values come from manually supplied arguments.
// Never sends HTTP, generates IDs/timestamps, or modifies a Postman environment.
const crypto=require('node:crypto');
function main(){
  const args=process.argv.slice(2);
  if(args.length!==2)throw new Error('Usage: node --env-file=.env scripts/sign-manual-callback.cjs TIMESTAMP RAW_JSON');
  const [timestamp,raw]=args;
  if(!/^(0|[1-9][0-9]{0,9})$/.test(timestamp))throw new Error('Timestamp must be decimal Unix seconds');
  let body;
  try{body=JSON.parse(raw);}catch{throw new Error('RAW_JSON must be valid JSON');}
  if(!body||body.timestamp!==Number(timestamp))throw new Error('Body timestamp must equal the supplied header timestamp');
  const secret=process.env.MOCK_CALLBACK_SECRET;
  if(!secret||Buffer.byteLength(secret,'utf8')<32)throw new Error('Load the local MOCK_CALLBACK_SECRET through --env-file=.env');
  const signature=crypto.createHmac('sha256',secret).update(timestamp+'\n','ascii').update(raw,'utf8').digest('hex');
  console.log('X-Mock-Timestamp: '+timestamp);
  console.log('X-Mock-Signature: sha256='+signature);
  console.log('Offline calculation only: enter the exact RAW_JSON bytes in Postman and send manually.');
}
if(require.main===module){try{main();}catch(error){console.error(error.message);process.exitCode=1;}}
