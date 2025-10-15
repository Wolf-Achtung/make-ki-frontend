// auth-guard.js — schützt /formular/*, aber mit Bypass-Option für Tests
(function(){
  const DISABLED = (window.__AUTH_DISABLED__ === true)
                || (new URLSearchParams(location.search).get('auth') === 'off')
                || (function(){ try{ return localStorage.getItem('AUTH_BYPASS') === '1'; }catch(_){ return false; } })();

  function log(){ if(window.__AUTH_DEBUG__) try{ console.log.apply(console, arguments);}catch(_){ } }

  async function verify(tok){
    if(!tok) return false;
    try{
      const r = await apiFetch('/auth/verify', {
        method: 'GET',
        headers: {'authorization':'Bearer ' + tok},
        cache:'no-store',
        timeoutMs: 6000
      });
      return r.ok;
    }catch(e){ return false; }
  }

  (async function(){
    if(DISABLED){
      log('[auth-guard] BYPASS enabled – Zugriff ohne Token erlaubt.');
      return;
    }
    let t = ''; try{ t = localStorage.getItem('AUTH_TOKEN') || ''; }catch(_){}
    const ok = await verify(t);
    if(!ok){
      const here = encodeURIComponent(location.pathname + location.search);
      location.replace('/login?next=' + here);
    }
  })();

  window.logout = function(){
    try{ localStorage.removeItem('AUTH_TOKEN'); localStorage.removeItem('AUTH_BYPASS'); }catch{}
    location.replace('/login');
  };
})();