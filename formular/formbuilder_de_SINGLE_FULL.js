/* File: formular/formbuilder_de_SINGLE_FULL.js */
/* Multi-Step Wizard mit strikter Pflichtfeld-Prüfung & persistentem Autosave. */
/* Verbessert: Step-Gate, robustes Submit, präzisere Mappings (keine leeren Briefings mehr). */
(function () {
  "use strict";

  var LANG = "de";
  var SCHEMA_VERSION = "1.5.0";
  var STORAGE_PREFIX = "autosave_form_";
  var SUBMIT_PATH = "/briefing_async";

  function getBaseUrl() {
    try {
      var meta = document.querySelector('meta[name="api-base"]');
      var v = (meta && meta.content) || (window.API_BASE || "");
      return String(v || "").replace(/\/+$/, "");
    } catch (e) { return ""; }
  }
  function getToken() {
    var keys = ["jwt", "access_token", "id_token", "AUTH_TOKEN", "token"];
    for (var i = 0; i < keys.length; i++) { try { var t = localStorage.getItem(keys[i]); if (t) return t; } catch (e) {} }
    return null;
  }
  function getEmailFromJWT(token) {
    try { if (!token || token.split(".").length !== 3) return null;
      var payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || payload.preferred_username || payload.sub || null;
    } catch (e) { return null; }
  }
  function dispatchProgress(step, total) {
    try { document.dispatchEvent(new CustomEvent("fb:progress", { detail: { step: step, total: total } })); } catch (_) {}
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
    "Hier erfassen wir Basisdaten (Branche, Größe, Standort).",
    "Status-Quo zu Prozessen, Daten und bisherigen KI-Erfahrungen.",
    "Ziele & wichtigste Anwendungsfälle.",
    "Strategie & Governance.",
    "Ressourcen & Präferenzen.",
    "Rechtliches & Förderung.",
    "Datenschutz & Absenden."
  ];

  // Felder
  var fields = [
    { key: "branche", label: "In welcher Branche ist Ihr Unternehmen tätig?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Werbung" }, { value: "beratung", label: "Beratung & Dienstleistungen" },
        { value: "it", label: "IT & Software" }, { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "handel", label: "Handel & E-Commerce" }, { value: "bildung", label: "Bildung" },
        { value: "verwaltung", label: "Verwaltung" }, { value: "gesundheit", label: "Gesundheit & Pflege" },
        { value: "bau", label: "Bauwesen & Architektur" }, { value: "medien", label: "Medien & Kreativwirtschaft" },
        { value: "industrie", label: "Industrie & Produktion" }, { value: "logistik", label: "Transport & Logistik" }
      ],
      description: "Ihre Hauptbranche beeinflusst Benchmarks, Empfehlungen und die Auswertung."
    },
    { key: "unternehmensgroesse", label: "Wie groß ist Ihr Unternehmen?", type: "select",
      options: [
        { value: "solo", label: "1 (Solo-Selbstständig/Freiberuflich)" }, { value: "small", label: "2–10 (Kleines Team)" }, { value: "kmu", label: "11–100 (KMU)" }
      ],
      description: "Die Unternehmensgröße beeinflusst Empfehlungen und Förderung."
    },
    { key: "selbststaendig", label: "Unternehmensform bei 1 Person", type: "select",
      options: [
        { value: "freiberufler", label: "Freiberuflich/Selbstständig" }, { value: "kapitalgesellschaft", label: "1-Personen-Kapitalgesellschaft (GmbH/UG)" },
        { value: "einzelunternehmer", label: "Einzelunternehmer (mit Gewerbe)" }, { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Bitte wählen Sie die zutreffende Rechtsform.",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "bundesland", label: "Bundesland (regionale Fördermöglichkeiten)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" }, { value: "ni", label: "Niedersachsen" },
        { value: "nw", label: "Nordrhein-Westfalen" }, { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Sachsen" }, { value: "st", label: "Sachsen-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" },
        { value: "th", label: "Thüringen" }
      ],
      description: "Ihr Standort bestimmt verfügbare Fördermittel und Programme."
    },
    { key: "hauptleistung", label: "Was ist Ihre Hauptdienstleistung oder Ihr wichtigstes Produkt?", type: "textarea",
      placeholder: "z.B. Social-Media-Kampagnen, CNC-Fertigung, Steuerberatung",
      description: "Beschreiben Sie Ihre zentrale Leistung möglichst konkret."
    },

    // Block 2: Status Quo
    { key: "digitalisierungsgrad", label: "Wie digital sind Ihre internen Prozesse? (1–10)", type: "slider", min: 1, max: 10, step: 1,
      description: "1 = hauptsächlich Papier/manuell, 10 = vollständig digital/automatisiert" },
    { key: "prozesse_papierlos", label: "Anteil papierloser Prozesse", type: "select",
      options: [ { value: "0-20", label: "0–20%" }, { value: "21-50", label: "21–50%" }, { value: "51-80", label: "51–80%" }, { value: "81-100", label: "81–100%" } ],
      description: "Grobe Schätzung genügt." },
    { key: "automatisierungsgrad", label: "Automatisierungsgrad", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Sehr niedrig" }, { value: "eher_niedrig", label: "Eher niedrig" },
        { value: "mittel", label: "Mittel" }, { value: "eher_hoch", label: "Eher hoch" }, { value: "sehr_hoch", label: "Sehr hoch" }
      ],
      description: "Wie viel läuft automatisiert vs. manuell?" },

    // Block 3–6 (gekürzt um nur Pflicht zu zeigen)
    { key: "innovationskultur", label: "Offenheit für Innovationen", type: "select",
      options: [
        { value: "sehr_offen", label: "Sehr offen" }, { value: "eher_offen", label: "Eher offen" }, { value: "neutral", label: "Neutral" },
        { value: "eher_zurueckhaltend", label: "Eher zurückhaltend" }, { value: "sehr_zurueckhaltend", label: "Sehr zurückhaltend" }
      ],
      description: "Innovationsfreundliche Kultur erleichtert KI-Einführung." },
    { key: "ki_knowhow", label: "KI-Know-how im Team", type: "select",
      options: [
        { value: "keine", label: "Keine Erfahrung" }, { value: "grundkenntnisse", label: "Grundkenntnisse" }, { value: "mittel", label: "Mittel" },
        { value: "fortgeschritten", label: "Fortgeschritten" }, { value: "expertenwissen", label: "Expertenwissen" }
      ],
      description: "Selbsteinschätzung genügt." },

    // Block „Rechtliches & Förderung“
    { key: "datenschutz", label:
      "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
      type: "privacy", description: "Bitte bestätigen." },
    { key: "investitionsbudget", label: "Budget für KI/Digitalisierung nächstes Jahr", type: "select",
      options: [ { value: "unter_2000", label: "Unter 2.000 €" }, { value: "2000_10000", label: "2.000–10.000 €" }, { value: "10000_50000", label: "10.000–50.000 €" },
        { value: "ueber_50000", label: "Über 50.000 €" }, { value: "unklar", label: "Noch unklar" } ],
      description: "Auch kleine Budgets können Fortschritt bringen." }
  ];

  var blocks = [
    { name: "Unternehmensinfos", keys: ["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung"] },
    { name: "Status Quo", keys: ["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","innovationskultur","ki_knowhow"] },
    { name: "Rechtliches & Förderung", keys: ["datenschutz","investitionsbudget"] }
  ];

  // --------------------------- State ---------------------------
  var currentBlock = 0;
  var formData = {};
  var autosaveKey = (function () {
    try { var t = getToken(); var e = getEmailFromJWT(t); return (e ? (STORAGE_PREFIX + e) : (STORAGE_PREFIX + "test")) + ":" + LANG + ":" + SCHEMA_VERSION; }
    catch (e) { return STORAGE_PREFIX + "test:" + LANG + ":" + SCHEMA_VERSION; }
  })();
  var stepKey = autosaveKey + ":step";

  function loadAutosave(){ try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }catch(e){ formData = {}; } }
  function saveAutosave(){ try{ localStorage.setItem(autosaveKey, JSON.stringify(formData)); }catch(e){} }
  function loadStep(){
    try {
      var raw = localStorage.getItem(stepKey);
      var n = raw==null ? 0 : parseInt(raw,10);
      if (isNaN(n)) n = 0;
      currentBlock = Math.max(0, Math.min(blocks.length-1, n));
    } catch(_) { currentBlock = 0; }
  }
  function saveStep(){ try { localStorage.setItem(stepKey, String(currentBlock)); } catch(_){} }

  // --------------------------- Utilities ---------------------------
  function findField(key){ for (var i=0;i<fields.length;i++) if (fields[i].key===key) return fields[i]; return null; }
  function labelOf(key){ var f=findField(key); return (f && f.label) || key; }
  function collectValue(f){
    if (f.type === "privacy") { var ch = document.getElementById(f.key); return ch ? !!ch.checked : false; }
    if (f.type === "slider")  { var el = document.getElementById(f.key); return el ? el.value : (f.min || 1); }
    if (f.type === "select" || f.type === "textarea" || f.type === "text") {
      var inp = document.getElementById(f.key); return inp ? inp.value : "";
    }
    // nur verwendete Typen
    return "";
  }

  function scrollToStepTop(instant){
    try {
      var root = document.getElementById('formbuilder');
      if (!root) { window.scrollTo({ top: 0, behavior: (instant?'auto':'smooth') }); return; }
      var y = root.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 16;
      window.scrollTo({ top: y, behavior: (instant?'auto':'smooth') });
    } catch(e){ try{ window.scrollTo(0,0); }catch(_){} }
  }

  // --------------------------- Rendering ---------------------------
  function renderField(f) {
    var v = formData[f.key];
    var guidance = f.description ? '<div class="guidance'+(f.type==="privacy"?" important":"")+'">'+f.description+'</div>' : "";
    var html = "";
    if (f.type === "select") {
      var opts = '<option value="">Bitte wählen…</option>';
      for (var i=0;i<(f.options||[]).length;i++){
        var o=f.options[i]; var sel = (String(v||"")===String(o.value))?' selected':'';
        opts += '<option value="'+o.value+'"'+sel+'>'+o.label+'</option>';
      }
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<select id="'+f.key+'" name="'+f.key+'">'+opts+'</select>';
    } else if (f.type === "textarea") {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<textarea id="'+f.key+'" name="'+f.key+'" placeholder="'+(f.placeholder||"")+'">'+(v||"")+'</textarea>';
    } else if (f.type === "slider") {
      var val = (v!=null?v:(f.min||1));
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<div class="slider-container"><input type="range" id="'+f.key+'" name="'+f.key+'" min="'+(f.min||1)+'" max="'+(f.max||10)+'" step="'+(f.step||1)+'" value="'+val+'" oninput="this.parentElement.querySelector(\'.slider-value-label\').innerText=this.value"><span class="slider-value-label">'+val+'</span></div>';
    } else if (f.type === "privacy") {
      var chk = (v===true)?' checked':'';
      html = '<div class="guidance important">'+(f.description||"")+'</div>'+
             '<label class="checkbox-label"><input type="checkbox" id="'+f.key+'" name="'+f.key+'"'+chk+' required><span>'+f.label+'</span></label>';
    } else {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<input type="text" id="'+f.key+'" name="'+f.key+'" value="'+(v||"")+'">';
    }
    return '<div class="form-group" data-key="'+f.key+'">'+html+'</div>';
  }

  function renderStep() {
    var root = document.getElementById("formbuilder");
    if (!root) return;

    var block = blocks[currentBlock];
    var intro = BLOCK_INTRO[currentBlock] || "";
    var html = '<section class="fb-section">'
             +   '<div class="fb-head"><span class="fb-step">Schritt '+(currentBlock+1)+'/'+blocks.length+'</span>'
             +   '<span class="fb-title">'+block.name+'</span></div>'
             +   (intro ? '<div class="section-intro">'+intro+'</div>' : '');

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      html += renderField(f);
    }

    html += '</section><div class="form-nav">'
         +  '<button type="button" class="btn btn-secondary mr-auto" id="btn-reset">Zurücksetzen</button>'
         +  '<button type="button" class="btn btn-secondary" id="btn-back" '+(currentBlock===0?'disabled':'')+'>Zurück</button>'
         +  (currentBlock < blocks.length-1
              ? '<button type="button" class="btn btn-primary" id="btn-next">Weiter</button>'
              : '<button type="button" class="btn btn-primary" id="btn-submit">Absenden</button>')
         +  '</div>'
         +  '<div id="fb-msg" aria-live="polite"></div>';

    root.innerHTML = html;

    root.addEventListener("change", handleChange);
    root.addEventListener("input", handleChange);

    root.addEventListener("keydown", function (ev) {
      var isEnter = (ev.key === "Enter" || ev.keyCode === 13);
      var tag = (ev.target && ev.target.tagName) ? ev.target.tagName.toUpperCase() : "";
      if (isEnter && tag !== "TEXTAREA" && currentBlock < blocks.length - 1) { ev.preventDefault(); }
    });

    var back = document.getElementById("btn-back");
    if (back) back.addEventListener("click", function () {
      if (currentBlock>0) { currentBlock--; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
    });

    var next = document.getElementById("btn-next");
    if (next) {
      next.addEventListener("click", function () {
        var missing = validateCurrentBlock(true);
        if (missing.length === 0 && currentBlock < blocks.length-1) { currentBlock++; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
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
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

    if (e && e.target && e.target.id === "unternehmensgroesse") {
      renderStep(); scrollToStepTop(false); return;
    }
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
    // Pflichtfelder: branche, unternehmensgroesse, bundesland, hauptleistung, investitionsbudget, datenschutz
    var mandatory = { "branche":1, "unternehmensgroesse":1, "bundesland":1, "hauptleistung":1, "investitionsbudget":1, "datenschutz":1 };
    var missing = [];
    var block = blocks[currentBlock];

    for (var j=0;j<block.keys.length;j++) markInvalid(block.keys[j], false);

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i], f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      var val = formData[k], ok = true;

      if (mandatory[k]) {
        if (f.type === "privacy") ok = (val === true);
        else if (f.type === "select" || f.type === "text" || f.type === "textarea") ok = !!val && String(val).trim() !== "";
      }
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
  function submitForm() {
    // Alle Felder einsammeln
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
        formData[k] = collectValue(f);
      }
    }
    saveAutosave();

    // Harte Pflicht-Validierung vor Submit
    var hardMissing = [];
    ["branche","unternehmensgroesse","bundesland","hauptleistung","investitionsbudget","datenschutz"].forEach(function(k){
      var f = findField(k), v = formData[k];
      var ok = true;
      if (f && f.type === "privacy") ok = (v === true);
      else ok = !!v && String(v).trim() !== "";
      if (!ok) hardMissing.push(labelOf(k));
    });
    if (hardMissing.length) {
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Bitte vervollständigen: " + hardMissing.join(", "); msg.setAttribute("role","alert"); }
      return;
    }

    var root = document.getElementById("formbuilder");
    if (root) {
      root.innerHTML = '<section class="fb-section"><h2>Vielen Dank!</h2>'
        + '<div class="guidance">Ihre KI-Analyse wird jetzt erstellt. '
        + 'Nach Fertigstellung erhalten Sie die Auswertung als PDF per E‑Mail.</div></section>';
    }

    var token = getToken();
    if (!token) {
      if (root) root.insertAdjacentHTML("beforeend",
        '<div class="guidance important" role="alert">Ihre Sitzung ist abgelaufen. '
        + '<a href="/login.html">Bitte neu anmelden</a>, um eine weitere Analyse zu starten.</div>');
      return;
    }

    var data = {}; for (var i=0;i<fields.length;i++){ data[fields[i].key] = formData[fields[i].key]; }
    data.lang = LANG;

    var email = getEmailFromJWT(token); if (email) { data.email = email; data.to = email; }

    var url = getBaseUrl() + SUBMIT_PATH;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(data),
      credentials: "include",
      keepalive: true
    }).then(function (res) {
      if (res && res.status === 401) { try { localStorage.removeItem("jwt"); } catch (e) {} }
    }).catch(function(){});
  }

  // Init
  window.addEventListener("DOMContentLoaded", function(){
    loadAutosave(); loadStep();
    var b0 = blocks[0]; for (var i=0;i<b0.keys.length;i++){ var f=findField(b0.keys[i]); if (f && formData[f.key]===undefined) formData[f.key] = ""; }
    renderStep(); scrollToStepTop(true);
  });
})();
