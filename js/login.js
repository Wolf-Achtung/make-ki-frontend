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
    // Korrigiert: Railway Backend URL verwenden
    return (cfg.API_BASE || 'https://sublime-consideration-production.up.railway.app/api').replace(/\/$/, '');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email').value || '').trim();
    const password = document.getElementById('password').value || '';
    
    if(!email || !password){ 
      show('err', 'Bitte E-Mail und Passwort eingeben.'); 
      return; 
    }

    // Nur den existierenden Endpunkt verwenden
    const base = apiBase();
    
    try {
      const res = await fetch(base + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Changed from 'omit' to 'include' for cookies
      });
      
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : { text: await res.text() };
      
      if (res.ok && data){
        const token = data.access_token || data.token || data.jwt || data.id_token;
        if (!token) {
          throw new Error('Login ok, aber kein Token im Response.');
        }
        
        // Token speichern
        try { 
          localStorage.setItem('auth_token', token);
          // Auch unter anderen möglichen Keys speichern für Kompatibilität
          localStorage.setItem('jwt', token);
          localStorage.setItem('access_token', token);
        } catch(_) {}
        
        show('ok', 'Login erfolgreich. Weiterleitung…');
        setTimeout(() => {
          const next = sessionStorage.getItem('post_login_redirect') || '/formular/index.html';
          window.location.assign(next);
        }, 500);
        return;
        
      } else if (res.status === 401) {
        // Spezifische Fehlermeldung für falsche Credentials
        show('err', 'E-Mail oder Passwort falsch. Bitte prüfen Sie Ihre Zugangsdaten.');
      } else {
        throw new Error('Login fehlgeschlagen (HTTP ' + res.status + ')');
      }
      
    } catch(err){
      console.error('Login-Fehler:', err);
      // Verbesserte Fehlermeldung
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        show('err', 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.');
      } else {
        show('err', 'Login fehlgeschlagen. Bitte Zugangsdaten prüfen oder Support kontaktieren.');
      }
    }
  });
  
  // Auto-focus auf E-Mail Feld
  window.addEventListener('DOMContentLoaded', () => {
    const emailField = document.getElementById('email');
    if (emailField) emailField.focus();
  });
})();