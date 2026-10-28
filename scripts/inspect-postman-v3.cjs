'use strict';
// Read-only inventory of Postman's local conversion. Never invokes a generator,
// writes collection/environment files, sends HTTP, or prints variable values.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const YAML = require('yaml');
const root = path.resolve(__dirname, '..');
const relative = p => path.relative(root,p).split(path.sep).join('/');
function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry => {
    const name = path.join(directory,entry.name);
    if (entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? files(name) : entry.isFile() ? [name] : [];
  });
}
const inventory = [...files(path.join(root,'postman')), ...files(path.join(root,'.postman'))];
const definitions = inventory.filter(p=> /(?:^|[\\/])definition\.ya?ml$/i.test(p));
const requests = inventory.filter(p=> /\.request\.ya?ml$/i.test(p));
const scripts = inventory.filter(p=> /\.(?:js|cjs|mjs)$/i.test(p));
const environments = inventory.filter(p=>relative(p).startsWith('postman/environments/'));
const legacy = inventory.filter(p=>/\.postman_collection\.json$/i.test(p) ||
  (relative(p).startsWith('postman/environments/') && /\.json$/i.test(p)));
console.log('READ_ONLY: no conversion, synchronization, HTTP, or file writes.');
console.log(JSON.stringify({counts:{files:inventory.length,definitions:definitions.length,
  requestYaml:requests.length,scriptFiles:scripts.length,environmentFiles:environments.length,
  legacyJson:legacy.length}},null,2));
const roots = new Map();
for(const request of requests) {
  let directory=path.dirname(request), candidate;
  while(directory.startsWith(path.join(root,'postman'))) {
    if(['definition.yaml','definition.yml','.resources/definition.yaml','.resources/definition.yml']
      .some(file=>fs.existsSync(path.join(directory,file)))) {
      candidate=directory;
    }
    const parent=path.dirname(directory);
    if(parent===directory) break;
    directory=parent;
  }
  const name=relative(candidate || path.dirname(request));
  roots.set(name,(roots.get(name)||0)+1);
}
console.log('COLLECTION_ROOTS '+JSON.stringify([...roots].map(([path,requestCount])=>({path,requestCount}))));
console.log('DEFINITIONS '+JSON.stringify(definitions.map(relative)));
console.log('ENVIRONMENT_PATHS '+JSON.stringify(environments.map(relative)));
console.log('LEGACY_PATHS '+JSON.stringify(legacy.map(relative)));
console.log('SCRIPT_PATH_SAMPLES '+JSON.stringify(scripts.slice(0,4).map(relative)));
const samples=[definitions[0],requests[0],environments.find(p=>/\.ya?ml$/i.test(p)),
  inventory.find(p=>relative(p)==='.postman/resources.yaml')].filter(Boolean);
function shape(value,key='',depth=0) {
  if(depth>9) return '[depth limit]';
  if(value===null) return null;
  if(Array.isArray(value)) return {arrayLength:value.length,sample:value.slice(0,2).map(v=>shape(v,key,depth+1))};
  if(typeof value==='object') {
    return Object.fromEntries(Object.entries(value).slice(0,35).map(([k,v])=>[k,shape(v,k,depth+1)]));
  }
  if(typeof value==='string') {
    if(['$schema','type','method','language','format','listen','event','key','disabled','enabled'].includes(key)) {
      return value.length<200 ? value : '[string]';
    }
    if(/^(?:src|file|path|\$ref)$/.test(key) && /^[a-zA-Z0-9_./ -]+\.(?:js|yaml|yml)$/.test(value)) return value;
    return '[string]';
  }
  if(typeof value==='boolean') return value;
  return '[number]';
}
let errors=0;
for(const file of samples) {
  try {
    const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
    const docs=YAML.parseAllDocuments(text);
    if(docs.some(d=>d.errors.length)) throw new Error('Parse error');
    console.log('SHAPE '+relative(file)+' '+JSON.stringify(docs.map(d=>shape(d.toJS()))));
  } catch {
    errors++;
    console.log('PARSE_ERROR '+relative(file)+' (contents omitted)');
  }
}
const references=[];
for(const file of inventory.filter(p=>/\.(?:yaml|yml|json|js|cjs|md)$/i.test(p))) {
  const text=fs.readFileSync(file,'utf8');
  const a=(text.match(/\bbaseUrl\b/g)||[]).length, b=(text.match(/\bbase_url\b/g)||[]).length;
  if(a||b) references.push({path:relative(file),baseUrl:a,base_url:b});
}
console.log('BASE_VARIABLE_REFERENCES '+JSON.stringify(references.slice(0,8)));
const snapshots=[...new Set([...definitions,...requests,...environments,...scripts])];
console.log('LOCAL_SNAPSHOT '+crypto.createHash('sha256').update(snapshots.sort().map(file =>
  relative(file)+':'+crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')).join('\n')).digest('hex'));
console.log('Inventory only. YAML examples parsed: '+samples.length+'; parse errors: '+errors+'. Runtime NOT_RUN.');
if(errors) process.exitCode=1;
