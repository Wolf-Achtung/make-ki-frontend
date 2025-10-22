/**
 * Lightweight API helper with JWT storage.
 */
(function(){
  const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '/api';
  function getToken(){ return localStorage.getItem('jwt') || ''; }
  async function request(path, opts){
    const headers = Object.assign({ 'Content-Type': 'application/json' }, (opts && opts.headers)||{});
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API_BASE + path, Object.assign({}, opts, { headers }));
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok){ throw new Error((data && (data.detail || data.message)) || res.statusText); }
    return data;
  }
  window.API = { request, getToken };
})();
