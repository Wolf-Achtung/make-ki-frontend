/* Multi-Step Wizard (DE) - Scroll-to-Top, persistenter Autosave & Step-Resume */
/* Schema 1.5.0 - Microcopy optimiert für kleine Unternehmen; Submit nur im letzten Schritt. */
(function () {
  "use strict";

  // --------------------------- Konfiguration ---------------------------
// --------------------------- Konfiguration ---------------------------
var LANG = "de";
var SCHEMA_VERSION = "1.5.0";
var STORAGE_PREFIX = "autosave_form_";
var SUBMIT_PATH = "/briefing_async";

function getBaseUrl() {
  try {
    var cfg = window.__CONFIG__ || {};
    var v = cfg.API_BASE || '';
    if (!v) {
      var meta = document.querySelector('meta[name="api-base"]');
      v = (meta && meta.content) || (window.API_BASE || '/api');
    }
    return String(v || '/api').replace(/\/+$/, '');
  } catch (e) { 
    return '/api'; 
  }
}

function getToken() {
  var keys = ["jwt", "access_token", "id_token", "AUTH_TOKEN", "token"];
  for (var i = 0; i < keys.length; i++) { 
    try { 
      var t = localStorage.getItem(keys[i]); 
      if (t) return t; 
    } catch (e) {} 
  }
  return null;
}

function getEmailFromJWT(token) {
  try { 
    if (!token || token.split(".").length !== 3) return null;
    var payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.preferred_username || payload.sub || null;
  } catch (e) { 
    return null; 
  }
}

function dispatchProgress(step, total) {
  try { 
    document.dispatchEvent(new CustomEvent("fb:progress", { 
      detail: { step: step, total: total } 
    })); 
  } catch (_) {}
}

  // --------------------------- Styles (inject) ---------------------------
  (function injectCSS(){ try{
    var css = ""
      + ".fb-section{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:32px;margin:24px 0;box-shadow:0 4px 20px rgba(0,0,0,.03)}"
      + ".fb-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}"
      + ".fb-step{display:inline-block;background:#dbeafe;color:#1e3a5f;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}"
      + ".fb-title{font-size:22px;font-weight:700;color:#1e3a5f}"
      + ".section-intro{background:linear-gradient(135deg,#e0f2fe,#dbeafe);border-left:4px solid #2563eb;border-radius:12px;padding:16px 24px;margin:8px 0 24px;color:#1e3a5f}"
      + ".form-group{margin:22px 0}"
      + ".form-group>label{display:block;font-weight:600;color:#1e3a5f;margin-bottom:8px}"
      + ".guidance{font-size:15px;color:#475569;margin:8px 0 12px;background:#f0f9ff;padding:12px;border-radius:10px;border-left:3px solid #dbeafe}"
      + ".guidance.important{background:#fef3c7;border-left-color:#f59e0b;color:#92400e}"
      + "select,textarea,input[type=text],input[type=range]{width:100%;border:2px solid #e2e8f0;border-radius:12px;padding:12px 14px;font-size:16px;background:#fff;transition:all .3s ease;font-family:inherit}"
      + "select:hover,textarea:hover,input[type=text]:hover{border-color:#cbd5e1}"
      + "select:focus,textarea:focus,input[type=text]:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}"
      + "textarea{min-height:120px;resize:vertical}"
      + ".checkbox-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:8px}"
      + ".checkbox-label{display:flex;gap:12px;align-items:flex-start;padding:12px;background:#f0f9ff;border:2px solid transparent;border-radius:12px;cursor:pointer;transition:all .3s ease}"
      + ".checkbox-label:hover{background:#e0f2fe;border-color:#dbeafe}"
      + ".checkbox-label input{margin-top:4px;width:18px;height:18px;cursor:pointer}"
      + ".invalid{border-color:#ef4444!important;background:#fef2f2!important}"
      + ".invalid-group{box-shadow:0 0 0 3px rgba(239,68,68,.2);border-radius:12px}"
      + ".form-nav{position:sticky;bottom:0;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-top:24px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,.05)}"
      + ".btn{border:0;border-radius:12px;padding:12px 22px;font-size:16px;font-weight:600;cursor:pointer;transition:all .25s ease}"
      + ".btn-primary{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff}"
      + ".btn-secondary{background:#fff;color:#1e293b;border:2px solid #cbd5e1}"
      + ".btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(37,99,235,.3)}"
      + ".btn-secondary:hover{background:#f0f9ff;border-color:#2563eb}"
      + ".mr-auto{margin-right:auto}"
      + ".slider-container{display:flex;align-items:center;gap:12px}"
      + ".slider-value-label{min-width:48px;padding:8px 12px;background:#dbeafe;border-radius:8px;font-weight:600;color:#1e3a5f;text-align:center}";
    var s=document.createElement("style"); s.type="text/css"; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }catch(_){}})();

  // --------------------------- Inhalte ---------------------------
  var BLOCK_INTRO = [
    "Hier erfassen wir Basisdaten (Branche, Größe, Standort). Keine Unterlagen nötig - grobe Angaben reichen völlig. So personalisieren wir Ihren Report und prüfen passende Förderung & Compliance.",
    "Status Quo zu Prozessen, Daten und bisheriger KI-Nutzung. Ziel: schnelle, machbare Quick Wins und eine pragmatische Start-Roadmap - auch für kleine Teams.",
    "Ziele & wichtigste Anwendungsfälle: Was soll KI ganz konkret leisten? Wir fokussieren umsetzbare Maßnahmen mit sichtbarem Nutzen.",
    "Strategie & Governance: einfache, tragfähige Leitplanken für nachhaltigen KI-Einsatz ohne Bürokratie-Overhead.",
    "Ressourcen & Präferenzen (Zeit, Tool-Landschaft). Wir passen Empfehlungen an Machbarkeit, Budget und Tempo an.",
    "Rechtliches & Förderung: DSGVO, EU AI Act & Fördermöglichkeiten - verständlich erklärt, mit klaren To-dos.",
    "Datenschutz & Absenden: Einwilligung bestätigen und den personalisierten Report starten."
  ];

  // Felder (inkl. freundlich-konkreter Microcopy)
  var fields = [
    { key: "branche", label: "In welcher Branche ist Ihr Unternehmen tätig?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Werbung" }, { value: "beratung", label: "Beratung & Dienstleistungen" },
        { value: "it", label: "IT & Software" }, { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "handel", label: "Handel & E-Commerce" }, { value: "bildung", label: "Bildung" },
        { value: "verwaltung", label: "Verwaltung" }, { value: "gesundheit", label: "Gesundheit & Pflege" },
        { value: "bau", label: "Bauwesen & Architektur" }, { value: "medien", label: "Medien & Kreativwirtschaft" },
        { value: "industrie", label: "Industrie & Produktion" }, { value: "logistik", label: "Transport & Logistik" }
      ],
      description: "Bitte wählen Sie die Branche, die Ihr Unternehmen am besten beschreibt. Wir verwenden diese Angabe, um branchenspezifische Beispiele, Tools sowie Hinweise zu Fördermöglichkeiten und Compliance auszuwählen."
    },
    { key: "unternehmensgroesse", label: "Wie groß ist Ihr Unternehmen?", type: "select",
      options: [
        { value: "solo", label: "1 (Solo-Selbstständig/Freiberuflich)" }, { value: "team", label: "2-10 (Kleines Team)" }, { value: "kmu", label: "11-100 (KMU)" }
      ],
      description: "Eine grobe Schätzung genügt. So können wir unsere Vorschläge und Förderprogramme realistisch planen - auch für kleine Teams."
    },
    { key: "selbststaendig", label: "Unternehmensform bei 1 Person", type: "select",
      options: [
        { value: "freiberufler", label: "Freiberuflich/Selbstständig" }, { value: "kapitalgesellschaft", label: "1-Personen-Kapitalgesellschaft (GmbH/UG)" },
        { value: "einzelunternehmer", label: "Einzelunternehmer (mit Gewerbe)" }, { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Diese Frage ist nur relevant, wenn Sie zuvor "1" ausgewählt haben. Bitte wählen Sie die Rechtsform, die am ehesten zutrifft - "Sonstiges" ist ebenfalls völlig in Ordnung.",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "bundesland", label: "Bundesland (regionale Fördermöglichkeiten)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" }, { value: "ni", label: "Niedersachsen" },
        { value: "nw", label: "Nordrhein-Westfalen" }, { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Sachsen" }, { value: "st", label: "Sachsen-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thüringen" }
      ],
      description: "Bitte wählen Sie das Bundesland Ihres Hauptsitzes bzw. Ihrer Gewerbeanmeldung aus. Anhand dieser Angabe prüfen wir passende regionale Förderprogramme."
    },
    { key: "hauptleistung", label: "Was ist Ihre Hauptdienstleistung oder Ihr wichtigstes Produkt?", type: "textarea",
      placeholder: "z. B. Social-Media-Kampagnen, CNC-Fertigung, Steuerberatung für Startups",
      description: "Ein bis zwei Sätze genügen. Falls Ihr Unternehmen mehrere Leistungen anbietet, nennen Sie bitte die wichtigste."
    },
    { key: "zielgruppen", label: "Welche Zielgruppen bedienen Sie?", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B (Geschäftskunden)" }, { value: "b2c", label: "B2C (Endverbraucher)" },
        { value: "kmu", label: "KMU" }, { value: "grossunternehmen", label: "Großunternehmen" },
        { value: "selbststaendige", label: "Selbstständige/Freiberufler" }, { value: "oeffentliche_hand", label: "Öffentliche Hand" },
        { value: "privatpersonen", label: "Privatpersonen" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Andere" }
      ],
      description: "Mehrfachauswahl ist möglich. Ihre Auswahl hilft uns, passende KI-Anwendungsfälle und Beispiele auszuwählen."
    },
    { key: "jahresumsatz", label: "Jahresumsatz (Schätzung)", type: "select",
      options: [
        { value: "unter_100k", label: "Bis 100.000 €" }, { value: "100k_500k", label: "100.000-500.000 €" },
        { value: "500k_2m", label: "500.000-2 Mio. €" }, { value: "2m_10m", label: "2-10 Mio. €" },
        { value: "ueber_10m", label: "Über 10 Mio. €" }, { value: "keine_angabe", label: "Keine Angabe" }
      ],
      description: "Bitte schätzen Sie den Jahresumsatz Ihres Unternehmens im letzten Jahr. Diese Angabe dient nur zur Orientierung (z. B. für Vergleiche oder Fördermöglichkeiten) und wird nicht veröffentlicht."
    },
    { key: "it_infrastruktur", label: "Wie ist Ihre IT-Infrastruktur organisiert?", type: "select",
      options: [
        { value: "cloud", label: "Cloud-basiert (z. B. Microsoft 365, Google Cloud)" },
        { value: "on_premise", label: "Eigenes Rechenzentrum (On-Premises)" },
        { value: "hybrid", label: "Hybrid (Cloud + eigene Server)" }, { value: "unklar", label: "Unklar / noch offen" }
      ],
      description: "Bitte wählen Sie den aktuellen Stand Ihrer IT-Infrastruktur. "Hybrid" ist weit verbreitet und völlig in Ordnung."
    },
    { key: "interne_ki_kompetenzen", label: "Gibt es ein internes KI-/Digitalisierungsteam?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "in_planung", label: "In Planung" } ],
      description: "Falls es kein eigenes Team dafür gibt, wählen Sie bitte "Nein". Wir schlagen Ihnen dann schlanke Einstiegsmöglichkeiten und Schulungen vor."
    },
    { key: "datenquellen", label: "Welche Datentypen stehen für KI-Projekte zur Verfügung?", type: "checkbox",
      options: [
        { value: "kundendaten", label: "Kundendaten (CRM, Service)" }, { value: "verkaufsdaten", label: "Verkaufs-/Bestelldaten" },
        { value: "produktionsdaten", label: "Produktions-/Betriebsdaten" }, { value: "personaldaten", label: "Personal-/HR-Daten" },
        { value: "marketingdaten", label: "Marketing-/Kampagnendaten" }, { value: "sonstige", label: "Sonstige Datenquellen" }
      ],
      description: "Bitte wählen Sie nur die Datentypen aus, auf die Sie derzeit Zugriff haben. Auch kleine Datenmengen können wertvoll sein."
    },

    // Block 2: Status Quo
    { key: "digitalisierungsgrad", label: "Wie digital sind Ihre internen Prozesse? (1-10)", type: "slider", min: 1, max: 10, step: 1,
      description: "Ziehen Sie den Regler nach Ihrem Gefühl: 1 steht für viele Papierprozesse, 10 für weitgehend automatisierte Abläufe. Es gibt kein Richtig oder Falsch - diese Angabe dient nur einer groben Einordnung." },
    { key: "prozesse_papierlos", label: "Anteil papierloser Prozesse", type: "select",
      options: [ { value: "0-20", label: "0-20%" }, { value: "21-50", label: "21-50%" }, { value: "51-80", label: "51-80%" }, { value: "81-100", label: "81-100%" } ],
      description: "Eine grobe Schätzung genügt. Diese Angabe hilft uns, schnell erzielbare Erfolge zu erkennen." },
    { key: "automatisierungsgrad", label: "Automatisierungsgrad", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Sehr niedrig" }, { value: "eher_niedrig", label: "Eher niedrig" },
        { value: "mittel", label: "Mittel" }, { value: "eher_hoch", label: "Eher hoch" }, { value: "sehr_hoch", label: "Sehr hoch" }
      ],
      description: "Gemeint ist der Automatisierungsgrad Ihrer gesamten täglichen Abläufe - nicht nur der IT-Prozesse." },
    { key: "ki_einsatz", label: "Wo wird KI bereits eingesetzt?", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / Kundenservice" }, { value: "marketing", label: "Marketing & Content" },
        { value: "vertrieb", label: "Vertrieb & CRM" }, { value: "datenanalyse", label: "Datenanalyse" },
        { value: "produktion", label: "Produktion / Logistik" }, { value: "hr", label: "Personalmanagement" },
        { value: "andere", label: "Andere Bereiche" }, { value: "noch_keine", label: "Noch keine Nutzung" }
      ],
      description: "Falls Sie sich nicht sicher sind, wählen Sie bitte "Noch keine Nutzung"." },
    { key: "ki_kompetenz", label: "KI-Kompetenz im Team", type: "select",
      options: [
        { value: "hoch", label: "Hoch" }, { value: "mittel", label: "Mittel" },
        { value: "niedrig", label: "Niedrig" }, { value: "keine", label: "Keine" }
      ],
      description: "Diese Angabe ist eine Selbsteinschätzung. Sie hilft uns, die Roadmap und Schulungen entsprechend anzupassen." },

    // Block 3: Ziele & Use Cases
    { key: "ki_ziele", label: "Ziele mit KI in den nächsten 3-6 Monaten", type: "checkbox",
      options: [
        { value: "effizienz", label: "Effizienz steigern" }, { value: "automatisierung", label: "Automatisierung" },
        { value: "neue_produkte", label: "Neue Produkte/Services" }, { value: "kundenservice", label: "Kundenservice verbessern" },
        { value: "datenauswertung", label: "Daten besser nutzen" }, { value: "kosten_senken", label: "Kosten senken" },
        { value: "wettbewerbsfaehigkeit", label: "Wettbewerbsfähigkeit" }, { value: "keine_angabe", label: "Noch unklar" }
      ],
      description: "Bitte wählen Sie die Ziele aus, die Sie in den nächsten 3-6 Monaten verfolgen möchten - möglichst konkrete und messbare Vorhaben." },
    { key: "ki_projekte", label: "Laufende/geplante KI-Projekte", type: "textarea", placeholder: "z. B. Chatbot, Angebotsautomation, Generatoren…", description: "Stichpunkte sind vollkommen in Ordnung. Falls vorhanden, erwähnen Sie bitte auch bereits eingesetzte Tools oder Prozesse." },
    { key: "anwendungsfaelle", label: "Interessante Anwendungsfälle", type: "checkbox",
      options: [
        { value: "chatbots", label: "Chatbots / FAQ-Automatisierung" }, { value: "content_generation", label: "Content-Generierung" },
        { value: "datenanalyse", label: "Datenanalyse & Reporting" }, { value: "dokumentation", label: "Dokumentation & Wissen" },
        { value: "prozess_automation", label: "Prozessautomation" }, { value: "personalisierung", label: "Personalisierung" },
        { value: "andere", label: "Andere" }, { value: "keine_angabe", label: "Noch unklar" }
      ],
      description: "Markieren Sie bitte alle Themenbereiche, die Sie besonders interessieren. Wir schlagen Ihnen dazu praxisnahe Einstiegsmöglichkeiten vor." },
    { key: "zeitersparnis_prioritaet", label: "Bereich mit Zeitersparnis-Priorität", type: "textarea",
      placeholder: "z. B. schnelleres Reporting, personalisierte Angebote, Automatisierung …", description: "Überlegen Sie, in welchem Bereich Ihnen eine Zeitersparnis von 10 % am meisten helfen würde. Sie können hier gerne auch Beispiele anführen." },
    { key: "pilot_bereich", label: "Bester Bereich für Pilotprojekt", type: "select",
      options: [
        { value: "kundenservice", label: "Kundenservice" }, { value: "marketing", label: "Marketing / Content" },
        { value: "vertrieb", label: "Vertrieb" }, { value: "verwaltung", label: "Verwaltung / Backoffice" },
        { value: "produktion", label: "Produktion / Logistik" }, { value: "andere", label: "Andere" }
      ],
      description: "Bitte wählen Sie den Bereich, in dem sich ein erstes Pilotprojekt am einfachsten umsetzen lässt." },
    { key: "geschaeftsmodell_evolution", label: "Geschäftsmodell-Idee mit KI", type: "textarea",
      placeholder: "z. B. KI-gestütztes Portal, datenbasierte Services …", description: "Überlegen Sie, wie KI in Ihrem Geschäftsmodell zusätzlichen Mehrwert schaffen könnte (z. B. durch neue Services oder schnellere Abläufe). Ihre Antwort ist rein hypothetisch und bringt keinerlei Verpflichtungen mit sich." },
    { key: "vision_3_jahre", label: "Vision in 3 Jahren", type: "textarea",
      placeholder: "z. B. 80 % Automatisierung, verdoppelter Umsatz …", description: "Formulieren Sie hier gerne eine ambitionierte, aber realistische 3-Jahres-Vision. Diese hilft uns, die strategische Ausrichtung Ihres Unternehmens besser zu verstehen." },

    { key: "strategische_ziele", label: "Konkrete Ziele mit KI", type: "textarea", placeholder: "z. B. Effizienz steigern, neue Produkte, besserer Service", description: "Versuchen Sie, Ihre KI-Ziele mit geschäftlichen Kennzahlen zu verknüpfen - z. B. Bearbeitungszeit um 30 % reduzieren." },
    { key: "massnahmen_komplexitaet", label: "Aufwand für die Einführung", type: "select",
      options: [ { value: "niedrig", label: "Niedrig" }, { value: "mittel", label: "Mittel" }, { value: "hoch", label: "Hoch" }, { value: "unklar", label: "Unklar" } ],
      description: "Diese Angabe hilft uns, den Aufwand für die Einführung von KI besser abzuschätzen. Bitte wählen Sie die Option, die am ehesten zutrifft." },
    { key: "roadmap_vorhanden", label: "KI-Roadmap/Strategie vorhanden?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "teilweise", label: "Teilweise" }, { value: "nein", label: "Nein" } ],
      description: "Falls Sie noch keine KI-Roadmap oder -Strategie haben, ist das völlig in Ordnung - wir zeigen Ihnen dann einen möglichen Einstieg auf." },
    { key: "governance_richtlinien", label: "KI-Governance-Richtlinien vorhanden?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "teilweise", label: "Teilweise" }, { value: "nein", label: "Nein" } ],
      description: "Hier sind Richtlinien zu Datensicherheit, Zugriffsrechten und Modell-Freigaben gemeint. "Nein" ist völlig in Ordnung - wir stellen Ihnen in diesem Fall entsprechende Vorlagen bereit." },
    { key: "change_management", label: "Veränderungsbereitschaft im Team", type: "select",
      options: [
        { value: "sehr_hoch", label: "Sehr hoch" }, { value: "hoch", label: "Hoch" },
        { value: "mittel", label: "Mittel" }, { value: "niedrig", label: "Niedrig" }, { value: "sehr_niedrig", label: "Sehr niedrig" }
      ],
      description: "Dies ist lediglich eine Selbsteinschätzung Ihrer Offenheit für Innovationen - es erfolgt keine Bewertung." },

    // Block 5: Ressourcen & Präferenzen
    { key: "zeitbudget", label: "Zeit pro Woche für KI-Projekte", type: "select",
      options: [ { value: "unter_2", label: "Unter 2 Stunden" }, { value: "2_5", label: "2-5 Stunden" }, { value: "5_10", label: "5-10 Stunden" }, { value: "ueber_10", label: "Über 10 Stunden" } ],
      description: "Bitte schätzen Sie ehrlich ein, wie viel Zeit Sie pro Woche für KI-Projekte aufbringen können. Wir berücksichtigen das, damit unsere Planung in Ihren Kalender passt." },
    { key: "vorhandene_tools", label: "Bereits genutzte Systeme", type: "checkbox",
      options: [
        { value: "crm", label: "CRM-Systeme (HubSpot, Salesforce)" }, { value: "erp", label: "ERP-Systeme (SAP, Odoo)" },
        { value: "projektmanagement", label: "Projektmanagement (Asana, Trello)" }, { value: "marketing_automation", label: "Marketing Automation" },
        { value: "buchhaltung", label: "Buchhaltungssoftware" }, { value: "keine", label: "Keine / andere" }
      ],
      description: "Kreuzen Sie bitte alle Systeme an, die Sie bereits nutzen. So vermeiden wir, Ihnen Lösungen vorzuschlagen, die Sie bereits einsetzen." },
    { key: "regulierte_branche", label: "Regulierte Branche", type: "checkbox",
      options: [
        { value: "gesundheit", label: "Gesundheit & Medizin" }, { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "oeffentlich", label: "Öffentlicher Sektor" }, { value: "recht", label: "Rechtliche Dienstleistungen" }, { value: "keine", label: "Keine dieser Branchen" }
      ],
      description: "Markieren Sie bitte alle Branchen, die auf Ihr Unternehmen zutreffen. Wir werden eventuelle branchenspezifische Anforderungen entsprechend berücksichtigen." },
    { key: "trainings_interessen", label: "Interessante KI-Trainingsthemen", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt Engineering" }, { value: "llm_basics", label: "LLM-Grundlagen" },
        { value: "datenqualitaet_governance", label: "Datenqualität & Governance" }, { value: "automatisierung", label: "Automatisierung & Skripte" },
        { value: "ethik_recht", label: "Ethische & rechtliche Grundlagen" }, { value: "keine", label: "Keine / noch unklar" }
      ],
      description: "Wir empfehlen ein 2-4-stündiges Starter-Training basierend auf Ihrer Auswahl." },
    { key: "vision_prioritaet", label: "Wichtigster Visions-Aspekt", type: "select",
      options: [
        { value: "gpt_services", label: "GPT-basierte Services" }, { value: "kundenservice", label: "Kundenservice verbessern" },
        { value: "datenprodukte", label: "Neue datenbasierte Produkte" }, { value: "prozessautomation", label: "Prozessautomatisierung" },
        { value: "marktfuehrerschaft", label: "Marktführerschaft erreichen" }, { value: "keine_angabe", label: "Keine Angabe" }
      ],
      description: "Bitte wählen Sie den Aspekt Ihrer Vision, den Sie als wichtigsten Hebel betrachten." },

    // Block 6: Rechtliches & Förderung
    { key: "datenschutzbeauftragter", label: "Datenschutzbeauftragter vorhanden?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "teilweise", label: "Teilweise (extern/Planung)" } ],
      description: "Falls Ihr Unternehmen keinen Datenschutzbeauftragten benötigt, wählen Sie bitte "Nein". Wir machen Sie dann darauf aufmerksam, wann ein DSB gegebenenfalls erforderlich ist." },
    { key: "technische_massnahmen", label: "Technische Schutzmaßnahmen", type: "select",
      options: [ { value: "alle", label: "Alle relevanten Maßnahmen" }, { value: "teilweise", label: "Teilweise vorhanden" }, { value: "keine", label: "Noch keine" } ],
      description: "Bitte schätzen Sie den Status Ihrer technischen Sicherheitsmaßnahmen ehrlich ein. Nur so können wir Ihnen schnell wirkende Verbesserungen vorschlagen." },
    { key: "folgenabschaetzung", label: "Datenschutz-Folgenabschätzung (DSFA)", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "teilweise", label: "Teilweise" } ],
      description: "Sollte für Ihren Anwendungsfall eine DSFA sinnvoll oder erforderlich sein, werden wir Sie darauf hinweisen." },
    { key: "meldewege", label: "Meldewege bei Vorfällen", type: "select",
      options: [ { value: "ja", label: "Ja, klar geregelt" }, { value: "teilweise", label: "Teilweise geregelt" }, { value: "nein", label: "Nein" } ],
      description: "Hier geht es darum, ob in Ihrem Unternehmen feste Abläufe für den Umgang mit Sicherheitsvorfällen definiert sind (zum Beispiel klare Meldeketten)." },
    { key: "loeschregeln", label: "Regeln für Datenlöschung/-anonymisierung", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "teilweise", label: "Teilweise" }, { value: "nein", label: "Nein" } ],
      description: "Hier ist gefragt, ob es Regeln zur Aufbewahrung und Löschung bzw. Anonymisierung von Daten gibt. Falls nicht, stellen wir Ihnen einfache Vorlagen zur Verfügung." },
    { key: "ai_act_kenntnis", label: "Kenntnis EU AI Act", type: "select",
      options: [ { value: "sehr_gut", label: "Sehr gut" }, { value: "gut", label: "Gut" }, { value: "gehoert", label: "Schon mal gehört" }, { value: "unbekannt", label: "Noch nicht bekannt" } ],
      description: "Hier sind keine Vorkenntnisse nötig. Wir fassen die relevanten Pflichten des EU AI Act für Sie verständlich zusammen." },
    { key: "ki_hemmnisse", label: "Hemmnisse beim KI-Einsatz", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Rechtsunsicherheit" }, { value: "datenschutz", label: "Datenschutz" }, { value: "knowhow", label: "Fehlendes Know-how" },
        { value: "budget", label: "Begrenztes Budget" }, { value: "teamakzeptanz", label: "Teamakzeptanz" }, { value: "zeitmangel", label: "Zeitmangel" },
        { value: "it_integration", label: "IT-Integration" }, { value: "keine", label: "Keine Hemmnisse" }, { value: "andere", label: "Andere" }
      ],
      description: "Markieren Sie bitte alle Hemmnisse, die Sie sehen. Wir liefern Ihnen dazu pragmatische Lösungen und helfen bei der Priorisierung." },
    { key: "bisherige_foerdermittel", label: "Bereits Fördermittel erhalten?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" } ],
      description: "Diese Information hilft uns, passende Anschluss-Förderprogramme vorzuschlagen." },
    { key: "interesse_foerderung", label: "Interesse an Fördermöglichkeiten", type: "select",
      options: [ { value: "ja", label: "Ja, Programme vorschlagen" }, { value: "nein", label: "Kein Bedarf" }, { value: "unklar", label: "Unklar, bitte beraten" } ],
      description: "Wenn Sie "Unklar" auswählen, prüfen wir unverbindlich, welche Fördermöglichkeiten für Sie infrage kommen." },
    { key: "erfahrung_beratung", label: "Bisherige Beratung zu Digitalisierung/KI", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "unklar", label: "Unklar" } ],
      description: "Diese Angabe hilft uns, auf bereits erfolgter Beratung aufzubauen." },
    { key: "investitionsbudget", label: "Budget für KI/Digitalisierung nächstes Jahr", type: "select",
      options: [ { value: "unter_2000", label: "Unter 2.000 €" }, { value: "2000_10000", label: "2.000-10.000 €" }, { value: "10000_50000", label: "10.000-50.000 €" },
        { value: "ueber_50000", label: "Über 50.000 €" }, { value: "unklar", label: "Noch unklar" } ],
      description: "Auch mit einem kleinen Budget ist ein sinnvoller Start möglich. Wir priorisieren unsere Empfehlungen entsprechend Ihrer Angabe." },
    { key: "marktposition", label: "Marktposition", type: "select",
      options: [ { value: "marktfuehrer", label: "Marktführer" }, { value: "oberes_drittel", label: "Oberes Drittel" }, { value: "mittelfeld", label: "Mittelfeld" },
        { value: "nachzuegler", label: "Nachzügler" }, { value: "unsicher", label: "Schwer einzuschätzen" } ],
      description: "Eine grobe Einschätzung genügt - sie dient nur der Einordnung." },
    { key: "benchmark_wettbewerb", label: "Vergleich mit Wettbewerbern", type: "select",
      options: [ { value: "ja", label: "Ja, regelmäßig" }, { value: "nein", label: "Nein" }, { value: "selten", label: "Selten" } ],
      description: "Hier geht es darum, wie häufig Sie Ihr Unternehmen mit Wettbewerbern vergleichen. Diese Angabe dient lediglich der Einordnung." },
    { key: "innovationsprozess", label: "Wie entstehen Innovationen?", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovationsteam" }, { value: "mitarbeitende", label: "Durch Mitarbeitende" },
        { value: "kunden", label: "Mit Kunden" }, { value: "berater", label: "Externe Berater" },
        { value: "zufall", label: "Zufällig" }, { value: "unbekannt", label: "Keine klare Strategie" }
      ],
      description: "Damit ist gemeint, wie neue Ideen oder Innovationen in Ihrem Unternehmen entstehen. Daraus können wir mögliche Veränderungsansätze ableiten." },
    { key: "risikofreude", label: "Risikofreude bei Innovation (1-5)", type: "slider", min: 1, max: 5, step: 1,
      description: "Geben Sie hier einfach Ihr Bauchgefühl an - das hilft uns, ein angemessenes Einführungstempo zu finden." },

    // Block 7: Datenschutz & Absenden
    { key: "datenschutz", label:
      "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
      type: "privacy",
      description: "Bitte bestätigen Sie abschließend, dass Sie die Datenschutzhinweise zur Kenntnis genommen haben."
    }
  ];

  var blocks = [
    { title: "Firmendaten & Branche", intro: BLOCK_INTRO[0], keys: ["branche", "unternehmensgroesse", "selbststaendig", "bundesland", "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur", "interne_ki_kompetenzen", "datenquellen"] },
    { title: "Status Quo", intro: BLOCK_INTRO[1], keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", "ki_einsatz", "ki_kompetenz"] },
    { title: "Ziele & Use Cases", intro: BLOCK_INTRO[2], keys: ["ki_ziele", "ki_projekte", "anwendungsfaelle", "zeitersparnis_prioritaet", "pilot_bereich", "geschaeftsmodell_evolution", "vision_3_jahre"] },
    { title: "Strategie & Governance", intro: BLOCK_INTRO[3], keys: ["strategische_ziele", "massnahmen_komplexitaet", "roadmap_vorhanden", "governance_richtlinien", "change_management"] },
    { title: "Ressourcen & Präferenzen", intro: BLOCK_INTRO[4], keys: ["zeitbudget", "vorhandene_tools", "regulierte_branche", "trainings_interessen", "vision_prioritaet"] },
    { title: "Rechtliches & Förderung", intro: BLOCK_INTRO[5], keys: ["datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", "meldewege", "loeschregeln", "ai_act_kenntnis", "ki_hemmnisse", "bisherige_foerdermittel", "interesse_foerderung", "erfahrung_beratung", "investitionsbudget", "marktposition", "benchmark_wettbewerb", "innovationsprozess", "risikofreude"] },
    { title: "Datenschutz & Absenden", intro: BLOCK_INTRO[6], keys: ["datenschutz"] }
  ];

  // --------------------------- Render ---------------------------
  function renderStep() {
    var root = document.getElementById("formbuilder");
    if (!root) return;

    var block = blocks[currentBlock];
    var html = "<section class='fb-section'><div class='fb-head'>"
      + "<span class='fb-step'>Schritt " + (currentBlock + 1) + "/" + blocks.length + "</span>"
      + "<h2 class='fb-title'>" + block.title + "</h2></div>"
      + "<p class='section-intro'>" + block.intro + "</p>";

    for (var i=0; i<block.keys.length; i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      html += "<div class='form-group' data-key='" + k + "'><label for='" + f.key + "'>" + f.label + "</label>";
      if (f.description) html += "<div class='guidance'>" + f.description + "</div>";
      html += renderInput(f) + "</div>";
    }

    html += "</section><div id='fb-msg' role='status' aria-live='polite'></div>";

    var nav = "<nav class='form-nav'>";
    if (currentBlock > 0) nav += "<button type='button' class='btn btn-secondary' id='btn-prev'>← Zurück</button>";
    nav += "<button type='button' class='btn btn-secondary' id='btn-reset'>Formular zurücksetzen</button>";
    nav += "<span class='mr-auto'></span>";
    if (currentBlock < blocks.length - 1) nav += "<button type='button' class='btn btn-primary' id='btn-next' disabled>Weiter →</button>";
    else nav += "<button type='button' class='btn btn-primary' id='btn-submit'>Absenden</button>";
    nav += "</nav>";

    root.innerHTML = html + nav;

    // change handler
    root.addEventListener("change", handleChange);

    // autofill & validate
    for (var j=0; j<block.keys.length; j++){
      var field = findField(block.keys[j]); if (!field) continue;
      if (typeof field.showIf === "function" && !field.showIf(formData)) continue;
      fillField(field);
    }

    // listener
    var prev = document.getElementById("btn-prev");
    if (prev) prev.addEventListener("click", function () {
      if (currentBlock > 0) { currentBlock--; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
    });

    var next = document.getElementById("btn-next");
    if (next) {
      next.addEventListener("click", function () {
        var missing = validateCurrentBlock(true); if (missing.length) return;
        if (currentBlock < blocks.length - 1) { currentBlock++; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
      });
      next.disabled = validateCurrentBlock(false).length > 0;
    }

    var reset = document.getElementById("btn-reset");
    if (reset) reset.addEventListener("click", function () {
      if (confirm("Möchten Sie das Formular wirklich zurücksetzen?")) {
        try { localStorage.removeItem(autosaveKey); localStorage.removeItem(stepKey); } catch(_) {}
        formData = {}; currentBlock = 0; saveStep();
        renderStep(); updateProgress(); scrollToStepTop(true);
      }
    });

    var submit = document.getElementById("btn-submit");
    if (submit) submit.addEventListener("click", submitForm);

    updateProgress();
  }

  // --------------------------- Data & Validation ---------------------------
  function handleChange(e) {
    // sichtbare Felder des aktuellen Blocks in formData schreiben
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

    // Conditionals: re-render, damit showIf greift
    if (e && e.target && e.target.id === "unternehmensgroesse") {
      renderStep(); scrollToStepTop(false);
      return;
    }

    var next = document.getElementById("btn-next");
    if (next) next.disabled = validateCurrentBlock(false).length > 0;
  }

  function markInvalid(key, on) {
    var grp = document.querySelector('.form-group[data-key="'+key+'"]');
    if (!grp) return;
    if (on) grp.classList.add("invalid-group"); else grp.classList.remove("invalid-group");
    var input = document.getElementById(key);
    if (input) { if (on) input.classList.add("invalid"); else input.classList.remove("invalid"); }
  }

  function validateCurrentBlock(focusFirst) {
    var optional = {
      "jahresumsatz":1,"it_infrastruktur":1,"interne_ki_kompetenzen":1,"datenquellen":1,
      "zeitbudget":1,"vorhandene_tools":1,"regulierte_branche":1,"trainings_interessen":1,
      "vision_prioritaet":1,"selbststaendig":1,"hauptleistung":0
    };
    var missing = [];
    var block = blocks[currentBlock];

    // reset
    for (var j=0;j<block.keys.length;j++) markInvalid(block.keys[j], false);

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      var val = formData[k];
      var ok = true;
      if (optional[k]) { /* optional */ }
      else if (f.type === "checkbox" && f.options) { ok = Array.isArray(val) && val.length>0; }
      else if (f.type === "privacy") { ok = (val === true); }
      else if (f.type === "select") { ok = !!val && String(val) !== ""; }
      else if (f.type === "slider") { ok = !!val; }
      else { ok = !!val && String(val).trim() !== ""; }

      if (!ok) { missing.push(labelOf(k)); markInvalid(k, true); }
    }

    if (missing.length && focusFirst) {
      var first = document.querySelector(".invalid, .invalid-group");
      if (first && first.scrollIntoView) first.scrollIntoView({behavior:"smooth", block:"center"});
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Bitte korrigieren Sie die markierten Felder."; msg.setAttribute("role","alert"); }
    }
    return missing;
  }

  function updateProgress() { dispatchProgress(currentBlock + 1, blocks.length); }

  // --------------------------- Submit ---------------------------
  function submitForm() {
    // alle Felder einsammeln
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
        if (document.getElementById(f.key)) { formData[k] = collectValue(f);} /* else keep existing */ }
    }
    saveAutosave();

    if (formData.datenschutz !== true) {
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Bitte bestätigen Sie die Datenschutzhinweise."; msg.setAttribute("role","alert"); }
      return;
    }

    var root = document.getElementById("formbuilder");
    if (root) {
      root.innerHTML = '<section class="fb-section"><h2>Vielen Dank für Ihre Angaben!</h2>'
        + '<div class="guidance">Ihre KI-Analyse wird jetzt erstellt. '
        + 'Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E-Mail.</div></section>';
    }

    var token = getToken();
    if (!token) {
      if (root) root.insertAdjacentHTML("beforeend",
        '<div class="guidance important" role="alert">Ihre Sitzung ist abgelaufen. '
        + '<a href="/login.html">Bitte neu anmelden</a>, wenn Sie eine weitere Analyse durchführen möchten.</div>');
      return;
    }

    var data = {}; for (var i=0;i<fields.length;i++){ data[fields[i].key] = formData[fields[i].key]; }
    data.lang = LANG;

    var email = getEmailFromJWT(token); if (email) { data.email = email; data.to = email; }

    var url = getBaseUrl() + SUBMIT_PATH;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(data),
      credentials: "include",
      keepalive: true
    }).then(function (res) {
      if (res && res.status === 401) { try { localStorage.removeItem("jwt"); } catch (e) {} }
      // Autosave bleibt absichtlich erhalten (späteres Editieren möglich).
    }).catch(function(){});
  }

  // --------------------------- Hilfs-Funktionen ---------------------------
  function findField(k) { for (var i=0; i<fields.length; i++) { if (fields[i].key === k) return fields[i]; } return null; }

  function labelOf(k) {
    var f = findField(k);
    return f ? (f.label || k) : k;
  }

  function renderInput(f) {
    if (f.type === "select") {
      var opts = "<option value=''>Bitte wählen...</option>";
      for (var i=0; i<f.options.length; i++){ opts += "<option value='" + f.options[i].value + "'>" + f.options[i].label + "</option>"; }
      return "<select id='" + f.key + "' name='" + f.key + "'>" + opts + "</select>";
    }
    if (f.type === "checkbox") {
      var html = "<div class='checkbox-group'>";
      for (var j=0; j<f.options.length; j++){
        html += "<label class='checkbox-label'><input type='checkbox' name='" + f.key + "' value='" + f.options[j].value + "'><span>" + f.options[j].label + "</span></label>";
      }
      return html + "</div>";
    }
    if (f.type === "textarea") {
      var ph = f.placeholder || "";
      return "<textarea id='" + f.key + "' name='" + f.key + "' placeholder='" + ph + "'></textarea>";
    }
    if (f.type === "privacy") {
      return "<label style='display:flex;gap:12px;align-items:flex-start;'><input type='checkbox' id='" + f.key + "' name='" + f.key + "' style='margin-top:4px;width:18px;height:18px;'><span>" + f.label + "</span></label>";
    }
    if (f.type === "slider") {
      return "<div class='slider-container'><input type='range' id='" + f.key + "' name='" + f.key + "' min='" + f.min + "' max='" + f.max + "' step='" + f.step + "'><span class='slider-value-label' id='" + f.key + "_value'>" + (f.min || 1) + "</span></div>";
    }
    return "<input type='text' id='" + f.key + "' name='" + f.key + "' placeholder='" + (f.placeholder || '') + "'>";
  }

  function fillField(f) {
    var val = formData[f.key];
    if (f.type === "select") {
      var sel = document.getElementById(f.key); if (!sel) return;
      if (val) sel.value = val;
    } else if (f.type === "checkbox") {
      var arr = Array.isArray(val) ? val : [];
      var boxes = document.querySelectorAll("input[name='" + f.key + "']");
      for (var i=0; i<boxes.length; i++){ boxes[i].checked = arr.indexOf(boxes[i].value) !== -1; }
    } else if (f.type === "textarea") {
      var ta = document.getElementById(f.key); if (ta && val) ta.value = val;
    } else if (f.type === "privacy") {
      var cb = document.getElementById(f.key); if (cb) cb.checked = (val === true);
    } else if (f.type === "slider") {
      var slider = document.getElementById(f.key); if (slider) { slider.value = val || f.min || 1; updateSliderLabel(f.key, slider.value); }
      slider.addEventListener("input", function(e){ updateSliderLabel(f.key, e.target.value); });
    } else {
      var inp = document.getElementById(f.key); if (inp && val) inp.value = val;
    }
  }

  function collectValue(f) {
    if (f.type === "select") {
      var sel = document.getElementById(f.key); return sel ? sel.value : "";
    } else if (f.type === "checkbox") {
      var boxes = document.querySelectorAll("input[name='" + f.key + "']:checked"); var arr = [];
      for (var i=0; i<boxes.length; i++) arr.push(boxes[i].value);
      return arr;
    } else if (f.type === "textarea") {
      var ta = document.getElementById(f.key); return ta ? ta.value : "";
    } else if (f.type === "privacy") {
      var cb = document.getElementById(f.key); return cb ? cb.checked : false;
    } else if (f.type === "slider") {
      var slider = document.getElementById(f.key); return slider ? slider.value : "";
    } else {
      var inp = document.getElementById(f.key); return inp ? inp.value : "";
    }
  }

  function updateSliderLabel(key, val) {
    var lbl = document.getElementById(key + "_value");
    if (lbl) lbl.textContent = val;
  }

  // --------------------------- Storage ---------------------------
  var autosaveKey = STORAGE_PREFIX + "data";
  var stepKey = STORAGE_PREFIX + "step";
  var formData = {};
  var currentBlock = 0;

  function saveAutosave() { try { localStorage.setItem(autosaveKey, JSON.stringify(formData)); } catch(_) {} }
  function loadAutosave() { try { var s = localStorage.getItem(autosaveKey); if (s) formData = JSON.parse(s); } catch(_) {} }
  function saveStep() { try { localStorage.setItem(stepKey, String(currentBlock)); } catch(_) {} }
  function loadStep() { try { var s = localStorage.getItem(stepKey); if (s) currentBlock = parseInt(s, 10) || 0; } catch(_) {} }
  function scrollToStepTop(instant) {
    var root = document.getElementById("formbuilder");
    if (root && root.scrollIntoView) root.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }

  // Init
  window.addEventListener("DOMContentLoaded", function(){
    loadAutosave(); loadStep();
    // Sicherstellen, dass Block 0 keys existieren (Initialvalidierung)
    var b0 = blocks[0]; for (var i=0;i<b0.keys.length;i++){ var f=findField(b0.keys[i]); if (f && formData[f.key]===undefined) formData[f.key] = ""; }
    renderStep(); scrollToStepTop(true);
  });
})();
