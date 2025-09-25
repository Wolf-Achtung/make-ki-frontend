
(function(){ try{
  const css = `
    :root{ --fb-blue:#123B70; --fb-blue-2:#0A2C58; --fb-bg:#F5F8FE; --fb-border:#D4DDED }
    body{ background:#F3F6FB; }
    #formbuilder{ font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;
                  font-size:18px; line-height:1.6; color:#102A43; }
    #formbuilder h1,#formbuilder h2{ color:var(--fb-blue); margin:0 0 12px 0; }
    .fb-section{ background:white; border:1px solid var(--fb-border); border-radius:12px; padding:22px 24px; margin:18px 0; }
    .fb-section-head{ font-size:20px; font-weight:700; color:var(--fb-blue-2); margin-bottom:10px; }
    .section-intro{ background:#E9F0FB; border:1px solid var(--fb-border); border-radius:10px; padding:14px 14px; margin:10px 0 16px; color:var(--fb-blue); }
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
  if (grp) { if (on) grp.classList.add('invalid-group'); else grp.classList.remove('invalid-group'); }
}
function getFeedbackBox(){ return document.getElementById('feedback'); }

// Detaillierte Validierung (mit optionalen Feldern pro Block)
function validateBlockDetailed(blockIdx){
  const block = blocks[blockIdx];
  const optional = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen",
                             "zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"]);
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

// ===== Datenfelder (DE) – Vollversion =====

// Intro-Texte passend zur Block-Reihenfolge
const BLOCK_INTRO = [
  "Basisdaten (E‑Mail, Branche, Größe, Standort). Steuern Personalisierung, Benchmarks und Förder-/Compliance‑Hinweise.",
  "Status‑Quo zu Prozessen, Daten und bisherigen KI‑Erfahrungen. Kalibriert Quick Wins und Start‑Roadmap.",
  "Ziele & wichtigste Use‑Cases – fokussiert Empfehlungen und priorisiert Maßnahmen.",
  "Strategie & Governance: Rollen, Datenqualität, Roadmap, Richtlinien – Grundlage für skalierbare & sichere Umsetzung.",
  "Ressourcen & Präferenzen (Zeitbudget, Tool‑Affinität, vorhandene Systeme). Wir passen Vorschläge an Tempo & Machbarkeit an.",
  "Rechtliches & Förderung: DSGVO/EU‑AI‑Act‑Readiness sowie passende Programme mit Fristen.",
  "Abschließen & Absenden: Kurzer Check, Einwilligung bestätigen und die persönliche Auswertung starten."
];

const fields = [
  // Block 1
  { key:"branche", label:"In welcher Branche ist Ihr Unternehmen tätig?", type:"select",
    options:[
      {value:"marketing",label:"Marketing & Werbung"},{value:"beratung",label:"Beratung & Dienstleistungen"},
      {value:"it",label:"IT & Software"},{value:"finanzen",label:"Finanzen & Versicherungen"},
      {value:"handel",label:"Handel & E‑Commerce"},{value:"bildung",label:"Bildung"},
      {value:"verwaltung",label:"Verwaltung"},{value:"gesundheit",label:"Gesundheit & Pflege"},
      {value:"bau",label:"Bauwesen & Architektur"},{value:"medien",label:"Medien & Kreativwirtschaft"},
      {value:"industrie",label:"Industrie & Produktion"},{value:"logistik",label:"Transport & Logistik"}
    ],
    description:"Die Hauptbranche beeinflusst Benchmarks, Tools und Analyse." },
  { key:"unternehmensgroesse", label:"Wie groß ist Ihr Unternehmen (Mitarbeiter:innen)?", type:"select",
    options:[ {value:"solo",label:"1 (Solo‑Selbstständig/Freiberuflich)"}, {value:"team",label:"2–10 (Kleines Team)"}, {value:"kmu",label:"11–100 (KMU)"} ],
    description:"Größe beeinflusst Empfehlungen, Förderungen, Vergleichswerte." },
  { key:"selbststaendig", label:"Unternehmensform bei 1 Person", type:"select",
    options:[
      {value:"freiberufler",label:"Freiberuflich/Selbstständig"},
      {value:"kapitalgesellschaft",label:"1‑Personen‑Kapitalgesellschaft (GmbH/UG)"},
      {value:"einzelunternehmer",label:"Einzelunternehmer (mit Gewerbe)"},
      {value:"sonstiges",label:"Sonstiges"}
    ],
    description:"Wählen Sie die Rechtsform – für passgenaue Auswertung.",
    showIf: (data)=> data.unternehmensgroesse === "solo" },
  { key:"bundesland", label:"Bundesland (regionale Fördermöglichkeiten)", type:"select",
    options:[
      {value:"bw",label:"Baden‑Württemberg"},{value:"by",label:"Bayern"},{value:"be",label:"Berlin"},{value:"bb",label:"Brandenburg"},
      {value:"hb",label:"Bremen"},{value:"hh",label:"Hamburg"},{value:"he",label:"Hessen"},{value:"mv",label:"Mecklenburg‑Vorpommern"},
      {value:"ni",label:"Niedersachsen"},{value:"nw",label:"Nordrhein‑Westfalen"},{value:"rp",label:"Rheinland‑Pfalz"},{value:"sl",label:"Saarland"},
      {value:"sn",label:"Sachsen"},{value:"st",label:"Sachsen‑Anhalt"},{value:"sh",label:"Schleswig‑Holstein"},{value:"th",label:"Thüringen"}
    ],
    description:"Standort bestimmt relevante Programme & Hinweise." },
  { key:"hauptleistung", label:"Wichtigstes Produkt / Hauptdienstleistung", type:"textarea",
    placeholder:"z. B. Social‑Media‑Kampagnen, CNC‑Fertigung, Steuerberatung für Startups",
    description:"Bitte möglichst konkret – Beispiele helfen." },
  { key:"zielgruppen", label:"Zielgruppen/Kundensegmente", type:"checkbox",
    options:[
      {value:"b2b",label:"B2B (Geschäftskunden)"},{value:"b2c",label:"B2C (Endverbraucher)"},{value:"kmu",label:"KMU"},
      {value:"grossunternehmen",label:"Großunternehmen"},{value:"selbststaendige",label:"Selbstständige/Freiberufler"},
      {value:"oeffentliche_hand",label:"Öffentliche Hand"},{value:"privatpersonen",label:"Privatpersonen"},
      {value:"startups",label:"Startups"},{value:"andere",label:"Andere"}
    ],
    description:"Mehrfachauswahl möglich." },

  // Erweiterte Unternehmensangaben
  { key:"jahresumsatz", label:"Jahresumsatz (Schätzung)", type:"select",
    options:[
      {value:"unter_100k",label:"Bis 100.000 €"},{value:"100k_500k",label:"100.000–500.000 €"},
      {value:"500k_2m",label:"500.000–2 Mio. €"},{value:"2m_10m",label:"2–10 Mio. €"},
      {value:"ueber_10m",label:"Über 10 Mio. €"},{value:"keine_angabe",label:"Keine Angabe"}
    ]},
  { key:"it_infrastruktur", label:"Wie ist Ihre IT‑Infrastruktur organisiert?", type:"select",
    options:[
      {value:"cloud",label:"Cloud‑basiert (z. B. Microsoft 365, Google Cloud …)"},
      {value:"on_premise",label:"Eigenes Rechenzentrum (On‑Premises)"},
      {value:"hybrid",label:"Hybrid (Cloud + eigene Server)"},
      {value:"unklar",label:"Unklar / offen"}
    ]},
  { key:"interne_ki_kompetenzen", label:"Gibt es ein internes KI-/Digitalisierungsteam?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"in_planung",label:"In Planung"} ] },
  { key:"datenquellen", label:"Verfügbare Datentypen für KI/Analysen", type:"checkbox",
    options:[
      {value:"kundendaten",label:"Kundendaten (CRM, Service, Historie)"},
      {value:"verkaufsdaten",label:"Verkaufs-/Bestelldaten (Shop, Aufträge)"},
      {value:"produktionsdaten",label:"Produktions-/Betriebsdaten (Maschinen, Sensoren, Logistik)"},
      {value:"personaldaten",label:"Personal-/HR‑Daten (Mitarbeitende, Bewerbungen, Zeit)"},
      {value:"marketingdaten",label:"Marketing-/Kampagnendaten (Ads, Social, Newsletter)"},
      {value:"sonstige",label:"Sonstige / weitere Datenquellen"}
    ]},

  // Block 2
  { key:"digitalisierungsgrad", label:"Wie digital sind Ihre Prozesse? (1–10)", type:"slider", min:1, max:10, step:1 },
  { key:"prozesse_papierlos", label:"Anteil papierloser Prozesse", type:"select",
    options:[ {value:"0-20",label:"0–20 %"}, {value:"21-50",label:"21–50 %"}, {value:"51-80",label:"51–80 %"}, {value:"81-100",label:"81–100 %"} ] },
  { key:"automatisierungsgrad", label:"Automatisierungsgrad", type:"select",
    options:[ {value:"sehr_niedrig",label:"Sehr niedrig"}, {value:"eher_niedrig",label:"Eher niedrig"}, {value:"mittel",label:"Mittel"}, {value:"eher_hoch",label:"Eher hoch"}, {value:"sehr_hoch",label:"Sehr hoch"} ] },
  { key:"ki_einsatz", label:"Wo wird KI heute bereits eingesetzt?", type:"checkbox",
    options:[ "marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","keine","sonstiges" ]
      .map(v => ({ value:v, label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Vertrieb": v==="buchhaltung"?"Buchhaltung":
        v==="produktion"?"Produktion": v==="kundenservice"?"Kundenservice": v==="it"?"IT":
        v==="forschung"?"Forschung & Entwicklung": v==="personal"?"Personal":
        v==="keine"?"Noch keine Nutzung":"Sonstiges"})) },
  { key:"ki_knowhow", label:"KI‑Know‑how im Team", type:"select",
    options:[
      {value:"keine",label:"Keine Erfahrung"},{value:"grundkenntnisse",label:"Grundkenntnisse"},
      {value:"mittel",label:"Mittel"},{value:"fortgeschritten",label:"Fortgeschritten"},{value:"expertenwissen",label:"Expertenwissen"}
    ]},

  // Block 3
  { key:"projektziel", label:"Ziel des nächsten KI-/Digitalisierungsprojekts", type:"checkbox",
    options:[
      {value:"prozessautomatisierung",label:"Prozessautomatisierung"},{value:"kostensenkung",label:"Kostensenkung"},
      {value:"compliance",label:"Compliance/Datenschutz"},{value:"produktinnovation",label:"Produktinnovation"},
      {value:"kundenservice",label:"Kundenservice verbessern"},{value:"markterschliessung",label:"Markterschließung"},
      {value:"personalentlastung",label:"Personalentlastung"},{value:"foerdermittel",label:"Fördermittel beantragen"},
      {value:"andere",label:"Andere"}
    ]},
  { key:"ki_projekte", label:"Laufende/geplante KI‑Projekte", type:"textarea",
    placeholder:"z. B. Chatbot, Angebots‑Automation, Generatoren, Analytics …" },
  { key:"ki_usecases", label:"Besonders interessante KI‑Use‑Cases", type:"checkbox",
    options:[
      {value:"texterstellung",label:"Texterstellung (z. B. Berichte, Posts)"},
      {value:"bildgenerierung",label:"Bildgenerierung (z. B. Grafiken, Logo‑Varianten)"},
      {value:"spracherkennung",label:"Spracherkennung (z. B. Transkription, Voicebots)"},
      {value:"prozessautomatisierung",label:"Prozessautomatisierung (z. B. Belegprüfung, Versand)"},
      {value:"datenanalyse",label:"Datenanalyse & Prognose (z. B. Markttrends)"},
      {value:"kundensupport",label:"Kundensupport (z. B. Chatbots, FAQ‑Automation)"},
      {value:"wissensmanagement",label:"Wissensmanagement (z. B. DMS, intelligente Suche)"},
      {value:"marketing",label:"Marketing (z. B. Segmentierung, Kampagnenoptimierung)"},
      {value:"sonstiges",label:"Sonstiges"}
    ]},
  { key:"ki_potenzial", label:"Größtes KI‑Potenzial im Unternehmen", type:"textarea",
    placeholder:"z. B. Reporting, personalisierte Angebote, Automatisierung, neue Services …" },
  { key:"usecase_priority", label:"Bereich mit höchster Priorität", type:"select",
    options:[ "marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","unbekannt" ]
      .map(v => ({ value:v, label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Vertrieb": v==="buchhaltung"?"Buchhaltung":
        v==="produktion"?"Produktion": v==="kundenservice"?"Kundenservice": v==="it"?"IT":
        v==="forschung"?"Forschung & Entwicklung": v==="personal"?"Personal":"Noch unklar / später entscheiden" })) },
  { key:"ki_geschaeftsmodell_vision", label:"Wie kann KI Geschäftsmodell/Branche verändern?", type:"textarea",
    placeholder:"z. B. KI‑gestütztes Portal, datenbasierte Plattform, neue Produkte …" },
  { key:"moonshot", label:"Mutiger Durchbruch – 3‑Jahres‑Vision", type:"textarea",
    placeholder:"z. B. 80 % Routine übernimmt KI; Umsatz +100 % durch Automation …" },

  // Block 4 — Strategie & Governance
  { key:"strategische_ziele", label:"Welche konkreten Ziele verfolgen Sie mit KI?", type:"textarea",
    placeholder:"z. B. Effizienz steigern, neue Produkte entwickeln, Kundenservice verbessern" },
  { key:"datenqualitaet", label:"Datenqualität", type:"select",
    options:[ {value:"hoch",label:"Hoch (vollständig, strukturiert, aktuell)"},
             {value:"mittel",label:"Mittel (teilweise strukturiert/lückenhaft)"},
             {value:"niedrig",label:"Niedrig (unstrukturiert, viele Lücken)"} ] },
  { key:"ai_roadmap", label:"KI‑Roadmap/Strategie vorhanden?", type:"select",
    options:[ {value:"ja",label:"Ja – bereits implementiert"},
             {value:"in_planung",label:"In Planung"},
             {value:"nein",label:"Noch nicht vorhanden"} ] },
  { key:"governance", label:"Richtlinien für Daten/KI‑Governance?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"teilweise",label:"Teilweise"},{value:"nein",label:"Nein"} ] },
  { key:"innovationskultur", label:"Innovationskultur", type:"select",
    options:[ {value:"sehr_offen",label:"Sehr offen"},{value:"eher_offen",label:"Eher offen"},
             {value:"neutral",label:"Neutral"},{value:"eher_zurueckhaltend",label:"Eher zurückhaltend"},
             {value:"sehr_zurueckhaltend",label:"Sehr zurückhaltend"} ] },

  // Block 5 — Ressourcen & Präferenzen
  { key:"zeitbudget", label:"Zeitbudget für KI‑Projekte (pro Woche)", type:"select",
    options:[ {value:"unter_2",label:"Unter 2 Stunden"},{value:"2_5",label:"2–5 Stunden"},
             {value:"5_10",label:"5–10 Stunden"},{value:"ueber_10",label:"Über 10 Stunden"} ] },
  { key:"vorhandene_tools", label:"Bereits genutzte Systeme/Tools", type:"checkbox",
    options:[
      {value:"crm",label:"CRM (z. B. HubSpot, Salesforce)"},{value:"erp",label:"ERP (z. B. SAP, Odoo)"},
      {value:"projektmanagement",label:"Projektmanagement (z. B. Asana, Trello)"},
      {value:"marketing_automation",label:"Marketing‑Automation (z. B. Mailchimp, HubSpot)"},
      {value:"buchhaltung",label:"Buchhaltung (z. B. Lexware, Xero)"},{value:"keine",label:"Keine / andere"}
    ]},
  { key:"regulierte_branche", label:"Regulierte Branche?", type:"checkbox",
    options:[
      {value:"gesundheit",label:"Gesundheit & Medizin"},{value:"finanzen",label:"Finanzen & Versicherungen"},
      {value:"oeffentlich",label:"Öffentlicher Sektor"},{value:"recht",label:"Rechtliche Dienstleistungen"},
      {value:"keine",label:"Keine dieser Branchen"}
    ]},
  { key:"trainings_interessen", label:"Interesse an KI‑Trainings", type:"checkbox",
    options:[
      {value:"prompt_engineering",label:"Prompt Engineering"},{value:"llm_basics",label:"LLM‑Grundlagen"},
      {value:"datenqualitaet_governance",label:"Datenqualität & Governance"},
      {value:"automatisierung",label:"Automatisierung & Skripte"},{value:"ethik_recht",label:"Ethik & Recht"},
      {value:"keine",label:"Keine / unklar"}
    ]},
  { key:"vision_prioritaet", label:"Priorität Ihrer Vision", type:"select",
    options:[
      {value:"gpt_services",label:"GPT‑basierte Services für KMU"},{value:"kundenservice",label:"Kundenservice verbessern"},
      {value:"datenprodukte",label:"Neue datenbasierte Produkte"},{value:"prozessautomation",label:"Prozessautomatisierung"},
      {value:"marktfuehrerschaft",label:"Marktführerschaft erreichen"},{value:"keine_angabe",label:"Keine Angabe / weiß nicht"}
    ]},

  // Block 6 — Rechtliches & Förderung
  { key:"datenschutzbeauftragter", label:"Gibt es eine:n Datenschutzbeauftragte:n?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"teilweise",label:"Teilweise (extern/Planung)"} ] },
  { key:"technische_massnahmen", label:"Technische Schutzmaßnahmen", type:"select",
    options:[ {value:"alle",label:"Alle relevanten Maßnahmen"},{value:"teilweise",label:"Teilweise vorhanden"},{value:"keine",label:"Noch keine"} ] },
  { key:"folgenabschaetzung", label:"DSFA (Datenschutz‑Folgenabschätzung) erstellt?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"teilweise",label:"Teilweise"} ] },
  { key:"meldewege", label:"Meldewege bei Datenschutzvorfällen", type:"select",
    options:[ {value:"ja",label:"Ja, klar geregelt"},{value:"teilweise",label:"Teilweise geregelt"},{value:"nein",label:"Nein"} ] },
  { key:"loeschregeln", label:"Regeln zur Löschung/Anonymisierung", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"teilweise",label:"Teilweise"},{value:"nein",label:"Nein"} ] },
  { key:"ai_act_kenntnis", label:"Kenntnis EU AI Act", type:"select",
    options:[ {value:"sehr_gut",label:"Sehr gut"},{value:"gut",label:"Gut"},{value:"gehört",label:"Schon mal gehört"},{value:"unbekannt",label:"Noch nicht beschäftigt"} ] },
  { key:"ki_hemmnisse", label:"Hemmnisse beim KI‑Einsatz", type:"checkbox",
    options:[
      {value:"rechtsunsicherheit",label:"Unsicherheit bei Rechtslage"},{value:"datenschutz",label:"Datenschutz"},
      {value:"knowhow",label:"Fehlendes Know‑how"},{value:"budget",label:"Begrenztes Budget"},
      {value:"teamakzeptanz",label:"Akzeptanz im Team"},{value:"zeitmangel",label:"Zeitmangel"},
      {value:"it_integration",label:"IT‑Integration"},{value:"keine",label:"Keine Hemmnisse"},{value:"andere",label:"Andere"}
    ] },
  { key:"bisherige_foerdermittel", label:"Bereits Fördermittel erhalten?", type:"select", options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"} ] },
  { key:"interesse_foerderung", label:"Fördermöglichkeiten interessant?", type:"select", options:[ {value:"ja",label:"Ja, bitte Programme vorschlagen"},{value:"nein",label:"Nein"},{value:"unklar",label:"Unklar, bitte beraten"} ] },
  { key:"erfahrung_beratung", label:"Beratung zu Digitalisierung/KI?", type:"select", options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"unklar",label:"Unklar"} ] },
  { key:"investitionsbudget", label:"Budget (nächstes Jahr)", type:"select",
    options:[ {value:"unter_2000",label:"Unter 2.000 €"},{value:"2000_10000",label:"2.000–10.000 €"},{value:"10000_50000",label:"10.000–50.000 €"},{value:"ueber_50000",label:"Über 50.000 €"},{value:"unklar",label:"Noch unklar"} ] },
  { key:"marktposition", label:"Marktposition", type:"select",
    options:[ {value:"marktfuehrer",label:"Marktführer"},{value:"oberes_drittel",label:"Oberes Drittel"},{value:"mittelfeld",label:"Mittelfeld"},{value:"nachzuegler",label:"Nachzügler/Aufholer"},{value:"unsicher",label:"Schwer einzuschätzen"} ] },
  { key:"benchmark_wettbewerb", label:"Vergleich mit Wettbewerbern", type:"select", options:[ {value:"ja",label:"Ja, regelmäßig"},{value:"nein",label:"Nein"},{value:"selten",label:"Selten / informell"} ] },
  { key:"innovationsprozess", label:"Wie entstehen Innovationen?", type:"select",
    options:[ {value:"innovationsteam",label:"Internes Innovationsteam"},{value:"mitarbeitende",label:"Durch Mitarbeitende"},{value:"kunden",label:"Mit Kunden"},{value:"berater",label:"Mit externen Partnern"},{value:"zufall",label:"Eher zufällig/ungeplant"},{value:"unbekannt",label:"Keine klare Strategie"} ] },
  { key:"risikofreude", label:"Risikofreude (1–5)", type:"slider", min:1, max:5, step:1 },

  // Block 7 — Datenschutz & Absenden
  { key:"datenschutz", type:"privacy",
    label:"Ich habe die <a href='datenschutz.html' onclick='window.open(this.href,\"DatenschutzPopup\",\"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
    description:"Ihre Angaben werden ausschließlich zur Erstellung Ihrer persönlichen Auswertung genutzt." }
];

const blocks = [
  { name:"Unternehmensinfos", keys:["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
  { name:"Status Quo", keys:["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
  { name:"Ziele & Projekte", keys:["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
  { name:"Strategie & Governance", keys:["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
  { name:"Ressourcen & Präferenzen", keys:["zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"] },
  { name:"Rechtliches & Förderung", keys:["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
  { name:"Datenschutz & Absenden", keys:["datenschutz"] }
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

// ===== Renderer (Single-Page) =====
function renderAllBlocks(){
  try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }catch(_){}
  const root = document.getElementById("formbuilder"); if (!root) return;
  let html = "";
  for (let i = 0; i < blocks.length; i++){
    const block = blocks[i];
    html += `<section class="fb-section"><div class="fb-section-head"><span class="fb-step">Schritt ${i+1}/${blocks.length}</span> – <b>${block.name}</b></div>`;
    const intro = BLOCK_INTRO[i] || "";
    if (intro) html += `<div class="section-intro">${intro}</div>`;
    html += block.keys.map(key => {
      const field = findField(key); if (!field) return "";
      if (field.showIf && !field.showIf(formData)) return "";
      const guidance = field.description ? `<div class="guidance${field.type === "privacy" ? " important" : ""}">${field.description}</div>` : "";
      let input = "";
      switch(field.type){
        case "select": {
          const selectedValue = formData[field.key] || "";
          input = `<select id="${field.key}" name="${field.key}"><option value="">Bitte wählen...</option>` +
            (field.options || []).map(opt => {
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
      const labelHtml = field.type !== "privacy" ? `<label for="${field.key}"><b>${field.label}</b></label>` : "";
      return `<div class="form-group">${labelHtml}${guidance}${input}</div>`;
    }).join("");
    html += `</section>`;
  }
  html += `<div class="form-nav">
      <div class="nav-left"></div>
      <div class="nav-right">
        <button type="button" id="btn-send" class="btn-next">Absenden</button>
        <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
      </div>
    </div><div id="feedback"></div>`;
  root.innerHTML = html;
}

// ===== Events =====
function handleFormEvents(){
  const root = document.getElementById("formbuilder"); if (!root) return;

  root.addEventListener("change", (e) => {
    const target = e.target;
    // Update only the field that changed (fast)
    const f = fields.find(x => x.key === target.id || (target.name && x.key === target.name));
    if (f){
      formData[f.key] = getFieldValue(f);
      markInvalid(f.key, false);
      saveAutosave();
      // Rerender when showIf might change
      if (f.key === "unternehmensgroesse"){ renderAllBlocks(); setTimeout(handleFormEvents, 20); }
    } else {
      // Fallback: update everything
      for (const fx of fields){ formData[fx.key] = getFieldValue(fx); }
      saveAutosave();
    }
  });

  root.addEventListener("click", (e) => {
    if (e.target.id === "btn-reset"){
      try{ localStorage.removeItem(autosaveKey); }catch(_){}
      formData = {}; renderAllBlocks(); setTimeout(handleFormEvents,20);
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

  // Grobe Pflichtfeld-Prüfung je Block
  const missing = [];
  for (let i=0;i<blocks.length;i++){
    const m = validateBlockDetailed(i);
    if (m.length){ missing.push(...m); }
  }
  const fb = getFeedbackBox();
  if (missing.length && fb){
    fb.innerHTML = `<div class="form-error">Bitte füllen Sie folgende Felder aus:<ul>${missing.map(m=>`<li>${m}</li>`).join("")}</ul></div>`;
    fb.style.display = 'block';
    const firstInvalid = document.querySelector('.invalid, .invalid-group');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
    return;
  } else if (fb){ fb.innerHTML = ""; fb.style.display = 'none'; }

  // Danke-Bildschirm
  const form = document.getElementById("formbuilder");
  if (form){
    form.querySelectorAll("button").forEach(b => b.disabled = true);
    form.innerHTML = `<h2>Vielen Dank für Ihre Angaben!</h2>
      <div class="success-msg" style="margin-top:10px;">
        Ihre KI‑Analyse wird jetzt erstellt.<br>
        Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E‑Mail.<br>
        Sie können dieses Fenster jetzt schließen.
      </div>`;
  }

  let token = null; try{ token = localStorage.getItem("jwt") || null; }catch(_){}
  if (!token){
    if (form) form.insertAdjacentHTML("beforeend",
      `<div class="form-error" style="margin-top:12px">
        Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>,
        wenn Sie eine weitere Analyse durchführen möchten.
       </div>`);
    return;
  }

  // Request im Hintergrund starten
  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  const data = {}; fields.forEach(f => data[f.key] = formData[f.key]);
  data.lang = "de";
  try{
    fetch(`${BASE_URL}/briefing_async`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(data),
      keepalive: true
    }).then(res => {
      if (res.status === 401){
        try{ localStorage.removeItem("jwt"); }catch(_){}
        if (form) form.insertAdjacentHTML("beforeend",
          `<div class="form-error" style="margin-top:12px">
            Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>.
           </div>`);
      }
    }).catch(() => {});
  }catch(_){}
}

// ===== Init =====
window.addEventListener("DOMContentLoaded", () => {
  renderAllBlocks();
  setTimeout(handleFormEvents, 20);
});
