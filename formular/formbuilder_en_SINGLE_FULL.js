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
    if(!fld || !Array.isArray(fld.options)) return value || "";
    var opt = fld.options.find(o => String(o.value) === String(value));
    return opt ? (opt.label || value || "") : (value || "");
  }catch(e){ return value || ""; }
}
// --- end injected helpers ---
/* Multi-Step Wizard (EN) – Scroll-to-Top, persistent Autosave & Step-Resume */
/* Schema 1.7.0 – Microcopy optimized for small businesses; Submit only in last step. */
(function () {
  "use strict";

  // --------------------------- Configuration ---------------------------
  var LANG = "en";
  var SCHEMA_VERSION = "1.7.0";
  var STORAGE_PREFIX = "autosave_form_en_";
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

  // --------------------------- Helper Functions ---------------------------
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
      var opts = "<option value=''>Please select...</option>";
      for (var i=0; i<f.options.length; i++){
        opts += "<option value='" + f.options[i].value + "'>" + f.options[i].label + "</option>";
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
        sliderHtml += "<div class='slider-labels'><span>Low</span><span>High</span></div>";
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

  // --------------------------- Content ---------------------------
  var BLOCK_INTRO = [
    "We collect basic data (industry, size, location). No documents needed - rough estimates are fine. This helps us personalize your report and check relevant compliance requirements.",
    "Current status of processes, data, and existing AI usage. Goal: quick, achievable wins and a pragmatic starting roadmap - even for small teams.",
    "Goals & key use cases: What should AI specifically achieve? We focus on actionable measures with visible benefits.",
    "Strategy & Governance: simple, sustainable guidelines for long-term AI deployment without bureaucratic overhead.",
    "Resources & Preferences (time, tool landscape). We adapt recommendations to feasibility, budget, and pace.",
    "Legal & Compliance: Please briefly review your current data protection level and existing obligations.",
    "Investment framework: We assess realistic steps and budget considerations for your AI journey.",
    "Privacy & Submit: Confirm consent and start your personalized report."
  ];

  // Fields (with friendly, concrete microcopy)
  var fields = [
    { key: "branche", label: "What industry is your company in?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Advertising" }, { value: "beratung", label: "Consulting & Services" },
        { value: "it", label: "IT & Software" }, { value: "finanzen", label: "Finance & Insurance" },
        { value: "handel", label: "Retail & E-Commerce" }, { value: "bildung", label: "Education" },
        { value: "verwaltung", label: "Public Administration" }, { value: "gesundheit", label: "Healthcare" },
        { value: "bau", label: "Construction & Architecture" }, { value: "medien", label: "Media & Creative Industries" },
        { value: "industrie", label: "Manufacturing & Production" }, { value: "logistik", label: "Transport & Logistics" }
      ],
      description: "(So we can assign industry-specific examples and compliance requirements correctly.)"
    },
    { key: "unternehmensgroesse", label: "How large is your company?", type: "select",
      options: [
        { value: "solo", label: "1 (Solo/Freelancer)" }, { value: "team", label: "2-10 (Small Team)" }, { value: "kmu", label: "11-100 (SME)" }
      ],
      description: "(So recommendations and budgets are realistically scaled to your company size.)"
    },
    { key: "business_type", label: "Business type (for solo)", type: "select",
      options: [
        { value: "freelancer", label: "Freelancer" }, { value: "sole_proprietor", label: "Sole Proprietor" },
        { value: "limited_company", label: "Limited Company (1-person)" }, { value: "other", label: "Other" }
      ],
      description: "(So legal form dependencies in obligations and contracts are correctly considered.)",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "country", label: "Country (for regional considerations)", type: "select",
      options: [
        { value: "de", label: "Germany" }, { value: "at", label: "Austria" }, { value: "ch", label: "Switzerland" },
        { value: "fr", label: "France" }, { value: "it", label: "Italy" }, { value: "es", label: "Spain" },
        { value: "nl", label: "Netherlands" }, { value: "be", label: "Belgium" }, { value: "uk", label: "United Kingdom" },
        { value: "ie", label: "Ireland" }, { value: "other_eu", label: "Other EU Country" }, { value: "non_eu", label: "Non-EU Country" }
      ],
      description: "(So regional regulations and requirements can be considered.)"
    },
    { key: "hauptleistung", label: "What is your main service or most important product?", type: "textarea",
      placeholder: "In 2-3 sentences or bullet points: What do you offer - and what sets you apart?",
      description: "(So we can understand your value creation and identify AI potential along your main services. Keywords are fine.)"
    },
    { key: "zielgruppen", label: "Which target groups do you serve?", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B (Business customers)" }, { value: "b2c", label: "B2C (End consumers)" },
        { value: "kmu", label: "SMEs" }, { value: "grossunternehmen", label: "Large enterprises" },
        { value: "selbststaendige", label: "Self-employed/Freelancers" }, { value: "oeffentliche_hand", label: "Public sector" },
        { value: "privatpersonen", label: "Private individuals" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Other" }
      ],
      description: "(So suggestions are tailored to relevant customer groups and buying processes.)"
    },
    { key: "jahresumsatz", label: "Annual revenue (estimate)", type: "select",
      options: [
        { value: "unter_100k", label: "Up to 100,000" }, { value: "100k_500k", label: "100,000-500,000" },
        { value: "500k_2m", label: "500,000-2M" }, { value: "2m_10m", label: "2-10M" },
        { value: "ueber_10m", label: "Over 10M" }, { value: "keine_angabe", label: "Prefer not to say" }
      ],
      description: "(So benchmarks, limits, and ROI calculations can be reliably derived.)"
    },
    { key: "it_infrastruktur", label: "How is your IT infrastructure organized?", type: "select",
      options: [
        { value: "cloud", label: "Cloud-based (e.g., Microsoft 365, Google Cloud)" },
        { value: "on_premise", label: "Own data center (On-Premises)" },
        { value: "hybrid", label: "Hybrid (Cloud + own servers)" }, { value: "unklar", label: "Unclear / still open" }
      ],
      description: "(So integration effort, data protection requirements, and hosting options can be realistically planned.)"
    },
    { key: "interne_ki_kompetenzen", label: "Is there an internal AI/digitalization team?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "in_planung", label: "In planning" } ],
      description: "(So training, support, and roadmap are aligned with existing competencies.)"
    },
    { key: "datenquellen", label: "What data types are available for AI projects?", type: "checkbox",
      options: [
        { value: "kundendaten", label: "Customer data (CRM, Service)" }, { value: "verkaufsdaten", label: "Sales/Order data" },
        { value: "produktionsdaten", label: "Production/Operations data" }, { value: "personaldaten", label: "Personnel/HR data" },
        { value: "marketingdaten", label: "Marketing/Campaign data" }, { value: "sonstige", label: "Other data sources" }
      ],
      description: "(So we can find meaningful, data-driven use cases without complex preliminary projects.)"
    },

    // Block 2: Status Quo
    { key: "digitalisierungsgrad", label: "How digital are your internal processes? (1-10)", type: "slider", min: 1, max: 10, step: 1,
      description: "(So we can assess the starting point and quick, realistic improvements.)" },
    { key: "prozesse_papierlos", label: "Share of paperless processes", type: "select",
      options: [ { value: "0-20", label: "0-20%" }, { value: "21-50", label: "21-50%" }, { value: "51-80", label: "51-80%" }, { value: "81-100", label: "81-100%" } ],
      description: "(So automation potential and media breaks can be specifically addressed.)" },
    { key: "automatisierungsgrad", label: "Degree of automation", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Very low" }, { value: "eher_niedrig", label: "Rather low" },
        { value: "mittel", label: "Medium" }, { value: "eher_hoch", label: "Rather high" }, { value: "sehr_hoch", label: "Very high" }
      ],
      description: "(So priorities for efficiency gains and risk assessment can be set on a sound basis.)" },
    { key: "ki_einsatz", label: "Where is AI already being used?", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / Customer service" }, { value: "marketing", label: "Marketing & Content" },
        { value: "vertrieb", label: "Sales & CRM" }, { value: "datenanalyse", label: "Data analysis" },
        { value: "produktion", label: "Production / Logistics" }, { value: "hr", label: "HR Management" },
        { value: "andere", label: "Other areas" }, { value: "noch_keine", label: "Not yet in use" }
      ],
      description: "(So existing solutions are considered and duplicate work is consistently avoided.)" },
    { key: "ki_kompetenz", label: "AI competence in the team", type: "select",
      options: [
        { value: "hoch", label: "High" }, { value: "mittel", label: "Medium" },
        { value: "niedrig", label: "Low" }, { value: "keine", label: "None" }
      ],
      description: "(So content, pace, and support match the team's level.)" },

    // Block 3: Goals & Use Cases
    { key: "ki_ziele", label: "Goals with AI in the next 3-6 months", type: "checkbox",
      options: [
        { value: "effizienz", label: "Increase efficiency" }, { value: "automatisierung", label: "Automation" },
        { value: "neue_produkte", label: "New products/services" }, { value: "kundenservice", label: "Improve customer service" },
        { value: "datenauswertung", label: "Better use of data" }, { value: "kosten_senken", label: "Reduce costs" },
        { value: "wettbewerbsfaehigkeit", label: "Competitiveness" }, { value: "keine_angabe", label: "Still unclear" }
      ],
      description: "(So measures are prioritized towards short-term, measurable goals.)" },
    { key: "ki_projekte", label: "Are there already tests, tools, or projects with AI (even informal)?", type: "textarea", placeholder: "e.g., ChatGPT usage in the team, internal pilot projects, tools from service providers, automation experiments...", description: "(So we avoid duplicate work, leverage synergies with existing initiatives, and properly categorize your current AI engagement.)" },
    { key: "anwendungsfaelle", label: "Interesting use cases", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / FAQ automation" }, { value: "content_generation", label: "Content generation" },
        { value: "datenanalyse", label: "Data analysis & Reporting" }, { value: "dokumentation", label: "Documentation & Knowledge" },
        { value: "prozess_automation", label: "Process automation" }, { value: "personalisierung", label: "Personalization" },
        { value: "andere", label: "Other" }, { value: "keine_angabe", label: "Still unclear" }
      ],
      description: "(So we can choose suitable entry points with high benefit and low complexity.)" },
    { key: "zeitersparnis_prioritaet", label: "Where does most time or frustration go today?", type: "textarea",
      placeholder: "In which areas do you lose the most time today? (e.g., emails, proposals, documentation)", description: "(So we can derive very specific quick-win recommendations for relief - with noticeable time savings in daily work.)" },
    { key: "pilot_bereich", label: "Best area for pilot project", type: "select",
      options: [
        { value: "kundenservice", label: "Customer service" }, { value: "marketing", label: "Marketing / Content" },
        { value: "vertrieb", label: "Sales" }, { value: "verwaltung", label: "Administration / Back office" },
        { value: "produktion", label: "Production / Logistics" }, { value: "andere", label: "Other" }
      ],
      description: "(So the first pilot project starts smoothly and reliably delivers results.)" },
    { key: "geschaeftsmodell_evolution", label: "Do you have ideas how AI could change or complement your business model?", type: "textarea",
      placeholder: "e.g., new digital products, services, consulting offerings, data-driven additional services...", description: "(So we can identify potential for real business innovation alongside pure efficiency gains and make it visible in the report.)" },
    { key: "vision_3_jahre", label: "How should your company work with AI in 2-3 years?", type: "textarea",
      placeholder: "How should your company work in 2-3 years? Brief description.", description: "(So we understand your medium to long-term vision and can show how AI can lead there step by step.)" },

    { key: "strategische_ziele", label: "What should AI specifically improve for you in the next 6-12 months?", type: "textarea", placeholder: "What should AI improve in the next 6-12 months? (Keywords are fine)", description: "(So we can consistently align your AI strategy with your business goals - instead of just starting nice-to-have projects.)" },
    { key: "ki_guardrails", label: "Are there no-gos or sensitive topics when using AI?", type: "textarea",
      placeholder: "e.g., no communication about layoffs, careful handling with works council/team, no health predictions, special data protection requirements...",
      description: "(So we can steer recommendations and formulations to match your values, culture, and legal requirements.)" },
    { key: "massnahmen_komplexitaet", label: "Effort for implementation", type: "select",
      options: [ { value: "niedrig", label: "Low" }, { value: "mittel", label: "Medium" }, { value: "hoch", label: "High" }, { value: "unklar", label: "Unclear" } ],
      description: "(So scope, timeline, and resources are set up realistically.)" },
    { key: "roadmap_vorhanden", label: "AI roadmap/strategy available?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "teilweise", label: "Partially" }, { value: "nein", label: "No" } ],
      description: "(So we can use existing plans and specifically close gaps.)" },
    { key: "governance_richtlinien", label: "AI governance guidelines available?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "teilweise", label: "Partially" }, { value: "nein", label: "No" } ],
      description: "(So responsibilities, approvals, and access rights are properly regulated.)" },
    { key: "change_management", label: "Willingness to change in the team", type: "select",
      options: [
        { value: "sehr_hoch", label: "Very high" }, { value: "hoch", label: "High" },
        { value: "mittel", label: "Medium" }, { value: "niedrig", label: "Low" }, { value: "sehr_niedrig", label: "Very low" }
      ],
      description: "(So communication, training, and pace match the willingness to change.)" },

    // Block 5: Resources & Preferences
    { key: "zeitbudget", label: "Time per week for AI projects", type: "select",
      options: [ { value: "unter_2", label: "Under 2 hours" }, { value: "2_5", label: "2-5 hours" }, { value: "5_10", label: "5-10 hours" }, { value: "ueber_10", label: "Over 10 hours" } ],
      description: "(So action packages realistically match your available time.)" },
    { key: "vorhandene_tools", label: "Already used systems", type: "checkbox",
      options: [
        { value: "crm", label: "CRM systems (HubSpot, Salesforce)" }, { value: "erp", label: "ERP systems (SAP, Odoo)" },
        { value: "projektmanagement", label: "Project management (Asana, Trello)" }, { value: "marketing_automation", label: "Marketing Automation" },
        { value: "buchhaltung", label: "Accounting software" }, { value: "keine", label: "None / other" }
      ],
      description: "(So integrations are used and unnecessary tool duplications are consistently avoided.)" },
    { key: "regulierte_branche", label: "Regulated industry", type: "checkbox",
      options: [
        { value: "gesundheit", label: "Healthcare & Medicine" }, { value: "finanzen", label: "Finance & Insurance" },
        { value: "oeffentlich", label: "Public sector" }, { value: "recht", label: "Legal services" }, { value: "keine", label: "None of these industries" }
      ],
      description: "(Some AI applications are subject to strict legal requirements. Please select if relevant.)" },
    { key: "trainings_interessen", label: "Interesting AI training topics", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt Engineering" }, { value: "llm_basics", label: "LLM Basics" },
        { value: "datenqualitaet_governance", label: "Data Quality & Governance" }, { value: "automatisierung", label: "Automation & Scripts" },
        { value: "ethik_recht", label: "Ethical & Legal Basics" }, { value: "keine", label: "None / still unclear" }
      ],
      description: "(So training is planned precisely and learning goals are achieved quickly.)" },
    { key: "vision_prioritaet", label: "Most important strategic lever", type: "select",
      options: [
        { value: "gpt_services", label: "AI-powered services and products" }, { value: "kundenservice", label: "Customer service optimization" },
        { value: "datenprodukte", label: "Development of data-based offerings" }, { value: "prozessautomation", label: "Internal process automation" },
        { value: "marktfuehrerschaft", label: "Technology leadership in the market" }, { value: "keine_angabe", label: "Still unclear" }
      ],
      description: "(So recommendations focus on the strongest strategic lever.)" },

    // Block 6: Legal & Compliance
    { key: "datenschutzbeauftragter", label: "Data protection officer available?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "teilweise", label: "Partially (external/planning)" } ],
      description: "(So obligations are correctly assessed and responsibilities are legally secured.)" },
    { key: "technische_massnahmen", label: "Technical protection measures", type: "select",
      options: [ { value: "alle", label: "All relevant measures" }, { value: "teilweise", label: "Partially available" }, { value: "keine", label: "None yet" } ],
      description: "(So security level, quick wins, and priorities can be derived on a sound basis.)" },
    { key: "folgenabschaetzung", label: "Data Protection Impact Assessment (DPIA)", type: "select",
      options: [ { value: "ja", label: "Yes, completed" }, { value: "nein", label: "No, not yet" }, { value: "teilweise", label: "In planning" } ],
      description: "(Required when personal data with higher risk is processed.)" },
    { key: "meldewege", label: "Reporting channels for security incidents", type: "select",
      options: [ { value: "ja", label: "Yes, clearly defined" }, { value: "teilweise", label: "Partially available" }, { value: "nein", label: "No, not yet regulated" } ],
      description: "(So incidents are quickly escalated and legal deadlines are reliably met.)" },
    { key: "loeschregeln", label: "Guidelines for data deletion and anonymization", type: "select",
      options: [ { value: "ja", label: "Yes, documented" }, { value: "teilweise", label: "Partially available" }, { value: "nein", label: "No, not yet defined" } ],
      description: "(So retention, deletion, and anonymization are traceably regulated.)" },
    { key: "ai_act_kenntnis", label: "Knowledge of EU AI Act", type: "select",
      options: [ { value: "sehr_gut", label: "Very good" }, { value: "gut", label: "Good" }, { value: "gehoert", label: "Heard of it" }, { value: "unbekannt", label: "Not yet known" } ],
      description: "(Assessment of how familiar you are with the upcoming EU law for AI regulation.)" },
    { key: "ki_hemmnisse", label: "Barriers to AI deployment", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Legal uncertainty" }, { value: "datenschutz", label: "Data protection" }, { value: "knowhow", label: "Lack of know-how" },
        { value: "budget", label: "Limited budget" }, { value: "teamakzeptanz", label: "Team acceptance" }, { value: "zeitmangel", label: "Lack of time" },
        { value: "it_integration", label: "IT integration" }, { value: "keine", label: "No barriers" }, { value: "andere", label: "Other" }
      ],
      description: "(So barriers become visible and we can prioritize practical solutions.)" },

    // Block 7: Investment (Funding fields hidden for EN)
    { key: "bisherige_foerdermittel", label: "Previously received funding?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" } ],
      description: "(So suitable follow-up programs and combination options are recognized early.)",
      hidden: true },
    { key: "interesse_foerderung", label: "Interest in funding opportunities", type: "select",
      options: [ { value: "ja", label: "Yes, suggest programs" }, { value: "nein", label: "No need" }, { value: "unklar", label: "Unclear, please advise" } ],
      description: "(So we check funding opportunities and transparently suggest concrete options.)",
      hidden: true },
    { key: "erfahrung_beratung", label: "Previous consulting on digitalization/AI", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "unklar", label: "Unclear" } ],
      description: "(So existing prior knowledge is used and duplicate work is avoided.)" },
    { key: "investitionsbudget", label: "Budget for AI/digitalization next year", type: "select",
      options: [ { value: "unter_2000", label: "Under 2,000" }, { value: "2000_10000", label: "2,000-10,000" }, { value: "10000_50000", label: "10,000-50,000" },
        { value: "ueber_50000", label: "Over 50,000" }, { value: "unklar", label: "Still unclear" } ],
      description: "(So scope of measures and budgets are financially realistic.)" },
    { key: "marktposition", label: "Market position", type: "select",
      options: [ { value: "marktfuehrer", label: "Market leader" }, { value: "oberes_drittel", label: "Upper third" }, { value: "mittelfeld", label: "Middle field" },
        { value: "nachzuegler", label: "Laggard" }, { value: "unsicher", label: "Hard to assess" } ],
      description: "(So benchmarks, expectations, and competitive strategy are properly categorized.)" },
    { key: "benchmark_wettbewerb", label: "Comparison with competitors", type: "select",
      options: [ { value: "ja", label: "Yes, regularly" }, { value: "nein", label: "No" }, { value: "selten", label: "Rarely" } ],
      description: "(So we can specifically consider relevant competitor comparisons in the report.)" },
    { key: "innovationsprozess", label: "How do innovations arise?", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovation team" }, { value: "mitarbeitende", label: "Through employees" },
        { value: "kunden", label: "With customers" }, { value: "berater", label: "External consultants" },
        { value: "zufall", label: "By chance" }, { value: "unbekannt", label: "No clear strategy" }
      ],
      description: "(So innovation sources are understood and effective levers are specifically supported.)" },
    { key: "risikofreude", label: "Risk appetite for innovation (1-5)", type: "slider", min: 1, max: 5, step: 1,
      description: "(So implementation risk matches the desired pace and degree of experimentation.)" },

    // Block 8: Privacy & Submit
    { key: "datenschutz", label:
      "I have read the <a href='privacy.html' onclick='window.open(this.href, \"PrivacyPopup\", \"width=600,height=700\"); return false;'>Privacy Policy</a> and agree.",
      type: "privacy",
      description: "(So we can process your data in compliance with GDPR and create the report.)"
    }
  ];

  var blocks = [
    { title: "Company Data & Industry", intro: BLOCK_INTRO[0], keys: ["branche", "unternehmensgroesse", "business_type", "country", "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur", "interne_ki_kompetenzen", "datenquellen"] },
    { title: "Status Quo", intro: BLOCK_INTRO[1], keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", "ki_einsatz", "ki_kompetenz"] },
    { title: "Goals & Use Cases", intro: BLOCK_INTRO[2], keys: ["ki_ziele", "ki_projekte", "anwendungsfaelle", "zeitersparnis_prioritaet", "pilot_bereich", "geschaeftsmodell_evolution", "vision_3_jahre"] },
    { title: "Strategy & Governance", intro: BLOCK_INTRO[3], keys: ["strategische_ziele", "ki_guardrails", "massnahmen_komplexitaet", "roadmap_vorhanden", "governance_richtlinien", "change_management"] },
    { title: "Resources & Preferences", intro: BLOCK_INTRO[4], keys: ["zeitbudget", "vorhandene_tools", "regulierte_branche", "trainings_interessen", "vision_prioritaet"] },
    { title: "Legal & Compliance", intro: BLOCK_INTRO[5], keys: ["datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", "meldewege", "loeschregeln", "ai_act_kenntnis", "ki_hemmnisse"] },
    { title: "Investment Framework", intro: BLOCK_INTRO[6], keys: ["erfahrung_beratung", "investitionsbudget", "marktposition", "benchmark_wettbewerb", "innovationsprozess", "risikofreude"] },
    { title: "Privacy & Submit", intro: BLOCK_INTRO[7], keys: ["datenschutz"] }
  ];

  // --------------------------- Render ---------------------------
  function renderStep(){
    var root = document.getElementById("formbuilder");
    if (!root) return;

    clampStep();
    var block = blocks[currentBlock];
    var html = "<section class='fb-section'><div class='fb-head'>"
      + "<span class='fb-step'>Step " + (currentBlock + 1) + "/" + blocks.length + "</span>"
      + "<h2 class='fb-title'>" + block.title + "</h2></div>"
      + "<p class='section-intro'>" + block.intro + "</p>";

    for (var i=0; i<block.keys.length; i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (f.hidden) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      html += "<div class='form-group' data-key='" + k + "'><label for='" + f.key + "'>" + f.label + "</label>";
      if (f.description) html += "<div class='guidance'>" + f.description + "</div>";
      // Add guidance for required checkbox groups
      if (f.type === "checkbox" && (f.key === "zielgruppen" || f.key === "ki_ziele" || f.key === "anwendungsfaelle")) {
        html += "<div class='guidance important'>Please select at least one option.</div>";
      }
      html += renderInput(f) + "</div>";
    }

    html += "</section><div id='fb-msg' role='status' aria-live='polite'></div>";

    var nav = "<nav class='form-nav'>";
    if (currentBlock > 0) nav += "<button type='button' class='btn btn-secondary' id='btn-prev'>\u2190 Back</button>";
    nav += "<button type='button' class='btn btn-secondary' id='btn-reset'>Reset Form</button>";
    nav += "<span class='mr-auto'></span>";
    if (currentBlock < blocks.length - 1) nav += "<button type='button' class='btn btn-primary' id='btn-next' disabled>Next \u2192</button>";
    else nav += "<button type='button' class='btn btn-primary' id='btn-submit'>Submit</button>";
    nav += "</nav>";

    root.innerHTML = html + nav;

    // change handler
    root.addEventListener("change", handleChange);

    // autofill & validate
    for (var j=0; j<block.keys.length; j++){
      var field = findField(block.keys[j]); if (!field) continue;
      if (field.hidden) continue;
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
      if (confirm("Do you really want to reset the form?")) {
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
    // write visible fields of current block to formData
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (f.hidden) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

    // Conditionals: re-render so showIf takes effect
    if (e && e.target && e.target.id === "unternehmensgroesse") {
      renderStep(); scrollToStepTop(false);
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
      "vision_prioritaet":1,"business_type":1,"hauptleistung":0,
      "ki_projekte":1,"geschaeftsmodell_evolution":1,"vision_3_jahre":1,"ki_guardrails":1,
      "bisherige_foerdermittel":1,"interesse_foerderung":1
    };
    var missing = [];
    var block = blocks[currentBlock];

    // reset
    for (var j=0;j<block.keys.length;j++) markInvalid(block.keys[j], false);

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (f.hidden) continue;
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
      if (msg) { msg.textContent = "Please correct the highlighted fields."; msg.setAttribute("role","alert"); }
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
        if (f && f.hidden) continue;
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
      if (msg) { msg.textContent = "Please confirm the privacy policy."; msg.setAttribute("role","alert"); }
      return;
    }

    var root = document.getElementById("formbuilder");
    if (root) {
      root.innerHTML = '<section class="fb-section"><h2>Thank you for your information!</h2>'
        + '<div class="guidance">Your AI analysis is now being created. '
        + 'Once completed, you will receive your personalized assessment as a PDF via email.</div></section>';
    }

    // Auth is now handled via httpOnly cookies - no client-side token needed
    var data = {};
    for (var i2=0;i2<fields.length;i2++){
      if (fields[i2].hidden) continue;
      data[fields[i2].key] = formData[fields[i2].key];
    }
    delete data.unternehmen_name;
    delete data.firmenname;

    var email = null; // Email will be provided by backend from cookie session
    var payload = { lang: LANG, answers: data, queue_analysis: true };
    if (email) { payload.email = email; }

    // ensure required top-level fields for backend (also mirrored in answers)
    payload.branche = data.branche || payload.branche || "";
    payload.unternehmensgroesse = data.unternehmensgroesse || payload.unternehmensgroesse || "";
    payload.country = data.country || payload.country || "";
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
    // Ensure Block 0 keys exist (initial validation)
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
})();


function robustSubmitForm(){
  try{
    // Auth is now handled via httpOnly cookies - no client-side token validation needed
    // collect form data from known fields list if present, else from all inputs
    var data = (typeof formData !== "undefined" && formData) ? Object.assign({}, formData) : {};
    try{
      if(typeof fields !== "undefined" && Array.isArray(fields)){
        for(var i=0;i<fields.length;i++){
          if(fields[i].hidden) continue;
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
            // maybe checkbox group without id
            var nodes2 = document.querySelectorAll("input[name='"+k+"']:checked");
            if(nodes2 && nodes2.length){ var arr2=[]; nodes2.forEach(function(n){arr2.push(n.value);}); data[k]=arr2; }
          }
        }
      }
    }catch(e){ console.warn("collect values fallback:", e); }

    // ensure email included (legacy - Token can be empty)
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
    var payload = { lang: (typeof LANG!=='undefined'?LANG:'en'), answers: data, queue_analysis: true };
    if(data.email){ payload.email = data.email; }
    // critical top-level fields
    payload.branche = data.branche || "";
    payload.unternehmensgroesse = data.unternehmensgroesse || data.company_size || "";
    payload.country = data.country || "";
    payload.hauptleistung = data.hauptleistung || data.main_service || "";

    // provide human-readable labels
    try{ payload.branche_label = _collectLabelFor("branche", payload.branche); }catch(_){}
    try{ payload.unternehmensgroesse_label = _collectLabelFor("unternehmensgroesse", payload.unternehmensgroesse); }catch(_){}
    try{ payload.country_label = _collectLabelFor("country", payload.country); }catch(_){}
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
