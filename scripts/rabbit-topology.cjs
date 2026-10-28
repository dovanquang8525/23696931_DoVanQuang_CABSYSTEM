'use strict';
const topology = require('../docs/events/topology.json');
const {required} = require('./runtime-config.cjs');

// Use the same declarations on bootstrap and every bus connection/reconnection.
// Await all bindings before publishing: confirms alone do not ensure routing.
async function ensureTopology(channel) {
  if (required('RABBITMQ_EXCHANGE') !== topology.exchange.name) {
    throw new Error('Exchange differs from contract');
  }
  await channel.assertExchange(topology.exchange.name, topology.exchange.type, {durable: topology.exchange.durable});
  await channel.assertExchange('cab.dead', 'direct', {durable: true});
  for (const queue of topology.queues) {
    await channel.assertQueue(queue.deadLetterQueue, {durable: true});
    await channel.bindQueue(queue.deadLetterQueue, 'cab.dead', queue.deadLetterQueue);
    await channel.assertQueue(queue.name, {durable: queue.durable, arguments: {
      'x-dead-letter-exchange': 'cab.dead', 'x-dead-letter-routing-key': queue.deadLetterQueue
    }});
    for (const key of queue.bindings) await channel.bindQueue(queue.name, topology.exchange.name, key);
    for (const delay of queue.retryDelaysSeconds) await channel.assertQueue(
      queue.name + '.retry.' + delay + 's', {durable: true, arguments: {
        'x-message-ttl': delay * 1000, 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': queue.name
      }});
  }
}
module.exports = {topology, ensureTopology};
