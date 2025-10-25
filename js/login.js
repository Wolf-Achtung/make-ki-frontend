(function () {
  "use strict";

  // ---------- helpers ----------
  function apiBase() {
    try {
      var meta = document.querySelector('meta[name="api-base"]');
      return (meta && meta.content) || (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || "/api";
    } catch (_) { return "/api"; }
  }
  function setText(id, text, isError) {
    var elErr = document.getElementById("err");
    var elMsg = document.getElementById("msg");
    if (isError) {
      if (elErr) { elErr.textContent = text || ""; elErr.hidden = !text; }
      if (elMsg) { elMsg.textContent = ""; }
    } else {
      if (elErr) { elErr.textContent = ""; elErr.hidden = true; }
      if (elMsg) { elMsg.textContent = text || ""; }
    }
  }
  function byId(id) { return document.getElementById(id); }
  function disable(el, on) { try { el.disabled = !!on; el.style.opacity = on ? 0.7 : 1; } catch(_){} }
  function readJsonSafe(res) { return res.text().then(function(t){ try { return JSON.parse(t || "{}"); } catch(_){ return {}; } }); }
  function minutes(n){ return Math.max(1, Math.round(n/60)); }

  var BTN_REQ = byId("btn-request");
  var BTN_LOGIN = byId("btn-login");
  var EMAIL = byId("email");
  var CODE_AREA = byId("code-area");
  var CODE = byId("code");

  // Prefill email from localStorage
  try { var stored = localStorage.getItem("ki_email"); if (stored && EMAIL) EMAIL.value = stored; } catch(_){}

  // ---------- Request Code ----------
  if (BTN_REQ) {
    BTN_REQ.addEventListener("click", function () {
      (async function(){
        setText("msg", "Sende Code …", false);
        var email = (EMAIL.value || "").trim().toLowerCase();
        if (!email || email.indexOf("@") === -1) { setText("err", "Bitte gültige E‑Mail eingeben.", true); return; }
        try { localStorage.setItem("ki_email", email); } catch(_){}
        disable(BTN_REQ, true);

        try {
          var res = await fetch(apiBase() + "/auth/request-code", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: email }),
          });

          var data = await readJsonSafe(res);

          if (res.status === 404 && data && data.error === "unknown_email") {
            setText("err", "Diese E‑Mail ist nicht freigeschaltet.", true);
            return;
          }
          if (res.status === 429 && data && data.error === "rate_limited") {
            var secs = Number(data.retry_after_sec || 300);
            setText("err", "Zu viele Versuche. Bitte in " + minutes(secs) + " Minuten erneut versuchen.", true);
            return;
          }
          if (!res.ok) {
            setText("err", "Senden fehlgeschlagen. (" + res.status + ")", true);
            return;
          }

          // success
          setText("msg", "Code gesendet. Bitte Posteingang prüfen.", false);
          CODE_AREA.style.display = "block";
          if (CODE) CODE.focus();
        } catch (e) {
          setText("err", "Senden fehlgeschlagen. " + (e && e.message ? e.message : "" ), true);
        } finally {
          disable(BTN_REQ, false);
        }
      })();
    });
  }

  // ---------- Login ----------
  if (BTN_LOGIN) {
    BTN_LOGIN.addEventListener("click", function () {
      (async function(){
        setText("msg", "Anmeldung …", false);
        var email = (EMAIL.value || "").trim().toLowerCase();
        var code = (CODE.value || "").trim();
        if (!email || !code) { setText("err", "E‑Mail und Code eingeben.", true); return; }
        try { localStorage.setItem("ki_email", email); } catch(_){}
        disable(BTN_LOGIN, true);

        try {
          var res = await fetch(apiBase() + "/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: email, code: code }),
          });
          var data = await readJsonSafe(res);

          if (res.status === 404 && data && data.error === "unknown_email") {
            setText("err", "Diese E‑Mail ist nicht freigeschaltet.", true);
            return;
          }
          if (res.status === 429 && data && data.error === "rate_limited") {
            var secs = Number(data.retry_after_sec || 300);
            setText("err", "Zu viele Versuche. Bitte in " + minutes(secs) + " Minuten erneut versuchen.", true);
            return;
          }
          if (res.status === 400 && data && data.error === "invalid_code") {
            setText("err", "Code ist ungültig oder abgelaufen.", true);
            return;
          }
          if (!res.ok) {
            setText("err", "Login fehlgeschlagen (" + res.status + ").", true);
            return;
          }

          // success – Backend kann {ok:true} oder {token: "..."} zurückgeben
          if (data && data.token) {
            try { localStorage.setItem("jwt", data.token); } catch(_){}
          }
          setText("msg", "Erfolg. Weiterleitung …", false);
          window.location.href = "/formular/index.html";
        } catch (e) {
          setText("err", "Login fehlgeschlagen. " + (e && e.message ? e.message : ""), true);
        } finally {
          disable(BTN_LOGIN, false);
        }
      })();
    });
  }
})();