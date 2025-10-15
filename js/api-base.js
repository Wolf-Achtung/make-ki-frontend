// api-base.js — Proxy-only: immer /api auf der eigenen Domain (Netlify-Proxy).
(function(){
  // Keine Fallbacks mehr, kein Direktzugriff auf Railway
  window.apiFetch = async function(path, init={}){
    const url = '/api' + (path.startsWith('/') ? path : '/' + path);
    const ctl = new AbortController();
    const timeout = init.timeoutMs || 10000;
    const t = setTimeout(()=>ctl.abort(), timeout);
    try{
      const r = await fetch(url, {...init, signal: ctl.signal, cache: 'no-store'});
      clearTimeout(t);
      return r;
    }catch(e){
      clearTimeout(t);
      throw e;
    }
  };
})();
