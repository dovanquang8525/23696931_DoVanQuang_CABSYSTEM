'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const amqp = require('amqplib');
const Ajv = require('ajv/dist/2020');
const formats = require('ajv-formats');
const {rabbitConfig} = require('./runtime-config.cjs');
const {topology, ensureTopology} = require('./rabbit-topology.cjs');
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/events/events.schema.json'), 'utf8'));
const ajv = new Ajv({strict: false, allErrors: false});
formats(ajv);
const valid = ajv.compile(schema);
function checkEnvelope(event) {
  if (!valid(event)) throw Object.assign(new Error('Invalid event contract'), {poison: true});
  const identity = event.payload.accountId || event.payload.driverId || event.payload.invitationId ||
    event.payload.tripId || event.payload.paymentId || event.payload.bookingId;
  // Choose aggregate identity by event type; invitation events aggregate on invitationId.
  const key = event.eventType === 'account.registered' ? 'accountId'
    : event.eventType === 'booking.invitation_created' ? 'invitationId'
    : event.eventType.startsWith('booking.') ? 'bookingId'
    : event.eventType.startsWith('trip.') ? 'tripId'
    : event.eventType.startsWith('payment.') ? 'paymentId' : 'driverId';
  if (!identity || event.aggregateId !== event.payload[key] ||
      (event.payload.aggregateVersion !== undefined && event.payload.aggregateVersion !== event.aggregateVersion)) {
    throw Object.assign(new Error('Invalid event identity'), {poison: true});
  }
  return event;
}
async function createBus({service, db, client, consume, publishOutbox = false}) {
  const ownQueue = consume && topology.queues.find(queue => queue.consumer === service);
  let connection, publisher, channel, consumerTag, stopped = false, connected = false, pumping = false;
  const active = new Set();
  const outbox = db.collection('outbox_events'), inbox = db.collection('inbox_events');
  if (publishOutbox) await outbox.createIndex({publishedAt: 1, lockUntil: 1, createdAt: 1});
  const owner = crypto.randomUUID();
  const log = code => console.error(service + ': event bus ' + code + '; retrying without deleting data.');
  function confirmed(send) {
    return new Promise((resolve, reject) => {
      if (!publisher) { reject(new Error('AMQP unavailable')); return; }
      send(error => error ? reject(error) : resolve());
    });
  }
  async function dispatch(message) {
    if (!message) return;
    const deliveryChannel = channel;
    try {
      let event;
      try {
        event = checkEnvelope(JSON.parse(message.content.toString('utf8')));
        const retry = Number(message.properties.headers?.['x-cab-retry-count'] || 0);
        const originalKey = message.properties.headers?.['x-cab-original-routing-key'];
        const main = message.fields.routingKey === event.eventType;
        const redelivery = retry >= 1 && retry <= 3 && message.fields.routingKey === ownQueue.name &&
          originalKey === event.eventType;
        if ((!main && !redelivery) || message.properties.type !== event.eventType ||
            message.properties.messageId !== event.eventId) throw new Error('Invalid event routing');
      } catch { throw Object.assign(new Error('Poison event'), {poison: true}); }
      const hash = crypto.createHash('sha256').update(message.content).digest('hex');
      await client.withSession(session => session.withTransaction(async () => {
        const seen = await inbox.findOne({_id: service + ':' + event.eventId}, {session});
        if (seen) {
          if (seen.payloadHash !== hash) throw Object.assign(new Error('Event ID conflict'), {poison: true});
          return;
        }
        await consume(event, session);
        await inbox.insertOne({_id: service + ':' + event.eventId,
          eventId: event.eventId, consumer: service, payloadHash: hash, processedAt: new Date()}, {session});
      }, {readConcern: {level: 'snapshot'}, writeConcern: {w: 'majority'}, maxCommitTimeMS: 5000}));
      deliveryChannel.ack(message);
    } catch (error) {
      const attempts = Number(message.properties.headers?.['x-cab-retry-count'] || 0);
      if (error.poison || !Number.isInteger(attempts) || attempts >= ownQueue.maxRetriesAfterInitial) {
        try { deliveryChannel.nack(message, false, false); } catch {}
        return;
      }
      try {
        await confirmed(done => publisher.sendToQueue(
          ownQueue.name + '.retry.' + ownQueue.retryDelaysSeconds[attempts] + 's',
          message.content, {...message.properties, persistent: true, headers: {
            ...message.properties.headers, 'x-cab-retry-count': attempts + 1,
            'x-cab-original-routing-key': message.properties.type
          }}, done));
        deliveryChannel.ack(message);
      } catch { try { deliveryChannel.nack(message, false, true); } catch {} }
    }
  }
  async function open() {
    connection = await amqp.connect(rabbitConfig());
    connection.on('error', () => { connected = false; });
    connection.on('close', () => { connected = false; connection = null; publisher = null; channel = null; });
    publisher = await connection.createConfirmChannel();
    publisher.on('error', () => { connected = false; });
    publisher.on('close', () => {
      connected = false;
      if (!stopped && connection) void connection.close().catch(() => {});
    });
    await ensureTopology(publisher);
    if (ownQueue) {
      channel = await connection.createChannel();
      channel.on('error', () => { connected = false; });
      channel.on('close', () => {
        connected = false;
        if (!stopped && connection) void connection.close().catch(() => {});
      });
      await channel.prefetch(10);
      const registration = await channel.consume(ownQueue.name, message => {
        const task = dispatch(message);
        active.add(task); void task.finally(() => active.delete(task));
      }, {noAck: false});
      consumerTag = registration.consumerTag;
    }
    connected = true;
  }
  async function tick() {
    if (stopped || pumping) return;
    pumping = true;
    try {
      if (!connected) {
        if (connection) { await connection.close().catch(() => {}); connection = null; }
        await open();
      }
      if (!publishOutbox) return;
      for (let i = 0; i < 20 && !stopped && connected; i++) {
        const now = new Date();
        const row = await outbox.findOneAndUpdate({publishedAt: null,
          $or: [{lockUntil: {$exists: false}}, {lockUntil: {$lte: now}}]},
        {$set: {lockOwner: owner, lockUntil: new Date(Date.now() + 15000)}},
        {sort: {createdAt: 1}, returnDocument: 'after'});
        if (!row) break;
        const event = checkEnvelope(row.envelope);
        await confirmed(done => publisher.publish(topology.exchange.name, event.eventType,
          Buffer.from(JSON.stringify(event)), {persistent: true, contentType: 'application/json',
            messageId: event.eventId, type: event.eventType, correlationId: event.correlationId}, done));
        await outbox.updateOne({_id: row._id, lockOwner: owner},
          {$set: {publishedAt: new Date()}, $unset: {lockOwner: '', lockUntil: ''}});
      }
    } catch {
      connected = false;
      log('dependency unavailable');
    } finally { pumping = false; }
  }
  try { await open(); }
  catch (error) { if (connection) await connection.close().catch(() => {}); throw error; }
  const timer = setInterval(() => { void tick(); }, 500);
  void tick();
  return {isReady: () => connected && !stopped, async close() {
    stopped = true; connected = false; clearInterval(timer);
    if (channel && consumerTag) await channel.cancel(consumerTag).catch(() => {});
    await Promise.allSettled([...active]);
    if (connection) await connection.close().catch(() => {});
  }};
}
module.exports = {createBus, checkEnvelope};
