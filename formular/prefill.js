(function(){
  const STORAGE_PREFIX = "autosave_form_";
  const LANG = "de";

  function getToken(){ try{ return localStorage.getItem('jwt') || ""; }catch(_){ return ""; } }
  function decodeEmailFromJWT(token){
    try{
      const p = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
      return p.email || p.preferred_username || p.sub || "user";
    }catch(_){ return "user"; }
  }
  function autosaveKey(email){ return STORAGE_PREFIX + email + ":" + LANG; }
  function apiBase(){ const m=document.querySelector('meta[name="api-base"]'); return (m && m.content) || '/api'; }

  async function api(path, opts){
    const headers = Object.assign({"Content-Type":"application/json"}, (opts && opts.headers)||{});
    const t = getToken(); if (t) headers.Authorization = "Bearer " + t;
    const res = await fetch(apiBase() + path, Object.assign({}, opts, { headers }));
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error((data && data.detail) || res.statusText);
    return data;
  }

  async function prefill(){
    const t = getToken(); if (!t) return;
    const email = decodeEmailFromJWT(t);
    const key = autosaveKey(email);
    try{
      let payload = null;
      const draft = await api('/briefings/draft').catch(()=>null);
      if (draft && draft.draft && draft.draft.answers) payload = draft.draft.answers;
      if (!payload){
        const latest = await api('/briefings/me/latest').catch(()=>null);
        if (latest && latest.briefing && latest.briefing.answers) payload = latest.briefing.answers;
      }
      if (payload){
        let current = {}; try{ current = JSON.parse(localStorage.getItem(key) || '{}'); }catch(_){}
        const merged = Object.assign({}, payload, current);
        localStorage.setItem(key, JSON.stringify(merged));
      }
    }catch(_){}
  }

  async function pushDraft(){
    const t = getToken(); if (!t) return;
    const email = decodeEmailFromJWT(t); const key = autosaveKey(email);
    let data = {}; try{ data = JSON.parse(localStorage.getItem(key) || '{}'); }catch(_){}
    if (!data || Object.keys(data).length === 0) return;
    await api('/briefings/draft', { method:'PUT', body: JSON.stringify({ lang: LANG, answers: data }) }).catch(()=>{});
  }

  document.addEventListener('DOMContentLoaded', function(){
    prefill();
    setInterval(pushDraft, 15000);
  });
})();