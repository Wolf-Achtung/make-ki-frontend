// netlify/edge-functions/login.js
// Token-only Login (Edge) – erstellt JWT mit HS256 aus JWT_SECRET (Netlify ENV).
// Dient als Fallback/Standard, damit Login nie am Upstream scheitert.
export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({detail: 'method not allowed'}), {status:405, headers:{'content-type':'application/json'}});
  }
  let body = {};
  try { body = await request.json(); } catch {}
  const email = String((body.email || '')).trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({detail:'email required'}), {status:400, headers:{'content-type':'application/json'}});
  }
  const secret = Deno.env.get('JWT_SECRET') || 'dev-secret';
  const now = Math.floor(Date.now()/1000);
  const payload = { sub: email, iat: now, exp: now + 14*24*3600 };
  const header = { alg: 'HS256', typ: 'JWT' };

  const enc = (obj) => base64url(JSON.stringify(obj));
  const unsigned = enc(header) + '.' + enc(payload);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned));
  const token = unsigned + '.' + base64urlBytes(new Uint8Array(sig));

  return new Response(JSON.stringify({ token, email }), {status:200, headers:{'content-type':'application/json','cache-control':'no-store'}});
};

function base64url(str){
  const bytes = new TextEncoder().encode(str);
  return base64urlBytes(bytes);
}
function base64urlBytes(bytes){
  let bin = '';
  for (let i=0;i<bytes.length;i++){ bin += String.fromCharCode(bytes[i]); }
  let b64 = btoa(bin);
  return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
