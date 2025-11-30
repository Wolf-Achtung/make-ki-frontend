/* eslint-disable no-console */
/* global window, document, localStorage, fetch, alert */

// =====================
// Form Definition (DE)
// =====================

const FORM_VERSION = "SINGLE_FULL_15_33_03";
const AUTOSAVE_KEY = `ksj_form_${FORM_VERSION}_autosave`;
const AUTOSAVE_DEBOUNCE_MS = 800;

// Hilfsfunktion: sichere Pfad-Lesung aus globalem window.CONFIG
function getConfig(path, fallback = null) {
  try {
    const parts = path.split(".");
    let cur = window.CONFIG || {};
    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
        cur = cur[p];
      } else {
        return fallback;
      }
    }
    return cur == null ? fallback : cur;
  } catch (e) {
    console.warn("getConfig error for path:", path, e);
    return fallback;
  }
}

// Basiskonfiguration aus globalem CONFIG (wird in base.html gesetzt)
const API_BASE_URL = getConfig("apiBaseUrl", window.location.origin + "/api");
const FEEDBACK_URL = getConfig("feedbackUrl", "");
const DEFAULT_EMAIL = getConfig("defaultEmail", "");

// =====================
// Felddefinitionen
// =====================

const fields = [
  // ------------------------
  // Block 1 – Unternehmen
  // ------------------------
  {
    step: 1,
    title: "1. Organisation & Rahmenbedingungen",
    group: "Unternehmen",
    description:
      "Bitte beschreiben Sie kurz Ihr Unternehmen, Ihre Branche und Ihre Ausgangssituation. Diese Angaben bilden den Kontext für alle weiteren Einschätzungen.",
    fields: [
      {
        key: "branche",
        label: "In welcher Branche ist Ihr Unternehmen überwiegend tätig?",
        type: "select",
        required: true,
        placeholder: "Bitte wählen Sie Ihre Hauptbranche",
        description:
          "(Damit wir Ihre Antworten mit passenden Branchen-Benchmarks und typischen Use Cases vergleichen können.)",
        options: [
          { value: "beratung", label: "Beratung & Dienstleistungen" },
          { value: "it_software", label: "IT, Software & SaaS" },
          { value: "marketing_content_agency", label: "Marketing, Kommunikation & Agenturen" },
          { value: "handel_ecommerce", label: "Handel & E-Commerce" },
          { value: "industrie_production", label: "Industrie & Produktion" },
          { value: "logistik_verkehr", label: "Logistik & Transport" },
          { value: "gesundheit_pflege", label: "Gesundheit & Soziales" },
          { value: "bildung_wissenschaft", label: "Bildung & Wissenschaft" },
          { value: "finanzen_versicherungen", label: "Finanzen, Banken & Versicherungen" },
          { value: "medien_kultur_kreativ", label: "Medien, Kultur & Kreativwirtschaft" },
          { value: "verwaltung_oeffentlich", label: "Öffentlicher Sektor & Verwaltung" },
          { value: "sonstiges", label: "Andere Branche (bitte im Freitext spezifizieren)" },
        ],
      },
      {
        key: "branche_freitext",
        label: "Falls „Andere Branche“: Bitte beschreiben Sie Ihr Tätigkeitsfeld in 1–2 Sätzen.",
        type: "textarea",
        placeholder: "Kurzbeschreibung Ihres Geschäftsmodells / Ihrer Branche",
        description:
          "(Damit wir Ihr Unternehmen trotz individueller Ausrichtung korrekt einordnen und passende Vergleichswerte nutzen können.)",
      },
      {
        key: "unternehmensgroesse",
        label: "Wie groß ist Ihr Unternehmen aktuell (inkl. Teilzeitkräfte)?",
        type: "radio",
        required: true,
        description:
          "(Damit wir Ihre Ergebnisse mit passenden Größenklassen (Solo, kleines Team, KMU) vergleichen und Empfehlungen skalierbar machen können.)",
        options: [
          { value: "solo", label: "1 Person (Solo-Selbstständige:r / Freelancer:in)" },
          { value: "klein", label: "2–10 Personen (kleines Team / kleines Unternehmen)" },
          { value: "kmu", label: "11–100 Personen (KMU)" },
        ],
      },
      {
        key: "mitarbeiter_anzahl",
        label: "Wie viele Personen arbeiten aktuell in Ihrem Unternehmen (ca.)?",
        type: "number",
        min: 1,
        max: 10000,
        placeholder: "z. B. 1, 8 oder 45",
        description:
          "(Damit wir Ihre Ressourcen, Kapazitäten und mögliche Skalierungseffekte besser einschätzen können.)",
      },
      {
        key: "jahresumsatz",
        label: "Wie hoch ist Ihr jährlicher Gesamtumsatz (netto, ca.)?",
        type: "radio",
        required: false,
        description:
          "(Damit wir die wirtschaftliche Ausgangsbasis für Investitionen in KI besser einordnen können.)",
        options: [
          { value: "unter_100k", label: "unter 100.000 €" },
          { value: "100k_500k", label: "100.000 – 500.000 €" },
          { value: "500k_1m", label: "500.000 – 1 Mio. €" },
          { value: "1m_5m", label: "1 – 5 Mio. €" },
          { value: "ueber_5m", label: "über 5 Mio. €" },
          { value: "keine_angabe", label: "Möchte ich nicht angeben" },
        ],
      },
      {
        key: "selbststaendig",
        label: "In welcher Form arbeiten Sie überwiegend?",
        type: "radio",
        required: true,
        description:
          "(Damit wir die Besonderheiten von Freiberufler:innen, Kleinstunternehmen oder klassischen KMU berücksichtigen können.)",
        options: [
          { value: "freiberuflich", label: "Freiberuflich / Solo-Selbstständige:r" },
          { value: "kleinunternehmen", label: "Kleines Unternehmen / Agentur" },
          { value: "gmbh_ug", label: "GmbH / UG / andere Kapitalgesellschaft" },
          { value: "verein_stiftung", label: "Verein / Stiftung / Non-Profit" },
        ],
      },
      {
        key: "bundesland",
        label: "In welchem Bundesland / welcher Region hat Ihr Unternehmen den Hauptsitz?",
        type: "select",
        required: true,
        placeholder: "Bundesland auswählen",
        description:
          "(Damit wir passende Förderprogramme, regionale Netzwerke und rechtliche Rahmenbedingungen berücksichtigen können.)",
        options: [
          { value: "BW", label: "Baden-Württemberg" },
          { value: "BY", label: "Bayern" },
          { value: "BE", label: "Berlin" },
          { value: "BB", label: "Brandenburg" },
          { value: "HB", label: "Bremen" },
          { value: "HH", label: "Hamburg" },
          { value: "HE", label: "Hessen" },
          { value: "MV", label: "Mecklenburg-Vorpommern" },
          { value: "NI", label: "Niedersachsen" },
          { value: "NW", label: "Nordrhein-Westfalen" },
          { value: "RP", label: "Rheinland-Pfalz" },
          { value: "SL", label: "Saarland" },
          { value: "SN", label: "Sachsen" },
          { value: "ST", label: "Sachsen-Anhalt" },
          { value: "SH", label: "Schleswig-Holstein" },
          { value: "TH", label: "Thüringen" },
          { value: "AT", label: "Österreich" },
          { value: "CH", label: "Schweiz" },
          { value: "EU", label: "Sonstiges EU-Land" },
          { value: "NON_EU", label: "Außerhalb der EU" },
        ],
      },
      {
        key: "hauptleistung",
        label: "Was ist Ihr zentrales Produkt oder Ihre wichtigste Dienstleistung?",
        type: "textarea",
        required: true,
        placeholder: "Beschreiben Sie kurz, was Sie anbieten und wodurch Sie sich abheben.",
        description:
          "(Damit wir Ihre Wertschöpfung verstehen und KI-Potenziale entlang Ihrer Hauptleistungen konkret und praxisnah identifizieren können.)",
        maxLength: 800,
      },
      {
        key: "zielgruppen",
        label: "Wer sind Ihre wichtigsten Zielgruppen oder Kundensegmente?",
        type: "textarea",
        placeholder:
          "z. B. KMU aus dem Handel, Agenturen, Industrie, öffentliche Hand, Endkund:innen, bestimmte Branchen …",
        description:
          "(Damit wir erkennen, an welchen Stellen KI Ihren Kund:innen echten Mehrwert stiften kann und wie Sie Ihre Angebote passgenau ausrichten.)",
        maxLength: 800,
      },
      {
        key: "marktposition",
        label: "Wie würden Sie Ihre aktuelle Marktposition beschreiben?",
        type: "radio",
        description:
          "(Damit wir einschätzen können, ob der Fokus eher auf Aufholen, Absicherung oder Ausbau eines Vorsprungs liegen sollte.)",
        options: [
          { value: "neustart", label: "Neustart / frühe Phase" },
          { value: "etabliert", label: "Etabliert im Markt, aber mit starkem Wettbewerb" },
          { value: "nische", label: "Spezialisiert / Nischenanbieter:in" },
          { value: "marktfuehrer", label: "Marktführend / deutlich vor dem Wettbewerb" },
        ],
      },
      {
        key: "benchmark_wettbewerb",
        label: "Wie schätzen Sie Ihre Digitalisierung im Vergleich zum Wettbewerb ein?",
        type: "radio",
        description:
          "(Damit wir sehen, ob Sie eher aufholen, mithalten oder sich differenzieren möchten.)",
        options: [
          { value: "deutlich_dahinter", label: "Eher hinter dem Wettbewerb" },
          { value: "auf_augenhoehe", label: "In etwa auf Augenhöhe" },
          { value: "leicht_vorne", label: "Leicht vorne" },
          { value: "deutlich_vorne", label: "Deutlich vorne / Pionierrolle" },
          { value: "unbekannt", label: "Schwer einzuschätzen" },
        ],
      },
    ],
  },

  // ------------------------
  // Block 2 – Prozesse & Daten
  // ------------------------
  {
    step: 2,
    title: "2. Prozesse, Systeme & Datenbasis",
    group: "Prozesse & Daten",
    description:
      "In diesem Abschnitt geht es um Ihre internen Abläufe, IT-Systeme und Datenqualität. Je besser wir Ihre aktuelle Struktur kennen, desto passgenauer können wir KI-Use-Cases vorschlagen.",
    fields: [
      {
        key: "it_infrastruktur",
        label: "Wie ist Ihre IT-Infrastruktur aktuell organisiert?",
        type: "radio",
        required: true,
        description:
          "(Damit wir wissen, welche technischen Voraussetzungen für eine sichere und effiziente Integration von KI-Lösungen bereits vorhanden sind.)",
        options: [
          { value: "lokal", label: "Überwiegend lokal (eigene Server / PC-Arbeitsplätze)" },
          { value: "cloud", label: "Überwiegend Cloud-Dienste (SaaS / gemanagte Dienste)" },
          {
            value: "hybrid",
            label: "Mischform (z. B. lokale Systeme + Cloud-Tools wie Microsoft 365, Google Workspace)",
          },
          { value: "minimal", label: "Sehr einfache Infrastruktur (z. B. nur Laptop + einzelne Tools)" },
        ],
      },
      {
        key: "prozesse_papierlos",
        label: "Wie weit sind Ihre Kernprozesse bereits digitalisiert?",
        type: "radio",
        description:
          "(Damit wir erkennen, wo Papier- oder Excel-Prozesse noch bremsen und wo sich KI-gestützte Automatisierung am meisten lohnt.)",
        options: [
          { value: "weitgehend_papier", label: "Viele papierbasierte Abläufe / manuelle Schritte" },
          { value: "teilweise_papierlos", label: "Teilweise digital, aber mit Medienbrüchen" },
          { value: "weitgehend_digital", label: "Weitgehend digital, einzelne manuelle Schritte" },
          { value: "voll_digital", label: "Nahezu komplett digital und standardisiert" },
        ],
      },
      {
        key: "automatisierungsgrad",
        label: "Wie hoch ist der Automatisierungsgrad Ihrer wiederkehrenden Aufgaben?",
        type: "radio",
        description:
          "(Damit wir einschätzen können, wie viel manuelle Arbeit noch in Routinetätigkeiten steckt und wie viel Entlastung durch KI realistisch ist.)",
        options: [
          { value: "gering", label: "Gering – die meisten Aufgaben werden manuell erledigt" },
          { value: "mittel", label: "Mittel – einige Workflows sind bereits automatisiert" },
          { value: "hoch", label: "Hoch – viele Abläufe sind standardisiert und automatisiert" },
        ],
      },
      {
        key: "datenquellen",
        label: "Welche Datenquellen nutzen Sie regelmäßig in Ihrem Unternehmen?",
        type: "checkbox",
        description:
          "(Damit wir sehen, welche vorhandenen Daten sich für Analysen, Automatisierungen oder KI-Modelle nutzen lassen.)",
        options: [
          { value: "crm", label: "CRM-Daten (Kundenstammdaten, Kontakte, Historie)" },
          { value: "erp", label: "ERP / Warenwirtschaft (Bestellungen, Lager, Finanzen)" },
          { value: "web_tracking", label: "Web-Analytics (z. B. Matomo, Google Analytics, Shop-Tracking)" },
          { value: "marketing", label: "Marketing-Kennzahlen (Kampagnen, Social Media, Newsletter)" },
          { value: "support_tickets", label: "Support- / Ticketsysteme (z. B. Zendesk, Freshdesk)" },
          { value: "dokumente", label: "Dokumente & Wissensdatenbanken (Handbücher, Wikis, Protokolle)" },
          { value: "dateisysteme", label: "Dateiablagen (Netzlaufwerke, Cloud-Speicher)" },
          { value: "sonstige", label: "Sonstige Datenquellen (bitte im Freitext erläutern)" },
        ],
      },
      {
        key: "datenquellen_freitext",
        label: "Weitere Datenquellen oder Besonderheiten (optional)",
        type: "textarea",
        placeholder:
          "z. B. spezielle Branchen-Datenbanken, Sensor-/IoT-Daten, Forschungsdaten, Maschine-/Anlagendaten …",
        description:
          "(Damit wir spezielle Datenpotenziale erkennen, die für Ihr Geschäftsmodell besonders relevant sind.)",
      },
      {
        key: "datenqualitaet",
        label: "Wie würden Sie die Qualität und Verfügbarkeit Ihrer Daten einschätzen?",
        type: "radio",
        description:
          "(Damit wir wissen, ob zuerst Grundlagen geschaffen werden müssen oder ob Sie direkt in fortgeschrittene KI-Anwendungen einsteigen können.)",
        options: [
          { value: "lueckenhaft", label: "Eher lückenhaft / uneinheitlich" },
          { value: "ausreichend", label: "Grundsätzlich vorhanden, aber nicht immer gepflegt" },
          { value: "gut", label: "Weitgehend vollständig und gut strukturiert" },
          { value: "exzellent", label: "Sehr hohe Datenqualität, klar definierte Datenhoheit" },
        ],
      },
      {
        key: "loeschregeln",
        label: "Gibt es definierte Regeln zur Datenaufbewahrung und Löschung?",
        type: "radio",
        description:
          "(Damit wir einschätzen können, wie gut Ihre Daten-Governance aufgestellt ist – ein wichtiger Baustein für DSGVO-konforme KI-Nutzung.)",
        options: [
          { value: "ja_schriftlich", label: "Ja, es gibt dokumentierte Richtlinien und Prozesse" },
          { value: "teilweise", label: "Teilweise – einzelne Regeln, aber kein vollständiges Konzept" },
          { value: "nein", label: "Nein, bisher keine klaren Löschregeln" },
          { value: "unbekannt", label: "Nicht bekannt / noch nie damit befasst" },
        ],
      },
      {
        key: "technische_massnahmen",
        label: "Welche technischen Schutzmaßnahmen setzen Sie bereits ein?",
        type: "checkbox",
        description:
          "(Damit wir das Sicherheitsniveau Ihrer IT-Umgebung einordnen und zusätzliche Schutzmaßnahmen vorschlagen können.)",
        options: [
          { value: "firewall", label: "Firewall / Netzwerkschutz" },
          { value: "antivirus", label: "Virenschutz / Endpoint Security" },
          { value: "mfa", label: "Zwei-Faktor-Authentifizierung (MFA) für kritische Systeme" },
          { value: "backup", label: "Regelmäßige Backups / Notfallwiederherstellungsplan" },
          { value: "vpn", label: "VPN / abgesicherter Fernzugriff" },
          { value: "dokumentierte_policies", label: "Dokumentierte IT- und Sicherheitsrichtlinien" },
          { value: "keine", label: "Keine oder nur sehr grundlegende Maßnahmen" },
        ],
      },
      {
        key: "datenherkunft_transparenz",
        label:
          "Wie gut ist dokumentiert, woher Ihre Daten stammen und wer wofür verantwortlich ist (Data Ownership)?",
        type: "radio",
        description:
          "(Damit wir verstehen, wie einfach oder aufwendig es ist, neue KI-Anwendungen datenschutzkonform und nachvollziehbar aufzusetzen.)",
        options: [
          { value: "nicht_dokumentiert", label: "Kaum dokumentiert / schwer nachzuvollziehen" },
          { value: "teilweise_dokumentiert", label: "Teilweise dokumentiert (z. B. in einzelnen Bereichen)" },
          {
            value: "gut_dokumentiert",
            label: "Gut dokumentiert (z. B. Verantwortliche und Prozesse bekannt)",
          },
          {
            value: "sehr_gut_dokumentiert",
            label: "Sehr gut dokumentiert (klare Data-Owner, strukturierte Verzeichnisse, Datenkatalog)",
          },
        ],
      },
    ],
  },

  // ------------------------
  // Block 3 – Strategie & Ziele
  // ------------------------
  {
    step: 3,
    title: "3. Strategie, Ziele & Veränderungsbereitschaft",
    group: "Strategie & Ziele",
    description:
      "In diesem Abschnitt geht es um Ihre mittel- bis langfristigen Ziele, Prioritäten und Ihre Bereitschaft, Prozesse zu verändern. Diese Informationen sind entscheidend, um eine realistische und passende KI-Roadmap zu entwickeln.",
    fields: [
      {
        key: "strategische_ziele",
        label: "Welche strategischen Ziele verfolgen Sie in den nächsten 12–36 Monaten?",
        type: "textarea",
        required: true,
        placeholder:
          "z. B. Umsatzwachstum, Skalierung, Internationalisierung, Qualitätssteigerung, Entlastung von Schlüsselpersonen …",
        description:
          "(Damit wir Ihre KI-Strategie konsequent an Ihren Unternehmenszielen ausrichten können – statt nur „nice-to-have“-Projekte zu starten.)",
        maxLength: 1200,
      },
      {
        key: "vision_3_jahre",
        label: "Wie sieht Ihr Unternehmen idealerweise in 2–3 Jahren aus?",
        type: "textarea",
        placeholder:
          "Beschreiben Sie in wenigen Sätzen, wie Sie arbeiten, welche Kunden Sie erreichen und was sich verändert haben soll.",
        description:
          "(Damit wir Ihre langfristige Vision verstehen und prüfen können, wie KI gezielt dazu beitragen kann, diese Zukunft zu erreichen.)",
        maxLength: 1000,
      },
      {
        key: "ki_ziele",
        label: "Welche Ziele verbinden Sie konkret mit dem Einsatz von KI?",
        type: "checkbox",
        description:
          "(Damit wir die Prioritäten Ihrer KI-Einführung verstehen – von Effizienz über Qualität bis hin zu neuen Geschäftsmodellen.)",
        options: [
          { value: "zeitersparnis", label: "Zeitersparnis in wiederkehrenden Aufgaben" },
          { value: "qualitaet", label: "Qualitätsverbesserung von Inhalten / Ergebnissen" },
          { value: "skalierung", label: "Skalierung des Geschäfts ohne proportional mehr Personal" },
          { value: "kundenservice", label: "Besserer Kundenservice / schnellere Reaktionszeiten" },
          { value: "innovation", label: "Entwicklung neuer Produkte / Services mit KI" },
          { value: "kostenreduktion", label: "Kostensenkung in Prozessen" },
          { value: "compliance", label: "Erfüllung regulatorischer Anforderungen (z. B. AI Act, DSGVO)" },
          { value: "sonstiges", label: "Weitere Ziele (bitte im Freitext erläutern)" },
        ],
      },
      {
        key: "ki_ziele_freitext",
        label: "Weitere oder speziellere Ziele mit KI (optional)",
        type: "textarea",
        placeholder: "z. B. „Wir möchten ein eigenes KI-Produkt entwickeln …“",
        description:
          "(Damit wir ungewöhnliche oder sehr spezifische Zielbilder mit berücksichtigen und ggf. besondere Chancen identifizieren können.)",
      },
      {
        key: "zeitersparnis_prioritaet",
        label: "Wie wichtig ist Ihnen das Thema Zeitersparnis durch Automatisierung?",
        type: "radio",
        description:
          "(Damit wir erkennen, ob schnelle Effizienzgewinne (Quick Wins) für Sie im Vordergrund stehen oder eher strategische Themen.)",
        options: [
          { value: "sehr_hoch", label: "Sehr hoch – Entlastung steht im Vordergrund" },
          { value: "mittel", label: "Wichtig, aber nicht das einzige Ziel" },
          { value: "gering", label: "Zeitersparnis ist eher nebenbei interessant" },
        ],
      },
      {
        key: "investitionsbudget",
        label: "Welches Budget (pro Jahr) wäre realistisch für den Aufbau und Betrieb von KI-Lösungen?",
        type: "radio",
        description:
          "(Damit wir Empfehlungen so zuschneiden können, dass sie zu Ihrer Investitionsbereitschaft passen.)",
        options: [
          { value: "unter_2000", label: "Bis ca. 2.000 € pro Jahr" },
          { value: "2000_10000", label: "2.000 – 10.000 € pro Jahr" },
          { value: "10000_50000", label: "10.000 – 50.000 € pro Jahr" },
          { value: "50000_100000", label: "50.000 – 100.000 € pro Jahr" },
          { value: "ueber_100000", label: "Über 100.000 € pro Jahr" },
          { value: "unbekannt", label: "Noch unklar / hängt vom Business Case ab" },
        ],
      },
      {
        key: "zeitbudget",
        label: "Wie viel Zeit können Sie und Ihr Team realistisch für die Einführung von KI einplanen?",
        type: "radio",
        description:
          "(Damit wir das Tempo Ihrer Roadmap realistisch einschätzen und keine unrealistischen Erwartungen erzeugen.)",
        options: [
          { value: "weniger_als_2h", label: "Weniger als 2 Stunden pro Woche" },
          { value: "2_5h", label: "Ca. 2–5 Stunden pro Woche" },
          { value: "5_10h", label: "5–10 Stunden pro Woche" },
          { value: "mehr_als_10h", label: "Mehr als 10 Stunden pro Woche (z. B. eigenes Projektteam)" },
        ],
      },
      {
        key: "change_management",
        label: "Wie hoch schätzen Sie die Veränderungsbereitschaft in Ihrem Unternehmen ein?",
        type: "radio",
        description:
          "(Damit wir wissen, wie viel Begleitung, Kommunikation und Schulung nötig ist, um KI-Maßnahmen erfolgreich umzusetzen.)",
        options: [
          { value: "hoch", label: "Hoch – wir sind offen für neue Arbeitsweisen" },
          { value: "mittel", label: "Gemischt – einige sind sehr offen, andere skeptisch" },
          { value: "niedrig", label: "Eher gering – Veränderungen werden eher zögerlich aufgenommen" },
        ],
      },
      {
        key: "innovationskultur",
        label: "Wie würden Sie die Innovationskultur in Ihrem Unternehmen beschreiben?",
        type: "radio",
        description:
          "(Damit wir sehen, wie leicht oder schwer es fällt, neue Ideen und Experimente im Alltag zu verankern.)",
        options: [
          { value: "pragmatisch", label: "Pragmatisch – wir probieren aus, was direkt hilft" },
          {
            value: "innovationsfreundlich",
            label: "Innovationsfreundlich – es gibt Raum für neue Ideen und Experimente",
          },
          {
            value: "strukturiert_innovativ",
            label: "Strukturiert innovativ – es gibt Prozesse/Programme für Innovation",
          },
          { value: "zurueckhaltend", label: "Eher zurückhaltend – Fokus auf Stabilität und Risikominimierung" },
        ],
      },
      {
        key: "geschaeftsmodell_evolution",
        label: "Sehen Sie bereits heute mögliche neue Geschäftsmodelle oder Erlösquellen durch KI?",
        type: "textarea",
        placeholder:
          "z. B. neue digitale Produkte, Services, Beratungsangebote, datengetriebene Zusatzleistungen …",
        description:
          "(Damit wir das Potenzial für echte Business-Innovation neben der reinen Effizienzsteigerung erkennen und adressieren können.)",
        maxLength: 1200,
      },
    ],
  },

  // ------------------------
  // Block 4 – Konkrete Use Cases & Aktivitäten
  // ------------------------
  {
    step: 4,
    title: "4. Konkrete Anwendungen & laufende Initiativen",
    group: "Use Cases & Projekte",
    description:
      "In diesem Abschnitt geht es um Ihre bisherigen Erfahrungen mit KI, laufende Projekte und konkrete Anwendungsfälle. Diese Informationen helfen uns, schnell wirkungsvolle Empfehlungen zu geben.",
    fields: [
      {
        key: "ki_kompetenz",
        label: "Wie schätzen Sie Ihre eigene Erfahrung mit KI-Tools (z. B. ChatGPT, Copilot) ein?",
        type: "radio",
        description:
          "(Damit wir passende Einstiegstiefe und Schulungsbedarf einschätzen können – vom ersten Ausprobieren bis zu komplexeren Workflows.)",
        options: [
          { value: "keine", label: "Noch keine oder sehr geringe Erfahrung" },
          { value: "niedrig", label: "Erste Experimente, gelegentliche Nutzung" },
          { value: "mittel", label: "Regelmäßige Nutzung in einzelnen Prozessen" },
          { value: "hoch", label: "Tiefere Erfahrung / systematischer Einsatz im Alltag" },
        ],
      },
      {
        key: "interne_ki_kompetenzen",
        label: "Gibt es in Ihrem Team bereits Personen mit vertiefter KI-Erfahrung?",
        type: "radio",
        description:
          "(Damit wir wissen, ob Sie interne Champion-Rollen aufbauen können oder externe Unterstützung wichtiger ist.)",
        options: [
          { value: "keine", label: "Keine ausgeprägten KI-Kompetenzen im Team" },
          {
            value: "einzelne_person",
            label: "Einzelne Person, die sich intensiver mit KI beschäftigt",
          },
          {
            value: "kleines_team",
            label: "Kleines internes Team mit technischen/analytischen Kompetenzen",
          },
          {
            value: "dediziertes_team",
            label: "Ein dediziertes Team / Abteilung für Digitalisierung/Innovation",
          },
        ],
      },
      {
        key: "anwendungsfaelle",
        label: "Welche Arten von Aufgaben möchten Sie bevorzugt mit KI unterstützen?",
        type: "checkbox",
        description:
          "(Damit wir Ihre wichtigsten Anwendungsfelder verstehen und darauf aufbauend konkrete Quick Wins und langfristige Use-Cases vorschlagen können.)",
        options: [
          { value: "content_erstellung", label: "Texte, Kampagnen, Inhalte (z. B. E-Mails, Posts, Artikel)" },
          {
            value: "recherche_analysen",
            label: "Recherche, Informationsaufbereitung, Markt- und Wettbewerbs-Analysen",
          },
          {
            value: "prozesse_automation",
            label: "Prozess-Automatisierung (z. B. Reporting, Routinen, Schnittstellen)",
          },
          {
            value: "kundenservice",
            label: "Kundenservice / Support (Antwortvorschläge, Chatbots, Wissensdatenbank)",
          },
          {
            value: "planung_steuerung",
            label: "Planung & Steuerung (Forecasts, Szenarien, Kapazitäts- oder Budgetplanung)",
          },
          {
            value: "entwicklung",
            label: "Produkt- / Service-Entwicklung (z. B. Features, Prototypen, Konzepte)",
          },
          {
            value: "qualitaetssicherung",
            label: "Qualitätssicherung (z. B. Review von Texten, Datenchecks, Konsistenzprüfungen)",
          },
          { value: "sonstige", label: "Andere Anwendungsfälle (bitte im Freitext erläutern)" },
        ],
      },
      {
        key: "anwendungsfaelle_freitext",
        label: "Wichtige oder spezifische Use Cases, die Sie im Kopf haben",
        type: "textarea",
        placeholder:
          "Beschreiben Sie die 2–5 wichtigsten Aufgaben oder Prozesse, bei denen Sie sich heute schon Unterstützung durch KI wünschen.",
        description:
          "(Damit wir Ihre konkreten Wünsche und inneren „Pain Points“ verstehen und in den Empfehlungen gezielt adressieren können.)",
        maxLength: 1500,
      },
      {
        key: "ki_projekte",
        label: "Gibt es bereits laufende oder geplante KI-Projekte in Ihrem Unternehmen?",
        type: "textarea",
        placeholder:
          "z. B. internes Pilotprojekt, geplante Einführung eines KI-Assistenten, Zusammenarbeit mit externen Partnern …",
        description:
          "(Damit wir Doppelarbeit vermeiden, Synergien nutzen und Ihre bestehenden Initiativen in die Gesamtstrategie einbetten können.)",
        maxLength: 1500,
      },
      {
        key: "bestehende_tools",
        label: "Welche KI- oder Automatisierungstools nutzen Sie heute bereits regelmäßig?",
        type: "textarea",
        placeholder:
          "z. B. ChatGPT / GPT-4, Microsoft Copilot, Google Workspace-Funktionen, spezielle Branchenlösungen …",
        description:
          "(Damit wir an Ihre bestehende Tool-Landschaft anknüpfen und gezielt ergänzende oder bessere Alternativen vorschlagen können.)",
        maxLength: 1000,
      },
      {
        key: "ki_hemmnisse",
        label: "Was sind aktuell Ihre größten Hemmnisse oder Bedenken beim Einsatz von KI?",
        type: "checkbox",
        description:
          "(Damit wir Hürden und Risiken klar benennen und Lösungen dafür in die Empfehlungen integrieren können.)",
        options: [
          { value: "fehlende_zeit", label: "Zu wenig Zeit im Alltag" },
          { value: "fehlendes_wissen", label: "Zu wenig Wissen / Unsicherheit im Umgang mit KI" },
          { value: "datenschutz_sorge", label: "Sorge um Datenschutz / DSGVO / Geheimhaltung" },
          { value: "qualitaetszweifel", label: "Zweifel an der Qualität der Ergebnisse" },
          { value: "akzeptanz_team", label: "Skepsis oder Widerstand im Team" },
          { value: "kosten_unsicherheit", label: "Unsicherheit über Kosten und Nutzen" },
          { value: "technische_huerden", label: "Technische Hürden (Schnittstellen, Integration, IT-Freigaben)" },
          { value: "sonstiges", label: "Weitere Bedenken (bitte im Freitext beschreiben)" },
        ],
      },
      {
        key: "ki_hemmnisse_freitext",
        label: "Weitere Bedenken, Risiken oder Erfahrungen (optional)",
        type: "textarea",
        placeholder:
          "z. B. schlechte Erfahrungen mit einzelnen Tools, interner Widerstand, rechtliche Fragen, Branchenbesonderheiten …",
        description:
          "(Damit wir Ihre individuelle Situation ernst nehmen und konkrete Antworten auf Ihre wichtigsten Sorgen geben können.)",
        maxLength: 1200,
      },
    ],
  },

  // ------------------------
  // Block 5 – Governance, Recht & Verantwortung
  // ------------------------
  {
    step: 5,
    title: "5. Governance, Verantwortung & Compliance",
    group: "Governance & Sicherheit",
    description:
      "In diesem Abschnitt geht es um Verantwortlichkeiten, Richtlinien und rechtliche Rahmenbedingungen. Diese sind entscheidend, um KI sicher, verantwortungsvoll und audit-fähig einzusetzen.",
    fields: [
      {
        key: "governance_richtlinien",
        label: "Gibt es bereits Richtlinien zum Einsatz von KI in Ihrem Unternehmen?",
        type: "radio",
        description:
          "(Damit wir erkennen, ob und wie weit Sie in der Governance-Entwicklung sind und welche Bausteine ergänzt werden sollten.)",
        options: [
          { value: "keine", label: "Nein, bisher keine konkreten Richtlinien" },
          { value: "in_arbeit", label: "In Arbeit / in Diskussion" },
          { value: "teilweise", label: "Teilweise – z. B. für einzelne Teams oder Tools" },
          { value: "umfangreich", label: "Ja, es gibt ein umfassendes KI-Policy-Dokument" },
        ],
      },
      {
        key: "meldewege",
        label: "Gibt es definierte Wege, wie Mitarbeitende Fragen oder Vorfälle im Zusammenhang mit KI melden können?",
        type: "radio",
        description:
          "(Damit wir sehen, ob bereits eine Kultur für Feedback, Transparenz und Fehler-Meldungen existiert – wichtig für den sicheren Betrieb.)",
        options: [
          { value: "keine", label: "Nein, keine spezifischen Meldewege" },
          { value: "informell", label: "Informell (z. B. direkte Ansprache, Chat, E-Mail)" },
          { value: "teilweise_formal", label: "Teilweise formal (z. B. definierte Ansprechpartner:innen)" },
          { value: "klar_definiert", label: "Ja, es gibt klare, dokumentierte Meldewege" },
        ],
      },
      {
        key: "datenschutz",
        label: "Wie ist das Thema Datenschutz (DSGVO) bei Ihnen organisatorisch verankert?",
        type: "radio",
        description:
          "(Damit wir prüfen können, wie gut Sie für datenschutzkonformen KI-Einsatz vorbereitet sind und wo es noch Lücken gibt.)",
        options: [
          { value: "nicht_geregelt", label: "Nicht geregelt / kein klarer Ansprechpartner" },
          { value: "intern_verantwortlich", label: "Interne Ansprechperson (z. B. Datenschutzbeauftragte:r)" },
          { value: "extern_dsba", label: "Externer Datenschutzbeauftragter / externe Beratung" },
          { value: "kombination", label: "Kombination aus internem und externem Datenschutz" },
        ],
      },
      {
        key: "datenschutzbeauftragter",
        label: "Haben Sie einen offiziellen Datenschutzbeauftragten (DSB) benannt?",
        type: "radio",
        description:
          "(Damit wir die formale Verantwortlichkeit einschätzen können – relevant für bestimmte Pflichten nach DSGVO und AI Act.)",
        options: [
          { value: "ja", label: "Ja, es gibt eine benannte Person (intern oder extern)" },
          { value: "in_pruefung", label: "In Prüfung / in Vorbereitung" },
          { value: "nein", label: "Nein, bisher nicht" },
        ],
      },
      {
        key: "folgenabschaetzung",
        label:
          "Wurden für datenintensive oder automatisierte Entscheidungen bereits Risiko- oder Datenschutz-Folgenabschätzungen durchgeführt?",
        type: "radio",
        description:
          "(Damit wir erkennen, ob Sie bereits Erfahrungen mit formalen Risikoprüfungen haben – eine wichtige Grundlage für den AI Act.)",
        options: [
          { value: "ja_regelmaessig", label: "Ja, regelmäßig und dokumentiert" },
          { value: "teilweise", label: "Teilweise, z. B. für einzelne Projekte" },
          { value: "geplant", label: "Geplant, aber noch nicht umgesetzt" },
          { value: "nein", label: "Nein, bisher nicht" },
        ],
      },
      {
        key: "compliance_anforderungen",
        label:
          "Unterliegt Ihr Unternehmen besonderen gesetzlichen oder regulatorischen Anforderungen (z. B. Finanzaufsicht, Medizinprodukte, KRITIS)?",
        type: "textarea",
        placeholder:
          "Bitte nennen Sie ggf. relevante Gesetze, Standards oder Aufsichtsbehörden (z. B. MaRisk, BAIT, MDR, ISO-Normen …).",
        description:
          "(Damit wir branchenspezifische Pflichten (z. B. im Finanz-, Gesundheits- oder öffentlichen Sektor) in der KI-Strategie berücksichtigen können.)",
        maxLength: 1000,
      },
    ],
  },

  // ------------------------
  // Block 6 – Kompetenzen & Schulungsbedarf
  // ------------------------
  {
    step: 6,
    title: "6. Kompetenzen, Kultur & Qualifizierung",
    group: "Kompetenzen & Schulung",
    description:
      "Abschließend betrachten wir, welche Fähigkeiten und welches Mindset in Ihrem Unternehmen vorhanden sind – und wo gezielte Qualifizierung den größten Hebel bietet.",
    fields: [
      {
        key: "trainings_interessen",
        label: "Für welche Themen wünschen Sie sich Unterstützung oder Schulungen?",
        type: "checkbox",
        description:
          "(Damit wir konkrete Vorschläge für passende Trainings, Formate und Materialien in Ihren Bericht integrieren können.)",
        options: [
          { value: "grundlagen_ki", label: "KI-Grundlagen & Verständnis (Was ist möglich, was nicht?)" },
          { value: "prompting", label: "Praktisches Prompting & Arbeitsalltag mit KI-Assistenten" },
          {
            value: "datenkompetenz",
            label: "Datenkompetenz & Datenqualität (Daten strukturieren, nutzen, pflegen)",
          },
          {
            value: "ki_in_prozessen",
            label: "KI in bestehenden Prozessen (z. B. Marketing, Vertrieb, HR, Service)",
          },
          {
            value: "ai_governance",
            label: "AI Governance, Datenschutz, AI Act & Compliance-Grundlagen",
          },
          {
            value: "change_management",
            label: "Change-Management & Kommunikation (Team mitnehmen, Rollen klären)",
          },
          {
            value: "leader_training",
            label: "Führungskräftetraining (strategischer Einsatz von KI, Entscheidungsgrundlagen)",
          },
        ],
      },
      {
        key: "trainings_interessen_freitext",
        label: "Gibt es spezielle Themen oder Formate, die Sie sich wünschen?",
        type: "textarea",
        placeholder:
          "z. B. „Hands-on-Workshop für das Vertriebsteam“, „Executive-Briefing für Geschäftsführung“, „Train-the-Trainer für interne Multiplikatoren“ …",
        description:
          "(Damit wir Empfehlungen für Schulungs- und Begleitangebote möglichst passgenau auf Ihre Situation zuschneiden können.)",
        maxLength: 1200,
      },
      {
        key: "email",
        label: "Ihre E-Mail-Adresse für den Versand des Reports",
        type: "email",
        required: true,
        placeholder: "z. B. vorname.nachname@unternehmen.de",
        description:
          "Wir verwenden Ihre E-Mail ausschließlich für den Versand des Reports und ggf. Rückfragen zu diesem Auftrag.",
      },
      {
        key: "einwilligung_daten",
        label:
          "Ich bin damit einverstanden, dass meine Angaben zur Erstellung des KI-Status-Reports verarbeitet werden.",
        type: "checkbox_single",
        required: true,
        description:
          "Ohne diese Einwilligung können wir leider keinen individuellen Report erstellen. Details finden Sie in unserer Datenschutzerklärung.",
        options: [
          {
            value: "yes",
            label:
              "Ja, ich bin einverstanden, dass meine Angaben ausschließlich zur Erstellung des KI-Status-Reports und optional zur Kontaktaufnahme genutzt werden.",
          },
        ],
      },
      {
        key: "einwilligung_newsletter",
        label: "Möchten Sie zusätzlich Informationen zu KI-Updates & Fördermöglichkeiten erhalten?",
        type: "checkbox_single",
        description:
          "Optional: Wenn Sie zustimmen, informieren wir Sie gelegentlich über relevante Neuerungen (z. B. AI-Act-Updates, neue Förderprogramme, Tool-Trends).",
        options: [
          {
            value: "yes",
            label:
              "Ja, ich möchte gelegentlich Informationen zu KI-Trends, Fördermöglichkeiten und neuen Funktionen von KI-Sicherheit.jetzt erhalten.",
          },
        ],
      },
    ],
  },
];

// =====================
// Utility-Funktionen
// =====================

function $(selector, root = document) {
  return root.querySelector(selector);
}
function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function serializeForm() {
  const data = {};
  fields.forEach((block) => {
    (block.fields || []).forEach((field) => {
      const key = field.key;
      if (!key) return;
      const el = document.querySelector(`[data-field-key="${key}"]`);
      if (!el) return;

      if (field.type === "checkbox") {
        const checked = $all(`input[name="${key}"]:checked`).map((i) => i.value);
        data[key] = checked;
      } else if (field.type === "checkbox_single") {
        const cb = el.querySelector(`input[type="checkbox"]`);
        data[key] = cb && cb.checked ? cb.value || true : false;
      } else if (field.type === "radio") {
        const checked = $(`input[name="${key}"]:checked`);
        data[key] = checked ? checked.value : "";
      } else if (field.type === "number") {
        const val = el.querySelector("input")?.value;
        data[key] = val ? Number(val) : null;
      } else if (field.type === "email") {
        const val = el.querySelector("input")?.value?.trim();
        data[key] = val || "";
      } else if (field.type === "textarea") {
        const val = el.querySelector("textarea")?.value?.trim();
        data[key] = val || "";
      } else if (field.type === "select") {
        const val = el.querySelector("select")?.value;
        data[key] = val || "";
      } else {
        const val = el.querySelector("input, textarea, select")?.value?.trim();
        data[key] = val || "";
      }
    });
  });
  return data;
}

function restoreFormFrom(data) {
  if (!data || typeof data !== "object") return;
  fields.forEach((block) => {
    (block.fields || []).forEach((field) => {
      const key = field.key;
      if (!key || !(key in data)) return;
      const value = data[key];
      const el = document.querySelector(`[data-field-key="${key}"]`);
      if (!el) return;

      if (field.type === "checkbox") {
        $all(`input[name="${key}"]`, el).forEach((input) => {
          input.checked = Array.isArray(value) && value.includes(input.value);
        });
      } else if (field.type === "checkbox_single") {
        const cb = el.querySelector(`input[type="checkbox"]`);
        if (cb) cb.checked = !!value;
      } else if (field.type === "radio") {
        $all(`input[name="${key}"]`, document).forEach((input) => {
          input.checked = input.value === String(value);
        });
      } else if (field.type === "number") {
        const input = el.querySelector("input");
        if (input) input.value = value != null ? String(value) : "";
      } else if (field.type === "email") {
        const input = el.querySelector("input");
        if (input) input.value = value || "";
      } else if (field.type === "textarea") {
        const ta = el.querySelector("textarea");
        if (ta) ta.value = value || "";
      } else if (field.type === "select") {
        const sel = el.querySelector("select");
        if (sel) sel.value = value || "";
      } else {
        const input = el.querySelector("input, textarea, select");
        if (input) input.value = value || "";
      }
    });
  });
}

// =====================
// Autosave-Logik
// =====================

let autosaveTimer = null;
function scheduleAutosave() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
  }
  autosaveTimer = setTimeout(() => {
    const data = serializeForm();
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Autosave failed:", e);
    }
  }, AUTOSAVE_DEBOUNCE_MS);
}

function loadAutosave() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    restoreFormFrom(data);
  } catch (e) {
    console.warn("Failed to parse autosave:", e);
  }
}

// =====================
// Stepper-Logik
// =====================

let currentStep = 1;
const totalSteps = fields.length;

function showStep(step) {
  currentStep = step;
  $all("[data-step]").forEach((el) => {
    const s = Number(el.getAttribute("data-step"));
    el.style.display = s === step ? "block" : "none";
  });

  const stepIndicators = $all("[data-step-indicator]");
  stepIndicators.forEach((el, idx) => {
    const s = idx + 1;
    el.classList.toggle("is-active", s === step);
    el.classList.toggle("is-completed", s < step);
  });

  const prevBtn = $("#btn-prev");
  const nextBtn = $("#btn-next");
  const submitBtn = $("#btn-submit");

  if (prevBtn) prev_btn.disabled = step <= 1;
  if (nextBtn) nextBtn.style.display = step < totalSteps ? "inline-flex" : "none";
  if (submitBtn) submitBtn.style.display = step === totalSteps ? "inline-flex" : "none";
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function validateStep(step) {
  const block = fields.find((b) => b.step === step);
  if (!block) return true;

  let valid = true;
  (block.fields || []).forEach((field) => {
    const key = field.key;
    if (!field.required) return;
    const el = document.querySelector(`[data-field-key="${key}"]`);
    if (!el) return;

    let hasValue = false;
    if (field.type === "checkbox") {
      const checked = $all(`input[name="${key}"]:checked`, el);
      hasValue = checked.length > 0;
    } else if (field.type === "checkbox_single") {
      const cb = el.querySelector(`input[type="checkbox"]`);
      hasValue = !!(cb && cb.checked);
    } else if (field.type === "radio") {
      const checked = $(`input[name="${key}"]:checked`, el);
      hasValue = !!checked;
    } else if (field.type === "number" || field.type === "email") {
      const input = el.querySelector("input");
      hasValue = !!(input && input.value.trim());
    } else if (field.type === "textarea") {
      const ta = el.querySelector("textarea");
      hasValue = !!(ta && ta.value.trim());
    } else if (field.type === "select") {
      const sel = el.querySelector("select");
      hasValue = !!(sel && sel.value);
    } else {
      const input = el.querySelector("input, textarea, select");
      hasValue = !!(input && input.value.trim());
    }

    el.classList.toggle("has-error", !hasValue);
    if (!hasValue && valid) {
      valid = false;
      const firstError = el.querySelector("input, textarea, select");
      if (firstError && typeof firstError.focus === "function") {
        firstError.focus();
      }
    }
  });

  if (!valid) {
    const msg = $("#validation-message");
    if (msg) {
      msg.textContent = "Bitte füllen Sie die markierten Pflichtfelder aus, bevor Sie fortfahren.";
      msg.style.display = "block";
    } else {
      alert("Bitte füllen Sie alle erforderlichen Felder aus, bevor Sie fortfahren.");
    }
  } else {
    const msg = $("#validation-message");
    if (msg) msg.style.display = "none";
  }

  return valid;
}

// =====================
// Rendering der Felder
// =====================

function renderField(field) {
  const wrapper = document.createElement("div");
  wrapper.className = "fb-field";
  wrapper.setAttribute("data-field-key", field.key || "");

  const labelEl = document.createElement("label");
  labelEl.className = "fb-label";
  labelEl.textContent = field.label || "";
  if (field.required) {
    const span = document.createElement("span");
    span.className = "fb-required";
    span.textContent = " *";
    labelEl.appendChild(span);
  }
  wrapper.appendChild(labelEl);

  if (field.description) {
    const descEl = document.createElement("p");
    descEl.className = "fb-description";
    descEl.textContent = field.description;
    wrapper.appendChild(descEl);
  }

  let control = null;
  const type = field.type || "text";

  if (type === "textarea") {
    control = document.createElement("textarea");
    control.className = "fb-input";
    if (field.placeholder) control.placeholder = field.placeholder;
    if (field.maxLength) control.maxLength = field.maxLength;
  } else if (type === "email" || type === "number" || type === "text") {
    control = document.createElement("input");
    control.type = type === "number" ? "number" : type;
    control.className = "fb-input";
    if (field.placeholder) control.placeholder = field.placeholder;
    if (field.min != null) control.min = String(field.min);
    if (field.max != null) control.max = String(field.max);
  } else if (type === "select") {
    control = document.createElement("select");
    control.className = "fb-input";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = field.placeholder || "Bitte auswählen";
    control.appendChild(ph);
    (field.options || []).forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      control.appendChild(o);
    });
  } else if (type === "radio") {
    control = document.createElement("div");
    control.className = "fb-options";
    (field.options || []).forEach((opt, idx) => {
      const id = `${field.key}_${idx}`;
      const label = document.createElement("label");
      label.className = "fb-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = field.key;
      input.value = opt.value;
      input.id = id;
      const span = document.createElement("span");
      span.textContent = opt.label;
      label.appendChild(input);
      label.appendChild(span);
      control.appendChild(label);
    });
  } else if (type === "checkbox") {
    control = document.createElement("div");
    control.className = "fb-options";
    (field.options || []).forEach((opt, idx) => {
      const id = `${field.key}_${idx}`;
      const label = document.createElement("label");
      label.className = "fb-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = field.key;
      input.value = opt.value;
      input.id = id;
      const span = document.createElement("span");
      span.textContent = opt.label;
      label.appendChild(input);
      label.appendChild(span);
      control.appendChild(label);
    });
  } else if (type === "checkbox_single") {
    control = document.createElement("div");
    control.className = "fb-options";
    (field.options || []).forEach((opt, idx) => {
      const id = `${field.key}_${idx}`;
      const label = document.createElement("label");
      label.className = "fb-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = field.key;
      input.value = opt.value || "yes";
      input.id = id;
      const span = document.createElement("span");
      span.textContent = opt.label;
      label.appendChild(input);
      label.appendChild(span);
      control.appendChild(label);
    });
  } else {
    control = document.createElement("input");
    control.type = "text";
    control.className = "fb-input";
    if (field.placeholder) control.placeholder = field.placeholder;
  }

  if (control) {
    wrapper.appendChild(control);
  }

  return wrapper;
}

function renderForm() {
  const container = $("#form-steps");
  if (!container) return;

  container.innerHTML = "";

  fields.forEach((block) => {
    const stepEl = document.createElement("section");
    stepEl.className = "fb-step";
    stepEl.setAttribute("data-step", String(block.step));

    const h2 = document.createElement("h2");
    h2.className = "fb-step-title";
    h2.textContent = block.title;
    stepEl.appendChild(h2);

    if (block.description) {
      const p = document.createElement("p");
      p.className = "fb-step-description";
      p.textContent = block.description;
      stepEl.appendChild(p);
    }

    (block.fields || []).forEach((f) => {
      const fieldEl = renderField(f);
      stepEl.appendChild(fieldEl);
    });

    container.appendChild(stepEl);
  });

  // Step-Indikator
  const stepsNav = $("#step-indicators");
  if (stepsNav) {
    stepsNalinnerHTML = "";
    fields.forEach((b, idx) => {
      const li = document.createElement("li");
      li.className = "fb-step-indicator";
      li.setAttribute("data-step-indicator", String(b.step));
      li.textContent = `${b.step}. ${b.title}`;
      stepsNav.appendChild(li);
    });
  }

  // Start mit Step 1
  showStep(1);
}

// =====================
// Submit-Logik
// =====================

async function submitForm() {
  if (!validateStep(currentStep)) return;

  const data = serializeForm();
  const payload = {
    version: FORM_VERSION,
    lang: "de",
    answers: data,
  };

  const submitBtn = $("#btn-submit");
  const spinner = $("#submit-spinner");
  const statusEl = $("#submit-status");

  try {
    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.style.display = "inline-block";
    if (statusEl) {
      statusEl.textContent = "Ihre Angaben werden übertragen …";
      statusEl.classList.remove("is-error");
      statusEl.classList.add("is-pending");
    }

    const res = await fetch(`${API_BASE_URL}/briefings/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text || "Unbekannter Fehler"}`);
    }
    const result = await res.json().catch(() => ({}));

    if (statusEl) {
      statusEl.textContent =
        "Vielen Dank! Ihr KI-Status-Report wird jetzt erzeugt. Sie erhalten in Kürze eine E-Mail mit dem Link zum PDF.";
      statusEl.classList.remove("is-pending");
      statusEl.classList.add("is-success");
    }

    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch (_) {
      // ignorieren
    }
  } catch (e) {
    console.error("Submit error:", e);
    if (statusEl) {
      statusEl.textContent =
        "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder wenden Sie sich an support@ki-sicherheit.jetzt.";
      statusEl.classList.remove("is-success");
      statusEl.classList.add("is-error");
    } else {
      alert("Fehler beim Senden des Formulars. Details siehe Konsole.");
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.style.display = "none";
  }
}

// =====================
// Event-Initialisierung
// =====================

function initFormBuilder() {
  renderForm();
  loadAutosave();

  // Change-Listener für Autosave
  const formEl = $("#ksj-form-root");
  if (formEl) {
    formEl.addEventListener(
      "input",
      () => {
        scheduleAutosave();
      },
      { passive: true }
    );
  }

  const prevBtn = $("#btn-prev");
  const nextBtn = $("#btn-next");
  const submitBtn = $("#btn-submit");

  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.preventDefault(); prevStep(); });
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.preventDefault(); nextStep(); });
  if (submitBtn) submitBtn.addEventListener("click", (e) => { e.preventDefault(); submitForm(); });

  console.log("Formbuilder initialisiert – Version:", FORM_VERSION);
}

// Auto-Init (auch wenn Script nach DOMContentLoaded geladen wird)
(function autoInit() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initFormBuilder();
    });
  } else {
    initFormBuilder();
  }
})();
