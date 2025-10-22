(function(){
  "use strict";

  function apiBase(){
    try{
      var meta = document.querySelector('meta[name="api-base"]');
      return (meta && meta.content) || (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '/api';
    } catch(_) { return '/api'; }
  }
  function setMsg(t){ var el=document.getElementById('msg'); if(el) el.textContent=t||''; }
  function setErr(t){ var el=document.getElementById('err'); if(!el)return; el.textContent=t||''; el.hidden=!t; }
  function byId(id){ return document.getElementById(id); }

  var btnReq = byId('btn-request');
  var btnLogin = byId('btn-login');
  var emailEl = byId('email');
  var codeArea = byId('code-area');
  var codeEl = byId('code');

  if(btnReq){
    btnReq.addEventListener('click', async function(){
      setErr(''); setMsg('Sende Code …');
      var email = (emailEl.value || '').trim().toLowerCase();
      if(!email || email.indexOf('@')===-1){ setErr('Bitte gültige E‑Mail eingeben.'); setMsg(''); return; }
      try{
        var res = await fetch(apiBase() + '/auth/request-code', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({email: email})
        });
        if(!res.ok){ throw new Error('Fehler ' + res.status); }
        var data = await res.json().catch(function(){ return {}; });
        setMsg('Code gesendet. Bitte Posteingang prüfen.' + (data.dev_code ? ' (DEV: '+data.dev_code+')' : ''));
        codeArea.style.display = 'block';
        codeEl && codeEl.focus();
      }catch(e){
        setErr('Senden fehlgeschlagen. ' + (e && e.message ? e.message : ''));
        setMsg('');
      }
    });
  }

  if(btnLogin){
    btnLogin.addEventListener('click', async function(){
      setErr(''); setMsg('Anmeldung …');
      var email = (emailEl.value || '').trim().toLowerCase();
      var code = (codeEl.value || '').trim();
      if(!email || !code){ setErr('E‑Mail und Code eingeben.'); setMsg(''); return; }
      try{
        var res = await fetch(apiBase() + '/auth/login', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({email: email, code: code})
        });
        if(!res.ok){
          var txt = await res.text().catch(function(){ return ''; });
          throw new Error('Login fehlgeschlagen (' + res.status + '). ' + txt);
        }
        var data = await res.json();
        if(!(data && data.token)){ throw new Error('Kein Token erhalten'); }
        try{ localStorage.setItem('jwt', data.token); }catch(_){}
        setMsg('Erfolg. Weiterleitung …');
        location.href = '/formular/index.html';
      }catch(e){
        setErr(String(e && e.message ? e.message : e || 'Unbekannter Fehler'));
        setMsg('');
      }
    });
  }
})();