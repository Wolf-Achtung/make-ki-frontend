(function(){
  "use strict";
  // ---- single-init guard (prevents double-binding if script is injected twice) ----
  if (window.__LOGIN_JS_INIT__) return;
  window.__LOGIN_JS_INIT__ = true;

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
  // KIS-1250: page language (login_en.html sets login_lang + <html lang="en">)
  function pageLang(){
    try{
      var l = sessionStorage.getItem('login_lang') || document.documentElement.lang || 'de';
      return String(l).toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
    }catch(_){ return 'de'; }
  }
  var EN = pageLang() === 'en';
  var T = EN ? {
    sending: 'Sending code …', invalidEmail: 'Please enter a valid e-mail address.',
    notWhitelisted: 'This e-mail is not registered for access. Please contact support@ki-sicherheit.jetzt to get access.',
    notWhitelistedShort: 'This e-mail is not registered.',
    rateLimited: function(m){ return 'Too many attempts. Please try again in ' + m + ' minutes.'; },
    rateLimitedShort: 'Too many attempts. Please try again later.',
    sendFailed: 'Sending failed. Please try again later.', sendFailedShort: 'Sending failed.',
    codeSent: 'Code sent. Please check your inbox.', codeSentShort: 'Code sent. Please check your e-mail.',
    loggingIn: 'Signing in …', enterBoth: 'Enter e-mail and code.',
    invalidCode: 'Code is invalid or expired.',
    loginFailed: function(s){ return 'Login failed (' + s + ').'; },
    loginFailedPlain: 'Login failed.', success: 'Success. Redirecting …', successShort: 'Signed in successfully.'
  } : {
    sending: 'Sende Code …', invalidEmail: 'Bitte gültige E‑Mail eingeben.',
    notWhitelisted: 'Diese E-Mail-Adresse ist nicht für den Zugang registriert. Bitte kontaktieren Sie support@ki-sicherheit.jetzt für eine Freischaltung.',
    notWhitelistedShort: 'Diese E‑Mail ist nicht freigeschaltet.',
    rateLimited: function(m){ return 'Zu viele Versuche. Bitte in ' + m + ' Minuten erneut versuchen.'; },
    rateLimitedShort: 'Zu viele Versuche. Bitte später erneut versuchen.',
    sendFailed: 'Senden fehlgeschlagen. Bitte versuchen Sie es später erneut.', sendFailedShort: 'Senden fehlgeschlagen.',
    codeSent: 'Code gesendet. Bitte Posteingang prüfen.', codeSentShort: 'Code gesendet. Bitte E‑Mail prüfen.',
    loggingIn: 'Anmeldung …', enterBoth: 'E‑Mail und Code eingeben.',
    invalidCode: 'Code ist ungültig oder abgelaufen.',
    loginFailed: function(s){ return 'Login fehlgeschlagen (' + s + ').'; },
    loginFailedPlain: 'Login fehlgeschlagen.', success: 'Erfolg. Weiterleitung …', successShort: 'Anmeldung erfolgreich.'
  };
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
  function disable(el, on){
    try{ el.disabled=!!on; if(on){ el.dataset.label=el.textContent; el.textContent='Bitte warten…'; } else { el.textContent=el.dataset.label||el.textContent; } }catch(_){}
  }
  function readJsonSafe(res){ return res.text().then(function(t){ try{ return JSON.parse(t||'{}'); }catch(_){ return {}; } }); }
  function minutes(n){ return Math.max(1, Math.round(n/60)); }
  function rid(){
    try{ if(window.crypto && window.crypto.randomUUID) return crypto.randomUUID(); }catch(_){}
    try{
      var a = new Uint32Array(4); if (window.crypto && crypto.getRandomValues){ crypto.getRandomValues(a); }
      return 'r-' + Array.from(a).map(function(x){return x.toString(16)}).join('');
    }catch(_){}
    return 'r-' + Date.now().toString(36) + '-' + Math.random().toString(16).slice(2);
  }

  var BTN_REQ = byId('btn-request');
  var BTN_LOGIN = byId('btn-login');
  var EMAIL = byId('email');
  var CODE_AREA = byId('code-area');
  var CODE = byId('code');

  // Prefill email from localStorage
  try{ var stored = localStorage.getItem('ki_email'); if(stored && EMAIL) EMAIL.value = stored; }catch(_){}

  // In-flight guards (prevent double-send)
  var IN_FLIGHT_REQ = false;
  var IN_FLIGHT_LOGIN = false;

  // ---------- Request Code ----------
  if(BTN_REQ && !BTN_REQ.dataset.bound){
    BTN_REQ.dataset.bound = "1";
    BTN_REQ.addEventListener('click', function(){
      if (IN_FLIGHT_REQ) return;
      IN_FLIGHT_REQ = true;
      (async function(){
        setText('msg',T.sending,false);
        var email = (EMAIL.value||'').trim().toLowerCase();
        if(!email || email.indexOf('@')===-1){ setText('err',T.invalidEmail,true); warn(T.invalidEmail); IN_FLIGHT_REQ=false; return; }
        try{ localStorage.setItem('ki_email', email); }catch(_){}
        disable(BTN_REQ, true);

        var controller = new AbortController();
        var idem = rid();
        var reqId = rid();
        var timer = setTimeout(function(){ try{ controller.abort(); }catch(_){} }, 25000);

        try{
          var res = await fetch(apiBase() + '/auth/request-code', {
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              'X-Req-Id': reqId,
              'Idempotency-Key': idem,
              'X-Idempotency-Key': idem
            },
            body: JSON.stringify({ email: email, lang: pageLang() }),
            signal: controller.signal,
            keepalive: true,
            credentials: 'include'
          });
          var data = await readJsonSafe(res);

          if(res.status === 404 && data && data.error === 'unknown_email'){
            setText('err',T.notWhitelisted,true);
            err(T.notWhitelistedShort);
            return;
          }
          if(res.status === 429 && data && data.error === 'rate_limited'){
            var secs = Number(data.retry_after_sec || 300);
            setText('err',T.rateLimited(minutes(secs)), true);
            warn(T.rateLimitedShort);
            return;
          }
          if(res.status === 403){
            setText('err',T.notWhitelisted, true);
            return;
          }
          if(!res.ok){
            setText('err',T.sendFailed, true);
            return;
          }

          setText('msg',T.codeSent,false);
          ok(T.codeSentShort);
          CODE_AREA.style.display = 'block';
          if(CODE) CODE.focus();
        }catch(e){
          setText('err',T.sendFailedShort + ' ' + (e && e.message ? e.message : ''), true);
          err(T.sendFailedShort);
        }finally{
          clearTimeout(timer);
          disable(BTN_REQ, false);
          IN_FLIGHT_REQ = false;
        }
      })();
    });
  }

  // ---------- Login ----------
  if(BTN_LOGIN && !BTN_LOGIN.dataset.bound){
    BTN_LOGIN.dataset.bound = "1";
    BTN_LOGIN.addEventListener('click', function(){
      if (IN_FLIGHT_LOGIN) return;
      IN_FLIGHT_LOGIN = true;
      (async function(){
        setText('msg',T.loggingIn,false);
        var email = (EMAIL.value||'').trim().toLowerCase();
        var code = (CODE.value||'').trim();
        if(!email || !code){ setText('err',T.enterBoth,true); warn(T.enterBoth); IN_FLIGHT_LOGIN=false; return; }
        try{ localStorage.setItem('ki_email', email); }catch(_){}
        disable(BTN_LOGIN, true);

        var controller = new AbortController();
        var reqId = rid(); var idem = rid();
        var timer = setTimeout(function(){ try{ controller.abort(); }catch(_){ } }, 25000);

        try{
          var res = await fetch(apiBase() + '/auth/login', {
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              'X-Req-Id': reqId,
              'Idempotency-Key': idem
            },
            body: JSON.stringify({ email: email, code: code }),
            signal: controller.signal,
            credentials: 'include',
            keepalive: true
          });
          var data = await readJsonSafe(res);

          if(res.status === 404 && data && data.error === 'unknown_email'){
            setText('err',T.notWhitelistedShort, true);
            err(T.notWhitelistedShort);
            return;
          }
          if(res.status === 429 && data && data.error === 'rate_limited'){
            var secs = Number(data.retry_after_sec || 300);
            setText('err',T.rateLimited(minutes(secs)), true);
            warn(T.rateLimitedShort);
            return;
          }
          if(res.status === 400 && data && data.error === 'invalid_code'){
            setText('err',T.invalidCode, true);
            err(T.invalidCode);
            return;
          }
          if(!res.ok){
            setText('err',T.loginFailed(res.status), true);
            err(T.loginFailed(res.status));
            return;
          }

          // success – store access token and redirect
          if(data && data.access_token){
            try{
              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('ki_user_email', email);
            }catch(e){
              console.error('Failed to store token:', e);
            }
          }
          try { if (window.kisTrack) window.kisTrack('login_success'); } catch(e) {}
          setText('msg',T.success,false);
          ok(T.successShort);
          var _params = new URLSearchParams(window.location.search);
          // KIS-1269: EN-Login fuehrte immer in den DE-Fragebogen — login_lang respektieren
          var _lang = '';
          try { _lang = sessionStorage.getItem('login_lang') || ''; } catch(e) {}
          var _target = (_lang === 'en') ? '/formular/index_en.html' : '/formular/index.html';
          window.location.href = _target + (_params.toString() ? '?' + _params.toString() : '');
        }catch(e){
          setText('err',T.loginFailedPlain + ' ' + (e && e.message ? e.message : ''), true);
          err(T.loginFailedPlain);
        }finally{
          clearTimeout(timer);
          disable(BTN_LOGIN, false);
          IN_FLIGHT_LOGIN = false;
        }
      })();
    });
  }
})();

// KIS-1269: "Code erneut senden" — delegiert an den bestehenden Anforder-Flow
(function(){
  var resend = document.getElementById('btn-resend');
  var btnReq = document.getElementById('btn-request');
  if (resend && btnReq) {
    resend.addEventListener('click', function(ev){
      ev.preventDefault();
      btnReq.click();
    });
  }
})();
