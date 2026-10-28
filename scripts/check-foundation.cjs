'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const YAML = require('yaml');
const {services} = require('./runtime-config.cjs');
const root = path.resolve(__dirname, '..');
const compose = YAML.parse(fs.readFileSync(path.join(root, 'compose.yaml'), 'utf8'), {merge: true});
assert.deepEqual(Object.keys(compose.services).filter(name => name.endsWith('_service')).sort(), [...services].sort());
const secretKeys = services.map(s => s.replace('_service', '').toUpperCase() + '_MONGODB_PASSWORD');
for (const service of services) {
  const config = compose.services[service];
  assert.equal(config.ports, undefined, 'Do not expose gRPC: ' + service);
  const owned = service.replace('_service', '').toUpperCase() + '_MONGODB_PASSWORD';
  assert.ok(owned in config.environment);
  for (const key of secretKeys.filter(k => k !== owned)) assert.equal(key in config.environment, false);
}
assert.equal(compose.services.gateway.environment.MONGODB_ROOT_PASSWORD, undefined);
assert.ok(compose.services.mongo.volumes.includes('mongo-data:/data/db'));
const topology = JSON.parse(fs.readFileSync(path.join(root, 'docs/events/topology.json'), 'utf8'));
assert.equal(topology.exchange.name, 'cab.events');
assert.equal(topology.queues.length, 4);
for (const queue of topology.queues) {
  assert.deepEqual(queue.retryDelaysSeconds, [1, 5, 15]);
  assert.equal(queue.maxRetriesAfterInitial, 3);
}
function checkSyntax(dir) {
  for (const item of fs.readdirSync(dir, {withFileTypes: true})) {
    const target = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'node_modules') checkSyntax(target);
    else if (item.isFile() && item.name.endsWith('.cjs')) {
      const result = spawnSync(process.execPath, ['--check', target], {encoding: 'utf8'});
      assert.equal(result.status, 0, result.stderr);
    }
  }
}
for (const folder of ['gateway', 'services', 'scripts']) checkSyntax(path.join(root, folder));
console.log('STATIC_OK: JS syntax, eight services, unpublished gRPC, scoped DB secrets and contract topology.');
console.log('This does not establish Docker, REST, business gRPC or event runtime PASS.');
