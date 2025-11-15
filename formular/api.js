// filename: formular/api.js
// Unified API helper using window.__CONFIG__.API_BASE
(function (global) {
  'use strict';
  const CFG = global.__CONFIG__ || {};
  const BASE = (CFG.API_BASE || '/api').replace(/\/$/, '');

  function isTokenExpired(token){
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false; // No expiry = treat as valid
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch(_) {
      return true; // If we can't decode, treat as expired
    }
  }

  async function jsonFetch(url, options){
    const cfg = Object.assign({
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      method: 'GET'
    }, options);
    // auth token if present
    try {
      const t = localStorage.getItem('jwt');
      // Check if token is expired before making request
      if (t && isTokenExpired(t)) {
        localStorage.removeItem('jwt');
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login.html';
        }
        throw new Error('Token expired');
      }
      if (t && !cfg.headers.Authorization) cfg.headers.Authorization = 'Bearer ' + t;
    } catch(e){
      if (e.message === 'Token expired') throw e;
    }
    const resp = await fetch(url, cfg);
    const ct = resp.headers.get('content-type') || '';
    let payload = null;
    if (ct.includes('application/json')) {
      try { payload = await resp.json(); } catch (_e) { payload = null; }
    } else { try { payload = await resp.text(); } catch (_e) { payload = null; } }
    if (!resp.ok) {
      // Handle 401 Unauthorized - remove token and redirect to login
      if (resp.status === 401) {
        try { localStorage.removeItem('jwt'); } catch(_){}
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login.html';
        }
      }
      const err = new Error('HTTP ' + resp.status);
      err.status = resp.status; err.payload = payload; throw err;
    }
    return payload;
  }

  async function healthz(){ return jsonFetch(BASE + '/healthz'); }
  async function analyze(body){ return jsonFetch(BASE + '/analyze', { method: 'POST', body: JSON.stringify(body || {}) }); }
  async function result(reportId){ return jsonFetch(BASE + '/result/' + encodeURIComponent(reportId)); }
  async function sendFeedback(body){ return jsonFetch(BASE + '/feedback', { method: 'POST', body: JSON.stringify(body || {}) }); }

  global.KIAPI = { BASE, healthz, analyze, result, sendFeedback };
})(window);
