'use strict';
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const {AsyncLocalStorage} = require('node:async_hooks');
const requestContext = new AsyncLocalStorage();
const correlationId = () => requestContext.getStore()?.correlationId || crypto.randomUUID();
const {required, port, services} = require('./runtime-config.cjs');
const access = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/api/rpc-access.json'), 'utf8'));
const schemas = new Map();
const clients = new Map();
function definition(name) {
  if (!schemas.has(name)) schemas.set(name, grpc.loadPackageDefinition(loader.loadSync(
    path.join(__dirname, '../proto/' + name + '.proto'),
    {includeDirs: [path.join(__dirname, '../proto')], keepCase: true, enums: String,
      longs: Number, defaults: false, oneofs: true})));
  return schemas.get(name).cab[name].v1;
}
class DomainError extends Error {
  constructor(status, code, message, retryAfter) {
    super(message); this.status = status; this.domainCode = code; this.retryAfter = retryAfter;
  }
}
function fail(status, code, message, retryAfter) { throw new DomainError(status, code, message, retryAfter); }
function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function identity(token) {
  try {
    const decoded = jwt.verify(token, required('JWT_SECRET'), {
      algorithms: ['HS256'], issuer: 'cab-auth', audience: 'cab-api', clockTolerance: 0
    });
    if (!decoded || typeof decoded !== 'object' || !/^[0-9a-f]{24}$/.test(decoded.sub || '') ||
        !['CUSTOMER', 'DRIVER', 'ADMIN'].includes(decoded.role) ||
        !Number.isInteger(decoded.exp) || !Number.isInteger(decoded.iat)) throw new Error('Invalid claims');
    return decoded;
  } catch { fail(grpc.status.UNAUTHENTICATED, 'INVALID_TOKEN', 'Invalid or expired access token.'); }
}
function bearer(value) {
  if (typeof value !== 'string' || !/^Bearer [^\s]+$/.test(value)) {
    fail(grpc.status.UNAUTHENTICATED, 'INVALID_TOKEN', 'A Bearer access token is required.');
  }
  return value.slice(7);
}
function peer(call, method) {
  const names = call.metadata.get('x-service-name'), secrets = call.metadata.get('x-internal-secret');
  if (names.length !== 1 || secrets.length !== 1 || !safeEqual(secrets[0], required('GRPC_INTERNAL_SECRET'))) {
    fail(grpc.status.UNAUTHENTICATED, 'INVALID_INTERNAL_CREDENTIAL', 'Invalid internal credential.');
  }
  const policy = access.find(entry => entry.method === method);
  const allowed = policy ? policy.allowedPeers.split(',').map(value => value.trim().split(/[ (]/)[0]) : [];
  if (!allowed.includes(names[0])) fail(grpc.status.PERMISSION_DENIED, 'FORBIDDEN', 'Caller is not permitted.');
  return names[0];
}
function authorization(call) {
  const values = call.metadata.get('authorization');
  if (values.length !== 1) fail(grpc.status.UNAUTHENTICATED, 'INVALID_TOKEN', 'A Bearer access token is required.');
  return {token: bearer(values[0]), claims: identity(bearer(values[0]))};
}
function remaining(call) {
  const parent = call?.getDeadline?.();
  const end = parent instanceof Date ? parent.getTime() : Number(parent);
  return new Date(Math.min(Date.now() + 5000, Number.isFinite(end) ? end : Infinity));
}
function rpcClient(name) {
  if (!clients.has(name)) {
    const prefix = name.toUpperCase();
    const service = name[0].toUpperCase() + name.slice(1) + 'Service';
    const target = required(prefix + '_GRPC_HOST') + ':' + port(prefix + '_GRPC_PORT',
      50051 + services.indexOf(name + '_service'));
    clients.set(name, new (definition(name)[service])(target, grpc.credentials.createInsecure()));
  }
  return clients.get(name);
}
function invoke(name, method, request, {caller, token, correlationId, call, withMetadata = false} = {}) {
  const metadata = new grpc.Metadata();
  metadata.set('x-service-name', caller);
  metadata.set('x-internal-secret', required('GRPC_INTERNAL_SECRET'));
  metadata.set('x-correlation-id', correlationId || requestContext.getStore()?.correlationId || crypto.randomUUID());
  if (token) metadata.set('authorization', 'Bearer ' + token);
  return new Promise((resolve, reject) => {
    let responseMetadata;
    const requestCall = rpcClient(name)[method](request, metadata, {deadline: remaining(call)},
      (error, result) => error ? reject(error) : resolve(withMetadata ? {result, metadata:responseMetadata} : result));
    requestCall.on('metadata', value => { responseMetadata = value; });
  });
}
function errorToGrpc(error) {
  if (error instanceof DomainError) {
    const metadata = new grpc.Metadata();
    metadata.set('cab-error-code', error.domainCode);
    if (error.retryAfter) metadata.set('retry-after', String(error.retryAfter));
    return {code: error.status, details: error.message, metadata};
  }
  if (error?.code === 11000) return errorToGrpc(new DomainError(
    grpc.status.ALREADY_EXISTS, 'DUPLICATE_RESOURCE', 'Resource already exists.'));
  if (error?.metadata && Number.isInteger(error.code) && error.code >= 1 && error.code <= 16) return error;
  const dependency = /^Mongo|^AMQP|^Redis/.test(error?.name || '') ||
    ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error?.code);
  return errorToGrpc(new DomainError(dependency ? grpc.status.UNAVAILABLE : grpc.status.INTERNAL,
    dependency ? 'DEPENDENCY_UNAVAILABLE' : 'INTERNAL_ERROR',
    dependency ? 'A required dependency is unavailable.' : 'An internal error occurred.'));
}
function wrap(fullMethod, handler) {
  return async (call, callback) => {
    const supplied = call.metadata.get('x-correlation-id')[0];
    const id = typeof supplied === 'string' && supplied.length > 0 && supplied.length <= 128 ? supplied : crypto.randomUUID();
    await requestContext.run({correlationId:id}, async () => {
      const started=Date.now();
      try {
        peer(call, fullMethod); const result=await handler(call.request, call);
        console.log(JSON.stringify({at:new Date().toISOString(),method:fullMethod,correlationId:id,result:'OK',durationMs:Date.now()-started}));
        callback(null,result);
      } catch (error) {
        const converted=errorToGrpc(error);
        console.error(JSON.stringify({at:new Date().toISOString(),method:fullMethod,correlationId:id,result:'ERROR',grpcStatus:converted.code,durationMs:Date.now()-started}));
        callback(converted);
      }
    });
  };
}
function addHandlers(server, name, handlers) {
  const className = name[0].toUpperCase() + name.slice(1) + 'Service';
  const implementation = {};
  for (const [method, handler] of Object.entries(handlers)) {
    implementation[method[0].toLowerCase() + method.slice(1)] = wrap(
      'cab.' + name + '.v1.' + className + '/' + method, handler);
  }
  server.addService(definition(name)[className].service, implementation);
}
function closeClients() { for (const client of clients.values()) client.close(); clients.clear(); }
module.exports = {grpc, DomainError, fail, safeEqual, identity, bearer, peer, authorization, correlationId,
  definition, invoke, addHandlers, errorToGrpc, closeClients};
