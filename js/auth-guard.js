// auth-guard.js — schützt /formular/* Seiten gegen Direktzugriff
(async function(){
  function token(){ try{ return localStorage.getItem('AUTH_TOKEN') || ''; }catch{ return ''; } }
  async function verify(tok){
    if(!tok) return false;
    try{
      const r = await apiFetch('/auth/verify', {
        method: 'GET',
        headers: {'authorization':'Bearer ' + tok},
        cache:'no-store',
        timeoutMs: 5000
      });
      return r.ok;
    }catch(e){ return false; }
  }
  const t = token();
  if(!(await verify(t))){
    const here = encodeURIComponent(location.pathname + location.search);
    location.replace('/login?next=' + here);
  }
  window.logout = function(){
    try{ localStorage.removeItem('AUTH_TOKEN'); }catch{}
    location.replace('/login');
  };
})();
