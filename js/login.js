(function(){
  'use strict';

  function qs(sel){ return document.querySelector(sel); }
  function apiBase(){
    const m = document.querySelector('meta[name="api-base"]');
    let b = (window.API_BASE||'').trim();
    if(m && m.content){ b = m.content; }
    // leer => same-origin => Netlify proxy
    if(!b){ b = ''; }
    return b.replace(/\/+$/,''); 
  }

  const form = qs('#loginForm');
  const email = qs('#email');
  const password = qs('#password');
  const btn = qs('#btnLogin');
  const alertErr = qs('#alertErr');
  const alertOk = qs('#alertOk');

  function showErr(msg){
    alertErr.textContent = msg || 'Fehler';
    alertErr.style.display = 'block';
    alertOk.style.display = 'none';
  }
  function showOk(msg){
    alertOk.textContent = msg || 'OK';
    alertOk.style.display = 'block';
    alertErr.style.display = 'none';
  }

  async function doLogin(evt){
    evt.preventDefault();
    alertErr.style.display = 'none';
    btn.disabled = true;
    try{
      const payload = { email: email.value.trim(), password: password.value };
      const res = await fetch(apiBase()+'/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(!res.ok){
        let txt = 'Login fehlgeschlagen (HTTP '+res.status+')';
        try{ const d = await res.json(); if(d && d.detail) txt = d.detail; }catch(e){}
        showErr(txt);
        return;
      }
      const data = await res.json();
      if(data && data.token){
        try{
          localStorage.setItem('ki_token', data.token);
          document.cookie = 'ki_token='+encodeURIComponent(data.token)+'; Path=/; Max-Age='+(14*86400)+'; SameSite=Lax';
        }catch(e){}
        showOk('Erfolg – weiterleiten …');
        const params = new URLSearchParams(location.search);
        const next = params.get('next') || '/formular/index.html';
        location.replace(next);
      }else{
        showErr('Unerwartete Antwort vom Server');
      }
    }catch(e){
      showErr('Netzwerkfehler: '+ e);
    }finally{
      btn.disabled = false;
    }
  }

  form.addEventListener('submit', doLogin);

  document.getElementById('checkHealth')?.addEventListener('click', async function(e){
    e.preventDefault();
    try{
      const res = await fetch(apiBase()+'/healthz');
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      showOk('Health: OK – Provider: '+ (data?.env?.llm_provider || 'n/a'));
    }catch(err){
      showErr('Health: Fehler – '+ err.message);
    }
  });
})();
