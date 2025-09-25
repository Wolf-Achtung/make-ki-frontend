
/*! formbuilder_en_FIXED_FULL.js — Single-page, validated, FULL version (EN)
    - Fixes: removed stray tokens, balanced braces, no ternary-as-statement (JSHint W030), no syntax errors
    - Adds: section intros, resources/preferences block, sliders, autosave, submit (async), reset
    - NOTE: Requires an element <div id="formbuilder"></div> in index_en.html
*/
(function(){
  'use strict';

  /* ============================== JWT + Session ============================== */
  function getToken(){ try { return localStorage.getItem('jwt') || null; } catch(e){ return null; } }
  function showSessionHint(){
    const el = document.getElementById('formbuilder');
    if (!el) return;
    el.insertAdjacentHTML('beforeend',
      '<div class="form-error" style="margin-top:12px">Your session has expired. ' +
      '<a href="/login.html">Please log in again</a> if you want to run another analysis.</div>');
  }
  function getEmailFromJWT(token){
    try { const p = JSON.parse(atob(token.split('.')[1])); return p.email || p.sub || null; } catch(e){ return null; }
  }

  /* ============================== Helpers ============================== */
  function splitLabelAndHint(raw){
    if (!raw) return ["",""];
    const s = String(raw).trim();
    const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (m) return [m[1].trim(), m[2].trim()];
    const parts = s.split(/\s{2,}| — | – | - /).map(x=>x.trim()).filter(Boolean);
    if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];
    return [s,""];
  }
  function findField(key){ return fields.find(f => f.key === key); }
  function getFieldLabel(key){ const f = findField(key); return (f && f.label) || key; }
  function markInvalid(key, on){
    const el = document.getElementById(key);
    if (!el) return;
    if (on){ el.classList.add('invalid'); } else { el.classList.remove('invalid'); }
    const grp = el.closest('.form-group');
    if (grp){ if (on){ grp.classList.add('invalid-group'); } else { grp.classList.remove('invalid-group'); } }
  }
  function validateBlockDetailed(blockIdx){
    const block = blocks[blockIdx];
    const optional = new Set([
      'jahresumsatz','it_infrastruktur','interne_ki_kompetenzen','datenquellen',
      // optional resources block
      'time_capacity','existing_tools','regulated_industry','training_interests','vision_priority'
    ]);
    const missing = [];
    block.keys.forEach(k => markInvalid(k,false));
    for (const key of block.keys){
      const f = findField(key); if (!f) continue;
      if (f.showIf && !f.showIf(formData)) continue;
      if (optional.has(key)) continue;
      const val = formData[key];
      let ok = true;
      if (f.type === 'checkbox') ok = Array.isArray(val) && val.length > 0;
      else if (f.type === 'privacy') ok = (val === true);
      else ok = (val !== undefined && String(val).trim() !== '');
      if (!ok){ missing.push(getFieldLabel(key)); markInvalid(key,true); }
    }
    return missing;
  }
  function getFeedbackBox(){
    return document.querySelector('#formbuilder .form-nav + #feedback') || document.getElementById('feedback');
  }

  /* ============================== Fields ============================== */
  const BLOCK_INTRO = [
    "We collect basic data (industry, size, state, core offering). This drives personalisation — including funding & compliance notes.",
    "Current state of processes, data and prior AI usage. This calibrates quick wins and the starter roadmap.",
    "Goals & key use cases: what should AI achieve? This focuses recommendations and prioritises actions.",
    "Strategy & governance: readiness for clean, sustainable AI adoption.",
    "Resources & preferences (time, existing tools, regulation, training interests). We adapt pace & feasibility.",
    "Legal & funding: guardrails for GDPR/EU‑AI‑Act‑aligned implementation and suitable programmes.",
    "Finish: consent & dispatch of your personalised report."
  ];
  (function(){ try{
    const css = `.section-intro{background:#E9F0FB;border:1px solid #D4DDED;border-radius:10px;padding:10px 12px;margin:8px 0 12px;color:#123B70}`;
    const s = document.createElement('style'); s.type='text/css'; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }catch(_){}})();

  const fields = [
    // Block 1: Company information
    { key:'branche', label:'Which industry is your company in?', type:'select',
      options:[
        {value:'marketing',label:'Marketing & advertising'},
        {value:'beratung',label:'Consulting & services'},
        {value:'it',label:'IT & software'},
        {value:'finanzen',label:'Finance & insurance'},
        {value:'handel',label:'Retail & e‑commerce'},
        {value:'bildung',label:'Education'},
        {value:'verwaltung',label:'Administration'},
        {value:'gesundheit',label:'Health & care'},
        {value:'bau',label:'Construction & architecture'},
        {value:'medien',label:'Media & creative industries'},
        {value:'industrie',label:'Industry & production'},
        {value:'logistik',label:'Transport & logistics'}
      ],
      description:'Your main industry influences benchmarks, tool suggestions and the analysis.'
    },
    { key:'unternehmensgroesse', label:'Company size (employees)', type:'select',
      options:[
        {value:'solo',label:'1 (sole proprietor / freelancer)'},
        {value:'team',label:'2–10 (small team)'},
        {value:'kmu',label:'11–100 (SME)'
      }],
      description:'Size influences recommendations, funding and comparisons.'
    },
    { key:'selbststaendig', label:'Legal form for a single person', type:'select',
      options:[
        {value:'freiberufler',label:'Freelancer / self‑employed'},
        {value:'kapitalgesellschaft',label:'Single‑member corporation (GmbH/UG)'},
        {value:'einzelunternehmer',label:'Sole proprietorship'},
        {value:'sonstiges',label:'Other'}
      ],
      showIf:(data)=> data.unternehmensgroesse === 'solo'
    },
    { key:'bundesland', label:'State (for regional funding)', type:'select',
      options:[
        {value:'bw',label:'Baden‑Württemberg'},{value:'by',label:'Bayern'},
        {value:'be',label:'Berlin'},{value:'bb',label:'Brandenburg'},
        {value:'hb',label:'Bremen'},{value:'hh',label:'Hamburg'},
        {value:'he',label:'Hessen'},{value:'mv',label:'Mecklenburg‑Vorpommern'},
        {value:'ni',label:'Niedersachsen'},{value:'nw',label:'Nordrhein‑Westfalen'},
        {value:'rp',label:'Rheinland‑Pfalz'},{value:'sl',label:'Saarland'},
        {value:'sn',label:'Sachsen'},{value:'st',label:'Sachsen‑Anhalt'},
        {value:'sh',label:'Schleswig‑Holstein'},{value:'th',label:'Thüringen'}
      ],
      description:'Your location steers regional funding & advisory offers.'
    },
    { key:'hauptleistung', label:'Main product / core service', type:'textarea',
      placeholder:'e.g. social media campaigns, CNC manufacturing, tax consulting for start‑ups',
      description:'Be specific — this sharpens recommendations & positioning.'
    },
    { key:'zielgruppen', label:'Target groups / customer segments', type:'checkbox',
      options:[
        {value:'b2b',label:'B2B (business customers)'},
        {value:'b2c',label:'B2C (consumers)'},
        {value:'kmu',label:'SMEs'},
        {value:'grossunternehmen',label:'Large enterprises'},
        {value:'selbststaendige',label:'Self‑employed / freelancers'},
        {value:'oeffentliche_hand',label:'Public sector'},
        {value:'privatpersonen',label:'Private individuals'},
        {value:'startups',label:'Start‑ups'},
        {value:'andere',label:'Other'}
      ]
    },
    // Extended
    { key:'jahresumsatz', label:'Annual revenue (estimate)', type:'select',
      options:[
        {value:'unter_100k',label:'Up to €100k'},{value:'100k_500k',label:'€100k–500k'},
        {value:'500k_2m',label:'€500k–2m'},{value:'2m_10m',label:'€2–10m'},
        {value:'ueber_10m',label:'Over €10m'},{value:'keine_angabe',label:'Prefer not to say'}
      ]},
    { key:'it_infrastruktur', label:'IT infrastructure', type:'select',
      options:[
        {value:'cloud',label:'Cloud‑based'},
        {value:'on_premise',label:'On‑premises / own DC'},
        {value:'hybrid',label:'Hybrid'},
        {value:'unklar',label:'Unclear / open'}
      ]},
    { key:'interne_ki_kompetenzen', label:'Internal AI/digital team?', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'nein',label:'No'},{value:'in_planung',label:'In planning'}]
    },
    { key:'datenquellen', label:'Available data types', type:'checkbox',
      options:[
        {value:'kundendaten',label:'Customer data (CRM, service, history)'},
        {value:'verkaufsdaten',label:'Sales / orders'},
        {value:'produktionsdaten',label:'Production / operations'},
        {value:'personaldaten',label:'HR / personnel'},
        {value:'marketingdaten',label:'Marketing / campaigns'},
        {value:'sonstige',label:'Other / additional'}
      ]
    },

    // Block 2: Status quo
    { key:'digitalisierungsgrad', label:'Digitalisation level (1–10)', type:'slider', min:1, max:10, step:1 },
    { key:'prozesse_papierlos', label:'Share of paperless processes', type:'select',
      options:[{value:'0-20',label:'0–20 %'},{value:'21-50',label:'21–50 %'},{value:'51-80',label:'51–80 %'},{value:'81-100',label:'81–100 %'}]},
    { key:'automatisierungsgrad', label:'Automation level', type:'select',
      options:[{value:'sehr_niedrig',label:'Very low'},{value:'eher_niedrig',label:'Rather low'},{value:'mittel',label:'Medium'},{value:'eher_hoch',label:'Rather high'},{value:'sehr_hoch',label:'Very high'}]},
    { key:'ki_einsatz', label:'Areas with AI use', type:'checkbox',
      options:[
        {value:'marketing',label:'Marketing'},{value:'vertrieb',label:'Sales'},
        {value:'buchhaltung',label:'Accounting'},{value:'produktion',label:'Production'},
        {value:'kundenservice',label:'Customer service'},{value:'it',label:'IT'},
        {value:'forschung',label:'R&D'},{value:'personal',label:'HR'},
        {value:'keine',label:'No usage yet'},{value:'sonstiges',label:'Other'}
      ]},
    { key:'ki_knowhow', label:'Team AI know‑how', type:'select',
      options:[{value:'keine',label:'None'},{value:'grundkenntnisse',label:'Basic'},{value:'mittel',label:'Medium'},{value:'fortgeschritten',label:'Advanced'},{value:'expertenwissen',label:'Expert'}]},

    // Block 3: Goals & projects
    { key:'projektziel', label:'Main objective of next AI/digital project', type:'checkbox',
      options:[
        {value:'prozessautomatisierung',label:'Process automation'},
        {value:'kostensenkung',label:'Cost reduction'},
        {value:'compliance',label:'Compliance / privacy'},
        {value:'produktinnovation',label:'Product innovation'},
        {value:'kundenservice',label:'Improve customer service'},
        {value:'markterschliessung',label:'Market expansion'},
        {value:'personalentlastung',label:'Relieve staff'},
        {value:'foerdermittel',label:'Apply for funding'},
        {value:'andere',label:'Other'}
      ]},
    { key:'ki_projekte', label:'Ongoing/planned AI projects', type:'textarea',
      placeholder:'e.g. chatbot, automated quotes, generators, analytics …' },
    { key:'ki_usecases', label:'Interesting AI use cases', type:'checkbox',
      options:[
        {value:'texterstellung',label:'Text generation'},
        {value:'bildgenerierung',label:'Image generation'},
        {value:'spracherkennung',label:'Speech recognition'},
        {value:'prozessautomatisierung',label:'Process automation'},
        {value:'datenanalyse',label:'Data analysis & forecasting'},
        {value:'kundensupport',label:'Customer support'},
        {value:'wissensmanagement',label:'Knowledge management'},
        {value:'marketing',label:'Marketing'},
        {value:'sonstiges',label:'Other'}
      ]},
    { key:'ki_potenzial', label:'Greatest AI potential', type:'textarea' },
    { key:'usecase_priority', label:'Area with highest priority', type:'select',
      options:[
        {value:'marketing',label:'Marketing'},{value:'vertrieb',label:'Sales'},
        {value:'buchhaltung',label:'Accounting'},{value:'produktion',label:'Production'},
        {value:'kundenservice',label:'Customer service'},{value:'it',label:'IT'},
        {value:'forschung',label:'R&D'},{value:'personal',label:'HR'},
        {value:'unbekannt',label:'Still unclear / later'}
      ]},
    { key:'ki_geschaeftsmodell_vision', label:'How could AI change your business model/industry?', type:'textarea' },
    { key:'moonshot', label:'Bold breakthrough — 3‑year vision', type:'textarea' },

    // Block 4: Strategy & Governance
    { key:'strategic_goals', label:'Specific goals with AI', type:'textarea' },
    { key:'data_quality', label:'Data quality', type:'select',
      options:[{value:'high',label:'High'},{value:'medium',label:'Medium'},{value:'low',label:'Low'}]},
    { key:'ai_roadmap', label:'AI roadmap/strategy available?', type:'select',
      options:[{value:'yes',label:'Yes'},{value:'planning',label:'In planning'},{value:'no',label:'Not yet'}]},
    { key:'governance', label:'Guidelines for data/AI governance?', type:'select',
      options:[{value:'yes',label:'Yes'},{value:'partial',label:'Partial'},{value:'no',label:'No'}]},
    { key:'innovation_culture', label:'Innovation culture', type:'select',
      options:[{value:'very_open',label:'Very open'},{value:'rather_open',label:'Rather open'},{value:'neutral',label:'Neutral'},{value:'rather_reluctant',label:'Rather reluctant'},{value:'very_reluctant',label:'Very reluctant'}] },

    // Block 5: Resources & preferences (optional)
    { key:'time_capacity', label:'Time capacity for AI projects (hrs/week)', type:'select',
      options:[{value:'under_2',label:'Under 2'},{value:'2_5',label:'2–5'},{value:'5_10',label:'5–10'},{value:'over_10',label:'Over 10'}]},
    { key:'existing_tools', label:'Existing tools', type:'checkbox',
      options:[
        {value:'crm',label:'CRM (e.g. HubSpot, Salesforce)'},
        {value:'erp',label:'ERP (e.g. SAP, Odoo)'},
        {value:'project_management',label:'Project management (e.g. Asana, Trello)'},
        {value:'marketing_automation',label:'Marketing automation (e.g. Mailchimp, HubSpot)'},
        {value:'accounting',label:'Accounting (e.g. Xero, Lexware)'},
        {value:'none',label:'None/Other'}
      ]},
    { key:'regulated_industry', label:'Regulated industry?', type:'checkbox',
      options:[
        {value:'healthcare',label:'Healthcare & medicine'},
        {value:'finance',label:'Finance & insurance'},
        {value:'public',label:'Public sector'},
        {value:'legal',label:'Legal services'},
        {value:'none',label:'None'}
      ]},
    { key:'training_interests', label:'Training interests', type:'checkbox',
      options:[
        {value:'prompt_engineering',label:'Prompt engineering'},
        {value:'llm_basics',label:'LLM basics'},
        {value:'data_quality_governance',label:'Data quality & governance'},
        {value:'automation_scripts',label:'Automation & scripts'},
        {value:'ethics_regulation',label:'Ethics & regulation'},
        {value:'none',label:'None/Unsure'}
      ]},
    { key:'vision_priority', label:'Most important aspect of your vision', type:'select',
      options:[
        {value:'gpt_services',label:'GPT‑based services for SMEs'},
        {value:'customer_service',label:'Improve customer service'},
        {value:'data_products',label:'Data‑driven products'},
        {value:'process_automation',label:'Process automation'},
        {value:'market_leadership',label:'Market leadership'},
        {value:'unspecified',label:'No preference'}
      ]},

    // Block 6: Legal & funding
    { key:'datenschutzbeauftragter', label:'Data protection officer?', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'nein',label:'No'},{value:'teilweise',label:'Partial (external/planned)'}]},
    { key:'technische_massnahmen', label:'Technical protection measures', type:'select',
      options:[{value:'alle',label:'All'},{value:'teilweise',label:'Partial'},{value:'keine',label:'None'}]},
    { key:'folgenabschaetzung', label:'DPIA carried out?', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'nein',label:'No'},{value:'teilweise',label:'Partial'}]},
    { key:'meldewege', label:'Incident reporting procedures', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'teilweise',label:'Partial'},{value:'nein',label:'No'}]},
    { key:'loeschregeln', label:'Deletion/anonymisation rules', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'teilweise',label:'Partial'},{value:'nein',label:'No'}]},
    { key:'ai_act_kenntnis', label:'Familiarity with EU AI Act', type:'select',
      options:[{value:'sehr_gut',label:'Very good'},{value:'gut',label:'Good'},{value:'gehört',label:'Heard of it'},{value:'unbekannt',label:'Unknown'}]},
    { key:'ki_hemmnisse', label:'Barriers to AI adoption', type:'checkbox',
      options:[
        {value:'rechtsunsicherheit',label:'Legal uncertainty'},
        {value:'datenschutz',label:'Data protection'},
        {value:'knowhow',label:'Lack of know‑how'},
        {value:'budget',label:'Limited budget'},
        {value:'teamakzeptanz',label:'Team acceptance'},
        {value:'zeitmangel',label:'Lack of time'},
        {value:'it_integration',label:'IT integration'},
        {value:'keine',label:'None'},
        {value:'andere',label:'Other'}
      ]},
    { key:'bisherige_foerdermittel', label:'Already received funding?', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'nein',label:'No'}]},
    { key:'interesse_foerderung', label:'Interested in funding options?', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'nein',label:'No'},{value:'unklar',label:'Unsure — advise me'}]},
    { key:'erfahrung_beratung', label:'Used consulting before?', type:'select',
      options:[{value:'ja',label:'Yes'},{value:'nein',label:'No'},{value:'unklar',label:'Unclear'}]},
    { key:'investitionsbudget', label:'Budget (next year)', type:'select',
      options:[{value:'unter_2000',label:'Under €2,000'},{value:'2000_10000',label:'€2,000–10,000'},{value:'10000_50000',label:'€10,000–50,000'},{value:'ueber_50000',label:'Over €50,000'},{value:'unklar',label:'Unclear'}]},
    { key:'marktposition', label:'Market position', type:'select',
      options:[{value:'marktfuehrer',label:'Market leader'},{value:'oberes_drittel',label:'Top third'},{value:'mittelfeld',label:'Middle field'},{value:'nachzuegler',label:'Laggard'},{value:'unsicher',label:'Hard to assess'}]},
    { key:'benchmark_wettbewerb', label:'Benchmark vs competitors?', type:'select',
      options:[{value:'ja',label:'Yes, regularly'},{value:'nein',label:'No'},{value:'selten',label:'Rarely / informally'}]},
    { key:'innovationsprozess', label:'How do innovations arise?', type:'select',
      options:[{value:'innovationsteam',label:'Internal innovation team'},{value:'mitarbeitende',label:'Through employees'},{value:'kunden',label:'With customers'},{value:'berater',label:'With external partners'},{value:'zufall',label:'Mostly by chance'},{value:'unbekannt',label:'No clear strategy'}]},
    { key:'risikofreude', label:'Risk appetite (1–5)', type:'slider', min:1, max:5, step:1 },

    // Block 7: Privacy & submit
    { key:'datenschutz', type:'privacy',
      label:"I have read the <a href='privacy.html' onclick='window.open(this.href, \"PrivacyPopup\", \"width=600,height=700\"); return false;'>privacy notice</a> and agree."
    }
  ];

  const blocks = [
    { name:'Company information', keys:['branche','unternehmensgroesse','selbststaendig','bundesland','hauptleistung','zielgruppen','jahresumsatz','it_infrastruktur','interne_ki_kompetenzen','datenquellen'] },
    { name:'Status quo', keys:['digitalisierungsgrad','prozesse_papierlos','automatisierungsgrad','ki_einsatz','ki_knowhow'] },
    { name:'Goals & projects', keys:['projektziel','ki_projekte','ki_usecases','ki_potenzial','usecase_priority','ki_geschaeftsmodell_vision','moonshot'] },
    { name:'Strategy & governance', keys:['strategic_goals','data_quality','ai_roadmap','governance','innovation_culture'] },
    { name:'Resources & preferences', keys:['time_capacity','existing_tools','regulated_industry','training_interests','vision_priority'] },
    { name:'Legal & funding', keys:['datenschutzbeauftragter','technische_massnahmen','folgenabschaetzung','meldewege','loeschregeln','ai_act_kenntnis','ki_hemmnisse','bisherige_foerdermittel','interesse_foerderung','erfahrung_beratung','investitionsbudget','marktposition','benchmark_wettbewerb','innovationsprozess','risikofreude'] },
    { name:'Privacy & submit', keys:['datenschutz'] }
  ];

  /* ============================== State ============================== */
  let currentBlock = 0;
  let autosaveKey = (function(){
    try{
      const token = getToken();
      if (token){
        const email = getEmailFromJWT(token);
        if (email) return `autosave_form_${email}`;
      }
    }catch(_){}
    return 'autosave_form_test';
  })();
  let formData = {};
  function loadAutosave(){ try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); } catch(_){ formData = {}; } }
  function saveAutosave(){ try{ localStorage.setItem(autosaveKey, JSON.stringify(formData)); } catch(_){ } }

  /* ============================== Renderer ============================== */
  function renderAllBlocks(){
    const root = document.getElementById('formbuilder'); if (!root) return;
    let html = '';
    for (let i=0;i<blocks.length;i++){
      const block = blocks[i];
      html += `<section class="fb-section">`;
      html += `<div class="fb-section-head"><span class="fb-step">Step ${i+1}/${blocks.length}</span> – <b>${block.name}</b></div>`;
      if (BLOCK_INTRO[i]) html += `<div class="section-intro">${BLOCK_INTRO[i]}</div>`;
      html += block.keys.map(key => {
        const field = findField(key); if (!field) return '';
        if (field.showIf && !field.showIf(formData)) return '';
        const guidance = field.description ? `<div class="guidance${field.type === 'privacy' ? ' important':''}">${field.description}</div>` : '';
        let input = '';
        switch(field.type){
          case 'select': {
            const selectedValue = formData[field.key] || '';
            const opts = (field.options||[]).map(opt => {
              const sel = (selectedValue === opt.value) ? ' selected' : '';
              return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
            }).join('');
            input = `<select id="${field.key}" name="${field.key}"><option value="">Please select…</option>${opts}</select>`;
          } break;
          case 'textarea':
            input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder||''}">${formData[field.key]||''}</textarea>`;
            break;
          case 'checkbox':
            input = `<div class="checkbox-group twocol">${
              (field.options||[]).map(opt => {
                const [mainLabel, hint] = splitLabelAndHint(opt.label || '');
                const checked = (formData[field.key]||[]).includes(opt.value) ? 'checked' : '';
                const hintHtml = hint ? `<div class="option-example">${hint}</div>` : '';
                return `<label class="checkbox-label"><input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}><span>${mainLabel}</span>${hintHtml}</label>`;
              }).join('')
            }</div>`;
            break;
          case 'slider': {
            const v = (formData[field.key] != null) ? formData[field.key] : (field.min || 1);
            input = `<input type="range" id="${field.key}" name="${field.key}" min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" value="${v}" oninput="this.nextElementSibling.innerText=this.value"/> <span class="slider-value-label">${v}</span>`;
          } break;
          case 'privacy':
            input = `<div class="privacy-section"><label><input type="checkbox" id="${field.key}" name="${field.key}" ${formData[field.key]?'checked':''} required/> ${field.label}</label></div>`;
            break;
          default:
            input = `<input type="text" id="${field.key}" name="${field.key}" value="${formData[field.key]||''}"/>`;
        }
        const labelHtml = field.type !== 'privacy' ? `<label for="${field.key}"><b>${field.label}</b></label>` : '';
        return `<div class="form-group">${labelHtml}${guidance}${input}</div>`;
      }).join('');
      html += `</section>`;
    }
    html += `<div class="form-nav"><div class="nav-left"></div><div class="nav-right">
      <button type="button" id="btn-send" class="btn-next">Submit</button>
      <button type="button" id="btn-reset" class="btn-reset">Reset</button>
    </div></div><div id="feedback"></div>`;
    root.innerHTML = html;
  }

  /* ============================== Events ============================== */
  function getFieldValue(field){
    switch(field.type){
      case 'checkbox': return Array.from(document.querySelectorAll(`input[name="${field.key}"]:checked`)).map(e=>e.value);
      case 'slider': return document.getElementById(field.key)?.value || field.min || 1;
      case 'privacy': return !!(document.getElementById(field.key)?.checked);
      default: return document.getElementById(field.key)?.value || '';
    }
  }
  function handleFormEvents(){
    const root = document.getElementById('formbuilder'); if (!root) return;
    root.addEventListener('change', () => {
      for (const f of fields){
        const curr = getFieldValue(f);
        formData[f.key] = curr;
        markInvalid(f.key,false);
      }
      saveAutosave();
      renderAllBlocks();
      setTimeout(() => setFieldValues(), 0);
    });
    root.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'btn-reset'){
        try { localStorage.removeItem(autosaveKey); } catch(_){}
        formData = {};
        renderAllBlocks(); setTimeout(() => handleFormEvents(), 0);
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
      if (e.target && (e.target.id === 'btn-send')){
        submitAll();
      }
    });
  }
  function setFieldValues(){
    for (const f of fields){
      const el = document.getElementById(f.key);
      if (!el) continue;
      if (f.type === 'checkbox'){
        (formData[f.key]||[]).forEach(v => {
          const box = document.querySelector(`input[name="${f.key}"][value="${v}"]`);
          if (box) box.checked = true;
        });
      } else if (f.type === 'slider'){
        const v = (formData[f.key] != null) ? formData[f.key] : (f.min || 1);
        el.value = v; if (el.nextElementSibling) el.nextElementSibling.innerText = v;
      } else if (f.type === 'privacy'){
        el.checked = !!formData[f.key];
      } else {
        if (formData[f.key] !== undefined) el.value = formData[f.key];
      }
    }
  }

  /* ============================== Submit ============================== */
  function submitAll(){
    for (const f of fields){ formData[f.key] = getFieldValue(f); }
    saveAutosave();

    let anyMissing = false;
    for (let i=0;i<blocks.length;i++){
      const missing = validateBlockDetailed(i);
      if (missing.length){
        anyMissing = true;
        const fb = getFeedbackBox();
        if (fb){
          fb.innerHTML = `<div class="form-error">Please complete: <ul>${missing.map(m=>`<li>${m}</li>`).join('')}</ul></div>`;
          fb.style.display = 'block'; fb.classList.add('error');
        }
        const first = document.querySelector('.invalid, .invalid-group');
        if (first) first.scrollIntoView({behavior:'smooth', block:'center'});
        break;
      }
    }
    if (anyMissing) return;

    const container = document.getElementById('formbuilder');
    if (container){
      container.querySelectorAll('button').forEach(b => b.disabled = true);
      container.innerHTML = `<h2>Thank you!</h2>
        <div class="success-msg" style="margin-top:10px;">
          Your AI analysis is now being created.<br>
          You will receive your personalised PDF report by e‑mail.<br>
          You can close this window.
        </div>`;
    }

    const token = getToken();
    if (!token){ showSessionHint(); return; }

    const data = {}; fields.forEach(f => { data[f.key] = formData[f.key]; });
    data.lang = 'en';

    const BASE_URL = 'https://make-ki-backend-neu-production.up.railway.app';
    fetch(`${BASE_URL}/briefing_async`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
      body: JSON.stringify(data),
      keepalive: true
    }).then(res => {
      if (res.status === 401){ try{ localStorage.removeItem('jwt'); }catch(_){ } showSessionHint(); }
    }).catch(()=>{});
  }

  /* ============================== Boot ============================== */
  window.addEventListener('DOMContentLoaded', () => {
    loadAutosave();
    renderAllBlocks();
    setFieldValues();
    handleFormEvents();
  });

})(); // IIFE end
