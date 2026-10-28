'use strict';
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const {MongoClient} = require('mongodb');
const {services, required, port, mongoUri, ownDatabase} = require('./runtime-config.cjs');
const {safeEqual, closeClients} = require('./rpc-security.cjs');
const health = grpc.loadPackageDefinition(loader.loadSync(
  path.resolve(__dirname, '../proto/grpc/health/v1/health.proto'),
  {keepCase: true, enums: String, defaults: false, oneofs: true})).grpc.health.v1;
function start(service) {
  if (!services.includes(service)) throw new Error('Unknown service');
  const secret = required('GRPC_INTERNAL_SECRET'), config = ownDatabase(service);
  const client = new MongoClient(mongoUri(config.username, config.password), {serverSelectionTimeoutMS: 2000});
  const server = new grpc.Server();
  let databaseReady = false, stopping = false, probing = false, application, timer;
  async function probe() {
    if (stopping || probing) return;
    probing = true;
    try {
      const row = await client.db(config.name).collection('_cab_metadata').findOne({_id: 'ownership'});
      databaseReady = row?.owner === service;
    } catch { databaseReady = false; }
    finally { probing = false; }
  }
  server.addService(health.Health.service, {check(call, callback) {
    const credentials = call.metadata.get('x-internal-secret'), peers = call.metadata.get('x-service-name');
    if (credentials.length !== 1 || !safeEqual(credentials[0], secret) || peers.length !== 1 ||
        !['gateway', ...services].includes(peers[0])) {
      callback({code: grpc.status.UNAUTHENTICATED, details: 'Invalid internal credential'});
      return;
    }
    const requested = call.request.service || '';
    callback(null, {status: requested && requested !== service ? 'SERVICE_UNKNOWN'
      : databaseReady && !stopping && (!application || application.isReady()) ? 'SERVING' : 'NOT_SERVING'});
  }});
  async function boot() {
    await client.connect();
    await probe();
    application = await require('../services/' + service + '/application.cjs').create({
      db: client.db(config.name), client, server});
    const prefix = service.replace('_service', '').toUpperCase();
    await new Promise((resolve, reject) => server.bindAsync(
      (process.env[prefix + '_GRPC_HOST'] || '0.0.0.0') + ':' +
      port(prefix + '_GRPC_PORT', 50051 + services.indexOf(service)),
      grpc.ServerCredentials.createInsecure(), error => error ? reject(error) : resolve()));
    timer = setInterval(() => { void probe(); }, 5000);
    console.log(service + ': gRPC Health and business handlers registered.');
  }
  async function shutdown() {
    if (stopping) return;
    stopping = true; databaseReady = false; clearInterval(timer);
    const force = setTimeout(() => { server.forceShutdown(); }, 5000);
    force.unref();
    await new Promise(resolve => server.tryShutdown(resolve));
    clearTimeout(force);
    if (application) await application.close();
    closeClients();
    await client.close();
  }
  void boot().catch(async error => {
    console.error(service + ': startup failed; code=' + String(error.code || 'CONFIG_OR_DEPENDENCY')
      .replace(/[^a-zA-Z0-9_-]/g, ''));
    await shutdown().catch(() => {});
    process.exitCode = 1;
  });
  process.once('SIGTERM', () => { void shutdown(); });
  process.once('SIGINT', () => { void shutdown(); });
}
module.exports = {start};
