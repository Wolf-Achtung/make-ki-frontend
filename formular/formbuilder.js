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

// --- Felder wie gehabt (aus deiner bisherigen Datei), KEINE Kürzungen! ---
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
    placeholder: "z. B. Social Media Kampagnen, CNC-Fertigung von Einzelteilen, Steuerberatung für Startups",
    description: "Beschreiben Sie Ihre zentrale Leistung möglichst konkret. Beispiele helfen uns, Ihre Positionierung und passende Empfehlungen besser zu verstehen."
  },
  {
    key: "zielgruppen",
    label: "Für welche Zielgruppen oder Kundensegmente bieten Sie Ihre Leistungen an?",
    type: "checkbox",
    options: [
      { value: "b2b", label: "B2B (Geschäftskunden)" },
      { value: "b2c", label: "B2C (Endverbraucher)" },
      { value: "kmu", label: "KMU (Kleine & mittlere Unternehmen)" },
      { value: "grossunternehmen", label: "Großunternehmen" },
      { value: "selbststaendige", label: "Selbstständige/Freiberufler" },
      { value: "oeffentliche_hand", label: "Öffentliche Hand" },
      { value: "privatpersonen", label: "Privatpersonen" },
      { value: "startups", label: "Startups" },
      { value: "andere", label: "Andere" }
    ],
    description: "Für welche Kundengruppen bieten Sie Leistungen an? Bitte wählen Sie alle Zielgruppen aus, die für Sie relevant sind (Mehrfachauswahl möglich)."
  },

  // Block 2: Status Quo & Digitalisierungsgrad
  {
    key: "digitalisierungsgrad",
    label: "Wie digital sind Ihre internen Prozesse bereits? (1 = analog, 10 = voll digital)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    description: "Schätzen Sie den aktuellen Stand: 1 = vor allem Papier und manuelle Abläufe, 10 = alles läuft digital und automatisiert."
  },
  {
    key: "prozesse_papierlos",
    label: "Wie hoch ist der Anteil papierloser Prozesse in Ihrem Unternehmen?",
    type: "select",
    options: [
      { value: "0-20", label: "0–20 %" },
      { value: "21-50", label: "21–50 %" },
      { value: "51-80", label: "51–80 %" },
      { value: "81-100", label: "81–100 %" }
    ],
    description: "Schätzen Sie grob: Wie viel läuft komplett digital ohne Papierakten oder Ausdrucke?"
  },
  {
    key: "automatisierungsgrad",
    label: "Wie hoch ist der Automatisierungsgrad Ihrer Arbeitsabläufe?",
    type: "select",
    options: [
      { value: "sehr_niedrig", label: "Sehr niedrig" },
      { value: "eher_niedrig", label: "Eher niedrig" },
      { value: "mittel", label: "Mittel" },
      { value: "eher_hoch", label: "Eher hoch" },
      { value: "sehr_hoch", label: "Sehr hoch" }
    ],
    description: "Sind viele Arbeitsschritte noch Handarbeit oder läuft vieles automatisch (z. B. durch KI, Scripte oder smarte Tools)?"
  },
{
  key: "ki_einsatz",
  label: "Wo wird KI heute bereits in Ihrem Unternehmen eingesetzt?",
  type: "checkbox",
  options: [
    { value: "marketing", label: "Marketing" },
    { value: "vertrieb", label: "Vertrieb" },
    { value: "buchhaltung", label: "Buchhaltung" },
    { value: "produktion", label: "Produktion" },
    { value: "kundenservice", label: "Kundenservice" },
    { value: "it", label: "IT" },
    { value: "forschung", label: "Forschung & Entwicklung" },
    { value: "personal", label: "Personal" },
    { value: "keine", label: "Noch keine Nutzung" },
    { value: "sonstiges", label: "Sonstiges" }
  ],
  description: "Wo nutzen Sie bereits Künstliche Intelligenz oder Automatisierung? Wählen Sie alle Bereiche aus, die relevant sind."
},
  {
    key: "ki_knowhow",
    label: "Wie schätzen Sie das interne KI-Know-how Ihres Teams ein?",
    type: "select",
    options: [
      { value: "keine", label: "Keine Erfahrung" },
      { value: "grundkenntnisse", label: "Grundkenntnisse" },
      { value: "mittel", label: "Mittel" },
      { value: "fortgeschritten", label: "Fortgeschritten" },
      { value: "expertenwissen", label: "Expertenwissen" }
    ],
    description: "Wie fit sind Sie und Ihr Team beim Thema KI? Nutzen Sie KI schon produktiv oder kennen Sie sich bereits tiefer aus?"
  },
  // Block 3: Ziele & Projekte
  {
    key: "projektziel",
    label: "Welches Ziel steht bei Ihrem nächsten KI-/Digitalisierungsprojekt im Vordergrund?",
    type: "checkbox",
    options: [
      { value: "prozessautomatisierung", label: "Prozessautomatisierung" },
      { value: "kostensenkung", label: "Kostensenkung" },
      { value: "compliance", label: "Compliance/Datenschutz" },
      { value: "produktinnovation", label: "Produktinnovation" },
      { value: "kundenservice", label: "Kundenservice verbessern" },
      { value: "markterschliessung", label: "Markterschließung" },
      { value: "personalentlastung", label: "Personalentlastung" },
      { value: "foerdermittel", label: "Fördermittel beantragen" },
      { value: "andere", label: "Andere" }
    ],
    description: "Was möchten Sie mit Ihrem nächsten Vorhaben vorrangig erreichen? Mehrfachauswahl möglich."
  },
  {
    key: "ki_projekte",
    label: "Gibt es aktuell laufende oder geplante KI-Projekte in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "z. B. Chatbot für Kundenanfragen, automatisierte Angebotserstellung, Text- oder Bildgeneratoren, Analyse-Tools für Vertrieb",
    description: "Beschreiben Sie laufende oder geplante Projekte möglichst konkret. Gibt es bereits Überlegungen, Experimente oder Pilotprojekte?"
  },
  {
    key: "ki_usecases",
    label: "Welche KI-Anwendungsfälle interessieren Sie besonders?",
    type: "checkbox",
    options: [
      { value: "texterstellung", label: "Texterstellung (z. B. automatisierte Berichte, Posts)" },
      { value: "bildgenerierung", label: "Bildgenerierung (z. B. KI-Grafiken, Logovarianten)" },
      { value: "spracherkennung", label: "Spracherkennung (z. B. Transkription, Voicebots)" },
      { value: "prozessautomatisierung", label: "Prozessautomatisierung (z. B. Belegprüfung, Rechnungsversand)" },
      { value: "datenanalyse", label: "Datenanalyse & Prognose (z. B. Markttrends, Kundenverhalten)" },
      { value: "kundensupport", label: "Kundensupport (z. B. Chatbots, FAQ-Automation)" },
      { value: "wissensmanagement", label: "Wissensmanagement (z. B. Dokumentenverwaltung, intelligente Suche)" },
      { value: "marketing", label: "Marketing (z. B. Zielgruppen-Segmentierung, Kampagnenoptimierung)" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "Welche KI-Anwendungsbereiche interessieren Sie besonders? Mehrfachauswahl möglich."
  },
  {
    key: "ki_potenzial",
    label: "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "z. B. Schnelleres Reporting, personalisierte Angebote, Kostenreduktion durch Automatisierung, neue Services ...",
    description: "Wo sehen Sie für Ihr Unternehmen das größte Potenzial durch KI? Gerne frei formulieren – alles ist willkommen."
  },
  {
    key: "usecase_priority",
    label: "In welchem Bereich soll KI am ehesten zum Einsatz kommen?",
    type: "select",
    options: [
      { value: "marketing", label: "Marketing" },
      { value: "vertrieb", label: "Vertrieb" },
      { value: "buchhaltung", label: "Buchhaltung" },
      { value: "produktion", label: "Produktion" },
      { value: "kundenservice", label: "Kundenservice" },
      { value: "it", label: "IT" },
      { value: "forschung", label: "Forschung & Entwicklung" },
      { value: "personal", label: "Personal" },
      { value: "unbekannt", label: "Noch unklar / Entscheide ich später" }
    ],
    description: "Gibt es einen Unternehmensbereich, in dem KI besonders dringend gebraucht wird oder das größte Potenzial bietet?"
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "Wie könnte KI Ihr Geschäftsmodell oder Ihre Branche grundlegend verändern?",
    type: "textarea",
    placeholder: "z. B. Automatisierte Online-Beratungen, datenbasierte Plattform-Services, völlig neue Produkte, …",
    description: "Welche Veränderungen oder neuen Möglichkeiten sehen Sie langfristig durch KI? Hier geht es um Ihre größere Vision – ob konkret oder visionär."
  },
  {
    key: "moonshot",
    label: "Was wäre ein mutiger Durchbruch – Ihre KI-Vision in 3 Jahren?",
    type: "textarea",
    placeholder: "z. B. 80 % meiner Routinearbeiten übernimmt KI; mein Umsatz verdoppelt sich durch smarte Automatisierung …",
    description: "Was wäre Ihre visionäre KI-Zukunft in 3 Jahren? Denken Sie groß."
  },

  // Block 4: Rechtliches & Förderung
  {
    key: "datenschutzbeauftragter",
    label: "Gibt es eine:n Datenschutzbeauftragte:n in Ihrem Unternehmen?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (externer Berater / noch in Planung)" }
    ],
    description: "Ein:e Datenschutzbeauftragte:r ist oft Pflicht – unabhängig davon, ob intern oder extern. Wie ist die Situation bei Ihnen?"
  },
  {
    key: "technische_massnahmen",
    label: "Welche technischen Schutzmaßnahmen für Daten sind bei Ihnen umgesetzt?",
    type: "select",
    options: [
      { value: "alle", label: "Alle relevanten Maßnahmen vorhanden (Firewall, Zugriffskontrolle …)" },
      { value: "teilweise", label: "Teilweise vorhanden" },
      { value: "keine", label: "Noch keine umgesetzt" }
    ],
    description: "Bitte wählen Sie, wie umfassend Sie Ihre Daten technisch schützen (Firewalls, Backups, Zugriffsbeschränkungen etc.)."
  },
  {
    key: "folgenabschaetzung",
    label: "Wurde für KI-Anwendungen eine DSGVO-Folgenabschätzung (DSFA) erstellt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (in Planung)" }
    ],
    description: "Gerade bei sensiblen KI-Systemen ist eine DSFA empfohlen. Trifft das bei Ihnen bereits zu?"
  },
  {
    key: "meldewege",
    label: "Gibt es definierte Meldewege bei Datenschutzvorfällen?",
    type: "select",
    options: [
      { value: "ja", label: "Ja, klare Prozesse" },
      { value: "teilweise", label: "Teilweise geregelt" },
      { value: "nein", label: "Nein" }
    ],
    description: "Wie stellen Sie sicher, dass bei Datenschutzverstößen schnell und systematisch gehandelt wird?"
  },
  {
    key: "loeschregeln",
    label: "Existieren klare Regeln zur Löschung oder Anonymisierung von Daten?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Haben Sie definierte Abläufe, um Daten gesetzeskonform zu löschen oder zu anonymisieren?"
  },
  {
    key: "ai_act_kenntnis",
    label: "Wie gut kennen Sie die Anforderungen des EU AI Act?",
    type: "select",
    options: [
      { value: "sehr_gut", label: "Sehr gut" },
      { value: "gut", label: "Gut" },
      { value: "gehört", label: "Schon mal gehört" },
      { value: "unbekannt", label: "Noch nicht beschäftigt" }
    ],
    description: "Der EU AI Act regelt viele neue Pflichten für KI-Anwendungen. Wie gut fühlen Sie sich informiert?"
  },
  {
    key: "ki_hemmnisse",
    label: "Was hindert Ihr Unternehmen aktuell am (weiteren) KI-Einsatz?",
    type: "checkbox",
    options: [
      { value: "rechtsunsicherheit", label: "Unsicherheit bei Rechtslage" },
      { value: "datenschutz", label: "Datenschutz" },
      { value: "knowhow", label: "Fehlendes Know-how" },
      { value: "budget", label: "Begrenztes Budget" },
      { value: "teamakzeptanz", label: "Akzeptanz im Team" },
      { value: "zeitmangel", label: "Zeitmangel" },
      { value: "it_integration", label: "IT-Integration" },
      { value: "keine", label: "Keine Hemmnisse" },
      { value: "andere", label: "Andere" }
    ],
    description: "Typische Hürden sind Unsicherheit bei Datenschutz, fehlendes Know-how oder begrenzte Kapazitäten. Wählen Sie alle Punkte aus, die für Sie relevant sind."
  },
  {
    key: "bisherige_foerdermittel",
    label: "Haben Sie bisher schon Fördermittel für Digitalisierung oder KI genutzt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    description: "Haben Sie in der Vergangenheit staatliche oder regionale Fördermittel für Digitalisierung, IT oder KI beantragt oder erhalten? Diese Angabe hilft, passende Anschlussprogramme oder neue Optionen vorzuschlagen."
  },
  {
    key: "interesse_foerderung",
    label: "Wären gezielte Fördermöglichkeiten für Ihre Projekte interessant?",
    type: "select",
    options: [
      { value: "ja", label: "Ja, bitte passende Programme vorschlagen" },
      { value: "nein", label: "Nein, kein Bedarf" },
      { value: "unklar", label: "Unklar, bitte beraten" }
    ],
    description: "Wünschen Sie individuelle Empfehlungen für Förderprogramme? Wir filtern auf Wunsch passende Angebote für Sie heraus."
  },
  {
    key: "erfahrung_beratung",
    label: "Gab es schon Beratung zum Thema Digitalisierung/KI?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ],
    description: "Wurde Ihr Unternehmen bereits extern beraten? Das beeinflusst die Tiefe und Ausrichtung der Empfehlungen."
  },
  {
    key: "investitionsbudget",
    label: "Welches Budget planen Sie für KI/Digitalisierung im nächsten Jahr ein?",
    type: "select",
    options: [
      { value: "unter_2000", label: "Unter 2.000 €" },
      { value: "2000_10000", label: "2.000–10.000 €" },
      { value: "10000_50000", label: "10.000–50.000 €" },
      { value: "ueber_50000", label: "Mehr als 50.000 €" },
      { value: "unklar", label: "Noch unklar" }
    ],
    description: "Schon mit kleinen Budgets lassen sich Fortschritte erzielen – Förderprogramme können zusätzlich helfen. Grobe Schätzung reicht."
  },
  {
    key: "marktposition",
    label: "Wie schätzen Sie Ihre Position im Markt?",
    type: "select",
    options: [
      { value: "marktfuehrer", label: "Marktführer" },
      { value: "oberes_drittel", label: "Im oberen Drittel" },
      { value: "mittelfeld", label: "Mittelfeld" },
      { value: "nachzuegler", label: "Nachzügler / Aufholer" },
      { value: "unsicher", label: "Schwer einzuschätzen" }
    ],
    description: "Wie positioniert sich Ihr Unternehmen im Wettbewerbsvergleich?"
  },
  {
    key: "benchmark_wettbewerb",
    label: "Vergleichen Sie Ihre Digitalisierung/KI-Readiness mit Wettbewerbern?",
    type: "select",
    options: [
      { value: "ja", label: "Ja, regelmäßig" },
      { value: "nein", label: "Nein" },
      { value: "selten", label: "Nur selten / informell" }
    ],
    description: "Solche Benchmarks helfen, die eigene Position einzuordnen und Chancen zu erkennen."
  },
  {
    key: "innovationsprozess",
    label: "Wie entstehen Innovationen in Ihrem Unternehmen?",
    type: "select",
    options: [
      { value: "innovationsteam", label: "Durch internes Innovationsteam" },
      { value: "mitarbeitende", label: "Durch Mitarbeitende" },
      { value: "kunden", label: "In Zusammenarbeit mit Kunden" },
      { value: "berater", label: "Mit externen Beratern/Partnern" },
      { value: "zufall", label: "Eher zufällig/ungeplant" },
      { value: "unbekannt", label: "Keine klare Strategie" }
    ],
    description: "Wie entstehen bei Ihnen neue Ideen, Produkte oder digitale Lösungen? Je klarer Ihr Innovationsprozess, desto gezielter können KI-Projekte geplant und umgesetzt werden."
  },
  {
    key: "risikofreude",
    label: "Wie risikofreudig ist Ihr Unternehmen bei Innovationen? (1 = wenig, 5 = sehr)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    description: "Sind Sie bei neuen Ideen und Innovationen eher sicherheitsorientiert oder offen für mutige, neue Wege?"
  },

  // Block 5: Datenschutz & Absenden
  {
    key: "datenschutz",
    label: "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
    type: "privacy",
    description: "Bitte bestätigen Sie, dass Sie die Datenschutzhinweise gelesen haben. Ihre Angaben werden ausschließlich zur Erstellung Ihrer persönlichen Auswertung genutzt."
  }
];
// --- Blockstruktur ---
const blocks = [
  {
    name: "Unternehmensinfos",
    keys: ["branche", "unternehmensgroesse", "selbststaendig", "bundesland", "hauptleistung", "zielgruppen"]
  },
  {
    name: "Status Quo",
    keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", "ki_einsatz", "ki_knowhow"]
  },
  {
    name: "Ziele & Projekte",
    keys: ["projektziel", "ki_projekte", "ki_usecases", "ki_potenzial", "usecase_priority", "ki_geschaeftsmodell_vision", "moonshot"]
  },
  {
    name: "Rechtliches & Förderung",
    keys: [
      "datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", "meldewege", "loeschregeln",
      "ai_act_kenntnis", "ki_hemmnisse", "bisherige_foerdermittel", "interesse_foerderung", "erfahrung_beratung",
      "investitionsbudget", "marktposition", "benchmark_wettbewerb", "innovationsprozess", "risikofreude"
    ]
  },
  {
    name: "Datenschutz & Absenden",
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
  <div class="progress-label">Schritt ${blockIdx+1} / ${blocks.length} – <b>${blocks[blockIdx].name}</b></div>`;
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
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Bitte wählen...</option>
            ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join("")}
          </select>`;
        break;

      case "textarea":
        input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder || ""}">${formData[field.key] || ""}</textarea>`;
        break;

      case "checkbox":
        input = `<div class="checkbox-group twocol">
          ${field.options.map(opt => {
            const [mainLabel, sub] = opt.label.split(" (z. B.");
            const subText = sub ? `<div class="option-example">z. B. ${sub.replace(")", "")}</div>` : "";
            const checked = formData[field.key]?.includes(opt.value) ? 'checked' : '';
            return `<label class="checkbox-label">
              <input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}>
              ${mainLabel.trim()}
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
      ${blockIdx > 0 ? `<button type="button" id="btn-prev">Zurück</button>` : ""}
      ${blockIdx < blocks.length - 1
        ? `<button type="button" id="btn-next">Weiter</button>`
        : `<button type="button" id="btn-send" class="btn-next">Absenden</button>`}
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
      if (formData[key]) {
        formData[key].forEach(v => {
          const box = document.querySelector(`input[name="${field.key}"][value="${v}"]`);
          if (box) box.checked = true;
        });
      }
    } else if (field.type === "slider") {
  const val = formData[key] ?? field.min ?? 1;
  el.value = val;
  if (el.nextElementSibling) el.nextElementSibling.innerText = val;
}
  }
}

function blockIsValid(blockIdx) {
  const block = blocks[blockIdx];
  return block.keys.every(key => {
    const field = fields.find(f => f.key === key);
    if (!field) return true;
    if (field.showIf && !field.showIf(formData)) return true;
    const val = formData[key];
    if (field.type === "checkbox") return Array.isArray(val) && val.length > 0;
    if (field.type === "privacy") return val === true;
    return val !== undefined && val !== "";
  });
}

function handleFormEvents() {
  document.getElementById("formbuilder").addEventListener("change", () => {
    const block = blocks[currentBlock];
    for (const key of block.keys) {
      const field = fields.find(f => f.key === key);
      if (field) formData[key] = getFieldValue(field);
    }
    saveAutosave();
  });

  document.getElementById("formbuilder").addEventListener("click", e => {
    const feedback = document.getElementById("feedback");

    if (e.target.id === "btn-next") {
      if (!blockIsValid(currentBlock)) {
        feedback.innerHTML = `<div class="form-error">Bitte füllen Sie alle Felder dieses Abschnitts aus.</div>`;
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
  setTimeout(() => setFieldValues(currentBlock), 20);
  handleFormEvents();
});

function submitAllBlocks() {
  const data = {};
  fields.forEach(field => data[field.key] = formData[field.key]);

  const BASE_URL = location.hostname.includes("localhost")
    ? "https://make-ki-backend-neu-production.up.railway.app"
    : "https://make-ki-backend-neu-production.up.railway.app";

  document.getElementById("formbuilder").innerHTML = `
    <div class="loading-msg">
      <div class="loader"></div>
      <div>Ihre Angaben werden analysiert … bitte einen Moment Geduld.</div>
    </div>`;

  fetch(`${BASE_URL}/briefing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(data => {
      localStorage.removeItem("autosave_form");
      showSuccess(data);
    })
    .catch(() => {
      document.getElementById("formbuilder").innerHTML = `<div class="form-error">Fehler bei der Übertragung. Bitte erneut versuchen.</div>`;
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

  // HTML-Report direkt anzeigen – ohne Redirect
  document.getElementById("formbuilder").innerHTML = `
    <h2>KI-Readiness-Analyse abgeschlossen!</h2>
    <div class="success-msg">
      Ihre Angaben wurden erfolgreich übermittelt.<br>
      Der KI–Readiness–Report wurde erstellt.<br>
    </div>
    ${report}
  `;
  // ⏳ Optional: Redirect zur PDF-Seite nach kurzer Wartezeit
  setTimeout(() => {
    window.location.href = "report.html";
  }, 1000);
}
