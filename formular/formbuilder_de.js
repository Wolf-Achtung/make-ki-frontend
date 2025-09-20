// JWT utils \u2013 Token immer dynamisch lesen
function getToken() {
  try { return localStorage.getItem("jwt") || null; } catch(e){ return null; }
}

function showSessionHint() {
  const el = document.getElementById("formbuilder");
  if (!el) return;
  el.insertAdjacentHTML("beforeend",
    `<div class="form-error" style="margin-top:12px">
       Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>, 
       wenn Sie eine weitere Analyse durchf\u00fchren m\u00f6chten.
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
  const parts = s.split(/\s{2,}| \u2014 | \u2013 | - /).map(x => x.trim()).filter(Boolean);
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
                             // Felder des neuen Ressourcen-Blocks sind optional und d\u00fcrfen leer bleiben
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
   FELDER (vollst\u00e4ndig)
   ========================================================================== */
const fields = [
  // Block 1: Unternehmensinfos
  {
    key: "branche",
    label: "In welcher Branche ist Ihr Unternehmen t\u00e4tig?",
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
    description: "Ihre Hauptbranche beeinflusst Benchmarks, Tool-Empfehlungen und die Auswertung. W\u00e4hlen Sie bitte das Kerngesch\u00e4ft, auf das Ihr Report zugeschnitten sein soll."
  },
  {
    key: "unternehmensgroesse",
    label: "Wie gro\u00df ist Ihr Unternehmen (Mitarbeiter:innen)?",
    type: "select",
    options: [
      { value: "solo", label: "1 (Solo-Selbstst\u00e4ndig/Freiberuflich)" },
      { value: "team", label: "2\u201310 (Kleines Team)" },
      { value: "kmu", label: "11\u2013100 (KMU)" }
    ],
    description: "Die Unternehmensgr\u00f6\u00dfe beeinflusst Empfehlungen, F\u00f6rderm\u00f6glichkeiten und Vergleichswerte."
  },
  {
    key: "selbststaendig",
    label: "Unternehmensform bei 1 Person",
    type: "select",
    options: [
      { value: "freiberufler", label: "Freiberuflich/Selbstst\u00e4ndig" },
      { value: "kapitalgesellschaft", label: "1-Personen-Kapitalgesellschaft (GmbH/UG)" },
      { value: "einzelunternehmer", label: "Einzelunternehmer (mit Gewerbe)" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "Bitte w\u00e4hlen Sie die zutreffende Rechtsform. So erhalten Sie Auswertungen, die genau auf Ihre Unternehmenssituation passen.",
    showIf: (data) => data.unternehmensgroesse === "solo"
  },
  {
    key: "bundesland",
    label: "Bundesland (regionale F\u00f6rderm\u00f6glichkeiten)",
    type: "select",
    options: [
      { value: "bw", label: "Baden-W\u00fcrttemberg" }, { value: "by", label: "Bayern" },
      { value: "be", label: "Berlin" }, { value: "bb", label: "Brandenburg" },
      { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
      { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" },
      { value: "ni", label: "Niedersachsen" }, { value: "nw", label: "Nordrhein-Westfalen" },
      { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
      { value: "sn", label: "Sachsen" }, { value: "st", label: "Sachsen-Anhalt" },
      { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Th\u00fcringen" }
    ],
    description: "Ihr Standort entscheidet, welche F\u00f6rdermittel, Programme und Beratungsangebote Sie optimal nutzen k\u00f6nnen."
  },
  {
    key: "hauptleistung",
    label: "Was ist das wichtigste Produkt oder die Hauptdienstleistung Ihres Unternehmens?",
    type: "textarea",
    placeholder: "z. B. Social-Media-Kampagnen, CNC-Fertigung, Steuerberatung f\u00fcr Startups",
    description: "Beschreiben Sie Ihre zentrale Leistung m\u00f6glichst konkret. Beispiele helfen uns, Positionierung und Empfehlungen zu pr\u00e4zisieren."
  },
  {
    key: "zielgruppen",
    label: "F\u00fcr welche Zielgruppen oder Kundensegmente bieten Sie Ihre Leistungen an?",
    type: "checkbox",
    options: [
      { value: "b2b", label: "B2B  (Gesch\u00e4ftskunden)" },
      { value: "b2c", label: "B2C  (Endverbraucher)" },
      { value: "kmu", label: "KMU  (kleine & mittlere Unternehmen)" },
      { value: "grossunternehmen", label: "Gro\u00dfunternehmen" },
      { value: "selbststaendige", label: "Selbstst\u00e4ndige/Freiberufler" },
      { value: "oeffentliche_hand", label: "\u00d6ffentliche Hand" },
      { value: "privatpersonen", label: "Privatpersonen" },
      { value: "startups", label: "Startups" },
      { value: "andere", label: "Andere" }
    ],
    description: "Bitte alle passenden Zielgruppen ausw\u00e4hlen (Mehrfachauswahl m\u00f6glich)."
  },

  // Erweiterte Unternehmensangaben
  {
    key: "jahresumsatz",
    label: "Jahresumsatz (Sch\u00e4tzung)",
    type: "select",
    options: [
      { value: "unter_100k", label: "Bis 100.000 \u20ac" },
      { value: "100k_500k", label: "100.000\u2013500.000 \u20ac" },
      { value: "500k_2m", label: "500.000\u20132 Mio. \u20ac" },
      { value: "2m_10m", label: "2\u201310 Mio. \u20ac" },
      { value: "ueber_10m", label: "\u00dcber 10 Mio. \u20ac" },
      { value: "keine_angabe", label: "Keine Angabe" }
    ],
    description: "Grobe Sch\u00e4tzung gen\u00fcgt \u2013 hilft f\u00fcr Benchmarks und F\u00f6rderprogramme."
  },
  {
    key: "it_infrastruktur",
    label: "Wie ist Ihre IT-Infrastruktur aktuell organisiert?",
    type: "select",
    options: [
      { value: "cloud", label: "Cloud-basiert (z. B. Microsoft 365, Google Cloud \u2026)" },
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
    description: "Wichtig f\u00fcr Schulungs-/Struktur-Empfehlungen."
  },
  {
    key: "datenquellen",
    label: "Welche Datentypen stehen Ihnen f\u00fcr KI-Projekte und Analysen zur Verf\u00fcgung?",
    type: "checkbox",
    options: [
      { value: "kundendaten", label: "Kundendaten  (CRM, Service, Historie)" },
      { value: "verkaufsdaten", label: "Verkaufs-/Bestelldaten  (Shop, Auftr\u00e4ge)" },
      { value: "produktionsdaten", label: "Produktions-/Betriebsdaten  (Maschinen, Sensoren, Logistik)" },
      { value: "personaldaten", label: "Personal-/HR-Daten  (Mitarbeiter, Bewerbungen, Zeitwirtschaft)" },
      { value: "marketingdaten", label: "Marketing-/Kampagnendaten  (Ads, Social, Newsletter)" },
      { value: "sonstige", label: "Sonstige / weitere Datenquellen" }
    ],
    description: "Mehrfachauswahl m\u00f6glich."
  },

  // Block 2: Status Quo
  { key: "digitalisierungsgrad", label: "Wie digital sind Ihre internen Prozesse? (1\u201310)", type: "slider", min:1, max:10, step:1,
    description: "1 = vor allem Papier & manuell, 10 = alles digital/automatisiert." },
  { key: "prozesse_papierlos", label: "Anteil papierloser Prozesse", type:"select",
    options:[ {value:"0-20",label:"0\u201320 %"},{value:"21-50",label:"21\u201350 %"},{value:"51-80",label:"51\u201380 %"},{value:"81-100",label:"81\u2013100 %"} ],
    description:"Grobe Sch\u00e4tzung gen\u00fcgt." },
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
    description:"Selbsteinsch\u00e4tzung gen\u00fcgt."
  },

  // Block 3: Ziele & Projekte
  { key:"projektziel", label:"Ziel des n\u00e4chsten KI-/Digitalisierungsprojekts", type:"checkbox",
    options:[
      {value:"prozessautomatisierung",label:"Prozessautomatisierung"},
      {value:"kostensenkung",label:"Kostensenkung"},
      {value:"compliance",label:"Compliance/Datenschutz"},
      {value:"produktinnovation",label:"Produktinnovation"},
      {value:"kundenservice",label:"Kundenservice verbessern"},
      {value:"markterschliessung",label:"Markterschlie\u00dfung"},
      {value:"personalentlastung",label:"Personalentlastung"},
      {value:"foerdermittel",label:"F\u00f6rdermittel beantragen"},
      {value:"andere",label:"Andere"}
    ],
    description:"Mehrfachauswahl m\u00f6glich." },
  { key:"ki_projekte", label:"Laufende/geplante KI-Projekte", type:"textarea",
    placeholder:"z. B. Chatbot, Angebotsautomation, Generatoren, Analytics \u2026",
    description:"Bitte konkret beschreiben (Pilot/Idee/Planung)." },
  { key:"ki_usecases", label:"Besonders interessante KI-Use-Cases", type:"checkbox",
    options:[
      {value:"texterstellung",label:"Texterstellung (z. B. Berichte, Posts)"},
      {value:"bildgenerierung",label:"Bildgenerierung (z. B. Grafiken, Logo-Varianten)"},
      {value:"spracherkennung",label:"Spracherkennung (z. B. Transkription, Voicebots)"},
      {value:"prozessautomatisierung",label:"Prozessautomatisierung (z. B. Belegpr\u00fcfung, Versand)"},
      {value:"datenanalyse",label:"Datenanalyse & Prognose (z. B. Markttrends)"},
      {value:"kundensupport",label:"Kundensupport (z. B. Chatbots, FAQ-Automation)"},
      {value:"wissensmanagement",label:"Wissensmanagement (z. B. DMS, intelligente Suche)"},
      {value:"marketing",label:"Marketing (z. B. Segmentierung, Kampagnenoptimierung)"},
      {value:"sonstiges",label:"Sonstiges"}
    ],
    description:"Mehrfachauswahl m\u00f6glich."
  },
  { key:"ki_potenzial", label:"Gr\u00f6\u00dftes KI-Potenzial im Unternehmen", type:"textarea",
    placeholder:"z. B. Reporting, personalisierte Angebote, Automatisierung, neue Services \u2026",
    description:"Freitext, gerne stichpunktartig." },
  { key:"usecase_priority", label:"Bereich mit h\u00f6chster Priorit\u00e4t", type:"select",
    options:[
      "marketing","vertrieb","buchhaltung","produktion","kundenservice","it","forschung","personal","unbekannt"
    ].map(v => ({ value:v, label:
      v==="marketing"?"Marketing": v==="vertrieb"?"Vertrieb": v==="buchhaltung"?"Buchhaltung":
      v==="produktion"?"Produktion": v==="kundenservice"?"Kundenservice": v==="it"?"IT":
      v==="forschung"?"Forschung & Entwicklung": v==="personal"?"Personal":"Noch unklar / sp\u00e4ter entscheiden"
    })),
    description:"Wo lohnt der Einstieg zuerst?" },
  { key:"ki_geschaeftsmodell_vision", label:"Wie kann KI Gesch\u00e4ftsmodell/Branche ver\u00e4ndern?", type:"textarea",
    placeholder:"z. B. KI-gest\u00fctztes Portal, datenbasierte Plattform, neue Produkte \u2026",
    description:"Vision\u00e4r denken \u2013 aber realistisch umsetzbar." },
  { key:"moonshot", label:"Mutiger Durchbruch \u2013 3-Jahres-Vision", type:"textarea",
    placeholder:"z. B. 80 % Routine \u00fcbernimmt KI; Umsatz +100 % durch Automation \u2026",
    description:"Kurze Vision, die begeistert."
  },

  // Block 4: Strategie & Governance (\u2192 fehlende Felder waren Ursache!)
  { key:"strategische_ziele", label:"Welche konkreten Ziele verfolgen Sie mit KI?", type:"textarea",
    placeholder:"z. B. Effizienz steigern, neue Produkte entwickeln, Kundenservice verbessern",
    description:"Nennen Sie die strategischen Hauptziele Ihres KI-Einsatzes." },
  { key:"datenqualitaet", label:"Wie beurteilen Sie die Qualit\u00e4t Ihrer Daten?", type:"select",
    options:[ {value:"hoch",label:"Hoch (vollst\u00e4ndig, strukturiert, aktuell)"},{value:"mittel",label:"Mittel (teilweise strukturiert/l\u00fcckenhaft)"},{value:"niedrig",label:"Niedrig (unstrukturiert, viele L\u00fccken)"} ],
    description:"Gut gepflegte Daten sind die Grundlage erfolgreicher KI-Projekte." },
  { key:"ai_roadmap", label:"Gibt es bereits eine KI-Roadmap oder Strategie?", type:"select",
    options:[ {value:"ja",label:"Ja \u2013 bereits implementiert"},{value:"in_planung",label:"In Planung"},{value:"nein",label:"Noch nicht vorhanden"} ],
    description:"Eine klare Roadmap erleichtert die Umsetzung." },
  { key:"governance", label:"Existieren interne Richtlinien f\u00fcr Daten-/KI-Governance?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"teilweise",label:"Teilweise"},{value:"nein",label:"Nein"} ],
    description:"Governance f\u00f6rdert verantwortungsvolle, rechtskonforme Projekte." },
  { key:"innovationskultur", label:"Wie offen ist Ihr Unternehmen f\u00fcr Innovationen?", type:"select",
    options:[ {value:"sehr_offen",label:"Sehr offen"},{value:"eher_offen",label:"Eher offen"},{value:"neutral",label:"Neutral"},{value:"eher_zurueckhaltend",label:"Eher zur\u00fcckhaltend"},{value:"sehr_zurueckhaltend",label:"Sehr zur\u00fcckhaltend"} ],
    description:"Offene Kultur erleichtert Einf\u00fchrung neuer Technologien." },

  // Block 5: Rechtliches & F\u00f6rderung
  { key:"datenschutzbeauftragter", label:"Gibt es eine:n Datenschutzbeauftragte:n?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"teilweise",label:"Teilweise (extern/Planung)"} ],
    description:"Oft Pflicht \u2013 intern oder extern." },
  { key:"technische_massnahmen", label:"Technische Schutzma\u00dfnahmen f\u00fcr Daten", type:"select",
    options:[ {value:"alle",label:"Alle relevanten Ma\u00dfnahmen"},{value:"teilweise",label:"Teilweise vorhanden"},{value:"keine",label:"Noch keine"} ] },
  { key:"folgenabschaetzung", label:"DSGVO-Folgenabsch\u00e4tzung (DSFA) f\u00fcr KI-Anwendungen?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"teilweise",label:"Teilweise"} ] },
  { key:"meldewege", label:"Meldewege bei Datenschutzvorf\u00e4llen", type:"select",
    options:[ {value:"ja",label:"Ja, klar geregelt"},{value:"teilweise",label:"Teilweise geregelt"},{value:"nein",label:"Nein"} ] },
  { key:"loeschregeln", label:"Regeln zur L\u00f6schung/Anonymisierung", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"teilweise",label:"Teilweise"},{value:"nein",label:"Nein"} ] },
  { key:"ai_act_kenntnis", label:"Kenntnis EU AI Act", type:"select",
    options:[ {value:"sehr_gut",label:"Sehr gut"},{value:"gut",label:"Gut"},{value:"geh\u00f6rt",label:"Schon mal geh\u00f6rt"},{value:"unbekannt",label:"Noch nicht besch\u00e4ftigt"} ] },
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
  { key:"bisherige_foerdermittel", label:"Bereits F\u00f6rdermittel erhalten?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"} ] },
  { key:"interesse_foerderung", label:"F\u00f6rderm\u00f6glichkeiten interessant?", type:"select",
    options:[ {value:"ja",label:"Ja, bitte Programme vorschlagen"},{value:"nein",label:"Nein"},{value:"unklar",label:"Unklar, bitte beraten"} ] },
  { key:"erfahrung_beratung", label:"Beratung zu Digitalisierung/KI?", type:"select",
    options:[ {value:"ja",label:"Ja"},{value:"nein",label:"Nein"},{value:"unklar",label:"Unklar"} ] },
  { key:"investitionsbudget", label:"Budget (n\u00e4chstes Jahr)", type:"select",
    options:[ {value:"unter_2000",label:"Unter 2.000 \u20ac"},{value:"2000_10000",label:"2.000\u201310.000 \u20ac"},{value:"10000_50000",label:"10.000\u201350.000 \u20ac"},{value:"ueber_50000",label:"\u00dcber 50.000 \u20ac"},{value:"unklar",label:"Noch unklar"} ] },
  { key:"marktposition", label:"Marktposition", type:"select",
    options:[ {value:"marktfuehrer",label:"Marktf\u00fchrer"},{value:"oberes_drittel",label:"Oberes Drittel"},{value:"mittelfeld",label:"Mittelfeld"},{value:"nachzuegler",label:"Nachz\u00fcgler/Aufholer"},{value:"unsicher",label:"Schwer einzusch\u00e4tzen"} ] },
  { key:"benchmark_wettbewerb", label:"Vergleich mit Wettbewerbern", type:"select",
    options:[ {value:"ja",label:"Ja, regelm\u00e4\u00dfig"},{value:"nein",label:"Nein"},{value:"selten",label:"Nur selten / informell"} ] },
  { key:"innovationsprozess", label:"Wie entstehen Innovationen?", type:"select",
    options:[ {value:"innovationsteam",label:"Internes Innovationsteam"},{value:"mitarbeitende",label:"Durch Mitarbeitende"},{value:"kunden",label:"Mit Kunden"},{value:"berater",label:"Mit externen Partnern"},{value:"zufall",label:"Eher zuf\u00e4llig/ungeplant"},{value:"unbekannt",label:"Keine klare Strategie"} ] },
  { key:"risikofreude", label:"Risikofreude (1\u20135)", type:"slider", min:1, max:5, step:1,
    description:"1 = wenig, 5 = sehr risikofreudig." },

  // -------------------------------------------------------------------------
  // Block 5b: Ressourcen & Pr\u00e4ferenzen
  // Neue Felder zur Erfassung von Zeitbudget, bestehenden Tools, regulierten Branchen,
  // Trainingsinteressen und der Priorisierung der Vision.  Diese Informationen
  // erm\u00f6glichen eine noch individuellere Auswertung und werden nur intern
  // genutzt. Alle Felder sind optional.
  {
    key: "zeitbudget",
    label: "Zeitbudget f\u00fcr KI-Projekte (Stunden/Woche)",
    type: "select",
    options: [
      { value: "unter_2", label: "Unter 2 Stunden" },
      { value: "2_5", label: "2\u20135 Stunden" },
      { value: "5_10", label: "5\u201310 Stunden" },
      { value: "ueber_10", label: "\u00dcber 10 Stunden" }
    ],
    description: "Wie viel Zeit steht Ihnen pro Woche f\u00fcr KI-Projekte zur Verf\u00fcgung?"
  },
  {
    key: "vorhandene_tools",
    label: "Welche Tools nutzen Sie bereits im Unternehmen?",
    type: "checkbox",
    options: [
      { value: "crm", label: "CRM-Systeme (z.\u202fB. HubSpot, Salesforce)" },
      { value: "erp", label: "ERP-Systeme (z.\u202fB. SAP, Odoo)" },
      { value: "projektmanagement", label: "Projektmanagement (z.\u202fB. Asana, Trello)" },
      { value: "marketing_automation", label: "Marketing Automation (z.\u202fB. Mailchimp, HubSpot)" },
      { value: "buchhaltung", label: "Buchhaltung (z.\u202fB. Lexware, Xero)" },
      { value: "keine", label: "Keine / andere" }
    ],
    description: "Mehrfachauswahl m\u00f6glich \u2013 hilft uns bei Integrations- und Tool-Empfehlungen."
  },
  {
    key: "regulierte_branche",
    label: "Geh\u00f6rt Ihr Unternehmen zu einer regulierten Branche?",
    type: "checkbox",
    options: [
      { value: "gesundheit", label: "Gesundheit & Medizin" },
      { value: "finanzen", label: "Finanzen & Versicherungen" },
      { value: "oeffentlich", label: "\u00d6ffentlicher Sektor" },
      { value: "recht", label: "Rechtliche Dienstleistungen" },
      { value: "keine", label: "Keine dieser Branchen" }
    ],
    description: "Regulierte Branchen erfordern besondere Compliance-Ma\u00dfnahmen (Mehrfachauswahl m\u00f6glich)."
  },
  {
    key: "trainings_interessen",
    label: "F\u00fcr welche KI-Trainings oder Themen interessieren Sie sich?",
    type: "checkbox",
    options: [
      { value: "prompt_engineering", label: "Prompt Engineering" },
      { value: "llm_basics", label: "LLM-Grundlagen" },
      { value: "datenqualitaet_governance", label: "Datenqualit\u00e4t & Governance" },
      { value: "automatisierung", label: "Automatisierung & Skripte" },
      { value: "ethik_recht", label: "Ethische & rechtliche Grundlagen" },
      { value: "keine", label: "Keine / noch unklar" }
    ],
    description: "Mehrfachauswahl m\u00f6glich \u2013 dient der Auswahl passender Schulungen."
  },
  {
    key: "vision_prioritaet",
    label: "Welcher Aspekt Ihrer Vision ist Ihnen am wichtigsten?",
    type: "select",
    options: [
      { value: "gpt_services", label: "GPT-basierte Services f\u00fcr KMU" },
      { value: "kundenservice", label: "Kundenservice verbessern" },
      { value: "datenprodukte", label: "Neue datenbasierte Produkte" },
      { value: "prozessautomation", label: "Prozessautomatisierung" },
      { value: "marktfuehrerschaft", label: "Marktf\u00fchrerschaft erreichen" },
      { value: "keine_angabe", label: "Keine Angabe / wei\u00df nicht" }
    ],
    description: "Hilft, Empfehlungen passend zu priorisieren."
  },

  // Block 6: Datenschutz & Absenden (\u2192 h\u00e4ufig fehlend)
  { key:"datenschutz", label:"Ich habe die <a href='datenschutz.html' onclick='window.open(this.href,\"DatenschutzPopup\",\"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.", type:"privacy",
    description:"Ihre Angaben werden ausschlie\u00dflich zur Erstellung Ihrer pers\u00f6nlichen Auswertung genutzt." }
];
/* ============================================================================
   Blockstruktur / State / Render / Events
   ========================================================================== */

const blocks = [
  { name:"Unternehmensinfos", keys:["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
  { name:"Status Quo", keys:["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
  { name:"Ziele & Projekte", keys:["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
  { name:"Strategie & Governance", keys:["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
  // Neuer Block f\u00fcr Ressourcen & Pr\u00e4ferenzen \u2013 enth\u00e4lt Zeitbudget, Tools, regulierte Branche,
  // Trainingsinteressen und Vision-Priorit\u00e4t.  Alle Felder sind optional.
  { name:"Ressourcen & Pr\u00e4ferenzen", keys:["zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"] },
  { name:"Rechtliches & F\u00f6rderung", keys:["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
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
  <div class="progress-label">Schritt ${blockIdx+1} / ${blocks.length} \u2013 <b>${blocks[blockIdx].name}</b></div>`;
}

function renderBlock(blockIdx) {
  formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
  showProgress(blockIdx);
  const block = blocks[blockIdx];
  const form = document.getElementById("formbuilder");
  if (!form) return;

  form.innerHTML = block.keys.map(key => {
    const field = findField(key);
    if (!field) return ""; // Schutz: unbekannter Key \u2192 kein Render
    if (field.showIf && !field.showIf(formData)) return "";

    const guidance = field.description ? `<div class="guidance${field.key === "datenschutz" ? " important" : ""}">${field.description}</div>` : "";

    let input = "";
    switch (field.type) {
      case "select": {
        const selectedValue = formData[field.key] || "";
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Bitte w\u00e4hlen...</option>
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
        ${blockIdx > 0 ? `<button type="button" id="btn-prev">Zur\u00fcck</button>` : ""}
      </div>
      <div class="nav-right">
        ${blockIdx < blocks.length - 1
          ? `<button type="button" id="btn-next">Weiter</button>`
          : `<button type="button" id="btn-send" class="btn-next">Absenden</button>`}
        <button type="button" id="btn-reset" class="btn-reset">Zur\u00fccksetzen</button>
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

/* G\u00fcltigkeit (grobe) \u2013 bleibt f\u00fcr Backward-Kompatibilit\u00e4t bestehen */
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
      // Werte JIT \u00fcbernehmen
      const block = blocks[currentBlock];
      for (const key of block.keys) {
        const f = findField(key); if (f) formData[key] = getFieldValue(f);
      }
      saveAutosave();

      // Detaillierte Validierung + Benutzerfeedback
      const missing = validateBlockDetailed(currentBlock);
      if (missing.length) {
        if (fb) {
          fb.innerHTML = `<div class="form-error">Bitte erg\u00e4nzen Sie die folgenden Felder:<ul>${missing.map(m => `<li>${m}</li>`).join("")}</ul></div>`;
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
  // Daten sammeln
  const data = {}; fields.forEach(field => data[field.key] = formData[field.key]);
  data.lang = "de";

  // UI sofort updaten: Danke-Info zeigen und Buttons deaktivieren
  const form = document.getElementById("formbuilder");
  if (form) {
    form.querySelectorAll("button").forEach(b => { b.disabled = true; });
    form.innerHTML = `
      <h2>Vielen Dank f\u00fcr Ihre Angaben!</h2>
      <div class="success-msg" style="margin-top:10px;">
        Ihre KI-Analyse wird jetzt erstellt.<br>
        Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E-Mail.<br>
        Sie k\u00f6nnen dieses Fenster jetzt schlie\u00dfen.
      </div>
    `;
  }

  // \u1f510 Token JETZT frisch lesen (kein globales const token!)
  const token = (function(){ try { return localStorage.getItem("jwt") || null; } catch(e){ return null; } })();
  if (!token) {
    // Danke-Screen bleibt stehen \u2013 nur Hinweis erg\u00e4nzen
    if (form) form.insertAdjacentHTML("beforeend",
      `<div class="form-error" style="margin-top:12px">
         Ihre Sitzung ist abgelaufen. <a href="/login.html">Bitte neu anmelden</a>, 
         wenn Sie eine weitere Analyse durchf\u00fchren m\u00f6chten.
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
           wenn Sie eine weitere Analyse durchf\u00fchren m\u00f6chten.
         </div>`);
      return;
    }
    // Erfolgsfall: nichts weiter \u2013 UI zeigt bereits die Info
  }).catch(() => {
    // Fehlerfall ignorieren \u2013 Admin-Mail/PDF wird separat gehandhabt
  });

  // (Optional) Autosave NICHT l\u00f6schen w\u00e4hrend der Testphase
  // try { localStorage.removeItem(autosaveKey); } catch(e){}
}
// === TEXT OVERLAY (DE) \u2013 nur Texte, keine Logik! ===
const TEXTS_DE = {
  branche: {
    label: "In welcher Branche ist Ihr Unternehmen t\u00e4tig?",
    description: "Ihre Hauptbranche beeinflusst Benchmarks, Tool-Empfehlungen und die Auswertung. W\u00e4hlen Sie bitte das Kerngesch\u00e4ft, auf das Ihr Report zugeschnitten sein soll.",
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
    label: "Wie gro\u00df ist Ihr Unternehmen (Mitarbeiter:innen)?",
    description: "Die Unternehmensgr\u00f6\u00dfe beeinflusst Empfehlungen, F\u00f6rderm\u00f6glichkeiten und Vergleichswerte.",
    options: { solo: "1 (Solo-Selbstst\u00e4ndig/Freiberuflich)", team: "2\u201310 (Kleines Team)", kmu: "11\u2013100 (KMU)" }
  },
  selbststaendig: {
    label: "Unternehmensform bei 1 Person",
    description: "Bitte w\u00e4hlen Sie die zutreffende Rechtsform. So erhalten Sie Auswertungen, die genau auf Ihre Unternehmenssituation passen.",
    options: {
      freiberufler: "Freiberuflich/Selbstst\u00e4ndig",
      kapitalgesellschaft: "1-Personen-Kapitalgesellschaft (GmbH/UG)",
      einzelunternehmer: "Einzelunternehmer (mit Gewerbe)",
      sonstiges: "Sonstiges"
    }
  },
  bundesland: {
    label: "Bundesland (regionale F\u00f6rderm\u00f6glichkeiten)",
    description: "Ihr Standort entscheidet, welche F\u00f6rdermittel, Programme und Beratungsangebote Sie optimal nutzen k\u00f6nnen."
  },
  hauptleistung: {
    label: "Was ist das wichtigste Produkt oder die Hauptdienstleistung Ihres Unternehmens?",
    placeholder: "z. B. Social Media Kampagnen, CNC-Fertigung von Einzelteilen, Steuerberatung f\u00fcr Startups",
    description: "Beschreiben Sie Ihre zentrale Leistung m\u00f6glichst konkret. Beispiele helfen uns, Ihre Positionierung und passende Empfehlungen besser zu verstehen."
  },
  zielgruppen: {
    label: "F\u00fcr welche Zielgruppen oder Kundensegmente bieten Sie Ihre Leistungen an?",
    description: "F\u00fcr welche Kundengruppen bieten Sie Leistungen an? Bitte w\u00e4hlen Sie alle Zielgruppen aus, die f\u00fcr Sie relevant sind (Mehrfachauswahl m\u00f6glich).",
    options: {
      b2b: "B2B (Gesch\u00e4ftskunden)", b2c: "B2C (Endverbraucher)", kmu: "KMU (Kleine & mittlere Unternehmen)",
      grossunternehmen: "Gro\u00dfunternehmen", selbststaendige: "Selbstst\u00e4ndige/Freiberufler",
      oeffentliche_hand: "\u00d6ffentliche Hand", privatpersonen: "Privatpersonen", startups: "Startups", andere: "Andere"
    }
  },
  jahresumsatz: {
    label: "Jahresumsatz (Sch\u00e4tzung)",
    description: "Bitte sch\u00e4tzen Sie Ihren Jahresumsatz. Die Klassifizierung hilft bei Benchmarks, F\u00f6rderprogrammen und Empfehlungen."
  },
  it_infrastruktur: {
    label: "Wie ist Ihre IT-Infrastruktur aktuell organisiert?",
    description: "Ihre Antwort hilft uns, passende Empfehlungen f\u00fcr Sicherheit, Integration und moderne Tools auszuw\u00e4hlen.",
    options: {
      cloud: "Cloud-basiert (z. B. Microsoft 365, Google Cloud \u2026)",
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
    label: "Welche Datentypen stehen Ihnen f\u00fcr KI-Projekte und Analysen zur Verf\u00fcgung?",
    description: "Bitte w\u00e4hlen Sie alle Datenquellen aus, die f\u00fcr Ihr Unternehmen relevant sind (Mehrfachauswahl m\u00f6glich)."
  },
  digitalisierungsgrad: {
    label: "Wie digital sind Ihre internen Prozesse bereits? (1 = analog, 10 = voll digital)",
    description: "Sch\u00e4tzen Sie den aktuellen Stand: 1 = vor allem Papier und manuelle Abl\u00e4ufe, 10 = alles l\u00e4uft digital und automatisiert."
  },
  prozesse_papierlos: {
    label: "Wie hoch ist der Anteil papierloser Prozesse in Ihrem Unternehmen?",
    description: "Sch\u00e4tzen Sie grob: Wie viel l\u00e4uft komplett digital ohne Papierakten oder Ausdrucke?"
  },
  automatisierungsgrad: {
    label: "Wie hoch ist der Automatisierungsgrad Ihrer Arbeitsabl\u00e4ufe?",
    description: "Sind viele Arbeitsschritte noch Handarbeit oder l\u00e4uft vieles automatisch (z. B. durch KI, Scripte oder smarte Tools)?"
  },
  ki_einsatz: {
    label: "Wo wird KI heute bereits in Ihrem Unternehmen eingesetzt?",
    description: "Wo nutzen Sie bereits K\u00fcnstliche Intelligenz oder Automatisierung? W\u00e4hlen Sie alle Bereiche aus, die relevant sind."
  },
  ki_knowhow: {
    label: "Wie sch\u00e4tzen Sie das interne KI-Know-how Ihres Teams ein?",
    description: "Wie fit sind Sie und Ihr Team beim Thema KI? Nutzen Sie KI schon produktiv oder kennen Sie sich bereits tiefer aus?"
  },
  projektziel: {
    label: "Welches Ziel steht bei Ihrem n\u00e4chsten KI-/Digitalisierungsprojekt im Vordergrund?",
    description: "Was m\u00f6chten Sie mit Ihrem n\u00e4chsten Vorhaben vorrangig erreichen? Mehrfachauswahl m\u00f6glich."
  },
  ki_projekte: {
    label: "Gibt es aktuell laufende oder geplante KI-Projekte in Ihrem Unternehmen?",
    placeholder: "z. B. Chatbot, automatisierte Angebotserstellung, Generatoren, Analyse-Tools \u2026",
    description: "Beschreiben Sie laufende oder geplante Projekte m\u00f6glichst konkret. Gibt es bereits \u00dcberlegungen, Experimente oder Pilotprojekte?"
  },
  ki_usecases: {
    label: "Welche KI-Anwendungsf\u00e4lle interessieren Sie besonders?",
    description: "Welche KI-Anwendungsbereiche interessieren Sie besonders? Mehrfachauswahl m\u00f6glich."
  },
  ki_potenzial: {
    label: "Wo sehen Sie das gr\u00f6\u00dfte Potenzial f\u00fcr KI in Ihrem Unternehmen?",
    placeholder: "z. B. schnelleres Reporting, personalisierte Angebote, Kostenreduktion \u2026",
    description: "Wo sehen Sie f\u00fcr Ihr Unternehmen das gr\u00f6\u00dfte Potenzial durch KI? Gerne frei formulieren \u2013 alles ist willkommen."
  },
  usecase_priority: {
    label: "In welchem Bereich soll KI am ehesten zum Einsatz kommen?",
    description: "Gibt es einen Bereich, in dem KI besonders dringend gebraucht wird oder das gr\u00f6\u00dfte Potenzial bietet?"
  },
  ki_geschaeftsmodell_vision: {
    label: "Wie k\u00f6nnte KI Ihr Gesch\u00e4ftsmodell oder Ihre Branche grundlegend ver\u00e4ndern?",
    description: "Welche Ver\u00e4nderungen oder neuen M\u00f6glichkeiten sehen Sie langfristig durch KI? Es geht um Ihre gr\u00f6\u00dfere Vision."
  },
  moonshot: {
    label: "Was w\u00e4re ein mutiger Durchbruch \u2013 Ihre KI-Vision in 3 Jahren?",
    description: "Was w\u00e4re Ihre vision\u00e4re KI-Zukunft in 3 Jahren? Denken Sie gro\u00df."
  },
  datenschutzbeauftragter: {
    label: "Gibt es eine:n Datenschutzbeauftragte:n in Ihrem Unternehmen?",
    description: "Ein:e Datenschutzbeauftragte:r ist oft Pflicht \u2013 intern oder extern. Wie ist die Situation bei Ihnen?"
  },
  technische_massnahmen: {
    label: "Welche technischen Schutzma\u00dfnahmen f\u00fcr Daten sind bei Ihnen umgesetzt?",
    description: "Bitte w\u00e4hlen Sie, wie umfassend Sie Ihre Daten technisch sch\u00fctzen (Firewalls, Backups, Zugriffsbeschr\u00e4nkungen etc.)."
  }
};
Object.assign(TEXTS_DE, {
  folgenabschaetzung: {
    label: "Wurde f\u00fcr KI-Anwendungen eine DSGVO-Folgenabsch\u00e4tzung (DSFA) erstellt?",
    description: "Bei vielen KI-Anwendungen ist eine \u201eDSFA\u201c verpflichtend oder empfohlen \u2013 z. B. bei sensiblen Daten oder automatisierten Entscheidungen."
  },
  meldewege: {
    label: "Gibt es definierte Meldewege bei Datenschutzvorf\u00e4llen?",
    description: "Wie stellen Sie sicher, dass bei Datenschutzverst\u00f6\u00dfen schnell und systematisch gehandelt wird?"
  },
  loeschregeln: {
    label: "Existieren klare Regeln zur L\u00f6schung oder Anonymisierung von Daten?",
    description: "Haben Sie definierte Abl\u00e4ufe zur gesetzeskonformen L\u00f6schung/Anonymisierung (Mitarbeiter-, Kunden-, Trainingsdaten etc.)?"
  },
  ai_act_kenntnis: {
    label: "Wie gut kennen Sie die Anforderungen des EU AI Act?",
    description: "Der EU AI Act regelt viele neue Pflichten f\u00fcr KI-Anwendungen. Wie gut f\u00fchlen Sie sich informiert?"
  },
  ki_hemmnisse: {
    label: "Was hindert Ihr Unternehmen aktuell am (weiteren) KI-Einsatz?",
    description: "Typische H\u00fcrden: Datenschutz, Know-how, Zeit/Budget. W\u00e4hlen Sie alle relevanten Punkte."
  },
  bisherige_foerdermittel: {
    label: "Haben Sie bereits F\u00f6rdermittel f\u00fcr Digitalisierung oder KI beantragt und erhalten?",
    description: "Diese Angabe hilft, passende Anschlussprogramme oder neue Optionen vorzuschlagen."
  },
  interesse_foerderung: {
    label: "W\u00e4ren gezielte F\u00f6rderm\u00f6glichkeiten f\u00fcr Ihre Projekte interessant?",
    description: "Bei Interesse filtern wir passende Programme \u2013 ohne Werbung oder Verpflichtung."
  },
  erfahrung_beratung: {
    label: "Gab es schon Beratung zu Digitalisierung/KI?",
    description: "Externe Beratung (F\u00f6rderprojekte, Kammern, Berater, Tech-Partner) kann die Ausgangslage st\u00e4rken."
  },
  investitionsbudget: {
    label: "Welches Budget planen Sie f\u00fcr KI/Digitalisierung im n\u00e4chsten Jahr ein?",
    description: "Schon kleine Budgets bringen Fortschritt. F\u00f6rderprogramme k\u00f6nnen zus\u00e4tzlich helfen."
  },
  marktposition: {
    label: "Wie sch\u00e4tzen Sie Ihre Position im Markt?",
    description: "Hilft, Tempo, Budget und Potenziale realistisch einzuordnen."
  },
  benchmark_wettbewerb: {
    label: "Vergleichen Sie Ihre Digitalisierung/KI-Readiness mit Wettbewerbern?",
    description: "Benchmarks helfen, die eigene Position einzuordnen und Chancen zu erkennen."
  },
  innovationsprozess: {
    label: "Wie entstehen Innovationen in Ihrem Unternehmen?",
    description: "Strukturierte Innovationswege \u2013 intern oder extern \u2013 erleichtern gezielten KI-Einsatz."
  },
  risikofreude: {
    label: "Wie risikofreudig ist Ihr Unternehmen bei Innovationen? (1 = wenig, 5 = sehr)",
    description: "Sind Sie eher sicherheitsorientiert oder offen f\u00fcr mutige, neue Wege?"
  },
  datenschutz: {
    // label bleibt bewusst wie in der Datei (HTML-Link)
    description: "Bitte best\u00e4tigen Sie die Datenschutzhinweise. Ihre Angaben werden ausschlie\u00dflich zur Erstellung Ihrer pers\u00f6nlichen Auswertung genutzt."
  }
});

// wendet die Texte feldweise an, ohne Logik zu ver\u00e4ndern
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
