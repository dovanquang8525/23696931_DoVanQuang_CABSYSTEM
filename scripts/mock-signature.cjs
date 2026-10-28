'use strict';
const crypto=require('node:crypto');
const {safeEqual}=require('./rpc-security.cjs');
function sign(raw,timestamp,secret){return 'sha256='+crypto.createHmac('sha256',secret).update(String(timestamp)+'\n').update(raw).digest('hex');}
function verify(raw,timestamp,signature,secret){return typeof signature==='string'&&/^sha256=[0-9a-f]{64}$/.test(signature)&&safeEqual(sign(raw,timestamp,secret),signature);}
module.exports={sign,verify};
