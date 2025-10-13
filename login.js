// filename: frontend/login.js
(function(){
  "use strict";

  function backendOrigin() {
    const m = document.querySelector('meta[name="backend-origin"]');
    const cfg = (m && m.content || "").trim();
    if (cfg) return cfg.replace(/\/+$/,"");
    // Fallback: window.KI_BACKEND_ORIGIN can be injected by hosting env
    if (window.KI_BACKEND_ORIGIN) return String(window.KI_BACKEND_ORIGIN).replace(/\/+$/,"");
    // Developer default (local)
    return "http://localhost:8000";
  }

  async function corsEcho(origin) {
    try {
      const r = await fetch(origin + "/health/cors-echo", { method: "GET", mode: "cors", credentials: "omit" });
      return await r.json();
    } catch (e) { return {}; }
  }

  async function apiLogin(origin, email, password) {
    // Use JSON; credentials omitted to simplify CORS (no cookies).
    const res = await fetch(origin + "/api/login", {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error("HTTP " + res.status + " – " + txt.slice(0, 300));
    }
    return await res.json();
  }

  function show(el, msg) { if (el) { el.textContent = msg; el.style.display = "block"; } }
  function hide(el) { if (el) el.style.display = "none"; }

  window.addEventListener("DOMContentLoaded", function(){
    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const err = document.getElementById("err");
    const ok = document.getElementById("ok");
    const origin = backendOrigin();

    form.addEventListener("submit", async function(ev){
      ev.preventDefault();
      hide(err); hide(ok);

      try {
        // Quick sanity check
        const echo = await corsEcho(origin);
        console.debug("CORS echo", echo);

        const data = await apiLogin(origin, email.value, password.value);
        show(ok, "Login OK – Token erstellt.");
        console.log("Token", data.token);
      } catch (e) {
        show(err, "Serverfehler / CORS: " + (e && e.message ? e.message : String(e)));
        console.error(e);
      }
    });
  });
})();
