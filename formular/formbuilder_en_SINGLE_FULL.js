/* Multi-Step Wizard (EN) – Scroll-to-Top, persistent Autosave & Step-Resume */
/* Schema 1.5.0 – Microcopy optimized for small businesses; submit only in the final step. */
(function () {
  "use strict";

  // --------------------------- Configuration ---------------------------
// --------------------------- Configuration ---------------------------
var LANG = "en";
var SCHEMA_VERSION = "1.5.0";
var STORAGE_PREFIX = "autosave_form_";
var SUBMIT_PATH = "/briefing_async";

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

  // --------------------------- Content ---------------------------
  var BLOCK_INTRO = [
    "We capture basics (industry, size, location). No documents needed — rough estimates are fine. This personalizes your report and checks funding & compliance relevance.",
    "Status quo of processes, data and any current AI usage. Goal: quick, feasible wins and a pragmatic starter roadmap — even for small teams.",
    "Goals & key use cases: what exactly should AI deliver? We focus on actionable measures with visible value.",
    "Strategy & governance: simple, durable guardrails for sustainable AI without bureaucracy overhead.",
    "Resources & preferences (time, tool landscape). We tailor recommendations to feasibility, budget and pace.",
    "Legal & funding: GDPR, EU AI Act & funding options — explained clearly with concrete to-dos.",
    "Privacy & submit: confirm consent and start your personalized report."
  ];

  // Fields (with friendly, concise microcopy)
  var fields = [
    { key: "branche", label: "Which industry are you in?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Advertising" }, { value: "beratung", label: "Consulting & Services" },
        { value: "it", label: "IT & Software" }, { value: "finanzen", label: "Finance & Insurance" },
        { value: "handel", label: "Retail & E-commerce" }, { value: "bildung", label: "Education" },
        { value: "verwaltung", label: "Public Administration" }, { value: "gesundheit", label: "Healthcare & Care" },
        { value: "bau", label: "Construction & Architecture" }, { value: "medien", label: "Media & Creative" },
        { value: "industrie", label: "Industry & Manufacturing" }, { value: "logistik", label: "Transport & Logistics" }
      ],
      description: "(So we match industry-specific examples, funding and compliance correctly.)"
    },
    { key: "unternehmensgroesse", label: "How large is your company?", type: "select",
      options: [
        { value: "solo", label: "1 (Solo self-employed/freelance)" }, { value: "team", label: "2–10 (Small team)" }, { value: "kmu", label: "11–100 (SME)" }
      ],
      description: "(So recommendations and funding levels scale realistically by company size.)"
    },
    { key: "selbststaendig", label: "Entity type for single person", type: "select",
      options: [
        { value: "freiberufler", label: "Freelance/Self-employed" }, { value: "kapitalgesellschaft", label: "Single-owner corporation (GmbH/UG)" },
        { value: "einzelunternehmer", label: "Sole proprietor (trade license)" }, { value: "sonstiges", label: "Other" }
      ],
      description: "(So legal duties, grants and contracts reflect your entity type.)",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "bundesland", label: "Federal state (regional funding)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bavaria" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hesse" }, { value: "mv", label: "Mecklenburg-Western Pomerania" }, { value: "ni", label: "Lower Saxony" },
        { value: "nw", label: "North Rhine-Westphalia" }, { value: "rp", label: "Rhineland-Palatinate" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Saxony" }, { value: "st", label: "Saxony-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thuringia" }
      ],
      description: "(So regional programs, contacts and grant rates are applied automatically.)"
    },
    { key: "hauptleistung", label: "Your core service or key product", type: "textarea",
      placeholder: "e.g., social media campaigns, CNC manufacturing, tax advisory for startups",
      description: "(So use cases and examples align precisely with your core business.)"
    },
    { key: "zielgruppen", label: "Which target groups do you serve?", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B (business customers)" }, { value: "b2c", label: "B2C (consumers)" },
        { value: "kmu", label: "SMEs" }, { value: "grossunternehmen", label: "Large enterprises" },
        { value: "selbststaendige", label: "Self-employed/freelancers" }, { value: "oeffentliche_hand", label: "Public sector" },
        { value: "privatpersonen", label: "Private individuals" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Other" }
      ],
      description: "(So proposals match your customer journeys and buying processes.)"
    },
    { key: "jahresumsatz", label: "Annual revenue (estimate)", type: "select",
      options: [
        { value: "unter_100k", label: "Up to €100,000" }, { value: "100k_500k", label: "€100,000–€500,000" },
        { value: "500k_2m", label: "€500,000–€2M" }, { value: "2m_10m", label: "€2M–€10M" },
        { value: "ueber_10m", label: "Over €10M" }, { value: "keine_angabe", label: "Prefer not to say" }
      ],
      description: "(So benchmarks, grant caps and ROI calculations are reliable.)"
    },
    { key: "it_infrastruktur", label: "How is your IT infrastructure organized?", type: "select",
      options: [
        { value: "cloud", label: "Cloud-based (e.g., Microsoft 365, Google Cloud)" },
        { value: "on_premise", label: "Own data center (on-premises)" },
        { value: "hybrid", label: "Hybrid (cloud + own servers)" }, { value: "unklar", label: "Unclear / undecided" }
      ],
      description: "(So integration effort, data protection and hosting options are planned realistically.)"
    },
    { key: "interne_ki_kompetenzen", label: "Do you have an internal AI/digital team?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "in_planung", label: "Planned" } ],
      description: "(So training, support and roadmap fit your current capabilities.)"
    },
    { key: "datenquellen", label: "Which data types are available for AI projects?", type: "checkbox",
      options: [
        { value: "kundendaten", label: "Customer data (CRM, service)" }, { value: "verkaufsdaten", label: "Sales/order data" },
        { value: "produktionsdaten", label: "Production/operations data" }, { value: "personaldaten", label: "HR data" },
        { value: "marketingdaten", label: "Marketing/campaign data" }, { value: "sonstige", label: "Other data sources" }
      ],
      description: "(So we propose data-driven use cases without heavy upfront projects.)"
    },

    // Block 2: Status Quo
    { key: "digitalisierungsgrad", label: "How digital are your internal processes? (1–10)", type: "slider", min: 1, max: 10, step: 1,
      description: "(So we gauge your starting point and identify quick, realistic gains.)" },
    { key: "prozesse_papierlos", label: "Share of paperless processes", type: "select",
      options: [ { value: "0-20", label: "0–20%" }, { value: "21-50", label: "21–50%" }, { value: "51-80", label: "51–80%" }, { value: "81-100", label: "81–100%" } ],
      description: "(So we address automation potential and avoid media breaks deliberately.)" },
    { key: "automatisierungsgrad", label: "Automation level", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Very low" }, { value: "eher_niedrig", label: "Rather low" },
        { value: "mittel", label: "Medium" }, { value: "eher_hoch", label: "Rather high" }, { value: "sehr_hoch", label: "Very high" }
      ],
      description: "(So we set priorities for efficiency and risk assessment on solid grounds.)" },
    { key: "ki_einsatz", label: "Where is AI already used?", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / customer service" }, { value: "marketing", label: "Marketing & content" },
        { value: "vertrieb", label: "Sales & CRM" }, { value: "datenanalyse", label: "Data analytics" },
        { value: "produktion", label: "Production / logistics" }, { value: "hr", label: "HR management" },
        { value: "andere", label: "Other areas" }, { value: "noch_keine", label: "No usage yet" }
      ],
      description: "(So existing solutions are leveraged and duplicate work is avoided.)"
    },
    { key: "ki_kompetenz", label: "AI skill level in the team", type: "select",
      options: [
        { value: "hoch", label: "High" }, { value: "mittel", label: "Medium" },
        { value: "niedrig", label: "Low" }, { value: "keine", label: "None" }
      ],
      description: "(So pace, content and support match your team’s skill level.)"
    },

    // Block 3: Goals & Use Cases
    { key: "ki_ziele", label: "AI goals for the next 3–6 months", type: "checkbox",
      options: [
        { value: "effizienz", label: "Increase efficiency" }, { value: "automatisierung", label: "Automation" },
        { value: "neue_produkte", label: "New products/services" }, { value: "kundenservice", label: "Improve customer service" },
        { value: "datenauswertung", label: "Use data better" }, { value: "kosten_senken", label: "Reduce costs" },
        { value: "wettbewerbsfaehigkeit", label: "Competitiveness" }, { value: "keine_angabe", label: "Not sure yet" }
      ],
      description: "(So we prioritize actions toward short-term, measurable outcomes.)"
    },
    { key: "ki_projekte", label: "Ongoing/planned AI projects", type: "textarea", placeholder: "e.g., chatbot, quote automation, generators…", description: "(So we plan dependencies and next steps sensibly.)" },
    { key: "anwendungsfaelle", label: "Interesting use cases", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / FAQ automation" }, { value: "content_generation", label: "Content generation" },
        { value: "datenanalyse", label: "Data analytics & reporting" }, { value: "dokumentation", label: "Documentation & knowledge" },
        { value: "prozess_automation", label: "Process automation" }, { value: "personalisierung", label: "Personalization" },
        { value: "andere", label: "Other" }, { value: "keine_angabe", label: "Not sure yet" }
      ],
      description: "(So we pick high-value, low-complexity entry points.)"
    },
    { key: "zeitersparnis_prioritaet", label: "Area with time-saving priority", type: "textarea",
      placeholder: "e.g., faster reporting, personalized offers, automation…", description: "(So we identify the quickest time gains and deliver them first.)" },
    { key: "pilot_bereich", label: "Best area for a pilot project", type: "select",
      options: [
        { value: "kundenservice", label: "Customer service" }, { value: "marketing", label: "Marketing / content" },
        { value: "vertrieb", label: "Sales" }, { value: "verwaltung", label: "Administration / back office" },
        { value: "produktion", label: "Production / logistics" }, { value: "andere", label: "Other" }
      ],
      description: "(So the first pilot runs smoothly and delivers dependable results.)"
    },
    { key: "geschaeftsmodell_evolution", label: "Business model idea with AI", type: "textarea",
      placeholder: "e.g., AI-powered portal, data-based services…", description: "(So opportunities for new offerings and recurring revenue become visible.)" },
    { key: "vision_3_jahre", label: "Three-year vision", type: "textarea",
      placeholder: "e.g., 80% automation, doubled revenue…", description: "(So roadmap and investments align with a clear, ambitious direction.)" },

    { key: "strategische_ziele", label: "Concrete goals with AI", type: "textarea", placeholder: "e.g., boost efficiency, new products, better service", description: "(So priorities are metric-driven and progress remains measurable.)" },
    { key: "massnahmen_komplexitaet", label: "Implementation effort", type: "select",
      options: [ { value: "niedrig", label: "Low" }, { value: "mittel", label: "Medium" }, { value: "hoch", label: "High" }, { value: "unklar", label: "Unclear" } ],
      description: "(So scope, timeline and resources are set realistically.)" },
    { key: "roadmap_vorhanden", label: "AI roadmap/strategy in place?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "teilweise", label: "Partly" }, { value: "nein", label: "No" } ],
      description: "(So we leverage existing plans and close any gaps efficiently.)" },
    { key: "governance_richtlinien", label: "AI governance guidelines in place?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "teilweise", label: "Partly" }, { value: "nein", label: "No" } ],
      description: "(So responsibilities, approvals and access are clearly defined.)" },
    { key: "change_management", label: "Team readiness for change", type: "select",
      options: [
        { value: "sehr_hoch", label: "Very high" }, { value: "hoch", label: "High" },
        { value: "mittel", label: "Medium" }, { value: "niedrig", label: "Low" }, { value: "sehr_niedrig", label: "Very low" }
      ],
      description: "(So communication, training and pace fit your readiness.)"
    },

    // Block 5: Resources & Preferences
    { key: "zeitbudget", label: "Time per week for AI projects", type: "select",
      options: [ { value: "unter_2", label: "Under 2 hours" }, { value: "2_5", label: "2–5 hours" }, { value: "5_10", label: "5–10 hours" }, { value: "ueber_10", label: "Over 10 hours" } ],
      description: "(So action plans realistically fit your available time.)" },
    { key: "vorhandene_tools", label: "Systems already in use", type: "checkbox",
      options: [
        { value: "crm", label: "CRM (HubSpot, Salesforce)" }, { value: "erp", label: "ERP (SAP, Odoo)" },
        { value: "projektmanagement", label: "Project management (Asana, Trello)" }, { value: "marketing_automation", label: "Marketing automation" },
        { value: "buchhaltung", label: "Accounting software" }, { value: "keine", label: "None / other" }
      ],
      description: "(So we use existing integrations and avoid redundant tools.)"
    },
    { key: "regulierte_branche", label: "Regulated industry", type: "checkbox",
      options: [
        { value: "gesundheit", label: "Healthcare & medicine" }, { value: "finanzen", label: "Finance & insurance" },
        { value: "oeffentlich", label: "Public sector" }, { value: "recht", label: "Legal services" }, { value: "keine", label: "None of these" }
      ],
      description: "(So sector-specific obligations and evidence are covered from day one.)"
    },
    { key: "trainings_interessen", label: "AI training topics of interest", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt engineering" }, { value: "llm_basics", label: "LLM fundamentals" },
        { value: "datenqualitaet_governance", label: "Data quality & governance" }, { value: "automatisierung", label: "Automation & scripting" },
        { value: "ethik_recht", label: "Ethics & legal basics" }, { value: "keine", label: "None / not sure yet" }
      ],
      description: "(So training plans are tailored and learning goals reached quickly.)"
    },
    { key: "vision_prioritaet", label: "Most important strategic lever", type: "select",
      options: [
        { value: "gpt_services", label: "AI-powered services and products" }, { value: "kundenservice", label: "Optimize customer service/support" },
        { value: "datenprodukte", label: "Develop data-based offerings" }, { value: "prozessautomation", label: "Automate internal processes" },
        { value: "marktfuehrerschaft", label: "Technology leadership in market" }, { value: "keine_angabe", label: "Not sure yet" }
      ],
      description: "(So recommendations focus on your strongest strategic lever.)"
    },

    // Block 6: Legal & Funding
    { key: "datenschutzbeauftragter", label: "Data protection officer (DPO) available?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "teilweise", label: "Partly (external/planned)" } ],
      description: "(So obligations are assessed correctly and responsibilities clarified.)"
    },
    { key: "technische_massnahmen", label: "Technical protection measures", type: "select",
      options: [ { value: "alle", label: "All relevant measures" }, { value: "teilweise", label: "Partly in place" }, { value: "keine", label: "None yet" } ],
      description: "(So security level, quick wins and priorities are derived soundly.)"
    },
    { key: "folgenabschaetzung", label: "Data protection impact assessment (DPIA)", type: "select",
      options: [ { value: "ja", label: "Yes, completed" }, { value: "nein", label: "No, not yet" }, { value: "teilweise", label: "In planning" } ],
      description: "(So potential risks are spotted early and required checks scheduled.)"
    },
    { key: "meldewege", label: "Incident reporting processes", type: "select",
      options: [ { value: "ja", label: "Yes, clearly defined" }, { value: "teilweise", label: "Partly available" }, { value: "nein", label: "No, not defined yet" } ],
      description: "(So incidents escalate fast and legal deadlines are met.)"
    },
    { key: "loeschregeln", label: "Policies for deletion and anonymization", type: "select",
      options: [ { value: "ja", label: "Yes, documented" }, { value: "teilweise", label: "Partly available" }, { value: "nein", label: "No, not defined yet" } ],
      description: "(So retention, deletion and anonymization are traceably governed.)"
    },
    { key: "ai_act_kenntnis", label: "EU AI Act awareness", type: "select",
      options: [ { value: "sehr_gut", label: "Very good" }, { value: "gut", label: "Good" }, { value: "gehoert", label: "Heard about it" }, { value: "unbekannt", label: "Not familiar yet" } ],
      description: "(So obligations under the EU AI Act are considered appropriately.)"
    },
    { key: "ki_hemmnisse", label: "Barriers to using AI", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Legal uncertainty" }, { value: "datenschutz", label: "Data protection" }, { value: "knowhow", label: "Lack of know-how" },
        { value: "budget", label: "Limited budget" }, { value: "teamakzeptanz", label: "Team acceptance" }, { value: "zeitmangel", label: "Lack of time" },
        { value: "it_integration", label: "IT integration" }, { value: "keine", label: "No barriers" }, { value: "andere", label: "Other" }
      ],
      description: "(So hurdles are visible and we can prioritize practical solutions.)"
    },
    { key: "bisherige_foerdermittel", label: "Have you received grants before?", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" } ],
      description: "(So suitable follow-up programs and combinations are identified early.)"
    },
    { key: "interesse_foerderung", label: "Interested in funding options?", type: "select",
      options: [ { value: "ja", label: "Yes, suggest programs" }, { value: "nein", label: "No need" }, { value: "unklar", label: "Not sure, please advise" } ],
      description: "(So we assess funding chances and propose transparent options.)"
    },
    { key: "erfahrung_beratung", label: "Prior consulting on digitization/AI", type: "select",
      options: [ { value: "ja", label: "Yes" }, { value: "nein", label: "No" }, { value: "unklar", label: "Not sure" } ],
      description: "(So we build on existing knowledge and avoid duplicate work.)"
    },
    { key: "investitionsbudget", label: "Budget for AI/digitization next year", type: "select",
      options: [ { value: "unter_2000", label: "Under €2,000" }, { value: "2000_10000", label: "€2,000–€10,000" }, { value: "10000_50000", label: "€10,000–€50,000" },
        { value: "ueber_50000", label: "Over €50,000" }, { value: "unklar", label: "Not sure yet" } ],
      description: "(So scope and grant ratios are planned realistically.)"
    },
    { key: "marktposition", label: "Market position", type: "select",
      options: [ { value: "marktfuehrer", label: "Market leader" }, { value: "oberes_drittel", label: "Top third" }, { value: "mittelfeld", label: "Middle field" },
        { value: "nachzuegler", label: "Laggard" }, { value: "unsicher", label: "Hard to assess" } ],
      description: "(So benchmarks, expectations and strategy are framed appropriately.)"
    },
    { key: "benchmark_wettbewerb", label: "Regular competitor benchmarking?", type: "select",
      options: [ { value: "ja", label: "Yes, regularly" }, { value: "nein", label: "No" }, { value: "selten", label: "Rarely" } ],
      description: "(So we include relevant competitor comparisons in your report.)"
    },
    { key: "innovationsprozess", label: "How do innovations emerge?", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovation team" }, { value: "mitarbeitende", label: "By employees" },
        { value: "kunden", label: "With customers" }, { value: "berater", label: "External consultants" },
        { value: "zufall", label: "By chance" }, { value: "unbekannt", label: "No clear strategy" }
      ],
      description: "(So we understand innovation sources and reinforce effective levers.)"
    },
    { key: "risikofreude", label: "Risk appetite for innovation (1–5)", type: "slider", min: 1, max: 5, step: 1,
      description: "(So delivery risk matches your desired pace and experimentation level.)"
    },

    // Block 7: Privacy & Submit
    { key: "datenschutz", label:
      "I have read the <a href='datenschutz.html' onclick='window.open(this.href, \"PrivacyPopup\", \"width=600,height=700\"); return false;'>privacy notice</a> and agree.",
      type: "privacy",
      description: "(So we can process your data lawfully and generate the report.)"
    }
  ];

  var blocks = [
    { title: "Company & Industry", intro: BLOCK_INTRO[0], keys: ["branche", "unternehmensgroesse", "selbststaendig", "bundesland", "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur", "interne_ki_kompetenzen", "datenquellen"] },
    { title: "Status Quo", intro: BLOCK_INTRO[1], keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", "ki_einsatz", "ki_kompetenz"] },
    { title: "Goals & Use Cases", intro: BLOCK_INTRO[2], keys: ["ki_ziele", "ki_projekte", "anwendungsfaelle", "zeitersparnis_prioritaet", "pilot_bereich", "geschaeftsmodell_evolution", "vision_3_jahre"] },
    { title: "Strategy & Governance", intro: BLOCK_INTRO[3], keys: ["strategische_ziele", "massnahmen_komplexitaet", "roadmap_vorhanden", "governance_richtlinien", "change_management"] },
    { title: "Resources & Preferences", intro: BLOCK_INTRO[4], keys: ["zeitbudget", "vorhandene_tools", "regulierte_branche", "trainings_interessen", "vision_prioritaet"] },
    { title: "Legal & Funding", intro: BLOCK_INTRO[5], keys: ["datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", "meldewege", "loeschregeln", "ai_act_kenntnis", "ki_hemmnisse", "bisherige_foerdermittel", "interesse_foerderung", "erfahrung_beratung", "investitionsbudget", "marktposition", "benchmark_wettbewerb", "innovationsprozess", "risikofreude"] },
    { title: "Privacy & Submit", intro: BLOCK_INTRO[6], keys: ["datenschutz"] }
  ];

  // --------------------------- Render ---------------------------
  function renderStep() {
    var root = document.getElementById("formbuilder");
    if (!root) return;

    var block = blocks[currentBlock];
    var html = "<section class='fb-section'><div class='fb-head'>"
      + "<span class='fb-step'>Step " + (currentBlock + 1) + "/" + blocks.length + "</span>"
      + "<h2 class='fb-title'>" + block.title + "</h2></div>"
      + "<p class='section-intro'>" + block.intro + "</p>";

    for (var i=0; i<block.keys.length; i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      html += "<div class='form-group' data-key='" + k + "'><label for='" + f.key + "'>" + f.label + "</label>";
      if (f.description) html += "<div class='guidance'>" + f.description + "</div>";
      html += renderInput(f) + "</div>";
    }

    html += "</section><div id='fb-msg' role='status' aria-live='polite'></div>";

    var nav = "<nav class='form-nav'>";
    if (currentBlock > 0) nav += "<button type='button' class='btn btn-secondary' id='btn-prev'>← Back</button>";
    nav += "<button type='button' class='btn btn-secondary' id='btn-reset'>Reset form</button>";
    nav += "<span class='mr-auto'></span>";
    if (currentBlock < blocks.length - 1) nav += "<button type='button' class='btn btn-primary' id='btn-next' disabled>Next →</button>";
    else nav += "<button type='button' class='btn btn-primary' id='btn-submit'>Submit</button>";
    nav += "</nav>";

    root.innerHTML = html + nav;

    // change handler
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
      if (currentBlock > 0) { currentBlock--; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
    });

    var next = document.getElementById("btn-next");
    if (next) {
      next.addEventListener("click", function () {
        var missing = validateCurrentBlock(true); if (missing.length) return;
        if (currentBlock < blocks.length - 1) { currentBlock++; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
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
    // write visible fields of the current block into formData
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

    // conditionals: re-render to apply showIf
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
      "vision_prioritaet":1,"selbststaendig":1,"hauptleistung":0
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
      if (msg) { msg.textContent = "Please correct the highlighted fields."; msg.setAttribute("role","alert"); }
    }
    return missing;
  }

  function updateProgress() { dispatchProgress(currentBlock + 1, blocks.length); }

  // --------------------------- Submit ---------------------------
  function submitForm() {
    // collect all fields
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
        if (document.getElementById(f.key)) { formData[k] = collectValue(f);} /* else keep existing */ }
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
        + '<div class="guidance">Your AI analysis is being generated. '
        + 'You will receive your personalized PDF report via email when it is ready.</div></section>';
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
      // Autosave intentionally remains (later editing possible).
    }).catch(function(){});
  }

  // --------------------------- Helpers ---------------------------
  function findField(k) { for (var i=0; i<fields.length; i++) { if (fields[i].key === k) return fields[i]; } return null; }

  function labelOf(k) {
    var f = findField(k);
    return f ? (f.label || k) : k;
  }

  function renderInput(f) {
    if (f.type === "select") {
      var opts = "<option value=''>Please choose…</option>";
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
      var slider = document.getElementById(f.key); if (slider) { slider.value = val || f.min || 1; updateSliderLabel(f.key, slider.value); }
      slider.addEventListener("input", function(e){ updateSliderLabel(f.key, e.target.value); });
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
    // ensure block 0 keys exist (initial validation)
    var b0 = blocks[0]; for (var i=0;i<b0.keys.length;i++){ var f=findField(b0.keys[i]); if (f && formData[f.key]===undefined) formData[f.key] = ""; }
    renderStep(); scrollToStepTop(true);
  });
})();
