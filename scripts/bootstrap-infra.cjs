'use strict';
const {ensureTopology} = require('./rabbit-topology.cjs');
const {MongoClient} = require('mongodb');
const amqp = require('amqplib');
const {services, required, mongoUri, ownDatabase, rabbitConfig} = require('./runtime-config.cjs');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let phase = 'configuration';
async function retry(label, task) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { return await task(); }
    catch (error) {
      if (attempt === 59) throw Object.assign(new Error(label), {code: error.code});
      await pause(2000);
    }
  }
}
async function mongo() {
  phase = 'MongoDB connection';
  const rootUser = required('MONGODB_ROOT_USERNAME');
  const rootPassword = required('MONGODB_ROOT_PASSWORD');
  const client = new MongoClient(mongoUri(rootUser, rootPassword) + '&directConnection=true',
    {serverSelectionTimeoutMS: 3000});
  try {
    await retry('MongoDB connection', async () => { await client.connect(); await client.db('admin').command({ping: 1}); });
    const admin = client.db('admin');
    phase = 'MongoDB replica set';
    const replicaName = process.env.MONGODB_REPLICA_SET || 'rs0';
    let status;
    try { status = await admin.command({replSetGetStatus: 1}); }
    catch (error) {
      if (error.code !== 94) throw error;
      await admin.command({replSetInitiate: {_id: replicaName, members: [
        {_id: 0, host: required('MONGODB_HOST') + ':' + (process.env.MONGODB_PORT || '27017')}
      ]}});
    }
    if (status && status.set !== replicaName) throw new Error('Replica set differs; refusing reconfiguration');
    await retry('MongoDB primary', async () => {
      if (!(await admin.command({hello: 1})).isWritablePrimary) throw new Error('Election pending');
    });
    const configs = services.map(name => ({service: name, ...ownDatabase(name)}));
    if (new Set(configs.map(c => c.name)).size !== 8 || configs.some(c => ['admin', 'config', 'local'].includes(c.name))) {
      throw new Error('Expected eight distinct service databases');
    }
    if (new Set(configs.map(c => c.username)).size !== 8 || configs.some(c => c.username === rootUser)) {
      throw new Error('Expected eight distinct non-root users');
    }
    for (const config of configs) {
      phase = 'MongoDB ownership: ' + config.service;
      const info = await admin.command({usersInfo: {user: config.username, db: 'admin'}});
      if (!info.users.length) await admin.command({createUser: config.username, pwd: config.password,
        roles: [{role: 'readWrite', db: config.name}]});
      else {
        const roles = info.users[0].roles;
        if (roles.length !== 1 || roles[0].role !== 'readWrite' || roles[0].db !== config.name) {
          throw new Error('Existing user roles differ; refusing overwrite');
        }
      }
      const owner = new MongoClient(mongoUri(config.username, config.password), {serverSelectionTimeoutMS: 5000});
      try {
        await owner.connect();
        await owner.db(config.name).collection('_cab_metadata').updateOne(
          {_id: 'ownership'}, {$setOnInsert: {owner: config.service, createdAt: new Date()}}, {upsert: true});
        for (const other of configs.filter(c => c.name !== config.name)) {
          try {
            await owner.db(other.name).collection('_cab_metadata').findOne({});
            throw new Error('Cross-database access allowed');
          } catch (error) { if (error.code !== 13) throw error; }
        }
      } finally { await owner.close(); }
      console.log('Database owner ready; isolation checked: ' + config.service);
    }
  } finally { await client.close(); }
}
async function rabbit() {
  phase = 'RabbitMQ topology';
  const connection = await retry('RabbitMQ connection', () => amqp.connect(rabbitConfig()));
  let channel;
  try {
    channel = await connection.createConfirmChannel();
    await ensureTopology(channel);
    console.log('RabbitMQ exchange, four consumer queues, bindings and retry/DLQ queues provisioned.');
  } finally {
    if (channel) await channel.close();
    await connection.close();
  }
}
(async () => { await mongo(); await rabbit(); console.log('Infrastructure bootstrap completed.'); })()
  .catch(error => {
    console.error('Infrastructure bootstrap failed at ' + phase + '; code=' + String(error.code || 'CONFIG_OR_DEPENDENCY')
      .replace(/[^a-zA-Z0-9_-]/g, ''));
    console.error('No data/users/queues deleted. Check credentials, roles and dependency logs locally.');
    process.exitCode = 1;
  });
