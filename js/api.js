/**
 * API helper (Gold-Standard+) – timeout, 401 auto-logout, JSON default.
 * Exposes: API.request(path, opts), API.get/post/put/del, API.getToken()
 */
(function(){
  "use strict";
  function normBase(b){
    try{ return String(b||'/api').replace(/\/+$/,''); }catch(_){ return '/api'; }
  }
  const BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (window.__CONFIG__ && window.__CONFIG__.API_BASE) || '/api';
  const API_BASE = normBase(BASE);

  function getToken(){ try { return localStorage.getItem('jwt') || ''; } catch(_) { return ''; } }
  function rid(){ return 'f-' + Math.random().toString(16).slice(2) + Date.now().toString(16); }

  async function request(path, opts){
    const url = API_BASE + (String(path||'').startsWith('/') ? path : '/' + String(path||''));
    const headers = Object.assign(
      { 'Accept':'application/json','Content-Type': 'application/json','X-Client': 'ki-readiness-frontend','X-Req-Id': rid() },
      (opts && opts.headers) || {}
    );
    const t = getToken(); if (t) headers['Authorization'] = 'Bearer ' + t;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), (opts && opts.timeout) || 25000);

    let res, data, ct;
    try{
      res = await fetch(url, Object.assign({ keepalive:true, credentials:'include', signal:controller.signal }, opts, { headers }));
      ct = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
      data = ct && ct.indexOf('application/json') >= 0 ? await res.json() : await res.text();
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok){
      if (res.status === 401){ try{ localStorage.removeItem('jwt'); }catch(_){} }
      const msg = (data && (data.detail || data.message || data.error)) || res.statusText || 'Request failed';
      throw new Error(msg);
    }
    return data;
  }

  function get(path){ return request(path, { method:'GET' }); }
  function post(path, body){ return request(path, { method:'POST', body: JSON.stringify(body || {}) }); }
  function put(path, body){ return request(path, { method:'PUT', body: JSON.stringify(body || {}) }); }
  function del(path){ return request(path, { method:'DELETE' }); }

  window.API = { request, get, post, put, del, getToken };
})();