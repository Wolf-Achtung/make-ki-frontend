
function getEmailFromJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.sub || null;
  } catch (e) {
    return null;
  }
}
function isAdmin(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin";
  } catch (e) {
    return false;
  }
}

/* ============================================================================
   Helpers (validation & checkbox labels)
   ========================================================================== */

function splitLabelAndHint(raw) {
  if (!raw) return ["", ""];
  const s = String(raw).trim();
  const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return [m[1].trim(), m[2].trim()];
  const parts = s.split(/\s{2,}| — | – | - /).map(x => x.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];
  return [s, ""];
}
function findField(key){ return fields.find(f => f.key === key); }
function getFieldLabel(key){ const f = findField(key); return f?.label || key; }
function markInvalid(key, on=true){
  const el = document.getElementById(key);
  if (el){
    on ? el.classList.add('invalid') : el.classList.remove('invalid');
    const grp = el.closest('.form-group');
    if (grp) on ? grp.classList.add('invalid-group') : grp.classList.remove('invalid-group');
  }
}
function validateBlockDetailed(blockIdx){
  const block = blocks[blockIdx];
  const optional = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"]);
  const missing = [];
  block.keys.forEach(k => markInvalid(k,false));
  for (const key of block.keys){
    const f = findField(key); if (!f) continue;
    if (f.showIf && !f.showIf(formData)) continue;
    if (optional.has(key)) continue;
    const val = formData[key];
    let ok = true;
    if (f.type === "checkbox") ok = Array.isArray(val) && val.length > 0;
    else if (f.type === "privacy") ok = (val === true);
    else ok = (val !== undefined && String(val).trim() !== "");
    if (!ok){ missing.push(getFieldLabel(key)); markInvalid(key,true); }
  }
  return missing;
}
function getFeedbackBox(){
  return document.querySelector('#formbuilder .form-nav + #feedback') || document.getElementById('feedback');
}

/* ============================================================================
   Fields (english)
   ========================================================================== */

// 👉 Bitte hier deine bestehende Felddefinition einsetzen (unverändert).
// Ich habe nur die Logik drumherum angepasst. Die Felder (fields = [ ... ]) und blocks = [ ... ]
// bleiben gleich wie in deiner Originaldatei.

// --- Felder wie gehabt (aus deiner bisherigen Datei), KEINE Kürzungen! ---
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
      { value: "handel", label: "Retail & e‑commerce" },
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
      { value: "freiberufler", label: "Freelancer / self‑employed" },
      { value: "kapitalgesellschaft", label: "Single‑member corporation (GmbH/UG)" },
      { value: "einzelunternehmer", label: "Sole proprietorship (with trade licence)" },
      { value: "sonstiges", label: "Other" }
    ],
    description: "Please choose the legal form that applies to you. This way you'll get evaluations tailored to your business situation.",
    // Die Rechtsform-Auswahl soll nur angezeigt werden, wenn die Unternehmensgröße auf Solo gestellt ist.
    // Ursprünglich wurde hier auf den Wert "1" geprüft, aber die Optionswerte sind
    // "solo", "team" und "kmu". Daher prüfen wir explizit auf "solo".
    showIf: (data) => data.unternehmensgroesse === "solo"
  },
  {
    key: "bundesland",
    label: "State (regional funding opportunities)",
    type: "select",
    options: [
      { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" },
      { value: "be", label: "Berlin" }, { value: "bb", label: "Brandenburg" },
      { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
      { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" },
      { value: "ni", label: "Niedersachsen" }, { value: "nw", label: "Nordrhein-Westfalen" },
      { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
      { value: "sn", label: "Sachsen" }, { value: "st", label: "Sachsen-Anhalt" },
      { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thüringen" }
    ],
    description: "Your location determines which funding, programmes and advisory services you can make use of."
  },
  {
    key: "hauptleistung",
    label: "What's your company's main product or core service?",
    type: "textarea",
    placeholder: "e.g. social media campaigns, CNC production of individual parts, tax consulting for start‑ups",
    description: "Describe your core offering as specifically as possible. Examples help us understand your positioning and tailor recommendations."
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
      { value: "selbststaendige", label: "Self‑employed / freelancers" },
      { value: "oeffentliche_hand", label: "Public sector" },
      { value: "privatpersonen", label: "Private individuals" },
      { value: "startups", label: "Start‑ups" },
      { value: "andere", label: "Other" }
    ],
    description: "Which customer groups do you serve? Please select all target groups that apply (multiple selections possible)."
  },

  // Erweiterte Unternehmensangaben (Gold‑Standard)
  {
    key: "jahresumsatz",
    label: "Annual revenue (estimate)",
    type: "select",
    options: [
      { value: "unter_100k", label: "Up to €100,000" },
      { value: "100k_500k", label: "€100,000–500,000" },
      { value: "500k_2m", label: "€500,000–2 million" },
      { value: "2m_10m", label: "€2–10 million" },
      { value: "ueber_10m", label: "Over €10 million" },
      { value: "keine_angabe", label: "Prefer not to say" }
    ],
    description: "Please estimate your annual revenue. This classification helps with benchmarks, funding programmes and recommendations."
  },
{
  key: "it_infrastruktur",
  label: "How is your IT infrastructure currently organised?",
  type: "select",
  options: [
    { value: "cloud", label: "Cloud‑based (external services, e.g. Microsoft 365, Google Cloud…)" },
    { value: "on_premise", label: "Own data centre (on‑premises)" },
    { value: "hybrid", label: "Hybrid (cloud + own servers)" },
    { value: "unklar", label: "Unclear / not decided yet" }
  ],
  description: "Your answer helps us select suitable recommendations for security, integration and modern tools."
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
    description: "An internal competence team can accelerate processes. This information helps us recommend training and internal structures."
  },
  {
  key: "datenquellen",
  label: "Which types of data do you have available for AI projects and analyses?",
  type: "checkbox",
  options: [
    { value: "kundendaten", label: "Customer data (CRM, service, history)" },
    { value: "verkaufsdaten", label: "Sales and order data (e.g. shop, orders)" },
    { value: "produktionsdaten", label: "Production or operational data (machines, sensors, logistics)" },
    { value: "personaldaten", label: "Personnel or HR data (employees, applications, time management)" },
    { value: "marketingdaten", label: "Marketing and campaign data (ads, social media, newsletter)" },
    { value: "sonstige", label: "Other / additional data sources" }
  ],
  description: "Please select all data sources relevant to your company (multiple selections possible)."
  },

  // Block 2: Status Quo & Digitalisierungsgrad
  {
    key: "digitalisierungsgrad",
    label: "How digital are your internal processes already? (1 = analogue, 10 = fully digital)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    description: "Rate the current state: 1 = mostly paper and manual processes, 10 = everything runs digitally and automatically."
  },
  {
    key: "prozesse_papierlos",
    label: "What proportion of your processes are paperless?",
    type: "select",
    options: [
      { value: "0-20", label: "0–20 %" },
      { value: "21-50", label: "21–50 %" },
      { value: "51-80", label: "51–80 %" },
      { value: "81-100", label: "81–100 %" }
    ],
    description: "Roughly estimate: how much runs completely digital without paper files or printouts?"
  },
  {
    key: "automatisierungsgrad",
    label: "How high is the degree of automation in your workflows?",
    type: "select",
    options: [
      { value: "sehr_niedrig", label: "Very low" },
      { value: "eher_niedrig", label: "Rather low" },
      { value: "mittel", label: "Medium" },
      { value: "eher_hoch", label: "Rather high" },
      { value: "sehr_hoch", label: "Very high" }
    ],
    description: "Are many work steps still manual, or does much run automatically (e.g. through AI, scripts or smart tools)?"
  },
{
  key: "ki_einsatz",
  label: "Where is AI already being used in your company today?",
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
  description: "Where do you already use artificial intelligence or automation? Select all areas that apply."
},
  {
    key: "ki_knowhow",
    label: "How do you rate your team's internal AI know‑how?",
    type: "select",
    options: [
      { value: "keine", label: "No experience" },
      { value: "grundkenntnisse", label: "Basic knowledge" },
      { value: "mittel", label: "Medium" },
      { value: "fortgeschritten", label: "Advanced" },
      { value: "expertenwissen", label: "Expert knowledge" }
    ],
    description: "How proficient are you and your team on the topic of AI? Do you already use AI productively or do you have deeper expertise?"
  },
  // Block 3: Ziele & Projekte
  {
    key: "projektziel",
    label: "What is the main objective of your next AI/digitalisation project?",
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
    description: "What do you primarily want to achieve with your next project? Multiple selections possible."
  },
  {
    key: "ki_projekte",
    label: "Are there any ongoing or planned AI projects in your company?",
    type: "textarea",
    placeholder: "e.g. chatbot for customer enquiries, automated quote generation, text or image generators, analytics tools for sales",
    description: "Describe current or planned projects as concretely as possible. Are there already ideas, experiments or pilot projects?"
  },
  {
    key: "ki_usecases",
    label: "Which AI use cases are you particularly interested in?",
    type: "checkbox",
    options: [
      { value: "texterstellung", label: "Text generation (e.g. automated reports, posts)" },
      { value: "bildgenerierung", label: "Image generation (e.g. AI graphics, logo variants)" },
      { value: "spracherkennung", label: "Speech recognition (e.g. transcription, voice bots)" },
      { value: "prozessautomatisierung", label: "Process automation (e.g. invoice checking, sending invoices)" },
      { value: "datenanalyse", label: "Data analysis & forecasting (e.g. market trends, customer behaviour)" },
      { value: "kundensupport", label: "Customer support (e.g. chatbots, FAQ automation)" },
      { value: "wissensmanagement", label: "Knowledge management (e.g. document management, intelligent search)" },
      { value: "marketing", label: "Marketing (e.g. target group segmentation, campaign optimisation)" },
      { value: "sonstiges", label: "Other" }
    ],
    description: "Which AI application areas interest you most? Multiple selections possible."
  },
  {
    key: "ki_potenzial",
    label: "Where do you see the greatest potential for AI in your company?",
    type: "textarea",
    placeholder: "e.g. faster reporting, personalised offers, cost reduction through automation, new services ...",
    description: "Where do you see the greatest potential for AI in your company? Feel free to write freely – everything is welcome."
  },
  {
    key: "usecase_priority",
    label: "In which area should AI be introduced first?",
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
      { value: "unbekannt", label: "Still unclear / I'll decide later" }
    ],
    description: "Is there a department where AI is particularly urgently needed or offers the greatest potential?"
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "How could AI fundamentally change your business model or industry?",
    type: "textarea",
    placeholder: "e.g. automated online consultations, data‑based platform services, completely new products, …",
    description: "What changes or new possibilities do you see in the long term through AI? This is about your bigger vision – whether concrete or visionary."
  },
  {
    key: "moonshot",
    label: "What would be a bold breakthrough – your AI vision in 3 years?",
    type: "textarea",
    placeholder: "e.g. 80% of my routine tasks are taken over by AI; my turnover doubles thanks to smart automation …",
    description: "What would be your visionary AI future in 3 years? Think big."
  },

  // Block 4: Rechtliches & Förderung
  {
    key: "datenschutzbeauftragter",
    label: "Do you have a data protection officer in your company?",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" },
      { value: "teilweise", label: "Partially (external consultant / in planning)" }
    ],
    description: "A data protection officer is often mandatory – whether internal or external. What's your situation?"
  },
  {
    key: "technische_massnahmen",
    label: "Which technical data protection measures have you implemented?",
    type: "select",
    options: [
      { value: "alle", label: "All relevant measures in place (firewall, access control …)" },
      { value: "teilweise", label: "Partially in place" },
      { value: "keine", label: "None implemented yet" }
    ],
    description: "Please indicate how comprehensively you protect your data technically (firewalls, backups, access restrictions etc.)."
  },
  {
    key: "folgenabschaetzung",
    label: "Has a data protection impact assessment (DPIA) been carried out for AI applications?",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" },
      { value: "teilweise", label: "Partially (in planning)" }
    ],
    description: "For many AI applications, a so‑called 'DPIA' (data protection impact assessment) is required or recommended under the GDPR – e.g. when sensitive data, automated decisions or risks for data subjects are involved."
  },
  {
    key: "meldewege",
    label: "Are there defined reporting procedures for data protection incidents?",
    type: "select",
    options: [
      { value: "ja", label: "Yes, clear processes" },
      { value: "teilweise", label: "Partially regulated" },
      { value: "nein", label: "No" }
    ],
    description: "How do you ensure that data protection breaches are dealt with quickly and systematically?"
  },
  {
    key: "loeschregeln",
    label: "Are there clear rules for deleting or anonymising data?",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "teilweise", label: "Partially" },
      { value: "nein", label: "No" }
    ],
    description: "Do you have defined procedures for legally compliant deletion or anonymisation of information such as employee data, customer enquiries, training data, etc.? This is important for AI compliance and the GDPR."
  },
  {
    key: "ai_act_kenntnis",
    label: "How well do you know the requirements of the EU AI Act?",
    type: "select",
    options: [
      { value: "sehr_gut", label: "Very well" },
      { value: "gut", label: "Well" },
      { value: "gehört", label: "Have heard of it" },
      { value: "unbekannt", label: "Not yet looked into it" }
    ],
    description: "The EU AI Act introduces many new obligations for AI applications. How well informed do you feel?"
  },
  {
    key: "ki_hemmnisse",
    label: "What is currently hindering your company's (further) use of AI?",
    type: "checkbox",
    options: [
      { value: "rechtsunsicherheit", label: "Uncertainty about the legal situation" },
      { value: "datenschutz", label: "Data protection" },
      { value: "knowhow", label: "Lack of know‑how" },
      { value: "budget", label: "Limited budget" },
      { value: "teamakzeptanz", label: "Team acceptance" },
      { value: "zeitmangel", label: "Lack of time" },
      { value: "it_integration", label: "IT integration" },
      { value: "keine", label: "No obstacles" },
      { value: "andere", label: "Other" }
    ],
    description: "Typical hurdles include uncertainty about data protection, lack of know‑how or limited capacity. Select all points that apply to you."
  },
  {
    key: "bisherige_foerdermittel",
    label: "Have you already applied for and received funding for digitalisation or AI?",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" }
    ],
    description: "Whether national or regional funding for digitalisation, IT or AI: this information helps to suggest suitable follow‑up programmes or new options."
  },
  {
    key: "interesse_foerderung",
    label: "Would targeted funding opportunities for your projects be of interest?",
    type: "select",
    options: [
      { value: "ja", label: "Yes, please suggest suitable programmes" },
      { value: "nein", label: "No, no need" },
      { value: "unklar", label: "Unsure, please advise" }
    ],
    description: "Would you like individual recommendations for funding programmes? If interested, we filter out suitable options – with no advertising or obligation."
  },
  {
    key: "erfahrung_beratung",
    label: "Have you already received advice on digitalisation/AI?",
    type: "select",
    options: [
      { value: "ja", label: "Yes" },
      { value: "nein", label: "No" },
      { value: "unklar", label: "Unclear" }
    ],
    description: "Have you already used external advice on AI, digitalisation or IT strategy – for example through funding projects, chambers, consultants or tech partners? This experience can strengthen your starting position."
  },
  {
    key: "investitionsbudget",
    label: "What budget do you plan for AI/digitalisation next year?",
    type: "select",
    options: [
      { value: "unter_2000", label: "Under €2,000" },
      { value: "2000_10000", label: "€2,000–10,000" },
      { value: "10000_50000", label: "€10,000–50,000" },
      { value: "ueber_50000", label: "More than €50,000" },
      { value: "unklar", label: "Still unclear" }
    ],
    description: "Even small budgets can deliver progress – funding programmes can additionally help. A rough estimate is enough."
  },
  {
    key: "marktposition",
    label: "How do you assess your position in the market?",
    type: "select",
    options: [
      { value: "marktfuehrer", label: "Market leader" },
      { value: "oberes_drittel", label: "Top third" },
      { value: "mittelfeld", label: "Middle field" },
      { value: "nachzuegler", label: "Laggard / catching up" },
      { value: "unsicher", label: "Hard to assess" }
    ],
    description: "This assessment helps to better classify your results in the report – for example in terms of speed of action, budget and potentials."
  },
  {
    key: "benchmark_wettbewerb",
    label: "Do you compare your digitalisation/AI readiness with competitors?",
    type: "select",
    options: [
      { value: "ja", label: "Yes, regularly" },
      { value: "nein", label: "No" },
      { value: "selten", label: "Only rarely / informally" }
    ],
    description: "Such benchmarks help to classify your own position and identify opportunities."
  },
  {
    key: "innovationsprozess",
    label: "How do innovations arise in your company?",
    type: "select",
    options: [
      { value: "innovationsteam", label: "Through an internal innovation team" },
      { value: "mitarbeitende", label: "Through employees" },
      { value: "kunden", label: "In collaboration with customers" },
      { value: "berater", label: "With external consultants/partners" },
      { value: "zufall", label: "More by chance/unscheduled" },
      { value: "unbekannt", label: "No clear strategy" }
    ],
    description: "Whether new ideas, products or digital solutions: structured innovation paths – internal or external – make it easier to deploy AI in a targeted way and continue to develop it."
  },
  {
    key: "risikofreude",
    label: "How risk‑taking is your company when it comes to innovation? (1 = not very, 5 = very)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    description: "Are you more safety‑oriented or open to bold new paths when it comes to new ideas and innovation?"
  },

  // --- New fields for Gold‑Standard: Strategy & Governance ---
  {
    key: "strategic_goals",
    label: "What specific goals do you pursue with AI?",
    type: "textarea",
    placeholder: "e.g. increase efficiency, develop new products, improve customer service",
    description: "List your main strategic goals for using AI. This helps tailor measures precisely."
  },
  {
    key: "data_quality",
    label: "How do you rate the quality of your data?",
    type: "select",
    options: [
      { value: "high", label: "High (complete, structured, up to date)" },
      { value: "medium", label: "Medium (partly structured or incomplete)" },
      { value: "low", label: "Low (unstructured, many gaps)" }
    ],
    description: "Well‑maintained data are the basis for successful AI projects. Choose how clean and structured your data sources are."
  },
  {
    key: "ai_roadmap",
    label: "Do you already have an AI roadmap or strategy?",
    type: "select",
    options: [
      { value: "yes", label: "Yes – already implemented" },
      { value: "planning", label: "In planning" },
      { value: "no", label: "Not yet available" }
    ],
    description: "A clearly defined roadmap supports structured and targeted implementation of AI projects."
  },
  {
    key: "governance",
    label: "Are there internal guidelines for data and AI governance?",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "partial", label: "Partial" },
      { value: "no", label: "No" }
    ],
    description: "Guidelines and processes for data and AI governance promote responsible and lawful projects."
  },
  {
    key: "innovation_culture",
    label: "How open is your company to innovation and new technologies?",
    type: "select",
    options: [
      { value: "very_open", label: "Very open" },
      { value: "rather_open", label: "Rather open" },
      { value: "neutral", label: "Neutral" },
      { value: "rather_reluctant", label: "Rather reluctant" },
      { value: "very_reluctant", label: "Very reluctant" }
    ],
    description: "An innovation‑friendly company culture makes it easier to introduce new technologies like AI."
  },

  // Block 5: Datenschutz & Absenden
  {
    key: "datenschutz",
    label: "I have read the <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>privacy notice</a> and agree.",
    type: "privacy",
    description: "Please confirm that you have read the privacy notice. Your details will only be used to generate your personal evaluation."
  }
];
// --- Blockstruktur ---
const blocks = [
  {
    name: "Company information",
    keys: [
      "branche",
      "unternehmensgroesse",
      "selbststaendig",
      "bundesland",
      "hauptleistung",
      "zielgruppen",
      "jahresumsatz",
      "it_infrastruktur",
      "interne_ki_kompetenzen",
      "datenquellen"
    ]
  },
  {
    name: "Status quo",
    keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", "ki_einsatz", "ki_knowhow"]
  },
  {
    name: "Goals & projects",
    keys: ["projektziel", "ki_projekte", "ki_usecases", "ki_potenzial", "usecase_priority", "ki_geschaeftsmodell_vision", "moonshot"]
  },

  // New block for strategy and governance
  {
    name: "Strategy & Governance",
    keys: ["strategic_goals", "data_quality", "ai_roadmap", "governance", "innovation_culture"]
  },
  {
    name: "Legal & funding",
    keys: [
      "datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", "meldewege", "loeschregeln",
      "ai_act_kenntnis", "ki_hemmnisse", "bisherige_foerdermittel", "interesse_foerderung", "erfahrung_beratung",
      "investitionsbudget", "marktposition", "benchmark_wettbewerb", "innovationsprozess", "risikofreude"
    ]
  },
  {
    name: "Privacy & submit",
    keys: ["datenschutz"]
  }
];

/* ============================================================================
   State / Progress / Render
   ========================================================================== */

let currentBlock = 0;
let autosaveKey = (() => {
  try {
    const token = localStorage.getItem('jwt');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email || payload.sub;
      if (email) return `autosave_form_${email}`;
    }
  } catch (e) {}
  return 'autosave_form_test';
})();
let formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");

function showProgress(blockIdx) {
  const el = document.getElementById("progress");
  if (!el) return;
  el.innerHTML = `<div class="progress-bar">
    <div class="progress-bar-inner" style="width:${Math.round((blockIdx+1)/blocks.length*100)}%"></div>
  </div>
  <div class="progress-label">Step ${blockIdx+1} / ${blocks.length} – <b>${blocks[blockIdx].name}</b></div>`;
}

function renderBlock(blockIdx) {
  formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
  showProgress(blockIdx);
  const block = blocks[blockIdx];
  const form = document.getElementById("formbuilder");
  if (!form) return;

  form.innerHTML = block.keys.map(key => {
    const field = findField(key);
    if (!field) return "";
    if (field.showIf && !field.showIf(formData)) return "";

    const guidance = field.description
      ? `<div class="guidance${field.key === "privacy" ? " important" : ""}">${field.description}</div>`
      : "";

    let input = "";
    switch (field.type) {
      case "select": {
        const selectedValue = formData[field.key] || "";
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Please select...</option>
            ${field.options.map(opt => {
              const sel = selectedValue === opt.value ? ' selected' : '';
              return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
            }).join("")}
          </select>`;
      } break;

      case "textarea":
        input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder || ""}">${formData[field.key] || ""}</textarea>`;
        break;

      case "checkbox":
        input = `<div class="checkbox-group twocol">
          ${field.options.map(opt => {
            const [mainLabel, hint] = splitLabelAndHint(opt.label || "");
            const checked = formData[field.key]?.includes(opt.value) ? 'checked' : '';
            const hintHtml = hint ? `<div class="option-example">${hint}</div>` : "";
            return `<label class="checkbox-label">
              <input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}>
              <span>${mainLabel}</span>
              ${hintHtml}
            </label>`;
          }).join("")}
        </div>`;
        break;

      case "slider":
        input = `
          <input type="range" id="${field.key}" name="${field.key}" min="${field.min || 1}" max="${field.max || 10}" step="${field.step || 1}" value="${formData[field.key] || field.min || 1}" oninput="this.nextElementSibling.innerText=this.value"/>
          <span class="slider-value-label">${formData[field.key] || field.min || 1}</span>`;
        break;

      case "privacy":
        input = `<div class="privacy-section">
          <label>
            <input type="checkbox" id="${field.key}" name="${field.key}" ${formData[field.key] ? 'checked' : ''} required />
            ${field.label}
          </label>
        </div>`;
        break;

      default:
        input = `<input type="text" id="${field.key}" name="${field.key}" value="${formData[field.key] || ""}" />`;
    }

    const labelHtml = field.type !== "privacy" ? `<label for="${field.key}"><b>${field.label}</b></label>` : "";

    return `<div class="form-group">
      ${labelHtml}
      ${guidance}
      ${input}
    </div>`;
  }).join("");

  form.innerHTML += `
    <div class="form-nav">
      <div class="nav-left">
        ${blockIdx > 0 ? `<button type="button" id="btn-prev">Back</button>` : ""}
      </div>
      <div class="nav-right">
        ${blockIdx < blocks.length - 1
          ? `<button type="button" id="btn-next">Next</button>`
          : `<button type="button" id="btn-send" class="btn-next">Submit</button>`}
        <button type="button" id="btn-reset" class="btn-reset">Reset</button>
      </div>
    </div>
    <div id="feedback"></div>`;
}

/* ============================================================================
   Autosave / Events / Submit
   ========================================================================== */

function saveAutosave(){ localStorage.setItem(autosaveKey, JSON.stringify(formData)); }
function loadAutosave(){ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }

function getFieldValue(field) {
  switch (field.type) {
    case "checkbox":
      return Array.from(document.querySelectorAll(`input[name="${field.key}"]:checked`)).map(e => e.value);
    case "slider":
      return document.getElementById(field.key)?.value || field.min || 1;
    case "privacy":
      return document.getElementById(field.key)?.checked || false;
    default:
      return document.getElementById(field.key)?.value || "";
  }
}

function setFieldValues(blockIdx) {
  const block = blocks[blockIdx];
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
      if (el.nextElementSibling) el.nextElementSibling.innerText = val;
    } else if (field.type === "privacy") {
      el.checked = formData[key] === true;
    } else {
      if (formData[key] !== undefined) el.value = formData[key];
    }
  }
}

function handleFormEvents() {
  document.getElementById("formbuilder").addEventListener("change", () => {
    const block = blocks[currentBlock];
    let needsRerender = false;

    for (const key of block.keys) {
      const field = findField(key);
      if (!field) continue;
      const prev = formData[key];
      const curr = getFieldValue(field);
      formData[key] = curr;
      // remove error marker when user fixes the field
      markInvalid(key, false);

      if (prev !== curr && field.key === "unternehmensgroesse") needsRerender = true;
    }

    saveAutosave();

    if (needsRerender) {
      renderBlock(currentBlock);
      setTimeout(() => { setFieldValues(currentBlock); handleFormEvents(); }, 20);
    } else {
      const fb = getFeedbackBox();
      if (fb && fb.classList.contains('error')) { fb.innerHTML = ""; fb.style.display = 'none'; fb.classList.remove('error'); }
    }
  });

  document.getElementById("formbuilder").addEventListener("click", e => {
    const box = getFeedbackBox();

    if (e.target.id === "btn-next") {
      const block = blocks[currentBlock];
      for (const key of block.keys) {
        const f = findField(key);
        if (f) formData[key] = getFieldValue(f);
      }
      saveAutosave();

      const missing = validateBlockDetailed(currentBlock);
      if (missing.length) {
        if (box) {
          box.innerHTML = `<div class="form-error">Please fill in the following fields:<ul>${missing.map(m => `<li>${m}</li>`).join("")}</ul></div>`;
          box.style.display = 'block'; box.classList.add('error');
        }
        const firstInvalid = document.querySelector('.invalid, .invalid-group');
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      } else if (box) {
        box.innerHTML = ""; box.style.display = 'none'; box.classList.remove('error');
      }

      currentBlock++;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (e.target.id === "btn-prev") {
      currentBlock--; renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (e.target.id === "btn-reset") {
      localStorage.removeItem(autosaveKey);
      formData = {}; currentBlock = 0;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (e.target.id === "submit-btn" || e.target.id === "btn-send") submitAllBlocks();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderBlock(currentBlock);
  setTimeout(() => {
    setFieldValues(currentBlock);
    renderBlock(currentBlock);
    setTimeout(() => { setFieldValues(currentBlock); handleFormEvents(); }, 20);
  }, 20);
});

function submitAllBlocks() {
  const data = {}; fields.forEach(field => data[field.key] = formData[field.key]);
  data.lang = "en";

  const form = document.getElementById("formbuilder");
  if (form) {
    form.querySelectorAll("button").forEach(b => { b.disabled = true; });
    form.innerHTML = `
      <h2>Thank you for your answers!</h2>
      <div class="success-msg" style="margin-top:10px;">
        Your AI analysis is now being created.<br>
        Once finished, you will receive your individual report as a PDF by e-mail.<br>
        You can now close this window.
      </div>
    `;
  }

  const token = (function(){ try { return localStorage.getItem("jwt") || null; } catch(e){ return null; } })();
  if (!token) {
    if (form) form.insertAdjacentHTML("beforeend",
      `<div class="form-error" style="margin-top:12px">
         Your session has expired. <a href="/login.html">Please log in again</a> 
         if you want to run another analysis.
       </div>`);
    return;
  }

  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  fetch(`${BASE_URL}/briefing_async`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
    keepalive: true
  }).then((res) => {
    if (res.status === 401) {
      try { localStorage.removeItem("jwt"); } catch(e){}
      if (form) form.insertAdjacentHTML("beforeend",
        `<div class="form-error" style="margin-top:12px">
           Your session has expired. <a href="/login.html">Please log in again</a> 
           if you want to run another analysis.
         </div>`);
      return;
    }
  }).catch(() => { /* ignore */ });

  // try { localStorage.removeItem(autosaveKey); } catch(e){}
}

// === TEXT OVERLAY (EN) – Full descriptions for all fields ===
const TEXTS_EN = {
  branche: {
    label: "In which industry is your company active?",
    description: "Your main industry influences benchmarks, tool recommendations and the analysis. Please select the core business for this report."
  },
  unternehmensgroesse: {
    label: "How large is your company (number of employees)?",
    description: "The size of your company influences recommendations, funding opportunities and benchmarks."
  },
  selbststaendig: {
    label: "Legal form for a single person",
    description: "Please choose the legal form that applies to you. This way you'll get evaluations tailored to your business situation."
  },
  bundesland: {
    label: "State (regional funding opportunities)",
    description: "Your location determines which funding, programmes and advisory services you can make use of."
  },
  hauptleistung: {
    label: "What's your company's main product or core service?",
    placeholder: "e.g. social media campaigns, CNC production of individual parts, tax consulting for start-ups",
    description: "Describe your core offering as specifically as possible. Examples help us understand your positioning and tailor recommendations."
  },
  zielgruppen: {
    label: "Which target groups or customer segments do you serve?",
    description: "Which customer groups do you serve? Please select all target groups that apply (multiple selections possible)."
  },
  jahresumsatz: {
    label: "Annual revenue (estimate)",
    description: "Please estimate your annual revenue. This classification helps with benchmarks, funding programmes and recommendations."
  },
  it_infrastruktur: {
    label: "How is your IT infrastructure currently organised?",
    description: "Your answer helps us select suitable recommendations for security, integration and modern tools."
  },
  interne_ki_kompetenzen: {
    label: "Do you have an internal AI/digitalisation team?",
    description: "An internal competence team can accelerate processes. This information helps us recommend training and internal structures."
  },
  datenquellen: {
    label: "Which types of data do you have available for AI projects and analyses?",
    description: "Please select all data sources relevant to your company (multiple selections possible)."
  },
  digitalisierungsgrad: {
    label: "How digital are your internal processes already? (1 = analogue, 10 = fully digital)",
    description: "Rate the current state: 1 = mostly paper and manual processes, 10 = everything runs digitally and automatically."
  },
  prozesse_papierlos: {
    label: "What proportion of your processes are paperless?",
    description: "Roughly estimate: how much runs completely digital without paper files or printouts?"
  },
  automatisierungsgrad: {
    label: "How high is the degree of automation in your workflows?",
    description: "Are many work steps still manual, or does much run automatically (e.g. through AI, scripts or smart tools)?"
  },
  ki_einsatz: {
    label: "Where is AI already being used in your company today?",
    description: "Where do you already use artificial intelligence or automation? Select all areas that apply."
  },
  ki_knowhow: {
    label: "How do you rate your team's internal AI know-how?",
    description: "How proficient are you and your team on the topic of AI? Do you already use AI productively or do you have deeper expertise?"
  },
  projektziel: {
    label: "What is the main objective of your next AI/digitalisation project?",
    description: "What do you primarily want to achieve with your next project? Multiple selections possible."
  },
  ki_projekte: {
    label: "Are there any ongoing or planned AI projects in your company?",
    placeholder: "e.g. chatbot for customer enquiries, automated quote generation, text or image generators, analytics tools for sales",
    description: "Describe current or planned projects as concretely as possible. Are there already ideas, experiments or pilot projects?"
  },
  ki_usecases: {
    label: "Which AI use cases are you particularly interested in?",
    description: "Which AI application areas interest you most? Multiple selections possible."
  },
  ki_potenzial: {
    label: "Where do you see the greatest potential for AI in your company?",
    placeholder: "e.g. faster reporting, personalised offers, cost reduction through automation, new services ...",
    description: "Where do you see the greatest potential for AI in your company? Feel free to write freely – everything is welcome."
  },
  usecase_priority: {
    label: "In which area should AI be introduced first?",
    description: "Is there a department where AI is particularly urgently needed or offers the greatest potential?"
  },
  ki_geschaeftsmodell_vision: {
    label: "How could AI fundamentally change your business model or industry?",
    description: "What changes or new possibilities do you see in the long term through AI? This is about your bigger vision – whether concrete or visionary."
  },
  moonshot: {
    label: "What would be a bold breakthrough – your AI vision in 3 years?",
    description: "What would be your visionary AI future in 3 years? Think big."
  },
  datenschutzbeauftragter: {
    label: "Do you have a data protection officer in your company?",
    description: "A data protection officer is often mandatory – whether internal or external. What's your situation?"
  },
  technische_massnahmen: {
    label: "Which technical data protection measures have you implemented?",
    description: "Please indicate how comprehensively you protect your data technically (firewalls, backups, access restrictions etc.)."
  },
  folgenabschaetzung: {
    label: "Has a data protection impact assessment (DPIA) been carried out for AI applications?",
    description: "For many AI applications, a so-called 'DPIA' (data protection impact assessment) is required or recommended under the GDPR – e.g. when sensitive data, automated decisions or risks for data subjects are involved."
  },
  meldewege: {
    label: "Are there defined reporting procedures for data protection incidents?",
    description: "How do you ensure that data protection breaches are dealt with quickly and systematically?"
  },
  loeschregeln: {
    label: "Are there clear rules for deleting or anonymising data?",
    description: "Do you have defined procedures for legally compliant deletion or anonymisation of information such as employee data, customer enquiries, training data, etc.? This is important for AI compliance and the GDPR."
  },
  ai_act_kenntnis: {
    label: "How well do you know the requirements of the EU AI Act?",
    description: "The EU AI Act introduces many new obligations for AI applications. How well informed do you feel?"
  },
  ki_hemmnisse: {
    label: "What is currently hindering your company's (further) use of AI?",
    description: "Typical hurdles include uncertainty about data protection, lack of know-how or limited capacity. Select all points that apply to you."
  },
  bisherige_foerdermittel: {
    label: "Have you already applied for and received funding for digitalisation or AI?",
    description: "Whether national or regional funding for digitalisation, IT or AI: this information helps to suggest suitable follow-up programmes or new options."
  },
  interesse_foerderung: {
    label: "Would targeted funding opportunities for your projects be of interest?",
    description: "Would you like individual recommendations for funding programmes? If interested, we filter out suitable options – with no advertising or obligation."
  },
  erfahrung_beratung: {
    label: "Have you already received advice on digitalisation/AI?",
    description: "Have you already used external advice on AI, digitalisation or IT strategy – for example through funding projects, chambers, consultants or tech partners? This experience can strengthen your starting position."
  },
  investitionsbudget: {
    label: "What budget do you plan for AI/digitalisation next year?",
    description: "Even small budgets can deliver progress – funding programmes can additionally help. A rough estimate is enough."
  },
  marktposition: {
    label: "How do you assess your position in the market?",
    description: "This assessment helps to better classify your results in the report – for example in terms of speed of action, budget and potentials."
  },
  benchmark_wettbewerb: {
    label: "Do you compare your digitalisation/AI readiness with competitors?",
    description: "Such benchmarks help to classify your own position and identify opportunities."
  },
  innovationsprozess: {
    label: "How do innovations arise in your company?",
    description: "Whether new ideas, products or digital solutions: structured innovation paths – internal or external – make it easier to deploy AI in a targeted way and continue to develop it."
  },
  risikofreude: {
    label: "How risk-taking is your company when it comes to innovation? (1 = not very, 5 = very)",
    description: "Are you more safety-oriented or open to bold new paths when it comes to new ideas and innovation?"
  },
  datenschutz: {
    description: "Please confirm that you have read the privacy notice. Your details will only be used to generate your personal evaluation."
  }
};

function applyTexts_EN(fields) {
  for (const f of fields) {
    const t = TEXTS_EN[f.key];
    if (!t) continue;
    if (t.label) f.label = t.label;
    if (t.description) f.description = t.description;
    if (t.placeholder) f.placeholder = t.placeholder;
  }
}
applyTexts_EN(fields);
