// JWT-Check: nur eingeloggte User dürfen dieses Formular nutzen
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

/* ============================================================================
   Helpers (Validierung & Checkbox-Labels)
   ========================================================================== */

// Robuste Aufteilung von Checkbox-Labels in Hauptlabel + Kurzbeschreibung.
// 1) "(...)" wird bevorzugt geparst; 2) Fallback: 2+ Spaces oder Trennstrich
function splitLabelAndHint(raw) {
  if (!raw) return ["", ""];
  const s = String(raw).trim();
  const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return [m[1].trim(), m[2].trim()];
  const parts = s.split(/\s{2,}| — | – | - /).map(x => x.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];
  return [s, ""];
}
// Feld finden / Label holen
function findField(key) { return fields.find(f => f.key === key); }
function getFieldLabel(key) { const f = findField(key); return f?.label || key; }
// Felder visuell markieren/Entmarkieren
function markInvalid(key, on = true) {
  const el = document.getElementById(key);
  if (el) {
    on ? el.classList.add('invalid') : el.classList.remove('invalid');
    const grp = el.closest('.form-group');
    if (grp) on ? grp.classList.add('invalid-group') : grp.classList.remove('invalid-group');
  }
}
// Detaillierte Validierung des aktuellen Blocks
function validateBlockDetailed(blockIdx) {
  const block = blocks[blockIdx];
  const optional = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"]);
  const missing = [];
  block.keys.forEach(k => markInvalid(k, false)); // alte Marker entfernen

  for (const key of block.keys) {
    const f = findField(key); if (!f) continue;
    if (f.showIf && !f.showIf(formData)) continue;
    if (optional.has(key)) continue;

    const val = formData[key];
    let ok = true;
    if (f.type === "checkbox") ok = Array.isArray(val) && val.length > 0;
    else if (f.type === "privacy") ok = (val === true);
    else ok = (val !== undefined && String(val).trim() !== "");

    if (!ok) { missing.push(getFieldLabel(key)); markInvalid(key, true); }
  }
  return missing;
}
function getFeedbackBox(){
  return document.querySelector('#formbuilder .form-nav + #feedback') || document.getElementById('feedback');
}

/* ============================================================================
   FELDER (vollständig)
   ========================================================================== */
const fields = [
  // Block 1: Unternehmensinfos
  {
    key: "branche",
    label: "In welcher Branche ist Ihr Unternehmen tätig?",
    type: "select",
    options: [
      { value: "marketing", label: "Marketing & Werbung" },
      { value: "beratung", label: "Beratung & Dienstleistungen" },
      { value: "it", label: "IT & Software" },
      { value: "finanzen", label: "Finanzen & Versicherungen" },
      { value: "handel", label: "Handel & E-Commerce" },
      { value: "bildung", label: "Bildung" },
      { value: "verwaltung", label: "Verwaltung" },
      { value: "gesundheit", label: "Gesundheit & Pflege" },
      { value: "bau", label: "Bauwesen & Architektur" },
      { value: "medien", label: "Medien & Kreativwirtschaft" },
      { value: "industrie", label: "Industrie & Produktion" },
      { value: "logistik", label: "Transport & Logistik" }
    ],
    description: "Ihre Hauptbranche beeinflusst Benchmarks, Tool-Empfehlungen und die Auswertung. Wählen Sie bitte das Kerngeschäft, auf das Ihr Report zugeschnitten sein soll."
  },
  {
    key: "unternehmensgroesse",
    label: "Wie groß ist Ihr Unternehmen (Mitarbeiter:innen)?",
    type: "select",
    options: [
      { value: "solo", label: "1 (Solo-Selbstständig/Freiberuflich)" },
      { value: "team", label: "2–10 (Kleines Team)" },
      { value: "kmu", label: "11–100 (KMU)" }
    ],
    description: "Die Unternehmensgröße beeinflusst Empfehlungen, Fördermöglichkeiten und Vergleichswerte."
  },
  {
    key: "selbststaendig",
    label: "Unternehmensform bei 1 Person",
    type: "select",
    options: [
      { value: "freiberufler", label: "Freiberuflich/Selbstständig" },
      { value: "kapitalgesellschaft", label: "1-Personen-Kapitalgesellschaft (GmbH/UG)" },
      { value: "einzelunternehmer", label: "Einzelunternehmer (mit Gewerbe)" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "Bitte wählen Sie die zutreffende Rechtsform. So erhalten Sie Auswertungen, die genau auf Ihre Unternehmenssituation passen.",
    showIf: (data) => data.unternehmensgroesse === "solo"
  },
  {
    key: "bundesland",
    label: "Bundesland (regionale Fördermöglichkeiten)",
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
    description: "Ihr Standort entscheidet, welche Fördermittel, Programme und Beratungsangebote Sie optimal nutzen können."
  },
  {
    key: "hauptleistung",
    label: "Was ist das wichtigste Produkt oder die Hauptdienstleistung Ihres Unternehmens?",
    type: "textarea",
    placeholder: "z. B. Social-Media-Kampagnen, CNC-Fertigung, Steuerberatung für Startups",
    description: "Beschreiben Sie Ihre zentrale Leistung möglichst konkret. Beispiele helfen uns, Positionierung und Empfehlungen zu präzisieren."
  },
  {
    key: "zielgruppen",
    label: "Für welche Zielgruppen oder Kundensegmente bieten Sie Ihre Leistungen an?",
    type: "checkbox",
    options: [
      { value: "b2b", label: "B2B  (Geschäftskunden)" },
      { value: "b2c", label: "B2C  (Endverbraucher)" },
      { value: "kmu", label: "KMU  (kleine & mittlere Unternehmen)" },
      { value: "grossunternehmen", label: "Großunternehmen" },
      { value: "selbststaendige", label: "Selbstständige/Freiberufler" },
      { value: "oeffentliche_hand", label: "Öffentliche Hand" },
      { value: "privatpersonen", label: "Privatpersonen" },
      { value: "startups", label: "Startups" },
      { value: "andere", label: "Andere" }
    ],
    description: "Bitte alle passenden Zielgruppen auswählen (Mehrfachauswahl möglich)."
  },

  // Erweiterte Unternehmensangaben
  {
    key: "jahresumsatz",
    label: "Jahresumsatz (Schätzung)",
    type: "select",
    options: [
      { value: "unter_100k", label: "Bis 100.000 €" },
      { value: "100k_500k", label: "100.000–500.000 €" },
      { value: "500k_2m", label: "500.000–2 Mio. €" },
      { value: "2m_10m", label: "2–10 Mio. €" },
      { value: "ueber_10m", label: "Über 10 Mio. €" },
      { value: "keine_angabe", label: "Keine Angabe" }
    ],
    description: "Grobe Schätzung genügt – hilft für Benchmarks und Förderprogramme."
  },
  {
    key: "it_infrastruktur",
    label: "Wie ist Ihre IT-Infrastruktur aktuell organisiert?",
    type: "select",
    options: [
      { value: "cloud", label: "Cloud-basiert (z. B. Microsoft 365, Google Cloud …)" },
      { value: "on_premise", label: "Eigenes Rechenzentrum (On-Premises)" },
      { value: "hybrid", label: "Hybrid (Cloud + eigene Server)" },
      { value: "unklar", label: "Unklar / noch offen" }
    ],
    description: "Hilft, Sicherheit/Integration und Toolauswahl passend zu empfehlen."
  },
  {
    key: "interne_ki_kompetenzen",
    label: "Gibt es ein internes KI-/Digitalisierungsteam?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "in_planung", label: "In Planung" }
    ],
    description: "Wichtig für Schulungs-/Struktur-Empfehlungen."
  },
  {
    key: "datenquellen",
    label: "Welche Datentypen stehen Ihnen für KI-Projekte und Analysen zur Verfügung?",
    type: "checkbox",
    options: [
      { value: "kundendaten", label: "Kundendaten  (CRM, Service, Historie)" },
      { value: "verkaufsdaten", label: "Verkaufs-/Bestelldaten  (Shop, Aufträge)" },
      { value: "produktionsdaten", label: "Produktions-/Betriebsdaten  (Maschinen, Sensoren, Logistik)" },
      { value: "personaldaten", label: "Personal-/HR-Daten  (Mitarbeiter, Bewerbungen, Zeitwirtschaft)" },
      { value: "marketingdaten", label: "Marketing-/Kampagnendaten  (Ads, Social, Newsletter)" },
      { value: "sonstige", label: "Sonstige / weitere Datenquellen" }
    ],
    description: "Mehrfachauswahl möglich."
  },

  // Block 2: Status Quo
  { key: "digitalisierungsgrad", label: "Wie digital sind Ihre internen Prozesse? (1–10)", type: "slider", min:1, max:10, step:1,
    description: "1 = vor allem Papier & manuell, 10 = alles digital/automatisiert." },
  { key: "prozesse_papierlos", label: "Anteil papierloser Prozesse", type:"select",
    options:[ {value:"0-20",label:"0–20 %"},{value:"21-50",label:"21–50 %"},{value:"51-80",label:"51–80 %"},{value:"81-100",label:"81–100 %"} ],
    description:"Grobe Schätzung genügt." },
  { key: "automatisierungsgrad", label: "Automatisierungsgrad", type:"select",
    options:[ {value:"sehr_niedrig",label:"Sehr niedrig"},{value:"eher_niedrig",label:"Eher niedrig"},{value:"mittel",label:"Mittel"},{value:"eher_hoch",label:"Eher hoch"},{value:"sehr_hoch",label:"Sehr hoch"} ],
    description:"Handarbeit vs. Automatisierung (KI/Skripte/Tools)." },
  { key: "ki_einsatz", label: "Wo wird KI heute bereits eingesetzt?", type:"checkbox",
    options:[ "marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","keine","sonstiges" ]
      .map(v => ({ value:v, label:
        v==="marketing"?"Marketing": v==="vertrieb"?"Vertrieb": v==="buchhaltung"?"Buchhaltung":
        v==="produktion"?"Produktion": v==="kundenservice"?"Kundenservice": v==="it"?"IT":
        v==="forschung"?"Forschung & Entwicklung": v==="personal"?"Personal":
        v==="keine"?"Noch keine Nutzung":"Sonstiges"})),
    description:"Alle relevanten Bereiche ankreuzen." },
  { key: "ki_knowhow", label:"KI-Know-how im Team", type:"select",
    options:[
      { value:"keine",label:"Keine Erfahrung" },{ value:"grundkenntnisse",label:"Grundkenntnisse" },
      { value:"mittel",label:"Mittel" },{ value:"fortgeschritten",label:"Fortgeschritten" },
      { value:"expertenwissen",label:"Expertenwissen" }
    ],
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
    description:"Mehrfachauswahl möglich." },
  { key:"ki_projekte", label:"Laufende/geplante KI-Projekte", type:"textarea",
    placeholder:"z. B. Chatbot, Angebotsautomation, Generatoren, Analytics …",
    description:"Bitte konkret beschreiben (Pilot/Idee/Planung)." },
  { key:"ki_usecases", label:"Besonders interessante KI-Use-Cases", type:"checkbox",
    options:[
      {value:"texterstellung",label:"Texterstellung (z. B. Berichte, Posts)"},
      {value:"bildgenerierung",label:"Bildgenerierung (z. B. Grafiken, Logo-Varianten)"},
      {value:"spracherkennung",label:"Spracherkennung (z. B. Transkription, Voicebots)"},
      {value:"prozessautomatisierung",label:"Prozessautomatisierung (z. B. Belegprüfung, Versand)"},
      {value:"datenanalyse",label:"Datenanalyse & Prognose (z. B. Markttrends)"},
      {value:"kundensupport",label:"Kundensupport (z. B. Chatbots, FAQ-Automation)"},
      {value:"wissensmanagement",label:"Wissensmanagement (z. B. DMS, intelligente Suche)"},
      {value:"marketing",label:"Marketing (z. B. Segmentierung, Kampagnenoptimierung)"},
      {value:"sonstiges",label:"Sonstiges"}
    ],
    description:"Mehrfachauswahl möglich."
  },
  { key:"ki_potenzial", label:"Größtes KI-Potenzial im Unternehmen", type:"textarea",
    placeholder:"z. B. Reporting, personalisierte Angebote, Automatisierung, neue Services …",
    description:"Freitext, gerne stichpunktartig." },
  { key:"usecase_priority", label:"Bereich mit höchster Priorität", type:"select",
    options:[
      "marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","unbekannt"
    ].map(v => ({ value:v, label:
      v==="marketing"?"Marketing": v==="vertrieb"?"Vertrieb": v==="buchhaltung"?"Buchhaltung":
      v==="produktion"?"Produktion": v==="kundenservice"?"Kundenservice": v==="it"?"IT":
      v==="forschung"?"Forschung & Entwicklung": v==="personal"?"Personal":"Noch unklar / später entscheiden"
    })),
    description:"Wo lohnt der Einstieg zuerst?" },
  { key:"ki_geschaeftsmodell_vision", label:"Wie kann KI Geschäftsmodell/Branche verändern?", type:"textarea",
    placeholder:"z. B. KI-gestütztes Portal, datenbasierte Plattform, neue Produkte …",
    description:"Visionär denken – aber realistisch umsetzbar." },
  { key:"moonshot", label:"Mutiger Durchbruch – 3-Jahres-Vision", type:"textarea",
    placeholder:"z. B. 80 % Routine übernimmt KI; Umsatz +100 % durch Automation …",
    description:"Kurze Vision, die begeistert."
  },

  // Block 4: Strategie & Governance (→ fehlende Felder waren Ursache!)
  { key:"strategische_ziele", label:"Welche konkreten Ziele verfolgen Sie mit KI?", type:"textarea",
    placeholder:"z. B. Effizienz steigern, neue Produkte entwickeln, Kundenservice verbessern",
    description:"Nennen Sie die strategischen Hauptziele Ihres KI-Einsatzes." },
  { key:"datenqualitaet", label:"Wie beurteilen Sie die Qualität Ihrer Daten?", type:"select",
    options:[ {value:"hoch",label:"Hoch (vollständig, strukturiert, aktuell)"},{value:"mittel",label:"Mittel (teilweise strukturiert/lückenhaft)"},{value:"niedrig",label:"Niedrig (unstrukturiert, viele Lücken)"} ],
    description:"Gut gepflegte Daten sind die Grundlage erfolgreicher KI-Projekte." },
  { key:"ai_roadmap", label:"Gibt es bereits eine KI-Roadmap oder Strategie?", type:"select",
    options:[ {value:"ja",label:"Ja – bereits implementiert"},{value:"in_planung",label:"In Planung"},{value:"nein",label:"Noch nicht vorhanden"} ],
    description:"Eine klare Roadmap erleichtert die Umsetzung." },
  { key:"governance", label:"Existieren interne Richtlinien für Daten-/KI-Governance?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"teilweise",label:"Teilweise"},{value:"nein",label:"Nein"} ],
    description:"Governance fördert verantwortungsvolle, rechtskonforme Projekte." },
  { key:"innovationskultur", label:"Wie offen ist Ihr Unternehmen für Innovationen?", type:"select",
    options:[ {value:"sehr_offen",label:"Sehr offen"},{value:"eher_offen",label:"Eher offen"},{value:"neutral",label:"Neutral"},{value:"eher_zurueckhaltend",label:"Eher zurückhaltend"},{value:"sehr_zurueckhaltend",label:"Sehr zurückhaltend"} ],
    description:"Offene Kultur erleichtert Einführung neuer Technologien." },

  // Block 5: Rechtliches & Förderung
  { key:"datenschutzbeauftragter", label:"Gibt es eine:n Datenschutzbeauftragte:n?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"teilweise",label:"Teilweise (extern/Planung)"} ],
    description:"Oft Pflicht – intern oder extern." },
  { key:"technische_massnahmen", label:"Technische Schutzmaßnahmen für Daten", type:"select",
    options:[ {value:"alle",label:"Alle relevanten Maßnahmen"},{value:"teilweise",label:"Teilweise vorhanden"},{value:"keine",label:"Noch keine"} ] },
  { key:"folgenabschaetzung", label:"DSGVO-Folgenabschätzung (DSFA) für KI-Anwendungen?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"teilweise",label:"Teilweise"} ] },
  { key:"meldewege", label:"Meldewege bei Datenschutzvorfällen", type:"select",
    options:[ {value:"ja",label:"Ja, klar geregelt"},{value:"teilweise",label:"Teilweise geregelt"},{value:"nein",label:"Nein"} ] },
  { key:"loeschregeln", label:"Regeln zur Löschung/Anonymisierung", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"teilweise",label:"Teilweise"},{value:"nein",label:"Nein"} ] },
  { key:"ai_act_kenntnis", label:"Kenntnis EU AI Act", type:"select",
    options:[ {value:"sehr_gut",label:"Sehr gut"},{value:"gut",label:"Gut"},{value:"gehört",label:"Schon mal gehört"},{value:"unbekannt",label:"Noch nicht beschäftigt"} ] },
  { key:"ki_hemmnisse", label:"Hemmnisse beim KI-Einsatz", type:"checkbox",
    options:[
      {value:"rechtsunsicherheit",label:"Unsicherheit bei Rechtslage"},
      {value:"datenschutz",label:"Datenschutz"},
      {value:"knowhow",label:"Fehlendes Know-how"},
      {value:"budget",label:"Begrenztes Budget"},
      {value:"teamakzeptanz",label:"Akzeptanz im Team"},
      {value:"zeitmangel",label:"Zeitmangel"},
      {value:"it_integration",label:"IT-Integration"},
      {value:"keine",label:"Keine Hemmnisse"},
      {value:"andere",label:"Andere"}
    ] },
  { key:"bisherige_foerdermittel", label:"Bereits Fördermittel erhalten?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"} ] },
  { key:"interesse_foerderung", label:"Fördermöglichkeiten interessant?", type:"select",
    options:[ {value:"ja",label:"Ja, bitte Programme vorschlagen"},{value:"nein",label:"Nein"},{value:"unklar",label:"Unklar, bitte beraten"} ] },
  { key:"erfahrung_beratung", label:"Beratung zu Digitalisierung/KI?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"unklar",label:"Unklar"} ] },
  { key:"investitionsbudget", label:"Budget (nächstes Jahr)", type:"select",
    options:[ {value:"unter_2000",label:"Unter 2.000 €"},{value:"2000_10000",label:"2.000–10.000 €"},{value:"10000_50000",label:"10.000–50.000 €"},{value:"ueber_50000",label:"Über 50.000 €"},{value:"unklar",label:"Noch unklar"} ] },
  { key:"marktposition", label:"Marktposition", type:"select",
    options:[ {value:"marktfuehrer",label:"Marktführer"},{value:"oberes_drittel",label:"Oberes Drittel"},{value:"mittelfeld",label:"Mittelfeld"},{value:"nachzuegler",label:"Nachzügler/Aufholer"},{value:"unsicher",label:"Schwer einzuschätzen"} ] },
  { key:"benchmark_wettbewerb", label:"Vergleich mit Wettbewerbern", type:"select",
    options:[ {value:"ja",label:"Ja, regelmäßig"},{value:"nein",label:"Nein"},{value:"selten",label:"Nur selten / informell"} ] },
  { key:"innovationsprozess", label:"Wie entstehen Innovationen?", type:"select",
    options:[ {value:"innovationsteam",label:"Internes Innovationsteam"},{value:"mitarbeitende",label:"Durch Mitarbeitende"},{value:"kunden",label:"Mit Kunden"},{value:"berater",label:"Mit externen Partnern"},{value:"zufall",label:"Eher zufällig/ungeplant"},{value:"unbekannt",label:"Keine klare Strategie"} ] },
  { key:"risikofreude", label:"Risikofreude (1–5)", type:"slider", min:1, max:5, step:1,
    description:"1 = wenig, 5 = sehr risikofreudig." },

  // Block 6: Datenschutz & Absenden (→ häufig fehlend)
  { key:"datenschutz", label:"Ich habe die <a href='datenschutz.html' onclick='window.open(this.href,\"DatenschutzPopup\",\"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.", type:"privacy",
    description:"Ihre Angaben werden ausschließlich zur Erstellung Ihrer persönlichen Auswertung genutzt." }
];
/* ============================================================================
   Blockstruktur / State / Render / Events
   ========================================================================== */

const blocks = [
  { name:"Unternehmensinfos", keys:["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
  { name:"Status Quo", keys:["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
  { name:"Ziele & Projekte", keys:["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
  { name:"Strategie & Governance", keys:["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
  { name:"Rechtliches & Förderung", keys:["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
  { name:"Datenschutz & Absenden", keys:["datenschutz"] }
];

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
  <div class="progress-label">Schritt ${blockIdx+1} / ${blocks.length} – <b>${blocks[blockIdx].name}</b></div>`;
}

function renderBlock(blockIdx) {
  formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
  showProgress(blockIdx);
  const block = blocks[blockIdx];
  const form = document.getElementById("formbuilder");
  if (!form) return;

  form.innerHTML = block.keys.map(key => {
    const field = findField(key);
    if (!field) return ""; // Schutz: unbekannter Key → kein Render
    if (field.showIf && !field.showIf(formData)) return "";

    const guidance = field.description ? `<div class="guidance${field.key === "datenschutz" ? " important" : ""}">${field.description}</div>` : "";

    let input = "";
    switch (field.type) {
      case "select": {
        const selectedValue = formData[field.key] || "";
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Bitte wählen...</option>
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

  // Navigation
  form.innerHTML += `
    <div class="form-nav">
      <div class="nav-left">
        ${blockIdx > 0 ? `<button type="button" id="btn-prev">Zurück</button>` : ""}
      </div>
      <div class="nav-right">
        ${blockIdx < blocks.length - 1
          ? `<button type="button" id="btn-next">Weiter</button>`
          : `<button type="button" id="btn-send" class="btn-next">Absenden</button>`}
        <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
      </div>
    </div>
    <div id="feedback"></div>`;
}

/* Autosave / Werte lesen/schreiben */
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
    const field = findField(key); if (!field) continue;
    const el = document.getElementById(field.key); if (!el) continue;

    if (field.type === "checkbox") {
      (formData[key] || []).forEach(v => {
        const box = document.querySelector(`input[name="${field.key}"][value="${v}"]`);
        if (box) box.checked = true;
      });
    } else if (field.type === "slider") {
      const val = formData[key] ?? field.min ?? 1;
      el.value = val; if (el.nextElementSibling) el.nextElementSibling.innerText = val;
    } else if (field.type === "privacy") {
      el.checked = formData[key] === true;
    } else {
      if (formData[key] !== undefined) el.value = formData[key];
    }
  }
}

/* Gültigkeit (grobe) – bleibt für Backward-Kompatibilität bestehen */
function blockIsValid(blockIdx) {
  const block = blocks[blockIdx];
  const optionalKeys = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"]);
  return block.keys.every(key => {
    const field = findField(key); if (!field) return true;
    if (field.showIf && !field.showIf(formData)) return true;
    if (optionalKeys.has(key)) return true;
    const val = formData[key];
    if (field.type === "checkbox") return Array.isArray(val) && val.length > 0;
    if (field.type === "privacy") return val === true;
    return val !== undefined && String(val).trim() !== "";
  });
}

/* Events */
function handleFormEvents() {
  document.getElementById("formbuilder").addEventListener("change", () => {
    const block = blocks[currentBlock];
    let needsRerender = false;

    for (const key of block.keys) {
      const field = findField(key); if (!field) continue;
      const prev = formData[key];
      const curr = getFieldValue(field);
      formData[key] = curr;

      // Fehler-Markierung nach Benutzeraktion entfernen
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
    const fb = getFeedbackBox();

    if (e.target.id === "btn-next") {
      // Werte JIT übernehmen
      const block = blocks[currentBlock];
      for (const key of block.keys) {
        const f = findField(key); if (f) formData[key] = getFieldValue(f);
      }
      saveAutosave();

      // Detaillierte Validierung + Benutzerfeedback
      const missing = validateBlockDetailed(currentBlock);
      if (missing.length) {
        if (fb) {
          fb.innerHTML = `<div class="form-error">Bitte ergänzen Sie die folgenden Felder:<ul>${missing.map(m => `<li>${m}</li>`).join("")}</ul></div>`;
          fb.style.display = 'block'; fb.classList.add('error');
        }
        const firstInvalid = document.querySelector('.invalid, .invalid-group');
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior:'smooth', block:'center' });
        return;
      } else if (fb) {
        fb.innerHTML = ""; fb.style.display = 'none'; fb.classList.remove('error');
      }

      currentBlock++;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (e.target.id === "btn-prev") {
      currentBlock--;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (e.target.id === "btn-reset") {
      localStorage.removeItem(autosaveKey);
      formData = {};
      currentBlock = 0;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (e.target.id === "submit-btn" || e.target.id === "btn-send") {
      submitAllBlocks();
    }
  });
}

/* Init */
window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderBlock(currentBlock);
  setTimeout(() => {
    setFieldValues(currentBlock);
    renderBlock(currentBlock);
    setTimeout(() => { setFieldValues(currentBlock); handleFormEvents(); }, 20);
  }, 20);
});

/* Submit */
function submitAllBlocks() {
  const data = {}; fields.forEach(field => data[field.key] = formData[field.key]);
  data.lang = "de";
  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  fetch(`${BASE_URL}/briefing_async`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
    keepalive: true
  }).then(async (res) => {
    if (res.status === 401) { localStorage.removeItem("jwt"); window.location.href = "/login.html"; return; }
    window.location.href = "thankyou.html";
  }).catch(() => { window.location.href = "thankyou.html"; });
}
