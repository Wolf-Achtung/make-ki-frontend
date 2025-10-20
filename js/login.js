(function(){
  'use strict';
  const form = document.getElementById('login-form');
  const msg = document.getElementById('msg');

  function show(type, text){
    msg.hidden = false;
    msg.className = 'msg ' + (type === 'ok' ? 'ok' : 'err');
    msg.textContent = text;
  }

  function apiBase(){
    const cfg = window.__CONFIG__ || {};
    return (cfg.API_BASE || '/api').replace(/\/$/, '');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email').value || '').trim();
    const password = document.getElementById('password').value || '';
    if(!email || !password){ show('err', 'Bitte E‑Mail und Passwort eingeben.'); return; }

    const endpoints = ['/login','/auth/login','/auth_login'];
    const base = apiBase();
    let lastErr = null;
    try {
      for (const ep of endpoints){
        try{
          const res = await fetch(base + ep, {
            method: 'POST',
            headers: {'Content-Type':'application/json', 'Accept':'application/json'},
            body: JSON.stringify({ email, password }),
            credentials: 'omit'
          });
          const ct = res.headers.get('content-type') || '';
          const data = ct.includes('application/json') ? await res.json() : { text: await res.text() };
          if (res.ok && data){
            const token = data.access_token || data.token || data.jwt || data.id_token;
            if (!token) throw new Error('Login ok, aber kein Token im Response.');
            try { localStorage.setItem('auth_token', token); } catch(_) {}
            show('ok', 'Login erfolgreich. Weiterleitung…');
            setTimeout(() => {
              const next = sessionStorage.getItem('post_login_redirect') || '/formular/index.html';
              window.location.assign(next);
            }, 300);
            return;
          } else {
            lastErr = new Error('HTTP ' + res.status + (data && data.text ? (': ' + String(data.text).slice(0,200)) : ''));
          }
        }catch(err){
          lastErr = err;
        }
      }
      throw lastErr || new Error('Login fehlgeschlagen.');
    } catch(err){
      console.error(err);
      show('err', 'Login fehlgeschlagen. Bitte Zugangsdaten prüfen.');
    }
  });
})();
