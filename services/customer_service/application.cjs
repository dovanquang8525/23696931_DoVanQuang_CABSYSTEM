'use strict';
const {ObjectId} = require('mongodb');
const {grpc, fail, authorization, invoke, addHandlers} = require('../../scripts/rpc-security.cjs');
const v = require('../../scripts/identity-validation.cjs');
const {createBus} = require('../../scripts/event-bus.cjs');
function view(row) {
  return {customer_id: row._id.toHexString(), account_id: row.accountId, full_name: row.fullName,cid:row.cid,
    ...(row.email ? {email: row.email} : {}), created_at: row.createdAt.toISOString(), updated_at: row.updatedAt.toISOString()};
}
async function create({db, client, server}) {
  const profiles = db.collection('customer_profiles');
  await profiles.createIndex({accountId: 1}, {unique: true});
  await profiles.createIndex({cid:1},{unique:true,partialFilterExpression:{cid:{$type:'string'}}});
  const bus = await createBus({service: 'customer_service', db, client, async consume(event, session) {
    if (event.eventType !== 'account.registered' || event.payload.role !== 'CUSTOMER') return;
    const {accountId, fullName, email,cid} = event.payload;
    const date = new Date(event.occurredAt);
    await profiles.updateOne({accountId}, {$setOnInsert: {accountId, fullName,
      ...(email ? {email} : {}),cid, createdAt: date, updatedAt: date}}, {upsert: true, session});
  }});
  async function actor(call, roles) {
    const {claims, token} = authorization(call);
    if (!roles.includes(claims.role)) fail(grpc.status.PERMISSION_DENIED, 'FORBIDDEN', 'Role is not permitted.');
    const access = await invoke('auth', 'getAccountAccess', {account_id: claims.sub},
      {caller: 'customer_service', token, call, correlationId: call.metadata.get('x-correlation-id')[0]});
    if (access.role !== claims.role) fail(grpc.status.UNAUTHENTICATED, 'INVALID_TOKEN', 'Invalid access token.');
    if (access.status !== 'ACTIVE') fail(grpc.status.PERMISSION_DENIED, 'ACCOUNT_DISABLED', 'Account is not active.');
    return claims;
  }
  async function mine(accountId) {
    const row = await profiles.findOne({accountId});
    if (!row) fail(grpc.status.UNAVAILABLE, 'PROFILE_NOT_READY', 'Customer profile is not ready yet.');
    return row;
  }
  addHandlers(server, 'customer', {
    async GetMyCustomer(input, call) {
      v.fields(input, []);
      const claims = await actor(call, ['CUSTOMER']);
      return view(await mine(claims.sub));
    },
    async UpdateMyCustomer(input, call) {
      v.fields(input, ['full_name','email']);
      const claims = await actor(call, ['CUSTOMER']);
      const update = {};
      if (Object.hasOwn(input, 'full_name')) update.fullName = v.text(input.full_name, 100);
      if (Object.hasOwn(input, 'email')) update.email = v.email(input.email);
      if (!Object.keys(update).length) v.invalid();
      const own = await mine(claims.sub);
      const row = await profiles.findOneAndUpdate({_id: own._id, accountId: claims.sub},
        {$set: {...update, updatedAt: new Date()}}, {returnDocument: 'after'});
      return view(row);
    },
    async GetCustomer(input, call) {
      v.fields(input, ['customer_id'], ['customer_id']);
      const customerId = v.id(input.customer_id), claims = await actor(call, ['CUSTOMER','ADMIN']);
      const row = await profiles.findOne({_id: new ObjectId(customerId)});
      if (claims.role === 'CUSTOMER' && (!row || row.accountId !== claims.sub)) {
        fail(grpc.status.PERMISSION_DENIED, 'FORBIDDEN', 'Customer profile is outside your access scope.');
      }
      if (!row) fail(grpc.status.NOT_FOUND, 'NOT_FOUND', 'Customer profile does not exist.');
      return view(row);
    },
    async ListCustomers(input, call) {
      const {page, limit} = v.pagination(input);
      await actor(call, ['ADMIN']);
      const items = await profiles.find({}).sort({_id: -1}).skip((page - 1) * limit).limit(limit).toArray();
      return {items: items.map(view), page, limit, total_items: await profiles.countDocuments({})};
    },
    async GetCustomerByAccount(input, call) {
      v.fields(input, ['account_id'], ['account_id']);
      const accountId = v.id(input.account_id), claims = await actor(call, ['CUSTOMER']);
      if (accountId !== claims.sub) fail(grpc.status.PERMISSION_DENIED, 'FORBIDDEN', 'Customer is outside your access scope.');
      return view(await mine(accountId));
    }
  });
  return {isReady: bus.isReady, close: bus.close};
}
module.exports = {create};
