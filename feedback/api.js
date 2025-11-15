// filename: api.js
// Gold-Standard+: robust base URL resolution + small fetch helper
(function (global) {
  'use strict';

  function resolveBaseUrl() {
    const meta = document.querySelector('meta[name="backend-url"]') || document.querySelector('meta[name="api-base"]');
    const fromMeta = meta && meta.content ? meta.content : null;
    const fromWindow = (typeof window !== 'undefined' && window.__BACKEND_URL__) ? window.__BACKEND_URL__ : null;
    const fromAppConfig = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.API_BASE) ? window.APP_CONFIG.API_BASE : null;
    const fallback = 'https://api-ki-backend-neu-production.up.railway.app/api';
    const decided = (fromAppConfig || fromWindow || fromMeta || fallback).trim().replace(/\/$/, '');
    return decided;
  }

  const BASE = resolveBaseUrl();

  async function jsonFetch(url, options={}) {
    const cfg = Object.assign({
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      method: 'GET'
    }, options);
    const resp = await fetch(url, cfg);
    const ct = resp.headers.get('content-type') || '';
    let payload = null;
    if (ct.includes('application/json')) {
      try { payload = await resp.json(); } catch (_e) { payload = null; }
    } else {
      try { payload = await resp.text(); } catch (_e) { payload = null; }
    }
    if (!resp.ok) {
      const err = new Error('HTTP ' + resp.status);
      err.status = resp.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  }

  async function healthz() {
    return jsonFetch(BASE + '/healthz');
  }

  async function analyze(body) {
    return jsonFetch(BASE + '/analyze', {
      method: 'POST',
      body: JSON.stringify(body || {})
    });
  }

  async function result(reportId) {
    return jsonFetch(BASE + '/result/' + encodeURIComponent(reportId));
  }

  async function sendFeedback(body) {
    return jsonFetch(BASE + '/feedback', {
      method: 'POST',
      body: JSON.stringify(body || {})
    });
  }

  // expose in global scope (no bundler)
  global.KIAPI = { BASE, healthz, analyze, result, sendFeedback };

})(window);