// --- injected helpers (idempotent) ---
function _collectLabelFor(fieldKey, value){
  try{
    if(!Array.isArray(FIELDS)) return "";
  }catch(e){}
  try{
    var fld = (typeof findField === 'function') ? findField(fieldKey) : null;
    if (!fld && typeof FIELDS !== 'undefined'){
      fld = FIELDS.find(f => f.key === fieldKey);
    }
    if(!fld) return value || "";
    // Support optgroups
    if(fld.optgroups && Array.isArray(fld.optgroups)){
      for(var g=0; g<fld.optgroups.length; g++){
        var grp = fld.optgroups[g];
        if(grp.options){
          var opt = grp.options.find(o => String(o.value) === String(value));
          if(opt) return opt.label || value || "";
        }
      }
      return value || "";
    }
    if(!Array.isArray(fld.options)) return value || "";
    var opt = fld.options.find(o => String(o.value) === String(value));
    return opt ? (opt.label || value || "") : (value || "");
  }catch(e){ return value || ""; }
}
// --- end injected helpers ---
/* Multi-Step Wizard (DE) – Scroll-to-Top, persistenter Autosave & Step-Resume */
/* Schema 1.5.0 – Microcopy optimiert für kleine Unternehmen; Submit nur im letzten Schritt. */
(function () {
  "use strict";

  // --------------------------- Konfiguration ---------------------------
  var LANG = "de";
  var SCHEMA_VERSION = "1.7.0";
  var STORAGE_PREFIX = "autosave_form_";
  var SUBMIT_PATH = "/briefings/submit";

  var versionKey = STORAGE_PREFIX + "schema";
  function ensureSchema(){
    try{
      var prev = localStorage.getItem(versionKey);
      if (prev !== SCHEMA_VERSION){
        localStorage.removeItem(autosaveKey);
        localStorage.removeItem(stepKey);
        localStorage.setItem(versionKey, SCHEMA_VERSION);
        currentBlock = 0;
      }
    }catch(_){}
  }

  // --------------------------- Helper-Funktionen ---------------------------
  function findField(k) {
    for (var i=0; i<fields.length; i++) {
      if (fields[i].key === k) return fields[i];
    }
    return null;
  }

  function labelOf(k) {
    var f = findField(k);
    return f ? (f.label || k) : k;
  }

  function renderInput(f) {
    if (f.type === "select") {
      var current = (formData && formData[f.key] != null) ? String(formData[f.key]) : "";
      var opts = "<option value=''>Bitte wählen...</option>";
      // Unterstützung für optgroups: wenn optgroups vorhanden, als Gruppen rendern
      if (f.optgroups) {
        for (var g=0; g<f.optgroups.length; g++){
          var grp = f.optgroups[g];
          opts += "<optgroup label='" + grp.label + "'>";
          for (var o=0; o<grp.options.length; o++){
            var v = String(grp.options[o].value);
            opts += "<option value='" + v + "'" + (v === current ? " selected" : "") + ">" + grp.options[o].label + "</option>";
          }
          opts += "</optgroup>";
        }
      } else {
        for (var i=0; i<f.options.length; i++){
          var v = String(f.options[i].value);
          opts += "<option value='" + v + "'" + (v === current ? " selected" : "") + ">" + f.options[i].label + "</option>";
        }
      }
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
      var sliderHtml = "<div class='slider-container'><input type='range' id='" + f.key + "' name='" + f.key + "' min='" + f.min + "' max='" + f.max + "' step='" + f.step + "'>"
        + "<span class='slider-value-label' id='" + f.key + "_value'>" + (f.min || 1) + "</span></div>";
      // Add endpoint labels for specific sliders
      if (f.key === "digitalisierungsgrad" || f.key === "risikofreude") {
        sliderHtml += "<div class='slider-labels'><span>Niedrig</span><span>Hoch</span></div>";
      }
      return sliderHtml;
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

  function clampStep(){
    try{
      if (typeof currentBlock !== "number") currentBlock = 0;
      if (currentBlock < 0 || currentBlock >= blocks.length) currentBlock = 0;
    }catch(_){ currentBlock = 0; }
  }

  var SUBMIT_IN_FLIGHT = false;

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

  // DEPRECATED: Token is now managed via httpOnly cookies
  // This function is kept for backwards compatibility but returns null
  function getToken() {
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
      + "select,textarea,input[type=text],input[type=range]{width:100%;border:2px solid #e2e8f0;border-radius:12px;padding:12px 14px;font-size:16px;background:#fff;transition:all 0.3s ease;font-family:inherit}"
      + "select:hover,textarea:hover,input[type=text]:hover{border-color:#cbd5e1}"
      + "select:focus,textarea:focus,input[type=text]:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}"
      + "textarea{min-height:120px;resize:vertical}"
      + ".checkbox-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:8px}"
      + ".checkbox-label{display:flex;gap:12px;align-items:flex-start;padding:12px;background:#f0f9ff;border:2px solid transparent;border-radius:12px;cursor:pointer;transition:all 0.3s ease}"
      + ".checkbox-label:hover{background:#e0f2fe;border-color:#dbeafe}"
      + ".checkbox-label input{margin-top:4px;width:18px;height:18px;cursor:pointer}"
      + ".invalid{border-color:#ef4444!important;background:#fef2f2!important}"
      + ".invalid-group{box-shadow:0 0 0 3px rgba(239,68,68,.2);border-radius:12px}"
      + ".form-nav{position:sticky;bottom:0;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-top:24px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,.05)}"
      + ".btn{border:0;border-radius:12px;padding:12px 22px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.25s ease}"
      + ".btn-primary{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff}"
      + ".btn-secondary{background:#fff;color:#1e293b;border:2px solid #cbd5e1}"
      + ".btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(37,99,235,.3)}"
      + ".btn-secondary:hover{background:#f0f9ff;border-color:#2563eb}"
      + ".mr-auto{margin-right:auto}"
      + ".slider-container{display:flex;align-items:center;gap:12px}"
      + ".slider-value-label{min-width:48px;padding:8px 12px;background:#dbeafe;border-radius:8px;font-weight:600;color:#1e3a5f;text-align:center}"
      + ".slider-labels{display:flex;justify-content:space-between;margin-top:6px;font-size:13px;color:#475569}";
    var s=document.createElement("style"); s.type="text/css"; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }catch(_){}})();

  // --------------------------- Inhalte ---------------------------
  var BLOCK_INTRO = [
    "Hier erfassen wir Basisdaten (Branche, Größe, Standort). Keine Unterlagen nötig – grobe Angaben reichen völlig. So personalisieren wir Ihren Report und prüfen passende Förderung & Compliance.",
    "Status Quo zu Prozessen, Daten und bisheriger KI-Nutzung. Ziel: schnelle, machbare Quick Wins und eine pragmatische Start-Roadmap – auch für kleine Teams.",
    "Ziele & wichtigste Anwendungsfälle: Was soll KI ganz konkret leisten? Wir fokussieren umsetzbare Maßnahmen mit sichtbarem Nutzen.",
    "Strategie & Governance: einfache, tragfähige Leitplanken für nachhaltigen KI-Einsatz ohne Bürokratie-Overhead.",
    "Ressourcen & Präferenzen (Zeit, Tool-Landschaft). Wir passen Empfehlungen an Machbarkeit, Budget und Tempo an.",
    "Rechtliches & Compliance: Prüfen Sie bitte kurz Ihr aktuelles Datenschutzniveau und bestehende Pflichten.",
    "Förderungen und Investitionsrahmen: Wir prüfen für Sie relevante Programme und realistische Schritte.",
    "Datenschutz & Absenden: Einwilligung bestätigen und den personalisierten Report starten."
  ];

  // Felder (inkl. freundlich-konkreter Microcopy)
  var fields = [
    { key: "branche", label: "In welcher Branche ist Ihr Unternehmen tätig?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Werbung" }, { value: "beratung", label: "Beratung & Dienstleistungen" },
        { value: "it", label: "IT & Software" }, { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "handel", label: "Handel & E-Commerce" }, { value: "bildung", label: "Bildung" },
        { value: "verwaltung", label: "Verwaltung" }, { value: "gesundheit", label: "Gesundheit & Pflege" },
        { value: "bau", label: "Bauwesen & Architektur" }, { value: "medien", label: "Medien & Kreativwirtschaft" },
        { value: "industrie", label: "Industrie & Produktion" }, { value: "logistik", label: "Transport & Logistik" },
        { value: "gastronomie", label: "Gastronomie & Tourismus" }
      ],
      description: "(Damit wir branchenspezifische Beispiele, Förderung und Compliance korrekt zuordnen.)"
    },
    { key: "unternehmensgroesse", label: "Wie groß ist Ihr Unternehmen?", type: "select",
      options: [
        { value: "1", label: "1 (Solo-Selbstständig/Freiberuflich)" }, { value: "2–10", label: "2–10 (Kleines Team)" }, { value: "11–100", label: "11–100 (KMU)" }
      ],
      description: "(Damit Empfehlungen und Förderhöhen realistisch nach Unternehmensgröße skaliert werden.)"
    },
    { key: "selbststaendig", label: "Unternehmensform bei 1 Person", type: "select",
      options: [
        { value: "freiberufler", label: "Freiberuflich/Selbstständig" }, { value: "kapitalgesellschaft", label: "1-Personen-Kapitalgesellschaft (GmbH/UG)" },
        { value: "einzelunternehmer", label: "Einzelunternehmer (mit Gewerbe)" }, { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "(Damit Rechtsformabhängigkeiten bei Pflichten, Zuschüssen und Verträgen korrekt berücksichtigt werden.)",
      showIf: function (data) { return data.unternehmensgroesse === "1"; }
    },
    { key: "bundesland", label: "Bundesland (regionale Fördermöglichkeiten)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" }, { value: "ni", label: "Niedersachsen" },
        { value: "nw", label: "Nordrhein-Westfalen" }, { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Sachsen" }, { value: "st", label: "Sachsen-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thüringen" }
      ],
      description: "(Damit regionale Programme, Ansprechpartner und Quoten automatisch berücksichtigt werden.)",
      showIf: function (data) { return data.country === "DE" || !data.country; }
    },
    { key: "country", label: "Land (für regionale Förderung & Compliance)", type: "select",
      optgroups: [
        { label: "EU", options: [
          { value: "DE", label: "Deutschland (DE)" }, { value: "AT", label: "Österreich (AT)" },
          { value: "FR", label: "Frankreich (FR)" }, { value: "IT", label: "Italien (IT)" }, { value: "ES", label: "Spanien (ES)" },
          { value: "NL", label: "Niederlande (NL)" }, { value: "BE", label: "Belgien (BE)" }, { value: "IE", label: "Irland (IE)" },
          { value: "PL", label: "Polen (PL)" }, { value: "SE", label: "Schweden (SE)" }, { value: "DK", label: "Dänemark (DK)" },
          { value: "FI", label: "Finnland (FI)" }, { value: "PT", label: "Portugal (PT)" }, { value: "CZ", label: "Tschechien (CZ)" },
          { value: "GR", label: "Griechenland (GR)" }, { value: "HU", label: "Ungarn (HU)" }, { value: "RO", label: "Rumänien (RO)" },
          { value: "other_eu", label: "Anderes EU-Land" }
        ]},
        { label: "Europa (Nicht-EU)", options: [
          { value: "GB", label: "Vereinigtes Königreich (UK)" }, { value: "CH", label: "Schweiz (CH)" }, { value: "NO", label: "Norwegen (NO)" },
          { value: "IS", label: "Island (IS)" }, { value: "LI", label: "Liechtenstein (LI)" }, { value: "other_europe", label: "Anderes europäisches Land" }
        ]},
        { label: "Andere", options: [
          { value: "other", label: "Nicht-europäisches Land" }
        ]}
      ],
      options: [],
      description: "(Damit Förderungen, Compliance und länderspezifische Programme korrekt zugeordnet werden.)"
    },
    { key: "hauptleistung", label: "Was ist Ihre Hauptdienstleistung oder Ihr wichtigstes Produkt?", type: "textarea",
      placeholder: "In 2–3 Sätzen oder Stichpunkten: Was bieten Sie an – und was unterscheidet Sie von anderen?",
      description: "(Damit wir Ihre Wertschöpfung verstehen und KI-Potenziale entlang Ihrer Hauptleistungen konkret und praxisnah identifizieren können. Stichworte reichen.)"
    },
    { key: "zielgruppen", label: "Welche Zielgruppen bedienen Sie?", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B (Geschäftskunden)" }, { value: "b2c", label: "B2C (Endverbraucher)" },
        { value: "kmu", label: "KMU" }, { value: "grossunternehmen", label: "Großunternehmen" },
        { value: "selbststaendige", label: "Selbstständige/Freiberufler" }, { value: "oeffentliche_hand", label: "Öffentliche Hand" },
        { value: "privatpersonen", label: "Privatpersonen" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Andere" }
      ],
      description: "(Damit Vorschläge auf relevante Kundengruppen und Kaufprozesse abgestimmt sind.)"
    },
    { key: "jahresumsatz", label: "Jahresumsatz (Schätzung)", type: "select",
      options: [
        { value: "unter_100k", label: "Bis 100.000 €" }, { value: "100k_500k", label: "100.000–500.000 €" },
        { value: "500k_2m", label: "500.000–2 Mio. €" }, { value: "2m_10m", label: "2–10 Mio. €" },
        { value: "ueber_10m", label: "Über 10 Mio. €" }, { value: "keine_angabe", label: "Keine Angabe" }
      ],
      description: "(Damit Benchmarks, Förderobergrenzen und ROI-Rechnungen belastbar abgeleitet werden.)"
    },
    { key: "it_infrastruktur", label: "Wie ist Ihre IT-Infrastruktur organisiert?", type: "select",
      options: [
        { value: "cloud", label: "Cloud-basiert (z. B. Microsoft 365, Google Cloud)" },
        { value: "on_premise", label: "Eigenes Rechenzentrum (On-Premises)" },
        { value: "hybrid", label: "Hybrid (Cloud + eigene Server)" }, { value: "unklar", label: "Unklar / noch offen" }
      ],
      description: "(Damit Integrationsaufwand, Datenschutzanforderungen und Hosting-Optionen realistisch geplant werden.)"
    },
    { key: "interne_ki_kompetenzen", label: "Gibt es ein internes KI-/Digitalisierungsteam?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "in_planung", label: "In Planung" } ],
      description: "(Damit Trainings, Unterstützung und Roadmap auf vorhandene Kompetenzen abgestimmt sind.)"
    },
    { key: "datenquellen", label: "Welche Datentypen stehen für KI-Projekte zur Verfügung?", type: "checkbox",
      options: [
        { value: "kundendaten", label: "Kundendaten (CRM, Service)" }, { value: "verkaufsdaten", label: "Verkaufs-/Bestelldaten" },
        { value: "produktionsdaten", label: "Produktions-/Betriebsdaten" }, { value: "personaldaten", label: "Personal-/HR-Daten" },
        { value: "marketingdaten", label: "Marketing-/Kampagnendaten" }, { value: "sonstige", label: "Sonstige Datenquellen" }
      ],
      description: "(Damit wir sinnvolle, datengestützte Use-Cases ohne aufwendige Vorprojekte finden.)"
    },

    // Block 2: Status Quo
    { key: "digitalisierungsgrad", label: "Wie digital sind Ihre internen Prozesse? (1–10)", type: "slider", min: 1, max: 10, step: 1,
      description: "(Damit wir den Ausgangspunkt und schnelle, realistische Verbesserungen einschätzen können.)" },
    { key: "prozesse_papierlos", label: "Anteil papierloser Prozesse", type: "select",
      options: [ { value: "0-20", label: "0–20%" }, { value: "21-50", label: "21–50%" }, { value: "51-80", label: "51–80%" }, { value: "81-100", label: "81–100%" } ],
      description: "(Damit Potenziale für Automatisierung und Medienbrüche gezielt adressiert werden.)" },
    { key: "automatisierungsgrad", label: "Automatisierungsgrad", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Sehr niedrig" }, { value: "eher_niedrig", label: "Eher niedrig" },
        { value: "mittel", label: "Mittel" }, { value: "eher_hoch", label: "Eher hoch" }, { value: "sehr_hoch", label: "Sehr hoch" }
      ],
      description: "(Damit Prioritäten für Effizienzgewinne und Risikoabschätzung fundiert gesetzt werden.)" },
    { key: "ki_einsatz", label: "Wo wird KI bereits eingesetzt?", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / Kundenservice" }, { value: "marketing", label: "Marketing & Content" },
        { value: "vertrieb", label: "Vertrieb & CRM" }, { value: "datenanalyse", label: "Datenanalyse" },
        { value: "produktion", label: "Produktion / Logistik" }, { value: "hr", label: "Personalmanagement" },
        { value: "andere", label: "Andere Bereiche" }, { value: "noch_keine", label: "Noch keine Nutzung" }
      ],
      description: "(Damit vorhandene Lösungen berücksichtigt und Doppelarbeiten konsequent vermieden werden.)" },
    { key: "ki_kompetenz", label: "KI-Kompetenz im Team", type: "select",
      options: [
        { value: "hoch", label: "Hoch" }, { value: "mittel", label: "Mittel" },
        { value: "niedrig", label: "Niedrig" }, { value: "keine", label: "Keine" }
      ],
      description: "(Damit Inhalte, Tempo und Unterstützung zum Teamniveau passen.)" },

    // Block 3: Ziele & Use Cases
    { key: "ki_ziele", label: "Ziele mit KI in den nächsten 3–6 Monaten", type: "checkbox",
      options: [
        { value: "effizienz", label: "Effizienz steigern" }, { value: "automatisierung", label: "Automatisierung" },
        { value: "neue_produkte", label: "Neue Produkte/Services" }, { value: "kundenservice", label: "Kundenservice verbessern" },
        { value: "datenauswertung", label: "Daten besser nutzen" }, { value: "kosten_senken", label: "Kosten senken" },
        { value: "wettbewerbsfaehigkeit", label: "Wettbewerbsfähigkeit" }, { value: "keine_angabe", label: "Noch unklar" }
      ],
      description: "(Damit Maßnahmen auf kurzfristige, messbare Ziele ausgerichtet priorisiert werden.)" },
    { key: "ki_projekte", label: "Gibt es bereits Tests, Tools oder Projekte mit KI (auch informell)?", type: "textarea", placeholder: "z. B. ChatGPT-Nutzung im Team, interne Pilotprojekte, Tools von Dienstleistern, Experimente mit Automatisierung …", description: "(Damit wir Doppelarbeit vermeiden, Synergien mit bestehenden Initiativen nutzen und Ihr aktuelles KI-Engagement passend einordnen können.)" },
    { key: "anwendungsfaelle", label: "Interessante Anwendungsfälle", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / FAQ-Automatisierung" }, { value: "content_generation", label: "Content-Generierung" },
        { value: "datenanalyse", label: "Datenanalyse & Reporting" }, { value: "dokumentation", label: "Dokumentation & Wissen" },
        { value: "prozess_automation", label: "Prozessautomation" }, { value: "personalisierung", label: "Personalisierung" },
        { value: "andere", label: "Andere" }, { value: "keine_angabe", label: "Noch unklar" }
      ],
      description: "(Damit wir passende Einstiege mit hohem Nutzen und geringer Komplexität wählen.)" },
    { key: "zeitersparnis_prioritaet", label: "Wo frisst heute am meisten Zeit oder Nerven?", type: "textarea",
      placeholder: "In welchen Bereichen verlieren Sie heute am meisten Zeit? (z. B. E-Mails, Angebote, Dokumentation)", description: "(Damit wir sehr konkrete Quick-Win-Empfehlungen zur Entlastung ableiten können – mit spürbarer Zeitersparnis im Alltag.)" },
    { key: "pilot_bereich", label: "Bester Bereich für Pilotprojekt", type: "select",
      options: [
        { value: "kundenservice", label: "Kundenservice" }, { value: "marketing", label: "Marketing / Content" },
        { value: "vertrieb", label: "Vertrieb" }, { value: "verwaltung", label: "Verwaltung / Backoffice" },
        { value: "produktion", label: "Produktion / Logistik" }, { value: "andere", label: "Andere" }
      ],
      description: "(Damit das erste Pilotprojekt reibungslos startet und zuverlässig Ergebnisse liefert.)" },
    { key: "geschaeftsmodell_evolution", label: "Haben Sie Ideen, wie KI Ihr Geschäftsmodell verändern oder ergänzen könnte?", type: "textarea",
      placeholder: "z. B. neue digitale Produkte, Services, Beratungsangebote, datengetriebene Zusatzleistungen …", description: "(Damit wir Potenziale für echte Business-Innovation neben der reinen Effizienzsteigerung erkennen und im Report sichtbar machen.)" },
    { key: "vision_3_jahre", label: "Wie soll Ihr Unternehmen in 2–3 Jahren mit KI arbeiten?", type: "textarea",
      placeholder: "Wie soll Ihr Unternehmen in 2–3 Jahren arbeiten? Kurzbeschreibung.", description: "(Damit wir Ihre mittel- bis langfristige Vision verstehen und zeigen können, wie KI Schritt für Schritt dorthin führen kann.)" },

    { key: "strategische_ziele", label: "Was soll KI in den nächsten 6–12 Monaten konkret für Sie verbessern?", type: "textarea", placeholder: "Was soll KI in den nächsten 6–12 Monaten verbessern? (Stichworte reichen)", description: "(Damit wir Ihre KI-Strategie konsequent an Ihren Unternehmenszielen ausrichten können – statt nur nice-to-have-Projekte zu starten.)" },
    { key: "ki_guardrails", label: "Gibt es No-Gos oder sensible Themen beim Einsatz von KI?", type: "textarea",
      placeholder: "z. B. keine Kommunikation zu Personalabbau, vorsichtiger Umgang mit Betriebsrat/Team, keine Gesundheitsprognosen, besondere Datenschutzanforderungen …",
      description: "(Damit wir Empfehlungen und Formulierungen so steuern können, dass sie zu Ihren Werten, Ihrer Kultur und rechtlichen Anforderungen passen.)" },
    { key: "massnahmen_komplexitaet", label: "Aufwand für die Einführung", type: "select",
      options: [ { value: "niedrig", label: "Niedrig" }, { value: "mittel", label: "Mittel" }, { value: "hoch", label: "Hoch" }, { value: "unklar", label: "Unklar" } ],
      description: "(Damit Umfang, Zeitplan und Ressourcen realistisch aufgesetzt werden.)" },
    { key: "roadmap_vorhanden", label: "KI-Roadmap/Strategie vorhanden?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "teilweise", label: "Teilweise" }, { value: "nein", label: "Nein" } ],
      description: "(Damit wir vorhandene Pläne nutzen und Lücken gezielt schließen.)" },
    { key: "governance_richtlinien", label: "KI-Governance-Richtlinien vorhanden?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "teilweise", label: "Teilweise" }, { value: "nein", label: "Nein" } ],
      description: "(Damit Verantwortungen, Freigaben und Zugriffsrechte sauber geregelt werden.)" },
    { key: "change_management", label: "Veränderungsbereitschaft im Team", type: "select",
      options: [
        { value: "sehr_hoch", label: "Sehr hoch" }, { value: "hoch", label: "Hoch" },
        { value: "mittel", label: "Mittel" }, { value: "niedrig", label: "Niedrig" }, { value: "sehr_niedrig", label: "Sehr niedrig" }
      ],
      description: "(Damit Kommunikation, Training und Tempo zur Veränderungsbereitschaft passen.)" },

    // Block 5: Ressourcen & Präferenzen
    { key: "zeitbudget", label: "Zeit pro Woche für KI-Projekte", type: "select",
      options: [ { value: "unter_2", label: "Unter 2 Stunden" }, { value: "2_5", label: "2–5 Stunden" }, { value: "5_10", label: "5–10 Stunden" }, { value: "ueber_10", label: "Über 10 Stunden" } ],
      description: "(Damit Maßnahmenpakete zu Ihrer verfügbaren Zeit realistisch passen.)" },
    { key: "vorhandene_tools", label: "Bereits genutzte Systeme", type: "checkbox",
      options: [
        { value: "crm", label: "CRM-Systeme (HubSpot, Salesforce)" }, { value: "erp", label: "ERP-Systeme (SAP, Odoo)" },
        { value: "projektmanagement", label: "Projektmanagement (Asana, Trello)" }, { value: "marketing_automation", label: "Marketing Automation" },
        { value: "buchhaltung", label: "Buchhaltungssoftware" }, { value: "keine", label: "Keine / andere" }
      ],
      description: "(Damit Integrationen genutzt und unnötige Tool-Dopplungen konsequent vermieden werden.)" },
    { key: "regulierte_branche", label: "Regulierte Branche", type: "checkbox",
      options: [
        { value: "gesundheit", label: "Gesundheit & Medizin" }, { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "oeffentlich", label: "Öffentlicher Sektor" }, { value: "recht", label: "Rechtliche Dienstleistungen" }, { value: "keine", label: "Keine dieser Branchen" }
      ],
      description: "(Einige KI-Anwendungen unterliegen strengen gesetzlichen Vorgaben. Bitte auswählen, falls relevant.)" },
    { key: "trainings_interessen", label: "Interessante KI-Trainingsthemen", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt Engineering" }, { value: "llm_basics", label: "LLM-Grundlagen" },
        { value: "datenqualitaet_governance", label: "Datenqualität & Governance" }, { value: "automatisierung", label: "Automatisierung & Skripte" },
        { value: "ethik_recht", label: "Ethische & rechtliche Grundlagen" }, { value: "keine", label: "Keine / noch unklar" }
      ],
      description: "(Damit Trainings passgenau geplant und Lernziele schnell erreicht werden.)" },
    { key: "vision_prioritaet", label: "Wichtigster strategischer Hebel", type: "select",
      options: [
        { value: "gpt_services", label: "KI-gestützte Services und Produkte" }, { value: "kundenservice", label: "Optimierung Kundenservice und Support" },
        { value: "datenprodukte", label: "Entwicklung datenbasierter Angebote" }, { value: "prozessautomation", label: "Automatisierung interner Prozesse" },
        { value: "marktfuehrerschaft", label: "Technologieführerschaft im Markt" }, { value: "keine_angabe", label: "Noch unklar" }
      ],
      description: "(Damit Empfehlungen auf den stärksten strategischen Hebel fokussieren.)" },

    // Block 6: Rechtliches & Förderung
    { key: "datenschutzbeauftragter", label: "Datenschutzbeauftragter vorhanden?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "teilweise", label: "Teilweise (extern/Planung)" } ],
      description: "(Damit Pflichten korrekt bewertet und Zuständigkeiten rechtssicher geklärt sind.)" },
    { key: "technische_massnahmen", label: "Technische Schutzmaßnahmen", type: "select",
      options: [ { value: "alle", label: "Alle relevanten Maßnahmen" }, { value: "teilweise", label: "Teilweise vorhanden" }, { value: "keine", label: "Noch keine" } ],
      description: "(Damit Sicherheitsniveau, Quick-Wins und Prioritäten fundiert abgeleitet werden.)" },
    { key: "folgenabschaetzung", label: "Datenschutz-Folgenabschätzung (DSFA)", type: "select",
      options: [ { value: "ja", label: "Ja, durchgeführt" }, { value: "nein", label: "Nein, noch nicht" }, { value: "teilweise", label: "In Planung" } ],
      description: "(Wird benötigt, wenn personenbezogene Daten mit höherem Risiko verarbeitet werden.)" },
    { key: "meldewege", label: "Meldewege bei Sicherheitsvorfällen", type: "select",
      options: [ { value: "ja", label: "Ja, klar definiert" }, { value: "teilweise", label: "Teilweise vorhanden" }, { value: "nein", label: "Nein, noch nicht geregelt" } ],
      description: "(Damit Vorfälle schnell eskaliert und rechtliche Fristen zuverlässig eingehalten werden.)" },
    { key: "loeschregeln", label: "Richtlinien für Datenlöschung und -anonymisierung", type: "select",
      options: [ { value: "ja", label: "Ja, dokumentiert" }, { value: "teilweise", label: "Teilweise vorhanden" }, { value: "nein", label: "Nein, noch nicht definiert" } ],
      description: "(Damit Aufbewahrung, Löschung und Anonymisierung nachvollziehbar geregelt sind.)" },
    { key: "ai_act_kenntnis", label: "Kenntnisse zum EU AI Act", type: "select",
      options: [ { value: "sehr_gut", label: "Sehr gut" }, { value: "gut", label: "Gut" }, { value: "gehoert", label: "Schon mal gehört" }, { value: "unbekannt", label: "Noch nicht bekannt" } ],
      description: "(Einschätzung, wie vertraut Sie mit dem kommenden EU-Gesetz zur Regulierung von KI sind.)" },
    { key: "ki_hemmnisse", label: "Hemmnisse beim KI-Einsatz", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Rechtsunsicherheit" }, { value: "datenschutz", label: "Datenschutz" }, { value: "knowhow", label: "Fehlendes Know-how" },
        { value: "budget", label: "Begrenztes Budget" }, { value: "teamakzeptanz", label: "Teamakzeptanz" }, { value: "zeitmangel", label: "Zeitmangel" },
        { value: "it_integration", label: "IT-Integration" }, { value: "keine", label: "Keine Hemmnisse" }, { value: "andere", label: "Andere" }
      ],
      description: "(Damit Hürden sichtbar werden und wir praktikable Lösungen priorisieren können.)" },
    { key: "bisherige_foerdermittel", label: "Bereits Fördermittel erhalten?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" } ],
      description: "(Damit passende Anschluss-Programme und Kombinationsmöglichkeiten früh erkannt werden.)" },
    { key: "interesse_foerderung", label: "Interesse an Fördermöglichkeiten", type: "select",
      options: [ { value: "ja", label: "Ja, Programme vorschlagen" }, { value: "nein", label: "Kein Bedarf" }, { value: "unklar", label: "Unklar, bitte beraten" } ],
      description: "(Damit wir Förderchancen prüfen und konkrete Optionen transparent vorschlagen.)" },
    { key: "erfahrung_beratung", label: "Bisherige Beratung zu Digitalisierung/KI", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "unklar", label: "Unklar" } ],
      description: "(Damit vorhandenes Vorwissen genutzt und Doppelarbeit vermieden werden.)" },
    { key: "investitionsbudget", label: "Budget für KI/Digitalisierung nächstes Jahr", type: "select",
      options: [ { value: "unter_2000", label: "Unter 2.000 €" }, { value: "2000_10000", label: "2.000–10.000 €" }, { value: "10000_50000", label: "10.000–50.000 €" },
        { value: "ueber_50000", label: "Über 50.000 €" }, { value: "unklar", label: "Noch unklar" } ],
      description: "(Damit Maßnahmenumfang und Förderquoten finanziell realistisch geplant werden.)" },
    { key: "marktposition", label: "Marktposition", type: "select",
      options: [ { value: "marktfuehrer", label: "Marktführer" }, { value: "oberes_drittel", label: "Oberes Drittel" }, { value: "mittelfeld", label: "Mittelfeld" },
        { value: "nachzuegler", label: "Nachzügler" }, { value: "unsicher", label: "Schwer einzuschätzen" } ],
      description: "(Damit Vergleichswerte, Erwartungen und Wettbewerbsstrategie passend eingeordnet werden.)" },
    { key: "benchmark_wettbewerb", label: "Vergleich mit Wettbewerbern", type: "select",
      options: [ { value: "ja", label: "Ja, regelmäßig" }, { value: "nein", label: "Nein" }, { value: "selten", label: "Selten" } ],
      description: "(Damit wir relevante Mitbewerbervergleiche im Report gezielt berücksichtigen.)" },
    { key: "innovationsprozess", label: "Wie entstehen Innovationen?", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovationsteam" }, { value: "mitarbeitende", label: "Durch Mitarbeitende" },
        { value: "kunden", label: "Mit Kunden" }, { value: "berater", label: "Externe Berater" },
        { value: "zufall", label: "Zufällig" }, { value: "unbekannt", label: "Keine klare Strategie" }
      ],
      description: "(Damit Innovationsquellen verstanden und wirksame Hebel gezielt unterstützt werden.)" },
    { key: "risikofreude", label: "Risikofreude bei Innovation (1–5)", type: "slider", min: 1, max: 5, step: 1,
      description: "(Damit das Einführungsrisiko zum gewünschten Tempo und Experimentiergrad passt.)" },

    // Block 7: Datenschutz & Absenden
    { key: "datenschutz", label:
      "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
      type: "privacy",
      description: "(Damit wir Ihre Angaben DSGVO-konform verarbeiten und den Report erstellen.)"
    }
  ];

  var blocks = [
    { title: "Firmendaten & Branche", intro: BLOCK_INTRO[0], keys: ["branche", "unternehmensgroesse", "selbststaendig", "country", "bundesland", "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur", "interne_ki_kompetenzen", "datenquellen"] },
    { title: "Status Quo", intro: BLOCK_INTRO[1], keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", "ki_einsatz", "ki_kompetenz"] },
    { title: "Ziele & Use Cases", intro: BLOCK_INTRO[2], keys: ["ki_ziele", "ki_projekte", "anwendungsfaelle", "zeitersparnis_prioritaet", "pilot_bereich", "geschaeftsmodell_evolution", "vision_3_jahre"] },
    { title: "Strategie & Governance", intro: BLOCK_INTRO[3], keys: ["strategische_ziele", "ki_guardrails", "massnahmen_komplexitaet", "roadmap_vorhanden", "governance_richtlinien", "change_management"] },
    { title: "Ressourcen & Präferenzen", intro: BLOCK_INTRO[4], keys: ["zeitbudget", "vorhandene_tools", "regulierte_branche", "trainings_interessen", "vision_prioritaet"] },
    { title: "Rechtliches & Compliance", intro: BLOCK_INTRO[5], keys: ["datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", "meldewege", "loeschregeln", "ai_act_kenntnis", "ki_hemmnisse"] },
    { title: "Förderung & Investition", intro: BLOCK_INTRO[6], keys: ["bisherige_foerdermittel", "interesse_foerderung", "erfahrung_beratung", "investitionsbudget", "marktposition", "benchmark_wettbewerb", "innovationsprozess", "risikofreude"] },
    { title: "Datenschutz & Absenden", intro: BLOCK_INTRO[7], keys: ["datenschutz"] }
  ];

  // --------------------------- Render ---------------------------
  function renderStep(){
    var root = document.getElementById("formbuilder");
    if (!root) return;

    clampStep();
    var block = blocks[currentBlock];
    var html = "<section class='fb-section'><div class='fb-head'>"
      + "<span class='fb-step'>Schritt " + (currentBlock + 1) + "/" + blocks.length + "</span>"
      + "<h2 class='fb-title'>" + block.title + "</h2></div>"
      + "<p class='section-intro'>" + block.intro + "</p>";

    for (var i=0; i<block.keys.length; i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      html += "<div class='form-group' data-key='" + k + "'><label for='" + f.key + "'>" + f.label + "</label>";
      if (f.description) html += "<div class='guidance'>" + f.description + "</div>";
      // Add guidance for required checkbox groups
      if (f.type === "checkbox" && (f.key === "zielgruppen" || f.key === "ki_ziele" || f.key === "anwendungsfaelle")) {
        html += "<div class='guidance important'>Bitte mindestens eine Option auswählen.</div>";
      }
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

    // change handler (remove first to prevent duplicates on re-render)
    root.removeEventListener("change", handleChange);
    root.addEventListener("change", handleChange);

    // autofill & validate
    for (var j=0; j<block.keys.length; j++){
      var field = findField(block.keys[j]); if (!field) continue;
      if (typeof field.showIf === "function" && !field.showIf(formData)) continue;
      fillField(field);
    }

    // listener
    var prev = document.getElementById("btn-prev");
    if (prev) prev.addEventListener("click", function () {
      if (currentBlock > 0) {
        currentBlock--; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true);
      }
    });

    var next = document.getElementById("btn-next");
    if (next) {
      next.addEventListener("click", function () {
        var missing = validateCurrentBlock(true); if (missing.length) return;
        if (currentBlock < blocks.length - 1) {
          currentBlock++; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true);
        }
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
    // sichtbare Felder des aktuellen Blocks in formData schreiben
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

    // Conditionals: re-render, damit showIf greift
    if (e && e.target && (e.target.id === "unternehmensgroesse" || e.target.id === "country")) {
      // CRITICAL: Save ALL current form values before re-render to prevent data loss
      var targetId = e.target.id;
      var scrollY = window.scrollY || window.pageYOffset;

      // Collect ALL visible form element values to ensure nothing is lost
      var formElements = document.querySelectorAll('#formbuilder input, #formbuilder select, #formbuilder textarea');
      for (var fe = 0; fe < formElements.length; fe++) {
        var el = formElements[fe];
        if (el.id && el.type !== 'button' && el.type !== 'submit') {
          if (el.type === 'checkbox') {
            // Handle checkbox groups
            if (!formData[el.name]) formData[el.name] = [];
            if (el.checked && formData[el.name].indexOf(el.value) === -1) {
              formData[el.name].push(el.value);
            }
          } else if (el.type === 'radio') {
            if (el.checked) formData[el.name] = el.value;
          } else {
            formData[el.id] = el.value;
          }
        }
      }
      saveAutosave();

      // Re-render step (needed for showIf conditionals)
      renderStep();

      // Restore scroll position and focus after re-render
      setTimeout(function() {
        window.scrollTo(0, scrollY);
        var field = document.getElementById(targetId);
        if (field) {
          field.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
      }, 50);
      return;
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
    var optional = {
      "jahresumsatz":1,"it_infrastruktur":1,"interne_ki_kompetenzen":1,"datenquellen":1,
      "zeitbudget":1,"vorhandene_tools":1,"regulierte_branche":1,"trainings_interessen":1,
      "vision_prioritaet":1,"selbststaendig":1,"hauptleistung":0,
      "ki_projekte":1,"geschaeftsmodell_evolution":1,"vision_3_jahre":1,"ki_guardrails":1
    };
    var missing = [];
    var block = blocks[currentBlock];

    // reset
    for (var j=0;j<block.keys.length;j++) markInvalid(block.keys[j], false);

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      var val = formData[k];
      var ok = true;
      if (optional[k]) { /* optional */ }
      else if (f.type === "checkbox" && f.options) { ok = Array.isArray(val) && val.length>0; }
      else if (f.type === "privacy") { ok = (val === true); }
      else if (f.type === "select") { ok = !!val && String(val) !== ""; }
      else if (f.type === "slider") { ok = !!val; }
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
  function submitForm() {
    if (typeof SUBMIT_IN_FLIGHT !== "undefined" && SUBMIT_IN_FLIGHT) return;

    // collect all values (only visible fields per block)
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki];
        var f = (typeof findField === "function") ? findField(k) : null;
        if (f && typeof f.showIf === "function" && !f.showIf(formData)) continue;
        if (document.getElementById(k)) {
          formData[k] = (typeof collectValue === "function"
                         ? collectValue(f || {key:k,type:"text"})
                         : (document.getElementById(k).value || ""));
        }
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

    // Auth is now handled via httpOnly cookies - no client-side token needed
    var data = {};
    for (var i2=0;i2<fields.length;i2++){
      data[fields[i2].key] = formData[fields[i2].key];
    }
    delete data.unternehmen_name;
    delete data.firmenname;

    var email = null; // Email will be provided by backend from cookie session
    var payload = { lang: LANG, answers: data, queue_analysis: true };
    if (email) { payload.email = email; }

    // ensure required top-level fields for backend (auch in answers gespiegelt)
    payload.branche = data.branche || payload.branche || "";
    payload.unternehmensgroesse = data.unternehmensgroesse || payload.unternehmensgroesse || "";
    payload.country = data.country || payload.country || "DE";
    payload.bundesland = data.bundesland || payload.bundesland || "";
    payload.hauptleistung = data.hauptleistung || payload.hauptleistung || "";
    if (email && payload.answers && typeof payload.answers === "object") {
      payload.answers.email = email;
    }

    var url = getBaseUrl() + SUBMIT_PATH;
    var idem = (Date.now().toString(36) + Math.random().toString(16).slice(2));

    try { SUBMIT_IN_FLIGHT = true; } catch(_) {}

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idem },
      body: JSON.stringify(payload),
      credentials: "include",
      keepalive: true
    }).then(function (res) {
      if (res && res.status === 401) {
        // Redirect to login on auth failure
        window.location.href = '/login.html';
      }
    }).catch(function(){}).finally(function(){ try { SUBMIT_IN_FLIGHT = false; } catch(_) {} });
  }

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

  // Init function
  function doInit(){
    ensureSchema && ensureSchema();
    loadAutosave();
    loadStep();
    // Sicherstellen, dass Block 0 keys existieren (Initialvalidierung)
    var b0 = blocks[0] || { keys: [] };
    for (var i=0; i<b0.keys.length; i++){
      var k = b0.keys[i];
      if (formData[k]===undefined) formData[k] = '';
    }
    clampStep && clampStep();
    renderStep();
    scrollToStepTop(true);
  }

  // Auto-init on DOMContentLoaded OR if already loaded
  if (document.readyState === 'loading') {
    window.addEventListener("DOMContentLoaded", doInit);
  } else {
    // DOM already loaded, init immediately
    doInit();
  }

  // Export init function for manual initialization
  window.initFormBuilder = doInit;
})();;


function robustSubmitForm(){
  try{
    // Auth is now handled via httpOnly cookies - no client-side token validation needed
    // collect form data from known fields list if present, else from all inputs
    var data = (typeof formData !== "undefined" && formData) ? Object.assign({}, formData) : {};
    try{
      if(typeof fields !== "undefined" && Array.isArray(fields)){
        for(var i=0;i<fields.length;i++){
          var k = fields[i].key;
          var el = document.getElementById(k);
          if(el){
            if(el.tagName === "SELECT" || el.tagName === "INPUT" || el.tagName === "TEXTAREA"){
              if(el.type === "checkbox"){
                // gather named checkboxes
                var nodes = document.querySelectorAll("input[name='"+k+"']:checked");
                var arr = []; nodes.forEach(function(n){ arr.push(n.value); }); data[k] = arr;
              }else{
                data[k] = el.value;
              }
            }
          }else{
            // maybe checkbox group ohne id
            var nodes2 = document.querySelectorAll("input[name='"+k+"']:checked");
            if(nodes2 && nodes2.length){ var arr2=[]; nodes2.forEach(function(n){arr2.push(n.value);}); data[k]=arr2; }
          }
        }
      }
    }catch(e){ console.warn("collect values fallback:", e); }

    // ensure email included (legacy - Token kann leer sein)
    var token = "";
    try {
      token = localStorage.getItem('access_token') || "";
    } catch(_){}
    try{
      if(typeof getEmailFromJWT === "function"){
        var em = getEmailFromJWT(token);
        if(em && !data.email){ data.email = em; }
      }
    }catch(_){}

    // Top-level payload
    var payload = { lang: (typeof LANG!=='undefined'?LANG:'de'), answers: data, queue_analysis: true };
    if(data.email){ payload.email = data.email; }
    // critical top-level fields
    payload.branche = data.branche || "";
    payload.unternehmensgroesse = data.unternehmensgroesse || data.company_size || "";
    payload.country = data.country || "DE";
    payload.bundesland = data.bundesland || data.bundesland_code || "";
    payload.hauptleistung = data.hauptleistung || data.main_service || "";

    // provide human-readable labels
    try{ payload.branche_label = _collectLabelFor("branche", payload.branche); }catch(_){}
    try{ payload.unternehmensgroesse_label = _collectLabelFor("unternehmensgroesse", payload.unternehmensgroesse); }catch(_){}
    try{ payload.country_label = _collectLabelFor("country", payload.country); }catch(_){}
    try{ payload.bundesland_label = _collectLabelFor("bundesland", payload.bundesland); }catch(_){}
    try{ payload.jahresumsatz_label = _collectLabelFor("jahresumsatz", data.jahresumsatz || ""); }catch(_){}

    // Build URL
    var url = (typeof getBaseUrl === "function" ? getBaseUrl() : "") + "/briefings/submit";
    var idem = (Date.now().toString(36) + Math.random().toString(16).slice(2));

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        "Idempotency-Key": idem
      },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify(payload)
    }).then(function(res){
      if(!res.ok){
        console.warn("Submit returned non-OK", res.status);
      }
    }).catch(function(err){
      console.error("Submit failed", err);
    });
  }catch(e){
    console.error("robustSubmitForm error", e);
  }
}
// if submitForm exists, wrap it to call robust implementation as well
try{
  var _origSubmit = (typeof submitForm === "function") ? submitForm : null;
  submitForm = function(){
    try{ if(_origSubmit){ _origSubmit.apply(null, arguments); } }catch(_){ }
    robustSubmitForm();
  };
}catch(_){
  submitForm = robustSubmitForm;
}
