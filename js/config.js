(function(){
  const meta = document.querySelector('meta[name=api-base]');
  const base = (meta && meta.content) || window.API_BASE || '/api';
  window.APP_CONFIG = { API_BASE: base };
})();
