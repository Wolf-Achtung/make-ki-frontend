// JWT check: only logged‑in users may use this form
const token = localStorage.getItem("jwt");
if (!token) {
    window.location.href = "/login.html";
}

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

let currentBlock = 0;
let formData = JSON.parse(localStorage.getItem("autosave_form") || "{}");

function showProgress(blockIdx) {
  const el = document.getElementById("progress");
  if (!el) return;
  el.innerHTML = `<div class="progress-bar">
    <div class="progress-bar-inner" style="width:${Math.round((blockIdx+1)/blocks.length*100)}%"></div>
  </div>
  <div class="progress-label">Step ${blockIdx+1} / ${blocks.length} – <b>${blocks[blockIdx].name}</b></div>`;
}

function renderBlock(blockIdx) {
  formData = JSON.parse(localStorage.getItem("autosave_form") || "{}");
  showProgress(blockIdx);
  const block = blocks[blockIdx];
  const form = document.getElementById("formbuilder");
  if (!form) return;

  form.innerHTML = block.keys.map(key => {
    const field = fields.find(f => f.key === key);
    if (!field) return "";
    if (field.showIf && !field.showIf(formData)) return "";

    // Beschreibung / Guidance
    const guidance = field.description
      ? `<div class="guidance${field.key === "datenschutz" ? " important" : ""}">${field.description}</div>`
      : "";

    // Eingabefeld erzeugen
    let input = "";
    switch (field.type) {
      case "select":
        // Beim Rendern wird der gespeicherte Wert als selected markiert, damit Auswahl nicht zurückspringt
        const selectedValue = formData[field.key] || "";
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Please select...</option>
            ${field.options
              .map(opt => {
                const isSelected = selectedValue === opt.value ? ' selected' : '';
                return `<option value="${opt.value}"${isSelected}>${opt.label}</option>`;
              })
              .join("")}
          </select>`;
        break;

      case "textarea":
        input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder || ""}">${formData[field.key] || ""}</textarea>`;
        break;

      case "checkbox":
        input = `<div class="checkbox-group twocol">
          ${field.options.map(opt => {
            const labelMatch = opt.label.match(/^([^(]+)\s*\(([^)]+)\)/);
            let mainLabel = opt.label, subText = "";
            if (labelMatch) {
            mainLabel = labelMatch[1].trim();
            subText = `<div class="option-example">${labelMatch[2].trim()}</div>`;
}
            const checked = formData[field.key]?.includes(opt.value) ? 'checked' : '';
            return `<label class="checkbox-label">
              <input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}>
              ${mainLabel}
              ${subText}
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

    // Layout: Label → Guidance → Input
    const labelHtml = field.type !== "privacy"
      ? `<label for="${field.key}"><b>${field.label}</b></label>`
      : ""; // privacy hat eigenes Label

    return `<div class="form-group">
      ${labelHtml}
      ${guidance}
      ${input}
    </div>`;
  }).join("");

  // Navigation
  form.innerHTML += `
    <div class="form-nav">
      ${blockIdx > 0 ? `<button type="button" id="btn-prev">Back</button>` : ""}
      ${blockIdx < blocks.length - 1
        ? `<button type="button" id="btn-next">Next</button>`
        : `<button type="button" id="btn-send" class="btn-next">Submit</button>`}
    </div>
    <div id="feedback"></div>`;
}

function saveAutosave() {
  localStorage.setItem("autosave_form", JSON.stringify(formData));
}
function loadAutosave() {
  formData = JSON.parse(localStorage.getItem("autosave_form") || "{}");
}

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
    const field = fields.find(f => f.key === key);
    if (!field) continue;
    const el = document.getElementById(field.key);
    if (!el) continue;
    if (field.type === "checkbox") {
      // Bei Checkboxen alle gespeicherten Werte wieder anhaken
      if (formData[key]) {
        formData[key].forEach(v => {
          const box = document.querySelector(`input[name="${field.key}"][value="${v}"]`);
          if (box) box.checked = true;
        });
      }
    } else if (field.type === "slider") {
      // Slider auf gespeicherten Wert setzen und Label aktualisieren
      const val = formData[key] ?? field.min ?? 1;
      el.value = val;
      if (el.nextElementSibling) el.nextElementSibling.innerText = val;
    } else if (field.type === "privacy") {
      // Checkbox für Datenschutzhinweis setzen
      el.checked = formData[key] === true;
    } else {
      // Für select, textarea und text inputs den gespeicherten Wert setzen
      if (formData[key] !== undefined) {
        el.value = formData[key];
      }
    }
  }
}

function blockIsValid(blockIdx) {
  const block = blocks[blockIdx];
  // Define optional keys: these fields are not mandatory and may be left blank
  const optionalKeys = new Set([
    "jahresumsatz",
    "it_infrastruktur",
    "interne_ki_kompetenzen",
    "datenquellen"
  ]);
  return block.keys.every(key => {
    const field = fields.find(f => f.key === key);
    if (!field) return true;
    // If the field is conditionally hidden, it's considered valid
    if (field.showIf && !field.showIf(formData)) return true;
    // Skip validation for optional fields
    if (optionalKeys.has(key)) return true;
    const val = formData[key];
    // Checkbox fields (except optional ones) require at least one selection
    if (field.type === "checkbox") return Array.isArray(val) && val.length > 0;
    // Privacy checkbox must be checked on the last block
    if (field.type === "privacy") return val === true;
    // Other fields must have a non-empty value
    return val !== undefined && val !== "";
  });
}

function handleFormEvents() {
document.getElementById("formbuilder").addEventListener("change", () => {
  const block = blocks[currentBlock];
  let needsRerender = false;

  for (const key of block.keys) {
    const field = fields.find(f => f.key === key);
    if (field) {
      const prev = formData[key];
      const curr = getFieldValue(field);
      formData[key] = curr;
      if (prev !== curr && field.key === "unternehmensgroesse") {
        needsRerender = true; // nur bei diesem Feld notwendig
      }
    }
  }

  saveAutosave();

  if (needsRerender) {
    renderBlock(currentBlock);
    setTimeout(() => {
    setFieldValues(currentBlock);
    handleFormEvents();
    }, 20);
  }
}); // ⬅️ ✅ HIER die schließende Klammer für den EventListener
  document.getElementById("formbuilder").addEventListener("click", e => {
    const feedback = document.getElementById("feedback");

    if (e.target.id === "btn-next") {
      if (!blockIsValid(currentBlock)) {
        feedback.innerHTML = `<div class="form-error">Please fill in all fields in this section.</div>`;
        return;
      }
      currentBlock++;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scrollt nach oben
    }

    if (e.target.id === "btn-prev") {
      currentBlock--;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scrollt nach oben
    }

    if (e.target.id === "submit-btn" || e.target.id === "btn-send") {
      submitAllBlocks(); // ✅ wird jetzt auch korrekt ausgelöst
    }
  });
}


window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderBlock(currentBlock);
  setTimeout(() => {
    setFieldValues(currentBlock);
    renderBlock(currentBlock); // ⬅️ neu!
    setTimeout(() => {
      setFieldValues(currentBlock);
      handleFormEvents();
    }, 20);
  }, 20);
});



function submitAllBlocks() {
  const data = {};
  fields.forEach(field => data[field.key] = formData[field.key]);
  // Set language explicitly to English so the backend picks the right prompts
  data.lang = "en";

  const BASE_URL = location.hostname.includes("localhost")
    ? "https://make-ki-backend-neu-production.up.railway.app"
    : "https://make-ki-backend-neu-production.up.railway.app";

  // Show status display with progress bar
  document.getElementById("formbuilder").innerHTML = `
    <div class="loading-msg">
      <div>Your entries are being analysed … please wait a moment.</div>
      <div class="progress-wrapper">
        <div id="progress-text">Analysis started…</div>
        <div class="progress-bar-container">
          <div class="progress-bar determinate" id="progress-bar" style="width: 0%"></div>
        </div>
      </div>
    </div>`;

  // Start asynchronous report generation
  fetch(`${BASE_URL}/briefing_async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(job => {
      const jobId = job.job_id;
      if (!jobId) throw new Error("No job ID returned");
      const checkStatus = () => {
        fetch(`${BASE_URL}/briefing_status/${jobId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(status => {
            // Update progress bar if progress data present
            if (typeof status.progress !== 'undefined' && typeof status.total !== 'undefined' && status.total > 0) {
              const progress = Math.min(status.progress, status.total);
              const percent = Math.floor((progress / status.total) * 100);
              const bar = document.getElementById('progress-bar');
              const text = document.getElementById('progress-text');
              if (bar) bar.style.width = `${percent}%`;
              if (text) text.textContent = `Section ${progress} of ${status.total} completed …`;
            }
            if (status.status === "completed") {
              localStorage.removeItem("autosave_form");
              showSuccess(status);
            } else if (status.status === "failed") {
              document.getElementById("formbuilder").innerHTML = `<div class="form-error">Error during analysis: ${status.error || ''}</div>`;
            } else {
              setTimeout(checkStatus, 3000);
            }
          })
          .catch(() => {
            document.getElementById("formbuilder").innerHTML = `<div class="form-error">Error during transmission. Please try again.</div>`;
          });
      };
      checkStatus();
    })
    .catch(() => {
      document.getElementById("formbuilder").innerHTML = `<div class="form-error">Error during transmission. Please try again.</div>`;
    });
}

// === formbuilder.js: Erweiterung von showSuccess() ===
function showSuccess(data) {
  const report = data?.html
    ? `<div class="report-html-preview">${data.html}</div>`
    : "";

  // Autosave aufräumen und HTML-Report lokal speichern (für spätere Nutzung, falls gewünscht)
  localStorage.removeItem("autosave_form");
  localStorage.setItem("report_html", data.html);
  // Persist the language for the report so report.html can adjust its template
  localStorage.setItem("report_lang", "en");

  // HTML-Report direkt anzeigen – ohne Redirect
  document.getElementById("formbuilder").innerHTML = `
    <h2>AI readiness analysis completed!</h2>
    <div class="success-msg">
      Great! Your information has been successfully submitted.<br>
      Your AI readiness report has been created.<br>
    </div>
    ${report}
  `;
  // ⏳ Optional: Redirect zur PDF-Seite nach kurzer Wartezeit
  setTimeout(() => {
    window.location.href = "report.html";
  }, 1000);
}
