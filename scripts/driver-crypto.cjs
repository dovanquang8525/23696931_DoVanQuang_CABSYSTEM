'use strict';
const crypto = require('node:crypto');
const {required} = require('./runtime-config.cjs');
function dataKey() {
  const key = Buffer.from(required('DRIVER_DATA_KEY_BASE64'),'base64');
  if (key.length !== 32) throw new Error('Driver data key must contain 32 bytes');
  return key;
}
function encrypt(value) {
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm',dataKey(),iv);
  const content = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return {version:1,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),content:content.toString('base64')};
}
function decrypt(value) {
  const decipher = crypto.createDecipheriv('aes-256-gcm',dataKey(),Buffer.from(value.iv,'base64'));
  decipher.setAuthTag(Buffer.from(value.tag,'base64'));
  return Buffer.concat([decipher.update(Buffer.from(value.content,'base64')),decipher.final()]).toString('utf8');
}
module.exports = {dataKey,encrypt,decrypt};
