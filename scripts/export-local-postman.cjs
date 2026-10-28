'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..'),password=process.env.SEED_PASSWORD;
if(require('../postman/documents/api-source-manifest.json').identityV2Migration?.status==='OUTDATED_COLLECTIONS'){
  console.error('OUTDATED: v1 environment exporter is retained for reference. Identity v2 acceptance uses manually entered requests in docs/MANUAL_POSTMAN_30.md.');
  process.exit(1);
}
if(!password)throw new Error('Load local .env before exporting');
const env=JSON.parse(fs.readFileSync(path.join(root,'postman/environments/CAB-Local.postman_environment copy.json'),'utf8'));
const values={base_url:process.env.CAB_BASE_URL||'http://localhost:3000',baseUrl:process.env.CAB_BASE_URL||'http://localhost:3000',
  admin_phone:'0909000000',customer_phone:'0909000001',customer2_phone:'0909000002',driver_phone:'0909000011',
  admin_password:password,customer_password:password,customer2_password:password,driver_password:password,
  new_customer_phone:'0'+crypto.randomInt(100000000,1000000000),new_customer_password:'Demo-'+crypto.randomBytes(10).toString('hex'),
  onboarding_phone:'0'+crypto.randomInt(100000000,1000000000),onboarding_password:'Demo-'+crypto.randomBytes(10).toString('hex')};
if(process.argv[2])Object.assign(values,JSON.parse(fs.readFileSync(path.resolve(process.argv[2]),'utf8')));
// Secrets/token fields are local only. Never include MOCK_CALLBACK_SECRET in a Postman environment.
for(const key of Object.keys(values)){
  if(key==='MOCK_CALLBACK_SECRET'||key.toLowerCase().includes('secret'))throw new Error('Refusing secret export');
  const existing=env.values.find(v=>v.key===key);if(existing)existing.value=values[key];
  else env.values.push({key,value:values[key],enabled:true});
}
env.name='CAB local seed '+new Date().toISOString();
const folder=path.join(root,'.local');fs.mkdirSync(folder,{recursive:true});
const target=path.join(folder,'seed-'+Date.now()+'.postman_environment.json');
fs.writeFileSync(target,JSON.stringify(env,null,2),{flag:'wx',mode:0o600});
console.log('Local Postman environment: '+path.relative(root,target));
