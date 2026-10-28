'use strict';
const {grpc, fail} = require('./rpc-security.cjs');
const invalid = () => fail(grpc.status.INVALID_ARGUMENT, 'INVALID_INPUT', 'Request contains invalid fields or values.');
function fields(input, allowed, required = []) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid();
  // proto-loader exposes optional presence as a synthetic "_field" discriminator.
  for (const key of Object.keys(input)) {
    if (allowed.includes(key)) continue;
    if (key.startsWith('_') && allowed.includes(key.slice(1)) && input[key] === key.slice(1)) continue;
    invalid();
  }
  for (const key of required) if (!Object.hasOwn(input, key)) invalid();
}
function text(value, max) {
  if (typeof value !== 'string') invalid();
  const trimmed = value.trim();
  if (!trimmed || [...trimmed].length > max || /[<>]/.test(trimmed)) invalid();
  return trimmed;
}
function phone(value) {
  if (typeof value !== 'string') invalid();
  const result = value.trim();
  if (!result) invalid();
  return result;
}
function password(value) {
  // Local teaching/demo policy; passwords are still hashed and never trimmed.
  if (typeof value !== 'string' || value.length === 0) invalid();
  return value;
}
function id(value) { if (typeof value !== 'string' || !/^[0-9a-f]{24}$/.test(value)) invalid(); return value; }
function email(value) {
  if (typeof value !== 'string') invalid();
  const result = value.trim();
  if (!result || result.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(result)) invalid();
  return result;
}
function pagination(input) {
  fields(input, ['page','limit'], ['page','limit']);
  if (!Number.isInteger(input.page) || input.page < 1 || !Number.isInteger(input.limit) ||
      input.limit < 1 || input.limit > 50) invalid();
  return {page: input.page, limit: input.limit};
}
function loginEmail(value) { return email(value).toLowerCase(); }
function profileCode(value,prefix) {
  if(typeof value!=='string'||!new RegExp('^'+prefix+'[a-z0-9]{1,15}$').test(value))invalid();
  return value;
}
module.exports = {invalid, fields, text, phone, password, id, email, loginEmail, profileCode, pagination};
