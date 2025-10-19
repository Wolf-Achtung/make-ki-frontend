(function(){
  const form = document.getElementById('login-form');
  const msg = document.getElementById('msg');
  const API = (window.BACKEND_URL || '').replace(/\/$/, '') + '/api';

  function show(type, text){
    msg.hidden = false;
    msg.className = 'msg ' + (type === 'ok' ? 'ok' : 'err');
    msg.textContent = text;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email').value || '').trim();
    const password = document.getElementById('password').value || '';
    if(!email || !password){ show('err', 'Bitte E‑Mail und Passwort eingeben.'); return; }

    try{
      const res = await fetch(API + '/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if(!res.ok){
        const reason = (data && (data.detail || data.message)) || res.status + ' ' + res.statusText;
        show('err', 'Login fehlgeschlagen: ' + reason);
        return;
      }
      // Persist token and redirect
      localStorage.setItem('auth_token', data.access_token);
      show('ok', 'Login erfolgreich. Weiterleitung…');
      setTimeout(() => {
        const next = sessionStorage.getItem('post_login_redirect') || '/';
        window.location.assign(next);
      }, 400);
    }catch(err){
      console.error(err);
      show('err', 'Netzwerkfehler. Bitte versuchen Sie es erneut.');
    }
  });
})();
