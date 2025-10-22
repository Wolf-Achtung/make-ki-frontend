(async function(){
  const q = new URLSearchParams(location.search);
  if (q.get('email')) document.getElementById('email').value = q.get('email');

  const msg = document.getElementById('msg');
  function setMsg(t){ msg.textContent = t; }
  function showCode(){ document.getElementById('code-box').classList.remove('hidden'); }

  document.getElementById('btn-request').addEventListener('click', async function(){
    try{
      const email = document.getElementById('email').value.trim();
      if (!email) return setMsg('Bitte E‑Mail eingeben.');
      const r = await API.request('/auth/request-code', { method:'POST', body: JSON.stringify({ email }) });
      setMsg('Code gesendet. Prüfen Sie Ihr Postfach.' + (r.dev_code ? ' DEV-Code: ' + r.dev_code : ''));
      showCode();
      if (q.get('code')) document.getElementById('code').value = q.get('code');
    }catch(e){ setMsg('Fehler: ' + e.message); }
  });

  document.getElementById('btn-login').addEventListener('click', async function(){
    try{
      const email = document.getElementById('email').value.trim();
      const code = document.getElementById('code').value.trim();
      const r = await API.request('/auth/login', { method:'POST', body: JSON.stringify({ email, code }) });
      localStorage.setItem('jwt', r.token);
      setMsg('Erfolgreich eingeloggt.');
      location.href = '/formular/index.html';
    }catch(e){ setMsg('Login fehlgeschlagen: ' + e.message); }
  });
})();