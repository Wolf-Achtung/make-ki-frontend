<script>
// ===============================================================
// AI Checkup Report – Formbuilder (EN)  —  SINGLE-PAGE, FULL BUILD
// Stand: 2025-09-25  —  Spacious layout, larger type, rich help texts
// ===============================================================

/* Design (CSS injection – mirrors DE) */
(function () {
  try {
    const css = document.getElementById('fb-style') ? '' : `
:root{
  --fb-font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans";
  --fb-fg: #123B70; --fb-accent: #0E4AA1; --fb-muted:#5A6B84;
  --fb-bg:#F4F7FB; --fb-card:#fff; --fb-border:#E2E8F4; --fb-border-strong:#D4DDED; --fb-badge:#E9F0FB;
  --fb-error-bg:#FDECEA; --fb-error-border:#F6C7C3; --fb-error:#B52B27;
  --fb-ok-bg:#EAF7EA; --fb-ok-border:#C9E7C9; --fb-ok:#2F6B2F;
}
body{ background:var(--fb-bg); }
#formbuilder{ font-family:var(--fb-font); color:var(--fb-fg); max-width:980px; margin:24px auto 80px; padding:0 16px; }
.fb-section{ background:var(--fb-card); border:1px solid var(--fb-border); border-radius:16px; padding:24px 24px 8px; margin:20px 0 32px; box-shadow:0 1px 2px rgba(18,59,112,.04); }
.fb-section-head{ font-size:1.22rem; margin-bottom:16px; color:var(--fb-accent); font-weight:600; }
.fb-step{ font-weight:700; background:var(--fb-badge); padding:4px 10px; border-radius:999px; margin-right:8px; }
.section-intro{ background:var(--fb-badge); border:1px solid var(--fb-border-strong); border-radius:10px; padding:12px 14px; margin:8px 0 14px; color:var(--fb-fg); }
label{ display:block; font-size:1.08rem; margin:12px 0 6px; }
.guidance{ color:var(--fb-muted); font-size:1rem; line-height:1.5; margin:0 0 12px; }
.form-group{ margin:22px 0 22px; }
input[type=text], select, textarea{ font-size:1.06rem; width:100%; box-sizing:border-box; border:1px solid var(--fb-border-strong); border-radius:12px; padding:12px 14px; background:#fff; }
textarea{ min-height:128px; line-height:1.45; }
input[type=range]{ width:100%; }
.checkbox-group{ display:grid; grid-template-columns:1fr; gap:12px 16px; }
.checkbox-group.twocol{ grid-template-columns:1fr 1fr; }
.checkbox-label{ display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border:1px solid #E6EDF8; border-radius:12px; background:#FAFCFF; }
.checkbox-label input{ margin-top:6px; }
.option-example{ font-size:.95rem; color:var(--fb-muted); }
.progress-bar{ height:10px; background:#E2E9F6; border-radius:999px; overflow:hidden; }
.progress-bar-inner{ height:100%; background:linear-gradient(90deg, #0E4AA1, #2C6CD1); }
.progress-label{ font-size:.95rem; color:var(--fb-muted); margin-top:8px; }
.form-nav{ display:flex; justify-content:space-between; align-items:center; margin-top:18px; padding:16px 0 8px; }
.btn-next{ background:linear-gradient(135deg,#0E4AA1,#2C6CD1); color:#fff; border:0; padding:14px 20px; border-radius:12px; font-size:1rem; cursor:pointer; }
.btn-reset{ color:var(--fb-accent); background:transparent; border:0; padding:12px 16px; font-size:.95rem; cursor:pointer; }
.invalid{ border-color:#D9534F!important; }
.invalid-group select, .invalid-group textarea, .invalid-group input[type=text]{ border-color:#D9534F!important; }
.form-error{ background:var(--fb-error-bg); color:var(--fb-error); border:1px solid var(--fb-error-border); padding:12px 14px; border-radius:12px; }
.success-msg{ background:var(--fb-ok-bg); color:var(--fb-ok); border:1px solid var(--fb-ok-border); padding:14px 16px; border-radius:12px; }
.privacy-section label{ display:flex; gap:10px; align-items:flex-start; }
@media (max-width:780px){ #formbuilder{ padding:0 12px; } .checkbox-group.twocol{ grid-template-columns:1fr; } }
`;
    if (css) { const s=document.createElement('style'); s.id='fb-style'; s.appendChild(document.createTextNode(css)); document.head.appendChild(s); }
  } catch (_) {}
})();

/* JWT helpers (same behaviour as DE) */
function getToken(){ try { return localStorage.getItem("jwt") || null; } catch(e){ return null; } }
function showSessionHint(){
  const el = document.getElementById("formbuilder"); if (!el) return;
  el.insertAdjacentHTML("beforeend",
    `<div class="form-error" style="margin-top:12px">
       Your session has expired. <a href="/login.html">Please log in again</a> if you want to run another analysis.
     </div>`);
}
function getEmailFromJWT(t){ try{ const p=JSON.parse(atob(t.split(".")[1])); return p.email||p.sub||null; }catch(_){ return null; } }
function isAdmin(t){ try{ const p=JSON.parse(atob(t.split(".")[1])); return p.role==="admin"; }catch(_){ return false; } }

/* Helpers */
function splitLabelAndHint(raw){
  if (!raw) return ["",""];
  const s=String(raw).trim(); const m=s.match(/^(.+?)\\s*\\(([^)]+)\\)\\s*$/);
  if (m) return [m[1].trim(), m[2].trim()];
  const parts=s.split(/\\s{2,}| — | – | - /).map(x=>x.trim()).filter(Boolean);
  if (parts.length>=2) return [parts[0], parts.slice(1).join(" ")];
  return [s,""];
}
function findField(key){ return fields.find(f=>f.key===key); }
function getFieldLabel(key){ const f=findField(key); return (f&&f.label)?f.label:key; }
function markInvalid(key, on=true){
  const el=document.getElementById(key); if (!el) return;
  if (on) el.classList.add('invalid'); else el.classList.remove('invalid');
  const grp=el.closest('.form-group'); if (grp){ if (on) grp.classList.add('invalid-group'); else grp.classList.remove('invalid-group'); }
}
function validateBlockDetailed(blockIdx){
  const block=blocks[blockIdx];
  const optional=new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen","time_capacity","existing_tools","regulated_industry","training_interests","vision_priority"]);
  const missing=[]; block.keys.forEach(k=>markInvalid(k,false));
  for (const key of block.keys){
    const f=findField(key); if (!f) continue;
    if (f.showIf && !f.showIf(formData)) continue;
    if (optional.has(key)) continue;
    const val=formData[key]; let ok=true;
    if (f.type==="checkbox") ok=Array.isArray(val)&&val.length>0;
    else if (f.type==="privacy") ok=(val===true);
    else ok=(val!==undefined && String(val).trim()!=="");
    if (!ok){ missing.push(getFieldLabel(key)); markInvalid(key,true); }
  }
  return missing;
}
function getFeedbackBox(){ return document.querySelector('#formbuilder .form-nav + #feedback') || document.getElementById('feedback'); }

/* Intros for sections */
const BLOCK_INTRO = [
  "We collect basic data (email, industry, size, state). This drives personalisation and relevant funding/compliance notes.",
  "Current state of processes, data and prior AI usage. This calibrates quick wins and the starter roadmap.",
  "Goals & key use cases: what should AI achieve? This focuses recommendations and prioritises actions.",
  "Resources & preferences (time, tool affinity, existing tools). We adapt suggestions to feasibility and pace.",
  "Legal & privacy (opt‑in): Required for safe delivery and GDPR/EU‑AI‑Act‑aligned processing.",
  "Project priorities & roadmap hints: indicate what should come first — it directly shapes the roadmap.",
  "Finish & submit: final check, confirm consent and launch your personalised report."
];

/* Fields (EN) – deckungsgleich zu DE, nur Texte/Labels in EN */
const fields = [
  // Company information
  { key:"branche", label:"In which industry is your company active?", type:"select",
    options:[
      {value:"marketing",label:"Marketing & advertising"}, {value:"beratung",label:"Consulting & services"},
      {value:"it",label:"IT & software"}, {value:"finanzen",label:"Finance & insurance"},
      {value:"handel",label:"Retail & e‑commerce"}, {value:"bildung",label:"Education"},
      {value:"verwaltung",label:"Administration"}, {value:"gesundheit",label:"Health & care"},
      {value:"bau",label:"Construction & architecture"}, {value:"medien",label:"Media & creative industries"},
      {value:"industrie",label:"Industry & production"}, {value:"logistik",label:"Transport & logistics"}
    ],
    description:"Your main industry influences benchmarks, tool recommendations and the analysis. Please select the core business you want your report to focus on."
  },
  { key:"unternehmensgroesse", label:"How large is your company (employees)?", type:"select",
    options:[{value:"solo",label:"1 (sole proprietor / freelancer)"},{value:"team",label:"2–10 (small team)"},{value:"kmu",label:"11–100 (SME)"}],
    description:"Company size affects recommendations, funding opportunities and benchmarks."
  },
  { key:"selbststaendig", label:"Legal form for a single person", type:"select",
    options:[
      {value:"freiberufler",label:"Freelancer / self‑employed"},
      {value:"kapitalgesellschaft",label:"Single‑member corporation (GmbH/UG)"},
      {value:"einzelunternehmer",label:"Sole proprietorship (with trade licence)"},
      {value:"sonstiges",label:"Other"}
    ],
    description:"Choose the legal form that applies to you.",
    showIf:(data)=>data.unternehmensgroesse==="solo"
  },
  { key:"bundesland", label:"State (regional funding opportunities)", type:"select",
    options:[
      {value:"bw",label:"Baden‑Württemberg"},{value:"by",label:"Bayern"},{value:"be",label:"Berlin"},{value:"bb",label:"Brandenburg"},
      {value:"hb",label:"Bremen"},{value:"hh",label:"Hamburg"},{value:"he",label:"Hessen"},{value:"mv",label:"Mecklenburg‑Vorpommern"},
      {value:"ni",label:"Niedersachsen"},{value:"nw",label:"Nordrhein‑Westfalen"},{value:"rp",label:"Rheinland‑Pfalz"},{value:"sl",label:"Saarland"},
      {value:"sn",label:"Sachsen"},{value:"st",label:"Sachsen‑Anhalt"},{value:"sh",label:"Schleswig‑Holstein"},{value:"th",label:"Thüringen"}
    ],
    description:"Your location determines relevant programmes and advisory services."
  },
  { key:"hauptleistung", label:"Main product / core service", type:"textarea",
    placeholder:"e.g. social media campaigns, CNC production, tax consulting for start‑ups",
    description:"Describe your core offering as specifically as possible."
  },
  { key:"zielgruppen", label:"Target groups you serve", type:"checkbox",
    options:[
      {value:"b2b",label:"B2B (business customers)"},{value:"b2c",label:"B2C (consumers)"},
      {value:"kmu",label:"SMEs"},{value:"grossunternehmen",label:"Large enterprises"},
      {value:"selbststaendige",label:"Self‑employed / freelancers"},
      {value:"oeffentliche_hand",label:"Public sector"},
      {value:"privatpersonen",label:"Private individuals"},
      {value:"startups",label:"Start‑ups"},{value:"andere",label:"Other"}
    ],
    description:"Select all that apply (multiple selection possible)."
  },

  // Status quo
  { key:"digitalisierungsgrad", label:"How digital are your processes? (1–10)", type:"slider", min:1, max:10, step:1,
    description:"1 = mostly manual/paper, 10 = fully digital & automated." },
  { key:"prozesse_papierlos", label:"Share of paperless processes", type:"select",
    options:[{value:"0-20",label:"0–20%"},{value:"21-50",label:"21–50%"},{value:"51-80",label:"51–80%"},{value:"81-100",label:"81–100%"}],
    description:"Rough estimate is enough."
  },
  { key:"automatisierungsgrad", label:"Degree of automation", type:"select",
    options:[{value:"sehr_niedrig",label:"Very low"},{value:"eher_niedrig",label:"Rather low"},{value:"mittel",label:"Medium"},{value:"eher_hoch",label:"Rather high"},{value:"sehr_hoch",label:"Very high"}],
    description:"Manual work vs. automation (AI/scripts/tools)."
  },
  { key:"ki_einsatz", label:"Where is AI already used?", type:"checkbox",
    options:["marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","keine","sonstiges"]
      .map(v=>({value:v,label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Sales": v==="buchhaltung"?"Accounting":
        v==="produktion"?"Production": v==="kundenservice"?"Customer service": v==="it"?"IT":
        v==="forschung"?"R&D": v==="personal"?"HR": v==="keine"?"No usage yet":"Other"})),
    description:"Tick all applicable areas."
  },
  { key:"ki_knowhow", label:"Internal AI know‑how", type:"select",
    options:[{value:"keine",label:"None"},{value:"grundkenntnisse",label:"Basic"},{value:"mittel",label:"Medium"},{value:"fortgeschritten",label:"Advanced"},{value:"expertenwissen",label:"Expert"}],
    description:"Self‑assessment is sufficient."
  },

  // Goals & projects
  { key:"projektziel", label:"Primary objective of your next AI/digital project", type:"checkbox",
    options:[
      {value:"prozessautomatisierung",label:"Process automation"},
      {value:"kostensenkung",label:"Cost reduction"},
      {value:"compliance",label:"Compliance/data protection"},
      {value:"produktinnovation",label:"Product innovation"},
      {value:"kundenservice",label:"Improve customer service"},
      {value:"markterschliessung",label:"Market expansion"},
      {value:"personalentlastung",label:"Relieve staff"},
      {value:"foerdermittel",label:"Apply for funding"},
      {value:"andere",label:"Other"}
    ],
    description:"Multiple selections possible."
  },
  { key:"ki_projekte", label:"Ongoing/planned AI projects", type:"textarea",
    placeholder:"e.g. chatbot, automated quotes, generators, analytics …",
    description:"Please describe as concretely as possible (pilot/idea/planning)."
  },
  { key:"ki_usecases", label:"AI use cases of interest", type:"checkbox",
    options:[
      {value:"texterstellung",label:"Text generation"}, {value:"bildgenerierung",label:"Image generation"},
      {value:"spracherkennung",label:"Speech recognition"}, {value:"prozessautomatisierung",label:"Process automation"},
      {value:"datenanalyse",label:"Data analysis & forecasting"}, {value:"kundensupport",label:"Customer support"},
      {value:"wissensmanagement",label:"Knowledge management"}, {value:"marketing",label:"Marketing"},
      {value:"sonstiges",label:"Other"}
    ],
    description:"Multiple selections possible."
  },
  { key:"ki_potenzial", label:"Greatest AI potential", type:"textarea",
    placeholder:"e.g. reporting, personalised offers, automation, new services …",
    description:"Free text – bullet points welcome."
  },
  { key:"usecase_priority", label:"Area with highest priority", type:"select",
    options:["marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","unbekannt"]
      .map(v=>({value:v,label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Sales": v==="buchhaltung"?"Accounting":
        v==="produktion"?"Production": v==="kundenservice"?"Customer service": v==="it"?"IT":
        v==="forschung"?"R&D": v==="personal"?"HR":"Undecided yet"})),
    description:"Where does it make most sense to start?"
  },
  { key:"ki_geschaeftsmodell_vision", label:"How could AI change your business model/industry?", type:"textarea",
    placeholder:"e.g. AI‑assisted portal, data‑driven platform, new products …",
    description:"Be visionary, but keep feasibility in mind."
  },
  { key:"moonshot", label:"Bold breakthrough – 3‑year vision", type:"textarea",
    placeholder:"e.g. AI handles 80% of routine; revenue +100% via smart automation …",
    description:"A short, inspiring vision."
  },

  // Strategy & Governance
  { key:"strategic_goals", label:"What specific goals do you pursue with AI?", type:"textarea",
    placeholder:"e.g. improve efficiency, create new products, better service",
    description:"List the main strategic goals."
  },
  { key:"data_quality", label:"Quality of your data", type:"select",
    options:[{value:"high",label:"High (complete, structured, current)"},{value:"medium",label:"Medium (partly structured/gaps)"},{value:"low",label:"Low (unstructured, many gaps)"}],
    description:"Well‑maintained data is the foundation of successful AI projects."
  },
  { key:"ai_roadmap", label:"AI roadmap or strategy available?", type:"select",
    options:[{value:"yes",label:"Yes – implemented"},{value:"planning",label:"In planning"},{value:"no",label:"Not yet"}],
    description:"A clear roadmap eases implementation."
  },
  { key:"governance", label:"Internal data/AI governance guidelines?", type:"select",
    options:[{value:"yes",label:"Yes"},{value:"partial",label:"Partial"},{value:"no",label:"No"}],
    description:"Governance promotes responsible, lawful projects."
  },
  { key:"innovation_culture", label:"How open is your company to innovation?", type:"select",
    options:[{value:"very_open",label:"Very open"},{value:"rather_open",label:"Rather open"},{value:"neutral",label:"Neutral"},{value:"rather_reluctant",label:"Rather reluctant"},{value:"very_reluctant",label:"Very reluctant"}],
    description:"Openness makes introducing new tech easier."
  },

  // Resources & preferences (optional)
  { key:"time_capacity", label:"Time for AI projects (hrs/week)", type:"select",
    options:[{value:"under_2",label:"Under 2"},{value:"2_5",label:"2–5"},{value:"5_10",label:"5–10"},{value:"over_10",label:"Over 10"}],
    description:"Helps match pace and scope."
  },
  { key:"existing_tools", label:"Systems/tools already in use", type:"checkbox",
    options:[
      {value:"crm",label:"CRM (e.g. HubSpot, Salesforce)"},
      {value:"erp",label:"ERP (e.g. SAP, Odoo)"},
      {value:"project_management",label:"Project management (e.g. Asana, Trello)"},
      {value:"marketing_automation",label:"Marketing automation (e.g. Mailchimp, HubSpot)"},
      {value:"accounting",label:"Accounting (e.g. Xero, Lexware)"},
      {value:"none",label:"None / other"}
    ],
    description:"Multiple selections allowed."
  },
  { key:"regulated_industry", label:"Regulated industry?", type:"checkbox",
    options:[
      {value:"healthcare",label:"Health & medicine"},
      {value:"finance",label:"Finance & insurance"},
      {value:"public",label:"Public sector"},
      {value:"legal",label:"Legal services"},
      {value:"none",label:"None of these"}
    ],
    description:"Regulated industries need additional compliance measures."
  },
  { key:"training_interests", label:"Training topics of interest", type:"checkbox",
    options:[
      {value:"prompt_engineering",label:"Prompt engineering"},
      {value:"llm_basics",label:"LLM basics"},
      {value:"data_quality_governance",label:"Data quality & governance"},
      {value:"automation_scripts",label:"Automation & scripts"},
      {value:"ethics_regulation",label:"Ethics & regulation"},
      {value:"none",label:"None / unsure"}
    ],
    description:"Multiple selections possible."
  },
  { key:"vision_priority", label:"Most important aspect of your vision", type:"select",
    options:[
      {value:"gpt_services",label:"GPT‑based services for SMEs"},
      {value:"customer_service",label:"Improve customer service"},
      {value:"data_products",label:"New data‑driven products"},
      {value:"process_automation",label:"Process automation"},
      {value:"market_leadership",label:"Market leadership"},
      {value:"unspecified",label:"No preference / unsure"}
    ],
    description:"Helps prioritise recommendations."
  },

  // Privacy & submit
  { key:"datenschutz", type:"privacy",
    label:"I have read the <a href='privacy.html' onclick='window.open(this.href,\"PrivacyPopup\",\"width=600,height=700\"); return false;'>privacy notice</a> and agree.",
    description:"Your details are used solely to generate your personal report."
  }
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

/* State / Render / Events (as in DE) */
let currentBlock = 0;
let autosaveKey = (() => {
  try {
    const token = localStorage.getItem('jwt');
    if (token){
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email || payload.sub;
      if (email) return `autosave_form_${email}`;
    }
  } catch(_){}
  return 'autosave_form_test';
})();
let formData = {};
function saveAutosave(){ try{ localStorage.setItem(autosaveKey, JSON.stringify(formData)); }catch(_){ } }
function loadAutosave(){ try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }catch(_){ formData = {}; } }

function renderAllBlocks(){
  loadAutosave();
  const root=document.getElementById("formbuilder"); if (!root) return;
  let html="";
  for (let i=0;i<blocks.length;i++){
    const block=blocks[i];
    html += `<section class="fb-section">
      <div class="fb-section-head"><span class="fb-step">Step ${i+1}/${blocks.length}</span> – <b>${block.name}</b></div>`;
    const intro=BLOCK_INTRO[i]||"";
    if (intro) html += `<div class="section-intro">${intro}</div>`;
    html += block.keys.map(key=>{
      const field=findField(key); if (!field) return "";
      if (field.showIf && !field.showIf(formData)) return "";
      const guidance = field.description ? `<div class="guidance${field.type==="privacy"?" important":""}">${field.description}</div>` : "";
      let input="";
      if (field.type==="select"){
        const selected=formData[field.key]||"";
        input = `<select id="${field.key}" name="${field.key}">
          <option value="">Please select…</option>
          ${(field.options||[]).map(opt=>{
            const sel = selected===opt.value ? " selected":"";
            return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
          }).join("")}
        </select>`;
      } else if (field.type==="textarea"){
        input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder||""}">${formData[field.key]||""}</textarea>`;
      } else if (field.type==="checkbox"){
        input = `<div class="checkbox-group twocol">${
          (field.options||[]).map(opt=>{
            const label = opt.label || "";
            const m = label.match(/^(.+?)\\s*\\(([^)]+)\\)\\s*$/);
            const mainLabel = m ? m[1].trim() : label;
            const hint = m ? m[2].trim() : "";
            const checked = (formData[field.key]||[]).includes(opt.value) ? "checked" : "";
            const hintHtml = hint ? `<div class="option-example">${hint}</div>` : "";
            return `<label class="checkbox-label"><input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}><span>${mainLabel}</span>${hintHtml}</label>`;
          }).join("")
        }</div>`;
      } else if (field.type==="slider"){
        const v=formData[field.key] ?? field.min ?? 1;
        input = `<input type="range" id="${field.key}" name="${field.key}" min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" value="${v}" oninput="this.nextElementSibling.innerText=this.value"> <span class="slider-value-label">${v}</span>`;
      } else if (field.type==="privacy"){
        input = `<div class="privacy-section"><label><input type="checkbox" id="${field.key}" name="${field.key}" ${formData[field.key]?'checked':''} required> ${field.label}</label></div>`;
      } else {
        input = `<input type="text" id="${field.key}" name="${field.key}" value="${formData[field.key]||""}">`;
      }
      const labelHtml = field.type!=="privacy" ? `<label for="${field.key}"><b>${field.label}</b></label>` : "";
      return `<div class="form-group">${labelHtml}${guidance}${input}</div>`;
    }).join("");
    html += `</section>`;
  }
  html += `<div class="form-nav"><div></div><div class="nav-right">
    <button type="button" id="btn-send" class="btn-next">Generate report</button>
    <button type="button" id="btn-reset" class="btn-reset">Reset</button>
  </div></div><div id="feedback"></div>`;
  root.innerHTML = html;
}
function getFieldValue(field){
  if (field.type==="checkbox"){ return Array.from(document.querySelectorAll(\`input[name="\${field.key}"]:checked\`)).map(e=>e.value); }
  if (field.type==="slider"){ const el=document.getElementById(field.key); return el?el.value:(field.min||1); }
  if (field.type==="privacy"){ const el=document.getElementById(field.key); return !!(el&&el.checked); }
  const el=document.getElementById(field.key); return el?el.value:"";
}
function setFieldValues(blockIdx){
  const block=blocks[blockIdx];
  for (const key of block.keys){
    const f=findField(key); if (!f) continue;
    const el=document.getElementById(f.key); if (!el) continue;
    if (f.type==="checkbox"){
      (formData[key]||[]).forEach(v=>{ const box=document.querySelector(\`input[name="\${f.key}"][value="\${v}"]\`); if (box) box.checked=true; });
    } else if (f.type==="slider"){
      const val=formData[key] ?? f.min ?? 1; el.value=val; if (el.nextElementSibling) el.nextElementSibling.innerText=val;
    } else if (f.type==="privacy"){
      el.checked = formData[key]===true;
    } else if (formData[key] !== undefined){
      el.value=formData[key];
    }
  }
}
function handleFormEvents(){
  const root=document.getElementById("formbuilder"); if (!root) return;
  root.addEventListener("change", ()=>{
    for (const f of fields){ formData[f.key]=getFieldValue(f); markInvalid(f.key,false); }
    saveAutosave(); renderAllBlocks(); setTimeout(()=>setFieldValues(currentBlock),20);
  });
  root.addEventListener("click",(e)=>{
    if (e.target.id==="btn-reset"){ try{ localStorage.removeItem(autosaveKey);}catch(_){}
      formData={}; renderAllBlocks(); setTimeout(handleFormEvents,20); window.scrollTo({top:0,behavior:"smooth"}); }
    if (e.target.id==="btn-send"){ submitAllBlocks(); }
  });
}
function submitAllBlocks(){
  for (const f of fields){ formData[f.key]=getFieldValue(f); } saveAutosave();
  const el=document.getElementById("formbuilder");
  if (el){
    el.querySelectorAll("button").forEach(b=>b.disabled=true);
    el.innerHTML = `<h2>Thank you for your answers!</h2>
      <div class="success-msg" style="margin-top:10px;">
        Your AI analysis is now being created.<br>
        Once finished, you will receive your individual report as a PDF by e‑mail.<br>
        You can now close this window.
      </div>`;
  }
  const token=getToken(); if (!token){ showSessionHint(); return; }
  const data={}; fields.forEach(f=>data[f.key]=formData[f.key]); data.lang="en";
  const BASE_URL="https://make-ki-backend-neu-production.up.railway.app";
  fetch(`${BASE_URL}/briefing_async`,{
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
    body:JSON.stringify(data), keepalive:true
  }).then(res=>{ if (res.status===401){ try{ localStorage.removeItem("jwt"); }catch(_){ } showSessionHint(); } })
    .catch(()=>{});
}
window.addEventListener("DOMContentLoaded",()=>{ loadAutosave(); renderAllBlocks(); setTimeout(handleFormEvents,20); });
</script>
