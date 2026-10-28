'use strict';
// Read-only adapter: native Postman v3 YAML -> the v2-shaped in-memory view
// expected by existing regression checks. Never generates collection files.
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const root = path.resolve(__dirname,'..');
function read(file) {
  try {
    const document=YAML.parseDocument(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''),{uniqueKeys:true});
    if(document.errors.length) throw new Error();
    return document.toJS();
  } catch { throw new Error('Cannot parse Postman artifact: '+path.relative(root,file)); }
}
function pairs(value) {
  if(value===undefined || value===null) return [];
  if(Array.isArray(value)) return value.map(entry=>({...entry}));
  if(typeof value!=='object') throw new Error('Unsupported key/value structure');
  return Object.entries(value).map(([key,entry])=> typeof entry==='object' && entry!==null
    ? {key,...entry} : {key,value:entry});
}
function events(scripts=[]) {
  if(!Array.isArray(scripts)) throw new Error('Unsupported scripts structure');
  return scripts.map(script=>{
    const listen={beforeRequest:'prerequest',afterResponse:'test'}[script.type];
    if(!listen || typeof script.code!=='string') throw new Error('Unsupported Postman script; refusing to omit it');
    return {listen,script:{type:script.language||'text/javascript',exec:script.code.split(/\r?\n/)}};
  });
}
function auth(value) {
  if(!value) return undefined;
  if(value.type==='noauth'||value.type==='inherit') return {type:value.type};
  if(!['bearer','basic','apikey'].includes(value.type)) throw new Error('Unsupported auth type; review adapter');
  return {type:value.type,[value.type]:pairs(value.credentials||value[value.type]||
    Object.fromEntries(Object.entries(value).filter(([key])=>!['type','id','name','description'].includes(key))))};
}
function definition(directory) {
  for(const file of ['.resources/definition.yaml','.resources/definition.yml','definition.yaml','definition.yml']) {
    const absolute=path.join(directory,file);
    if(fs.existsSync(absolute)) return {value:read(absolute),file:absolute};
  }
  return {value:{},file:null};
}
function queryEntries(raw, explicit) {
  if(explicit!==undefined) return pairs(explicit);
  const query=raw.split('?')[1];
  if(!query) return [];
  return query.split('&').map(segment=>{
    const at=segment.indexOf('=');
    return {key:at<0?segment:segment.slice(0,at),value:at<0?'':segment.slice(at+1)};
  });
}
function requestDocument(document,file) {
  if(document.$kind!=='http-request' || typeof document.url!=='string') {
    throw new Error('Unsupported request kind: '+path.relative(root,file));
  }
  const request={method:document.method,url:{raw:document.url,query:queryEntries(document.url,document.queryParams)},
    header:pairs(document.headers),...(document.description?{description:document.description}:{}),
    ...(document.auth?{auth:auth(document.auth)}:{})};
  if(document.body && document.body.type!=='none') {
    if(!['json','text','raw','xml','html','javascript'].includes(document.body.type) ||
        typeof document.body.content!=='string') throw new Error('Unsupported request body: '+path.relative(root,file));
    request.body={mode:'raw',raw:document.body.content};
  }
  return {id:document.id||path.relative(root,file).split(path.sep).join('/'),
    name:document.name||path.basename(file).replace(/\.request\.ya?ml$/i,''),
    request,event:events(document.scripts),_file:file,_order:document.order};
}
function loadCollection(file) {
  const absolute=path.resolve(root,file);
  if(fs.statSync(absolute).isFile()) {
    const data=read(absolute);
    if(!Array.isArray(data.item)) throw new Error('Expected v2 JSON collection or v3 collection directory');
    return data;
  }
  const scan=directory=>{
    const meta=definition(directory).value;
    const items=[];
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
      if(entry.isSymbolicLink()) throw new Error('Symlink is not allowed inside a collection');
      if(entry.name==='.resources'||entry.name.endsWith('.resources')) continue;
      const child=path.join(directory,entry.name);
      if(entry.isDirectory()) {
        const folder=scan(child);
        if(folder.item.length) items.push(folder);
      } else if(/\.request\.ya?ml$/i.test(entry.name)) {
        items.push(requestDocument(read(child),child));
      }
    }
    const meaningful=items.length>1;
    if(meaningful && items.some(item=>typeof item._order!=='number'||!Number.isFinite(item._order))) {
      throw new Error('Missing numeric v3 order: '+path.relative(root,directory));
    }
    const seen=new Set();
    for(const item of items) {
      if(seen.has(item._order)) throw new Error('Duplicate v3 order: '+path.relative(root,directory));
      seen.add(item._order);
    }
    items.sort((a,b)=>a._order-b._order);
    return {id:meta.id||path.relative(root,directory).split(path.sep).join('/'),
      name:meta.name||path.basename(directory),item:items,event:events(meta.scripts),
      ...(meta.auth?{auth:auth(meta.auth)}:{}),variable:pairs(meta.variables),_order:meta.order,_file:directory};
  };
  const result=scan(absolute);
  result.info={name:result.name,schema:'https://schema.getpostman.com/json/collection/v3.0.0/'};
  return result;
}
function loadEnvironment(file) {
  const result=read(path.resolve(root,file));
  if(!result || !Array.isArray(result.values)) throw new Error('Environment must contain a values list');
  const keys=result.values.map(entry=>entry.key);
  if(keys.some(key=>typeof key!=='string')||new Set(keys).size!==keys.length) {
    throw new Error('Invalid or duplicate environment keys');
  }
  return result;
}
function flatten(items) {return items.flatMap(item=>item.item?flatten(item.item):[item]);}
function artifactHash(file) {
  const crypto=require('node:crypto');
  const absolute=path.resolve(root,file);
  if(fs.statSync(absolute).isFile()) return crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
  const entries=[];
  function visit(directory) {
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
      const target=path.join(directory,entry.name);
      if(entry.isSymbolicLink()) throw new Error('Symlink in artifact');
      if(entry.isDirectory()) visit(target);
      else if(entry.isFile()) entries.push(path.relative(absolute,target).split(path.sep).join('/')+':'+
        crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'));
    }
  }
  visit(absolute);
  return crypto.createHash('sha256').update(entries.sort().join('\n')).digest('hex');
}
function resolveLegacy(file) {
  const aliases={
    'postman/collections/CAB-MVP.postman_collection.json':'postman/collections/CAB MVP — Phase 6 Testing',
    'postman/collections/CAB-System.postman_collection.json':'postman/collections/CAB System - Gateway REST (docs-api)',
    'postman/collections/CAB-Identity.postman_collection.json':'postman/collections/CAB Identity — Auth Customer smoke',
    'postman/environments/CAB-Local.postman_environment.json':'postman/environments/CAB - Local Gateway (template).environment.yaml'
  };
  return fs.existsSync(path.resolve(root,file))?file:aliases[file]||file;
}
module.exports={read,pairs,events,auth,definition,loadCollection,loadEnvironment,flatten,artifactHash,resolveLegacy,root,
  readQuery: raw=>queryEntries(raw)};
if(require.main===module) {
  try {
    const [mode,file]=process.argv.slice(2);
    let result;
    if(mode==='collection') result=loadCollection(resolveLegacy(file));
    else if(mode==='environment') result=loadEnvironment(resolveLegacy(file));
    else if(mode==='hash') result=artifactHash(resolveLegacy(file));
    else if(mode==='yaml') {
      let input=''; process.stdin.setEncoding('utf8');
      process.stdin.on('data',chunk=>{input+=chunk;});
      process.stdin.on('end',()=>{try { process.stdout.write(YAML.stringify(JSON.parse(input))); }
        catch {console.error('Environment serialization refused');process.exitCode=1;}});
      return;
    } else throw new Error('Unsupported adapter mode');
    process.stdout.write(JSON.stringify(result));
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
