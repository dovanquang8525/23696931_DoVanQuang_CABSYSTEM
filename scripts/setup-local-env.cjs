'use strict';
// Explicit user command. Preserve nonempty settings, fill only missing/empty values.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const target = path.join(root, '.env');
const template = fs.readFileSync(path.join(root, '.env.example'), 'utf8').replace(/^\uFEFF/, '');
if (fs.existsSync(target) && !fs.lstatSync(target).isFile()) throw new Error('.env must be a regular file');
const original = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
let text = original === null ? template : original.replace(/^\uFEFF/, '');
function parse(value) {
  const result = new Map();
  for (const line of value.split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (match) {
      if (result.has(match[1])) throw new Error('Duplicate configuration key: ' + match[1]);
      result.set(match[1], match[2]);
    }
  }
  return result;
}
const values = parse(text);
let count = 0;
for (const [key, initial] of parse(template)) {
  const previous = values.get(key);
  if (previous !== undefined && previous.trim() !== '') continue;
  const sensitive = /PASSWORD$|SECRET$|KEY_BASE64$|REPLICA_KEY$/.test(key);
  const value = sensitive ? crypto.randomBytes(key === 'MONGODB_REPLICA_KEY' ? 48 : 32)
    .toString(/KEY_BASE64$|REPLICA_KEY$/.test(key) ? 'base64' : 'hex') : initial;
  if (value === '') continue;
  if (previous !== undefined) text = text.replace(new RegExp('^' + key + '=.*$', 'm'), key + '=' + value);
  else text += (text.endsWith('\n') ? '' : '\n') + key + '=' + value + '\n';
  count++;
}
if (!count && original !== null) {
  console.log('No changes needed; nonempty values preserved.');
  process.exit(0);
}
if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') !== original) throw new Error('.env changed; refusing write');
const temporary = target + '.setup-' + crypto.randomUUID() + '.tmp';
try {
  fs.writeFileSync(temporary, text, {flag: 'wx', mode: 0o600});
  fs.renameSync(temporary, target);
} finally {
  if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
}
console.log('Prepared ' + count + ' missing/empty settings; existing nonempty values preserved. No secrets printed.');
