'use strict';
const services = Object.freeze(["auth_service","customer_service","driver_service","booking_service","trip_service","payment_service","notification_service","rating_service"]);
function required(key) {
  const value = process.env[key];
  if (!value || !value.trim()) throw new Error('Missing configuration: ' + key);
  return value;
}
function port(key, fallback) {
  const value = Number(process.env[key] || fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error('Invalid port: ' + key);
  return value;
}
function mongoUri(username, password) {
  return 'mongodb://' + encodeURIComponent(username) + ':' + encodeURIComponent(password) +
    '@' + required('MONGODB_HOST') + ':' + port('MONGODB_PORT', 27017) +
    '/?authSource=' + encodeURIComponent(process.env.MONGODB_AUTH_SOURCE || 'admin') +
    '&replicaSet=' + encodeURIComponent(process.env.MONGODB_REPLICA_SET || 'rs0');
}
function ownDatabase(service) {
  if (!services.includes(service)) throw new Error('Unknown service');
  const prefix = service.replace('_service', '').toUpperCase();
  return {name: required(prefix + '_MONGODB_DATABASE'),
    username: required(prefix + '_MONGODB_USERNAME'), password: required(prefix + '_MONGODB_PASSWORD')};
}
function rabbitConfig() {
  return {protocol: 'amqp', hostname: required('RABBITMQ_HOST'), port: port('RABBITMQ_PORT', 5672),
    username: required('RABBITMQ_USERNAME'), password: required('RABBITMQ_PASSWORD'),
    vhost: required('RABBITMQ_VHOST'), heartbeat: 15};
}
module.exports = {services, required, port, mongoUri, ownDatabase, rabbitConfig};
