(function(){
  'use strict';
  const form = document.getElementById('login-form');
  const msg = document.getElementById('msg');

  function show(type, text){
    msg.hidden = false;
    msg.className = 'msg ' + (type === 'ok' ? 'ok' : 'err');
    msg.textContent = text;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email').value || '').trim();
    const password = document.getElementById('password').value || '';
    
    if(!email || !password){ 
      show('err', 'Bitte E-Mail und Passwort eingeben.'); 
      return; 
    }

    // Verwende Netlify Proxy statt direkte Backend-URL
    const loginUrl = '/.netlify/functions/proxy/api/login';
    
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
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
        show('err', 'E-Mail oder Passwort falsch. Richtiges Passwort: passwolfi!');
      } else {
        throw new Error('Login fehlgeschlagen (HTTP ' + res.status + ')');
      }
      
    } catch(err){
      console.error('Login-Fehler:', err);
      show('err', 'Login fehlgeschlagen. Bitte Support kontaktieren.');
    }
  });
  
  // Auto-focus
  window.addEventListener('DOMContentLoaded', () => {
    const emailField = document.getElementById('email');
    if (emailField) emailField.focus();
  });
})();