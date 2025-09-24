// JWT utils – Token immer dynamisch lesen
function getToken() {
  try { return localStorage.getItem("jwt") || null; } catch(e){ return null; }
}

function showSessionHint() {
  const el = document.getElementById("formbuilder");
  if (!el) return;
  el.insertAdjacentHTML("beforeend",
    `<div class="form-error" style="margin-top:12px">
       Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>, 
       wenn Sie eine weitere Analyse durchführen möchten.
     </div>`);
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
  const optional = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen",
                             // Felder des neuen Ressourcen-Blocks sind optional und dürfen leer bleiben
                             "zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"]);
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
const BLOCK_INTRO = ["Hier erfassen wir Basisdaten (E‑Mail, Branche, Größe, Standort). Sie steuern die Personalisierung des Reports und die passenden Förder‑ & Compliance‑Hinweise.", "Status‑Quo zu Prozessen, Daten und bisherigen KI‑Erfahrungen. Damit kalibrieren wir Quick Wins und die Start‑Roadmap.", "Ziele & wichtigste Anwendungsfälle: Was soll KI konkret leisten? Das fokussiert Empfehlungen und priorisiert Maßnahmen.", "Ressourcen & Präferenzen (Zeit, Tool‑Affinität, vorhandene Lösungen). So passen wir Empfehlungen an Machbarkeit & Tempo an.", "Recht & Datenschutz (Opt‑in): Notwendig für den sicheren Versand und für DSGVO/EU‑AI‑Act‑konforme Auswertung.", "Projektpriorisierung & Roadmap‑Hinweise: Gewichten Sie, was zuerst kommen soll – das fließt direkt in die Roadmap ein.", "Abschließen & Absenden: Kurzer Check, Einwilligung bestätigen und den personalisierten Report starten."];

(function(){
  const css = `.section-intro{background:#E9F0FB;border:1px solid #D4DDED;border-radius:10px;padding:10px 12px;margin:8px 0 12px;color:#123B70}`;
  const s = document.createElement('style'); s.type='text/css'; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
})();
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

  // -------------------------------------------------------------------------
  // Block 5b: Ressourcen & Präferenzen
  // Neue Felder zur Erfassung von Zeitbudget, bestehenden Tools, regulierten Branchen,
  // Trainingsinteressen und der Priorisierung der Vision.  Diese Informationen
  // ermöglichen eine noch individuellere Auswertung und werden nur intern
  // genutzt. Alle Felder sind optional.
  {
    key: "zeitbudget",
    label: "Zeitbudget für KI-Projekte (Stunden/Woche)",
    type: "select",
    options: [
      { value: "unter_2", label: "Unter 2 Stunden" },
      { value: "2_5", label: "2–5 Stunden" },
      { value: "5_10", label: "5–10 Stunden" },
      { value: "ueber_10", label: "Über 10 Stunden" }
    ],
    description: "Wie viel Zeit steht Ihnen pro Woche für KI-Projekte zur Verfügung?"
  },
  {
    key: "vorhandene_tools",
    label: "Welche Tools nutzen Sie bereits im Unternehmen?",
    type: "checkbox",
    options: [
      { value: "crm", label: "CRM-Systeme (z. B. HubSpot, Salesforce)" },
      { value: "erp", label: "ERP-Systeme (z. B. SAP, Odoo)" },
      { value: "projektmanagement", label: "Projektmanagement (z. B. Asana, Trello)" },
      { value: "marketing_automation", label: "Marketing Automation (z. B. Mailchimp, HubSpot)" },
      { value: "buchhaltung", label: "Buchhaltung (z. B. Lexware, Xero)" },
      { value: "keine", label: "Keine / andere" }
    ],
    description: "Mehrfachauswahl möglich – hilft uns bei Integrations- und Tool-Empfehlungen."
  },
  {
    key: "regulierte_branche",
    label: "Gehört Ihr Unternehmen zu einer regulierten Branche?",
    type: "checkbox",
    options: [
      { value: "gesundheit", label: "Gesundheit & Medizin" },
      { value: "finanzen", label: "Finanzen & Versicherungen" },
      { value: "oeffentlich", label: "Öffentlicher Sektor" },
      { value: "recht", label: "Rechtliche Dienstleistungen" },
      { value: "keine", label: "Keine dieser Branchen" }
    ],
    description: "Regulierte Branchen erfordern besondere Compliance-Maßnahmen (Mehrfachauswahl möglich)."
  },
  {
    key: "trainings_interessen",
    label: "Für welche KI-Trainings oder Themen interessieren Sie sich?",
    type: "checkbox",
    options: [
      { value: "prompt_engineering", label: "Prompt Engineering" },
      { value: "llm_basics", label: "LLM-Grundlagen" },
      { value: "datenqualitaet_governance", label: "Datenqualität & Governance" },
      { value: "automatisierung", label: "Automatisierung & Skripte" },
      { value: "ethik_recht", label: "Ethische & rechtliche Grundlagen" },
      { value: "keine", label: "Keine / noch unklar" }
    ],
    description: "Mehrfachauswahl möglich – dient der Auswahl passender Schulungen."
  },
  {
    key: "vision_prioritaet",
    label: "Welcher Aspekt Ihrer Vision ist Ihnen am wichtigsten?",
    type: "select",
    options: [
      { value: "gpt_services", label: "GPT-basierte Services für KMU" },
      { value: "kundenservice", label: "Kundenservice verbessern" },
      { value: "datenprodukte", label: "Neue datenbasierte Produkte" },
      { value: "prozessautomation", label: "Prozessautomatisierung" },
      { value: "marktfuehrerschaft", label: "Marktführerschaft erreichen" },
      { value: "keine_angabe", label: "Keine Angabe / weiß nicht" }
    ],
    description: "Hilft, Empfehlungen passend zu priorisieren."
  },

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
  // Neuer Block für Ressourcen & Präferenzen – enthält Zeitbudget, Tools, regulierte Branche,
  // Trainingsinteressen und Vision-Priorität.  Alle Felder sind optional.
  { name:"Ressourcen & Präferenzen", keys:["zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"] },
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

function renderBlock(){ renderAllBlocks(); }
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
function handleFormEvents(){
  const root = document.getElementById("formbuilder"); if (!root) return;
  root.addEventListener("change", () => {
    for (const f of fields){
      let curr;
      if (f.type==="checkbox"){
        curr = Array.from(document.querySelectorAll(`input[name="${f.key}"]:checked`)).map(e=>e.value);
      } else if (f.type==="slider"){
        const el = document.getElementById(f.key); curr = el ? el.value : f.min || 1;
      } else if (f.type==="privacy"){
        const el = document.getElementById(f.key); curr = !!(el && el.checked);
      } else {
        const el = document.getElementById(f.key); curr = el ? el.value : "";
      }
      formData[f.key] = curr;
      markInvalid(f.key, false);
    }
    saveAutosave();
  });
  root.addEventListener("click", (e) => {
    if (e.target.id === "btn-reset"){
      localStorage.removeItem(autosaveKey); formData = {}; renderAllBlocks(); setTimeout(handleFormEvents,20);
      window.scrollTo({top:0,behavior:"smooth"});
    }
    if (e.target.id === "btn-send"){ submitAllBlocks(); }
  });
}

/* Init */
window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderAllBlocks();
  setTimeout(handleFormEvents, 20);
});
  renderBlock(currentBlock);
  setTimeout(() => {
    setFieldValues(currentBlock);
    renderBlock(currentBlock);
    setTimeout(() => { setFieldValues(currentBlock); handleFormEvents(); }, 20);
  }, 20);
});

/* Submit */
function submitAllBlocks() {
  for (const f of fields){
    let v;
    if (f.type==="checkbox"){
      v = Array.from(document.querySelectorAll(`input[name="${f.key}"]:checked`)).map(e=>e.value);
    } else if (f.type==="slider"){
      const el = document.getElementById(f.key); v = el ? el.value : f.min || 1;
    } else if (f.type==="privacy"){
      const el = document.getElementById(f.key); v = !!(el && el.checked);
    } else {
      const el = document.getElementById(f.key); v = el ? el.value : "";
    }
    formData[f.key] = v;
  }
  saveAutosave();
  // Daten sammeln
  const data = {}; fields.forEach(field => data[field.key] = formData[field.key]);
  data.lang = "de";

  // UI sofort updaten: Danke-Info zeigen und Buttons deaktivieren
  const form = document.getElementById("formbuilder");
  if (form) {
    form.querySelectorAll("button").forEach(b => { b.disabled = true; });
    form.innerHTML = `
      <h2>Vielen Dank für Ihre Angaben!</h2>
      <div class="success-msg" style="margin-top:10px;">
        Ihre KI-Analyse wird jetzt erstellt.<br>
        Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E-Mail.<br>
        Sie können dieses Fenster jetzt schließen.
      </div>
    `;
  }

  // 🔐 Token JETZT frisch lesen (kein globales const token!)
  const token = (function(){ try { return localStorage.getItem("jwt") || null; } catch(e){ return null; } })();
  if (!token) {
    // Danke-Screen bleibt stehen – nur Hinweis ergänzen
    if (form) form.insertAdjacentHTML("beforeend",
      `<div class="form-error" style="margin-top:12px">
         Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>, 
         wenn Sie eine weitere Analyse durchführen möchten.
       </div>`);
    return;
  }

  // Request im Hintergrund starten (kein Redirect)
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
           Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>, 
           wenn Sie eine weitere Analyse durchführen möchten.
         </div>`);
      return;
    }
    // Erfolgsfall: nichts weiter – UI zeigt bereits die Info
  }).catch(() => {
    // Fehlerfall ignorieren – Admin-Mail/PDF wird separat gehandhabt
  });

  // (Optional) Autosave NICHT löschen während der Testphase
  // try { localStorage.removeItem(autosaveKey); } catch(e){}
}
// === TEXT OVERLAY (DE) – nur Texte, keine Logik! ===
const TEXTS_DE = {
  branche: {
    label: "In welcher Branche ist Ihr Unternehmen tätig?",
    description: "Ihre Hauptbranche beeinflusst Benchmarks, Tool-Empfehlungen und die Auswertung. Wählen Sie bitte das Kerngeschäft, auf das Ihr Report zugeschnitten sein soll.",
    options: {
      marketing: "Marketing & Werbung",
      beratung: "Beratung & Dienstleistungen",
      it: "IT & Software",
      finanzen: "Finanzen & Versicherungen",
      handel: "Handel & E-Commerce",
      bildung: "Bildung",
      verwaltung: "Verwaltung",
      gesundheit: "Gesundheit & Pflege",
      bau: "Bauwesen & Architektur",
      medien: "Medien & Kreativwirtschaft",
      industrie: "Industrie & Produktion",
      logistik: "Transport & Logistik"
    }
  },
  unternehmensgroesse: {
    label: "Wie groß ist Ihr Unternehmen (Mitarbeiter:innen)?",
    description: "Die Unternehmensgröße beeinflusst Empfehlungen, Fördermöglichkeiten und Vergleichswerte.",
    options: { solo: "1 (Solo-Selbstständig/Freiberuflich)", team: "2–10 (Kleines Team)", kmu: "11–100 (KMU)" }
  },
  selbststaendig: {
    label: "Unternehmensform bei 1 Person",
    description: "Bitte wählen Sie die zutreffende Rechtsform. So erhalten Sie Auswertungen, die genau auf Ihre Unternehmenssituation passen.",
    options: {
      freiberufler: "Freiberuflich/Selbstständig",
      kapitalgesellschaft: "1-Personen-Kapitalgesellschaft (GmbH/UG)",
      einzelunternehmer: "Einzelunternehmer (mit Gewerbe)",
      sonstiges: "Sonstiges"
    }
  },
  bundesland: {
    label: "Bundesland (regionale Fördermöglichkeiten)",
    description: "Ihr Standort entscheidet, welche Fördermittel, Programme und Beratungsangebote Sie optimal nutzen können."
  },
  hauptleistung: {
    label: "Was ist das wichtigste Produkt oder die Hauptdienstleistung Ihres Unternehmens?",
    placeholder: "z. B. Social Media Kampagnen, CNC-Fertigung von Einzelteilen, Steuerberatung für Startups",
    description: "Beschreiben Sie Ihre zentrale Leistung möglichst konkret. Beispiele helfen uns, Ihre Positionierung und passende Empfehlungen besser zu verstehen."
  },
  zielgruppen: {
    label: "Für welche Zielgruppen oder Kundensegmente bieten Sie Ihre Leistungen an?",
    description: "Für welche Kundengruppen bieten Sie Leistungen an? Bitte wählen Sie alle Zielgruppen aus, die für Sie relevant sind (Mehrfachauswahl möglich).",
    options: {
      b2b: "B2B (Geschäftskunden)", b2c: "B2C (Endverbraucher)", kmu: "KMU (Kleine & mittlere Unternehmen)",
      grossunternehmen: "Großunternehmen", selbststaendige: "Selbstständige/Freiberufler",
      oeffentliche_hand: "Öffentliche Hand", privatpersonen: "Privatpersonen", startups: "Startups", andere: "Andere"
    }
  },
  jahresumsatz: {
    label: "Jahresumsatz (Schätzung)",
    description: "Bitte schätzen Sie Ihren Jahresumsatz. Die Klassifizierung hilft bei Benchmarks, Förderprogrammen und Empfehlungen."
  },
  it_infrastruktur: {
    label: "Wie ist Ihre IT-Infrastruktur aktuell organisiert?",
    description: "Ihre Antwort hilft uns, passende Empfehlungen für Sicherheit, Integration und moderne Tools auszuwählen.",
    options: {
      cloud: "Cloud-basiert (z. B. Microsoft 365, Google Cloud …)",
      on_premise: "Eigenes Rechenzentrum (On-Premises)",
      hybrid: "Hybrid (Cloud + eigene Server)",
      unklar: "Unklar / Noch offen"
    }
  },
  interne_ki_kompetenzen: {
    label: "Gibt es ein internes KI-/Digitalisierungsteam?",
    description: "Ein internes Kompetenzteam kann Prozesse beschleunigen. Diese Angabe hilft bei der Empfehlung von Schulungen und internen Strukturen."
  },
  datenquellen: {
    label: "Welche Datentypen stehen Ihnen für KI-Projekte und Analysen zur Verfügung?",
    description: "Bitte wählen Sie alle Datenquellen aus, die für Ihr Unternehmen relevant sind (Mehrfachauswahl möglich)."
  },
  digitalisierungsgrad: {
    label: "Wie digital sind Ihre internen Prozesse bereits? (1 = analog, 10 = voll digital)",
    description: "Schätzen Sie den aktuellen Stand: 1 = vor allem Papier und manuelle Abläufe, 10 = alles läuft digital und automatisiert."
  },
  prozesse_papierlos: {
    label: "Wie hoch ist der Anteil papierloser Prozesse in Ihrem Unternehmen?",
    description: "Schätzen Sie grob: Wie viel läuft komplett digital ohne Papierakten oder Ausdrucke?"
  },
  automatisierungsgrad: {
    label: "Wie hoch ist der Automatisierungsgrad Ihrer Arbeitsabläufe?",
    description: "Sind viele Arbeitsschritte noch Handarbeit oder läuft vieles automatisch (z. B. durch KI, Scripte oder smarte Tools)?"
  },
  ki_einsatz: {
    label: "Wo wird KI heute bereits in Ihrem Unternehmen eingesetzt?",
    description: "Wo nutzen Sie bereits Künstliche Intelligenz oder Automatisierung? Wählen Sie alle Bereiche aus, die relevant sind."
  },
  ki_knowhow: {
    label: "Wie schätzen Sie das interne KI-Know-how Ihres Teams ein?",
    description: "Wie fit sind Sie und Ihr Team beim Thema KI? Nutzen Sie KI schon produktiv oder kennen Sie sich bereits tiefer aus?"
  },
  projektziel: {
    label: "Welches Ziel steht bei Ihrem nächsten KI-/Digitalisierungsprojekt im Vordergrund?",
    description: "Was möchten Sie mit Ihrem nächsten Vorhaben vorrangig erreichen? Mehrfachauswahl möglich."
  },
  ki_projekte: {
    label: "Gibt es aktuell laufende oder geplante KI-Projekte in Ihrem Unternehmen?",
    placeholder: "z. B. Chatbot, automatisierte Angebotserstellung, Generatoren, Analyse-Tools …",
    description: "Beschreiben Sie laufende oder geplante Projekte möglichst konkret. Gibt es bereits Überlegungen, Experimente oder Pilotprojekte?"
  },
  ki_usecases: {
    label: "Welche KI-Anwendungsfälle interessieren Sie besonders?",
    description: "Welche KI-Anwendungsbereiche interessieren Sie besonders? Mehrfachauswahl möglich."
  },
  ki_potenzial: {
    label: "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
    placeholder: "z. B. schnelleres Reporting, personalisierte Angebote, Kostenreduktion …",
    description: "Wo sehen Sie für Ihr Unternehmen das größte Potenzial durch KI? Gerne frei formulieren – alles ist willkommen."
  },
  usecase_priority: {
    label: "In welchem Bereich soll KI am ehesten zum Einsatz kommen?",
    description: "Gibt es einen Bereich, in dem KI besonders dringend gebraucht wird oder das größte Potenzial bietet?"
  },
  ki_geschaeftsmodell_vision: {
    label: "Wie könnte KI Ihr Geschäftsmodell oder Ihre Branche grundlegend verändern?",
    description: "Welche Veränderungen oder neuen Möglichkeiten sehen Sie langfristig durch KI? Es geht um Ihre größere Vision."
  },
  moonshot: {
    label: "Was wäre ein mutiger Durchbruch – Ihre KI-Vision in 3 Jahren?",
    description: "Was wäre Ihre visionäre KI-Zukunft in 3 Jahren? Denken Sie groß."
  },
  datenschutzbeauftragter: {
    label: "Gibt es eine:n Datenschutzbeauftragte:n in Ihrem Unternehmen?",
    description: "Ein:e Datenschutzbeauftragte:r ist oft Pflicht – intern oder extern. Wie ist die Situation bei Ihnen?"
  },
  technische_massnahmen: {
    label: "Welche technischen Schutzmaßnahmen für Daten sind bei Ihnen umgesetzt?",
    description: "Bitte wählen Sie, wie umfassend Sie Ihre Daten technisch schützen (Firewalls, Backups, Zugriffsbeschränkungen etc.)."
  }
};
Object.assign(TEXTS_DE, {
  folgenabschaetzung: {
    label: "Wurde für KI-Anwendungen eine DSGVO-Folgenabschätzung (DSFA) erstellt?",
    description: "Bei vielen KI-Anwendungen ist eine „DSFA“ verpflichtend oder empfohlen – z. B. bei sensiblen Daten oder automatisierten Entscheidungen."
  },
  meldewege: {
    label: "Gibt es definierte Meldewege bei Datenschutzvorfällen?",
    description: "Wie stellen Sie sicher, dass bei Datenschutzverstößen schnell und systematisch gehandelt wird?"
  },
  loeschregeln: {
    label: "Existieren klare Regeln zur Löschung oder Anonymisierung von Daten?",
    description: "Haben Sie definierte Abläufe zur gesetzeskonformen Löschung/Anonymisierung (Mitarbeiter-, Kunden-, Trainingsdaten etc.)?"
  },
  ai_act_kenntnis: {
    label: "Wie gut kennen Sie die Anforderungen des EU AI Act?",
    description: "Der EU AI Act regelt viele neue Pflichten für KI-Anwendungen. Wie gut fühlen Sie sich informiert?"
  },
  ki_hemmnisse: {
    label: "Was hindert Ihr Unternehmen aktuell am (weiteren) KI-Einsatz?",
    description: "Typische Hürden: Datenschutz, Know-how, Zeit/Budget. Wählen Sie alle relevanten Punkte."
  },
  bisherige_foerdermittel: {
    label: "Haben Sie bereits Fördermittel für Digitalisierung oder KI beantragt und erhalten?",
    description: "Diese Angabe hilft, passende Anschlussprogramme oder neue Optionen vorzuschlagen."
  },
  interesse_foerderung: {
    label: "Wären gezielte Fördermöglichkeiten für Ihre Projekte interessant?",
    description: "Bei Interesse filtern wir passende Programme – ohne Werbung oder Verpflichtung."
  },
  erfahrung_beratung: {
    label: "Gab es schon Beratung zu Digitalisierung/KI?",
    description: "Externe Beratung (Förderprojekte, Kammern, Berater, Tech-Partner) kann die Ausgangslage stärken."
  },
  investitionsbudget: {
    label: "Welches Budget planen Sie für KI/Digitalisierung im nächsten Jahr ein?",
    description: "Schon kleine Budgets bringen Fortschritt. Förderprogramme können zusätzlich helfen."
  },
  marktposition: {
    label: "Wie schätzen Sie Ihre Position im Markt?",
    description: "Hilft, Tempo, Budget und Potenziale realistisch einzuordnen."
  },
  benchmark_wettbewerb: {
    label: "Vergleichen Sie Ihre Digitalisierung/KI-Readiness mit Wettbewerbern?",
    description: "Benchmarks helfen, die eigene Position einzuordnen und Chancen zu erkennen."
  },
  innovationsprozess: {
    label: "Wie entstehen Innovationen in Ihrem Unternehmen?",
    description: "Strukturierte Innovationswege – intern oder extern – erleichtern gezielten KI-Einsatz."
  },
  risikofreude: {
    label: "Wie risikofreudig ist Ihr Unternehmen bei Innovationen? (1 = wenig, 5 = sehr)",
    description: "Sind Sie eher sicherheitsorientiert oder offen für mutige, neue Wege?"
  },
  datenschutz: {
    // label bleibt bewusst wie in der Datei (HTML-Link)
    description: "Bitte bestätigen Sie die Datenschutzhinweise. Ihre Angaben werden ausschließlich zur Erstellung Ihrer persönlichen Auswertung genutzt."
  }
});

// wendet die Texte feldweise an, ohne Logik zu verändern
function applyTexts_DE(fields) {
  for (const f of fields) {
    const t = TEXTS_DE[f.key];
    if (!t) continue;
    if (t.label) f.label = t.label;
    if (t.description) f.description = t.description;
    if (t.placeholder) f.placeholder = t.placeholder;
    if (t.options && Array.isArray(f.options)) {
      f.options = f.options.map(opt => ({
        ...opt,
        label: t.options?.[opt.value] || opt.label
      }));
    }
  }
}
applyTexts_DE(fields);


function renderAllBlocks(){
  formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
  const root = document.getElementById("formbuilder"); if (!root) return;
  let html = "";
  for (let i=0;i<blocks.length;i++){ 
    const block = blocks[i];
    html += `<section class="fb-section"><div class="fb-section-head"><span class="fb-step">Schritt ${i+1}/${blocks.length}</span> – <b>${block.name}</b></div>`;
    const __intro = BLOCK_INTRO[i] || "";
    if (__intro) html += `<div class="section-intro">${__intro}</div>`;
    html += block.keys.map(key => {
      const field = findField(key); if (!field) return "";
      if (field.showIf && !field.showIf(formData)) return "";
      const guidance = field.description ? `<div class="guidance${field.type === "privacy" ? " important" : ""}">${field.description}</div>` : "";
      let input = "";
      switch(field.type){
        case "select": { 
          const selectedValue = formData[field.key] || "";
          input = `<select id="${field.key}" name="${field.key}"><option value="">Bitte wählen...</option>` + 
            (field.options||[]).map(opt => { 
              const sel = selectedValue === opt.value ? ' selected' : '';
              return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
            }).join("") + `</select>`;
        } break;
        case "textarea":
          input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder||""}">${formData[field.key]||""}</textarea>`;
          break;
        case "checkbox":
          input = `<div class="checkbox-group twocol">` + 
            (field.options||[]).map(opt => {
              const label = opt.label || ""; const m = label.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
              const mainLabel = m ? m[1].trim() : label; const hint = m ? m[2].trim() : "";
              const checked = (formData[field.key]||[]).includes(opt.value) ? 'checked' : '';
              const hintHtml = hint ? `<div class="option-example">${hint}</div>` : "";
              return `<label class="checkbox-label"><input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}><span>${mainLabel}</span>${hintHtml}</label>`;
            }).join("") + `</div>`;
          break;
        case "slider":
          const v = formData[field.key] ?? field.min ?? 1;
          input = `<input type="range" id="${field.key}" name="${field.key}" min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" value="${v}" oninput="this.nextElementSibling.innerText=this.value"/> <span class="slider-value-label">${v}</span>`;
          break;
        case "privacy":
          input = `<div class="privacy-section"><label><input type="checkbox" id="${field.key}" name="${field.key}" ${formData[field.key]?'checked':''} required/> ${field.label}</label></div>`;
          break;
        default:
          input = `<input type="text" id="${field.key}" name="${field.key}" value="${formData[field.key]||""}" />`;
      }
      const labelHtml = field.type!=="privacy" ? `<label for="${field.key}"><b>${field.label}</b></label>` : "";
      return `<div class="form-group">${labelHtml}${guidance}${input}</div>`;
    }).join("");
    html += `</section>`;
  }
  html += `<div class="form-nav"><div class="nav-left"></div><div class="nav-right">
      <button type="button" id="btn-send" class="btn-next">Absenden</button>
      <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
    </div></div><div id="feedback"></div>`;
  root.innerHTML = html;
}

