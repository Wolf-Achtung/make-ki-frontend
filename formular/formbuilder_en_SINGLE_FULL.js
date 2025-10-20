/* File: formular/formbuilder_en_SINGLE_FULL.js */
/* Multi-step wizard with scroll-to-top & persistent autosave (incl. step resume). */
/* Based on your current files. :contentReference[oaicite:2]{index=2} */
(function () {
  "use strict";

  // --------------------------- Config ---------------------------
  var LANG = "en";
  var SCHEMA_VERSION = "1.4.0";
  var STORAGE_PREFIX = "autosave_form_";
  var SUBMIT_PATH = "/briefing_async";

  function getBaseUrl(){
      try {
        var cfg = window.__CONFIG__ || {};
        var v = cfg.API_BASE || '';
        if (!v) {
          var meta = document.querySelector('meta[name="api-base"]');
          v = (meta && meta.content) || (window.API_BASE || '/api');
        }
        return String(v || '/api').replace(/\/+$/, '');
      } catch (e) { return '/api'; }
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

  // --------------------------- Styles ---------------------------
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

  // --------------------------- Content ---------------------------
  var BLOCK_INTRO = [
    "We collect basic data (industry, size, location). This drives report personalisation and relevant funding/compliance notes.",
    "Current state of processes, data and prior AI usage. This calibrates quick wins and the starter roadmap.",
    "Goals & key use cases: what should AI achieve? This focuses recommendations and prioritises actions.",
    "Strategy & governance for sustainable AI deployment and responsible implementation.",
    "Resources & preferences (time, tool affinity, existing tools). We adapt suggestions to feasibility and pace.",
    "Legal & funding aspects: GDPR, EU AI Act, funding opportunities and compliance for safe AI deployment.",
    "Privacy & submit: confirm consent and launch your personalised report."
  ];

  var fields = [
    // Block 1
    { key: "branche", label: "In which industry is your company active?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & advertising" }, { value: "beratung", label: "Consulting & services" },
        { value: "it", label: "IT & software" }, { value: "finanzen", label: "Finance & insurance" },
        { value: "handel", label: "Retail & e-commerce" }, { value: "bildung", label: "Education" },
        { value: "verwaltung", label: "Administration" }, { value: "gesundheit", label: "Health & care" },
        { value: "bau", label: "Construction & architecture" }, { value: "medien", label: "Media & creative industries" },
        { value: "industrie", label: "Industry & production" }, { value: "logistik", label: "Transport & logistics" }
      ],
      description: "Your main industry influences benchmarks, tool recommendations and the analysis."
    },
    { key: "unternehmensgroesse", label: "How large is your company (number of employees)?", type: "select",
      options: [
        { value: "solo", label: "1 (sole proprietor / freelancer)" }, { value: "team", label: "2–10 (small team)" }, { value: "kmu", label: "11–100 (SME)" }
      ],
      description: "The size of your company influences recommendations and funding."
    },
    { key: "selbststaendig", label: "Legal form for a single person", type: "select",
      options: [
        { value: "freiberufler", label: "Freelancer / self-employed" }, { value: "kapitalgesellschaft", label: "Single-member corporation (GmbH/UG)" },
        { value: "einzelunternehmer", label: "Sole proprietorship (with trade licence)" }, { value: "sonstiges", label: "Other" }
      ],
      description: "Please choose the legal form that applies to you.",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "bundesland", label: "State (regional funding opportunities)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" }, { value: "ni", label: "Niedersachsen" },
        { value: "nw", label: "Nordrhein-Westfalen" }, { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Saxony" }, { value: "st", label: "Saxony-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thuringia" }
      ],
      description: "Your location determines which funding programs you can use."
    },
    { key: "hauptleistung", label: "What's your company's main product or core service?", type: "textarea",
      placeholder: "e.g. social media campaigns, CNC production, tax consulting for startups",
      description: "Describe your core offering as specifically as possible."
    },
    { key: "zielgruppen", label: "Which target groups do you serve?", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B (business customers)" }, { value: "b2c", label: "B2C (consumers)" },
        { value: "kmu", label: "SMEs" }, { value: "grossunternehmen", label: "Large enterprises" },
        { value: "selbststaendige", label: "Self-employed / freelancers" }, { value: "oeffentliche_hand", label: "Public sector" },
        { value: "privatpersonen", label: "Private individuals" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Other" }
      ],
      description: "Multiple selections possible."
    },
    { key: "jahresumsatz", label: "Annual revenue (estimate)", type: "select",
      options: [
        { value: "unter_100k", label: "Up to €100,000" }, { value: "100k_500k", label: "€100,000–500,000" },
        { value: "500k_2m", label: "€500,000–2 million" }, { value: "2m_10m", label: "€2–10 million" },
        { value: "ueber_10m", label: "Over €10 million" }, { value: "keine_angabe", label: "Prefer not to say" }
      ],
      description: "For benchmarks and funding recommendations."
    },
    { key: "it_infrastruktur", label: "How is your IT infrastructure organized?", type: "select",
      options: [
        { value: "cloud", label: "Cloud-based (e.g. Microsoft 365, Google Cloud)" },
        { value: "on_premise", label: "Own data centre (on-premises)" },
        { value: "hybrid", label: "Hybrid (cloud + own servers)" }, { value: "unklar", label: "Unclear / not decided yet" }
      ],
      description: "Helps us select suitable security and integration recommendations."
    },
    { key: "interne_ki_kompetenzen", label: "Do you have an internal AI/digitalisation team?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "in_planung", label: "In planning" } ],
      description: "Helps recommend appropriate training and structures."
    },
    { key: "datenquellen", label: "Which types of data are available for AI projects?", type: "checkbox",
      options: [
        { value: "kundendaten", label: "Customer data (CRM, service)" }, { value: "verkaufsdaten", label: "Sales/order data" },
        { value: "produktionsdaten", label: "Production/operations data" }, { value: "personaldaten", label: "Personnel/HR data" },
        { value: "marketingdaten", label: "Marketing/campaign data" }, { value: "sonstige", label: "Other data sources" }
      ],
      description: "Select all relevant data sources."
    },

    // Block 2
    { key: "digitalisierungsgrad", label: "How digital are your internal processes? (1–10)", type: "slider", min: 1, max: 10, step: 1,
      description: "1 = mostly paper/manual, 10 = fully digital/automated" },
    { key: "prozesse_papierlos", label: "What proportion of processes are paperless?", type: "select",
      options: [ { value: "0-20", label: "0–20%" }, { value: "21-50", label: "21–50%" }, { value: "51-80", label: "51–80%" }, { value: "81-100", label: "81–100%" } ],
      description: "Estimated is fine." },
    { key: "automatisierungsgrad", label: "Degree of automation", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Very low" }, { value: "eher_niedrig", label: "Rather low" },
        { value: "mittel", label: "Medium" }, { value: "eher_hoch", label: "Rather high" }, { value: "sehr_hoch", label: "Very high" }
      ],
      description: "How much runs automatically vs manually?" },
    { key: "ki_einsatz", label: "Where is AI already being used?", type: "checkbox",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Sales" }, { value: "buchhaltung", label: "Accounting" },
        { value: "produktion", label: "Production" }, { value: "kundenservice", label: "Customer service" }, { value: "it", label: "IT" },
        { value: "forschung", label: "R&D" }, { value: "personal", label: "HR" }, { value: "keine", label: "No usage yet" },
        { value: "sonstiges", label: "Other" }
      ],
      description: "Select all areas that apply." },
    { key: "ki_knowhow", label: "Team's internal AI know-how", type: "select",
      options: [
        { value: "keine", label: "No experience" }, { value: "grundkenntnisse", label: "Basic knowledge" }, { value: "mittel", label: "Medium" },
        { value: "fortgeschritten", label: "Advanced" }, { value: "expertenwissen", label: "Expert knowledge" }
      ],
      description: "Self-assessment is fine." },

    // Block 3
    { key: "projektziel", label: "Main objective of next AI project", type: "checkbox",
      options: [
        { value: "prozessautomatisierung", label: "Process automation" }, { value: "kostensenkung", label: "Cost reduction" },
        { value: "compliance", label: "Compliance/data protection" }, { value: "produktinnovation", label: "Product innovation" },
        { value: "kundenservice", label: "Improve customer service" }, { value: "markterschliessung", label: "Market expansion" },
        { value: "personalentlastung", label: "Relieve staff" }, { value: "foerdermittel", label: "Apply for funding" }, { value: "andere", label: "Other" }
      ],
      description: "Multiple selections possible." },
    { key: "ki_projekte", label: "Ongoing or planned AI projects", type: "textarea", placeholder: "e.g. chatbot, automated quotes, text generators...", description: "Describe current or planned projects concretely." },
    { key: "ki_usecases", label: "AI use cases of interest", type: "checkbox",
      options: [
        { value: "texterstellung", label: "Text generation" }, { value: "bildgenerierung", label: "Image generation" }, { value: "spracherkennung", label: "Speech recognition" },
        { value: "prozessautomatisierung", label: "Process automation" }, { value: "datenanalyse", label: "Data analysis & forecasting" },
        { value: "kundensupport", label: "Customer support" }, { value: "wissensmanagement", label: "Knowledge management" },
        { value: "marketing", label: "Marketing optimization" }, { value: "sonstiges", label: "Other" }
      ],
      description: "Multiple selections possible." },
    { key: "ki_potenzial", label: "Greatest potential for AI in your company", type: "textarea",
      placeholder: "e.g. faster reporting, personalized offers, automation...", description: "Where do you see the greatest potential?" },
    { key: "usecase_priority", label: "Where should AI be introduced first?", type: "select",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Sales" }, { value: "buchhaltung", label: "Accounting" },
        { value: "produktion", label: "Production" }, { value: "kundenservice", label: "Customer service" }, { value: "it", label: "IT" },
        { value: "forschung", label: "R&D" }, { value: "personal", label: "HR" }, { value: "unbekannt", label: "Still unclear" }
      ],
      description: "Which department has the most urgent need?" },
    { key: "ki_geschaeftsmodell_vision", label: "How could AI change your business model?", type: "textarea",
      placeholder: "e.g. automated consultations, data-based services...", description: "Your long-term vision for AI transformation." },
    { key: "moonshot", label: "Your bold AI vision in 3 years", type: "textarea",
      placeholder: "e.g. 80% automation, doubled revenue...", description: "Think big - what would be a breakthrough?" },

    // Block 4
    { key: "strategic_goals", label: "Specific goals with AI", type: "textarea", placeholder: "e.g. increase efficiency, new products, better service", description: "List your main strategic AI goals." },
    { key: "data_quality", label: "Quality of your data", type: "select",
      options: [ { value: "high", label: "High (complete, structured, current)" }, { value: "medium", label: "Medium (partly structured)" }, { value: "low", label: "Low (unstructured, gaps)" } ],
      description: "Well-maintained data is crucial for AI success." },
    { key: "ai_roadmap", label: "AI roadmap or strategy", type: "select",
      options: [ { value: "yes", label: "Yes - implemented" }, { value: "planning", label: "In planning" }, { value: "no", label: "Not yet available" } ],
      description: "A clear roadmap supports structured implementation." },
    { key: "governance", label: "Data and AI governance guidelines", type: "select",
      options: [ { value: "yes", label: "Yes" }, { value: "partial", label: "Partial" }, { value: "no", label: "No" } ],
      description: "Guidelines promote responsible AI projects." },
    { key: "innovation_culture", label: "Openness to innovation", type: "select",
      options: [
        { value: "very_open", label: "Very open" }, { value: "rather_open", label: "Rather open" }, { value: "neutral", label: "Neutral" },
        { value: "rather_reluctant", label: "Rather reluctant" }, { value: "very_reluctant", label: "Very reluctant" }
      ],
      description: "Innovation-friendly culture facilitates AI adoption." },

    // Block 5
    { key: "time_capacity", label: "Time per week for AI projects", type: "select",
      options: [ { value: "under_2", label: "Under 2 hours" }, { value: "2_5", label: "2–5 hours" }, { value: "5_10", label: "5–10 hours" }, { value: "over_10", label: "More than 10 hours" } ],
      description: "Tailors recommendations to available time." },
    { key: "existing_tools", label: "Systems already in use", type: "checkbox",
      options: [
        { value: "crm", label: "CRM systems (HubSpot, Salesforce)" }, { value: "erp", label: "ERP systems (SAP, Odoo)" },
        { value: "project_management", label: "Project management (Asana, Trello)" }, { value: "marketing_automation", label: "Marketing automation" },
        { value: "accounting", label: "Accounting software" }, { value: "none", label: "None / other" }
      ],
      description: "Multiple selections – guides integration suggestions." },
    { key: "regulated_industry", label: "Regulated industry", type: "checkbox",
      options: [
        { value: "healthcare", label: "Health & medicine" }, { value: "finance", label: "Finance & insurance" },
        { value: "public", label: "Public sector" }, { value: "legal", label: "Legal services" }, { value: "none", label: "None of these" }
      ],
      description: "Regulated industries need special compliance." },
    { key: "training_interests", label: "AI training topics of interest", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt engineering" }, { value: "llm_basics", label: "LLM basics" },
        { value: "data_quality_governance", label: "Data quality & governance" }, { value: "automation_scripts", label: "Automation & scripts" },
        { value: "ethics_regulation", label: "Ethical & legal foundations" }, { value: "none", label: "None / not sure" }
      ],
      description: "Helps recommend suitable training." },
    { key: "vision_priority", label: "Most important vision aspect", type: "select",
      options: [
        { value: "gpt_services", label: "GPT-based services" }, { value: "customer_service", label: "Improve customer service" },
        { value: "data_products", label: "New data-driven products" }, { value: "process_automation", label: "Automate processes" },
        { value: "market_leadership", label: "Achieve market leadership" }, { value: "unspecified", label: "No preference" }
      ],
      description: "Helps prioritize recommendations." },

    // Block 6
    { key: "datenschutzbeauftragter", label: "Data protection officer", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "teilweise", label: "Partially (external/planning)" } ],
      description: "Often mandatory - internal or external." },
    { key: "technische_massnahmen", label: "Technical data protection measures", type: "select",
      options: [ { value: "alle", label: "All relevant measures" }, { value: "teilweise", label: "Partially in place" }, { value: "keine", label: "None yet" } ],
      description: "Firewalls, backups, access restrictions etc." },
    { key: "folgenabschaetzung", label: "Data protection impact assessment (DPIA)", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "teilweise", label: "Partially" } ],
      description: "Required for many AI applications under GDPR." },
    { key: "meldewege", label: "Reporting procedures for incidents", type: "select",
      options: [ { value: "ja", label: "Yes, clear processes" }, { value: "teilweise", label: "Partially regulated" }, { value: "nein", label: "No" } ],
      description: "Quick response to data protection breaches." },
    { key: "loeschregeln", label: "Rules for data deletion/anonymization", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "teilweise", label: "Partially" }, { value: "nein", label: "No" } ],
      description: "Important for AI compliance and GDPR." },
    { key: "ai_act_kenntnis", label: "Knowledge of EU AI Act", type: "select",
      options: [ { value: "sehr_gut", label: "Very well" }, { value: "gut", label: "Well" }, { value: "gehoert", label: "Heard of it" }, { value: "unbekannt", label: "Not yet familiar" } ],
      description: "The EU AI Act brings new obligations." },
    { key: "ki_hemmnisse", label: "Obstacles to AI adoption", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Legal uncertainty" }, { value: "datenschutz", label: "Data protection" }, { value: "knowhow", label: "Lack of know-how" },
        { value: "budget", label: "Limited budget" }, { value: "teamakzeptanz", label: "Team acceptance" }, { value: "zeitmangel", label: "Lack of time" },
        { value: "it_integration", label: "IT integration" }, { value: "keine", label: "No obstacles" }, { value: "andere", label: "Other" }
      ],
      description: "Select all that apply." },
    { key: "bisherige_foerdermittel", label: "Previous funding received", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" } ],
      description: "For digitalization or AI projects." },
    { key: "interesse_foerderung", label: "Interest in funding opportunities", type: "select",
      options: [ { value: "ja", label: "Yes, suggest programs" }, { value: "nein", label: "No need" }, { value: "unklar", label: "Unsure, please advise" } ],
      description: "We'll filter suitable options." },
    { key: "erfahrung_beratung", label: "Previous consulting on digitalization/AI", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "unklar", label: "Unclear" } ],
      description: "External advice strengthens your position." },
    { key: "investitionsbudget", label: "Budget for AI/digitalization next year", type: "select",
      options: [ { value: "unter_2000", label: "Under €2,000" }, { value: "2000_10000", label: "€2,000–10,000" }, { value: "10000_50000", label: "€10,000–50,000" },
        { value: "ueber_50000", label: "More than €50,000" }, { value: "unklar", label: "Still unclear" } ],
      description: "Even small budgets can deliver progress." },
    { key: "marktposition", label: "Market position", type: "select",
      options: [ { value: "marktfuehrer", label: "Market leader" }, { value: "oberes_drittel", label: "Top third" }, { value: "mittelfeld", label: "Middle field" },
        { value: "nachzuegler", label: "Laggard" }, { value: "unsicher", label: "Hard to assess" } ],
      description: "Helps classify your results." },
    { key: "benchmark_wettbewerb", label: "Compare with competitors", type: "select",
      options: [ { value: "ja", label: "Yes, regularly" }, { value: "nein", label: "No" }, { value: "selten", label: "Rarely" } ],
      description: "Benchmarks help identify opportunities." },
    { key: "innovationsprozess", label: "How innovations arise", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovation team" }, { value: "mitarbeitende", label: "Through employees" },
        { value: "kunden", label: "With customers" }, { value: "berater", label: "External consultants" },
        { value: "zufall", label: "By chance" }, { value: "unbekannt", label: "No clear strategy" }
      ],
      description: "Structured paths facilitate AI deployment." },
    { key: "risikofreude", label: "Risk-taking with innovation (1–5)", type: "slider", min: 1, max: 5, step: 1,
      description: "1 = safety-oriented, 5 = very bold" },

    // Block 7
    { key: "datenschutz",
      label: "I have read the <a href='privacy.html' onclick='window.open(this.href, \"PrivacyPopup\", \"width=600,height=700\"); return false;'>privacy notice</a> and agree.",
      type: "privacy",
      description: "Please confirm that you have read the privacy notice."
    }
  ];

  var blocks = [
    { name: "Company Information", keys: ["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
    { name: "Status Quo", keys: ["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
    { name: "Goals & Projects", keys: ["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
    { name: "Strategy & Governance", keys: ["strategic_goals","data_quality","ai_roadmap","governance","innovation_culture"] },
    { name: "Resources & Preferences", keys: ["time_capacity","existing_tools","regulated_industry","training_interests","vision_priority"] },
    { name: "Legal & Funding", keys: ["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
    { name: "Privacy & Submit", keys: ["datenschutz"] }
  ];

  // --------------------------- State ---------------------------
  var currentBlock = 0;
  var formData = {};
  var autosaveKey = (function () {
    try { var t = getToken(); var e = getEmailFromJWT(t); return (e ? (STORAGE_PREFIX + e) : (STORAGE_PREFIX + "test")) + ":" + LANG; }
    catch (e) { return STORAGE_PREFIX + "test:" + LANG; }
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
    if (f.type === "checkbox" && f.options) {
      var nodes = document.querySelectorAll('input[name="'+f.key+'"]:checked');
      var arr = []; for (var i=0;i<nodes.length;i++) arr.push(nodes[i].value);
      return arr;
    } else if (f.type === "slider") {
      var el = document.getElementById(f.key); return el ? el.value : (f.min || 1);
    } else if (f.type === "privacy") {
      var ch = document.getElementById(f.key); return ch ? !!ch.checked : false;
    } else {
      var inp = document.getElementById(f.key); return inp ? inp.value : "";
    }
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
  function renderField(f){
    var v = formData[f.key];
    var guidance = f.description ? '<div class="guidance'+(f.type==="privacy"?" important":"")+'">'+f.description+'</div>' : "";
    var html = "";
    if (f.type === "select") {
      var opts = '<option value="">Please select…</option>';
      for (var i=0;i<(f.options||[]).length;i++){
        var o=f.options[i]; var sel = (String(v||"")===String(o.value))?' selected':'';
        opts += '<option value="'+o.value+'"'+sel+'>'+o.label+'</option>';
      }
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<select id="'+f.key+'" name="'+f.key+'">'+opts+'</select>';
    } else if (f.type === "textarea") {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<textarea id="'+f.key+'" name="'+f.key+'" placeholder="'+(f.placeholder||"")+'">'+(v||"")+'</textarea>';
    } else if (f.type === "checkbox" && f.options) {
      var items = ""; var arr = Array.isArray(v)?v:[];
      for (var j=0;j<(f.options||[]).length;j++){
        var c=f.options[j]; var checked = (arr.indexOf(c.value)!==-1)?' checked':'';
        items += '<label class="checkbox-label"><input type="checkbox" name="'+f.key+'" value="'+c.value+'"'+checked+'><span>'+c.label+'</span></label>';
      }
      html = '<label><b>'+f.label+'</b></label>'+guidance+'<div class="checkbox-group">'+items+'</div>';
    } else if (f.type === "slider") {
      var val = (v!=null?v:(f.min||1));
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<div class="slider-container"><input type="range" id="'+f.key+'" name="'+f.key+'" min="'+(f.min||1)+'" max="'+(f.max||10)+'" step="'+(f.step||1)+'" value="'+val+'" oninput="this.parentElement.querySelector(\'.slider-value-label\').innerText=this.value"><span class="slider-value-label">'+val+'</span></div>';
    } else if (f.type === "privacy") {
      var chk = (v===true)?' checked':'';
      html = '<div class="guidance important">'+(f.description||"")+'</div>'+
             '<label class="checkbox-label"><input type="checkbox" id="'+f.key+'" name="'+f.key+'"'+chk+' required><span>'+f.label+'</span></label>';
    } else {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+'<input type="text" id="'+f.key+'" name="'+f.key+'" value="'+(v||"")+'">';
    }
    return '<div class="form-group" data-key="'+f.key+'">'+html+'</div>';
  }

  function renderStep(){
    var root = document.getElementById("formbuilder"); if (!root) return;

    var block = blocks[currentBlock]; var intro = BLOCK_INTRO[currentBlock] || "";
    var html = '<section class="fb-section">'
             +   '<div class="fb-head"><span class="fb-step">Step '+(currentBlock+1)+'/'+blocks.length+'</span>'
             +   '<span class="fb-title">'+block.name+'</span></div>'
             +   (intro ? '<div class="section-intro">'+intro+'</div>' : '');

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      html += renderField(f);
    }
    html += '</section><div class="form-nav">'
         +  '<button type="button" class="btn btn-secondary mr-auto" id="btn-reset">Reset</button>'
         +  '<button type="button" class="btn btn-secondary" id="btn-back" '+(currentBlock===0?'disabled':'')+'>Back</button>'
         +  (currentBlock < blocks.length-1
            ? '<button type="button" class="btn btn-primary" id="btn-next">Next</button>'
            : '<button type="button" class="btn btn-primary" id="btn-submit">Submit</button>')
         + '</div><div id="fb-msg" aria-live="polite"></div>';

    root.innerHTML = html;

    root.addEventListener("change", handleChange);
    root.addEventListener("input", handleChange);
    root.addEventListener("keydown", function (ev) {
      var isEnter = (ev.key === "Enter" || ev.keyCode === 13);
      var tag = (ev.target && ev.target.tagName) ? ev.target.tagName.toUpperCase() : "";
      if (isEnter && tag !== "TEXTAREA" && currentBlock < blocks.length - 1) { ev.preventDefault(); }
    });

    var back = document.getElementById("btn-back");
    if (back) back.addEventListener("click", function(){ if (currentBlock>0){ currentBlock--; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); } });

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
      if (confirm("Are you sure you want to reset the form?")) {
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
  function handleChange(e){
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

    if (e && e.target && e.target.id === "unternehmensgroesse") {
      renderStep(); scrollToStepTop(false);
      return;
    }
    var next = document.getElementById("btn-next");
    if (next) next.disabled = validateCurrentBlock(false).length > 0;
  }

  function markInvalid(key, on){
    var grp = document.querySelector('.form-group[data-key="'+key+'"]');
    if (!grp) return;
    if (on) grp.classList.add("invalid-group"); else grp.classList.remove("invalid-group");
    var input = document.getElementById(key);
    if (input) { if (on) input.classList.add("invalid"); else input.classList.remove("invalid"); }
  }

  function validateCurrentBlock(focusFirst){
    var optional = {
      "jahresumsatz":1,"it_infrastruktur":1,"interne_ki_kompetenzen":1,"datenquellen":1,
      "time_capacity":1,"existing_tools":1,"regulated_industry":1,"training_interests":1,
      "vision_priority":1,"selbststaendig":1,"hauptleistung":0
    };
    var missing = [];
    var block = blocks[currentBlock];

    for (var j=0;j<block.keys.length;j++) markInvalid(block.keys[j], false);

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      var val = formData[k], ok = true;
      if (optional[k]) { /* optional */ }
      else if (f.type === "checkbox" && f.options) ok = Array.isArray(val) && val.length>0;
      else if (f.type === "privacy") ok = (val === true);
      else if (f.type === "select") ok = !!val && String(val) !== "";
      else if (f.type === "slider") ok = !!val;
      else ok = !!val && String(val).trim() !== "";

      if (!ok) { missing.push(labelOf(k)); markInvalid(k, true); }
    }

    if (missing.length && focusFirst) {
      var first = document.querySelector(".invalid, .invalid-group");
      if (first && first.scrollIntoView) first.scrollIntoView({behavior:"smooth", block:"center"});
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Please fix the highlighted fields."; msg.setAttribute("role","alert"); }
    }
    return missing;
  }

  function updateProgress(){ dispatchProgress(currentBlock + 1, blocks.length); }

  function submitForm(){
    for (var bi=0; bi<blocks.length; bi++){
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++){
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
        if (document.getElementById(f.key)) { formData[k] = collectValue(f);} /* else keep existing */ }
    }
    saveAutosave();

    if (formData.datenschutz !== true) {
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Please confirm that you have read the privacy notice."; msg.setAttribute("role","alert"); }
      return;
    }

    var root = document.getElementById("formbuilder");
    if (root) {
      root.innerHTML = '<section class="fb-section"><h2>Thank you for your submission!</h2>'
        + '<div class="guidance">Your AI analysis is now being created. '
        + 'You will receive your personalised report as a PDF by email once finished.</div></section>';
    }

    var token = getToken();
    if (!token) {
      if (root) root.insertAdjacentHTML("beforeend",
        '<div class="guidance important" role="alert">Your session has expired. '
        + '<a href="/login.html">Please log in again</a> if you want to run another analysis.</div>');
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
      // Keep autosave so users can edit later.
    }).catch(function(){});
  }

  // Init
  window.addEventListener("DOMContentLoaded", function(){
    loadAutosave(); loadStep();
    var b0 = blocks[0]; for (var i=0;i<b0.keys.length;i++){ var f=findField(b0.keys[i]); if (f && formData[f.key]===undefined) formData[f.key] = ""; }
    renderStep(); scrollToStepTop(true);
  });
})();
