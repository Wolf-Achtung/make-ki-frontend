/* Multi-Step Wizard (DE) – Scroll-to-Top, persistenter Autosave & Step-Resume */
/* Schema 1.5.1 – ENDPOINT-/Payload-Fix & Submit-Härtung */
(function () {
  "use strict";

  // --------------------------- Konfiguration ---------------------------
  var LANG = "de";
  var SCHEMA_VERSION = "1.5.1";
  var STORAGE_PREFIX = "autosave_form_";
  var SUBMIT_PATH = "/briefings/submit";  // <— neuer produktiver Endpoint

  function getBaseUrl() {
    try {
      var cfg = window.__CONFIG__ || {};
      var v = cfg.API_BASE || '';
      if (!v) {
        var meta = document.querySelector('meta[name="api-base"]');
        v = (meta && meta.content) || (window.API_BASE || '/api');
      }
      return String(v || '/api').replace(/\/+$/, '');
    } catch (e) { 
      return '/api'; 
    }
  }

  function getToken() {
    var keys = ["jwt", "access_token", "id_token", "AUTH_TOKEN", "token"];
    for (var i = 0; i < keys.length; i++) { 
      try { 
        var t = localStorage.getItem(keys[i]); 
        if (t) return t; 
      } catch (e) {} 
    }
    return null;
  }

  function getEmailFromJWT(token) {
    try { 
      if (!token || token.split(".").length !== 3) return null;
      var payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || payload.preferred_username || payload.sub || null;
    } catch (e) { 
      return null; 
    }
  }

  function dispatchProgress(step, total) {
    try { 
      document.dispatchEvent(new CustomEvent("fb:progress", { 
        detail: { step: step, total: total } 
      })); 
    } catch (_) {}
  }

  // --------------------------- Styles (inject) ---------------------------
  (function injectCSS(){ try{
    var css = ""
      + ".fb-section{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;margin:24px 0;box-shadow:0 4px 20px rgba(0,0,0,.03)}"
      + ".fb-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}"
      + ".fb-step{display:inline-block;background:#dbeafe;color:#1e3a5f;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}"
      + ".fb-title{font-size:22px;font-weight:700;color:#1e3a5f}"
      + ".section-intro{background:linear-gradient(135deg,#e0f2fe,#dbeafe);border-left:4px solid #2563eb;border-radius:12px;padding:16px 24px;margin:8px 0 24px;color:#1e3a5f}"
      + ".form-group{margin:22px 0}"
      + ".form-group>label{display:block;font-weight:600;color:#1e3a5f;margin-bottom:8px}"
      + ".guidance{font-size:15px;color:#475569;margin:8px 0 12px;background:#f0f9ff;padding:12px;border-radius:10px;border-left:3px solid #dbeafe}"
      + ".guidance.important{background:#fef3c7;border-left-color:#f59e0b;color:#92400e}"
      + "select,textarea,input[type=text],input[type=range]{width:100%;border:2px solid #e2e8f0;border-radius:12px;padding:12px 14px;font-size:16px;background:#fff;transition:all .3s ease;font-family:inherit}"
      + "select:hover,textarea:hover,input[type=text]:hover{border-color:#cbd5e1}"
      + "select:focus,textarea:focus,input[type=text]:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}"
      + "textarea{min-height:120px;resize:vertical}"
      + ".checkbox-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:8px}"
      + ".checkbox-label{display:flex;gap:12px;align-items:flex-start;padding:12px;background:#f0f9ff;border:2px solid transparent;border-radius:12px;cursor:pointer;transition:all .3s ease}"
      + ".checkbox-label:hover{background:#e0f2fe;border-color:#dbeafe}"
      + ".checkbox-label input{margin-top:4px;width:18px;height:18px;cursor:pointer}"
      + ".invalid{border-color:#ef4444!important;background:#fef2f2!important}"
      + ".invalid-group{box-shadow:0 0 0 3px rgba(239,68,68,.2);border-radius:12px}"
      + ".form-nav{position:sticky;bottom:0;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-top:24px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,.05)}"
      + ".btn{border:0;border-radius:12px;padding:12px 22px;font-size:16px;font-weight:600;cursor:pointer;transition:all .25s ease}"
      + ".btn-primary{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff}"
      + ".btn-secondary{background:#fff;color:#1e293b;border:2px solid #cbd5e1}"
      + ".btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(37,99,235,.3)}"
      + ".btn-secondary:hover{background:#f0f9ff;border-color:#2563eb}"
      + ".mr-auto{margin-right:auto}"
      + ".slider-container{display:flex;align-items:center;gap:12px}"
      + ".slider-value-label{min-width:48px;padding:8px 12px;background:#dbeafe;border-radius:8px;font-weight:600;color:#1e3a5f;text-align:center}";
    var s=document.createElement("style"); s.type="text/css"; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }catch(_){}})();

  // --------------------------- Inhalte ---------------------------
  var BLOCK_INTRO = [
    "Hier erfassen wir Basisdaten (Branche, Größe, Standort). Keine Unterlagen nötig – grobe Angaben reichen völlig. So personalisieren wir Ihren Report und prüfen passende Förderung & Compliance.",
    "Status Quo zu Prozessen, Daten und bisheriger KI-Nutzung. Ziel: schnelle, machbare Quick Wins und eine pragmatische Start-Roadmap – auch für kleine Teams.",
    "Ziele & wichtigste Anwendungsfälle: Was soll KI ganz konkret leisten? Wir fokussieren umsetzbare Maßnahmen mit sichtbarem Nutzen.",
    "Strategie & Governance: einfache, tragfähige Leitplanken für nachhaltigen KI-Einsatz ohne Bürokratie-Overhead.",
    "Ressourcen & Präferenzen (Zeit, Tool-Landschaft). Wir passen Empfehlungen an Machbarkeit, Budget und Tempo an.",
    "Rechtliches & Förderung: DSGVO, EU AI Act & Fördermöglichkeiten – verständlich erklärt, mit klaren To-dos.",
    "Datenschutz & Absenden: Einwilligung bestätigen und den personalisierten Report starten."
  ];

  // Felder (gekürzt – identisch zu deiner Version, nur Submit-Änderung relevant)
  var fields = [
    { key: "branche", label: "In welcher Branche ist Ihr Unternehmen tätig?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Werbung" }, { value: "beratung", label: "Beratung & Dienstleistungen" },
        { value: "it", label: "IT & Software" }, { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "handel", label: "Handel & E-Commerce" }, { value: "bildung", label: "Bildung" },
        { value: "verwaltung", label: "Verwaltung" }, { value: "gesundheit", label: "Gesundheit & Pflege" },
        { value: "bau", label: "Bauwesen & Architektur" }, { value: "medien", label: "Medien & Kreativwirtschaft" },
        { value: "industrie", label: "Industrie & Produktion" }, { value: "logistik", label: "Transport & Logistik" }
      ]
    },
    { key: "unternehmensgroesse", label: "Wie groß ist Ihr Unternehmen?", type: "select",
      options: [
        { value: "solo", label: "1 (Solo-Selbstständig/Freiberuflich)" }, { value: "team", label: "2–10 (Kleines Team)" }, { value: "kmu", label: "11–100 (KMU)" }
      ]
    },
    { key: "datenschutz", label:
      "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
      type: "privacy"
    }
  ];

  var blocks = [
    { title: "Firmendaten & Branche", intro: BLOCK_INTRO[0], keys: ["branche","unternehmensgroesse"] },
    { title: "Datenschutz & Absenden", intro: BLOCK_INTRO[6], keys: ["datenschutz"] }
  ];

  // --------------------------- Render ---------------------------
  function renderStep() {
    var root = document.getElementById("formbuilder");
    if (!root) return;

    var block = blocks[currentBlock];
    var html = "<section class='fb-section'><div class='fb-head'>"
      + "<span class='fb-step'>Schritt " + (currentBlock + 1) + "/" + blocks.length + "</span>"
      + "<h2 class='fb-title'>" + block.title + "</h2></div>"
      + "<p class='section-intro'>" + block.intro + "</p>";

    for (var i=0; i<block.keys.length; i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      html += "<div class='form-group' data-key='" + k + "'><label for='" + f.key + "'>" + f.label + "</label>";
      html += renderInput(f) + "</div>";
    }

    html += "</section><div id='fb-msg' role='status' aria-live='polite'></div>";

    var nav = "<nav class='form-nav'>";
    if (currentBlock > 0) nav += "<button type='button' class='btn btn-secondary' id='btn-prev'>← Zurück</button>";
    nav += "<button type='button' class='btn btn-secondary' id='btn-reset'>Formular zurücksetzen</button>";
    nav += "<span class='mr-auto'></span>";
    if (currentBlock < blocks.length - 1) nav += "<button type='button' class='btn btn-primary' id='btn-next' disabled>Weiter →</button>";
    else nav += "<button type='button' class='btn btn-primary' id='btn-submit'>Absenden</button>";
    nav += "</nav>";

    root.innerHTML = html + nav;

    // change handler
    root.addEventListener("change", handleChange);

    // autofill & validate
    for (var j=0; j<block.keys.length; j++){
      var field = findField(block.keys[j]); if (!field) continue;
      fillField(field);
    }

    // listener
    var prev = document.getElementById("btn-prev");
    if (prev) prev.addEventListener("click", function () {
      if (currentBlock > 0) { currentBlock--; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
    });

    var next = document.getElementById("btn-next");
    if (next) {
      next.addEventListener("click", function () {
        if (currentBlock < blocks.length - 1) { currentBlock++; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
      });
      next.disabled = validateCurrentBlock(false).length > 0;
    }

    var reset = document.getElementById("btn-reset");
    if (reset) reset.addEventListener("click", function () {
      if (confirm("Möchten Sie das Formular wirklich zurücksetzen?")) {
        try { localStorage.removeItem(autosaveKey); localStorage.removeItem(stepKey); } catch(_) {}
        formData = {}; currentBlock = 0; saveStep();
        renderStep(); updateProgress(); scrollToStepTop(true);
      }
    });

    var submit = document.getElementById("btn-submit");
    if (submit) submit.addEventListener("click", submitForm);

    updateProgress();
  }

  // --------------------------- Data & Validation ---------------------------
  function handleChange(e) {
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();
    var next = document.getElementById("btn-next");
    if (next) next.disabled = validateCurrentBlock(false).length > 0;
  }

  function markInvalid(key, on) {
    var grp = document.querySelector('.form-group[data-key="'+key+'"]');
    if (!grp) return;
    if (on) grp.classList.add("invalid-group"); else grp.classList.remove("invalid-group");
    var input = document.getElementById(key);
    if (input) { if (on) input.classList.add("invalid"); else input.classList.remove("invalid"); }
  }

  function validateCurrentBlock(focusFirst) {
    var optional = { };
    var missing = [];
    var block = blocks[currentBlock];
    for (var j=0;j<block.keys.length;j++) markInvalid(block.keys[j], false);

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      var val = formData[k];
      var ok = true;
      if (k === "datenschutz") { ok = (val === true); }
      else if (f.type === "select") { ok = !!val && String(val) !== ""; }
      else { ok = !!val && String(val).trim() !== ""; }
      if (!ok) { missing.push(labelOf(k)); markInvalid(k, true); }
    }

    if (missing.length && focusFirst) {
      var first = document.querySelector(".invalid, .invalid-group");
      if (first && first.scrollIntoView) first.scrollIntoView({behavior:"smooth", block:"center"});
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Bitte korrigieren Sie die markierten Felder."; msg.setAttribute("role","alert"); }
    }
    return missing;
  }

  function updateProgress() { dispatchProgress(currentBlock + 1, blocks.length); }

  // --------------------------- Submit ---------------------------
  var SUBMIT_IN_FLIGHT = false;
  function submitForm() {
    if (SUBMIT_IN_FLIGHT) return;
    // alle Felder einsammeln
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (document.getElementById(f.key)) { formData[k] = collectValue(f); } // else keep existing
      }
    }
    saveAutosave();

    if (formData.datenschutz !== true) {
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Bitte bestätigen Sie die Datenschutzhinweise."; msg.setAttribute("role","alert"); }
      return;
    }

    var root = document.getElementById("formbuilder");
    if (root) {
      root.innerHTML = '<section class="fb-section"><h2>Vielen Dank für Ihre Angaben!</h2>'
        + '<div class="guidance">Ihre KI-Analyse wird jetzt erstellt. '
        + 'Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E-Mail.</div></section>';
    }

    var token = getToken();
    if (!token) {
      if (root) root.insertAdjacentHTML("beforeend",
        '<div class="guidance important" role="alert">Ihre Sitzung ist abgelaufen. '
        + '<a href="/login.html">Bitte neu anmelden</a>, wenn Sie eine weitere Analyse durchführen möchten.</div>');
      return;
    }

    // Daten zusammenstellen (Governance: keine Firmennamen)
    var data = {}; 
    for (var i=0;i<fields.length;i++){ data[fields[i].key] = formData[fields[i].key]; }
    delete data.unternehmen_name; delete data.firmenname;

    var email = getEmailFromJWT(token);
    var payload = { lang: LANG, answers: data, queue_analysis: true };
    if (email) { payload.email = email; }

    var url = getBaseUrl() + SUBMIT_PATH;

    // Idempotency-Key gegen Doppelklicks
    var idem = (Date.now().toString(36) + Math.random().toString(16).slice(2));
    SUBMIT_IN_FLIGHT = true;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token, "Idempotency-Key": idem },
      body: JSON.stringify(payload),
      credentials: "include",
      keepalive: true
    }).then(function (res) {
      if (res && res.status === 401) { try { localStorage.removeItem("jwt"); } catch (e) {} }
    }).catch(function(){}).finally(function(){ SUBMIT_IN_FLIGHT = false; });
  }

  // --------------------------- Hilfs-Funktionen ---------------------------
  function findField(k) { for (var i=0; i<fields.length; i++) { if (fields[i].key === k) return fields[i]; } return null; }

  function labelOf(k) {
    var f = findField(k);
    return f ? (f.label || k) : k;
  }

  function renderInput(f) {
    if (f.type === "select") {
      var opts = "<option value=''>Bitte wählen...</option>";
      for (var i=0; i<f.options.length; i++){ opts += "<option value='" + f.options[i].value + "'>" + f.options[i].label + "</option>"; }
      return "<select id='" + f.key + "' name='" + f.key + "'>" + opts + "</select>";
    }
    if (f.type === "checkbox") {
      var html = "<div class='checkbox-group'>";
      for (var j=0; j<f.options.length; j++){
        html += "<label class='checkbox-label'><input type='checkbox' name='" + f.key + "' value='" + f.options[j].value + "'><span>" + f.options[j].label + "</span></label>";
      }
      return html + "</div>";
    }
    if (f.type === "textarea") {
      var ph = f.placeholder || "";
      return "<textarea id='" + f.key + "' name='" + f.key + "' placeholder='" + ph + "'></textarea>";
    }
    if (f.type === "privacy") {
      return "<label style='display:flex;gap:12px;align-items:flex-start;'><input type='checkbox' id='" + f.key + "' name='" + f.key + "' style='margin-top:4px;width:18px;height:18px;'><span>" + f.label + "</span></label>";
    }
    if (f.type === "slider") {
      return "<div class='slider-container'><input type='range' id='" + f.key + "' name='" + f.key + "' min='" + f.min + "' max='" + f.max + "' step='" + f.step + "'><span class='slider-value-label' id='" + f.key + "_value'>" + (f.min || 1) + "</span></div>";
    }
    return "<input type='text' id='" + f.key + "' name='" + f.key + "' placeholder='" + (f.placeholder || '') + "'>";
  }

  function fillField(f) {
    var val = formData[f.key];
    if (f.type === "select") {
      var sel = document.getElementById(f.key); if (!sel) return;
      if (val) sel.value = val;
    } else if (f.type === "checkbox") {
      var arr = Array.isArray(val) ? val : [];
      var boxes = document.querySelectorAll("input[name='" + f.key + "']");
      for (var i=0; i<boxes.length; i++){ boxes[i].checked = arr.indexOf(boxes[i].value) !== -1; }
    } else if (f.type === "textarea") {
      var ta = document.getElementById(f.key); if (ta && val) ta.value = val;
    } else if (f.type === "privacy") {
      var cb = document.getElementById(f.key); if (cb) cb.checked = (val === true);
    } else if (f.type === "slider") {
      var slider = document.getElementById(f.key); 
      if (slider) { 
        slider.value = val || f.min || 1; 
        updateSliderLabel(f.key, slider.value); 
        slider.addEventListener("input", function(e){ updateSliderLabel(f.key, e.target.value); });
      }
    } else {
      var inp = document.getElementById(f.key); if (inp && val) inp.value = val;
    }
  }

  function collectValue(f) {
    if (f.type === "select") {
      var sel = document.getElementById(f.key); return sel ? sel.value : "";
    } else if (f.type === "checkbox") {
      var boxes = document.querySelectorAll("input[name='" + f.key + "']:checked"); var arr = [];
      for (var i=0; i<boxes.length; i++) arr.push(boxes[i].value);
      return arr;
    } else if (f.type === "textarea") {
      var ta = document.getElementById(f.key); return ta ? ta.value : "";
    } else if (f.type === "privacy") {
      var cb = document.getElementById(f.key); return cb ? cb.checked : false;
    } else if (f.type === "slider") {
      var slider = document.getElementById(f.key); return slider ? slider.value : "";
    } else {
      var inp = document.getElementById(f.key); return inp ? inp.value : "";
    }
  }

  function updateSliderLabel(key, val) {
    var lbl = document.getElementById(key + "_value");
    if (lbl) lbl.textContent = val;
  }

  // --------------------------- Storage ---------------------------
  var autosaveKey = STORAGE_PREFIX + "data";
  var stepKey = STORAGE_PREFIX + "step";
  var formData = {};
  var currentBlock = 0;

  function saveAutosave() { try { localStorage.setItem(autosaveKey, JSON.stringify(formData)); } catch(_) {} }
  function loadAutosave() { try { var s = localStorage.getItem(autosaveKey); if (s) formData = JSON.parse(s); } catch(_) {} }
  function saveStep() { try { localStorage.setItem(stepKey, String(currentBlock)); } catch(_) {} }
  function loadStep() { try { var s = localStorage.getItem(stepKey); if (s) currentBlock = parseInt(s, 10) || 0; } catch(_) {} }
  function scrollToStepTop(instant) {
    var root = document.getElementById("formbuilder");
    if (root && root.scrollIntoView) root.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }

  // Init
  window.addEventListener("DOMContentLoaded", function(){
    loadAutosave(); loadStep();
    // ensure keys for first block
    var b0 = blocks[0]; for (var i=0;i<b0.keys.length;i++){ var f=findField(b0.keys[i]); if (f && formData[f.key]===undefined) formData[f.key] = ""; }
    renderStep(); scrollToStepTop(true);
  });
})();