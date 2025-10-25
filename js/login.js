(function(){
  "use strict";

  // ---------- Toasts ----------
  function toast(type, title, text, timeout){
    var stack = document.getElementById('toasts');
    if(!stack){ return; }
    var el = document.createElement('div');
    el.className = 'toast ' + (type||'info');
    el.setAttribute('role','status');
    el.innerHTML = '<div><div class="title">'+ (title||'') +'</div><div>'+ (text||'') +'</div></div><div class="close" aria-label="Schließen" tabindex="0">×</div>';
    stack.appendChild(el);
    var close = el.querySelector('.close');
    function rm(){ try{ el.remove(); }catch(_){} }
    if(close){ close.onclick = rm; close.onkeydown = function(e){ if(e.key==='Enter'||e.key===' ') rm(); }; }
    setTimeout(rm, Math.max(2500, timeout || 4500));
  }
  function ok(m){ toast('success','Erfolg', m || 'Aktion erfolgreich.'); }
  function warn(m){ toast('warning','Hinweis', m || 'Bitte prüfen.'); }
  function err(m){ toast('error','Fehler', m || 'Es ist ein Fehler aufgetreten.'); }

  // ---------- helpers ----------
  function apiBase(){
    try{
      var meta = document.querySelector('meta[name="api-base"]');
      return (meta && meta.content) || (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '/api';
    } catch(_) { return '/api'; }
  }
  function setText(id, text, isError){
    var elErr = document.getElementById('err');
    var elMsg = document.getElementById('msg');
    if(isError){
      if(elErr){ elErr.textContent = text || ''; }
      if(elMsg){ elMsg.textContent = ''; }
    }else{
      if(elErr){ elErr.textContent = ''; }
      if(elMsg){ elMsg.textContent = text || ''; }
    }
  }
  function byId(id){ return document.getElementById(id); }
  function disable(el, on){ try{ el.disabled=!!on; if(on){ el.dataset.label=el.textContent; el.textContent='Bitte warten…'; } else { el.textContent=el.dataset.label||el.textContent; } }catch(_){} }
  function readJsonSafe(res){ return res.text().then(function(t){ try{ return JSON.parse(t||'{}'); }catch(_){ return {}; } }); }
  function minutes(n){ return Math.max(1, Math.round(n/60)); }

  var BTN_REQ = byId('btn-request');
  var BTN_LOGIN = byId('btn-login');
  var EMAIL = byId('email');
  var CODE_AREA = byId('code-area');
  var CODE = byId('code');

  // Prefill email from localStorage
  try{ var stored = localStorage.getItem('ki_email'); if(stored && EMAIL) EMAIL.value = stored; }catch(_){}

  // ---------- Request Code ----------
  if(BTN_REQ){
    BTN_REQ.addEventListener('click', function(){
      (async function(){
        setText('msg','Sende Code …',false);
        var email = (EMAIL.value||'').trim().toLowerCase();
        if(!email || email.indexOf('@')===-1){ setText('err','Bitte gültige E‑Mail eingeben.',true); warn('Bitte gültige E‑Mail eingeben.'); return; }
        try{ localStorage.setItem('ki_email', email); }catch(_){}
        disable(BTN_REQ, true);

        try{
          var res = await fetch(apiBase() + '/auth/request-code', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: email }) });
          var data = await readJsonSafe(res);

          if(res.status === 404 && data && data.error === 'unknown_email'){
            setText('err','Diese E‑Mail ist nicht freigeschaltet.',true);
            err('Diese E‑Mail ist nicht freigeschaltet.');
            return;
          }
          if(res.status === 429 && data && data.error === 'rate_limited'){
            var secs = Number(data.retry_after_sec || 300);
            setText('err','Zu viele Versuche. Bitte in ' + minutes(secs) + ' Minuten erneut versuchen.', true);
            warn('Zu viele Versuche. Bitte später erneut versuchen.');
            return;
          }
          if(!res.ok){
            setText('err','Senden fehlgeschlagen. (' + res.status + ')', true);
            err('Senden fehlgeschlagen (' + res.status + ').');
            return;
          }

          setText('msg','Code gesendet. Bitte Posteingang prüfen.',false);
          ok('Code gesendet. Bitte E‑Mail prüfen.');
          CODE_AREA.style.display = 'block';
          if(CODE) CODE.focus();
        }catch(e){
          setText('err','Senden fehlgeschlagen. ' + (e && e.message ? e.message : ''), true);
          err('Senden fehlgeschlagen.');
        }finally{
          disable(BTN_REQ, false);
        }
      })();
    });
  }

  // ---------- Login ----------
  if(BTN_LOGIN){
    BTN_LOGIN.addEventListener('click', function(){
      (async function(){
        setText('msg','Anmeldung …',false);
        var email = (EMAIL.value||'').trim().toLowerCase();
        var code = (CODE.value||'').trim();
        if(!email || !code){ setText('err','E‑Mail und Code eingeben.',true); warn('E‑Mail und Code eingeben.'); return; }
        try{ localStorage.setItem('ki_email', email); }catch(_){}
        disable(BTN_LOGIN, true);

        try{
          var res = await fetch(apiBase() + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: email, code: code }) });
          var data = await readJsonSafe(res);

          if(res.status === 404 && data && data.error === 'unknown_email'){
            setText('err','Diese E‑Mail ist nicht freigeschaltet.', true);
            err('Diese E‑Mail ist nicht freigeschaltet.');
            return;
          }
          if(res.status === 429 && data && data.error === 'rate_limited'){
            var secs = Number(data.retry_after_sec || 300);
            setText('err','Zu viele Versuche. Bitte in ' + minutes(secs) + ' Minuten erneut versuchen.', true);
            warn('Zu viele Versuche. Bitte später erneut versuchen.');
            return;
          }
          if(res.status === 400 && data && data.error === 'invalid_code'){
            setText('err','Code ist ungültig oder abgelaufen.', true);
            err('Code ist ungültig oder abgelaufen.');
            return;
          }
          if(!res.ok){
            setText('err','Login fehlgeschlagen (' + res.status + ').', true);
            err('Login fehlgeschlagen (' + res.status + ').');
            return;
          }

          // success – optional token
          if(data && data.token){
            try{ localStorage.setItem('jwt', data.token); }catch(_){}
          }
          setText('msg','Erfolg. Weiterleitung …',false);
          ok('Anmeldung erfolgreich.');
          window.location.href = '/formular/index.html';
        }catch(e){
          setText('err','Login fehlgeschlagen. ' + (e && e.message ? e.message : ''), true);
          err('Login fehlgeschlagen.');
        }finally{
          disable(BTN_LOGIN, false);
        }
      })();
    });
  }
})();