// netlify/edge-functions/verify.js
// Verifiziert ein Bearer-JWT per HS256 lokal am Edge – kein Upstream nötig.
export default async (request, context) => {
  const auth = request.headers.get('authorization') || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return new Response(JSON.stringify({ok:false, detail:'no token'}), {status:401, headers:{'content-type':'application/json'}});
  }
  const token = parts[1];
  try {
    const [h,p,s] = token.split('.');
    if (!h || !p || !s) throw new Error('bad token');
    const secret = Deno.env.get('JWT_SECRET') || 'dev-secret';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['verify']);
    const signed = h + '.' + p;
    const sigBytes = b64urlToBytes(s);
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(signed));
    if (!ok) throw new Error('invalid signature');
    // Check exp (payload)
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
    if (payload.exp && Math.floor(Date.now()/1000) > payload.exp) {
      return new Response(JSON.stringify({ok:false, detail:'expired'}), {status:401, headers:{'content-type':'application/json'}});
    }
    return new Response(JSON.stringify({ok:true, email: payload.sub || ''}), {status:200, headers:{'content-type':'application/json','cache-control':'no-store'}});
  } catch (e){
    return new Response(JSON.stringify({ok:false, detail:'invalid token'}), {status:401, headers:{'content-type':'application/json'}});
  }
};

function b64urlToBytes(str){
  str = str.replace(/-/g,'+').replace(/_/g,'/');
  const pad = str.length % 4 === 2 ? '==' : (str.length % 4 === 3 ? '=' : '');
  const b64 = str + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++){ bytes[i] = bin.charCodeAt(i); }
  return bytes;
}
