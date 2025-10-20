/* filename: js/api.js
 * Minimal SDK for KI-Status-Report Backend (Gold-Standard+)
 * - Uses window.__CONFIG__.API_BASE as base (falls back to '/api')
 * - Fetch wrapper with retry/backoff, AbortController timeout
 * - Adds Bearer token from localStorage if present
 * - Public: analyze(), result(), generatePdf(), sendFeedback(), health(), login()
 */
(function(global){
  'use strict';

  const CFG = (global.__CONFIG__ || {});
  const API_BASE = (CFG.API_BASE || '/api').replace(/\/$/, '');

  function rid(){
    return (Date.now().toString(36) + Math.random().toString(36).slice(2,8)).toUpperCase();
  }
  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  async function request(path, opts){
    const url = API_BASE + (path.startsWith('/') ? path : '/' + path);
    const headers = Object.assign({
      'Content-Type': 'application/json',
      'X-Request-ID': rid()
    }, (opts && opts.headers) || {});
    // Attach token if present
    try {
      const t = localStorage.getItem('auth_token') || localStorage.getItem('jwt') || localStorage.getItem('token');
      if (t && !headers.Authorization) headers.Authorization = 'Bearer ' + t;
    } catch(_){}
    const controller = new AbortController();
    const timeoutMs = (opts && opts.timeoutMs) || 20000;
    const retry = Math.max(0, (opts && opts.retries) ?? 2);
    let lastErr;
    for (let attempt=0; attempt<=retry; attempt++){
      const timer = setTimeout(()=>controller.abort(), timeoutMs);
      try{
        const res = await fetch(url, Object.assign({method:'GET', headers, signal: controller.signal}, opts));
        clearTimeout(timer);
        if (!res.ok){
          let bodyText = '';
          try { bodyText = await res.text(); } catch(_){}
          const err = new Error('HTTP ' + res.status + (bodyText ? (': ' + bodyText.slice(0,300)) : ''));
          err.status = res.status;
          err.body = bodyText;
          throw err;
        }
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : res.text();
      }catch(err){
        lastErr = err;
        if (attempt < retry) await sleep(400 * (attempt+1));
      }
    }
    throw lastErr;
  }

  // API methods (all paths are relative to API_BASE)
  async function analyze(payload){ return request('/analyze', {method:'POST', body: JSON.stringify(payload || {})}); }
  async function result(reportId){ 
    const id = encodeURIComponent(reportId);
    // Support both /result/<id> and /result?id=<id>
    try { return await request('/result/' + id); }
    catch(e){ return request('/result?id=' + id); }
  }
  async function sendFeedback(item){ return request('/feedback', {method:'POST', body: JSON.stringify(item || {})}); }
  async function health(){ 
    try { return await request('/healthz'); }
    catch(e){ return request('/admin/status'); }
  }
  async function login(email, password){
    const endpoints = ['/login','/auth/login','/auth_login'];
    let last;
    for (const ep of endpoints){
      try {
        const data = await request(ep, {method:'POST', body: JSON.stringify({email, password})});
        const tok = data && (data.access_token || data.token || data.jwt || data.id_token);
        if (tok){ try{ localStorage.setItem('auth_token', tok); }catch(_){}
          return Object.assign({access_token: tok, token_type: data.token_type || 'Bearer'}, data);
        }
        last = new Error('No token field in response');
      } catch(e){
        last = e;
      }
    }
    throw last || new Error('Login failed');
  }

  global.KIAPI = { analyze, result, sendFeedback, health, login, API_BASE };
})(window);
