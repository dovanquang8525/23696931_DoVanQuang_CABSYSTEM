'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {EventEmitter} = require('node:events');
const amqp = require('amqplib');
const {createBus} = require('./event-bus.cjs');

function fixture(t, fail = false) {
  for (const [key, value] of Object.entries({RABBITMQ_HOST: 'test', RABBITMQ_USERNAME: 'test',
    RABBITMQ_PASSWORD: 'test', RABBITMQ_VHOST: 'cab', RABBITMQ_EXCHANGE: 'cab.events'})) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const calls = [];
  let release, reached;
  const gate = new Promise(resolve => { release = resolve; });
  const declaring = new Promise(resolve => { reached = resolve; });
  const publisher = Object.assign(new EventEmitter(), {
    async assertExchange(name) { calls.push(name); },
    async assertQueue(name) {
      if (name === 'customer.events') {
        reached(); await gate;
        if (fail) throw Object.assign(new Error('Declaration refused'), {code: 406});
      }
      calls.push(name);
    },
    async bindQueue(name, exchange, key) { calls.push([name, exchange, key]); }
  });
  const consumer = Object.assign(new EventEmitter(), {
    async prefetch() {}, async consume(name) { calls.push('consume:' + name); return {consumerTag: 'test'}; },
    async cancel() {}
  });
  const connection = Object.assign(new EventEmitter(), {
    async createConfirmChannel() { return publisher; }, async createChannel() { return consumer; },
    async close() { calls.push('close'); }
  });
  t.mock.method(amqp, 'connect', async () => connection);
  const db = {collection() { return {
    async createIndex() {}, async findOneAndUpdate() { calls.push('outbox'); return null; }
  }; }};
  return {calls, release, declaring, db};
}
test('consumer waits for every binding/retry queue before basic.consume', async t => {
  const f = fixture(t);
  const pending = createBus({service: 'customer_service', db: f.db, consume: async () => {}});
  await f.declaring;
  assert.equal(f.calls.some(c => String(c).startsWith('consume:')), false);
  f.release();
  const bus = await pending;
  try {
    assert.equal(bus.isReady(), true);
    assert.ok(f.calls.indexOf('notification.events.retry.15s') < f.calls.indexOf('consume:customer.events'));
    assert.ok(f.calls.some(c => Array.isArray(c) && c.join('|') === 'customer.events|cab.events|account.registered'));
  } finally { await bus.close(); }
});
test('publisher waits for all destination queues before reading outbox', async t => {
  const f = fixture(t);
  const pending = createBus({service: 'auth_service', db: f.db, publishOutbox: true});
  await f.declaring;
  assert.equal(f.calls.includes('outbox'), false);
  f.release();
  const bus = await pending;
  try {
    assert.equal(bus.isReady(), true);
    assert.ok(f.calls.indexOf('notification.events.retry.15s') < f.calls.indexOf('outbox'));
  } finally { await bus.close(); }
});
test('incompatible topology fails closed without consuming or reading outbox', async t => {
  const f = fixture(t, true);
  const pending = createBus({service: 'booking_service', db: f.db, consume: async () => {}, publishOutbox: true});
  await f.declaring;
  f.release();
  await assert.rejects(pending, {code: 406});
  assert.equal(f.calls.some(c => String(c).startsWith('consume:')), false);
  assert.equal(f.calls.includes('outbox'), false);
  assert.equal(f.calls.at(-1), 'close');
});
