(function(){
  'use strict';
  const LOGIN_PATH = '/login.html';
  const TOKEN_KEY = 'ki_token';

  function getToken(){
    try{
      const t = localStorage.getItem(TOKEN_KEY);
      if(t) return t;
      const m = document.cookie.match(/(?:^|;\s*)ki_token=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    }catch(e){ return null; }
  }
  function clearToken(){
    try{
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = 'ki_token=; Max-Age=0; Path=/';
    }catch(e){}
  }
  function parseJwt(t){
    try{
      const p = t.split('.')[1];
      const s = p.replace(/-/g,'+').replace(/_/g,'/');
      return JSON.parse(atob(s));
    }catch(e){ return null; }
  }
  function isTokenValid(t){
    const p = parseJwt(t);
    if(!p || typeof p.exp !== 'number') return false;
    const skew = 30;
    return (Date.now()/1000) < (p.exp - skew);
  }
  async function ensureAuth(){
    const t = getToken();
    if(!t || !isTokenValid(t)){
      clearToken();
      const next = encodeURIComponent(location.pathname + location.search + location.hash);
      location.replace(LOGIN_PATH + '?next=' + next);
      return false;
    }
    // Expose helper
    window.authFetch = function(url, opts){
      const headers = Object.assign({}, (opts && opts.headers) || {}, {
        'Authorization': 'Bearer '+ t,
        'Content-Type': 'application/json'
      });
      const finalUrl = /^https?:/i.test(url) ? url : url;
      const finalOpts = Object.assign({}, opts || {}, { headers });
      return fetch(finalUrl, finalOpts);
    };
    window.auth = { clearToken };
    return true;
  }
  if(location.pathname.indexOf('/formular/') !== -1){ ensureAuth(); }
})();