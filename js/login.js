// login.js — robustes Login mit Failover + klare Meldungen
(async function(){
  const frm = document.getElementById('loginForm');
  const alertEl = document.getElementById('alert');
  const email = document.getElementById('email');
  const pwd = document.getElementById('password');
  const btn = document.getElementById('btnLogin');

  function show(msg, ok=false){
    alertEl.textContent = msg;
    alertEl.className = 'alert' + (ok ? ' ok' : '');
    alertEl.style.display = 'block';
  }

  // Health check (optional UI-Hinweis)
  try{
    const r = await apiFetch('/healthz', {method:'GET', cache:'no-store', timeoutMs:1500});
    if(!r.ok) show('Health: Fehler – HTTP ' + r.status);
  }catch(e){
    show('Health: Fehler – nicht erreichbar');
  }

  frm.addEventListener('submit', async (evt)=>{
    evt.preventDefault();
    alertEl.style.display = 'none';
    btn.disabled = true;

    const payload = {
      email: (email.value||'').trim(),
      password: (pwd.value||'')
    };
    try{
      const res = await apiFetch('/login', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(payload),
        cache:'no-store',
        timeoutMs: 7000
      });

      if(!res.ok){
        let txt = 'Login fehlgeschlagen (HTTP ' + res.status + ')';
        try{ const j = await res.json(); if(j && j.detail) txt += ' – ' + j.detail; }catch{}
        show(txt);
        btn.disabled = false;
        return;
      }
      const data = await res.json();
      if(!data || !data.token){
        show('Login fehlgeschlagen – ungültige Antwort.');
        btn.disabled = false;
        return;
      }
      // Save token + navigate
      localStorage.setItem('AUTH_TOKEN', data.token);
      const next = new URLSearchParams(location.search).get('next') || '/formular/index.html';
      location.href = next;
    }catch(e){
      show('Netzwerkfehler – bitte erneut versuchen.');
      btn.disabled = false;
    }
  });
})();
