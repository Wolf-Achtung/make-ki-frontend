<script>
// ===============================================================
// KI-Checkup-Report – Formbuilder (DE)  —  SINGLE-PAGE, FULL BUILD
// Stand: 2025-09-25  —  Layout großzügig, größere Typo, viele Hilfetexte
// ===============================================================

/* =========================
   Design (CSS per Injection)
   ========================= */
(function () {
  try {
    const css = `
:root{
  --fb-font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans";
  --fb-fg: #123B70;              /* dunkles Blau für Copytexte */
  --fb-accent: #0E4AA1;          /* Akzentblau (Buttons/Headlines) */
  --fb-muted: #5A6B84;           /* Sekundärtext */
  --fb-bg: #F4F7FB;              /* Seitenhintergrund */
  --fb-card: #FFFFFF;
  --fb-border: #E2E8F4;
  --fb-border-strong: #D4DDED;
  --fb-badge: #E9F0FB;
  --fb-error-bg:#FDECEA; --fb-error-border:#F6C7C3; --fb-error:#B52B27;
  --fb-ok-bg:#EAF7EA; --fb-ok-border:#C9E7C9; --fb-ok:#2F6B2F;
}

body{ background:var(--fb-bg); }
#formbuilder{
  font-family:var(--fb-font); color:var(--fb-fg);
  max-width:980px; margin:24px auto 80px; padding:0 16px;
}

.fb-section{
  background:var(--fb-card); border:1px solid var(--fb-border);
  border-radius:16px; padding:24px 24px 8px; margin:20px 0 32px;
  box-shadow:0 1px 2px rgba(18,59,112,.04);
}
.fb-section-head{ font-size:1.22rem; margin-bottom:16px; color:var(--fb-accent); font-weight:600; }
.fb-step{ font-weight:700; background:var(--fb-badge); padding:4px 10px; border-radius:999px; margin-right:8px; }

.section-intro{
  background:var(--fb-badge); border:1px solid var(--fb-border-strong);
  border-radius:10px; padding:12px 14px; margin:8px 0 14px; color:var(--fb-fg);
}

label{ display:block; font-size:1.08rem; margin:12px 0 6px; }
.guidance{ color:var(--fb-muted); font-size:1rem; line-height:1.5; margin:0 0 12px; }
.guidance.important{ font-weight:600; }

.form-group{ margin:22px 0 22px; }

input[type=text], select, textarea{
  font-size:1.06rem; width:100%; box-sizing:border-box;
  border:1px solid var(--fb-border-strong); border-radius:12px;
  padding:12px 14px; background:#fff; outline:none;
}
textarea{ min-height:128px; line-height:1.45; }

input[type=range]{ width:100%; }

.checkbox-group{ display:grid; grid-template-columns:1fr; gap:12px 16px; }
.checkbox-group.twocol{ grid-template-columns:1fr 1fr; }
.checkbox-label{
  display:flex; align-items:flex-start; gap:10px;
  padding:10px 12px; border:1px solid #E6EDF8; border-radius:12px; background:#FAFCFF;
}
.checkbox-label input{ margin-top:6px; }
.option-example{ font-size:.95rem; color:var(--fb-muted); }

.progress-bar{ height:10px; background:#E2E9F6; border-radius:999px; overflow:hidden; }
.progress-bar-inner{ height:100%; background:linear-gradient(90deg, #0E4AA1, #2C6CD1); }
.progress-label{ font-size:.95rem; color:var(--fb-muted); margin-top:8px; }

.form-nav{ display:flex; justify-content:space-between; align-items:center; margin-top:18px; padding:16px 0 8px; }
.btn-next{
  background:linear-gradient(135deg,#0E4AA1,#2C6CD1); color:#fff; border:0;
  padding:14px 20px; border-radius:12px; font-size:1rem; cursor:pointer;
}
.btn-reset{ color:var(--fb-accent); background:transparent; border:0; padding:12px 16px; font-size:.95rem; cursor:pointer; }

.invalid{ border-color:#D9534F!important; }
.invalid-group select, .invalid-group textarea, .invalid-group input[type=text]{ border-color:#D9534F!important; }

.form-error{
  background:var(--fb-error-bg); color:var(--fb-error);
  border:1px solid var(--fb-error-border); padding:12px 14px; border-radius:12px;
}
.success-msg{
  background:var(--fb-ok-bg); color:var(--fb-ok);
  border:1px solid var(--fb-ok-border); padding:14px 16px; border-radius:12px;
}

.privacy-section label{ display:flex; gap:10px; align-items:flex-start; }

@media (max-width: 780px){
  #formbuilder{ padding:0 12px; }
  .checkbox-group.twocol{ grid-template-columns:1fr; }
}
`;
    const s = document.createElement('style'); s.id = 'fb-style';
    s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  } catch (_) {}
})();

/* =========================
   JWT / Session-Utilities
   ========================= */
function getToken(){ try { return localStorage.getItem("jwt") || null; } catch(e){ return null; } }
function showSessionHint(){
  const el = document.getElementById("formbuilder");
  if (!el) return;
  el.insertAdjacentHTML("beforeend",
    `<div class="form-error" style="margin-top:12px">
       Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>,
       wenn Sie eine weitere Analyse durchführen möchten.
     </div>`);
}
function getEmailFromJWT(token){
  try { const payload = JSON.parse(atob(token.split(".")[1])); return payload.email || payload.sub || null; }
  catch(_){ return null; }
}
function isAdmin(token){
  try { const payload = JSON.parse(atob(token.split(".")[1])); return payload.role === "admin"; }
  catch(_){ return false; }
}

/* ============================================================================
   Helpers (Validierung & Checkbox-Labels)
   ========================================================================== */
function splitLabelAndHint(raw){
  if (!raw) return ["",""];
  const s = String(raw).trim();
  const m = s.match(/^(.+?)\\s*\\(([^)]+)\\)\\s*$/);
  if (m) return [m[1].trim(), m[2].trim()];
  const parts = s.split(/\\s{2,}| — | – | - /).map(x=>x.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];
  return [s, ""];
}
function findField(key){ return fields.find(f => f.key === key); }
function getFieldLabel(key){ const f = findField(key); return (f && f.label) ? f.label : key; }

function markInvalid(key, on = true){
  const el = document.getElementById(key);
  if (!el) return;
  if (on) el.classList.add('invalid'); else el.classList.remove('invalid');
  const grp = el.closest('.form-group');
  if (grp){
    if (on) grp.classList.add('invalid-group'); else grp.classList.remove('invalid-group');
  }
}

function validateBlockDetailed(blockIdx){
  const block = blocks[blockIdx];
  const optional = new Set([
    "jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen",
    // neuer Ressourcen-Block: alles optional
    "zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"
  ]);
  const missing = [];
  block.keys.forEach(k => markInvalid(k, false));
  for (const key of block.keys){
    const f = findField(key); if (!f) continue;
    if (f.showIf && !f.showIf(formData)) continue;
    if (optional.has(key)) continue;
    const val = formData[key];
    let ok = true;
    if (f.type === "checkbox") ok = Array.isArray(val) && val.length > 0;
    else if (f.type === "privacy") ok = (val === true);
    else ok = (val !== undefined && String(val).trim() !== "");
    if (!ok){ missing.push(getFieldLabel(key)); markInvalid(key, true); }
  }
  return missing;
}
function getFeedbackBox(){
  return document.querySelector('#formbuilder .form-nav + #feedback') || document.getElementById('feedback');
}

/* ============================================================================
   FELDER + erklärende Texte (DE)
   ========================================================================== */

// Kurztexte zu jeder Section (Intro-Boxen)
const BLOCK_INTRO = [
  "Hier erfassen wir Basisdaten (E‑Mail, Branche, Größe, Standort). Sie steuern die Personalisierung des Reports und die passenden Förder‑ & Compliance‑Hinweise.",
  "Status‑Quo zu Prozessen, Daten und bisherigen KI‑Erfahrungen. Damit kalibrieren wir Quick Wins und die Start‑Roadmap.",
  "Ziele & wichtigste Anwendungsfälle: Was soll KI konkret leisten? Das fokussiert Empfehlungen und priorisiert Maßnahmen.",
  "Ressourcen & Präferenzen (Zeit, Tool‑Affinität, vorhandene Lösungen). So passen wir Empfehlungen an Machbarkeit & Tempo an.",
  "Recht & Datenschutz (Opt‑in): Notwendig für den sicheren Versand und für DSGVO/EU‑AI‑Act‑konforme Auswertung.",
  "Projektpriorisierung & Roadmap‑Hinweise: Gewichten Sie, was zuerst kommen soll – das fließt direkt in die Roadmap ein.",
  "Abschließen & Absenden: Kurzer Check, Einwilligung bestätigen und den personalisierten Report starten."
];

// Felder (deine vollständige Struktur + neue Ressourcen-Felder)
const fields = [
  // Block 1: Unternehmensinfos
  { key:"branche", label:"In welcher Branche ist Ihr Unternehmen tätig?", type:"select",
    options:[
      {value:"marketing",label:"Marketing & Werbung"},
      {value:"beratung",label:"Beratung & Dienstleistungen"},
      {value:"it",label:"IT & Software"},
      {value:"finanzen",label:"Finanzen & Versicherungen"},
      {value:"handel",label:"Handel & E‑Commerce"},
      {value:"bildung",label:"Bildung"},
      {value:"verwaltung",label:"Verwaltung"},
      {value:"gesundheit",label:"Gesundheit & Pflege"},
      {value:"bau",label:"Bauwesen & Architektur"},
      {value:"medien",label:"Medien & Kreativwirtschaft"},
      {value:"industrie",label:"Industrie & Produktion"},
      {value:"logistik",label:"Transport & Logistik"}
    ],
    description:"Ihre Hauptbranche beeinflusst Benchmarks, Tool‑Empfehlungen und die Auswertung. Wählen Sie das Kerngeschäft, auf das Ihr Report zugeschnitten sein soll."
  },
  { key:"unternehmensgroesse", label:"Wie groß ist Ihr Unternehmen (Mitarbeiter:innen)?", type:"select",
    options:[ {value:"solo",label:"1 (Solo‑Selbstständig/Freiberuflich)"},
              {value:"team",label:"2–10 (Kleines Team)"},
              {value:"kmu",label:"11–100 (KMU)"} ],
    description:"Die Unternehmensgröße beeinflusst Empfehlungen, Fördermöglichkeiten und Vergleichswerte."
  },
  { key:"selbststaendig", label:"Unternehmensform bei 1 Person", type:"select",
    options:[
      {value:"freiberufler",label:"Freiberuflich/Selbstständig"},
      {value:"kapitalgesellschaft",label:"1‑Personen‑Kapitalgesellschaft (GmbH/UG)"},
      {value:"einzelunternehmer",label:"Einzelunternehmer (mit Gewerbe)"},
      {value:"sonstiges",label:"Sonstiges"}
    ],
    description:"Bitte wählen Sie die zutreffende Rechtsform. So erhalten Sie Auswertungen, die genau zu Ihrer Situation passen.",
    showIf:(data)=>data.unternehmensgroesse==="solo"
  },
  { key:"bundesland", label:"Bundesland (regionale Fördermöglichkeiten)", type:"select",
    options:[
      {value:"bw",label:"Baden‑Württemberg"},{value:"by",label:"Bayern"},
      {value:"be",label:"Berlin"},{value:"bb",label:"Brandenburg"},
      {value:"hb",label:"Bremen"},{value:"hh",label:"Hamburg"},
      {value:"he",label:"Hessen"},{value:"mv",label:"Mecklenburg‑Vorpommern"},
      {value:"ni",label:"Niedersachsen"},{value:"nw",label:"Nordrhein‑Westfalen"},
      {value:"rp",label:"Rheinland‑Pfalz"},{value:"sl",label:"Saarland"},
      {value:"sn",label:"Sachsen"},{value:"st",label:"Sachsen‑Anhalt"},
      {value:"sh",label:"Schleswig‑Holstein"},{value:"th",label:"Thüringen"}
    ],
    description:"Ihr Standort entscheidet, welche Förderprogramme und Beratungsangebote Sie optimal nutzen können."
  },
  { key:"hauptleistung", label:"Wichtigstes Produkt / Hauptdienstleistung", type:"textarea",
    placeholder:"z. B. Social‑Media‑Kampagnen, CNC‑Fertigung, Steuerberatung für Startups",
    description:"Beschreiben Sie Ihre zentrale Leistung möglichst konkret. Beispiele helfen, Positionierung und Empfehlungen zu präzisieren."
  },
  { key:"zielgruppen", label:"Welche Zielgruppen bedienen Sie?", type:"checkbox",
    options:[
      {value:"b2b",label:"B2B (Geschäftskunden)"},{value:"b2c",label:"B2C (Verbraucher)"},
      {value:"kmu",label:"KMU"},{value:"grossunternehmen",label:"Großunternehmen"},
      {value:"selbststaendige",label:"Selbstständige/Freiberufler"},
      {value:"oeffentliche_hand",label:"Öffentliche Hand"},
      {value:"privatpersonen",label:"Privatpersonen"},{value:"startups",label:"Startups"},
      {value:"andere",label:"Andere"}
    ],
    description:"Bitte alle passenden Zielgruppen auswählen (Mehrfachauswahl möglich)."
  },
  { key:"jahresumsatz", label:"Jahresumsatz (Schätzung)", type:"select",
    options:[
      {value:"unter_100k",label:"bis 100.000 €"},{value:"100k_500k",label:"100.000–500.000 €"},
      {value:"500k_2m",label:"500.000–2 Mio. €"},{value:"2m_10m",label:"2–10 Mio. €"},
      {value:"ueber_10m",label:"über 10 Mio. €"},{value:"keine_angabe",label:"Keine Angabe"}
    ],
    description:"Grobe Schätzung genügt – hilft für Benchmarks und Förderprogramme."
  },
  { key:"it_infrastruktur", label:"Wie ist Ihre IT‑Infrastruktur organisiert?", type:"select",
    options:[
      {value:"cloud",label:"Cloud‑basiert"},{"value":"on_premise","label":"Eigenes Rechenzentrum (On‑Premises)"},
      {value:"hybrid",label:"Hybrid (Cloud + eigene Server)"},{value:"unklar",label:"Unklar / offen"}
    ],
    description:"Hilft, Sicherheit/Integration und Toolauswahl passend zu empfehlen."
  },
  { key:"interne_ki_kompetenzen", label:"Gibt es ein internes KI-/Digitalisierungsteam?", type:"select",
    options:[{value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"in_planung",label:"In Planung"}],
    description:"Wichtig für Schulungs‑ und Struktur‑Empfehlungen."
  },
  { key:"datenquellen", label:"Welche Datentypen stehen zur Verfügung?", type:"checkbox",
    options:[
      {value:"kundendaten",label:"Kundendaten (CRM, Service, Historie)"},
      {value:"verkaufsdaten",label:"Verkaufs-/Bestelldaten"},
      {value:"produktionsdaten",label:"Produktions-/Betriebsdaten"},
      {value:"personaldaten",label:"Personal-/HR‑Daten"},
      {value:"marketingdaten",label:"Marketing-/Kampagnendaten"},
      {value:"sonstige",label:"Sonstige"}
    ],
    description:"Mehrfachauswahl möglich."
  },

  // Block 2: Status Quo
  { key:"digitalisierungsgrad", label:"Wie digital sind Ihre Prozesse? (1–10)", type:"slider", min:1, max:10, step:1,
    description:"1 = vor allem Papier & manuell, 10 = alles digital/automatisiert."
  },
  { key:"prozesse_papierlos", label:"Anteil papierloser Prozesse", type:"select",
    options:[{value:"0-20",label:"0–20 %"}, {value:"21-50",label:"21–50 %"}, {value:"51-80",label:"51–80 %"}, {value:"81-100",label:"81–100 %"}],
    description:"Grobe Schätzung genügt."
  },
  { key:"automatisierungsgrad", label:"Automatisierungsgrad", type:"select",
    options:[{value:"sehr_niedrig",label:"Sehr niedrig"},{value:"eher_niedrig",label:"Eher niedrig"},{value:"mittel",label:"Mittel"},{value:"eher_hoch",label:"Eher hoch"},{value:"sehr_hoch",label:"Sehr hoch"}],
    description:"Handarbeit vs. Automatisierung (KI/Skripte/Tools)."
  },
  { key:"ki_einsatz", label:"Wo wird KI heute genutzt?", type:"checkbox",
    options:["marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","keine","sonstiges"]
      .map(v=>({value:v,label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Vertrieb": v==="buchhaltung"?"Buchhaltung":
        v==="produktion"?"Produktion": v==="kundenservice"?"Kundenservice": v==="it"?"IT":
        v==="forschung"?"Forschung & Entwicklung": v==="personal"?"Personal":
        v==="keine"?"Noch keine Nutzung":"Sonstiges"})),
    description:"Alle relevanten Bereiche ankreuzen."
  },
  { key:"ki_knowhow", label:"KI‑Know‑how im Team", type:"select",
    options:[{value:"keine",label:"Keine Erfahrung"},{value:"grundkenntnisse",label:"Grundkenntnisse"},{value:"mittel",label:"Mittel"},{value:"fortgeschritten",label:"Fortgeschritten"},{value:"expertenwissen",label:"Expertenwissen"}],
    description:"Selbsteinschätzung genügt."
  },

  // Block 3: Ziele & Projekte
  { key:"projektziel", label:"Ziel des nächsten KI-/Digitalisierungsprojekts", type:"checkbox",
    options:[
      {value:"prozessautomatisierung",label:"Prozessautomatisierung"},
      {value:"kostensenkung",label:"Kostensenkung"},
      {value:"compliance",label:"Compliance/Datenschutz"},
      {value:"produktinnovation",label:"Produktinnovation"},
      {value:"kundenservice",label:"Kundenservice verbessern"},
      {value:"markterschliessung",label:"Markterschließung"},
      {value:"personalentlastung",label:"Personalentlastung"},
      {value:"foerdermittel",label:"Fördermittel beantragen"},
      {value:"andere",label:"Andere"}
    ],
    description:"Mehrfachauswahl möglich."
  },
  { key:"ki_projekte", label:"Laufende/geplante KI‑Projekte", type:"textarea",
    placeholder:"z. B. Chatbot, Angebotsautomation, Generatoren, Analytics …",
    description:"Bitte konkret beschreiben (Pilot/Idee/Planung)."
  },
  { key:"ki_usecases", label:"Interessante KI‑Use‑Cases", type:"checkbox",
    options:[
      {value:"texterstellung",label:"Texterstellung (z. B. Berichte, Posts)"},
      {value:"bildgenerierung",label:"Bildgenerierung (z. B. Grafiken)"},
      {value:"spracherkennung",label:"Spracherkennung (z. B. Transkription)"},
      {value:"prozessautomatisierung",label:"Prozessautomatisierung (z. B. Belegprüfung)"},
      {value:"datenanalyse",label:"Datenanalyse & Prognose"},
      {value:"kundensupport",label:"Kundensupport (Chatbots, FAQ)"},
      {value:"wissensmanagement",label:"Wissensmanagement (DMS, Suche)"},
      {value:"marketing",label:"Marketing (Segmentierung, Optimierung)"},
      {value:"sonstiges",label:"Sonstiges"}
    ],
    description:"Mehrfachauswahl möglich."
  },
  { key:"ki_potenzial", label:"Größtes KI‑Potenzial", type:"textarea",
    placeholder:"z. B. Reporting, personalisierte Angebote, Automatisierung …",
    description:"Freitext, gerne stichpunktartig."
  },
  { key:"usecase_priority", label:"Bereich mit höchster Priorität", type:"select",
    options:["marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","unbekannt"]
      .map(v=>({value:v,label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Vertrieb": v==="buchhaltung"?"Buchhaltung":
        v==="produktion"?"Produktion": v==="kundenservice"?"Kundenservice": v==="it"?"IT":
        v==="forschung"?"Forschung & Entwicklung": v==="personal"?"Personal":"Noch unklar / später entscheiden"})),
    description:"Wo lohnt der Einstieg zuerst?"
  },
  { key:"ki_geschaeftsmodell_vision", label:"Wie kann KI Geschäftsmodell/Branche verändern?", type:"textarea",
    placeholder:"z. B. KI‑gestütztes Portal, datenbasierte Plattform, neue Produkte …",
    description:"Visionär denken – aber realistisch umsetzbar."
  },
  { key:"moonshot", label:"Mutiger Durchbruch – 3‑Jahres‑Vision", type:"textarea",
    placeholder:"z. B. 80 % Routine übernimmt KI; Umsatz +100 % durch Automation …",
    description:"Kurze Vision, die begeistert."
  },

  // Block 4: Strategie & Governance
  { key:"strategische_ziele", label:"Welche Ziele verfolgen Sie mit KI?", type:"textarea",
    placeholder:"z. B. Effizienz steigern, neue Produkte, besserer Service",
    description:"Nennen Sie die strategischen Hauptziele Ihres KI‑Einsatzes."
  },
  { key:"datenqualitaet", label:"Qualität Ihrer Daten", type:"select",
    options:[{value:"hoch",label:"Hoch (vollständig, strukturiert, aktuell)"},
             {value:"mittel",label:"Mittel (teilweise strukturiert/lückenhaft)"},
             {value:"niedrig",label:"Niedrig (unstrukturiert, viele Lücken)"}],
    description:"Gut gepflegte Daten sind die Grundlage erfolgreicher KI‑Projekte."
  },
  { key:"ai_roadmap", label:"Gibt es eine KI‑Roadmap oder Strategie?", type:"select",
    options:[{value:"ja",label:"Ja – bereits implementiert"},{value:"in_planung",label:"In Planung"},{value:"nein",label:"Noch nicht vorhanden"}],
    description:"Eine klare Roadmap erleichtert die Umsetzung."
  },
  { key:"governance", label:"Richtlinien für Daten-/KI‑Governance vorhanden?", type:"select",
    options:[{value:"ja",label:"Ja"},{value:"teilweise",label:"Teilweise"},{value:"nein",label:"Nein"}],
    description:"Governance fördert verantwortungsvolle, rechtskonforme Projekte."
  },
  { key:"innovationskultur", label:"Wie offen ist Ihr Unternehmen für Innovationen?", type:"select",
    options:[{value:"sehr_offen",label:"Sehr offen"},{value:"eher_offen",label:"Eher offen"},{value:"neutral",label:"Neutral"},{value:"eher_zurueckhaltend",label:"Eher zurückhaltend"},{value:"sehr_zurueckhaltend",label:"Sehr zurückhaltend"}],
    description:"Offene Kultur erleichtert die Einführung neuer Technologien."
  },

  // Block 5b: Ressourcen & Präferenzen (neu, optional)
  { key:"zeitbudget", label:"Zeitbudget für KI‑Projekte (Std/Woche)", type:"select",
    options:[{value:"unter_2",label:"Unter 2 Stunden"},{value:"2_5",label:"2–5 Stunden"},{value:"5_10",label:"5–10 Stunden"},{value:"ueber_10",label:"Über 10 Stunden"}],
    description:"Wie viel Zeit steht pro Woche für KI‑Projekte zur Verfügung?"
  },
  { key:"vorhandene_tools", label:"Bereits genutzte Tools/Systeme", type:"checkbox",
    options:[
      {value:"crm",label:"CRM (z. B. HubSpot, Salesforce)"},
      {value:"erp",label:"ERP (z. B. SAP, Odoo)"},
      {value:"projektmanagement",label:"Projektmanagement (z. B. Asana, Trello)"},
      {value:"marketing_automation",label:"Marketing Automation (z. B. Mailchimp, HubSpot)"},
      {value:"buchhaltung",label:"Buchhaltung (z. B. Lexware, Xero)"},
      {value:"keine",label:"Keine / andere"}
    ],
    description:"Mehrfachauswahl möglich – hilft bei Integrations- und Tool‑Empfehlungen."
  },
  { key:"regulierte_branche", label:"Regulierte Branche?", type:"checkbox",
    options:[
      {value:"gesundheit",label:"Gesundheit & Medizin"},
      {value:"finanzen",label:"Finanzen & Versicherungen"},
      {value:"oeffentlich",label:"Öffentlicher Sektor"},
      {value:"recht",label:"Rechtliche Dienstleistungen"},
      {value:"keine",label:"Keine dieser Branchen"}
    ],
    description:"Regulierte Branchen erfordern besondere Compliance‑Maßnahmen."
  },
  { key:"trainings_interessen", label:"Interesse an KI‑Trainings", type:"checkbox",
    options:[
      {value:"prompt_engineering",label:"Prompt Engineering"},
      {value:"llm_basics",label:"LLM‑Grundlagen"},
      {value:"datenqualitaet_governance",label:"Datenqualität & Governance"},
      {value:"automatisierung",label:"Automatisierung & Skripte"},
      {value:"ethik_recht",label:"Ethische & rechtliche Grundlagen"},
      {value:"keine",label:"Keine / unklar"}
    ],
    description:"Mehrfachauswahl möglich – dient der Auswahl passender Schulungen."
  },
  { key:"vision_prioritaet", label:"Wichtigster Aspekt Ihrer Vision", type:"select",
    options:[
      {value:"gpt_services",label:"GPT‑basierte Services für KMU"},
      {value:"kundenservice",label:"Kundenservice verbessern"},
      {value:"datenprodukte",label:"Neue datenbasierte Produkte"},
      {value:"prozessautomation",label:"Prozessautomatisierung"},
      {value:"marktfuehrerschaft",label:"Marktführerschaft erreichen"},
      {value:"keine_angabe",label:"Keine Angabe / weiß nicht"}
    ],
    description:"Hilft, Empfehlungen passend zu priorisieren."
  },

  // Block 6: Datenschutz & Absenden
  { key:"datenschutz", type:"privacy",
    label:"Ich habe die <a href='datenschutz.html' onclick='window.open(this.href,\"DatenschutzPopup\",\"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
    description:"Ihre Angaben werden ausschließlich zur Erstellung Ihrer persönlichen Auswertung genutzt."
  }
];

// Block-Struktur (für die Abschnittsüberschriften + Progress)
const blocks = [
  { name:"Unternehmensinfos", keys:["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
  { name:"Status Quo", keys:["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
  { name:"Ziele & Projekte", keys:["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
  { name:"Strategie & Governance", keys:["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
  { name:"Ressourcen & Präferenzen", keys:["zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"] },
  { name:"Rechtliches & Förderung", keys:["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
  { name:"Datenschutz & Absenden", keys:["datenschutz"] }
];

/* ============================================================================
   State / Render / Events
   ========================================================================== */
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

function showProgress(blockIdx){
  const el = document.getElementById("progress");
  if (!el) return;
  el.innerHTML = `
    <div class="progress-bar"><div class="progress-bar-inner" style="width:${Math.round((blockIdx+1)/blocks.length*100)}%"></div></div>
    <div class="progress-label">Schritt ${blockIdx+1} / ${blocks.length} – <b>${blocks[blockIdx].name}</b></div>`;
}

/* Single-page Renderer */
function renderAllBlocks(){
  loadAutosave();
  const root = document.getElementById("formbuilder"); if (!root) return;
  let html = "";
  for (let i=0;i<blocks.length;i++){
    const block = blocks[i];
    html += `<section class="fb-section">
      <div class="fb-section-head"><span class="fb-step">Schritt ${i+1}/${blocks.length}</span> – <b>${block.name}</b></div>`;
    const intro = BLOCK_INTRO[i] || "";
    if (intro) html += `<div class="section-intro">${intro}</div>`;
    html += block.keys.map(key=>{
      const field = findField(key); if (!field) return "";
      if (field.showIf && !field.showIf(formData)) return "";
      const guidance = field.description ? `<div class="guidance${field.type==="privacy"?" important":""}">${field.description}</div>` : "";
      let input = "";
      if (field.type==="select"){
        const selected = formData[field.key] || "";
        input = `<select id="${field.key}" name="${field.key}">
          <option value="">Bitte wählen…</option>
          ${(field.options||[]).map(opt=>{
            const sel = selected===opt.value ? " selected" : "";
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
        const v = formData[field.key] ?? field.min ?? 1;
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
    <button type="button" id="btn-send" class="btn-next">Report erstellen</button>
    <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
  </div></div><div id="feedback"></div>`;
  root.innerHTML = html;
}

function getFieldValue(field){
  if (field.type==="checkbox"){
    return Array.from(document.querySelectorAll(\`input[name="\${field.key}"]:checked\`)).map(e=>e.value);
  } else if (field.type==="slider"){
    const el = document.getElementById(field.key); return el ? el.value : (field.min || 1);
  } else if (field.type==="privacy"){
    const el = document.getElementById(field.key); return !!(el && el.checked);
  }
  const el = document.getElementById(field.key); return el ? el.value : "";
}

function setFieldValues(blockIdx){
  const block = blocks[blockIdx];
  for (const key of block.keys){
    const f = findField(key); if (!f) continue;
    const el = document.getElementById(f.key); if (!el) continue;
    if (f.type==="checkbox"){
      (formData[key]||[]).forEach(v=>{
        const box = document.querySelector(\`input[name="\${f.key}"][value="\${v}"]\`);
        if (box) box.checked = true;
      });
    } else if (f.type==="slider"){
      const val = formData[key] ?? f.min ?? 1;
      el.value = val; if (el.nextElementSibling) el.nextElementSibling.innerText = val;
    } else if (f.type==="privacy"){
      el.checked = formData[key] === true;
    } else if (formData[key] !== undefined){
      el.value = formData[key];
    }
  }
}

function handleFormEvents(){
  const root = document.getElementById("formbuilder"); if (!root) return;

  root.addEventListener("change", () => {
    // Alle Felder aktualisieren & Validierungsmarker entfernen
    for (const f of fields){
      const curr = getFieldValue(f);
      formData[f.key] = curr;
      markInvalid(f.key, false);
    }
    saveAutosave();
    renderAllBlocks(); // sorgt für Show/Hide bei showIf‑Feldern (z. B. Rechtsform)
    setTimeout(()=>setFieldValues(currentBlock), 20);
  });

  root.addEventListener("click", (e) => {
    if (e.target.id === "btn-reset"){
      try { localStorage.removeItem(autosaveKey); } catch(_){}
      formData = {}; renderAllBlocks(); setTimeout(handleFormEvents,20);
      window.scrollTo({top:0,behavior:"smooth"});
    }
    if (e.target.id === "btn-send"){ submitAllBlocks(); }
  });
}

/* Submit */
function submitAllBlocks(){
  for (const f of fields){ formData[f.key] = getFieldValue(f); }
  saveAutosave();

  // Sofortige UI-Rückmeldung
  const el = document.getElementById("formbuilder");
  if (el){
    el.querySelectorAll("button").forEach(b=>b.disabled=true);
    el.innerHTML = `<h2>Vielen Dank für Ihre Angaben!</h2>
      <div class="success-msg" style="margin-top:10px;">
        Ihre KI-Analyse wird jetzt erstellt.<br>
        Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E-Mail.<br>
        Sie können dieses Fenster jetzt schließen.
      </div>`;
  }

  const token = getToken();
  if (!token){ showSessionHint(); return; }

  // Daten senden (ohne Redirect)
  const data = {}; fields.forEach(f => data[f.key] = formData[f.key]); data.lang = "de";
  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  fetch(`${BASE_URL}/briefing_async`,{
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
    body:JSON.stringify(data),
    keepalive:true
  }).then(res=>{
    if (res.status===401){ try{ localStorage.removeItem("jwt"); }catch(_){}
      showSessionHint();
    }
  }).catch(()=>{ /* stiller Fehler – Admin-Mail/PDF separat */ });
}

/* Init */
window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderAllBlocks();
  setTimeout(handleFormEvents,20);
});
</script>
