// api-base.js — Proxy-only: immer /api auf der eigenen Domain (Netlify-Proxy).
(function(){
  function reqId(){ try{ return (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()); }catch(_){ return String(Date.now()); } }
  window.apiFetch = async function(path, init={}){
    const url = '/api' + (path.startsWith('/') ? path : '/' + path);
    const ctl = new AbortController();
    const timeout = init.timeoutMs || 12000;
    const headers = Object.assign({'x-request-id': reqId()}, init.headers||{});
    const t = setTimeout(()=>ctl.abort(), timeout);
    try{
      const r = await fetch(url, {...init, headers, signal: ctl.signal, cache: 'no-store', credentials:'omit'});
      clearTimeout(t);
      return r;
    }catch(e){
      clearTimeout(t);
      throw e;
    }
  };
})();