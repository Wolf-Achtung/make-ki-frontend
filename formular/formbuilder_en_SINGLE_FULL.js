/* filename: formbuilder_en_SINGLE_FULL.js */
/* Multi-Step Wizard (EN)
   - Keeps the SAME field keys as the DE form (e.g. 'branche', 'unternehmensgroesse', 'bundesland', …)
   - Gold-Standard+: autosave + resume, a11y, sticky nav, per-step validation, scroll-to-top
   - Submit hits /briefing_async; lang='en'
*/
(function () {
  "use strict";

  var LANG = "en";
  var SCHEMA_VERSION = "1.5.4";
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
      + ".slider-value-label{min-width:48px;padding:8px 12px;background:#dbeafe;border-radius:8px;font-weight:600;color:#1e3a5f;text-align:center}"
      + "#fb-msg{margin-top:10px;color:#dc2626;font-weight:600}";
    var s=document.createElement("style"); s.type="text/css"; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }catch(_){}})();

  // --------------------------- Intro copy ---------------------------
  var BLOCK_INTRO = [
    "Basics (industry, size, region). We personalise the report and pre-check funding/compliance.",
    "Status quo: processes, data, current AI use – to find quick wins fast.",
    "Goals & use cases – we focus on actionable measures (3–6 months).",
    "Strategy & governance – pragmatic guardrails without bureaucracy.",
    "Resources & preferences – recommendations that fit budget and pace.",
    "Legal & funding – GDPR, EU AI Act, programmes.",
    "Privacy & submit – confirm and start your personalised report."
  ];

  // --------------------------- Fields (keys same as DE) ---------------------------
  var fields = [
    { key: "branche", label: "Which industry are you in?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Advertising" }, { value: "beratung", label: "Consulting & Services" },
        { value: "it", label: "IT & Software" }, { value: "finanzen", label: "Finance & Insurance" },
        { value: "handel", label: "Retail & E-Commerce" }, { value: "bildung", label: "Education" },
        { value: "verwaltung", label: "Public Sector" }, { value: "gesundheit", label: "Healthcare" },
        { value: "bau", label: "Construction & Architecture" }, { value: "medien", label: "Media & Creative Industries" },
        { value: "industrie", label: "Manufacturing & Industry" }, { value: "logistik", label: "Transport & Logistics" }
      ],
      description: "Pick the best fit. We use it to tailor examples, tools and funding/compliance hints."
    },
    { key: "unternehmensgroesse", label: "Company size", type: "select",
      options: [
        { value: "solo", label: "1 (Solo/Freelance)" }, { value: "team", label: "2–10 (Small Team)" }, { value: "kmu", label: "11–100 (SME)" }
      ],
      description: "A rough estimate is fine – it helps making realistic suggestions and funding options."
    },
    { key: "selbststaendig", label: "Legal form if solo", type: "select",
      options: [
        { value: "freiberufler", label: "Freelancer/Sole trader" }, { value: "kapitalgesellschaft", label: "Single-person company (Ltd./UG/GmbH)" },
        { value: "einzelunternehmer", label: "Sole proprietor (trade)" }, { value: "sonstiges", label: "Other" }
      ],
      description: "Relevant only for size = 1. Any reasonable approximation is fine.",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "bundesland", label: "Region (funding programmes)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bavaria" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hesse" }, { value: "mv", label: "Mecklenburg-Western Pomerania" }, { value: "ni", label: "Lower Saxony" },
        { value: "nw", label: "North Rhine-Westphalia" }, { value: "rp", label: "Rhineland-Palatinate" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Saxony" }, { value: "st", label: "Saxony-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thuringia" }
      ],
      description: "Select the main location – used to filter regional funding."
    },
    { key: "hauptleistung", label: "What is your main offering or product?", type: "textarea",
      placeholder: "e.g., Social media campaigns, CNC manufacturing, Tax advisory for startups",
      description: "1–2 sentences are enough. If you have multiple offerings, pick the most important one."
    },
    { key: "zielgruppen", label: "Target audiences", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B" }, { value: "b2c", label: "B2C" }, { value: "kmu", label: "SMEs" }, { value: "grossunternehmen", label: "Large enterprises" },
        { value: "selbststaendige", label: "Self-employed/Freelancers" }, { value: "oeffentliche_hand", label: "Public sector" },
        { value: "privatpersonen", label: "Consumers" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Other" }
      ],
      description: "Multi select. Helps us choose suitable use-cases and examples."
    },
    { key: "jahresumsatz", label: "Annual revenue (estimate)", type: "select",
      options: [
        { value: "unter_100k", label: "Up to €100k" }, { value: "100k_500k", label: "€100k–€500k" }, { value: "500k_2m", label: "€500k–€2m" },
        { value: "2m_10m", label: "€2m–€10m" }, { value: "ueber_10m", label: "Over €10m" }, { value: "keine_angabe", label: "Prefer not to say" }
      ],
      description: "A rough number to calibrate benchmarks and funding levels – nothing is published."
    },

    /* — FIX/ADD: the following three fields were missing or wrong type — */
    { key: "it_infrastruktur", label: "How is your IT infrastructure organised?", type: "select",
      options: [
        { value: "cloud", label: "Cloud‑based (e.g., Microsoft 365, Google Cloud)" },
        { value: "on_premise", label: "Own data centre (on‑premise)" },
        { value: "hybrid", label: "Hybrid (cloud + own servers)" },
        { value: "unklar", label: "Unclear / undecided" }
      ],
      description: "Please select the current state. “Hybrid” is very common – that’s fine."
    },
    { key: "interne_ki_kompetenzen", label: "Do you have an internal AI/Digital team?", type: "select",
      options: [
        { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "in_planung", label: "Planned" }
      ],
      description: "If not: choose “No” – we’ll suggest lean starters and trainings."
    },
    { key: "datenquellen", label: "Which data types are available for AI projects?", type: "checkbox",
      options: [
        { value: "kundendaten", label: "Customer data (CRM, service)" },
        { value: "verkaufsdaten", label: "Sales / order data" },
        { value: "produktionsdaten", label: "Operations / production data" },
        { value: "personaldaten", label: "HR / personnel data" },
        { value: "marketingdaten", label: "Marketing / campaign data" },
        { value: "sonstige", label: "Other data sources" }
      ],
      description: "Tick only what you currently have access to. Small datasets are fine."
    },

    // —— Status quo ——
    { key: "digitalisierungsgrad", label: "How digital are your processes? (1–10)", type: "slider", min: 1, max: 10, step: 1,
      description: "Just a feel: 1 = lots of paper, 10 = largely automated." },
    { key: "prozesse_papierlos", label: "Share of paperless processes", type: "select",
      options: [ { value: "0-20", label: "0–20%" }, { value: "21-50", label: "21–50%" }, { value: "51-80", label: "51–80%" }, { value: "81-100", label: "81–100%" } ],
      description: "An estimate is enough. It helps to spot quick wins." },
    { key: "automatisierungsgrad", label: "Automation level", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Very low" }, { value: "eher_niedrig", label: "Rather low" }, { value: "mittel", label: "Medium" },
        { value: "eher_hoch", label: "Rather high" }, { value: "sehr_hoch", label: "Very high" }
      ],
      description: "Covers daily workflows (not only IT)." },
    { key: "ki_einsatz", label: "Where is AI used today?", type: "checkbox",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Sales" }, { value: "buchhaltung", label: "Accounting" },
        { value: "produktion", label: "Operations/Production" }, { value: "kundenservice", label: "Customer service" }, { value: "it", label: "IT" },
        { value: "forschung", label: "R&D" }, { value: "personal", label: "HR" }, { value: "keine", label: "No use yet" }, { value: "sonstiges", label: "Other" }
      ],
      description: "If unsure: choose “No use yet”." },
    { key: "ki_knowhow", label: "AI know-how in the team", type: "select",
      options: [
        { value: "keine", label: "None" }, { value: "grundkenntnisse", label: "Basic" }, { value: "mittel", label: "Intermediate" },
        { value: "fortgeschritten", label: "Advanced" }, { value: "expertenwissen", label: "Expert" }
      ],
      description: "Self-assessment; we adapt roadmap and training accordingly." },

    // —— Goals & projects ——
    { key: "projektziel", label: "Primary objectives (next 3–6 months)", type: "checkbox",
      options: [
        { value: "prozessautomatisierung", label: "Process automation" }, { value: "kostensenkung", label: "Cost reduction" },
        { value: "compliance", label: "Compliance/Privacy" }, { value: "produktinnovation", label: "Product innovation" },
        { value: "kundenservice", label: "Improve customer service" }, { value: "markterschliessung", label: "New markets" },
        { value: "personalentlastung", label: "Relieve staff" }, { value: "foerdermittel", label: "Apply for funding" }, { value: "andere", label: "Other" }
      ],
      description: "Pick realistic targets with measurable outcomes." },
    { key: "ki_projekte", label: "Current/planned AI projects", type: "textarea",
      placeholder: "e.g., chatbot, offer automation, generators…",
      description: "Bullet points are fine. Mention tools/processes if relevant." },
    { key: "ki_usecases", label: "Interesting AI use cases", type: "checkbox",
      options: [
        { value: "texterstellung", label: "Text generation" }, { value: "bildgenerierung", label: "Image generation" }, { value: "spracherkennung", label: "Speech recognition" },
        { value: "prozessautomatisierung", label: "Process automation" }, { value: "datenanalyse", label: "Analytics & forecasting" },
        { value: "kundensupport", label: "Customer support" }, { value: "wissensmanagement", label: "Knowledge management" },
        { value: "marketing", label: "Marketing optimisation" }, { value: "sonstiges", label: "Other" }
      ],
      description: "Mark interest areas; we propose everyday-ready starts." },
    { key: "ki_potenzial", label: "Where’s the biggest AI potential?", type: "textarea",
      placeholder: "e.g., faster reporting, personalised offers, automation …",
      description: "Where would a 10% time saving help most?" },
    { key: "usecase_priority", label: "Highest priority area", type: "select",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Sales" }, { value: "buchhaltung", label: "Accounting" },
        { value: "produktion", label: "Operations/Production" }, { value: "kundenservice", label: "Customer service" }, { value: "it", label: "IT" },
        { value: "forschung", label: "R&D" }, { value: "personal", label: "HR" }, { value: "unbekannt", label: "Unsure yet" }
      ],
      description: "Pick the easiest area to start a pilot." },
    { key: "ki_geschaeftsmodell_vision", label: "How could AI change your business model?", type: "textarea",
      placeholder: "e.g., AI-enabled portal, data-driven services …", description: "Where can AI create value (new services, faster delivery)?" },
    { key: "moonshot", label: "Your bold 3-year vision", type: "textarea",
      placeholder: "e.g., 80% automation, doubled revenue …", description: "Ambitious yet realistic – helps align the roadmap." },

    // —— Strategy & governance ——
    { key: "strategische_ziele", label: "Concrete goals with AI", type: "textarea",
      placeholder: "e.g., efficiency, new products, better service", description: "Tie AI goals to business KPIs (e.g., −30% handling time)." },
    { key: "datenqualitaet", label: "Data quality", type: "select",
      options: [ { value: "hoch", label: "High (complete, structured, current)" }, { value: "mittel", label: "Medium (partly structured)" }, { value: "niedrig", label: "Low (unstructured, gaps)" } ],
      description: "Just for effort estimation – choose the closest option." },
    { key: "ai_roadmap", label: "AI roadmap/strategy", type: "select",
      options: [ { value: "ja", label: "Yes – implemented" }, { value: "in_planung", label: "In planning" }, { value: "nein", label: "Not yet" } ],
      description: "If not yet: perfectly fine – we provide a starter path." },
    { key: "governance", label: "Data/AI governance rules", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "teilweise", label: "Partly" }, { value: "nein", label: "No" } ],
      description: "Covers data security, access, model approvals. Templates provided if needed." },
    { key: "innovationskultur", label: "Openness to innovation", type: "select",
      options: [
        { value: "sehr_offen", label: "Very open" }, { value: "eher_offen", label: "Rather open" }, { value: "neutral", label: "Neutral" },
        { value: "eher_zurueckhaltend", label: "Rather cautious" }, { value: "sehr_zurueckhaltend", label: "Very cautious" }
      ],
      description: "A gut feeling helps with pacing." },

    // —— Resources & preferences ——
    { key: "zeitbudget", label: "Weekly time for AI projects", type: "select",
      options: [ { value: "unter_2", label: "Under 2 hours" }, { value: "2_5", label: "2–5 hours" }, { value: "5_10", label: "5–10 hours" }, { value: "ueber_10", label: "Over 10 hours" } ],
      description: "We plan realistically for your calendar." },
    { key: "vorhandene_tools", label: "Systems already in use", type: "checkbox",
      options: [
        { value: "crm", label: "CRM (HubSpot, Salesforce)" }, { value: "erp", label: "ERP (SAP, Odoo)" },
        { value: "projektmanagement", label: "Project management (Asana, Trello)" }, { value: "marketing_automation", label: "Marketing automation" },
        { value: "buchhaltung", label: "Accounting" }, { value: "keine", label: "None/other" }
      ],
      description: "Mark actively used systems to avoid duplicate tooling." },
    { key: "regulierte_branche", label: "Regulated sector", type: "checkbox",
      options: [
        { value: "gesundheit", label: "Health/Medical" }, { value: "finanzen", label: "Finance/Insurance" },
        { value: "oeffentlich", label: "Public sector" }, { value: "recht", label: "Legal services" }, { value: "keine", label: "None of these" }
      ],
      description: "Tick if applicable – we account for sector-specific requirements." },
    { key: "trainings_interessen", label: "Training topics of interest", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt engineering" }, { value: "llm_basics", label: "LLM basics" },
        { value: "datenqualitaet_governance", label: "Data quality & governance" }, { value: "automatisierung", label: "Automation & scripts" },
        { value: "ethik_recht", label: "Ethics & legal basics" }, { value: "keine", label: "None / undecided" }
      ],
      description: "We recommend a 2–4h starter session based on your picks." },
    { key: "vision_prioritaet", label: "Most important vision aspect", type: "select",
      options: [
        { value: "gpt_services", label: "GPT-based services" }, { value: "kundenservice", label: "Improve customer service" },
        { value: "datenprodukte", label: "Data products" }, { value: "prozessautomation", label: "Process automation" },
        { value: "marktfuehrerschaft", label: "Market leadership" }, { value: "keine_angabe", label: "No preference" }
      ],
      description: "Which “big lever” matters most to you?" },

    // —— Legal & funding ——
    { key: "datenschutzbeauftragter", label: "Data protection officer?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "teilweise", label: "Partly (external/planned)" } ],
      description: "If not legally required: choose “No” – we will flag when it is needed." },
    { key: "technische_massnahmen", label: "Technical safeguards", type: "select",
      options: [ { value: "alle", label: "Full set of measures" }, { value: "teilweise", label: "Partly in place" }, { value: "keine", label: "None yet" } ],
      description: "Honest status helps – we’ll propose quick security gains." },
    { key: "folgenabschaetzung", label: "DPIA (data protection impact assessment)", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "teilweise", label: "Partly" } ],
      description: "We point out when a DPIA is recommended or required." },
    { key: "meldewege", label: "Incident reporting paths", type: "select",
      options: [ { value: "ja", label: "Yes, clearly defined" }, { value: "teilweise", label: "Partly defined" }, { value: "nein", label: "No" } ],
      description: "Are escalation paths defined for incidents?" },
    { key: "loeschregeln", label: "Deletion/anonymisation rules", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "teilweise", label: "Partly" }, { value: "nein", label: "No" } ],
      description: "Retention/deletion rules. We provide simple starters." },
    { key: "ai_act_kenntnis", label: "EU AI Act knowledge", type: "select",
      options: [ { value: "sehr_gut", label: "Very good" }, { value: "gut", label: "Good" }, { value: "gehoert", label: "Heard of it" }, { value: "unbekannt", label: "Not aware yet" } ],
      description: "No prior knowledge required – we summarise your duties." },
    { key: "ki_hemmnisse", label: "Main obstacles for AI adoption", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Legal uncertainty" }, { value: "datenschutz", label: "Privacy" }, { value: "knowhow", label: "Lack of know-how" },
        { value: "budget", label: "Limited budget" }, { value: "teamakzeptanz", label: "Team buy-in" }, { value: "zeitmangel", label: "Lack of time" },
        { value: "it_integration", label: "IT integration" }, { value: "keine", label: "No obstacles" }, { value: "andere", label: "Other" }
      ],
      description: "Select all that apply – we’ll propose pragmatic workarounds and priorities." },
    { key: "bisherige_foerdermittel", label: "Received funding before?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" } ],
      description: "Helps to suggest follow-up programmes." },
    { key: "interesse_foerderung", label: "Interested in funding?", type: "select",
      options: [ { value: "ja", label: "Yes, propose programmes" }, { value: "nein", label: "No" }, { value: "unklar", label: "Unsure, please advise" } ],
      description: "With “Unsure” we check eligibility without any obligation." },
    { key: "erfahrung_beratung", label: "Previous digital/AI consulting", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "unklar", label: "Unclear" } ],
      description: "So we can build on what’s in place." },
    { key: "investitionsbudget", label: "Budget for AI/digital (next 12 months)", type: "select",
      options: [ { value: "unter_2000", label: "Under €2,000" }, { value: "2000_10000", label: "€2,000–€10,000" }, { value: "10000_50000", label: "€10,000–€50,000" },
        { value: "ueber_50000", label: "Over €50,000" }, { value: "unklar", label: "Unclear" } ],
      description: "Meaningful starts are possible even with a small budget – we prioritise accordingly." },
    { key: "marktposition", label: "Market position", type: "select",
      options: [ { value: "marktfuehrer", label: "Market leader" }, { value: "oberes_drittel", label: "Top third" }, { value: "mittelfeld", label: "Middle" },
        { value: "nachzuegler", label: "Laggard" }, { value: "unsicher", label: "Hard to say" } ],
      description: "A rough indication is enough." },
    { key: "benchmark_wettbewerb", label: "Competitor benchmarking", type: "select",
      options: [ { value: "ja", label: "Yes, regularly" }, { value: "nein", label: "No" }, { value: "selten", label: "Rarely" } ],
      description: "How often do you compare externally? For context only." },
    { key: "innovationsprozess", label: "How do innovations originate?", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovation team" }, { value: "mitarbeitende", label: "Individual contributors" },
        { value: "kunden", label: "With customers" }, { value: "berater", label: "External consultants" },
        { value: "zufall", label: "By chance" }, { value: "unbekannt", label: "No clear strategy" }
      ],
      description: "We derive change tactics from this." },
    { key: "risikofreude", label: "Risk appetite (1–5)", type: "slider", min: 1, max: 5, step: 1,
      description: "Gut feeling – helps with the right pace." },

    // —— Consent ——
    { key: "datenschutz", label:
      "I have read and agree to the <a href='datenschutz.html' onclick='window.open(this.href, \"Privacy\", \"width=600,height=700\"); return false;'>privacy notice</a>.",
      type: "privacy",
      description: "Please confirm the privacy notice."
    }
  ];

  var blocks = [
    { name: "Company basics", keys: ["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
    { name: "Status quo", keys: ["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
    { name: "Goals & projects", keys: ["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
    { name: "Strategy & governance", keys: ["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
    { name: "Resources & preferences", keys: ["zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"] },
    { name: "Legal & funding", keys: ["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
    { name: "Privacy & submit", keys: ["datenschutz"] }
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
    try { var raw = localStorage.getItem(stepKey); var n = raw==null ? 0 : parseInt(raw,10); currentBlock = isNaN(n)?0:Math.max(0,Math.min(blocks.length-1,n)); }
    catch(_) { currentBlock = 0; }
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
  function renderField(f) {
    var v = formData[f.key];
    var guidance = f.description ? '<div class="guidance'+(f.type==="privacy"?" important":"")+'" id="'+f.key+'_desc">'+f.description+'</div>' : "";
    var aria = ' aria-describedby="'+f.key+'_desc"';
    var html = "";
    if (f.type === "select") {
      var opts = '<option value="">Please choose…</option>';
      for (var i=0;i<(f.options||[]).length;i++){
        var o=f.options[i]; var sel = (String(v||"")===String(o.value))?' selected':'';
        opts += '<option value="'+o.value+'"'+sel+'>'+o.label+'</option>';
      }
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<select id="'+f.key+'" name="'+f.key+'"'+aria+'>'+opts+'</select>';
    } else if (f.type === "textarea") {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<textarea id="'+f.key+'" name="'+f.key+'" placeholder="'+(f.placeholder||"")+'"'+aria+'>'+ (v||"") +'</textarea>';
    } else if (f.type === "checkbox" && f.options) {
      var items = "";
      var arr = Array.isArray(v)?v:[];
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
      html = '<div class="guidance important" role="note">'+(f.description||"")+'</div>'+
             '<label class="checkbox-label"><input type="checkbox" id="'+f.key+'" name="'+f.key+'"'+chk+' required><span>'+f.label+'</span></label>';
    } else {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<input type="text" id="'+f.key+'" name="'+f.key+'" value="'+(v||"")+'"'+aria+'>';
    }
    return '<div class="form-group" data-key="'+f.key+'">'+html+'</div>';
  }

  function renderStep() {
    var root = document.getElementById("formbuilder");
    if (!root) return;

    var block = blocks[currentBlock];
    var intro = BLOCK_INTRO[currentBlock] || "";
    var html = '<section class="fb-section" aria-live="polite" aria-busy="false">'
             +   '<div class="fb-head"><span class="fb-step">Step '+(currentBlock+1)+'/'+blocks.length+'</span>'
             +   '<span class="fb-title">'+block.name+'</span></div>'
             +   (intro ? '<div class="section-intro">'+intro+'</div>' : '');

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      html += renderField(f);
    }

    html += '</section><div class="form-nav">'
         +  '<button type="button" class="btn btn-secondary mr-auto" id="btn-reset">Reset</button>'
         +  '<button type="button" class="btn btn-secondary" id="btn-back" '+(currentBlock===0?'disabled':'')+'>Back</button>'
         +  (currentBlock < blocks.length-1
              ? '<button type="button" class="btn btn-primary" id="btn-next">Next</button>'
              : '<button type="button" class="btn btn-primary" id="btn-submit" aria-label="Submit (you will receive the PDF by email)">Submit</button>')
         +  '</div>'
         +  '<div id="fb-msg" aria-live="assertive"></div>';

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
      if (confirm("Reset the form?")) {
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
      "vision_prioritaet":1,"selbststaendig":1
    };
    var missing = [];
    var block = blocks[currentBlock];
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
      if (msg) { msg.textContent = "Please correct the highlighted fields."; msg.setAttribute("role","alert"); }
    }
    return missing;
  }

  function updateProgress() { dispatchProgress(currentBlock + 1, blocks.length); }

  // --------------------------- Submit ---------------------------
  function submitForm() {
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
        if (document.getElementById(f.key)) { formData[k] = collectValue(f); }
      }
    }
    saveAutosave();

    if (formData.datenschutz !== true) {
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Please confirm the privacy notice."; msg.setAttribute("role","alert"); }
      return;
    }

    var root = document.getElementById("formbuilder");
    if (root) {
      root.innerHTML = '<section class="fb-section"><h2>Thanks for your input!</h2>'
        + '<div class="guidance">Your AI assessment is being generated now. '
        + 'You will receive a personalised PDF report by email.</div></section>';
    }

    var token = getToken();
    if (!token) {
      if (root) root.insertAdjacentHTML("beforeend",
        '<div class="guidance important" role="alert">Your session expired. '
        + '<a href="/login.html">Please log in again</a> to create another report.</div>');
      return;
    }

    var data = {};
    for (var i=0;i<fields.length;i++){ data[fields[i].key] = formData[fields[i].key]; }
    data.lang = LANG;

    var tokenEmail = getEmailFromJWT(token); if (tokenEmail) { data.email = tokenEmail; data.to = tokenEmail; }

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
    var b0 = blocks[0];
    for (var i=0;i<b0.keys.length;i++){ var f=findField(b0.keys[i]); if (f && formData[f.key]===undefined) formData[f.key] = ""; }
    renderStep(); scrollToStepTop(true);
  });
})();
