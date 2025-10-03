/* File: formular/formbuilder_de_SINGLE_FULL.js */
/* Basierend auf deiner vorherigen DE-Datei, jetzt als mehrstufiger Wizard mit Submit nur im letzten Schritt.  */
/* Quelle/Stand der ursprünglichen Struktur: siehe hochgeladene Datei. :contentReference[oaicite:2]{index=2} */
(function () {
  "use strict";

  // --------------------------- Konfiguration ---------------------------
  var LANG = "de";
  var SCHEMA_VERSION = "1.3.0";
  var STORAGE_PREFIX = "autosave_form_";
  var SUBMIT_PATH = "/briefing_async";

  function getBaseUrl() {
    try {
      var meta = document.querySelector('meta[name="api-base"]');
      var v = (meta && meta.content) || (window.API_BASE || "");
      return String(v || "").replace(/\/+$/, "");
    } catch (e) { return ""; }
  }

  function getToken() {
    var keys = ["jwt", "access_token", "id_token", "AUTH_TOKEN", "token"];
    for (var i = 0; i < keys.length; i++) {
      try { var t = localStorage.getItem(keys[i]); if (t) return t; } catch (e) {}
    }
    return null;
  }

  function getEmailFromJWT(token) {
    try {
      if (!token || token.split(".").length !== 3) return null;
      var payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || payload.preferred_username || payload.sub || null;
    } catch (e) { return null; }
  }

  function dispatchProgress(step, total) {
    try {
      document.dispatchEvent(new CustomEvent("fb:progress", { detail: { step: step, total: total } }));
    } catch (_) {}
  }

  // --------------------------- Styles (inject) ---------------------------
  (function injectCSS() { try {
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
      + ".form-nav{position:sticky;bottom:0;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-top:24px;display:flex;justify-content:flex-end;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,.05)}"
      + ".btn{border:0;border-radius:12px;padding:12px 22px;font-size:16px;font-weight:600;cursor:pointer;transition:all .25s ease}"
      + ".btn-primary{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff}"
      + ".btn-secondary{background:#fff;color:#1e293b;border:2px solid #cbd5e1}"
      + ".btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(37,99,235,.3)}"
      + ".btn-secondary:hover{background:#f0f9ff;border-color:#2563eb}"
      + ".slider-container{display:flex;align-items:center;gap:12px}"
      + ".slider-value-label{min-width:48px;padding:8px 12px;background:#dbeafe;border-radius:8px;font-weight:600;color:#1e3a5f;text-align:center}";
    var s = document.createElement("style"); s.type = "text/css"; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  } catch (_) {} })();

  // --------------------------- Inhalte (aus Original übernommen) ---------------------------
  var BLOCK_INTRO = [
    "Hier erfassen wir Basisdaten (Branche, Größe, Standort). Sie steuern die Personalisierung des Reports und die passenden Förder- & Compliance-Hinweise.",
    "Status-Quo zu Prozessen, Daten und bisherigen KI-Erfahrungen. Damit kalibrieren wir Quick Wins und die Start-Roadmap.",
    "Ziele & wichtigste Anwendungsfälle: Was soll KI konkret leisten? Das fokussiert Empfehlungen und priorisiert Maßnahmen.",
    "Strategie & Governance: Grundlagen für nachhaltigen KI-Einsatz und verantwortungsvolle Umsetzung.",
    "Ressourcen & Präferenzen (Zeit, Tool-Affinität, vorhandene Lösungen). So passen wir Empfehlungen an Machbarkeit & Tempo an.",
    "Rechtliches & Förderung: DSGVO, EU AI Act, Fördermöglichkeiten und Compliance-Aspekte für sicheren KI-Einsatz.",
    "Datenschutz & Absenden: Einwilligung bestätigen und den personalisierten Report starten."
  ];

  // --- Felder (1:1 aus deiner Datei, minimal geglättet für Wizard) ---
  var fields = [
    // Block 1: Unternehmensinfos
    { key: "branche", label: "In welcher Branche ist Ihr Unternehmen tätig?", type: "select",
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
      description: "Ihre Hauptbranche beeinflusst Benchmarks, Tool-Empfehlungen und die Auswertung."
    },
    { key: "unternehmensgroesse", label: "Wie groß ist Ihr Unternehmen?", type: "select",
      options: [
        { value: "solo", label: "1 (Solo-Selbstständig/Freiberuflich)" },
        { value: "team", label: "2–10 (Kleines Team)" },
        { value: "kmu", label: "11–100 (KMU)" }
      ],
      description: "Die Unternehmensgröße beeinflusst Empfehlungen und Fördermöglichkeiten."
    },
    { key: "selbststaendig", label: "Unternehmensform bei 1 Person", type: "select",
      options: [
        { value: "freiberufler", label: "Freiberuflich/Selbstständig" },
        { value: "kapitalgesellschaft", label: "1-Personen-Kapitalgesellschaft (GmbH/UG)" },
        { value: "einzelunternehmer", label: "Einzelunternehmer (mit Gewerbe)" },
        { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Bitte wählen Sie die zutreffende Rechtsform.",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "bundesland", label: "Bundesland (regionale Fördermöglichkeiten)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" }, { value: "ni", label: "Niedersachsen" },
        { value: "nw", label: "Nordrhein-Westfalen" }, { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Sachsen" }, { value: "st", label: "Sachsen-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" },
        { value: "th", label: "Thüringen" }
      ],
      description: "Ihr Standort bestimmt verfügbare Fördermittel und Programme."
    },
    { key: "hauptleistung", label: "Was ist Ihre Hauptdienstleistung oder Ihr wichtigstes Produkt?", type: "textarea",
      placeholder: "z.B. Social-Media-Kampagnen, CNC-Fertigung, Steuerberatung",
      description: "Beschreiben Sie Ihre zentrale Leistung möglichst konkret."
    },
    { key: "zielgruppen", label: "Welche Zielgruppen bedienen Sie?", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B (Geschäftskunden)" }, { value: "b2c", label: "B2C (Endverbraucher)" },
        { value: "kmu", label: "KMU" }, { value: "grossunternehmen", label: "Großunternehmen" },
        { value: "selbststaendige", label: "Selbstständige/Freiberufler" }, { value: "oeffentliche_hand", label: "Öffentliche Hand" },
        { value: "privatpersonen", label: "Privatpersonen" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Andere" }
      ],
      description: "Mehrfachauswahl möglich."
    },
    { key: "jahresumsatz", label: "Jahresumsatz (Schätzung)", type: "select",
      options: [
        { value: "unter_100k", label: "Bis 100.000 €" }, { value: "100k_500k", label: "100.000–500.000 €" },
        { value: "500k_2m", label: "500.000–2 Mio. €" }, { value: "2m_10m", label: "2–10 Mio. €" },
        { value: "ueber_10m", label: "Über 10 Mio. €" }, { value: "keine_angabe", label: "Keine Angabe" }
      ],
      description: "Hilft bei Benchmarks und Förderempfehlungen."
    },
    { key: "it_infrastruktur", label: "Wie ist Ihre IT-Infrastruktur organisiert?", type: "select",
      options: [
        { value: "cloud", label: "Cloud-basiert (z.B. Microsoft 365, Google Cloud)" },
        { value: "on_premise", label: "Eigenes Rechenzentrum (On-Premises)" },
        { value: "hybrid", label: "Hybrid (Cloud + eigene Server)" }, { value: "unklar", label: "Unklar / noch offen" }
      ],
      description: "Hilft bei Sicherheits- und Integrationsempfehlungen."
    },
    { key: "interne_ki_kompetenzen", label: "Gibt es ein internes KI-/Digitalisierungsteam?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "in_planung", label: "In Planung" } ],
      description: "Wichtig für Schulungs- und Struktur-Empfehlungen."
    },
    { key: "datenquellen", label: "Welche Datentypen stehen für KI-Projekte zur Verfügung?", type: "checkbox",
      options: [
        { value: "kundendaten", label: "Kundendaten (CRM, Service)" }, { value: "verkaufsdaten", label: "Verkaufs-/Bestelldaten" },
        { value: "produktionsdaten", label: "Produktions-/Betriebsdaten" }, { value: "personaldaten", label: "Personal-/HR-Daten" },
        { value: "marketingdaten", label: "Marketing-/Kampagnendaten" }, { value: "sonstige", label: "Sonstige Datenquellen" }
      ],
      description: "Mehrfachauswahl möglich."
    },

    // Block 2: Status Quo
    { key: "digitalisierungsgrad", label: "Wie digital sind Ihre internen Prozesse? (1–10)", type: "slider", min: 1, max: 10, step: 1,
      description: "1 = hauptsächlich Papier/manuell, 10 = vollständig digital/automatisiert" },
    { key: "prozesse_papierlos", label: "Anteil papierloser Prozesse", type: "select",
      options: [ { value: "0-20", label: "0–20%" }, { value: "21-50", label: "21–50%" }, { value: "51-80", label: "51–80%" }, { value: "81-100", label: "81–100%" } ],
      description: "Grobe Schätzung genügt." },
    { key: "automatisierungsgrad", label: "Automatisierungsgrad", type: "select",
      options: [
        { value: "sehr_niedrig", label: "Sehr niedrig" }, { value: "eher_niedrig", label: "Eher niedrig" },
        { value: "mittel", label: "Mittel" }, { value: "eher_hoch", label: "Eher hoch" }, { value: "sehr_hoch", label: "Sehr hoch" }
      ],
      description: "Wie viel läuft automatisiert vs. manuell?" },
    { key: "ki_einsatz", label: "Wo wird KI bereits eingesetzt?", type: "checkbox",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Vertrieb" }, { value: "buchhaltung", label: "Buchhaltung" },
        { value: "produktion", label: "Produktion" }, { value: "kundenservice", label: "Kundenservice" }, { value: "it", label: "IT" },
        { value: "forschung", label: "Forschung & Entwicklung" }, { value: "personal", label: "Personal" }, { value: "keine", label: "Noch keine Nutzung" },
        { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Alle relevanten Bereiche ankreuzen." },
    { key: "ki_knowhow", label: "KI-Know-how im Team", type: "select",
      options: [
        { value: "keine", label: "Keine Erfahrung" }, { value: "grundkenntnisse", label: "Grundkenntnisse" }, { value: "mittel", label: "Mittel" },
        { value: "fortgeschritten", label: "Fortgeschritten" }, { value: "expertenwissen", label: "Expertenwissen" }
      ],
      description: "Selbsteinschätzung genügt." },

    // Block 3: Ziele & Projekte
    { key: "projektziel", label: "Ziel des nächsten KI-/Digitalisierungsprojekts", type: "checkbox",
      options: [
        { value: "prozessautomatisierung", label: "Prozessautomatisierung" }, { value: "kostensenkung", label: "Kostensenkung" },
        { value: "compliance", label: "Compliance/Datenschutz" }, { value: "produktinnovation", label: "Produktinnovation" },
        { value: "kundenservice", label: "Kundenservice verbessern" }, { value: "markterschliessung", label: "Markterschließung" },
        { value: "personalentlastung", label: "Personalentlastung" }, { value: "foerdermittel", label: "Fördermittel beantragen" }, { value: "andere", label: "Andere" }
      ],
      description: "Mehrfachauswahl möglich." },
    { key: "ki_projekte", label: "Laufende/geplante KI-Projekte", type: "textarea", placeholder: "z.B. Chatbot, Angebotsautomation, Generatoren...", description: "Bitte konkret beschreiben." },
    { key: "ki_usecases", label: "Besonders interessante KI-Use-Cases", type: "checkbox",
      options: [
        { value: "texterstellung", label: "Texterstellung" }, { value: "bildgenerierung", label: "Bildgenerierung" }, { value: "spracherkennung", label: "Spracherkennung" },
        { value: "prozessautomatisierung", label: "Prozessautomatisierung" }, { value: "datenanalyse", label: "Datenanalyse & Prognose" },
        { value: "kundensupport", label: "Kundensupport" }, { value: "wissensmanagement", label: "Wissensmanagement" },
        { value: "marketing", label: "Marketing-Optimierung" }, { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Mehrfachauswahl möglich." },
    { key: "ki_potenzial", label: "Größtes KI-Potenzial im Unternehmen", type: "textarea", placeholder: "z.B. Reporting, personalisierte Angebote, Automatisierung...", description: "Wo sehen Sie das größte Potenzial?" },
    { key: "usecase_priority", label: "Bereich mit höchster Priorität", type: "select",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Vertrieb" }, { value: "buchhaltung", label: "Buchhaltung" },
        { value: "produktion", label: "Produktion" }, { value: "kundenservice", label: "Kundenservice" }, { value: "it", label: "IT" },
        { value: "forschung", label: "Forschung & Entwicklung" }, { value: "personal", label: "Personal" }, { value: "unbekannt", label: "Noch unklar" }
      ],
      description: "Wo lohnt der Einstieg zuerst?" },
    { key: "ki_geschaeftsmodell_vision", label: "Wie kann KI Ihr Geschäftsmodell verändern?", type: "textarea",
      placeholder: "z.B. KI-gestütztes Portal, datenbasierte Plattform...", description: "Ihre langfristige Vision für KI-Transformation." },
    { key: "moonshot", label: "Ihre mutige 3-Jahres-Vision", type: "textarea",
      placeholder: "z.B. 80% Automatisierung, verdoppelter Umsatz...", description: "Denken Sie groß - was wäre ein Durchbruch?" },

    // Block 4: Strategie & Governance
    { key: "strategische_ziele", label: "Konkrete Ziele mit KI", type: "textarea", placeholder: "z.B. Effizienz steigern, neue Produkte, besserer Service", description: "Nennen Sie Ihre strategischen Hauptziele." },
    { key: "datenqualitaet", label: "Qualität Ihrer Daten", type: "select",
      options: [ { value: "hoch", label: "Hoch (vollständig, strukturiert, aktuell)" }, { value: "mittel", label: "Mittel (teilweise strukturiert)" }, { value: "niedrig", label: "Niedrig (unstrukturiert, Lücken)" } ],
      description: "Gut gepflegte Daten sind Basis für KI-Erfolg." },
    { key: "ai_roadmap", label: "KI-Roadmap oder Strategie", type: "select",
      options: [ { value: "ja", label: "Ja - implementiert" }, { value: "in_planung", label: "In Planung" }, { value: "nein", label: "Noch nicht vorhanden" } ],
      description: "Eine klare Roadmap erleichtert die Umsetzung." },
    { key: "governance", label: "Richtlinien für Daten-/KI-Governance", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "teilweise", label: "Teilweise" }, { value: "nein", label: "Nein" } ],
      description: "Governance fördert verantwortungsvolle Projekte." },
    { key: "innovationskultur", label: "Offenheit für Innovationen", type: "select",
      options: [
        { value: "sehr_offen", label: "Sehr offen" }, { value: "eher_offen", label: "Eher offen" }, { value: "neutral", label: "Neutral" },
        { value: "eher_zurueckhaltend", label: "Eher zurückhaltend" }, { value: "sehr_zurueckhaltend", label: "Sehr zurückhaltend" }
      ],
      description: "Innovationsfreundliche Kultur erleichtert KI-Einführung." },

    // Block 5: Ressourcen & Präferenzen
    { key: "zeitbudget", label: "Zeit pro Woche für KI-Projekte", type: "select",
      options: [ { value: "unter_2", label: "Unter 2 Stunden" }, { value: "2_5", label: "2–5 Stunden" }, { value: "5_10", label: "5–10 Stunden" }, { value: "ueber_10", label: "Über 10 Stunden" } ],
      description: "Hilft, Empfehlungen an verfügbare Zeit anzupassen." },
    { key: "vorhandene_tools", label: "Bereits genutzte Systeme", type: "checkbox",
      options: [
        { value: "crm", label: "CRM-Systeme (HubSpot, Salesforce)" }, { value: "erp", label: "ERP-Systeme (SAP, Odoo)" },
        { value: "projektmanagement", label: "Projektmanagement (Asana, Trello)" }, { value: "marketing_automation", label: "Marketing Automation" },
        { value: "buchhaltung", label: "Buchhaltungssoftware" }, { value: "keine", label: "Keine / andere" }
      ],
      description: "Mehrfachauswahl - hilft bei Integrationsempfehlungen." },
    { key: "regulierte_branche", label: "Regulierte Branche", type: "checkbox",
      options: [
        { value: "gesundheit", label: "Gesundheit & Medizin" }, { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "oeffentlich", label: "Öffentlicher Sektor" }, { value: "recht", label: "Rechtliche Dienstleistungen" }, { value: "keine", label: "Keine dieser Branchen" }
      ],
      description: "Regulierte Branchen brauchen besondere Compliance." },
    { key: "trainings_interessen", label: "Interessante KI-Trainingsthemen", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt Engineering" }, { value: "llm_basics", label: "LLM-Grundlagen" },
        { value: "datenqualitaet_governance", label: "Datenqualität & Governance" }, { value: "automatisierung", label: "Automatisierung & Skripte" },
        { value: "ethik_recht", label: "Ethische & rechtliche Grundlagen" }, { value: "keine", label: "Keine / noch unklar" }
      ],
      description: "Hilft bei Schulungsempfehlungen." },
    { key: "vision_prioritaet", label: "Wichtigster Visions-Aspekt", type: "select",
      options: [
        { value: "gpt_services", label: "GPT-basierte Services" }, { value: "kundenservice", label: "Kundenservice verbessern" },
        { value: "datenprodukte", label: "Neue datenbasierte Produkte" }, { value: "prozessautomation", label: "Prozessautomatisierung" },
        { value: "marktfuehrerschaft", label: "Marktführerschaft erreichen" }, { value: "keine_angabe", label: "Keine Angabe" }
      ],
      description: "Hilft, Empfehlungen zu priorisieren." },

    // Block 6: Rechtliches & Förderung
    { key: "datenschutzbeauftragter", label: "Datenschutzbeauftragter vorhanden?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "teilweise", label: "Teilweise (extern/Planung)" } ],
      description: "Oft Pflicht - intern oder extern." },
    { key: "technische_massnahmen", label: "Technische Schutzmaßnahmen", type: "select",
      options: [ { value: "alle", label: "Alle relevanten Maßnahmen" }, { value: "teilweise", label: "Teilweise vorhanden" }, { value: "keine", label: "Noch keine" } ],
      description: "Firewalls, Backups, Zugangsbeschränkungen etc." },
    { key: "folgenabschaetzung", label: "Datenschutz-Folgenabschätzung (DSFA)", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "teilweise", label: "Teilweise" } ],
      description: "Für viele KI-Anwendungen unter DSGVO erforderlich." },
    { key: "meldewege", label: "Meldewege bei Vorfällen", type: "select",
      options: [ { value: "ja", label: "Ja, klar geregelt" }, { value: "teilweise", label: "Teilweise geregelt" }, { value: "nein", label: "Nein" } ],
      description: "Schnelle Reaktion auf Datenschutzverstöße." },
    { key: "loeschregeln", label: "Regeln für Datenlöschung/-anonymisierung", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "teilweise", label: "Teilweise" }, { value: "nein", label: "Nein" } ],
      description: "Wichtig für KI-Compliance und DSGVO." },
    { key: "ai_act_kenntnis", label: "Kenntnis EU AI Act", type: "select",
      options: [ { value: "sehr_gut", label: "Sehr gut" }, { value: "gut", label: "Gut" }, { value: "gehoert", label: "Schon mal gehört" }, { value: "unbekannt", label: "Noch nicht bekannt" } ],
      description: "Der EU AI Act bringt neue Pflichten." },
    { key: "ki_hemmnisse", label: "Hemmnisse beim KI-Einsatz", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Rechtsunsicherheit" }, { value: "datenschutz", label: "Datenschutz" }, { value: "knowhow", label: "Fehlendes Know-how" },
        { value: "budget", label: "Begrenztes Budget" }, { value: "teamakzeptanz", label: "Teamakzeptanz" }, { value: "zeitmangel", label: "Zeitmangel" },
        { value: "it_integration", label: "IT-Integration" }, { value: "keine", label: "Keine Hemmnisse" }, { value: "andere", label: "Andere" }
      ],
      description: "Alle zutreffenden auswählen." },
    { key: "bisherige_foerdermittel", label: "Bereits Fördermittel erhalten?", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" } ],
      description: "Für Digitalisierungs-/KI-Projekte." },
    { key: "interesse_foerderung", label: "Interesse an Fördermöglichkeiten", type: "select",
      options: [ { value: "ja", label: "Ja, Programme vorschlagen" }, { value: "nein", label: "Kein Bedarf" }, { value: "unklar", label: "Unklar, bitte beraten" } ],
      description: "Wir filtern passende Optionen." },
    { key: "erfahrung_beratung", label: "Bisherige Beratung zu Digitalisierung/KI", type: "select",
      options: [ { value: "ja", label: "Ja" }, { value: "nein", label: "Nein" }, { value: "unklar", label: "Unklar" } ],
      description: "Externe Beratung stärkt Ihre Position." },
    { key: "investitionsbudget", label: "Budget für KI/Digitalisierung nächstes Jahr", type: "select",
      options: [ { value: "unter_2000", label: "Unter 2.000 €" }, { value: "2000_10000", label: "2.000–10.000 €" }, { value: "10000_50000", label: "10.000–50.000 €" },
        { value: "ueber_50000", label: "Über 50.000 €" }, { value: "unklar", label: "Noch unklar" } ],
      description: "Auch kleine Budgets können Fortschritt bringen." },
    { key: "marktposition", label: "Marktposition", type: "select",
      options: [ { value: "marktfuehrer", label: "Marktführer" }, { value: "oberes_drittel", label: "Oberes Drittel" }, { value: "mittelfeld", label: "Mittelfeld" },
        { value: "nachzuegler", label: "Nachzügler" }, { value: "unsicher", label: "Schwer einzuschätzen" } ],
      description: "Hilft bei der Einordnung Ihrer Ergebnisse." },
    { key: "benchmark_wettbewerb", label: "Vergleich mit Wettbewerbern", type: "select",
      options: [ { value: "ja", label: "Ja, regelmäßig" }, { value: "nein", label: "Nein" }, { value: "selten", label: "Selten" } ],
      description: "Benchmarks helfen, Chancen zu identifizieren." },
    { key: "innovationsprozess", label: "Wie entstehen Innovationen?", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovationsteam" }, { value: "mitarbeitende", label: "Durch Mitarbeitende" },
        { value: "kunden", label: "Mit Kunden" }, { value: "berater", label: "Externe Berater" },
        { value: "zufall", label: "Zufällig" }, { value: "unbekannt", label: "Keine klare Strategie" }
      ],
      description: "Strukturierte Wege erleichtern KI-Einsatz." },
    { key: "risikofreude", label: "Risikofreude bei Innovation (1–5)", type: "slider", min: 1, max: 5, step: 1,
      description: "1 = sicherheitsorientiert, 5 = sehr mutig" },

    // Block 7: Datenschutz & Absenden
    { key: "datenschutz", label:
      "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
      type: "privacy",
      description: "Bitte bestätigen Sie die Kenntnisnahme der Datenschutzhinweise."
    }
  ];

  var blocks = [
    { name: "Unternehmensinfos", keys: ["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
    { name: "Status Quo", keys: ["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
    { name: "Ziele & Projekte", keys: ["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
    { name: "Strategie & Governance", keys: ["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
    { name: "Ressourcen & Präferenzen", keys: ["zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"] },
    { name: "Rechtliches & Förderung", keys: ["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
    { name: "Datenschutz & Absenden", keys: ["datenschutz"] }
  ];

  // --------------------------- State ---------------------------
  var currentBlock = 0;
  var formData = {};
  var autosaveKey = (function () {
    try {
      var t = getToken(); var e = getEmailFromJWT(t);
      return (e ? (STORAGE_PREFIX + e) : (STORAGE_PREFIX + "test")) + ":" + LANG;
    } catch (e) { return STORAGE_PREFIX + "test:" + LANG; }
  })();

  function loadAutosave() {
    try { formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); } catch (e) { formData = {}; }
  }
  function saveAutosave() {
    try { localStorage.setItem(autosaveKey, JSON.stringify(formData)); } catch (e) {}
  }

  // --------------------------- Rendering ---------------------------
  function findField(key) { for (var i=0;i<fields.length;i++) if (fields[i].key===key) return fields[i]; return null; }
  function labelOf(key) { var f=findField(key); return (f && f.label) || key; }

  function renderField(f) {
    var v = formData[f.key];
    var guidance = f.description ? '<div class="guidance'+(f.type==="privacy"?" important":"")+'">'+f.description+'</div>' : "";
    var html = "";
    if (f.type === "select") {
      var opts = '<option value="">Bitte wählen…</option>';
      for (var i=0;i<(f.options||[]).length;i++){
        var o=f.options[i]; var sel = (String(v||"")===String(o.value))?' selected':'';
        opts += '<option value="'+o.value+'"'+sel+'>'+o.label+'</option>';
      }
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<select id="'+f.key+'" name="'+f.key+'">'+opts+'</select>';
    } else if (f.type === "textarea") {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<textarea id="'+f.key+'" name="'+f.key+'" placeholder="'+(f.placeholder||"")+'">'+(v||"")+'</textarea>';
    } else if (f.type === "checkbox" && f.options) {
      var items = "";
      var arr = Array.isArray(v)?v:[];
      for (var j=0;j<(f.options||[]).length;j++){
        var c=f.options[j]; var checked = (arr.indexOf(c.value)!==-1)?' checked':'';
        items += '<label class="checkbox-label"><input type="checkbox" name="'+f.key+'" value="'+c.value+'"'+checked+'><span>'+c.label+'</span></label>';
      }
      html = '<label><b>'+f.label+'</b></label>'+guidance+'<div class="checkbox-group">'+items+'</div>';
    } else if (f.type === "slider") {
      var val = (v!=null?v:(f.min||1));
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<div class="slider-container"><input type="range" id="'+f.key+'" name="'+f.key+'" min="'+(f.min||1)+'" max="'+(f.max||10)+'" step="'+(f.step||1)+'" value="'+val+'" oninput="this.parentElement.querySelector(\'.slider-value-label\').innerText=this.value"><span class="slider-value-label">'+val+'</span></div>';
    } else if (f.type === "privacy") {
      var chk = (v===true)?' checked':'';
      html = '<div class="guidance important">'+(f.description||"")+'</div>'+
             '<label class="checkbox-label"><input type="checkbox" id="'+f.key+'" name="'+f.key+'"'+chk+' required><span>'+f.label+'</span></label>';
    } else {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<input type="text" id="'+f.key+'" name="'+f.key+'" value="'+(v||"")+'">';
    }
    return '<div class="form-group" data-key="'+f.key+'">'+html+'</div>';
  }

  function renderStep() {
    var root = document.getElementById("formbuilder");
    if (!root) return;

    var block = blocks[currentBlock];
    var intro = BLOCK_INTRO[currentBlock] || "";
    var html = '<section class="fb-section">'
             +   '<div class="fb-head"><span class="fb-step">Schritt '+(currentBlock+1)+'/'+blocks.length+'</span>'
             +   '<span class="fb-title">'+block.name+'</span></div>'
             +   (intro ? '<div class="section-intro">'+intro+'</div>' : '');

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      html += renderField(f);
    }

    html += '</section><div class="form-nav">'
         +  '<button type="button" class="btn btn-secondary" id="btn-back" '+(currentBlock===0?'disabled':'')+'>Zurück</button>'
         +  (currentBlock < blocks.length-1
              ? '<button type="button" class="btn btn-primary" id="btn-next">Weiter</button>'
              : '<button type="button" class="btn btn-primary" id="btn-submit">Absenden</button>')
         +  '</div>'
         +  '<div id="fb-msg" aria-live="polite"></div>';

    root.innerHTML = html;

    // Events der Step-Ansicht
    root.addEventListener("change", handleChange);
    root.addEventListener("input", handleChange);

    root.addEventListener("keydown", function (ev) {
      var isEnter = (ev.key === "Enter" || ev.keyCode === 13);
      var tag = (ev.target && ev.target.tagName) ? ev.target.tagName.toUpperCase() : "";
      if (isEnter && tag !== "TEXTAREA" && currentBlock < blocks.length - 1) { ev.preventDefault(); }
    });

    var back = document.getElementById("btn-back");
    if (back) back.addEventListener("click", function () { if (currentBlock>0) { currentBlock--; renderStep(); updateProgress(); } });

    var next = document.getElementById("btn-next");
    if (next) {
      next.addEventListener("click", function () {
        var missing = validateCurrentBlock(true);
        if (missing.length === 0 && currentBlock < blocks.length-1) { currentBlock++; renderStep(); updateProgress(); }
      });
      // Direkt initial validieren, um Button ggf. zu deaktivieren
      next.disabled = validateCurrentBlock(false).length > 0;
    }

    var submit = document.getElementById("btn-submit");
    if (submit) submit.addEventListener("click", submitForm);

    updateProgress();
  }

  // --------------------------- Data & Validation ---------------------------
  function collectValue(f) {
    if (f.type === "checkbox" && f.options) {
      var nodes = document.querySelectorAll('input[name="'+f.key+'"]:checked');
      var arr = []; for (var i=0;i<nodes.length;i++) arr.push(nodes[i].value);
      return arr;
    } else if (f.type === "slider") {
      var el = document.getElementById(f.key); return el ? el.value : (f.min || 1);
    } else if (f.type === "privacy") {
      var ch = document.getElementById(f.key); return ch ? !!ch.checked : false;
    } else {
      var inp = document.getElementById(f.key); return inp ? inp.value : "";
    }
  }

  function handleChange(e) {
    // Schreibe alle sichtbaren Felder des aktuellen Blocks in formData
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

    // Sonderfall: selbststaendig eingeblendet/ausgeblendet
    if (e && e.target && e.target.id === "unternehmensgroesse") {
      renderStep(); // re-render für showIf
      return;
    }

    // „Weiter“ Button aktivieren/deaktivieren
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

  // Validierung nur für den aktuellen Block (Pflichtfelder heuristisch)
  function validateCurrentBlock(focusFirst) {
    var optional = {
      // optional analog zu deiner ursprünglichen Datei
      "jahresumsatz":1,"it_infrastruktur":1,"interne_ki_kompetenzen":1,"datenquellen":1,
      "zeitbudget":1,"vorhandene_tools":1,"regulierte_branche":1,"trainings_interessen":1,
      "vision_prioritaet":1,"selbststaendig":1,"hauptleistung":0 // kann leer sein, ist aber hilfreich
    };
    var missing = [];
    var block = blocks[currentBlock];

    // Zurücksetzen
    for (var j=0;j<block.keys.length;j++) markInvalid(block.keys[j], false);

    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i];
      var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;

      var val = formData[k];
      var ok = true;
      if (optional[k]) { /* optional: keine Pflicht */ }
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
    // Final alle Felder einsammeln
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
        formData[k] = collectValue(f);
      }
    }
    saveAutosave();

    // Pflicht-Checkbox Datenschutz
    if (formData.datenschutz !== true) {
      var msg = document.getElementById("fb-msg");
      if (msg) { msg.textContent = "Bitte bestätigen Sie die Datenschutzhinweise."; msg.setAttribute("role","alert"); }
      return;
    }

    // Erfolgsbildschirm sofort anzeigen (UX)
    var root = document.getElementById("formbuilder");
    if (root) {
      root.innerHTML = '<section class="fb-section"><h2>Vielen Dank für Ihre Angaben!</h2>'
        + '<div class="guidance">Ihre KI-Analyse wird jetzt erstellt. '
        + 'Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E‑Mail.</div></section>';
    }

    // Call Backend
    var token = getToken();
    if (!token) {
      if (root) {
        root.insertAdjacentHTML("beforeend",
          '<div class="guidance important" role="alert">Ihre Sitzung ist abgelaufen. '
          + '<a href="/login.html">Bitte neu anmelden</a>, wenn Sie eine weitere Analyse durchführen möchten.</div>');
      }
      return;
    }

    var data = {};
    for (var i=0;i<fields.length;i++){ data[fields[i].key] = formData[fields[i].key]; }
    data.lang = LANG;

    var email = getEmailFromJWT(token);
    if (email) { data.email = email; data.to = email; }

    var url = getBaseUrl() + SUBMIT_PATH;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(data),
      credentials: "include",
      keepalive: true
    }).then(function (res) {
      if (res && res.status === 401) { try { localStorage.removeItem("jwt"); } catch (e) {} }
      // nach Erfolg lokale Daten entfernen
      try { localStorage.removeItem(autosaveKey); } catch (e) {}
    }).catch(function () {
      // Fehler still – Backend sendet E-Mail asynchron
    });
  }

  // --------------------------- Init ---------------------------
  window.addEventListener("DOMContentLoaded", function () {
    loadAutosave();
    // initial: sichtbare Felder (Block 0) für Validierung in formData ablegen
    var b0 = blocks[0];
    for (var i=0;i<b0.keys.length;i++){ var f = findField(b0.keys[i]); if (f) formData[f.key] = formData[f.key] || ""; }
    renderStep();
  });
})();
