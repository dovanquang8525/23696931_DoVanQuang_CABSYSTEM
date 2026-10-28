// Offline sandbox regression checks. No requests are sent to a server.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'postman/documents/api-source-manifest.json'), 'utf8'));
if (manifest.current) {
  const routing = require('../gateway/identity-routes.cjs');
  const io = require('./postman-format.cjs');
  const collection = io.loadCollection(manifest.current.collection);
  const environment = io.loadEnvironment(manifest.current.environment);
  const values = new Map(environment.values.map(entry => [entry.key, entry.value]));
  assert.equal(values.size, environment.values.length, 'Duplicate environment variables');
  assert.equal(values.get('baseUrl'), 'http://localhost:3000');
  const flattenCurrent = items => items.flatMap(item => item.item ? flattenCurrent(item.item) : [item]);
  const catalog = collection.item.slice(0, 10).flatMap(folder => folder.item);
  assert.equal(catalog.length, routing.routes.length);
  const operations = new Set();
  const id = '000000000000000000000001';
  function replacement(key) {
    assert.ok(values.has(key) || key.startsWith('$'), 'Undefined variable: ' + key);
    if (key === 'baseUrl') return values.get(key);
    if (['aid','cid','did','bid','tid','pid','nid','rid','vid','iid','oid'].includes(key)) return key[0]+'01';
    if(key==='failedPid') return 'p01';
    if (/Email$/.test(key)) return 'audit@example.test';
    if (/Phone$/.test(key)) return '0123';
    if (/Password$/.test(key)) return '123';
    if (key === 'otpCode') return '123456';
    if (key === 'callbackSignature') return 'sha256=' + '0'.repeat(64);
    if (key === 'callbackTimestamp') return String(Math.floor(Date.now() / 1000));
    return 'demo-value';
  }
  const expand = value => value.replace(/\{\{([^}]+)\}\}/g, (_, key) => replacement(key));
  for (const item of flattenCurrent(collection.item)) {
    const request = item.request;
    const rawUrl = typeof request.url === 'string' ? request.url : request.url.raw;
    assert.ok(rawUrl.startsWith('{{baseUrl}}/'), 'Request bypasses Gateway');
    const url = new URL(expand(rawUrl));
    const route = routing.match(request.method, url.pathname);
    assert.ok(route, 'Unknown route: ' + item.name);
    for (const event of item.event || []) new vm.Script(event.script.exec.join('\n'), {filename: item.name});
    assert.ok(item.event.some(event => event.listen === 'test' && event.script.exec.join('\n').includes('pm.test')));
    if (request.auth.type === 'bearer') expand(request.auth.bearer[0].value);
    for (const header of request.header) expand(header.value);
    if (catalog.includes(item)) {
      operations.add(route.operation);
      assert.equal(item.name, route.operation);
      if (route.operation !== 'handleMockCallback') {
        const body = request.body ? JSON.parse(expand(request.body.raw)) : undefined;
        const headers = Object.fromEntries(request.header.map(header => [header.key.toLowerCase(), expand(header.value)]));
        routing.validate(route, url, body, headers);
      }
    }
  }
  assert.equal(operations.size, routing.routes.length, 'Missing or duplicate API operation');
  console.log('STATIC_OK: current Postman catalog covers 47 Gateway operations; request schemas, variables and scripts checked. No HTTP was sent.');
  return;
}
if(manifest.identityV2Migration?.status==='OUTDATED_COLLECTIONS'){
  console.error('OUTDATED: v1 collections are preserved references; use identity v2 manual requests in docs/MANUAL_POSTMAN_30.md.');
  process.exit(1);
}
const {loadCollection} = require('./postman-format.cjs');
const primary = loadCollection(manifest.primary.collection.path);
// Retain older catalog regressions explicitly as compatibility checks.
const collection = loadCollection(manifest.compatibility.collection.path);
const flatten = items => items.flatMap(x => x.item ? flatten(x.item) : [x]);
const items = flatten(collection.item);
const code = (item, kind) => item.event.find(e => e.listen === kind).script.exec.join('\n');
let syntaxCount = 0;
const primaryItems = flatten(primary.item);
for (const item of [...primaryItems, ...items]) {
  for (const e of item.event) {
    new vm.Script(e.script.exec.join('\n'), {filename: item.name + '/' + e.listen});
    syntaxCount++;
  }
}

function expect(value, negate = false) {
  const chain = {};
  for (const key of ['to','be','have','and','deep','at']) Object.defineProperty(chain, key, {get: () => chain});
  Object.defineProperty(chain, 'not', {get: () => expect(value, !negate)});
  Object.defineProperty(chain, 'empty', {get: () => {assert.equal(value.length === 0, !negate); return chain;}});
  Object.defineProperty(chain, 'undefined', {get: () => {assert.equal(value === undefined, !negate); return chain;}});
  chain.eql = other => negate ? assert.notDeepEqual(structuredClone(value), structuredClone(other)) : assert.deepEqual(structuredClone(value), structuredClone(other));
  chain.a = kind => {assert.equal(kind === 'array' ? Array.isArray(value) : typeof value === kind, !negate); return chain;};
  chain.include = other => assert.equal(value.includes(other), !negate);
  chain.lengthOf = length => assert.equal(value.length === length, !negate);
  chain.least = lower => assert.equal(value >= lower, !negate);
  chain.most = upper => assert.equal(value <= upper, !negate);
  chain.oneOf = list => assert.equal(list.includes(value), !negate);
  chain.match = regex => assert.equal(regex.test(value), !negate);
  chain.within = (lo, hi) => assert.equal(value >= lo && value <= hi, !negate);
  chain.above = lower => assert.equal(value > lower, !negate);
  return chain;
}

const find = name => {
  const normalize = value => value.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const result = items.find(x => x.name === name || x.name.startsWith(name + ' |') ||
    normalize(x.name) === normalize(name) || normalize(x.name).startsWith(normalize(name) + 'customer') ||
    normalize(x.name).startsWith(normalize(name) + 'driver') || normalize(x.name).startsWith(normalize(name) + 'admin'));
  assert.ok(result, name);
  return result;
};
function sandbox(item, store = {}, body = {}, status = 200) {
  const local = {};
  const request = structuredClone(item.request);
  const rawUrl = typeof request.url === 'string' ? request.url : request.url.raw;
  if (typeof request.url !== 'string') request.url.toString = () => rawUrl;
  if (request.body) request.body.update = raw => { request.body.raw = raw; };
  const failures = [];
  const control = {skipped: false, next: undefined};
  const pm = {
    request,
    environment: {get: k => store[k], set: (k,v) => {store[k] = v;}, unset: k => {delete store[k];}},
    info: {requestId: item.id || 'offline-fixture-id'},
    execution: {skipRequest: () => {control.skipped = true;}, setNextRequest: next => {control.next = next;}},
    variables: {
      get: k => local[k] ?? store[k], set: (k,v) => {local[k] = v;},
      replaceIn: text => text.replace(/\{\{\$guid\}\}/g, () => crypto.randomUUID())
        .replace(/\{\{(\w+)\}\}/g, (all,k) => local[k] ?? store[k] ?? all)
    },
    response: {code: status, json: () => body, headers: {get: k => k === 'Content-Type' ? 'application/json' : '60'},
      // Schema contents are checked by Python/jsonschema, not this SDK stub.
      to: {have: {jsonSchema: s => assert.ok(s && typeof s === 'object')}}},
    expect, test: (name, fn) => {try {fn();} catch (e) {failures.push(name);}}
  };
  const context = {pm, atob, btoa};
  return {store, local, request, failures, control, pm, run: kind => vm.runInNewContext(code(item, kind), {...context})};
}

const login = sandbox(find('loginDriver'), {}, {account: {role: 'DRIVER'}, accessToken: 'synthetic-driver-token'});
login.run('test'); assert.equal(login.store.driverToken, 'synthetic-driver-token');
assert.equal(login.store.customerToken, undefined); assert.deepEqual(login.failures, []);
const wrongRole = sandbox(find('loginDriver'), {}, {account: {role: 'ADMIN'}, accessToken: 'synthetic-token'});
wrongRole.run('test'); assert.ok(wrongRole.failures.includes('Login role is DRIVER'));
assert.equal(wrongRole.store.driverToken, undefined);

const create = find('createBooking');
const bookingStore = {baseUrl: 'http://localhost:3000', apiPrefix: '/api/v1', customerToken: 'synthetic-token'};
const booking = sandbox(create, bookingStore, {bookingId: 'booking-original'}, 201);
booking.run('prerequest'); assert.match(bookingStore.bookingKey, /^[0-9a-f-]{36}$/);
booking.run('test'); assert.equal(bookingStore.bookingReplayId, 'booking-original');
const originalKey = bookingStore.bookingKey;
const replay = sandbox(find('B - Replay exact booking request'), bookingStore, {bookingId: 'booking-original'});
replay.run('prerequest'); assert.equal(bookingStore.bookingKey, originalKey);
assert.equal(replay.request.body.raw, bookingStore.bookingReplayBody);
replay.run('test'); assert.deepEqual(replay.failures, []);
const badReplay = sandbox(find('B - Replay exact booking request'), bookingStore, {bookingId: 'booking-wrong'});
badReplay.run('test'); assert.ok(badReplay.failures.includes('Replay returns original resource'));

const payment = sandbox(find('createPayment'), {baseUrl: 'http://localhost:3000', apiPrefix: '/api/v1', tripId: 'trip-a', customerToken: 'synthetic-token'});
assert.throws(() => payment.run('prerequest'), /COMPLETED/);
payment.store.tripStatus = 'COMPLETED'; payment.store.tripStatusTripId = 'trip-other';
assert.throws(() => payment.run('prerequest'), /COMPLETED/);
payment.store.tripStatusTripId = 'trip-a'; payment.run('prerequest');

const callbackBody = '{"paymentId":"id","timestamp":123}';
const callback = sandbox(find('handleMockCallback'), {baseUrl: 'http://localhost:3000', apiPrefix: '/api/v1',
  callbackRawBody: callbackBody, callbackTimestamp: '123', callbackSignature: 'sha256=' + 'a'.repeat(64)});
callback.run('prerequest'); assert.equal(callback.request.body.raw, callbackBody);
callback.store.callbackTimestamp = '124'; assert.throws(() => callback.run('prerequest'), /timestamp mismatch/);

const payload = Buffer.from(JSON.stringify({sub: 'customer', role: 'CUSTOMER'})).toString('base64url');
const original = 'e30.' + payload + '.original-signature';
const tamper = sandbox(find('27 - Tampered real JWT rejected'), {customerToken: original});
tamper.run('prerequest');
const modified = tamper.local.tamperedToken;
assert.notEqual(modified, original);
assert.equal(modified.split('.')[2], 'original-signature');
assert.equal(JSON.parse(Buffer.from(modified.split('.')[1], 'base64url')).role, 'ADMIN');
const rejected = sandbox(find('28 - CUSTOMER cannot call DRIVER API'), {}, {code: 'FORBIDDEN'}, 200);
rejected.run('test'); assert.ok(rejected.failures.includes('HTTP status matches scenario'));
const findPrimary = name => {const result = primaryItems.find(x => x.name === name); assert.ok(result, name); return result;};
const phaseLogin = sandbox(findPrimary('Login customer'), {}, {account: {role: 'CUSTOMER', status: 'ACTIVE', accountId: 'fixture-account'}, accessToken: 'fixture-token'});
phaseLogin.run('test'); assert.deepEqual(phaseLogin.failures, []);
assert.equal(phaseLogin.store.customer_token, 'fixture-token'); assert.equal(phaseLogin.store.driver_token, undefined);
const absent = sandbox(findPrimary('Login customer'));
assert.throws(() => absent.run('prerequest'), /BLOCKED/); assert.equal(absent.control.skipped, true);
const snapshot = {bookingId: 'fixture-booking', status: 'SEARCHING', vehicleType: 'BIKE'};
const phaseReplay = sandbox(findPrimary('Replay Booking same key/body'), {booking_original: JSON.stringify(snapshot)}, snapshot);
phaseReplay.run('test'); assert.deepEqual(phaseReplay.failures, []);
const changedSnapshot = sandbox(findPrimary('Replay Booking same key/body'), {booking_original: JSON.stringify(snapshot)}, {...snapshot, status: 'ASSIGNED'});
changedSnapshot.run('test'); assert.ok(changedSnapshot.failures.some(x => x.includes('snapshot')));
const profilePoll = sandbox(findPrimary('Poll onboarding profile ready'), {poll_limit: '2'}, {code: 'PROFILE_NOT_READY'}, 503);
profilePoll.run('test'); assert.equal(profilePoll.control.next, findPrimary('Poll onboarding profile ready').id);
profilePoll.run('test'); assert.equal(profilePoll.control.next, null); assert.ok(profilePoll.failures.length);
const strict = sandbox(findPrimary('Health process'), {}, {code: 'DEPENDENCY_UNAVAILABLE'}, 503);
strict.run('test'); assert.ok(strict.failures.some(x => x.includes('HTTP'))); assert.equal(strict.control.next, null);
const phaseCallback = sandbox(findPrimary('Send prepared signed callback'), {
  base_url: 'http://localhost:3000', callback_payload: callbackBody, callback_signature: 'sha256=' + 'a'.repeat(64),
  callback_timestamp: '123', callback_payment_id: 'id', callback_expected_status: 'COMPLETED', callback_duplicate_expected: 'false'
}, {paymentId: 'id', status: 'COMPLETED', duplicate: false});
phaseCallback.run('prerequest'); assert.equal(phaseCallback.pm.variables.replaceIn(phaseCallback.request.body.raw), callbackBody);
phaseCallback.run('test'); assert.deepEqual(phaseCallback.failures, []);
const rate = primary.item.find(x => x.name.startsWith('10 Rate limit'));
const burst = rate.item.filter(x => x.name.startsWith('Booking rate request'));
assert.equal(burst.length, 11);
assert.match(code(burst[0], 'test'), /const expected = 201;/);
for (const item of burst.slice(1,10)) {
  assert.match(code(item, 'test'), /const expected = 200;/);
  assert.ok(!code(item, 'prerequest').includes("set('rate_key'"));
}
assert.match(code(burst[10], 'test'), /const expected = 429;/);
assert.ok(code(burst[10], 'test').includes('Retry-After'));
console.log(`Offline JS: ${primaryItems.length} Phase 6 requests + ${items.length} compatibility requests; ${syntaxCount} scripts parsed.`);
console.log('Phase 6 fixtures checked role isolation, missing prerequisites, full replay snapshot, bounded polling, strict status, callback bytes and isolated 11-request rate sequence. Older catalog regressions retained.');
console.log('SDK is stubbed; these checks do not establish Postman runtime or backend PASS.');
