'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const YAML=require('yaml');
const io=require('./postman-format.cjs');
function fixture(work) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'cab-postman-v3-'));
  try { return work(directory); }
  finally {
    const resolved=path.resolve(directory);
    assert.ok(resolved.startsWith(path.resolve(os.tmpdir())+path.sep));
    assert.ok(path.basename(resolved).startsWith('cab-postman-v3-'));
    fs.rmSync(resolved,{recursive:true,force:true});
  }
}
function put(directory,file,data) {
  const target=path.join(directory,file);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,YAML.stringify(data));
}
test('v3 order, scripts, auth and raw callback bytes survive the read-only adapter',()=>fixture(directory=>{
  put(directory,'.resources/definition.yaml',{$kind:'collection',variables:{baseUrl:'http://localhost:3000'}});
  put(directory,'Z first.request.yaml',{$kind:'http-request',method:'POST',url:'{{baseUrl}}/api/v1/payments/mock/callback',
    body:{type:'json',content:'{{callback_payload}}'},order:1,
    auth:{type:'bearer',credentials:{token:'{{customer_token}}'}},
    scripts:[{type:'afterResponse',language:'text/javascript',code:"pm.test('strict',()=>pm.response.to.have.status(200));"}]});
  put(directory,'A later.request.yaml',{$kind:'http-request',method:'GET',url:'{{baseUrl}}/health',order:2,
    queryParams:{page:{value:'1',disabled:true}}});
  const before=io.artifactHash(directory);
  const collection=io.loadCollection(directory);
  assert.equal(collection.item[0].name,'Z first');
  assert.equal(collection.item[0].request.body.raw,'{{callback_payload}}');
  assert.equal(collection.item[0].event[0].listen,'test');
  assert.match(collection.item[0].event[0].script.exec.join('\n'),/have.status\(200\)/);
  assert.equal(collection.item[0].request.auth.bearer[0].value,'{{customer_token}}');
  assert.equal(collection.item[1].request.url.query[0].disabled,true);
  assert.equal(io.artifactHash(directory),before);
}));
test('adapter rejects ambiguous ordering instead of inventing execution order',()=>fixture(directory=>{
  for(const name of ['A','B']) put(directory,name+'.request.yaml',
    {$kind:'http-request',method:'GET',url:'{{baseUrl}}/health',order:1});
  assert.throws(()=>io.loadCollection(directory),/Duplicate v3 order/);
}));
test('unsupported scripts and body formats are rejected instead of silently discarded',()=>fixture(directory=>{
  put(directory,'A.request.yaml',{$kind:'http-request',method:'GET',url:'{{baseUrl}}/health',order:1,
    scripts:[{type:'unknown',code:'pm.test("must not disappear",()=>{});'}]});
  assert.throws(()=>io.loadCollection(directory),/Unsupported Postman script/);
  put(directory,'A.request.yaml',{$kind:'http-request',method:'POST',url:'{{baseUrl}}/api/v1/bookings',order:1,
    body:{type:'unsupported',content:'raw'}});
  assert.throws(()=>io.loadCollection(directory),/Unsupported request body/);
}));
test('YAML environment preserves session data and rejects duplicate variable names',()=>fixture(directory=>{
  const file='local.environment.yaml';
  put(directory,file,{name:'synthetic',values:[{key:'baseUrl',value:'http://localhost:3000'},
    {key:'booking_snapshot',value:'{"status":"SEARCHING"}'},{key:'customer_token',value:'synthetic'}]});
  const env=io.loadEnvironment(path.join(directory,file));
  assert.equal(env.values[1].value,'{"status":"SEARCHING"}');
  put(directory,file,{name:'synthetic',values:[{key:'baseUrl',value:'A'},{key:'baseUrl',value:'B'}]});
  assert.throws(()=>io.loadEnvironment(path.join(directory,file)),/duplicate environment keys/);
}));
