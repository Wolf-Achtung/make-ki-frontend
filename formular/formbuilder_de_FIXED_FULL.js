
/*! formbuilder_de_FIXED_FULL.js — Single-page, validated, FULL version (DE)
    - Fixes: removed stray tokens, balanced braces, no ternary-as-statement (JSHint W030), no syntax errors
    - Adds: section intros, resources/preferences block, sliders, autosave, submit (async), reset
    - NOTE: Requires an element <div id="formbuilder"></div> in index.html
*/
(function(){
  'use strict';

  /* ============================== JWT + Session ============================== */
  function getToken(){ try { return localStorage.getItem('jwt') || null; } catch(e){ return null; } }
  function showSessionHint(){
    const el = document.getElementById('formbuilder');
    if (!el) return;
    el.insertAdjacentHTML('beforeend',
      '<div class="form-error" style="margin-top:12px">Ihre Sitzung ist abgelaufen. ' +
      '<a href="/login.html">Bitte neu anmelden</a>, wenn Sie eine weitere Analyse durchführen möchten.</div>');
  }
  function getEmailFromJWT(token){
    try { const p = JSON.parse(atob(token.split('.')[1])); return p.email || p.sub || null; } catch(e){ return null; }
  }

  /* ============================== Helpers ============================== */
  // Label (Main + hint) trenner; akzeptiert "(...)" oder 2+ Spaces oder Trennstriche
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
  // Validierung eines Blocks: bestimmte Felder sind optional
  function validateBlockDetailed(blockIdx){
    const block = blocks[blockIdx];
    const optional = new Set([
      'jahresumsatz','it_infrastruktur','interne_ki_kompetenzen','datenquellen',
      // Ressourcen-Block optional
      'zeitbudget','vorhandene_tools','regulierte_branche','trainings_interessen','vision_prioritaet'
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

  /* ============================== Felder ============================== */
  const BLOCK_INTRO = [
    "Hier erfassen wir Basisdaten (Branche, Größe, Standort, Kernleistung). Sie steuern die Personalisierung des Reports – inkl. Förder- & Compliance-Hinweisen.",
    "Status quo zu Prozessen, Daten und bisheriger KI-Nutzung. Damit kalibrieren wir Quick Wins und die Start‑Roadmap.",
    "Ziele & Anwendungsfälle: Was soll KI konkret leisten? Das fokussiert Empfehlungen und priorisiert Maßnahmen.",
    "Strategie & Governance: Reifegrad für sauberen, nachhaltigen KI‑Einsatz.",
    "Ressourcen & Präferenzen (Zeit, vorhandene Tools, Regulierung, Trainingsinteressen). So passen wir Tempo & Machbarkeit an.",
    "Recht & Förderung: Rahmen für DSGVO/EU‑AI‑Act‑konforme Umsetzung und passende Programme.",
    "Abschließen: Zustimmung & Versand der individuellen Auswertung."
  ];

  // Sektion-Intro Styling (blau)
  (function(){ try{
    const css = `.section-intro{background:#E9F0FB;border:1px solid #D4DDED;border-radius:10px;padding:10px 12px;margin:8px 0 12px;color:#123B70}`;
    const s = document.createElement('style'); s.type='text/css'; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }catch(_){}})();

  const fields = [
    // Block 1: Unternehmensinfos
    { key:'branche', label:'In welcher Branche ist Ihr Unternehmen tätig?', type:'select',
      options:[
        {value:'marketing',label:'Marketing & Werbung'},
        {value:'beratung',label:'Beratung & Dienstleistungen'},
        {value:'it',label:'IT & Software'},
        {value:'finanzen',label:'Finanzen & Versicherungen'},
        {value:'handel',label:'Handel & E‑Commerce'},
        {value:'bildung',label:'Bildung'},
        {value:'verwaltung',label:'Verwaltung'},
        {value:'gesundheit',label:'Gesundheit & Pflege'},
        {value:'bau',label:'Bauwesen & Architektur'},
        {value:'medien',label:'Medien & Kreativwirtschaft'},
        {value:'industrie',label:'Industrie & Produktion'},
        {value:'logistik',label:'Transport & Logistik'}
      ],
      description:'Ihre Hauptbranche beeinflusst Benchmarks, Tool‑Empfehlungen und die Auswertung.'
    },
    { key:'unternehmensgroesse', label:'Wie groß ist Ihr Unternehmen (Mitarbeiter:innen)?', type:'select',
      options:[
        {value:'solo',label:'1 (Solo‑Selbstständig/Freiberuflich)'},
        {value:'team',label:'2–10 (Kleines Team)'},
        {value:'kmu',label:'11–100 (KMU)'}
      ],
      description:'Die Größe beeinflusst Empfehlungen, Fördermöglichkeiten und Vergleichswerte.'
    },
    { key:'selbststaendig', label:'Unternehmensform bei 1 Person', type:'select',
      options:[
        {value:'freiberufler',label:'Freiberuflich/Selbstständig'},
        {value:'kapitalgesellschaft',label:'1‑Personen‑Kapitalgesellschaft (GmbH/UG)'},
        {value:'einzelunternehmer',label:'Einzelunternehmer (mit Gewerbe)'},
        {value:'sonstiges',label:'Sonstiges'}
      ],
      description:'So erhalten Sie Auswertungen, die genau zu Ihrer Situation passen.',
      showIf:(data)=> data.unternehmensgroesse === 'solo'
    },
    { key:'bundesland', label:'Bundesland (regionale Fördermöglichkeiten)', type:'select',
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
      description:'Ihr Standort steuert Förder‑/Beratungsangebote.'
    },
    { key:'hauptleistung', label:'Wichtigstes Produkt/Hauptdienstleistung', type:'textarea',
      placeholder:'z. B. Social‑Media‑Kampagnen, CNC‑Fertigung, Steuerberatung für Startups',
      description:'Bitte möglichst konkret – das schärft Empfehlungen & Positionierung.'
    },
    { key:'zielgruppen', label:'Zielgruppen/Kundensegmente', type:'checkbox',
      options:[
        {value:'b2b',label:'B2B (Geschäftskunden)'},{value:'b2c',label:'B2C (Endverbraucher)'},
        {value:'kmu',label:'KMU'},{value:'grossunternehmen',label:'Großunternehmen'},
        {value:'selbststaendige',label:'Selbstständige/Freiberufler'},
        {value:'oeffentliche_hand',label:'Öffentliche Hand'},
        {value:'privatpersonen',label:'Privatpersonen'},{value:'startups',label:'Startups'},
        {value:'andere',label:'Andere'}
      ],
      description:'Mehrfachauswahl möglich.'
    },
    // Erweiterte Angaben
    { key:'jahresumsatz', label:'Jahresumsatz (Schätzung)', type:'select',
      options:[
        {value:'unter_100k',label:'Bis 100.000 €'},
        {value:'100k_500k',label:'100.000–500.000 €'},
        {value:'500k_2m',label:'500.000–2 Mio. €'},
        {value:'2m_10m',label:'2–10 Mio. €'},
        {value:'ueber_10m',label:'Über 10 Mio. €'},
        {value:'keine_angabe',label:'Keine Angabe'}
      ],
      description:'Grobe Schätzung genügt.'
    },
    { key:'it_infrastruktur', label:'IT‑Infrastruktur', type:'select',
      options:[
        {value:'cloud',label:'Cloud‑basiert'},
        {value:'on_premise',label:'Eigenes Rechenzentrum (On‑Premises)'},
        {value:'hybrid',label:'Hybrid (Cloud + eigene Server)'},
        {value:'unklar',label:'Unklar / offen'}
      ],
      description:'Hilft bei Sicherheit/Integration/Tools.'
    },
    { key:'interne_ki_kompetenzen', label:'Internes KI-/Digital‑Team vorhanden?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'nein',label:'Nein'},{value:'in_planung',label:'In Planung'}]
    },
    { key:'datenquellen', label:'Verfügbare Datentypen', type:'checkbox',
      options:[
        {value:'kundendaten',label:'Kundendaten (CRM, Service, Historie)'},
        {value:'verkaufsdaten',label:'Verkaufs-/Bestelldaten (Shop, Aufträge)'},
        {value:'produktionsdaten',label:'Produktions-/Betriebsdaten (Maschinen, Sensoren, Logistik)'},
        {value:'personaldaten',label:'Personal-/HR‑Daten'},
        {value:'marketingdaten',label:'Marketing-/Kampagnendaten'},
        {value:'sonstige',label:'Sonstige/weiteres'}
      ]
    },

    // Block 2: Status Quo
    { key:'digitalisierungsgrad', label:'Digitalisierungsgrad (1–10)', type:'slider', min:1, max:10, step:1,
      description:'1 = analog/manuell, 10 = voll digital/automatisiert.' },
    { key:'prozesse_papierlos', label:'Anteil papierloser Prozesse', type:'select',
      options:[
        {value:'0-20',label:'0–20 %'},{value:'21-50',label:'21–50 %'},
        {value:'51-80',label:'51–80 %'},{value:'81-100',label:'81–100 %'}
      ]},
    { key:'automatisierungsgrad', label:'Automatisierungsgrad', type:'select',
      options:[
        {value:'sehr_niedrig',label:'Sehr niedrig'},{value:'eher_niedrig',label:'Eher niedrig'},
        {value:'mittel',label:'Mittel'},{value:'eher_hoch',label:'Eher hoch'},{value:'sehr_hoch',label:'Sehr hoch'}
      ]},
    { key:'ki_einsatz', label:'Bereiche mit KI‑Einsatz', type:'checkbox',
      options:[
        {value:'marketing',label:'Marketing'},{value:'vertrieb',label:'Vertrieb'},
        {value:'buchhaltung',label:'Buchhaltung'},{value:'produktion',label:'Produktion'},
        {value:'kundenservice',label:'Kundenservice'},{value:'it',label:'IT'},
        {value:'forschung',label:'Forschung & Entwicklung'},{value:'personal',label:'Personal'},
        {value:'keine',label:'Noch keine Nutzung'},{value:'sonstiges',label:'Sonstiges'}
      ]},
    { key:'ki_knowhow', label:'KI‑Know‑how im Team', type:'select',
      options:[
        {value:'keine',label:'Keine Erfahrung'},{value:'grundkenntnisse',label:'Grundkenntnisse'},
        {value:'mittel',label:'Mittel'},{value:'fortgeschritten',label:'Fortgeschritten'},
        {value:'expertenwissen',label:'Expertenwissen'}
      ]},

    // Block 3: Ziele & Projekte
    { key:'projektziel', label:'Ziel des nächsten KI-/Digital‑Projekts', type:'checkbox',
      options:[
        {value:'prozessautomatisierung',label:'Prozessautomatisierung'},
        {value:'kostensenkung',label:'Kostensenkung'},
        {value:'compliance',label:'Compliance/Datenschutz'},
        {value:'produktinnovation',label:'Produktinnovation'},
        {value:'kundenservice',label:'Kundenservice verbessern'},
        {value:'markterschliessung',label:'Markterschließung'},
        {value:'personalentlastung',label:'Personalentlastung'},
        {value:'foerdermittel',label:'Fördermittel beantragen'},
        {value:'andere',label:'Andere'}
      ]},
    { key:'ki_projekte', label:'Laufende/geplante KI‑Projekte', type:'textarea',
      placeholder:'z. B. Chatbot, Angebots‑Automation, Generatoren, Analytics …' },
    { key:'ki_usecases', label:'Interessante KI‑Use‑Cases', type:'checkbox',
      options:[
        {value:'texterstellung',label:'Texterstellung'},
        {value:'bildgenerierung',label:'Bildgenerierung'},
        {value:'spracherkennung',label:'Spracherkennung'},
        {value:'prozessautomatisierung',label:'Prozessautomatisierung'},
        {value:'datenanalyse',label:'Datenanalyse & Prognose'},
        {value:'kundensupport',label:'Kundensupport'},
        {value:'wissensmanagement',label:'Wissensmanagement'},
        {value:'marketing',label:'Marketing'},
        {value:'sonstiges',label:'Sonstiges'}
      ]},
    { key:'ki_potenzial', label:'Größtes KI‑Potenzial', type:'textarea' },
    { key:'usecase_priority', label:'Bereich mit höchster Priorität', type:'select',
      options:[
        {value:'marketing',label:'Marketing'},{value:'vertrieb',label:'Vertrieb'},
        {value:'buchhaltung',label:'Buchhaltung'},{value:'produktion',label:'Produktion'},
        {value:'kundenservice',label:'Kundenservice'},{value:'it',label:'IT'},
        {value:'forschung',label:'Forschung & Entwicklung'},{value:'personal',label:'Personal'},
        {value:'unbekannt',label:'Noch unklar / später'}
      ]},
    { key:'ki_geschaeftsmodell_vision', label:'Wie verändert KI Geschäftsmodell/Branche?', type:'textarea' },
    { key:'moonshot', label:'Mutiger Durchbruch – 3‑Jahres‑Vision', type:'textarea' },

    // Block 4: Strategie & Governance
    { key:'strategische_ziele', label:'Konkrete Ziele mit KI', type:'textarea' },
    { key:'datenqualitaet', label:'Datenqualität', type:'select',
      options:[{value:'hoch',label:'Hoch'},{value:'mittel',label:'Mittel'},{value:'niedrig',label:'Niedrig'}]},
    { key:'ai_roadmap', label:'KI‑Roadmap/Strategie vorhanden?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'in_planung',label:'In Planung'},{value:'nein',label:'Noch nicht'}]},
    { key:'governance', label:'Richtlinien für Daten/KI‑Governance?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'teilweise',label:'Teilweise'},{value:'nein',label:'Nein'}]},
    { key:'innovationskultur', label:'Innovationskultur', type:'select',
      options:[
        {value:'sehr_offen',label:'Sehr offen'},{value:'eher_offen',label:'Eher offen'},
        {value:'neutral',label:'Neutral'},{value:'eher_zurueckhaltend',label:'Eher zurückhaltend'},
        {value:'sehr_zurueckhaltend',label:'Sehr zurückhaltend'}
      ]},

    // Block 5: Ressourcen & Präferenzen (neu, optional)
    { key:'zeitbudget', label:'Zeitbudget für KI‑Projekte (Std/Woche)', type:'select',
      options:[
        {value:'unter_2',label:'Unter 2 Std'},{value:'2_5',label:'2–5 Std'},
        {value:'5_10',label:'5–10 Std'},{value:'ueber_10',label:'Über 10 Std'}
      ]},
    { key:'vorhandene_tools', label:'Bereits genutzte Tools', type:'checkbox',
      options:[
        {value:'crm',label:'CRM (z. B. HubSpot, Salesforce)'},
        {value:'erp',label:'ERP (z. B. SAP, Odoo)'},
        {value:'projektmanagement',label:'Projektmanagement (z. B. Asana, Trello)'},
        {value:'marketing_automation',label:'Marketing‑Automation (z. B. Mailchimp, HubSpot)'},
        {value:'buchhaltung',label:'Buchhaltung (z. B. Lexware, Xero)'},
        {value:'keine',label:'Keine/Andere'}
      ]},
    { key:'regulierte_branche', label:'Regulierte Branche?', type:'checkbox',
      options:[
        {value:'gesundheit',label:'Gesundheit & Medizin'},
        {value:'finanzen',label:'Finanzen & Versicherungen'},
        {value:'oeffentlich',label:'Öffentlicher Sektor'},
        {value:'recht',label:'Rechtliche Dienstleistungen'},
        {value:'keine',label:'Keine'}
      ]},
    { key:'trainings_interessen', label:'Interesse an KI‑Trainings', type:'checkbox',
      options:[
        {value:'prompt_engineering',label:'Prompt Engineering'},
        {value:'llm_basics',label:'LLM‑Grundlagen'},
        {value:'datenqualitaet_governance',label:'Datenqualität & Governance'},
        {value:'automatisierung',label:'Automatisierung & Skripte'},
        {value:'ethik_recht',label:'Ethische & rechtliche Grundlagen'},
        {value:'keine',label:'Keine/Unklar'}
      ]},
    { key:'vision_prioritaet', label:'Wichtigster Vision‑Aspekt', type:'select',
      options:[
        {value:'gpt_services',label:'GPT‑basierte Services für KMU'},
        {value:'kundenservice',label:'Kundenservice verbessern'},
        {value:'datenprodukte',label:'Datenbasierte Produkte'},
        {value:'prozessautomation',label:'Prozessautomatisierung'},
        {value:'marktfuehrerschaft',label:'Marktführerschaft'},
        {value:'keine_angabe',label:'Keine Angabe'}
      ]},

    // Block 6: Rechtliches & Förderung
    { key:'datenschutzbeauftragter', label:'Datenschutzbeauftragte:r vorhanden?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'nein',label:'Nein'},{value:'teilweise',label:'Teilweise (extern/Planung)'}]},
    { key:'technische_massnahmen', label:'Technische Schutzmaßnahmen', type:'select',
      options:[{value:'alle',label:'Alle'},{value:'teilweise',label:'Teilweise'},{value:'keine',label:'Keine'}]},
    { key:'folgenabschaetzung', label:'DSFA erstellt?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'nein',label:'Nein'},{value:'teilweise',label:'Teilweise'}]},
    { key:'meldewege', label:'Meldewege bei Vorfällen', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'teilweise',label:'Teilweise'},{value:'nein',label:'Nein'}]},
    { key:'loeschregeln', label:'Lösch-/Anonymisierungsregeln', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'teilweise',label:'Teilweise'},{value:'nein',label:'Nein'}]},
    { key:'ai_act_kenntnis', label:'Kenntnis EU AI Act', type:'select',
      options:[{value:'sehr_gut',label:'Sehr gut'},{value:'gut',label:'Gut'},{value:'gehört',label:'Schon gehört'},{value:'unbekannt',label:'Unbekannt'}]},
    { key:'ki_hemmnisse', label:'Hemmnisse beim KI‑Einsatz', type:'checkbox',
      options:[
        {value:'rechtsunsicherheit',label:'Rechtsunsicherheit'},
        {value:'datenschutz',label:'Datenschutz'},
        {value:'knowhow',label:'Fehlendes Know‑how'},
        {value:'budget',label:'Begrenztes Budget'},
        {value:'teamakzeptanz',label:'Teamakzeptanz'},
        {value:'zeitmangel',label:'Zeitmangel'},
        {value:'it_integration',label:'IT‑Integration'},
        {value:'keine',label:'Keine'},
        {value:'andere',label:'Andere'}
      ]},
    { key:'bisherige_foerdermittel', label:'Bereits Fördermittel erhalten?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'nein',label:'Nein'}]},
    { key:'interesse_foerderung', label:'Fördermöglichkeiten interessant?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'nein',label:'Nein'},{value:'unklar',label:'Unklar, bitte beraten'}]},
    { key:'erfahrung_beratung', label:'Beratung genutzt?', type:'select',
      options:[{value:'ja',label:'Ja'},{value:'nein',label:'Nein'},{value:'unklar',label:'Unklar'}]},
    { key:'investitionsbudget', label:'Budget (nächstes Jahr)', type:'select',
      options:[
        {value:'unter_2000',label:'Unter 2.000 €'},
        {value:'2000_10000',label:'2.000–10.000 €'},
        {value:'10000_50000',label:'10.000–50.000 €'},
        {value:'ueber_50000',label:'Über 50.000 €'},
        {value:'unklar',label:'Noch unklar'}
      ]},
    { key:'marktposition', label:'Marktposition', type:'select',
      options:[
        {value:'marktfuehrer',label:'Marktführer'},
        {value:'oberes_drittel',label:'Oberes Drittel'},
        {value:'mittelfeld',label:'Mittelfeld'},
        {value:'nachzuegler',label:'Nachzügler/ Aufholer'},
        {value:'unsicher',label:'Schwer einzuschätzen'}
      ]},
    { key:'benchmark_wettbewerb', label:'Vergleich mit Wettbewerbern', type:'select',
      options:[{value:'ja',label:'Ja, regelmäßig'},{value:'nein',label:'Nein'},{value:'selten',label:'Selten/informell'}]},
    { key:'innovationsprozess', label:'Wie entstehen Innovationen?', type:'select',
      options:[
        {value:'innovationsteam',label:'Internes Innovationsteam'},
        {value:'mitarbeitende',label:'Durch Mitarbeitende'},
        {value:'kunden',label:'Mit Kunden'},
        {value:'berater',label:'Mit externen Partnern'},
        {value:'zufall',label:'Eher zufällig/ungeplant'},
        {value:'unbekannt',label:'Keine klare Strategie'}
      ]},
    { key:'risikofreude', label:'Risikofreude (1–5)', type:'slider', min:1, max:5, step:1 },

    // Block 7: Datenschutz & Absenden
    { key:'datenschutz', type:'privacy',
      label:"Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden."
    }
  ];

  const blocks = [
    { name:'Unternehmensinfos', keys:['branche','unternehmensgroesse','selbststaendig','bundesland','hauptleistung','zielgruppen','jahresumsatz','it_infrastruktur','interne_ki_kompetenzen','datenquellen'] },
    { name:'Status Quo', keys:['digitalisierungsgrad','prozesse_papierlos','automatisierungsgrad','ki_einsatz','ki_knowhow'] },
    { name:'Ziele & Projekte', keys:['projektziel','ki_projekte','ki_usecases','ki_potenzial','usecase_priority','ki_geschaeftsmodell_vision','moonshot'] },
    { name:'Strategie & Governance', keys:['strategische_ziele','datenqualitaet','ai_roadmap','governance','innovationskultur'] },
    { name:'Ressourcen & Präferenzen', keys:['zeitbudget','vorhandene_tools','regulierte_branche','trainings_interessen','vision_prioritaet'] },
    { name:'Rechtliches & Förderung', keys:['datenschutzbeauftragter','technische_massnahmen','folgenabschaetzung','meldewege','loeschregeln','ai_act_kenntnis','ki_hemmnisse','bisherige_foerdermittel','interesse_foerderung','erfahrung_beratung','investitionsbudget','marktposition','benchmark_wettbewerb','innovationsprozess','risikofreude'] },
    { name:'Datenschutz & Absenden', keys:['datenschutz'] }
  ];

  /* ============================== State ============================== */
  let currentBlock = 0; // nur für Validierungsdurchlauf genutzt
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
      html += `<div class="fb-section-head"><span class="fb-step">Schritt ${i+1}/${blocks.length}</span> – <b>${block.name}</b></div>`;
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
            input = `<select id="${field.key}" name="${field.key}"><option value="">Bitte wählen…</option>${opts}</select>`;
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
      <button type="button" id="btn-send" class="btn-next">Absenden</button>
      <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
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
      // alle Felder einsammeln
      for (const f of fields){
        const curr = getFieldValue(f);
        formData[f.key] = curr;
        markInvalid(f.key,false);
      }
      saveAutosave();
      // Re-Render nötig, wenn showIf abhängt
      if (formData['unternehmensgroesse'] === 'solo'){
        // sicherstellen, dass Rechtsform sichtbar bleibt
      }
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
    // letzten Stand erfassen
    for (const f of fields){ formData[f.key] = getFieldValue(f); }
    saveAutosave();

    // Simple Pflichtprüfung je Block
    let anyMissing = false;
    for (let i=0;i<blocks.length;i++){
      const missing = validateBlockDetailed(i);
      if (missing.length){
        anyMissing = true;
        const fb = getFeedbackBox();
        if (fb){
          fb.innerHTML = `<div class="form-error">Bitte ausfüllen: <ul>${missing.map(m=>`<li>${m}</li>`).join('')}</ul></div>`;
          fb.style.display = 'block'; fb.classList.add('error');
        }
        // zum ersten Fehler springen
        const first = document.querySelector('.invalid, .invalid-group');
        if (first) first.scrollIntoView({behavior:'smooth', block:'center'});
        break;
      }
    }
    if (anyMissing) return;

    // Dankesbildschirm
    const container = document.getElementById('formbuilder');
    if (container){
      container.querySelectorAll('button').forEach(b => b.disabled = true);
      container.innerHTML = `<h2>Vielen Dank!</h2>
        <div class="success-msg" style="margin-top:10px;">
          Ihre KI‑Analyse wird jetzt erstellt.<br>
          Nach Fertigstellung erhalten Sie Ihre Auswertung als PDF per E‑Mail.<br>
          Sie können dieses Fenster schließen.
        </div>`;
    }

    const token = getToken();
    if (!token){ showSessionHint(); return; }

    const data = {}; fields.forEach(f => { data[f.key] = formData[f.key]; });
    data.lang = 'de';

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
