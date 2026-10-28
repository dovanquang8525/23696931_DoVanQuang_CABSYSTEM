'use strict';
// Optional browser test tool, not a CAB microservice or public product endpoint.
const http=require('node:http');
const page=String.raw`<!doctype html><html lang="vi"><meta charset="utf-8"><title>CAB XSS browser check</title>
<h1>CAB XSS browser check</h1><p>Nhập token CUSTOMER local. Request đi qua Gateway; token chỉ giữ trong trang này.</p>
<label>Customer token <input id="token" type="password" autocomplete="off"></label><button id="run">Kiểm tra</button>
<pre id="result"></pre><pre id="json"></pre>
<script>
let executed=0;window.alert=()=>{executed++};
document.getElementById('run').onclick=async()=>{
  const result=document.getElementById('result'),output=document.getElementById('json');
  try{
    const response=await fetch('/probe',{method:'POST',headers:{'Content-Type':'application/json',
      Authorization:'Bearer '+document.getElementById('token').value},body:JSON.stringify({name:'<img src=x onerror="alert(1)"><script>alert(1)<'+ '/script>'})});
    const body=await response.json();output.textContent=JSON.stringify(body,null,2);
    await new Promise(resolve=>setTimeout(resolve,500));
    const ok=response.status===400&&executed===0&&output.querySelectorAll('script,img').length===0;
    result.textContent=JSON.stringify({status:ok?'RUNTIME_VERIFIED':'FAILED',httpStatus:response.status,
      executed,rendering:'textContent',checkedAt:new Date().toISOString()},null,2);
  }catch{result.textContent='FAILED: kiểm tra Gateway/token/harness.';}
};
</script></html>`;
const server=http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(page);return;
  }
  if(req.method!=='POST'||req.url!=='/probe'){res.writeHead(404);res.end();return;}
  try{
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;if(size>4096)throw new Error('too large');chunks.push(chunk);}
    const upstream=await fetch((process.env.CAB_BASE_URL||'http://localhost:3000')+'/api/v1/customers/me',{
      method:'PATCH',headers:{'Content-Type':'application/json',Authorization:req.headers.authorization||''},body:Buffer.concat(chunks),signal:AbortSignal.timeout(5000)});
    res.writeHead(upstream.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(await upstream.text());
  }catch{res.writeHead(503,{'Content-Type':'application/json'});res.end('{"code":"HARNESS_UNAVAILABLE"}');}
});
server.listen(3100,'127.0.0.1',()=>console.log('Open http://127.0.0.1:3100 in a browser. No browser test has run yet.'));
