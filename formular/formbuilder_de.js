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
    // Die Rechtsform-Auswahl soll nur angezeigt werden, wenn die Unternehmensgröße auf Solo gestellt ist.
    // Ursprünglich wurde hier auf den Wert "1" geprüft, aber die Optionswerte sind
    // "solo", "team" und "kmu". Daher prüfen wir explizit auf "solo".
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

  // Erweiterte Unternehmensangaben (Gold‑Standard)
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
    description: "Bitte schätzen Sie Ihren Jahresumsatz. Die Klassifizierung hilft bei Benchmarks, Förderprogrammen und Empfehlungen."
  },
{
  key: "it_infrastruktur",
  label: "Wie ist Ihre IT-Infrastruktur aktuell organisiert?",
  type: "select",
  options: [
    { value: "cloud", label: "Cloud-basiert (externe Services, z. B. Microsoft 365, Google Cloud…)" },
    { value: "on_premise", label: "Eigenes Rechenzentrum (On-Premises)" },
    { value: "hybrid", label: "Hybrid (Cloud + eigene Server)" },
    { value: "unklar", label: "Unklar / Noch offen" }
  ],
  description: "Ihre Antwort hilft uns, passende Empfehlungen für Sicherheit, Integration und moderne Tools auszuwählen."
  },
  {
    key: "interne_ki_kompetenzen",
    label: "Gibt es ein internes KI‑/Digitalisierungsteam?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "in_planung", label: "In Planung" }
    ],
    description: "Ein internes Kompetenzteam kann Prozesse beschleunigen. Diese Angabe hilft bei der Empfehlung von Schulungen und internen Strukturen."
  },
  {
  key: "datenquellen",
  label: "Welche Datentypen stehen Ihnen für KI-Projekte und Analysen zur Verfügung?",
  type: "checkbox",
  options: [
    { value: "kundendaten", label: "Kundendaten (CRM, Service, Historie)" },
    { value: "verkaufsdaten", label: "Verkaufs- und Bestelldaten (z. B. Shop, Aufträge)" },
    { value: "produktionsdaten", label: "Produktions- oder Betriebsdaten (Maschinen, Sensoren, Logistik)" },
    { value: "personaldaten", label: "Personal- oder HR-Daten (Mitarbeiter, Bewerbungen, Zeitwirtschaft)" },
    { value: "marketingdaten", label: "Marketing- und Kampagnendaten (Ads, Social Media, Newsletter)" },
    { value: "sonstige", label: "Sonstige / Weitere Datenquellen" }
  ],
  description: "Bitte wählen Sie alle Datenquellen aus, die für Ihr Unternehmen relevant sind (Mehrfachauswahl möglich)."
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
    description: "Bei vielen KI-Anwendungen ist eine sogenannte „DSFA“ (Datenschutz-Folgenabschätzung) laut DSGVO verpflichtend oder empfohlen – z. B. bei sensiblen Daten, automatisierten Entscheidungen oder Risiko für Betroffene."
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
    description: "Haben Sie definierte Abläufe, um Informationen wie Mitarbeiterdaten, Kundenanfragen, Trainingsdaten etc. gesetzeskonform zu löschen oder zu anonymisieren?Das ist wichtig für KI-Compliance und DSGVO."
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
    label: "Haben Sie bereits Fördermittel für Digitalisierung oder KI beantragt und erhalten?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    description: "Egal, ob staatliche oder regionale Fördermittel für Digitalisierung, IT oder KI: Diese Angabe hilft, passende Anschlussprogramme oder neue Optionen vorzuschlagen."
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
    description: "Wünschen Sie individuelle Empfehlungen für Förderprogramme? Wir filtern bei Interesse passende Optionen heraus – ohne Werbung oder Verpflichtung."
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
    description: "Haben Sie bereits externe Beratung zu KI, Digitalisierung oder IT-Strategie genutzt – etwa durch Förderprojekte, Kammern, Berater oder Tech-Partner? Diese Erfahrung kann Ihre Ausgangslage stärken."
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
    description: "Diese Einschätzung hilft, Ihre Ergebnisse im Report besser einzuordnen – etwa bei Handlungstempo, Budget und Potenzialen."
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
    description: "Ob neue Ideen, Produkte oder digitale Lösungen: Strukturierte Innovationswege – intern oder extern – erleichtern es, KI gezielt einzusetzen und weiterzuentwickeln."
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

  // --- Neue Felder für Gold‑Standard: Strategie & Governance ---
  {
    key: "strategische_ziele",
    label: "Welche konkreten Ziele verfolgen Sie mit KI?",
    type: "textarea",
    placeholder: "z. B. Effizienz steigern, neue Produkte entwickeln, Kundenservice verbessern",
    description: "Nennen Sie die strategischen Hauptziele Ihres KI‑Einsatzes. Dies hilft, Maßnahmen passgenau auszurichten."
  },
  {
    key: "datenqualitaet",
    label: "Wie beurteilen Sie die Qualität Ihrer Daten?",
    type: "select",
    options: [
      { value: "hoch", label: "Hoch (vollständig, strukturiert, aktuell)" },
      { value: "mittel", label: "Mittel (teilweise strukturiert oder lückenhaft)" },
      { value: "niedrig", label: "Niedrig (unstrukturiert, viele Lücken)" }
    ],
    description: "Gut gepflegte Daten sind die Grundlage für erfolgreiche KI‑Projekte. Wählen Sie, wie sauber und strukturiert Ihre Datenquellen sind."
  },
  {
    key: "ai_roadmap",
    label: "Gibt es bereits eine KI‑Roadmap oder Strategie?",
    type: "select",
    options: [
      { value: "ja", label: "Ja – bereits implementiert" },
      { value: "in_planung", label: "In Planung" },
      { value: "nein", label: "Noch nicht vorhanden" }
    ],
    description: "Eine klar definierte Roadmap unterstützt Sie dabei, KI‑Projekte strukturiert und zielgerichtet umzusetzen."
  },
  {
    key: "governance",
    label: "Existieren interne Richtlinien für Daten- und KI‑Governance?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Richtlinien und Prozesse zur Daten- und KI‑Governance fördern verantwortungsvolle und rechtskonforme Projekte."
  },
  {
    key: "innovationskultur",
    label: "Wie offen ist Ihr Unternehmen für Innovationen und neue Technologien?",
    type: "select",
    options: [
      { value: "sehr_offen", label: "Sehr offen" },
      { value: "eher_offen", label: "Eher offen" },
      { value: "neutral", label: "Neutral" },
      { value: "eher_zurueckhaltend", label: "Eher zurückhaltend" },
      { value: "sehr_zurueckhaltend", label: "Sehr zurückhaltend" }
    ],
    description: "Eine innovationsfreundliche Unternehmenskultur erleichtert die Einführung neuer Technologien wie KI."
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
    keys: [
      "branche",
      "unternehmensgroesse",
      "selbststaendig",
      "bundesland",
      "hauptleistung",
      "zielgruppen",
      "jahresumsatz",
      "it_infrastruktur",
      "interne_ki_kompetenzen",
      "datenquellen"
    ]
  },
  {
    name: "Status Quo",
    keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", "ki_einsatz", "ki_knowhow"]
  },
  {
    name: "Ziele & Projekte",
    keys: ["projektziel", "ki_projekte", "ki_usecases", "ki_potenzial", "usecase_priority", "ki_geschaeftsmodell_vision", "moonshot"]
  },

  // Neuer Block für strategische Ziele und Governance
  {
    name: "Strategie & Governance",
    keys: ["strategische_ziele", "datenqualitaet", "ai_roadmap", "governance", "innovationskultur"]
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
// Verwende einen benutzerspezifischen Schlüssel für Autosave, damit Testnutzer ihre Eingaben wiederverwenden können.
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
        // Beim Rendern wird der gespeicherte Wert als selected markiert, damit Auswahl nicht zurückspringt
        const selectedValue = formData[field.key] || "";
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Bitte wählen...</option>
            ${field.options
              .map(opt => {
                const isSelected = selectedValue === opt.value ? ' selected' : '';
                return `<option value="${opt.value}"${isSelected}>${opt.label}</option>`;
              })
              .join("")}
          </select>`;
        break;

      case "textarea":
        input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder || ""}">${formData[field.key] || ""}</textarea>`;
        break;

      case "checkbox":
        input = `<div class="checkbox-group twocol">
          ${field.options.map(opt => {
            const labelMatch = opt.label.match(/^([^(]+)\s*\(([^)]+)\)/);
            let mainLabel = opt.label, subText = "";
            if (labelMatch) {
            mainLabel = labelMatch[1].trim();
            subText = `<div class="option-example">${labelMatch[2].trim()}</div>`;
}
            const checked = formData[field.key]?.includes(opt.value) ? 'checked' : '';
            return `<label class="checkbox-label">
              <input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}>
              ${mainLabel}
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
      <!-- Reset button to clear stored answers and restart from the first block -->
      <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
    </div>
    <div id="feedback"></div>`;
}

function saveAutosave() {
  localStorage.setItem(autosaveKey, JSON.stringify(formData));
}
function loadAutosave() {
  formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
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
      // Bei Checkboxen alle gespeicherten Werte wieder anhaken
      if (formData[key]) {
        formData[key].forEach(v => {
          const box = document.querySelector(`input[name="${field.key}"][value="${v}"]`);
          if (box) box.checked = true;
        });
      }
    } else if (field.type === "slider") {
      // Slider auf gespeicherten Wert setzen und Label aktualisieren
      const val = formData[key] ?? field.min ?? 1;
      el.value = val;
      if (el.nextElementSibling) el.nextElementSibling.innerText = val;
    } else if (field.type === "privacy") {
      // Checkbox für Datenschutzhinweis setzen
      el.checked = formData[key] === true;
    } else {
      // Für select, textarea und text inputs den gespeicherten Wert setzen
      if (formData[key] !== undefined) {
        el.value = formData[key];
      }
    }
  }
}

function blockIsValid(blockIdx) {
  const block = blocks[blockIdx];
  // Define optional keys: these fields are not mandatory and may be left blank
  const optionalKeys = new Set([
    "jahresumsatz",
    "it_infrastruktur",
    "interne_ki_kompetenzen",
    "datenquellen"
  ]);
  return block.keys.every(key => {
    const field = fields.find(f => f.key === key);
    if (!field) return true;
    // If the field is conditionally hidden, it's considered valid
    if (field.showIf && !field.showIf(formData)) return true;
    // Skip validation for optional fields
    if (optionalKeys.has(key)) return true;
    const val = formData[key];
    // Checkbox fields (except optional ones) require at least one selection
    if (field.type === "checkbox") return Array.isArray(val) && val.length > 0;
    // Privacy checkbox must be checked on the last block
    if (field.type === "privacy") return val === true;
    // Other fields must have a non-empty value
    return val !== undefined && val !== "";
  });
}

function handleFormEvents() {
document.getElementById("formbuilder").addEventListener("change", () => {
  const block = blocks[currentBlock];
  let needsRerender = false;

  for (const key of block.keys) {
    const field = fields.find(f => f.key === key);
    if (field) {
      const prev = formData[key];
      const curr = getFieldValue(field);
      formData[key] = curr;
      if (prev !== curr && field.key === "unternehmensgroesse") {
        needsRerender = true; // nur bei diesem Feld notwendig
      }
    }
  }

  saveAutosave();

  if (needsRerender) {
    renderBlock(currentBlock);
    setTimeout(() => {
    setFieldValues(currentBlock);
    handleFormEvents();
    }, 20);
  }
}); // ⬅️ ✅ HIER die schließende Klammer für den EventListener
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

    // Handle reset: clear saved data and restart the questionnaire from the beginning
    if (e.target.id === "btn-reset") {
      // Remove autosaved data for the current user
      localStorage.removeItem(autosaveKey);
      // Reset form data and start again from block 0
      formData = {};
      currentBlock = 0;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (e.target.id === "submit-btn" || e.target.id === "btn-send") {
      submitAllBlocks(); // ✅ wird jetzt auch korrekt ausgelöst
    }
  });
}


window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderBlock(currentBlock);
  setTimeout(() => {
    setFieldValues(currentBlock);
    renderBlock(currentBlock); // ⬅️ neu!
    setTimeout(() => {
      setFieldValues(currentBlock);
      handleFormEvents();
    }, 20);
  }, 20);
});



function submitAllBlocks() {
  const data = {};
  fields.forEach(field => data[field.key] = formData[field.key]);
  // Sprache explizit setzen (deutsch)
  data.lang = "de";

  const BASE_URL = location.hostname.includes("localhost")
    ? "https://make-ki-backend-neu-production.up.railway.app"
    : "https://make-ki-backend-neu-production.up.railway.app";

  // Asynchronen Report anstoßen und im Hintergrund generieren.
  fetch(`${BASE_URL}/briefing_async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
    keepalive: true
  }).catch(() => {
    // Fehler beim Absenden können hier protokolliert werden; die Anzeige
    // bleibt davon unberührt.
    console.error('Fehler bei der Übertragung');
  });
  // Leite den Nutzer direkt auf eine separate Dankeseite um. Dort wird der
  // Hinweis angezeigt, dass der Report per E-Mail versendet wird.
  window.location.href = "thankyou.html";
  return;
}

// === formbuilder.js: Erweiterung von showSuccess() ===
function showSuccess(data) {
  // Lösche Autosave-Daten, damit der Testnutzer beim nächsten Mal neu starten kann
  localStorage.removeItem(autosaveKey);
  // Bereite Versand per PDF-Service vor
  const htmlContent = data?.html || "";
  let userEmail = "";
  try {
    const token = localStorage.getItem("jwt");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userEmail = payload.email || payload.sub || "";
    }
  } catch (err) {
    userEmail = "";
  }
  // PDF-Service aufrufen, um den Report für Admin und Nutzer per Mail zu verschicken
  if (htmlContent) {
    fetch("https://make-ki-pdfservice-production.up.railway.app/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "text/html",
        "X-User-Email": userEmail
      },
      body: htmlContent
    }).catch(() => {
      // Bei Fehler einfach ignorieren – der Admin erhält die Kopie in jedem Fall
    });
  }
  // Zeige dem Nutzer eine Bestätigung und kündige den Mailversand an
  document.getElementById("formbuilder").innerHTML = `
    <h2>Vielen Dank für Ihre Angaben!</h2>
    <div class="success-msg">
      Ihre KI‑Analyse wird jetzt erstellt.<br>
      Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E‑Mail zugestellt.<br>
    </div>
  `;
}
