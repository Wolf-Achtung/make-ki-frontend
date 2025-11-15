// filename: formular/api.js
// Unified API helper using window.__CONFIG__.API_BASE
(function (global) {
  'use strict';
  const CFG = global.__CONFIG__ || {};
  const BASE = (CFG.API_BASE || '/api').replace(/\/$/, '');

  async function jsonFetch(url, options){
    const cfg = Object.assign({
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      method: 'GET'
    }, options);
    const resp = await fetch(url, cfg);
    const ct = resp.headers.get('content-type') || '';
    let payload = null;
    if (ct.includes('application/json')) {
      try { payload = await resp.json(); } catch (_e) { payload = null; }
    } else { try { payload = await resp.text(); } catch (_e) { payload = null; } }
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
