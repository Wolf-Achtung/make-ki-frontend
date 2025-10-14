// api-base.js — robuste API-Basis-Erkennung (Netlify-Proxy → DirektfallBack)
(function(){
  const STORAGE_KEY = 'API_BASE_CACHE_V1';
  const DIRECT = 'https://make-ki-backend-neu-production.up.railway.app/api';
  const CANDIDATES = [
    '/api', // Netlify-Proxy
    DIRECT   // Direkt zum Railway-Backend (CORS erlaubt im Backend)
  ];
  const ttlMs = 5 * 60 * 1000; // 5 Minuten Cache

  function save(base){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify({base, ts:Date.now()})); }catch{}
  }
  function load(){
    try{
      const o = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if(o && o.base && (Date.now()-o.ts) < ttlMs) return o.base;
    }catch{}
    return null;
  }

  async function probe(base){
    const url = base.replace(/\/$/,'') + '/ping';
    const ctl = new AbortController();
    const t = setTimeout(()=>ctl.abort(), 1500);
    try{
      const r = await fetch(url, {method: 'GET', signal: ctl.signal, cache:'no-store'});
      clearTimeout(t);
      return r.ok;
    }catch(e){
      clearTimeout(t);
      return false;
    }
  }

  async function resolveBase(){
    // 1) Meta/Global override (falls gesetzt)
    if(window.__API_BASE__){
      save(String(window.__API_BASE__));
      return window.__API_BASE__;
    }
    // 2) Cache
    const cached = load();
    if(cached) return cached;
    // 3) Probes (nacheinander, schnell)
    for(const cand of CANDIDATES){
      if(await probe(cand)){
        save(cand);
        return cand;
      }
    }
    // 4) Worst case: nimm Direkt
    save(DIRECT);
    return DIRECT;
  }

  // Expose a tiny helper
  window.API_BASE_READY = resolveBase();
  window.apiFetch = async function(path, init={}){
    const base = await window.API_BASE_READY;
    const url = base.replace(/\/$/,'') + path;
    const ctl = new AbortController();
    const timeout = init.timeoutMs || 10000;
    const t = setTimeout(()=>ctl.abort(), timeout);
    try{
      const r = await fetch(url, {...init, signal: ctl.signal});
      clearTimeout(t);
      return r;
    }catch(e){
      clearTimeout(t);
      // Fallback: wenn Netlify-Proxy 502 oder abort → Direkt versuchen
      if(base !== DIRECT){
        try{
          const r2 = await fetch(DIRECT.replace(/\/$/,'') + path, {...init});
          return r2;
        }catch(e2){}
      }
      throw e;
    }
  };
})();
