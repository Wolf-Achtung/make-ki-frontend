
(function(){ try{
  const css = `
    :root{ --fb-blue:#123B70; --fb-blue-2:#0A2C58; --fb-bg:#F5F8FE; --fb-border:#D4DDED }
    body{ background:#F3F6FB; }
    #formbuilder{ font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;
                  font-size:18px; line-height:1.6; color:#102A43; }
    #formbuilder h1,#formbuilder h2{ color:var(--fb-blue); margin:0 0 12px 0; }
    .fb-section{ background:white; border:1px solid var(--fb-border); border-radius:12px; padding:22px 24px; margin:18px 0; }
    .fb-section-head{ font-size:20px; font-weight:700; color:var(--fb-blue-2); margin-bottom:10px; }
    .section-intro{ background:#E9F0FB; border:1px solid var(--fb-border); border-radius:10px; padding:14px 14px; margin:10px 0 16px; color:#123B70; }
    .form-group{ margin:16px 0 18px; }
    .form-group label{ display:block; font-weight:700; color:var(--fb-blue); margin-bottom:6px; }
    .guidance{ font-size:15px; color:#334E68; margin:6px 0 10px; }
    .guidance.important{ background:#FFF3CD; border:1px solid #F8E38B; border-radius:8px; padding:10px; }
    select, textarea, input[type="text"], input[type="range"]{
      width:100%; box-sizing:border-box; border:1px solid #C7D2E3; border-radius:10px; padding:12px 12px; font-size:17px; background:#FBFDFF;
    }
    textarea{ min-height:110px; resize:vertical; }
    .checkbox-group{ display:grid; grid-template-columns:repeat(2,minmax(160px,1fr)); gap:10px 18px; }
    .checkbox-label{ display:flex; gap:10px; align-items:flex-start; }
    .option-example{ font-size:13px; color:#627D98; margin-left:26px; }
    .invalid{ border-color:#D64545 !important; background:#FFF6F6 !important; }
    .invalid-group{ background:linear-gradient(0deg,rgba(214,69,69,0.06),rgba(214,69,69,0.06)) }
    .form-nav{ display:flex; align-items:center; justify-content:space-between; margin:18px 0; gap:10px }
    .btn-next{ background:linear-gradient(90deg,#1B4E9B,#377CF6); color:white; border:0; border-radius:12px; padding:12px 20px; font-size:17px; font-weight:700; }
    .btn-reset{ background:white; color:#335; border:1px solid var(--fb-border); border-radius:12px; padding:10px 16px; font-size:15px; }
    .success-msg{ background:#E6FFFA; border:1px solid #B2F5EA; border-radius:10px; padding:12px; color:#03543F; }
    .form-error{ background:#FFF5F5; border:1px solid #FEB2B2; color:#9B2C2C; border-radius:10px; padding:10px; }
    .slider-value-label{ display:inline-block; min-width:28px; text-align:center; font-weight:700; color:var(--fb-blue); margin-left:6px; }
  `;
  const s=document.createElement('style'); s.type='text/css'; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
}catch(_){}})();

// ===== Helpers =====
function findField(key){ return fields.find(f => f.key === key); }
function getFieldLabel(key){ const f = findField(key); return (f && f.label) ? f.label : key; }
function markInvalid(key, on=true){
  const el = document.getElementById(key);
  if (!el) return;
  if (on) el.classList.add('invalid'); else el.classList.remove('invalid');
  const grp = el.closest('.form-group');
  if (grp){ if (on) grp.classList.add('invalid-group'); else grp.classList.remove('invalid-group'); }
}
function getFeedbackBox(){ return document.getElementById('feedback'); }

function validateBlockDetailed(blockIdx){
  const block = blocks[blockIdx];
  const optional = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen",
                             "time_capacity","existing_tools","regulated_industry","training_interests","vision_priority"]);
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

// ===== Fields (EN) – Full =====

// Intro texts aligned with block order
const BLOCK_INTRO = [
  "We collect basic data (email, industry, size, state). This drives personalisation, benchmarks and funding/compliance notes.",
  "Current state of processes, data and prior AI usage. This calibrates quick wins and the starter roadmap.",
  "Goals & key use cases: what should AI achieve? This focuses recommendations and prioritises actions.",
  "Strategy & Governance: roles, data quality, roadmap and policies to scale safely.",
  "Resources & preferences (time, tool affinity, existing tools). We adapt suggestions to feasibility and pace.",
  "Legal & funding: GDPR/EU‑AI‑Act readiness and suitable programmes incl. deadlines.",
  "Finish & submit: quick final check, confirm consent, and launch your personalised report."
];

const fields = [
  // Block 1
  { key:"branche", label:"In which industry is your company active?", type:"select",
    options:[
      {value:"marketing",label:"Marketing & advertising"},{value:"beratung",label:"Consulting & services"},
      {value:"it",label:"IT & software"},{value:"finanzen",label:"Finance & insurance"},
      {value:"handel",label:"Retail & e‑commerce"},{value:"bildung",label:"Education"},
      {value:"verwaltung",label:"Administration"},{value:"gesundheit",label:"Health & care"},
      {value:"bau",label:"Construction & architecture"},{value:"medien",label:"Media & creative industries"},
      {value:"industrie",label:"Industry & production"},{value:"logistik",label:"Transport & logistics"}
    ]},
  { key:"unternehmensgroesse", label:"How large is your company (number of employees)?", type:"select",
    options:[ {value:"solo",label:"1 (sole proprietor / freelancer)"},{value:"team",label:"2–10 (small team)"},{value:"kmu",label:"11–100 (SME)"} ] },
  { key:"selbststaendig", label:"Legal form for a single person", type:"select",
    options:[
      {value:"freiberufler",label:"Freelancer / self‑employed"},
      {value:"kapitalgesellschaft",label:"Single‑member corporation (GmbH/UG)"},
      {value:"einzelunternehmer",label:"Sole proprietorship (with trade licence)"},
      {value:"sonstiges",label:"Other"}
    ],
    showIf:(data)=> data.unternehmensgroesse === "solo",
    description:"Choose the legal form that applies to you." },
  { key:"bundesland", label:"State (regional funding opportunities)", type:"select",
    options:[
      {value:"bw",label:"Baden‑Württemberg"},{value:"by",label:"Bayern"},{value:"be",label:"Berlin"},{value:"bb",label:"Brandenburg"},
      {value:"hb",label:"Bremen"},{value:"hh",label:"Hamburg"},{value:"he",label:"Hessen"},{value:"mv",label:"Mecklenburg‑Vorpommern"},
      {value:"ni",label:"Niedersachsen"},{value:"nw",label:"Nordrhein‑Westfalen"},{value:"rp",label:"Rheinland‑Pfalz"},{value:"sl",label:"Saarland"},
      {value:"sn",label:"Sachsen"},{value:"st",label:"Sachsen‑Anhalt"},{value:"sh",label:"Schleswig‑Holstein"},{value:"th",label:"Thüringen"}
    ]},
  { key:"hauptleistung", label:"What's your company's main product or core service?", type:"textarea",
    placeholder:"e.g. social media campaigns, CNC production of parts, tax consulting for start‑ups" },
  { key:"zielgruppen", label:"Which target groups or customer segments do you serve?", type:"checkbox",
    options:[
      {value:"b2b",label:"B2B (business customers)"},{value:"b2c",label:"B2C (consumers)"},{value:"kmu",label:"SMEs"},
      {value:"grossunternehmen",label:"Large enterprises"},{value:"selbststaendige",label:"Self‑employed / freelancers"},
      {value:"oeffentliche_hand",label:"Public sector"},{value:"privatpersonen",label:"Private individuals"},
      {value:"startups",label:"Start‑ups"},{value:"andere",label:"Other"}
    ]},

  // Extended company
  { key:"jahresumsatz", label:"Annual revenue (estimate)", type:"select",
    options:[
      {value:"unter_100k",label:"Up to €100,000"},{value:"100k_500k",label:"€100,000–500,000"},
      {value:"500k_2m",label:"€500,000–2 million"},{value:"2m_10m",label:"€2–10 million"},
      {value:"ueber_10m",label:"Over €10 million"},{value:"keine_angabe",label:"Prefer not to say"}
    ]},
  { key:"it_infrastruktur", label:"How is your IT infrastructure organised?", type:"select",
    options:[
      {value:"cloud",label:"Cloud‑based (e.g. Microsoft 365, Google Cloud)"},
      {value:"on_premise",label:"Own data centre (on‑premises)"},
      {value:"hybrid",label:"Hybrid (cloud + own servers)"},
      {value:"unklar",label:"Unclear / not decided yet"}
    ]},
  { key:"interne_ki_kompetenzen", label:"Do you have an internal AI/digitalisation team?", type:"select",
    options:[ {value:"ja",label:"Yes"},{value:"nein",label:"No"},{value:"in_planung",label:"In planning"} ] },
  { key:"datenquellen", label:"Which types of data are available?", type:"checkbox",
    options:[
      {value:"kundendaten",label:"Customer data (CRM, service, history)"},
      {value:"verkaufsdaten",label:"Sales & order data (shop, orders)"},
      {value:"produktionsdaten",label:"Production/operational data (machines, sensors, logistics)"},
      {value:"personaldaten",label:"Personnel/HR data (employees, applications, time)"},
      {value:"marketingdaten",label:"Marketing/campaign data (ads, social, newsletter)"},
      {value:"sonstige",label:"Other / additional data sources"}
    ]},

  // Block 2
  { key:"digitalisierungsgrad", label:"How digital are your internal processes? (1–10)", type:"slider", min:1, max:10, step:1 },
  { key:"prozesse_papierlos", label:"Share of paperless processes", type:"select",
    options:[ {value:"0-20",label:"0–20%"},{value:"21-50",label:"21–50%"},{value:"51-80",label:"51–80%"},{value:"81-100",label:"81–100%"} ] },
  { key:"automatisierungsgrad", label:"Degree of automation", type:"select",
    options:[ {value:"sehr_niedrig",label:"Very low"},{value:"eher_niedrig",label:"Rather low"},{value:"mittel",label:"Medium"},{value:"eher_hoch",label:"Rather high"},{value:"sehr_hoch",label:"Very high"} ] },
  { key:"ki_einsatz", label:"Where is AI already used today?", type:"checkbox",
    options:[ "marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","keine","sonstiges" ]
      .map(v => ({ value:v, label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Sales": v==="buchhaltung"?"Accounting":
        v==="produktion"?"Production": v==="kundenservice"?"Customer service": v==="it"?"IT":
        v==="forschung"?"R&D": v==="personal"?"HR": v==="keine"?"No usage yet":"Other"})) },
  { key:"ki_knowhow", label:"Internal AI know‑how", type:"select",
    options:[ {value:"keine",label:"No experience"},{value:"grundkenntnisse",label:"Basic knowledge"},{value:"mittel",label:"Medium"},{value:"fortgeschritten",label:"Advanced"},{value:"expertenwissen",label:"Expert knowledge"} ] },

  // Block 3
  { key:"projektziel", label:"Main objective of your next AI/digitalisation project", type:"checkbox",
    options:[
      {value:"prozessautomatisierung",label:"Process automation"},{value:"kostensenkung",label:"Cost reduction"},
      {value:"compliance",label:"Compliance/data protection"},{value:"produktinnovation",label:"Product innovation"},
      {value:"kundenservice",label:"Improve customer service"},{value:"markterschliessung",label:"Market expansion"},
      {value:"personalentlastung",label:"Relieve staff"},{value:"foerdermittel",label:"Apply for funding"},
      {value:"andere",label:"Other"}
    ]},
  { key:"ki_projekte", label:"Ongoing/planned AI projects", type:"textarea",
    placeholder:"e.g. chatbot, automated quote generation, generators, analytics …" },
  { key:"ki_usecases", label:"Most interesting AI use cases", type:"checkbox",
    options:[
      {value:"texterstellung",label:"Text generation (e.g. reports, posts)"},
      {value:"bildgenerierung",label:"Image generation (e.g. graphics, logo variants)"},
      {value:"spracherkennung",label:"Speech recognition (e.g. transcription, voice bots)"},
      {value:"prozessautomatisierung",label:"Process automation (e.g. invoice checks)"},
      {value:"datenanalyse",label:"Data analysis & forecasting"},
      {value:"kundensupport",label:"Customer support (chatbots, FAQ)"},
      {value:"wissensmanagement",label:"Knowledge management (DMS, intelligent search)"},
      {value:"marketing",label:"Marketing (segmentation, optimisation)"},
      {value:"sonstiges",label:"Other"}
    ]},
  { key:"ki_potenzial", label:"Where do you see the greatest potential?", type:"textarea",
    placeholder:"e.g. faster reporting, personalised offers, cost reduction, new services …" },
  { key:"usecase_priority", label:"Where should AI be introduced first?", type:"select",
    options:[ "marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","unbekannt" ]
      .map(v => ({ value:v, label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Sales": v==="buchhaltung"?"Accounting":
        v==="produktion"?"Production": v==="kundenservice"?"Customer service": v==="it"?"IT":
        v==="forschung"?"R&D": v==="personal"?"HR":"Still unclear / I'll decide later" })) },
  { key:"ki_geschaeftsmodell_vision", label:"How could AI change your business model/industry?", type:"textarea",
    placeholder:"e.g. AI‑powered portal, data‑based platform, new products …" },
  { key:"moonshot", label:"Bold breakthrough – your 3‑year AI vision", type:"textarea",
    placeholder:"e.g. 80% of routine taken over by AI; revenue +100% through automation …" },

  // Block 4 — Strategy & Governance
  { key:"strategic_goals", label:"What specific goals do you pursue with AI?", type:"textarea",
    placeholder:"e.g. increase efficiency, develop new products, improve customer service" },
  { key:"data_quality", label:"How do you rate your data quality?", type:"select",
    options:[ {value:"high",label:"High (complete, structured, up to date)"},{value:"medium",label:"Medium (partly structured/incomplete)"},{value:"low",label:"Low (unstructured, many gaps)"} ] },
  { key:"ai_roadmap", label:"Do you have an AI roadmap/strategy?", type:"select",
    options:[ {value:"yes",label:"Yes – already implemented"},{value:"planning",label:"In planning"},{value:"no",label:"Not yet available"} ] },
  { key:"governance", label:"Internal guidelines for data/AI governance?", type:"select",
    options:[ {value:"yes",label:"Yes"},{value:"partial",label:"Partial"},{value:"no",label:"No"} ] },
  { key:"innovation_culture", label:"How open is your company to innovation?", type:"select",
    options:[ {value:"very_open",label:"Very open"},{value:"rather_open",label:"Rather open"},
             {value:"neutral",label:"Neutral"},{value:"rather_reluctant",label:"Rather reluctant"},{value:"very_reluctant",label:"Very reluctant"} ] },

  // Block 5 — Resources & preferences
  { key:"time_capacity", label:"Time per week for AI projects", type:"select",
    options:[ {value:"under_2",label:"Under 2 hours"},{value:"2_5",label:"2–5 hours"},{value:"5_10",label:"5–10 hours"},{value:"over_10",label:"More than 10 hours"} ] },
  { key:"existing_tools", label:"Which systems/tools do you already use?", type:"checkbox",
    options:[
      {value:"crm",label:"CRM systems (e.g. HubSpot, Salesforce)"},{value:"erp",label:"ERP systems (e.g. SAP, Odoo)"},
      {value:"project_management",label:"Project management (e.g. Asana, Trello)"},
      {value:"marketing_automation",label:"Marketing automation (e.g. Mailchimp, HubSpot)"},
      {value:"accounting",label:"Accounting (e.g. Xero, Lexware)"},{value:"none",label:"None / other"}
    ]},
  { key:"regulated_industry", label:"Regulated industry?", type:"checkbox",
    options:[
      {value:"healthcare",label:"Health & medicine"},{value:"finance",label:"Finance & insurance"},
      {value:"public",label:"Public sector"},{value:"legal",label:"Legal services"},{value:"none",label:"None of these"}
    ]},
  { key:"training_interests", label:"Training topics of interest", type:"checkbox",
    options:[
      {value:"prompt_engineering",label:"Prompt engineering"},{value:"llm_basics",label:"LLM basics"},
      {value:"data_quality_governance",label:"Data quality & governance"},
      {value:"automation_scripts",label:"Automation & scripts"},{value:"ethics_regulation",label:"Ethics & legal"},
      {value:"none",label:"None / not sure"}
    ]},
  { key:"vision_priority", label:"Which aspect of your vision matters most?", type:"select",
    options:[
      {value:"gpt_services",label:"GPT‑based services for SMEs"},{value:"customer_service",label:"Improve customer service"},
      {value:"data_products",label:"New data‑driven products"},{value:"process_automation",label:"Automate processes"},
      {value:"market_leadership",label:"Achieve market leadership"},{value:"unspecified",label:"No preference / unsure"}
    ]},

  // Block 6 — Legal & funding
  { key:"datenschutzbeauftragter", label:"Do you have a data protection officer?", type:"select",
    options:[ {value:"ja",label:"Yes"},{value:"nein",label:"No"},{value:"teilweise",label:"Partially (external / planning)"} ] },
  { key:"technische_massnahmen", label:"Technical data protection measures", type:"select",
    options:[ {value:"alle",label:"All relevant measures"},{value:"teilweise",label:"Partially in place"},{value:"keine",label:"None yet"} ] },
  { key:"folgenabschaetzung", label:"DPIA carried out for AI uses?", type:"select",
    options:[ {value:"ja",label:"Yes"},{value:"nein",label:"No"},{value:"teilweise",label:"Partially"} ] },
  { key:"meldewege", label:"Defined reporting procedures for incidents?", type:"select",
    options:[ {value:"ja",label:"Yes, clear processes"},{value:"teilweise",label:"Partially regulated"},{value:"nein",label:"No"} ] },
  { key:"loeschregeln", label:"Rules for deletion/anonymisation?", type:"select",
    options:[ {value:"ja",label:"Yes"},{value:"teilweise",label:"Partially"},{value:"nein",label:"No"} ] },
  { key:"ai_act_kenntnis", label:"How well do you know the EU AI Act?", type:"select",
    options:[ {value:"sehr_gut",label:"Very well"},{value:"gut",label:"Well"},{value:"gehört",label:"Have heard of it"},{value:"unbekannt",label:"Not yet looked into it"} ] },
  { key:"ki_hemmnisse", label:"What is currently hindering AI usage?", type:"checkbox",
    options:[
      {value:"rechtsunsicherheit",label:"Uncertainty about legal situation"},{value:"datenschutz",label:"Data protection"},
      {value:"knowhow",label:"Lack of know‑how"},{value:"budget",label:"Limited budget"},
      {value:"teamakzeptanz",label:"Team acceptance"},{value:"zeitmangel",label:"Lack of time"},
      {value:"it_integration",label:"IT integration"},{value:"keine",label:"No obstacles"},{value:"andere",label:"Other"}
    ]},
  { key:"bisherige_foerdermittel", label:"Have you already received funding?", type:"select", options:[ {value:"ja",label:"Yes"},{value:"nein",label:"No"} ] },
  { key:"interesse_foerderung", label:"Would targeted funding be of interest?", type:"select", options:[ {value:"ja",label:"Yes, please suggest"},{value:"nein",label:"No"},{value:"unklar",label:"Unsure, please advise"} ] },
  { key:"erfahrung_beratung", label:"Advice on digitalisation/AI before?", type:"select", options:[ {value:"ja",label:"Yes"},{value:"nein",label:"No"},{value:"unklar",label:"Unclear"} ] },
  { key:"investitionsbudget", label:"Budget planned for next year", type:"select",
    options:[ {value:"unter_2000",label:"Under €2,000"},{value:"2000_10000",label:"€2,000–10,000"},{value:"10000_50000",label:"€10,000–50,000"},{value:"ueber_50000",label:"More than €50,000"},{value:"unklar",label:"Still unclear"} ] },
  { key:"marktposition", label:"Market position", type:"select",
    options:[ {value:"marktfuehrer",label:"Market leader"},{value:"oberes_drittel",label:"Top third"},{value:"mittelfeld",label:"Middle field"},{value:"nachzuegler",label:"Laggard / catching up"},{value:"unsicher",label:"Hard to assess"} ] },
  { key:"benchmark_wettbewerb", label:"Do you benchmark vs. competitors?", type:"select", options:[ {value:"ja",label:"Yes, regularly"},{value:"nein",label:"No"},{value:"selten",label:"Only rarely / informally"} ] },
  { key:"innovationsprozess", label:"How do innovations arise?", type:"select",
    options:[ {value:"innovationsteam",label:"Internal innovation team"},{value:"mitarbeitende",label:"Through employees"},{value:"kunden",label:"With customers"},{value:"berater",label:"With external partners"},{value:"zufall",label:"More by chance/unscheduled"},{value:"unbekannt",label:"No clear strategy"} ] },
  { key:"risikofreude", label:"Risk appetite (1–5)", type:"slider", min:1, max:5, step:1 },

  // Block 7 — Privacy & submit
  { key:"datenschutz", type:"privacy",
    label:"I have read the <a href='privacy.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>privacy notice</a> and agree.",
    description:"Your details will only be used to generate your personal evaluation." }
];

const blocks = [
  { name:"Company information", keys:["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
  { name:"Status quo", keys:["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
  { name:"Goals & projects", keys:["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
  { name:"Strategy & Governance", keys:["strategic_goals","data_quality","ai_roadmap","governance","innovation_culture"] },
  { name:"Resources & preferences", keys:["time_capacity","existing_tools","regulated_industry","training_interests","vision_priority"] },
  { name:"Legal & funding", keys:["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
  { name:"Privacy & submit", keys:["datenschutz"] }
];

// ===== State =====
let formData = {};
let autosaveKey = 'autosave_form_test';
try{
  const token = localStorage.getItem('jwt');
  if (token){
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email || payload.sub;
    if (email) autosaveKey = `autosave_form_${email}`;
  }
}catch(_){}
try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }catch(_){ formData = {}; }

function saveAutosave(){ try{ localStorage.setItem(autosaveKey, JSON.stringify(formData)); }catch(_){} }
function getFieldValue(field){
  switch(field.type){
    case "checkbox":
      return Array.from(document.querySelectorAll(`input[name="${field.key}"]:checked`)).map(e => e.value);
    case "slider":
      return document.getElementById(field.key)?.value || field.min || 1;
    case "privacy":
      return !!document.getElementById(field.key)?.checked;
    default:
      return document.getElementById(field.key)?.value || "";
  }
}

// ===== Renderer =====
function renderAllBlocks(){
  try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }catch(_){}
  const root = document.getElementById("formbuilder"); if (!root) return;
  let html = "";
  for (let i=0;i<blocks.length;i++){
    const block = blocks[i];
    html += `<section class="fb-section"><div class="fb-section-head"><span class="fb-step">Step ${i+1}/${blocks.length}</span> – <b>${block.name}</b></div>`;
    const intro = BLOCK_INTRO[i] || "";
    if (intro) html += `<div class="section-intro">${intro}</div>`;
    html += block.keys.map(key => {
      const field = findField(key); if (!field) return "";
      if (field.showIf && !field.showIf(formData)) return "";
      const guidance = field.description ? `<div class="guidance${field.type==="privacy"?" important":""}">${field.description}</div>` : "";
      let input = "";
      switch(field.type){
        case "select": {
          const selectedValue = formData[field.key] || "";
          input = `<select id="${field.key}" name="${field.key}"><option value="">Please select...</option>` +
            (field.options||[]).map(opt => {
              const sel = selectedValue === opt.value ? ' selected' : '';
              return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
            }).join("") + `</select>`;
          break;
        }
        case "textarea": {
          input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder||""}">${formData[field.key]||""}</textarea>`;
          break;
        }
        case "checkbox": {
          input = `<div class="checkbox-group twocol">` +
            (field.options||[]).map(opt => {
              const label = opt.label || "";
              const m = label.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
              const mainLabel = m ? m[1].trim() : label;
              const hint = m ? m[2].trim() : "";
              const checked = (formData[field.key]||[]).includes(opt.value) ? 'checked' : '';
              const hintHtml = hint ? `<div class="option-example">${hint}</div>` : "";
              return `<label class="checkbox-label"><input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}><span>${mainLabel}</span>${hintHtml}</label>`;
            }).join("") + `</div>`;
          break;
        }
        case "slider": {
          const v = formData[field.key] ?? field.min ?? 1;
          input = `<input type="range" id="${field.key}" name="${field.key}" min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" value="${v}" oninput="this.nextElementSibling.innerText=this.value"/> <span class="slider-value-label">${v}</span>`;
          break;
        }
        case "privacy": {
          const chk = formData[field.key] ? 'checked' : '';
          input = `<div class="privacy-section"><label><input type="checkbox" id="${field.key}" name="${field.key}" ${chk} required/> ${field.label}</label></div>`;
          break;
        }
        default: {
          input = `<input type="text" id="${field.key}" name="${field.key}" value="${formData[field.key]||""}" />`;
        }
      }
      const labelHtml = field.type!=="privacy" ? `<label for="${field.key}"><b>${field.label}</b></label>` : "";
      return `<div class="form-group">${labelHtml}${guidance}${input}</div>`;
    }).join("");
    html += `</section>`;
  }
  html += `<div class="form-nav">
      <div class="nav-left"></div>
      <div class="nav-right">
        <button type="button" id="btn-send" class="btn-next">Submit</button>
        <button type="button" id="btn-reset" class="btn-reset">Reset</button>
      </div>
    </div><div id="feedback"></div>`;
  root.innerHTML = html;
}

// ===== Events =====
function handleFormEvents(){
  const root = document.getElementById("formbuilder"); if (!root) return;
  root.addEventListener("change", (e) => {
    const target = e.target;
    const f = fields.find(x => x.key === target.id || (target.name && x.key === target.name));
    if (f){
      formData[f.key] = getFieldValue(f);
      markInvalid(f.key, false);
      saveAutosave();
      if (f.key === "unternehmensgroesse"){ renderAllBlocks(); setTimeout(handleFormEvents, 20); }
    } else {
      for (const fx of fields){ formData[fx.key] = getFieldValue(fx); }
      saveAutosave();
    }
  });
  root.addEventListener("click", (e) => {
    if (e.target.id === "btn-reset"){
      try{ localStorage.removeItem(autosaveKey); }catch(_){}
      formData = {}; renderAllBlocks(); setTimeout(handleFormEvents, 20);
      window.scrollTo({ top:0, behavior:"smooth" });
    }
    if (e.target.id === "btn-send"){
      submitAll();
    }
  });
}

function submitAll(){
  for (const f of fields){ formData[f.key] = getFieldValue(f); }
  saveAutosave();

  const missing = [];
  for (let i=0;i<blocks.length;i++){
    const m = validateBlockDetailed(i);
    if (m.length) missing.push(...m);
  }
  const fb = getFeedbackBox();
  if (missing.length && fb){
    fb.innerHTML = `<div class="form-error">Please fill in the following fields:<ul>${missing.map(m=>`<li>${m}</li>`).join("")}</ul></div>`;
    fb.style.display = 'block';
    const firstInvalid = document.querySelector('.invalid, .invalid-group');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  } else if (fb){ fb.innerHTML = ""; fb.style.display = 'none'; }

  const form = document.getElementById("formbuilder");
  if (form){
    form.querySelectorAll("button").forEach(b => b.disabled = true);
    form.innerHTML = `<h2>Thank you for your answers!</h2>
      <div class="success-msg" style="margin-top:10px;">
        Your AI analysis is now being created.<br>
        Once finished, you will receive your individual report as a PDF by e‑mail.<br>
        You can now close this window.
      </div>`;
  }

  let token = null; try{ token = localStorage.getItem("jwt") || null; }catch(_){}
  if (!token){
    if (form) form.insertAdjacentHTML("beforeend",
      `<div class="form-error" style="margin-top:12px">
        Your session has expired. <a href="/login.html">Please log in again</a>
        if you want to run another analysis.
       </div>`);
    return;
  }
  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  const data = {}; fields.forEach(f => data[f.key] = formData[f.key]); data.lang = "en";
  try{
    fetch(`${BASE_URL}/briefing_async`, {
      method:"POST",
      headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
      body: JSON.stringify(data),
      keepalive: true
    }).then(res => {
      if (res.status === 401){
        try{ localStorage.removeItem("jwt"); }catch(_){}
        if (form) form.insertAdjacentHTML("beforeend",
          `<div class="form-error" style="margin-top:12px">
            Your session has expired. <a href="/login.html">Please log in again</a>.
           </div>`);
      }
    }).catch(()=>{});
  }catch(_){}
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  renderAllBlocks();
  setTimeout(handleFormEvents, 20);
});
