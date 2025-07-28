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
  {
    key: "branche",
    label: "In welcher Branche ist Ihr Unternehmen hauptsächlich aktiv?",
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
    description: "Bitte wählen Sie die Branche, die am besten zu Ihrem aktuellen Kerngeschäft passt. Ihre Auswahl hilft uns, alle Analysen und Empfehlungen auf Ihren Bereich zuzuschneiden."
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
    description: "Die Größe Ihres Unternehmens beeinflusst individuelle Fördermöglichkeiten, Benchmarks und Handlungsempfehlungen."
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
    description: "Bitte wählen Sie die zutreffende Rechtsform.",
    showIf: (data) => data.unternehmensgroesse === "solo"
  },
    description: "Bitte wählen Sie 'Ja', wenn Sie allein arbeiten (z. B. Freelancer, Einzelunternehmen, Solopreneur). So erhalten Sie besonders maßgeschneiderte Empfehlungen."
  },
  {
    key: "bundesland",
    label: "In welchem Bundesland hat Ihr Unternehmen seinen Sitz?",
    type: "select",
    options: [
      { value: "bw", label: "Baden-Württemberg" },
      { value: "by", label: "Bayern" },
      { value: "be", label: "Berlin" },
      { value: "bb", label: "Brandenburg" },
      { value: "hb", label: "Bremen" },
      { value: "hh", label: "Hamburg" },
      { value: "he", label: "Hessen" },
      { value: "mv", label: "Mecklenburg-Vorpommern" },
      { value: "ni", label: "Niedersachsen" },
      { value: "nw", label: "Nordrhein-Westfalen" },
      { value: "rp", label: "Rheinland-Pfalz" },
      { value: "sl", label: "Saarland" },
      { value: "sn", label: "Sachsen" },
      { value: "st", label: "Sachsen-Anhalt" },
      { value: "sh", label: "Schleswig-Holstein" },
      { value: "th", label: "Thüringen" }
    ],
    description: "Ihr Standort entscheidet häufig über passende Fördermittel und regionale Programme. Bitte wählen Sie das relevante Bundesland aus."
  },
  {
    key: "hauptleistung",
    label: "Was ist das wichtigste Produkt oder die Hauptdienstleistung Ihres Unternehmens?",
    type: "textarea",
    placeholder: "Beispiel: Softwareentwicklung (Individuallösungen für KMU), Marketingberatung (Social Media/Content), CNC-Fertigung (Einzel- und Kleinserien), Personalvermittlung (Fachkräfte IT), Onlinehandel (regionale Produkte), ...",
    description: "Beschreiben Sie Ihr Hauptgeschäftsfeld so konkret wie möglich, um gezielte Empfehlungen für Ihre Zielgruppe zu erhalten."
  },
  {
    key: "zielgruppen",
    label: "Wer sind die wichtigsten Kundengruppen Ihres Unternehmens?",
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
    description: "Markieren Sie alle Segmente, die Sie mit Ihren Leistungen ansprechen. Ihre Auswahl hilft, Usecases und Tools optimal auf Ihre Zielgruppen auszurichten."
  },
  {
    key: "projektziel",
    label: "Was möchten Sie mit Ihrem nächsten KI-/Digitalisierungsprojekt erreichen?",
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
    description: "Was ist Ihr Hauptfokus beim nächsten Projekt? Sie können gerne mehrere Ziele auswählen, damit die Analyse noch genauer wird."
  },
  {
    key: "ki_einsatz",
    label: "In welchen Bereichen Ihres Unternehmens wird KI aktuell schon genutzt?",
    type: "checkbox",
    options: [
      { value: "marketing", label: "Marketing (z. B. Kampagnen, Social Media)" },
      { value: "vertrieb", label: "Vertrieb (z. B. Angebotsautomatisierung)" },
      { value: "buchhaltung", label: "Buchhaltung (z. B. Belegerkennung, Automatisierung)" },
      { value: "produktion", label: "Produktion (z. B. Qualitätskontrolle, Prozessoptimierung)" },
      { value: "kundenservice", label: "Kundenservice (z. B. Chatbots, Support)" },
      { value: "it", label: "IT (z. B. IT-Sicherheit, Monitoring)" },
      { value: "forschung", label: "Forschung & Entwicklung (z. B. Datenanalyse)" },
      { value: "personal", label: "Personal (z. B. Recruiting, Skill-Matching)" },
      { value: "keine", label: "Noch keine Nutzung" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "Bitte wählen Sie alle Bereiche, in denen Sie bereits KI- oder Automatisierungslösungen nutzen – auch kleinere Lösungen zählen!"
  },
  {
    key: "digitalisierungsgrad",
    label: "Wie digital sind Ihre internen Prozesse auf einer Skala von 1 bis 10?",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    description: "Bewerten Sie bitte, wie weit Ihre Arbeitsabläufe digitalisiert sind: 1 = fast alles papierbasiert, 10 = komplett digital & automatisiert."
  },
  {
    key: "prozesse_papierlos",
    label: "Welcher Anteil Ihrer Prozesse läuft bereits papierlos?",
    type: "select",
    options: [
      { value: "0-20", label: "0-20%" },
      { value: "21-50", label: "21-50%" },
      { value: "51-80", label: "51-80%" },
      { value: "81-100", label: "81-100%" }
    ],
    description: "Bitte schätzen Sie, wie hoch der Anteil an papierlosen Abläufen in Ihrem Unternehmen ist (Rechnungen, Dokumente, Verwaltung etc.)."
  },
  {
    key: "automatisierungsgrad",
    label: "Wie automatisiert laufen Ihre Arbeitsprozesse bereits ab?",
    type: "select",
    options: [
      { value: "sehr_niedrig", label: "Sehr niedrig (fast alles manuell)" },
      { value: "eher_niedrig", label: "Eher niedrig" },
      { value: "mittel", label: "Mittel" },
      { value: "eher_hoch", label: "Eher hoch" },
      { value: "sehr_hoch", label: "Sehr hoch (kaum manuelle Arbeit)" }
    ],
    description: "Automatisierung heißt: Prozesse laufen ohne händisches Zutun. Wie viele Abläufe sind in Ihrem Unternehmen schon automatisiert?"
  },
  {
    key: "ki_knowhow",
    label: "Wie schätzen Sie das interne KI-Knowhow in Ihrem Unternehmen ein?",
    type: "select",
    options: [
      { value: "keine", label: "Keine Erfahrung" },
      { value: "grundkenntnisse", label: "Grundkenntnisse" },
      { value: "mittel", label: "Mittel" },
      { value: "fortgeschritten", label: "Fortgeschritten" },
      { value: "expertenwissen", label: "Expertenwissen" }
    ],
    description: "Gibt es Erfahrung mit KI-Tools im Team? Arbeiten Sie schon aktiv mit KI oder gibt es sogar spezialisierte Expert:innen?"
  },
  {
    key: "ki_projekte",
    label: "Gibt es bei Ihnen aktuell laufende oder geplante KI-Projekte?",
    type: "textarea",
    placeholder: "Beispiele: Automatisierter Kunden-Chatbot, Vorhersagemodell für Verkaufszahlen, KI-gestützte Texterstellung, automatisierte Angebotskalkulation, digitale Prozessoptimierung, ...",
    description: "Bitte beschreiben Sie kurz Ihre laufenden oder geplanten KI-Projekte, gerne auch erste Ideen oder Experimente."
  },
  {
    key: "ki_usecases",
    label: "Welche konkreten Anwendungsfälle interessieren Sie für den KI-Einsatz?",
    type: "checkbox",
    options: [
      { value: "texterstellung", label: "Texterstellung (Berichte, Marketing, Kommunikation)" },
      { value: "bildgenerierung", label: "Bildgenerierung (z. B. Grafiken, Produktbilder)" },
      { value: "spracherkennung", label: "Spracherkennung (z. B. Transkripte, Sprachsteuerung)" },
      { value: "prozessautomatisierung", label: "Prozessautomatisierung (Abläufe, Workflows)" },
      { value: "datenanalyse", label: "Datenanalyse & Prognose (Dashboards, Auswertung)" },
      { value: "kundensupport", label: "Kundensupport (z. B. FAQ, Chatbots)" },
      { value: "wissensmanagement", label: "Wissensmanagement (z. B. Doku, interne Suche)" },
      { value: "marketing", label: "Marketing (z. B. Zielgruppen, Kampagnen)" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "Wählen Sie alle Anwendungsbereiche, in denen Sie KI testen oder gezielt einsetzen möchten."
  },
  {
    key: "ki_potenzial",
    label: "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "Beispiel: Automatisierte Berichte für Kunden, prädiktive Wartung in der Produktion, KI-unterstützte Beratung, Optimierung der Personalplanung, ...",
    description: "Teilen Sie uns gerne Ihre persönliche Einschätzung, Wünsche oder auch Visionen mit."
  },
{
  key: "usecase_priority",
  label: "In welchem Bereich möchten Sie den ersten (oder nächsten) KI-Einsatz besonders vorantreiben?",
  type: "select",
  options: [
    { value: "marketing", label: "Marketing (z. B. Kampagnen, Kundengewinnung)" },
    { value: "vertrieb", label: "Vertrieb (z. B. Angebotserstellung, Pipeline)" },
    { value: "buchhaltung", label: "Buchhaltung (z. B. Belegerkennung, Buchungen)" },
    { value: "produktion", label: "Produktion (z. B. Qualitätsprüfung, Wartung)" },
    { value: "kundenservice", label: "Kundenservice (z. B. Chatbots, Support)" },
    { value: "it", label: "IT (z. B. Sicherheit, Automatisierung)" },
    { value: "forschung", label: "Forschung & Entwicklung (z. B. Analyse, Simulation)" },
    { value: "personal", label: "Personal (z. B. Recruiting, Skill-Matching)" },
    { value: "unbekannt", label: "Noch unklar / weiß ich nicht genau" }
  ],
  description: "Gibt es einen Bereich in Ihrem Unternehmen, in dem der Einsatz von KI besonders spannend oder dringend erscheint? Ihre Antwort hilft uns, konkrete Empfehlungen für den Einstieg zu geben."
},
{
  key: "ki_geschaeftsmodell_vision",
  label: "Wie könnte KI Ihr Geschäftsmodell, Ihre Prozesse oder Ihre Branche grundlegend verändern?",
  type: "textarea",
  placeholder: "Beispiel: Komplette Digitalisierung des Vertriebs, neue datenbasierte Services, skalierbare Online-Plattform, ...",
  description: "Wo sehen Sie mit Blick auf KI die größten Chancen für Ihr Unternehmen – ob neue Produkte, effizientere Abläufe, neue Kundengruppen oder andere Marktchancen?"
},
{
  key: "moonshot",
  label: "Was wäre ein echter 'Gamechanger'? Was ist Ihre Traumvorstellung für Ihr Unternehmen in 3 Jahren mit KI?",
  type: "textarea",
  placeholder: "Beispiel: KI automatisiert 80 % der Routinearbeiten, wir bieten weltweit einen innovativen Service an, ...",
  description: "Denken Sie ruhig visionär! Was wäre Ihr persönlicher Traum oder ein mutiges Ziel, das Sie mit KI gern erreichen möchten?"
},
{
  key: "datenschutzbeauftragter",
  label: "Gibt es in Ihrem Unternehmen einen Datenschutzbeauftragten oder eine zuständige Person?",
  type: "select",
  options: [
    { value: "ja", label: "Ja" },
    { value: "nein", label: "Nein" },
    { value: "teilweise", label: "Teilweise (externer Berater oder in Planung)" }
  ],
  description: "Wer kümmert sich bei Ihnen um den Datenschutz? Dies ist nicht nur für große Unternehmen wichtig, sondern erhöht das Vertrauen aller Kunden und Partner."
},
{
  key: "technische_massnahmen",
  label: "Welche technischen Maßnahmen schützen Ihre Daten aktuell?",
  type: "select",
  options: [
    { value: "alle", label: "Alle relevanten Maßnahmen sind vorhanden" },
    { value: "teilweise", label: "Teilweise umgesetzt" },
    { value: "keine", label: "Noch keine Maßnahmen" }
  ],
  description: "Technische Maßnahmen wie Firewalls, Zugriffsbeschränkungen oder regelmäßige Backups sind essenziell. Wo stehen Sie gerade?"
},
{
  key: "folgenabschaetzung",
  label: "Wurde für KI-Anwendungen eine DSGVO-Folgenabschätzung (DSFA) durchgeführt?",
  type: "select",
  options: [
    { value: "ja", label: "Ja" },
    { value: "nein", label: "Nein" },
    { value: "teilweise", label: "Teilweise (in Planung oder extern vergeben)" }
  ],
  description: "Bei sensiblen KI-Systemen ist eine Datenschutz-Folgenabschätzung oft Pflicht. Das schafft Rechtssicherheit – auch bei Anfragen von Kunden oder Behörden."
},
{
  key: "meldewege",
  label: "Gibt es definierte Meldewege für Datenschutzvorfälle oder Datenpannen?",
  type: "select",
  options: [
    { value: "ja", label: "Ja, festgelegt und bekannt" },
    { value: "teilweise", label: "Teilweise (Regeln existieren, sind aber nicht allen bekannt)" },
    { value: "nein", label: "Nein" }
  ],
  description: "Klare Meldewege sorgen dafür, dass im Ernstfall schnell und professionell reagiert werden kann – auch das erhöht das Vertrauen in Ihr Unternehmen."
},
{
  key: "loeschregeln",
  label: "Gibt es verbindliche Regeln für das Löschen oder Anonymisieren von Daten?",
  type: "select",
  options: [
    { value: "ja", label: "Ja, gibt es" },
    { value: "teilweise", label: "Teilweise (in Planung oder in manchen Bereichen)" },
    { value: "nein", label: "Nein, noch nicht" }
  ],
  description: "Daten-Löschkonzepte sind zentral für Datenschutz und IT-Sicherheit. Wie klar und verbindlich sind Ihre Prozesse bereits geregelt?"
},
{
  key: "ai_act_kenntnis",
  label: "Wie gut kennen Sie den EU AI Act und seine Anforderungen?",
  type: "select",
  options: [
    { value: "sehr_gut", label: "Sehr gut (wir setzen schon um)" },
    { value: "gut", label: "Gut (Kernanforderungen bekannt)" },
    { value: "gehört", label: "Schon gehört, aber wenig im Detail" },
    { value: "unbekannt", label: "Nein, noch gar nicht beschäftigt" }
  ],
  description: "Der neue EU AI Act bringt viele neue Regeln für KI-Anwendungen. Wie fit fühlen Sie sich oder Ihr Team in Bezug auf die wichtigsten Anforderungen?"
},
{
  key: "ki_hemmnisse",
  label: "Wo sehen Sie aktuell die größten Hürden oder Risiken beim Einsatz von KI?",
  type: "checkbox",
  options: [
    { value: "rechtsunsicherheit", label: "Unsicherheit bei Rechtslage" },
    { value: "datenschutz", label: "Datenschutz" },
    { value: "knowhow", label: "Knowhow (fehlendes Wissen/Kompetenzen)" },
    { value: "budget", label: "Budget (Kosten/Nutzen unklar)" },
    { value: "teamakzeptanz", label: "Akzeptanz im Team" },
    { value: "zeitmangel", label: "Zeitmangel (zu wenig Kapazität)" },
    { value: "it_integration", label: "IT-Integration (Schnittstellen, Systeme)" },
    { value: "keine", label: "Keine Hemmnisse" },
    { value: "andere", label: "Andere" }
  ],
  description: "Sie können mehrere Punkte auswählen. Ihre ehrliche Einschätzung hilft, die Empfehlungen gezielt auf Ihre aktuellen Herausforderungen abzustimmen."
},
{
  key: "bisherige_foerdermittel",
  label: "Haben Sie bereits Fördermittel für Digitalisierung oder KI erhalten bzw. genutzt?",
  type: "select",
  options: [
    { value: "ja", label: "Ja" },
    { value: "nein", label: "Nein" }
  ],
  description: "Haben Sie schon mit Fördermitteln Erfahrung gemacht? Dies ist hilfreich für die nächste Förderstrategie."
},
{
  key: "interesse_foerderung",
  label: "Haben Sie Interesse an Fördermitteln für KI- oder Digitalisierungsprojekte?",
  type: "select",
  options: [
    { value: "ja", label: "Ja, gezielte Recherche gewünscht" },
    { value: "nein", label: "Nein" },
    { value: "unklar", label: "Bin mir noch unsicher" }
  ],
  description: "Falls Sie gezielte Fördermittel suchen, geben Sie das gern an – wir berücksichtigen es in der Empfehlung und der Roadmap."
},
{
  key: "erfahrung_beratung",
  label: "Gab es bereits Beratung oder Workshops zum Thema Digitalisierung/KI?",
  type: "select",
  options: [
    { value: "ja", label: "Ja" },
    { value: "nein", label: "Nein" },
    { value: "unklar", label: "Weiß ich nicht / unklar" }
  ],
  description: "Hatten Sie bereits externe Unterstützung bei Digital- oder KI-Projekten? Das beeinflusst die nächsten Schritte und Empfehlungen."
},
{
  key: "investitionsbudget",
  label: "Welches Investitionsbudget steht in den nächsten 12 Monaten für KI/Digitalisierung zur Verfügung?",
  type: "select",
  options: [
    { value: "unter_2000", label: "Unter 2.000 €" },
    { value: "2000_10000", label: "2.000–10.000 €" },
    { value: "10000_50000", label: "10.000–50.000 €" },
    { value: "ueber_50000", label: "Mehr als 50.000 €" },
    { value: "unklar", label: "Noch unklar" }
  ],
  description: "Bitte schätzen Sie, wieviel Sie für Digitalisierungs- und KI-Projekte einplanen. Die Angabe hilft bei Empfehlungen zu Fördermitteln und Tools."
},
{
  key: "marktposition",
  label: "Wie schätzen Sie Ihre aktuelle Marktposition im Wettbewerb ein?",
  type: "select",
  options: [
    { value: "marktfuehrer", label: "Marktführer" },
    { value: "oberes_drittel", label: "Im oberen Drittel" },
    { value: "mittelfeld", label: "Mittelfeld" },
    { value: "nachzuegler", label: "Aufholer/Nachzügler" },
    { value: "unsicher", label: "Schwer einzuschätzen" }
  ],
  description: "Wie sehen Sie Ihr Unternehmen im Vergleich zum Wettbewerb? Diese Selbsteinschätzung erleichtert branchengerechte Analysen."
},
{
  key: "benchmark_wettbewerb",
  label: "Vergleichen Sie Ihre Digitalisierung oder KI-Readiness aktiv mit Wettbewerbern?",
  type: "select",
  options: [
    { value: "ja", label: "Ja, regelmäßig" },
    { value: "nein", label: "Nein" },
    { value: "selten", label: "Selten / sporadisch" }
  ],
  description: "Wie stark beobachten Sie, was die Konkurrenz in Sachen KI/Digitalisierung macht? (Kein Muss, aber hilft, Potenziale zu erkennen!)"
},
{
  key: "innovationsprozess",
  label: "Wie entstehen Innovationen bei Ihnen im Unternehmen?",
  type: "select",
  options: [
    { value: "innovationsteam", label: "Durch ein internes Innovationsteam" },
    { value: "mitarbeitende", label: "Durch Mitarbeitende (Ideen aus dem Team)" },
    { value: "kunden", label: "Gemeinsam mit Kunden (Co-Creation)" },
    { value: "berater", label: "Mit externen Beratern/Partnern" },
    { value: "zufall", label: "Zufällig, ohne festen Prozess" },
    { value: "unbekannt", label: "Ist mir nicht bekannt / nicht definiert" }
  ],
  description: "Wer ist bei Ihnen der Motor für Innovation? Gibt es einen festen Prozess oder läuft alles eher spontan?"
},
{
  key: "risikofreude",
  label: "Wie risikofreudig ist Ihr Unternehmen, wenn es um Innovationen geht? (1 = sehr vorsichtig, 5 = sehr mutig)",
  type: "slider",
  min: 1,
  max: 5,
  step: 1,
  description: "Bitte schätzen Sie ein: Ist Ihr Unternehmen eher sicherheitsorientiert oder probiert es gern neue, mutige Wege aus?"
}

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

