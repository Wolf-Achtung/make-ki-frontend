/**
 * API helper (Gold-Standard+) – timeout, JSON default.
 * Uses httpOnly cookies for authentication.
 * Exposes: API.request(path, opts), API.get/post/put/del, API.checkAuth(), API.logout()
 */
(function(){
  "use strict";
  function normBase(b){
    try{ return String(b||'/api').replace(/\/+$/,''); }catch(_){ return '/api'; }
  }
  const BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (window.__CONFIG__ && window.__CONFIG__.API_BASE) || '/api';
  const API_BASE = normBase(BASE);

  function rid(){ return 'f-' + Math.random().toString(16).slice(2) + Date.now().toString(16); }

  async function request(path, opts){
    const url = API_BASE + (String(path||'').startsWith('/') ? path : '/' + String(path||''));

    // Add authorization header if token exists
    var authHeaders = {};
    try {
      var token = localStorage.getItem('access_token');
      if (token) {
        authHeaders['Authorization'] = 'Bearer ' + token;
      }
    } catch(_) {}

    const headers = Object.assign(
      { 'Accept':'application/json','Content-Type': 'application/json','X-Client': 'ki-readiness-frontend','X-Req-Id': rid() },
      authHeaders,
      (opts && opts.headers) || {}
    );

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

    // Handle 401 - clear token and redirect to login
    if (res.status === 401) {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('ki_user_email');
      } catch(_) {}
      window.location.href = '/login.html';
      throw new Error('Unauthorized - redirecting to login');
    }

    if (!res.ok){
      const msg = (data && (data.detail || data.message || data.error)) || res.statusText || 'Request failed';
      throw new Error(msg);
    }
    return data;
  }

  // Check authentication status via /api/auth/me
  async function checkAuth(){
    try {
      const data = await request('/auth/me', { method: 'GET' });
      return { isAuthenticated: true, user: data };
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  }

  async function logout(){
    try {
      // Clear local token first
      localStorage.removeItem('access_token');
      localStorage.removeItem('ki_user_email');

      await request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    window.location.href = '/login.html';
  }

  function get(path){ return request(path, { method:'GET' }); }
  function post(path, body){ return request(path, { method:'POST', body: JSON.stringify(body || {}) }); }
  function put(path, body){ return request(path, { method:'PUT', body: JSON.stringify(body || {}) }); }
  function del(path){ return request(path, { method:'DELETE' }); }

  window.API = { request, get, post, put, del, checkAuth, logout };
})();