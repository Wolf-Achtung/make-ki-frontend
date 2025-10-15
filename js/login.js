// login.js — DB-basierter Login über Proxy
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

  frm.addEventListener('submit', async (evt)=>{
    evt.preventDefault();
    alertEl.style.display = 'none';
    btn.disabled = true;

    const payload = { email: (email.value||'').trim(), password: (pwd.value||'') };
    if(!payload.email || !payload.password){
      show('Bitte E‑Mail und Passwort eingeben.'); btn.disabled = false; return;
    }
    try{
      const res = await apiFetch('/login', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(payload),
        timeoutMs: 10000
      });
      if(!res.ok){
        let txt = 'Login fehlgeschlagen (HTTP ' + res.status + ')';
        try{ const j = await res.json(); if(j && j.detail) txt += ' – ' + j.detail; }catch{}
        show(txt); btn.disabled = false; return;
      }
      const data = await res.json();
      if(!data || !data.token){ show('Login fehlgeschlagen – ungültige Antwort.'); btn.disabled = false; return; }
      localStorage.setItem('AUTH_TOKEN', data.token);
      const next = new URLSearchParams(location.search).get('next') || '/formular/index.html';
      location.href = next;
    }catch(e){
      show('Netzwerkfehler – bitte erneut versuchen.'); btn.disabled = false;
    }
  });
})();
