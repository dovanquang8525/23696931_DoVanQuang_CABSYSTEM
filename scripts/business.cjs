'use strict';
const crypto = require('node:crypto');
const {ObjectId} = require('mongodb');
const {allocateId}=require('./short-ids.cjs');
const rpc = require('./rpc-security.cjs');
const v = require('./identity-validation.cjs');
const {checkEnvelope} = require('./event-bus.cjs');
const now = () => new Date().toISOString();
const conflict = () => rpc.fail(rpc.grpc.status.ABORTED, 'INVALID_STATE', 'Operation conflicts with the current state.');
const forbidden = () => rpc.fail(rpc.grpc.status.PERMISSION_DENIED, 'FORBIDDEN', 'Resource is outside your access scope.');
const missing = () => rpc.fail(rpc.grpc.status.NOT_FOUND, 'NOT_FOUND', 'Resource does not exist.');
function coords(value) {
  v.fields(value, ['latitude','longitude'], ['latitude','longitude']);
  if (!Number.isFinite(value.latitude) || Math.abs(value.latitude) > 90 ||
      !Number.isFinite(value.longitude) || Math.abs(value.longitude) > 180) v.invalid();
  return {latitude: value.latitude, longitude: value.longitude};
}
function distance(a, b) {
  const r = Math.PI / 180, dlat = (b.latitude-a.latitude)*r, dlon = (b.longitude-a.longitude)*r;
  const h = Math.sin(dlat/2)**2 + Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.sin(dlon/2)**2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
function fare(km, pricing) {
  if (!Number.isFinite(km) || km < 0 || !pricing ||
      !['base_fare','rate_per_km','rounding_unit'].every(k => Number.isSafeInteger(pricing[k]) && pricing[k] > 0)) return undefined;
  const amount = pricing.rounding_unit * Math.ceil((pricing.base_fare + pricing.rate_per_km * km)/pricing.rounding_unit);
  return Number.isSafeInteger(amount) && amount <= 1e12 ? amount : undefined;
}
function key(value) { if (typeof value !== 'string' || !/^[!-~]{1,128}$/.test(value)) v.invalid(); return value; }
function hash(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function pick(row, keys) { return Object.fromEntries(keys.filter(k => row[k] !== undefined).map(k => [k,row[k]])); }
const views = {
  booking: row => pick(row, ['booking_id','customer_id','vehicle_type','pickup','destination','status','distance_km','pricing_snapshot','trip_id','created_at','updated_at']),
  trip: row => pick(row, ['trip_id','booking_id','customer_id','driver_id','vehicle_id','status','pickup','destination','vehicle_type','driver','distance_km','fare_amount','currency','latest_location','assigned_at','arrived_at','started_at','completed_at','canceled_at']),
  payment: row => pick(row, ['payment_id','trip_id','method','status','amount','currency','reference_code','attempt_number','created_at','confirmed_at','failure_code']),
  invitation: row => pick(row, ['invitation_id','booking_id','driver_id','pickup','destination','vehicle_type','status','expires_at','responded_at']),
  review: row => pick(row, ['review_id','trip_id','customer_id','driver_id','rating','comment','created_at']),
  notification: row => pick(row, ['notification_id','recipient_account_id','event_id','type','content','related_entity_type','related_entity_id','occurred_at','created_at'])
};
function context(service, db, client) {
  const tx = work => client.withSession(session => session.withTransaction(() => work(session),
    {readConcern: {level:'snapshot'}, writeConcern:{w:'majority'}, maxCommitTimeMS:5000}));
  async function actor(call, roles) {
    const {claims,token} = rpc.authorization(call);
    if (!roles.includes(claims.role)) forbidden();
    const access = await rpc.invoke('auth','getAccountAccess',{account_id:claims.sub},{caller:service, token, call});
    if (access.role !== claims.role) rpc.fail(rpc.grpc.status.UNAUTHENTICATED,'INVALID_TOKEN','Invalid access token.');
    if (access.status !== 'ACTIVE') rpc.fail(rpc.grpc.status.PERMISSION_DENIED,'ACCOUNT_DISABLED','Account is not active.');
    return {claims,token,aid:access.aid};
  }
  const invoke = (name, method, input, call) => rpc.invoke(name,method,input,
    {caller:service, call, token:call ? rpc.authorization(call).token : undefined});
  async function emit(type, id, payload, session, version = 1) {
    const envelope = checkEnvelope({eventId:crypto.randomUUID(), eventType:type, occurredAt:now(),
      producer:service, aggregateId:id, aggregateVersion:version, correlationId:rpc.correlationId(), payload});
    await db.collection('outbox_events').insertOne({_id:envelope.eventId,envelope,createdAt:new Date(),publishedAt:null},{session});
  }
  return {tx,actor,invoke,emit};
}
async function page(collection, filter, paging, view, sort = {created_at:-1,_id:-1}) {
  const {page,limit} = v.pagination(paging);
  return {items:await Promise.all((await collection.find(filter).sort(sort).skip((page-1)*limit).limit(limit).toArray()).map(view)),
    page,limit,total_items:await collection.countDocuments(filter)};
}
function camel(value) {
  if (Array.isArray(value)) return value.map(camel);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([k]) => !k.startsWith('_')).map(([k,v]) =>
    [k.replace(/_([a-z])/g,(_,l)=>l.toUpperCase()),camel(v)]));
}
module.exports = {...rpc,v,now,allocateId,coords,distance,fare,key,hash,pick,views,context,page,camel,conflict,forbidden,missing,ObjectId};
