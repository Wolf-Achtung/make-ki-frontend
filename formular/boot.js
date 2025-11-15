/* boot.js – robuster Loader für den Formbuilder */
(function(){
  const statusEl = document.getElementById('status');
  const errEl = document.getElementById('errlog');
  const guardEl = document.getElementById('guard');

  function setStatus(t){
    if (statusEl) statusEl.textContent = t || '';
    console.log('[Formbuilder]', t);
  }

  function showErr(e){
    const msg = (e && (e.stack || e.message || String(e))) || 'Unbekannter Fehler';
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = msg;
    }
    console.error('[Formbuilder]', e);
    setStatus('');
  }

  // Auth-Guard: check for auth cookie (quick check)
  // Note: Proper validation happens server-side on API calls
  if (window.AUTH && !window.AUTH.hasAuthCookie()){
    if (guardEl) guardEl.textContent = 'Sie sind nicht eingeloggt. Bitte zurück zum Login.';
    location.href = '/login.html';
    return;
  } else {
    if (guardEl) guardEl.textContent = ' ';
  }

  // API-Basis
  const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '/api';
  window.__FORM_CTX__ = { API_BASE, root: '#formbuilder' };

  // Versuch: Modul-Import zuerst (falls ESM), sonst Fallback auf klassisches Script
  async function loadBuilder(){
    setStatus('Lade Fragebogen ...');
    const src = '/formular/formbuilder_de_SINGLE_FULL.js';
    try {
      const mod = await import(src);
      setStatus('Fragebogen geladen.');
      tryMount(mod);
    } catch(_){
      // Fallback auf klassisches Script
      const s = document.createElement('script'); s.src = src; s.defer = true;
      s.onload = function(){ setStatus('Fragebogen geladen.'); tryMount(window); };
      s.onerror = function(){ showErr(new Error('Formbuilder konnte nicht geladen werden: ' + src)); };
      document.head.appendChild(s);
    }
  }

  function tryMount(scope){
    // Try the exported initFormBuilder function first
    if (typeof window.initFormBuilder === 'function'){
      try{
        window.initFormBuilder();
        setStatus('');
        return;
      }
      catch(e){ return showErr(e); }
    }

    // Fallback: try other known initializers
    const rootSel = window.__FORM_CTX__.root;
    const cands = [
      'renderForm','renderFormBuilder','initForm','startForm','bootstrapForm','mountForm'
    ];
    for (const name of cands){
      const fn = scope && scope[name];
      if (typeof fn === 'function'){
        try{ return fn(rootSel, window.__FORM_CTX__); }
        catch(e){ return showErr(e); }
      }
    }
    // Objektvariante
    const FB = scope && (scope.FormBuilder || scope.Form || scope.App);
    if (FB && typeof FB.init === 'function'){
      try{ return FB.init(rootSel, window.__FORM_CTX__); }
      catch(e){ return showErr(e); }
    }
    showErr('Form-Script geladen, aber kein Initialisierer gefunden (render/init/start).');
  }

  // Globales Fehlernetz
  window.addEventListener('error', ev => showErr(ev.error || ev.message));
  window.addEventListener('unhandledrejection', ev => showErr(ev.reason));

  loadBuilder();
})();
