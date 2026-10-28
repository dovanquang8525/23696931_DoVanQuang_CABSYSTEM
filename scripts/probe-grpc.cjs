'use strict';
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const {services, required, port} = require('./runtime-config.cjs');
const service = process.argv[2];
if (!services.includes(service)) throw new Error('Expected service name');
const prefix = service.replace('_service', '').toUpperCase();
const definition = grpc.loadPackageDefinition(loader.loadSync(
  path.resolve(__dirname, '../proto/grpc/health/v1/health.proto'), {enums: String}));
const client = new definition.grpc.health.v1.Health('127.0.0.1:' +
  port(prefix + '_GRPC_PORT', 50051 + services.indexOf(service)), grpc.credentials.createInsecure());
const metadata = new grpc.Metadata();
metadata.set('x-service-name', 'gateway');
metadata.set('x-internal-secret', required('GRPC_INTERNAL_SECRET'));
client.check({service}, metadata, {deadline: Date.now() + 2500}, (error, response) => {
  client.close();
  if (error || response.status !== 'SERVING') process.exitCode = 1;
});
