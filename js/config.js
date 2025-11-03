(function(){
  try{
    var meta = document.querySelector('meta[name=api-base]');
    var base = (meta && meta.content) || window.API_BASE || '/api';
    base = String(base||'/api').replace(/\/+$/,''); // trim trailing slashes
    window.APP_CONFIG = window.APP_CONFIG || {};
    window.APP_CONFIG.API_BASE = base;
    window.__CONFIG__ = window.__CONFIG__ || {};
    window.__CONFIG__.API_BASE = base;
  }catch(_){}
})();