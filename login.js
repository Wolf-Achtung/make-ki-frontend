// filename: frontend/login.js
(function(){
  "use strict";

  function backendOrigin() {
    const m = document.querySelector('meta[name="backend-origin"]');
    const env = (m && m.content || "").trim();
    if (env) return env.replace(/\/+$/,"");
    if (window.KI_BACKEND_ORIGIN) return String(window.KI_BACKEND_ORIGIN).replace(/\/+$/,"");
    return location.origin; // default: same origin (dev)
  }

  async function apiLogin(origin, email, password) {
    const res = await fetch(origin + "/api/login", {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error("HTTP " + res.status + " – " + txt.slice(0, 400));
    }
    return await res.json();
  }

  function show(el, msg){ if(el){ el.textContent = msg; el.style.display = "block"; } }
  function hide(el){ if(el){ el.style.display = "none"; } }

  window.addEventListener("DOMContentLoaded", function(){
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const lang = document.getElementById("lang");
    const ok = document.getElementById("ok");
    const err = document.getElementById("err");
    const btn = document.getElementById("loginBtn");
    const origin = backendOrigin();

    btn.addEventListener("click", async function(){
      hide(err); hide(ok);
      try {
        const data = await apiLogin(origin, email.value, password.value);
        localStorage.setItem("ki_token", data.token);
        localStorage.setItem("ki_email", data.email);
        const target = lang.value === "de" ? "./formular/index.html" : "./formular/index_en.html";
        show(ok, "Login OK – Weiterleitung...");
        setTimeout(()=> location.href = target, 200);
      } catch(e){
        show(err, "Login fehlgeschlagen: " + (e && e.message ? e.message : String(e)));
        console.error(e);
      }
    });
  });
})();
