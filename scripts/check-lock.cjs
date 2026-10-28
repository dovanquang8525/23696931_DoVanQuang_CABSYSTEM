'use strict';
const assert=require('node:assert/strict');
const pkg=require('../package.json'),lock=require('../package-lock.json');
assert.deepEqual(lock.packages[''].dependencies,pkg.dependencies,
  'package-lock.json is stale. Run npm install before Docker build (npm ci refuses a stale lock).');
for(const name of Object.keys(pkg.dependencies))assert.ok(lock.packages['node_modules/'+name],name+' missing from lockfile');
console.log('STATIC_OK: root dependencies represented in lockfile.');
