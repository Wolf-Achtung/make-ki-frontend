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
    description: "Beschreiben Sie Ihr Angebot so konkret wie möglich – gerne mit Beispielen, Zielgruppe oder Besonderheiten."
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
    description: "Sind viele Arbeitsschritte noch Handarbeit oder läuft vieles automatisch (z. B. durch KI, Scripte oder smarte Tools)?"
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
  }
  // ...weiter mit Teil 2!
];
// ... Fortsetzung des fields-Arrays aus Teil 1

  // Zielgruppen
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
    description: "Wählen Sie alle Zielgruppen aus, die Sie typischerweise ansprechen. Das hilft, die Analyse und Empfehlungen an Ihren Markt anzupassen."
  },

  // Projektziele
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
    description: "Was möchten Sie mit Ihrem nächsten Vorhaben vorrangig erreichen? Sie können gerne mehrere Ziele auswählen."
  },

  // Aktuelle KI-Einsatzbereiche
  {
    key: "ki_einsatz",
    label: "In welchen Bereichen nutzen Sie bereits Künstliche Intelligenz oder Automatisierung?",
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
    description: "Wählen Sie alle Unternehmensbereiche aus, in denen KI-Tools, Automatisierungen oder smarte Workflows heute schon eine Rolle spielen."
  },

  // Geplante oder laufende KI-Projekte
  {
    key: "ki_projekte",
    label: "Gibt es aktuell laufende oder geplante KI-Projekte in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "z. B. Chatbot für Kundenanfragen, automatisierte Angebotserstellung, Text- oder Bildgeneratoren, Analyse-Tools für Vertrieb",
    description: "Beschreiben Sie laufende oder geplante Projekte möglichst konkret. Gibt es bereits Überlegungen, Experimente oder Pilotprojekte?"
  },

  // Wunsch-Usecases
  {
    key: "ki_usecases",
    label: "Welche KI-Anwendungsfälle interessieren Sie besonders?",
    type: "checkbox",
    options: [
      { value: "texterstellung", label: "Texterstellung (z. B. automatisierte Berichte, Posts)" },
      { value: "bildgenerierung", label: "Bildgenerierung (z. B. KI-Grafiken, Logovarianten)" },
      { value: "spracherkennung", label: "Spracherkennung (z. B. Transkription, Voicebots)" },
      { value: "prozessautomatisierung", label: "Prozessautomatisierung (z. B. Belegprüfung, Rechnungsversand)" },
      { value: "datenanalyse", label: "Datenanalyse & Prognose (z. B. Markttrends, Kundenverhalten)" },
      { value: "kundensupport", label: "Kundensupport (z. B. Chatbots, FAQ-Automation)" },
      { value: "wissensmanagement", label: "Wissensmanagement (z. B. Dokumentenverwaltung, intelligente Suche)" },
      { value: "marketing", label: "Marketing (z. B. Zielgruppen-Segmentierung, Kampagnenoptimierung)" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "Was wäre für Sie der spannendste oder nützlichste Anwendungsfall für KI? Kreuzen Sie alles an, was für Sie Potenzial bietet."
  },

  // Einschätzung KI-Potenzial
  {
    key: "ki_potenzial",
    label: "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "z. B. Schnelleres Reporting, personalisierte Angebote, Kostenreduktion durch Automatisierung, neue Services ...",
    description: "Teilen Sie uns Ihre Einschätzung oder Wünsche mit. Ob Vision, Problem oder Strategie – alles ist willkommen!"
  },
  // Priorisierter KI-Einsatzbereich
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

  // Vision / Geschäftsmodell-Transformation
  {
    key: "ki_geschaeftsmodell_vision",
    label: "Wie könnte KI Ihr Geschäftsmodell oder Ihre Branche grundlegend verändern?",
    type: "textarea",
    placeholder: "z. B. Automatisierte Online-Beratungen, datenbasierte Plattform-Services, völlig neue Produkte, …",
    description: "Was wäre Ihre große Vision für Ihr Unternehmen? Welche Möglichkeiten ergeben sich durch KI, die heute noch gar nicht voll ausgeschöpft werden?"
  },

  // Moonshot / Big Dream
  {
    key: "moonshot",
    label: "Was wäre ein mutiger Durchbruch – Ihre KI-Vision in 3 Jahren?",
    type: "textarea",
    placeholder: "z. B. 80% meiner Routinearbeiten übernimmt KI; mein Umsatz verdoppelt sich durch smarte Automatisierung …",
    description: "Denken Sie ruhig groß! Was wäre ein echtes Highlight oder 'Moonshot', das Sie mit KI in Ihrem Unternehmen erreichen möchten?"
  },

  // Datenschutzbeauftragter
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

  // Technische Maßnahmen Datenschutz
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

  // DSGVO-Folgenabschätzung
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

  // Meldewege Datenschutzvorfälle
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

  // Löschregeln
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

  // Kenntnis EU AI Act
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

  // Hemmnisse / Barrieren
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
    description: "Bitte kreuzen Sie alle Barrieren an, die für Sie relevant sind. Je ehrlicher, desto gezielter kann beraten werden!"
  },

  // Fördermittel bisher
  {
    key: "bisherige_foerdermittel",
    label: "Haben Sie bisher schon Fördermittel für Digitalisierung oder KI genutzt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    description: "Haben Sie bereits Fördermittel erhalten oder beantragt? Das hilft, die Auswertung gezielt zu gestalten."
  },

  // Fördermittel Interesse
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

  // Beratungserfahrung
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

  // Investitionsbudget
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
    description: "Wie hoch ist Ihr geplantes Investitionsbudget für KI- oder Digitalisierungsprojekte im nächsten Jahr? Grobe Schätzung reicht."
  },

  // Marktposition
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

  // Benchmarking
  {
    key: "benchmark_wettbewerb",
    label: "Vergleichen Sie Ihre Digitalisierung/KI-Readiness mit Wettbewerbern?",
    type: "select",
    options: [
      { value: "ja", label: "Ja, regelmäßig" },
      { value: "nein", label: "Nein" },
      { value: "selten", label: "Nur selten / informell" }
    ],
    description: "Gibt es regelmäßige Vergleiche oder Analysen zum Stand der Digitalisierung im Wettbewerb?"
  },

  // Innovationsprozess
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
    description: "Gibt es einen strukturierten Innovationsprozess, oder entstehen neue Ideen eher spontan?"
  },

  // Risikofreude
  {
    key: "risikofreude",
    label: "Wie risikofreudig ist Ihr Unternehmen bei Innovationen? (1 = wenig, 5 = sehr)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    description: "Sind Sie bei neuen Ideen und Innovationen eher sicherheitsorientiert oder offen für mutige, neue Wege?"
  }

]; // Ende des fields-Arrays


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
  showProgress(blockIdx);
  const block = blocks[blockIdx];
  const form = document.getElementById("formbuilder");
  if (!form) return;

  form.innerHTML = block.keys.map(key => {
    const field = fields.find(f => f.key === key);
    if (!field) return "";
    let input = "";
    // Input-Render wie im bisherigen Code ...
    switch (field.type) {
      case "select":
        input = `
          <label for="${field.key}"><b>${field.label}</b></label>
          <select id="${field.key}" name="${field.key}">
            <option value="">Bitte wählen...</option>
            ${field.options.map(opt => `
              <option value="${opt.value}">${opt.label}</option>
            `).join("")}
          </select>
        `;
        break;
      case "textarea":
        input = `<label for="${field.key}"><b>${field.label}</b></label>
          <textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder||""}">${formData[field.key]||""}</textarea>`;
        break;
      case "checkbox":
        input = `<b>${field.label}</b>
          <div class="checkbox-group">
            ${field.options.map(opt => `
              <label class="checkbox-label">
                <input type="checkbox" name="${field.key}" value="${opt.value}" ${formData[field.key]&&formData[field.key].includes(opt.value)?'checked':''} />
                ${opt.label}
              </label>
            `).join("")}
          </div>`;
        break;
      case "slider":
        input = `<label for="${field.key}"><b>${field.label}</b></label>
          <input type="range" id="${field.key}" name="${field.key}" min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" value="${formData[field.key]||field.min||1}" oninput="this.nextElementSibling.innerText=this.value"/>
          <span class="slider-value-label">${formData[field.key]||field.min||1}</span>`;
        break;
      case "privacy":
        input = `<div class="privacy-section">
          <label>
            <input type="checkbox" id="${field.key}" name="${field.key}" ${formData[field.key]?'checked':''} required />
            ${field.label}
          </label>
        </div>`;
        break;
      default:
        input = `<label for="${field.key}"><b>${field.label}</b></label>
          <input type="text" id="${field.key}" name="${field.key}" value="${formData[field.key]||""}" />`;
    }
    const guidance = field.description
      ? `<div class="guidance${field.key === "datenschutz" ? " important" : ""}">${field.description}</div>`
      : "";
    return `<div class="form-group">${input}${guidance}</div>`;
  }).join("");

  // Navigation
  form.innerHTML += `
    <div class="form-nav">
      ${blockIdx > 0 ? `<button type="button" id="btn-prev">Zurück</button>` : ""}
      ${blockIdx < blocks.length-1
        ? `<button type="button" id="btn-next">Weiter</button>`
        : `<button type="submit" id="submit-btn">Absenden</button>`}
    </div>
    <div id="feedback"></div>
  `;
}
// --- Teil 2: Events, Autosave, Navigation, Autosave, Submission ---
// (Bitte direkt unter Teil 1 einfügen!)

function saveAutosave() {
  localStorage.setItem("autosave_form", JSON.stringify(formData));
}

function loadAutosave() {
  formData = JSON.parse(localStorage.getItem("autosave_form") || "{}");
}

function getFieldValue(field) {
  switch (field.type) {
    case "checkbox":
      const checked = Array.from(document.querySelectorAll(`input[name="${field.key}"]:checked`)).map(e => e.value);
      return checked;
    case "slider":
      return document.getElementById(field.key)?.value || field.min || 1;
    case "privacy":
      return document.getElementById(field.key)?.checked ? true : false;
    default:
      return document.getElementById(field.key)?.value || "";
  }
}

function setFieldValues(blockIdx) {
  // Füllt die Felder aus autosave wieder ein
  const block = blocks[blockIdx];
  for (const key of block.keys) {
    const field = fields.find(f => f.key === key);
    if (!field) continue;
    switch (field.type) {
      case "checkbox":
        if (formData[key] && Array.isArray(formData[key])) {
          for (const v of formData[key]) {
            const el = document.querySelector(`input[name="${field.key}"][value="${v}"]`);
            if (el) el.checked = true;
          }
        }
        break;
      case "slider":
        const sl = document.getElementById(field.key);
        if (sl && formData[key]) {
          sl.value = formData[key];
          if (sl.nextElementSibling) sl.nextElementSibling.innerText = formData[key];
        }
        break;
      case "privacy":
        const chk = document.getElementById(field.key);
        if (chk && formData[key]) chk.checked = true;
        break;
      default:
        const inp = document.getElementById(field.key);
        if (inp && formData[key]) inp.value = formData[key];
    }
  }
}

function blockIsValid(blockIdx) {
  // Validierung: (minimal) alle Pflichtfelder im Block ausgefüllt?
  const block = blocks[blockIdx];
  let valid = true;
  for (const key of block.keys) {
    const field = fields.find(f => f.key === key);
    if (!field) continue;
    // Checkboxen: mindestens eine? Textfelder: nicht leer
    if (field.type === "checkbox" && (!formData[key] || !formData[key].length)) valid = false;
    if ((field.type === "select" || field.type === "slider" || field.type === "textarea" || field.type === "text") && !formData[key]) valid = false;
    if (field.type === "privacy" && !formData[key]) valid = false;
  }
  return valid;
}

// --- Event-Handler für Navigation ---
function handleFormEvents() {
  document.getElementById("formbuilder").addEventListener("change", e => {
    // Save all fields in current block
    const block = blocks[currentBlock];
    for (const key of block.keys) {
      const field = fields.find(f => f.key === key);
      if (field) {
        formData[key] = getFieldValue(field);
      }
    }
    saveAutosave();
  });

  // Navigation-Buttons
  document.getElementById("formbuilder").addEventListener("click", e => {
    if (e.target.id === "btn-next") {
      // Validate
      const feedback = document.getElementById("feedback");
      if (!blockIsValid(currentBlock)) {
        feedback.innerHTML = `<span class="form-error">Bitte füllen Sie alle Felder dieses Abschnitts aus!</span>`;
        return;
      }
      feedback.innerHTML = "";
      currentBlock++;
      renderBlock(currentBlock);
      setFieldValues(currentBlock);
    }
    if (e.target.id === "btn-prev") {
      currentBlock--;
      renderBlock(currentBlock);
      setFieldValues(currentBlock);
    }
  });
}

// --- Initialisierung aufrufen (am Ende der Datei!) ---
window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderBlock(currentBlock);
  setFieldValues(currentBlock);
  handleFormEvents();
});
// --- Teil 3: Datenübertragung, Abschlussanzeige, Autosave, Reset ---
// (Bitte UNTER Teil 2 einfügen!)

function submitAllBlocks() {
  // Sammle alle Felder aus allen Blöcken
  let completeData = {};
  for (const field of fields) {
    completeData[field.key] = formData[field.key];
  }
  // JWT-Token holen
  const token = localStorage.getItem("jwt") || "";
  // Ladeanzeige
  document.getElementById("formbuilder").innerHTML = `
    <div class="loading-msg">
      <div class="loader"></div>
      <div>Ihre Angaben werden analysiert...<br>Bitte einen Moment Geduld.</div>
    </div>
  `;
  // Senden
  fetch("/briefing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify(completeData)
  })
    .then(response => response.json())
    .then(data => {
      localStorage.removeItem("autosave_form");
      showSuccess(data);
    })
    .catch(err => {
      document.getElementById("formbuilder").innerHTML = `<div class="form-error">
        Es gab ein Problem bei der Übertragung. Bitte versuchen Sie es erneut oder wenden Sie sich an den Support.
      </div>`;
    });
}

function showSuccess(data) {
  // Zeigt Erfolgsmeldung & Button zum Download/Bericht (oder direkt HTML-Report)
  let resultBlock = `<h2>KI-Readiness-Analyse abgeschlossen!</h2>
    <div class="success-msg">
      Ihre Angaben wurden erfolgreich übermittelt.<br>
      Der KI-Readiness-Report wurde erstellt.<br>
      ${data?.html ? "<div class='report-html-preview'>" + data.html + "</div>" : ""}
    </div>
    <a href="/dashboard.html" class="btn-next">Zum Dashboard</a>
  `;
  document.getElementById("formbuilder").innerHTML = resultBlock;
}

// --- Anpassung: Im letzten Block "Absenden"-Button ersetzen ---
function renderBlock(blockIdx) {
  const block = blocks[blockIdx];
  let blockHtml = `<div class="block-progress">Block ${blockIdx + 1} von ${blocks.length}</div>`;
  blockHtml += `<h3>${block.label}</h3><div class="block-fields">`;
  // Felder
  for (const key of block.keys) {
    const field = fields.find(f => f.key === key);
    if (field) blockHtml += renderField(field, key);
  }
  blockHtml += `</div>
    <div id="feedback" class="form-feedback"></div>
    <div class="form-nav">`;
  if (blockIdx > 0) blockHtml += `<button type="button" id="btn-prev" class="btn-prev">Zurück</button>`;
  if (blockIdx < blocks.length - 1) blockHtml += `<button type="button" id="btn-next" class="btn-next">Weiter</button>`;
  if (blockIdx === blocks.length - 1) blockHtml += `<button type="button" id="btn-send" class="btn-next">Absenden</button>`;
  blockHtml += `</div>`;
  document.getElementById("formbuilder").innerHTML = blockHtml;
  setFieldValues(blockIdx);
  // "Absenden"-Handler
  if (blockIdx === blocks.length - 1) {
    document.getElementById("btn-send").onclick = submitAllBlocks;
  }
}

// --- Zusätzliche Features & Hinweise für Copy-Paste ---
// - Passe ggf. die fetch-URL auf dein Backend an ("/briefing" → deine API-Route)
// - Styles für .loading-msg, .success-msg, .report-html-preview, .form-error, .btn-next in deiner CSS-Datei ergänzen
// - Guidance-Text kannst du nach Wunsch oben in jedem Block ergänzen, z.B. mit <div class="block-guidance">...</div> direkt im renderBlock()
// - Preview des Berichts direkt in showSuccess (ggf. anpassen)

