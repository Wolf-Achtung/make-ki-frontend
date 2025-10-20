// filename: config.js
// Single source of truth for frontend runtime configuration.
// How it works:
// 1) We try to read a backend base from various sources (window vars, <meta>, etc.).
// 2) We compute API_BASE by appending '/api' (if not already present).
// 3) Everything is exposed via window.__CONFIG__ for other scripts.
//
// To configure in production (Netlify): simply edit this file or
// replace it during build. You can also host a site-specific copy.
(function(w, d){
  'use strict';
  function readMeta(name){
    const m = d.querySelector(`meta[name="${name}"]`);
    return m && m.content ? m.content.trim() : '';
  }
  function pick(...vals){
    for (const v of vals){
      if (v && String(v).trim()) return String(v).trim();
    }
    return '';
  }
  const origin = pick(
    // explicit globals (keep for backwards-compat)
    w.BACKEND_URL,
    w.ENV_BACKEND,
    w.__BACKEND_URL__,
    (w.NETLIFY && w.NETLIFY.env && w.NETLIFY.env.BACKEND_URL),
    // meta fallbacks (support several historic names)
    readMeta('backend'), readMeta('backend-url'), readMeta('api-base'),
    // final fallback: empty => same-origin
    ''
  ).replace(/\/$/, '');

  // Ensure '/api' suffix (but not doubled)
  function withApi(o){
    if (!o) return '/api';
    return /\/api\/?$/.test(o) ? o.replace(/\/$/, '') : (o + '/api');
  }
  const API_BASE = withApi(origin);

  // Expose merged config
  w.__CONFIG__ = Object.assign({}, w.__CONFIG__ || {}, {
    BACKEND_BASE_URL: origin,
    API_BASE: API_BASE
  });

  // Convenience also keep legacy names
  w.ENV_BACKEND = origin || w.ENV_BACKEND;
})(window, document);
