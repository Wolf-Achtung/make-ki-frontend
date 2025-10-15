// Netlify scheduled function: hält Railway wach
export async function handler() {
  const url = 'https://make.ki-sicherheit.jetzt/healthz';
  try{
    const r = await fetch(url, { headers: { 'user-agent':'netlify-keepalive' }, cache:'no-store' });
    return { statusCode: 200, body: 'keepalive ' + r.status };
  }catch(_){
    return { statusCode: 200, body: 'keepalive error' };
  }
}
