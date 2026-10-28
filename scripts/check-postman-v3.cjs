'use strict';
// Offline validation of native v3 artifacts. Never invokes sync_postman.py or HTTP.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const io=require('./postman-format.cjs');
const {root,read,loadCollection,loadEnvironment,flatten,artifactHash}=io;
const manifestPath=path.join(root,'postman/documents/api-source-manifest.json');
const initial=fs.readFileSync(manifestPath,'utf8'), manifest=JSON.parse(initial);
if(manifest.identityV2Migration?.status==='OUTDATED_COLLECTIONS'){
  console.error('OUTDATED: preserved v3 collections target identity v1. Current email/cid/did/name contract is in docs/api; manual acceptance is docs/MANUAL_POSTMAN_30.md. Do not rebaseline old requests as v2 tests.');
  process.exit(1);
}
const originalSnapshot='7e3fedd32997c70a571219ac18bca01d9ad0e54ba893a43e67e2af3f86eb04e8';
function allFiles(dir) {
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if(entry.isSymbolicLink()) throw new Error('Symlink inside Postman artifacts');
    const file=path.join(dir,entry.name);
    return entry.isDirectory()?allFiles(file):entry.isFile()?[file]:[];
  });
}
function snapshot() {
  const selected=allFiles(path.join(root,'postman')).filter(file=>
    /(?:^|[\\/])definition\.ya?ml$|\.request\.ya?ml$|\.(?:js|cjs|mjs)$/i.test(file) ||
    path.relative(root,file).split(path.sep).join('/').startsWith('postman/environments/'));
  return crypto.createHash('sha256').update(selected.sort().map(file=>
    path.relative(root,file).split(path.sep).join('/')+':'+
    crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')).join('\n')).digest('hex');
}
function stable(value) {
  if(Array.isArray(value)) return value.map(stable);
  if(value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
  return value;
}
function same(left,right,context) {
  if(JSON.stringify(stable(left))!==JSON.stringify(stable(right))) throw new Error(context+' differs; converted assets were not modified by this checker.');
}
const rawUrl=request=>typeof request.url==='string'?request.url:request.url.raw;
const norm=name=>name.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const scriptCode=event=>(Array.isArray(event.script.exec)?event.script.exec.join('\n'):event.script.exec)
  .replace(/\r\n/g,'\n').replace(/\n$/,'');
function keyValues(values) {
  return io.pairs(values).map(entry=>({key:String(entry.key).toLowerCase(),value:entry.value??'',
    disabled:entry.disabled===true})).sort((a,b)=>a.key.localeCompare(b.key));
}
function auth(value) {
  if(!value || value.type==='inherit') return {type:'inherit'};
  return {type:value.type,values:keyValues(value[value.type]||[])};
}
function body(request) {
  if(!request.body || request.body.mode==='none') return undefined;
  if(request.body.mode!=='raw') return request.body;
  const raw=request.body.raw;
  if(!rawUrl(request).includes('/payments/mock/callback')) {
    try {return {json:JSON.parse(raw)};} catch {}
  }
  return {raw};
}
function walk(items, parents=[]) {
  return items.flatMap(item=>item.item?walk(item.item,[...parents,norm(item.name)]):[
    {item,key:[...parents,norm(item.name)].join('/')}]);
}
function compareBaseline(collection, oldPath, label) {
  const result=spawnSync('git',['show','02c4da26403934e3f1826d269742f63eba645529:'+oldPath],
    {cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
  if(result.status!==0) throw new Error('Cannot read pre-v3 Git baseline for '+label+'; preservation comparison NOT_RUN.');
  const baseline=JSON.parse(result.stdout);
  const before=walk(baseline.item), after=walk(collection.item);
  same(before.map(e=>e.key),after.map(e=>e.key),label+' request/folder order');
  for(let index=0;index<before.length;index++) {
    const a=before[index].item,b=after[index].item, name=label+'/'+b.name;
    same(a.request.method,b.request.method,name+' method');
    same(rawUrl(a.request).split('?')[0],rawUrl(b.request).split('?')[0],name+' URL');
    const beforeQuery=typeof a.request.url==='object'?a.request.url.query:io.readQuery(rawUrl(a.request));
    same(keyValues(beforeQuery),keyValues(b.request.url.query),name+' query/disabled flags');
    same(keyValues(a.request.header),keyValues(b.request.header),name+' headers/disabled flags');
    same(auth(a.request.auth),auth(b.request.auth),name+' auth');
    same(body(a.request),body(b.request),name+' body/callback bytes');
    same((a.event||[]).map(e=>({listen:e.listen,code:scriptCode(e)})),
      (b.event||[]).map(e=>({listen:e.listen,code:scriptCode(e)})),name+' scripts/assertions/control flow');
  }
  // Root/folder scripts and auth affect execution even when each request is intact.
  function metadata(node) {
    return {events:(node.event||[]).map(e=>({listen:e.listen,code:scriptCode(e)})),
      auth:auth(node.auth),children:(node.item||[]).filter(i=>i.item).map(metadata)};
  }
  same(metadata(baseline),metadata(collection),label+' inherited scripts/auth');
  console.log('STATIC_OK preservation '+label+': '+before.length+' requests, order, scripts, auth and bodies.');
}
function verifyArtifacts(list) {
  for(const artifact of list) {
    if(!artifact.sha256) throw new Error('Unrecorded artifact hash: '+artifact.path+'; use --record-manifest after review.');
    assert.equal(artifactHash(artifact.path),artifact.sha256,'Artifact hash differs: '+artifact.path);
  }
}
function run() {
  assert.ok(process.argv.slice(2).every(value=>value==='--record-manifest'),'Unsupported argument');
  const beforeSnapshot=snapshot();
  assert.equal(beforeSnapshot,originalSnapshot,
    'Converted collection/environment bytes changed since user inventory. Review that diff; do not blindly rebaseline.');
  for(const item of manifest.sources) assert.equal(artifactHash(item.path),item.sha256,'OpenAPI source changed: '+item.path);
  verifyArtifacts([...manifest.contracts,...manifest.phase6Documents]);
  const metadata=read(path.join(root,'.postman/resources.yaml'));
  assert.equal(metadata.localResources.specs.length,10);
  for(const ref of metadata.localResources.specs) assert.ok(fs.existsSync(path.resolve(root,'.postman',ref)));
  for(const ref of Object.keys(metadata.cloudResources?.collections||{})) {
    assert.ok(fs.existsSync(path.resolve(root,'.postman',ref)),'Stale cloud collection path');
  }
  let scripts=0, requests=0;
  const jobs=[['primary',142],['compatibility',78],['identity',15]];
  for(const [group,count] of jobs) {
    const entry=manifest[group], collection=loadCollection(entry.collection.path);
    const items=flatten(collection.item);
    assert.equal(items.length,count,group+' request count');
    if(entry.environment) loadEnvironment(entry.environment.path);
    const allIds=new Set(items.flatMap(item=>[item.id,item.name,path.basename(item._file||'')]));
    function inspect(node) {
      for(const event of node.event||[]) {
        new vm.Script(scriptCode(event),{filename:node.name+'/'+event.listen}); scripts++;
        for(const target of scriptCode(event).matchAll(/setNextRequest\(['"]([^'"]+)['"]\)/g)) {
          assert.ok(allIds.has(target[1]),group+' unresolved control-flow target in '+node.name);
        }
      }
      for(const child of node.item||[]) inspect(child);
    }
    inspect(collection);
    const bases=new Set();
    for(const item of items) {
      const match=rawUrl(item.request).match(/^\{\{(baseUrl|base_url)\}\}/);
      assert.ok(match,group+' request does not use a Gateway base variable: '+item.name);
      bases.add(match[1]); requests++;
      if(/\/payments\/mock\/callback/.test(rawUrl(item.request)) &&
          group==='primary' && item.name!=='Invalid mock signature always rejected') {
        assert.equal(item.request.body.raw,'{{callback_payload}}','Signed callback bytes changed');
      }
    }
    console.log(group+': '+items.length+' requests; base variables='+[...bases].join(',')+'; assets unchanged.');
    if(group==='primary') compareBaseline(collection,'postman/collections/CAB-MVP.postman_collection.json','MVP');
    if(group==='compatibility') compareBaseline(collection,'postman/collections/CAB-System.postman_collection.json','catalog');
  }
  assert.equal(requests,235);
  const converted=jobs.flatMap(([group])=>[
    manifest[group].collection,...(manifest[group].environment?[manifest[group].environment]:[])]);
  if(process.argv.includes('--record-manifest')) {
    assert.equal(fs.readFileSync(manifestPath,'utf8'),initial,'Manifest changed during checks; refusing write');
    for(const item of converted) {
      item.sha256=artifactHash(item.path);
      item.integrityStatus='STATIC_OK';
    }
    manifest.migration={...(manifest.migration||{}),verifiedSnapshot:beforeSnapshot,
      preservationStatus:'STATIC_OK',runtimeStatus:'NOT_RUN'};
    fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    console.log('Recorded reviewed artifact hashes in manifest only; no collection/environment writes.');
  } else verifyArtifacts(converted);
  assert.equal(snapshot(),beforeSnapshot,'Checker modified collection/environment assets');
  console.log('STATIC_OK: '+requests+' requests; '+scripts+' scripts parsed. Postman/HTTP runtime NOT_RUN.');
}
try {run();} catch(error) {
  console.error('CHECK_FAILED: '+error.message);
  console.error('No generator or HTTP executed. Review the named artifact; do not change expected assertions to hide the difference.');
  process.exitCode=1;
}
