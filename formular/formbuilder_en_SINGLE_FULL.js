(function(){ try{
  const css = `
    .fb-section{ 
      background:white; 
      border:1px solid #e2e8f0; 
      border-radius:20px; 
      padding:32px; 
      margin:24px 0; 
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
    .fb-section-head{ 
      font-size:24px; 
      font-weight:700; 
      color:#1e3a5f; 
      margin-bottom:16px; 
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .fb-step{
      display:inline-block;
      background: #dbeafe;
      color: #1e3a5f;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .section-intro{ 
      background: linear-gradient(135deg, #e0f2fe, #dbeafe);
      border-left: 4px solid #2563eb;
      border-radius:12px; 
      padding:16px 24px; 
      margin:16px 0 32px; 
      color:#1e3a5f;
      font-size: 16px;
      line-height: 1.6;
    }
    .form-group{ 
      margin:32px 0; 
    }
    .form-group label{ 
      display:block; 
      font-weight:600; 
      color:#1e3a5f; 
      margin-bottom:8px;
      font-size: 17px;
    }
    .guidance{ 
      font-size:15px; 
      color:#475569; 
      margin:8px 0 16px;
      background: #f0f9ff;
      padding: 16px;
      border-radius: 10px;
      border-left: 3px solid #dbeafe;
      line-height: 1.5;
    }
    .guidance.important{ 
      background:#fef3c7; 
      border-left-color:#f59e0b; 
      color:#92400e;
    }
    select, textarea, input[type="text"], input[type="range"]{
      width:100%; 
      box-sizing:border-box; 
      border:2px solid #e2e8f0; 
      border-radius:12px; 
      padding:14px 16px; 
      font-size:16px; 
      background:#ffffff;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    select:hover, textarea:hover, input[type="text"]:hover {
      border-color: #cbd5e1;
    }
    select:focus, textarea:focus, input[type="text"]:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    textarea{ 
      min-height:120px; 
      resize:vertical; 
    }
    .checkbox-group{ 
      display:grid; 
      grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); 
      gap:16px;
      margin-top: 16px;
    }
    .checkbox-label{ 
      display:flex; 
      gap:12px; 
      align-items:flex-start;
      padding: 16px;
      background: #f0f9ff;
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .checkbox-label:hover {
      background: #e0f2fe;
      border-color: #dbeafe;
    }
    .checkbox-label input[type="checkbox"] {
      margin-top: 4px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .checkbox-label span {
      flex: 1;
      font-weight: 500;
    }
    .option-example{ 
      font-size:14px; 
      color:#64748b; 
      margin-top:4px; 
      display: block;
    }
    .invalid{ 
      border-color:#ef4444 !important; 
      background:#fef2f2 !important; 
    }
    .invalid-group{ 
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
      border-radius: 12px;
    }
    .form-nav{ 
      position: sticky;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      margin-top: 32px;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
    }
    .btn-next{ 
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color:white; 
      border:0; 
      border-radius:12px; 
      padding:14px 28px; 
      font-size:16px; 
      font-weight:600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-next:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
    }
    .btn-reset{ 
      background:white; 
      color:#1e293b; 
      border:2px solid #cbd5e1; 
      border-radius:12px; 
      padding:14px 28px; 
      font-size:16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-reset:hover {
      background: #f0f9ff;
      border-color: #2563eb;
    }
    .success-msg{ 
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-left: 4px solid #10b981;
      color: #065f46;
      padding: 24px;
      border-radius: 12px;
      margin: 24px 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .form-error{ 
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border-left: 4px solid #ef4444;
      color: #991b1b;
      padding: 24px;
      border-radius: 12px;
      margin: 24px 0;
    }
    .slider-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .slider-value-label{ 
      min-width: 48px;
      padding: 8px 12px;
      background: #dbeafe;
      border-radius: 8px;
      font-weight: 600;
      color: #1e3a5f;
      text-align: center;
    }
    input[type="range"] {
      flex: 1;
    }
  `;
  const s=document.createElement('style'); 
  s.type='text/css'; 
  s.appendChild(document.createTextNode(css)); 
  document.head.appendChild(s);
}catch(_){}})();

// JWT utilities
function getToken() {
  try { return localStorage.getItem("jwt") || null; } catch(e){ return null; }
}

function getEmailFromJWT(token) {
  try {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.sub || null;
  } catch (e) {
    return null;
  }
}

// Helper functions
function findField(key){ 
  return fields.find(f => f.key === key); 
}

function getFieldLabel(key){ 
  const f = findField(key); 
  return f?.label || key; 
}

function markInvalid(key, on = true) {
  const el = document.getElementById(key);
  if (el) {
    if (on) { 
      el.classList.add('invalid'); 
    } else { 
      el.classList.remove('invalid'); 
    }
    const grp = el.closest('.form-group');
    if (grp) { 
      if (on) { 
        grp.classList.add('invalid-group'); 
      } else { 
        grp.classList.remove('invalid-group'); 
      }
    }
  }
}

function validateBlockDetailed(blockIdx){
  const block = blocks[blockIdx];
  const optional = new Set([
    "jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen",
    "time_capacity","existing_tools","regulated_industry","training_interests",
    "vision_priority","selbststaendig"
  ]);
  const missing = [];
  block.keys.forEach(k => markInvalid(k, false));
  
  for (const key of block.keys){
    const f = findField(key); 
    if (!f) continue;
    if (f.showIf && !f.showIf(formData)) continue;
    if (optional.has(key)) continue;
    
    const val = formData[key];
    let ok = true;
    if (f.type === "checkbox") {
      ok = Array.isArray(val) && val.length > 0;
    } else if (f.type === "privacy") {
      ok = (val === true);
    } else {
      ok = (val !== undefined && String(val).trim() !== "");
    }
    
    if (!ok){ 
      missing.push(getFieldLabel(key)); 
      markInvalid(key, true); 
    }
  }
  return missing;
}

// Section introductions
const BLOCK_INTRO = [
  "We collect basic data (industry, size, location). This drives report personalisation and relevant funding/compliance notes.",
  "Current state of processes, data and prior AI usage. This calibrates quick wins and the starter roadmap.",
  "Goals & key use cases: what should AI achieve? This focuses recommendations and prioritises actions.",
  "Strategy & governance for sustainable AI deployment and responsible implementation.",
  "Resources & preferences (time, tool affinity, existing tools). We adapt suggestions to feasibility and pace.",
  "Legal & funding aspects: GDPR, EU AI Act, funding opportunities and compliance for safe AI deployment.",
  "Privacy & submit: confirm consent and launch your personalised report."
];

// Field definitions
const fields = [
  // Block 1: Company information
  {
    key: "branche",
    label: "In which industry is your company active?",
    type: "select",
    options: [
      { value: "marketing", label: "Marketing & advertising" },
      { value: "beratung", label: "Consulting & services" },
      { value: "it", label: "IT & software" },
      { value: "finanzen", label: "Finance & insurance" },
      { value: "handel", label: "Retail & e-commerce" },
      { value: "bildung", label: "Education" },
      { value: "verwaltung", label: "Administration" },
      { value: "gesundheit", label: "Health & care" },
      { value: "bau", label: "Construction & architecture" },
      { value: "medien", label: "Media & creative industries" },
      { value: "industrie", label: "Industry & production" },
      { value: "logistik", label: "Transport & logistics" }
    ],
    description: "Your main industry influences benchmarks, tool recommendations and the analysis. Please select the core business you want your report to focus on."
  },
  {
    key: "unternehmensgroesse",
    label: "How large is your company (number of employees)?",
    type: "select",
    options: [
      { value: "solo", label: "1 (sole proprietor / freelancer)" },
      { value: "team", label: "2–10 (small team)" },
      { value: "kmu", label: "11–100 (SME)" }
    ],
    description: "The size of your company influences recommendations, funding opportunities and benchmarks."
  },
  {
    key: "selbststaendig",
    label: "Legal form for a single person",
    type: "select",
    options: [
      { value: "freiberufler", label: "Freelancer / self-employed" },
      { value: "kapitalgesellschaft", label: "Single-member corporation (GmbH/UG)" },
      { value: "einzelunternehmer", label: "Sole proprietorship (with trade licence)" },
      { value: "sonstiges", label: "Other" }
    ],
    description: "Please choose the legal form that applies to you.",
    showIf: (data) => data.unternehmensgroesse === "solo"
  },
  {
    key: "bundesland",
    label: "State (regional funding opportunities)",
    type: "select",
    options: [
      { value: "bw", label: "Baden-Württemberg" },
      { value: "by", label: "Bayern" },
      { value: "be", label: "Berlin" },
      { value: "bb", label: "Brandenburg" },
      { value: "hb", label: "Bremen" },
      { value: "hh", label: "Hamburg" },
      { value: "he", label: "Hessen" },
      { value: "mv", label: "Mecklenburg-Vorpommern" },
      { value: "ni", label: "Niedersachsen" },
      { value: "nw", label: "Nordrhein-Westfalen" },
      { value: "rp", label: "Rheinland-Pfalz" },
      { value: "sl", label: "Saarland" },
      { value: "sn", label: "Sachsen" },
      { value: "st", label: "Sachsen-Anhalt" },
      { value: "sh", label: "Schleswig-Holstein" },
      { value: "th", label: "Thüringen" }
    ],
    description: "Your location determines which funding, programmes and advisory services you can use."
  },
  {
    key: "hauptleistung",
    label: "What's your company's main product or core service?",
    type: "textarea",
    placeholder: "e.g. social media campaigns, CNC production, tax consulting for startups",
    description: "Describe your core offering as specifically as possible."
  },
  {
    key: "zielgruppen",
    label: "Which target groups or customer segments do you serve?",
    type: "checkbox",
    options: [
      { value: "b2b", label: "B2B (business customers)" },
      { value: "b2c", label: "B2C (consumers)" },
      { value: "kmu", label: "SMEs (small & medium enterprises)" },
      { value: "grossunternehmen", label: "Large enterprises" },
      { value: "selbststaendige", label: "Self-employed / freelancers" },
      { value: "oeffentliche_hand", label: "Public sector" },
      { value: "privatpersonen", label: "Private individuals" },
      { value: "startups", label: "Startups" },
      { value: "andere", label: "Other" }
    ],
    description: "Please select all target groups that apply (multiple selections possible)."
  },
  {
    key: "jahresumsatz",
    label: "Annual revenue (estimate)",
    type: "select",
    options: [
      { value: "unter_100k", label: "Up to €100,000" },
      { value: "100k_500k", label: "€100,000–500,000" },
      { value: "500k_2m", label: "€500,000–2 million" },
      { value: "2m_10m", label: "€2–10 million" },
      { value: "ueber_10m", label: "Over €10 million" },
      { value: "keine_angabe", label: "Prefer not to say" }
    ],
    description: "This helps with benchmarks and funding recommendations."
  },
  {
    key: "it_infrastruktur",
    label: "How is your IT infrastructure organized?",
    type: "select",
    options: [
      { value: "cloud", label: "Cloud-based (e.g. Microsoft 365, Google Cloud)" },
      { value: "on_premise", label: "Own data centre (on-premises)" },
      { value: "hybrid", label: "Hybrid (cloud + own servers)" },
      { value: "unklar", label: "Unclear / not decided yet" }
    ],
    description: "Helps us select suitable security and integration recommendations."
  },
  {
    key: "interne_ki_kompetenzen",
    label: "Do you have an internal AI/digitalisation team?",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" },
      { value: "in_planung", label: "In planning" }
    ],
    description: "Helps us recommend appropriate training and structures."
  },
  {
    key: "datenquellen",
    label: "Which types of data are available for AI projects?",
    type: "checkbox",
    options: [
      { value: "kundendaten", label: "Customer data (CRM, service, history)" },
      { value: "verkaufsdaten", label: "Sales and order data" },
      { value: "produktionsdaten", label: "Production or operational data" },
      { value: "personaldaten", label: "Personnel or HR data" },
      { value: "marketingdaten", label: "Marketing and campaign data" },
      { value: "sonstige", label: "Other data sources" }
    ],
    description: "Select all relevant data sources (multiple selections possible)."
  },

  // Block 2: Status Quo
  {
    key: "digitalisierungsgrad",
    label: "How digital are your internal processes? (1-10)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    description: "1 = mostly paper/manual, 10 = fully digital/automated"
  },
  {
    key: "prozesse_papierlos",
    label: "What proportion of processes are paperless?",
    type: "select",
    options: [
      { value: "0-20", label: "0–20%" },
      { value: "21-50", label: "21–50%" },
      { value: "51-80", label: "51–80%" },
      { value: "81-100", label: "81–100%" }
    ],
    description: "Estimate how much runs completely digital."
  },
  {
    key: "automatisierungsgrad",
    label: "Degree of automation in workflows",
    type: "select",
    options: [
      { value: "sehr_niedrig", label: "Very low" },
      { value: "eher_niedrig", label: "Rather low" },
      { value: "mittel", label: "Medium" },
      { value: "eher_hoch", label: "Rather high" },
      { value: "sehr_hoch", label: "Very high" }
    ],
    description: "How much runs automatically vs manually?"
  },
  {
    key: "ki_einsatz",
    label: "Where is AI already being used?",
    type: "checkbox",
    options: [
      { value: "marketing", label: "Marketing" },
      { value: "vertrieb", label: "Sales" },
      { value: "buchhaltung", label: "Accounting" },
      { value: "produktion", label: "Production" },
      { value: "kundenservice", label: "Customer service" },
      { value: "it", label: "IT" },
      { value: "forschung", label: "Research & development" },
      { value: "personal", label: "Human resources" },
      { value: "keine", label: "No usage yet" },
      { value: "sonstiges", label: "Other" }
    ],
    description: "Select all areas that apply."
  },
  {
    key: "ki_knowhow",
    label: "Team's internal AI know-how",
    type: "select",
    options: [
      { value: "keine", label: "No experience" },
      { value: "grundkenntnisse", label: "Basic knowledge" },
      { value: "mittel", label: "Medium" },
      { value: "fortgeschritten", label: "Advanced" },
      { value: "expertenwissen", label: "Expert knowledge" }
    ],
    description: "How proficient is your team with AI?"
  },

  // Block 3: Goals & Projects
  {
    key: "projektziel",
    label: "Main objective of next AI project",
    type: "checkbox",
    options: [
      { value: "prozessautomatisierung", label: "Process automation" },
      { value: "kostensenkung", label: "Cost reduction" },
      { value: "compliance", label: "Compliance/data protection" },
      { value: "produktinnovation", label: "Product innovation" },
      { value: "kundenservice", label: "Improve customer service" },
      { value: "markterschliessung", label: "Market expansion" },
      { value: "personalentlastung", label: "Relieve staff" },
      { value: "foerdermittel", label: "Apply for funding" },
      { value: "andere", label: "Other" }
    ],
    description: "Multiple selections possible."
  },
  {
    key: "ki_projekte",
    label: "Ongoing or planned AI projects",
    type: "textarea",
    placeholder: "e.g. chatbot, automated quotes, text generators...",
    description: "Describe current or planned projects concretely."
  },
  {
    key: "ki_usecases",
    label: "AI use cases of interest",
    type: "checkbox",
    options: [
      { value: "texterstellung", label: "Text generation" },
      { value: "bildgenerierung", label: "Image generation" },
      { value: "spracherkennung", label: "Speech recognition" },
      { value: "prozessautomatisierung", label: "Process automation" },
      { value: "datenanalyse", label: "Data analysis & forecasting" },
      { value: "kundensupport", label: "Customer support" },
      { value: "wissensmanagement", label: "Knowledge management" },
      { value: "marketing", label: "Marketing optimization" },
      { value: "sonstiges", label: "Other" }
    ],
    description: "Multiple selections possible."
  },
  {
    key: "ki_potenzial",
    label: "Greatest potential for AI in your company",
    type: "textarea",
    placeholder: "e.g. faster reporting, personalized offers, automation...",
    description: "Where do you see the greatest potential?"
  },
  {
    key: "usecase_priority",
    label: "Where should AI be introduced first?",
    type: "select",
    options: [
      { value: "marketing", label: "Marketing" },
      { value: "vertrieb", label: "Sales" },
      { value: "buchhaltung", label: "Accounting" },
      { value: "produktion", label: "Production" },
      { value: "kundenservice", label: "Customer service" },
      { value: "it", label: "IT" },
      { value: "forschung", label: "Research & development" },
      { value: "personal", label: "Human resources" },
      { value: "unbekannt", label: "Still unclear" }
    ],
    description: "Which department has the most urgent need?"
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "How could AI change your business model?",
    type: "textarea",
    placeholder: "e.g. automated consultations, data-based services...",
    description: "Your long-term vision for AI transformation."
  },
  {
    key: "moonshot",
    label: "Your bold AI vision in 3 years",
    type: "textarea",
    placeholder: "e.g. 80% automation, doubled revenue...",
    description: "Think big - what would be a breakthrough?"
  },

  // Block 4: Strategy & Governance
  {
    key: "strategic_goals",
    label: "Specific goals with AI",
    type: "textarea",
    placeholder: "e.g. increase efficiency, new products, better service",
    description: "List your main strategic AI goals."
  },
  {
    key: "data_quality",
    label: "Quality of your data",
    type: "select",
    options: [
      { value: "high", label: "High (complete, structured, current)" },
      { value: "medium", label: "Medium (partly structured)" },
      { value: "low", label: "Low (unstructured, gaps)" }
    ],
    description: "Well-maintained data is crucial for AI success."
  },
  {
    key: "ai_roadmap",
    label: "AI roadmap or strategy",
    type: "select",
    options: [
      { value: "yes", label: "Yes - implemented" },
      { value: "planning", label: "In planning" },
      { value: "no", label: "Not yet available" }
    ],
    description: "A clear roadmap supports structured implementation."
  },
  {
    key: "governance",
    label: "Data and AI governance guidelines",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "partial", label: "Partial" },
      { value: "no", label: "No" }
    ],
    description: "Guidelines promote responsible AI projects."
  },
  {
    key: "innovation_culture",
    label: "Openness to innovation",
    type: "select",
    options: [
      { value: "very_open", label: "Very open" },
      { value: "rather_open", label: "Rather open" },
      { value: "neutral", label: "Neutral" },
      { value: "rather_reluctant", label: "Rather reluctant" },
      { value: "very_reluctant", label: "Very reluctant" }
    ],
    description: "Innovation-friendly culture facilitates AI adoption."
  },

  // Block 5: Resources & Preferences
  {
    key: "time_capacity",
    label: "Time per week for AI projects",
    type: "select",
    options: [
      { value: "under_2", label: "Under 2 hours" },
      { value: "2_5", label: "2–5 hours" },
      { value: "5_10", label: "5–10 hours" },
      { value: "over_10", label: "More than 10 hours" }
    ],
    description: "Helps tailor recommendations to available time."
  },
  {
    key: "existing_tools",
    label: "Systems already in use",
    type: "checkbox",
    options: [
      { value: "crm", label: "CRM systems (HubSpot, Salesforce)" },
      { value: "erp", label: "ERP systems (SAP, Odoo)" },
      { value: "project_management", label: "Project management (Asana, Trello)" },
      { value: "marketing_automation", label: "Marketing automation" },
      { value: "accounting", label: "Accounting software" },
      { value: "none", label: "None / other" }
    ],
    description: "Multiple selections - guides integration suggestions."
  },
  {
    key: "regulated_industry",
    label: "Regulated industry",
    type: "checkbox",
    options: [
      { value: "healthcare", label: "Health & medicine" },
      { value: "finance", label: "Finance & insurance" },
      { value: "public", label: "Public sector" },
      { value: "legal", label: "Legal services" },
      { value: "none", label: "None of these" }
    ],
    description: "Regulated industries need special compliance."
  },
  {
    key: "training_interests",
    label: "AI training topics of interest",
    type: "checkbox",
    options: [
      { value: "prompt_engineering", label: "Prompt engineering" },
      { value: "llm_basics", label: "LLM basics" },
      { value: "data_quality_governance", label: "Data quality & governance" },
      { value: "automation_scripts", label: "Automation & scripts" },
      { value: "ethics_regulation", label: "Ethical & legal foundations" },
      { value: "none", label: "None / not sure" }
    ],
    description: "Helps recommend suitable training."
  },
  {
    key: "vision_priority",
    label: "Most important vision aspect",
    type: "select",
    options: [
      { value: "gpt_services", label: "GPT-based services" },
      { value: "customer_service", label: "Improve customer service" },
      { value: "data_products", label: "New data-driven products" },
      { value: "process_automation", label: "Automate processes" },
      { value: "market_leadership", label: "Achieve market leadership" },
      { value: "unspecified", label: "No preference" }
    ],
    description: "Helps prioritize recommendations."
  },

  // Block 6: Legal & Funding
  {
    key: "datenschutzbeauftragter",
    label: "Data protection officer",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" },
      { value: "teilweise", label: "Partially (external/planning)" }
    ],
    description: "Often mandatory - internal or external."
  },
  {
    key: "technische_massnahmen",
    label: "Technical data protection measures",
    type: "select",
    options: [
      { value: "alle", label: "All relevant measures" },
      { value: "teilweise", label: "Partially in place" },
      { value: "keine", label: "None yet" }
    ],
    description: "Firewalls, backups, access restrictions etc."
  },
  {
    key: "folgenabschaetzung",
    label: "Data protection impact assessment (DPIA)",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" },
      { value: "teilweise", label: "Partially" }
    ],
    description: "Required for many AI applications under GDPR."
  },
  {
    key: "meldewege",
    label: "Reporting procedures for incidents",
    type: "select",
    options: [
      { value: "ja", label: "Yes, clear processes" },
      { value: "teilweise", label: "Partially regulated" },
      { value: "nein", label: "No" }
    ],
    description: "Quick response to data protection breaches."
  },
  {
    key: "loeschregeln",
    label: "Rules for data deletion/anonymization",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "teilweise", label: "Partially" },
      { value: "nein", label: "No" }
    ],
    description: "Important for AI compliance and GDPR."
  },
  {
    key: "ai_act_kenntnis",
    label: "Knowledge of EU AI Act",
    type: "select",
    options: [
      { value: "sehr_gut", label: "Very well" },
      { value: "gut", label: "Well" },
      { value: "gehoert", label: "Heard of it" },
      { value: "unbekannt", label: "Not yet familiar" }
    ],
    description: "The EU AI Act brings new obligations."
  },
  {
    key: "ki_hemmnisse",
    label: "Obstacles to AI adoption",
    type: "checkbox",
    options: [
      { value: "rechtsunsicherheit", label: "Legal uncertainty" },
      { value: "datenschutz", label: "Data protection" },
      { value: "knowhow", label: "Lack of know-how" },
      { value: "budget", label: "Limited budget" },
      { value: "teamakzeptanz", label: "Team acceptance" },
      { value: "zeitmangel", label: "Lack of time" },
      { value: "it_integration", label: "IT integration" },
      { value: "keine", label: "No obstacles" },
      { value: "andere", label: "Other" }
    ],
    description: "Select all that apply."
  },
  {
    key: "bisherige_foerdermittel",
    label: "Previous funding received",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" }
    ],
    description: "For digitalization or AI projects."
  },
  {
    key: "interesse_foerderung",
    label: "Interest in funding opportunities",
    type: "select",
    options: [
      { value: "ja", label: "Yes, suggest programs" },
      { value: "nein", label: "No need" },
      { value: "unklar", label: "Unsure, please advise" }
    ],
    description: "We'll filter suitable options."
  },
  {
    key: "erfahrung_beratung",
    label: "Previous consulting on digitalization/AI",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" },
      { value: "unklar", label: "Unclear" }
    ],
    description: "External advice strengthens your position."
  },
  {
    key: "investitionsbudget",
    label: "Budget for AI/digitalization next year",
    type: "select",
    options: [
      { value: "unter_2000", label: "Under €2,000" },
      { value: "2000_10000", label: "€2,000–10,000" },
      { value: "10000_50000", label: "€10,000–50,000" },
      { value: "ueber_50000", label: "More than €50,000" },
      { value: "unklar", label: "Still unclear" }
    ],
    description: "Even small budgets can deliver progress."
  },
  {
    key: "marktposition",
    label: "Market position",
    type: "select",
    options: [
      { value: "marktfuehrer", label: "Market leader" },
      { value: "oberes_drittel", label: "Top third" },
      { value: "mittelfeld", label: "Middle field" },
      { value: "nachzuegler", label: "Laggard" },
      { value: "unsicher", label: "Hard to assess" }
    ],
    description: "Helps classify your results."
  },
  {
    key: "benchmark_wettbewerb",
    label: "Compare with competitors",
    type: "select",
    options: [
      { value: "ja", label: "Yes, regularly" },
      { value: "nein", label: "No" },
      { value: "selten", label: "Rarely" }
    ],
    description: "Benchmarks help identify opportunities."
  },
  {
    key: "innovationsprozess",
    label: "How innovations arise",
    type: "select",
    options: [
      { value: "innovationsteam", label: "Innovation team" },
      { value: "mitarbeitende", label: "Through employees" },
      { value: "kunden", label: "With customers" },
      { value: "berater", label: "External consultants" },
      { value: "zufall", label: "By chance" },
      { value: "unbekannt", label: "No clear strategy" }
    ],
    description: "Structured paths facilitate AI deployment."
  },
  {
    key: "risikofreude",
    label: "Risk-taking with innovation (1-5)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    description: "1 = safety-oriented, 5 = very bold"
  },

  // Block 7: Privacy & Submit
  {
    key: "datenschutz",
    label: "I have read the <a href='privacy.html' onclick='window.open(this.href, \"PrivacyPopup\", \"width=600,height=700\"); return false;'>privacy notice</a> and agree.",
    type: "privacy",
    description: "Please confirm that you have read the privacy notice."
  }
];

// Block structure
const blocks = [
  {
    name: "Company Information",
    keys: ["branche", "unternehmensgroesse", "selbststaendig", "bundesland", 
           "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur", 
           "interne_ki_kompetenzen", "datenquellen"]
  },
  {
    name: "Status Quo",
    keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", 
           "ki_einsatz", "ki_knowhow"]
  },
  {
    name: "Goals & Projects",
    keys: ["projektziel", "ki_projekte", "ki_usecases", "ki_potenzial", 
           "usecase_priority", "ki_geschaeftsmodell_vision", "moonshot"]
  },
  {
    name: "Strategy & Governance",
    keys: ["strategic_goals", "data_quality", "ai_roadmap", "governance", 
           "innovation_culture"]
  },
  {
    name: "Resources & Preferences",
    keys: ["time_capacity", "existing_tools", "regulated_industry", 
           "training_interests", "vision_priority"]
  },
  {
    name: "Legal & Funding",
    keys: ["datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", 
           "meldewege", "loeschregeln", "ai_act_kenntnis", "ki_hemmnisse", 
           "bisherige_foerdermittel", "interesse_foerderung", "erfahrung_beratung", 
           "investitionsbudget", "marktposition", "benchmark_wettbewerb", 
           "innovationsprozess", "risikofreude"]
  },
  {
    name: "Privacy & Submit",
    keys: ["datenschutz"]
  }
];

// State management
let currentBlock = 0;
let autosaveKey = (() => {
  try {
    const token = localStorage.getItem('jwt');
    if (token) {
      const email = getEmailFromJWT(token);
      if (email) return `autosave_form_${email}`;
    }
  } catch (e) {}
  return 'autosave_form_test';
})();
let formData = {};

// Load saved data
function loadAutosave() {
  try {
    formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
  } catch(e) {
    formData = {};
  }
}

// Save data
function saveAutosave() {
  try {
    localStorage.setItem(autosaveKey, JSON.stringify(formData));
  } catch(e) {}
}

// Get field value
function getFieldValue(field) {
  switch (field.type) {
    case "checkbox":
      return Array.from(document.querySelectorAll(`input[name="${field.key}"]:checked`))
        .map(e => e.value);
    case "slider":
      return document.getElementById(field.key)?.value || field.min || 1;
    case "privacy":
      return document.getElementById(field.key)?.checked || false;
    default:
      return document.getElementById(field.key)?.value || "";
  }
}

// Set field values
function setFieldValues() {
  for (const block of blocks) {
    for (const key of block.keys) {
      const field = findField(key);
      if (!field) continue;
      
      const el = document.getElementById(field.key);
      if (!el) continue;
      
      if (field.type === "checkbox") {
        (formData[key] || []).forEach(v => {
          const box = document.querySelector(`input[name="${field.key}"][value="${v}"]`);
          if (box) box.checked = true;
        });
      } else if (field.type === "slider") {
        const val = formData[key] ?? field.min ?? 1;
        el.value = val;
        const label = el.parentElement?.querySelector('.slider-value-label');
        if (label) label.innerText = val;
      } else if (field.type === "privacy") {
        el.checked = formData[key] === true;
      } else {
        if (formData[key] !== undefined) el.value = formData[key];
      }
    }
  }
}

// Render all blocks
function renderAllBlocks() {
  const root = document.getElementById("formbuilder");
  if (!root) return;
  
  let html = "";
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    html += `<section class="fb-section">
      <div class="fb-section-head">
        <span class="fb-step">Step ${i+1}/${blocks.length}</span>
        <b>${block.name}</b>
      </div>`;
    
    const intro = BLOCK_INTRO[i];
    if (intro) {
      html += `<div class="section-intro">${intro}</div>`;
    }
    
    html += block.keys.map(key => {
      const field = findField(key);
      if (!field) return "";
      if (field.showIf && !field.showIf(formData)) return "";
      
      const guidance = field.description ? 
        `<div class="guidance${field.type === "privacy" ? " important" : ""}">${field.description}</div>` : "";
      
      let input = "";
      
      switch(field.type) {
        case "select": {
          const selectedValue = formData[field.key] || "";
          input = `<select id="${field.key}" name="${field.key}">
            <option value="">Please select...</option>` +
            (field.options||[]).map(opt => {
              const sel = selectedValue === opt.value ? ' selected' : '';
              return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
            }).join("") + `</select>`;
          break;
        }
        case "textarea":
          input = `<textarea id="${field.key}" name="${field.key}" 
            placeholder="${field.placeholder||""}">${formData[field.key]||""}</textarea>`;
          break;
        case "checkbox":
          input = `<div class="checkbox-group">` +
            (field.options||[]).map(opt => {
              const checked = (formData[field.key]||[]).includes(opt.value) ? 'checked' : '';
              return `<label class="checkbox-label">
                <input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}>
                <span>${opt.label}</span>
              </label>`;
            }).join("") + `</div>`;
          break;
        case "slider": {
          const v = formData[field.key] ?? field.min ?? 1;
          input = `<div class="slider-container">
            <input type="range" id="${field.key}" name="${field.key}" 
              min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" 
              value="${v}" oninput="this.parentElement.querySelector('.slider-value-label').innerText=this.value">
            <span class="slider-value-label">${v}</span>
          </div>`;
          break;
        }
        case "privacy":
          input = `<label class="checkbox-label">
            <input type="checkbox" id="${field.key}" name="${field.key}" 
              ${formData[field.key]?'checked':''} required>
            <span>${field.label}</span>
          </label>`;
          break;
        default:
          input = `<input type="text" id="${field.key}" name="${field.key}" 
            value="${formData[field.key]||""}">`;
      }
      
      const labelHtml = field.type !== "privacy" ? 
        `<label for="${field.key}"><b>${field.label}</b></label>` : "";
      
      return `<div class="form-group">${labelHtml}${guidance}${input}</div>`;
    }).join("");
    
    html += `</section>`;
  }
  
  html += `<div class="form-nav">
    <button type="button" id="btn-reset" class="btn-reset">Reset</button>
    <button type="button" id="btn-send" class="btn-next">Submit</button>
  </div>
  <div id="feedback"></div>`;
  
  root.innerHTML = html;
}

// Handle form events
function handleFormEvents() {
  const root = document.getElementById("formbuilder");
  if (!root) return;
  
  root.addEventListener("change", (e) => {
    // Save all field values
    for (const f of fields) {
      formData[f.key] = getFieldValue(f);
    }
    saveAutosave();
    
    // Handle conditional fields
    if (e.target.id === "unternehmensgroesse") {
      renderAllBlocks();
      setTimeout(() => {
        setFieldValues();
      }, 10);
    }
  });
  
  root.addEventListener("click", (e) => {
    if (e.target.id === "btn-reset") {
      if (confirm("Are you sure you want to reset the form?")) {
        localStorage.removeItem(autosaveKey);
        formData = {};
        renderAllBlocks();
        window.scrollTo({top: 0, behavior: "smooth"});
      }
    }
    
    if (e.target.id === "btn-send") {
      submitForm();
    }
  });
}

// Submit form
function submitForm() {
  // Collect all data
  for (const f of fields) {
    formData[f.key] = getFieldValue(f);
  }
  saveAutosave();
  
  // Validate privacy checkbox
  if (!formData.datenschutz) {
    alert("Please confirm that you have read the privacy notice.");
    return;
  }
  
  // Prepare data
  const data = {};
  fields.forEach(field => {
    data[field.key] = formData[field.key];
  });
  data.lang = "en";
  
  // Show success message
  const form = document.getElementById("formbuilder");
  if (form) {
    form.innerHTML = `
      <div class="fb-section">
        <h2>Thank you for your submission!</h2>
        <div class="success-msg">
          Your AI analysis is now being created.<br>
          Once finished, you will receive your individual report as a PDF by email.<br>
          You can now close this window.
        </div>
      </div>
    `;
  }
  
  // Submit to backend
  const token = getToken();
  if (!token) {
    if (form) {
      form.insertAdjacentHTML("beforeend",
        `<div class="form-error">
          Your session has expired. 
          <a href="/login.html">Please log in again</a> 
          if you want to run another analysis.
        </div>`);
    }
    return;
  }
  
  // ✅ HIER EINFÜGEN (NACH der Token-Prüfung, VOR dem BASE_URL):
  const email = getEmailFromJWT(token);
  if (email) {
    data.email = email;
    data.to = email;
    }

  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  fetch(`${BASE_URL}/briefing_async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
    keepalive: true
  }).then((res) => {
    if (res.status === 401) {
      try { 
        localStorage.removeItem("jwt"); 
      } catch(e) {}
      
      if (form) {
        form.insertAdjacentHTML("beforeend",
          `<div class="form-error">
            Your session has expired. 
            <a href="/login.html">Please log in again</a> 
            if you want to run another analysis.
          </div>`);
      }
    }
  }).catch(() => {
    // Ignore errors - email will be sent by backend
  });
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderAllBlocks();
  setTimeout(() => {
    setFieldValues();
    handleFormEvents();
  }, 100);
});