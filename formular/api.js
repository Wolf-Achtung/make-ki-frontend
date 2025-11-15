// filename: formular/api.js
// Unified API helper using window.__CONFIG__.API_BASE
(function (global) {
  'use strict';
  const CFG = global.__CONFIG__ || {};
  const BASE = (CFG.API_BASE || '/api').replace(/\/$/, '');

  async function jsonFetch(url, options){
    // Add authorization header if token exists
    var authHeaders = {};
    try {
      var token = localStorage.getItem('access_token');
      if (token) {
        authHeaders['Authorization'] = 'Bearer ' + token;
      }
    } catch(_) {}

    const baseHeaders = Object.assign({ 'Content-Type': 'application/json' }, authHeaders);
    const cfg = Object.assign({
      headers: baseHeaders,
      credentials: 'include',
      method: 'GET'
    }, options);

    // Merge headers if options already contains headers
    if (options && options.headers) {
      cfg.headers = Object.assign({}, baseHeaders, options.headers);
    }

    const resp = await fetch(url, cfg);
    const ct = resp.headers.get('content-type') || '';
    let payload = null;
    if (ct.includes('application/json')) {
      try { payload = await resp.json(); } catch (_e) { payload = null; }
    } else { try { payload = await resp.text(); } catch (_e) { payload = null; } }

    // Handle 401 - clear token and redirect to login
    if (resp.status === 401) {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('ki_user_email');
      } catch(_) {}
      global.location.href = '/login.html';
      const err = new Error('Unauthorized - redirecting to login');
      err.status = 401; err.payload = payload; throw err;
    }

    if (!resp.ok) {
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
