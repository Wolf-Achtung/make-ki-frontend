/* filename: formbuilder_de_SINGLE_FULL.js */
/* Multi-Step Wizard (DE) – Gold-Standard+
   - Vollständige Felder (Branche/Hauptleistung/Größe/Bundesland …)
   - Autosave + Resume, A11y, Sticky-Navigation, per-Step-Validierung
   - Sanity-Check: meldet fehlende Felder/Block-Keys in der Konsole
   - Submit nur im letzten Schritt → POST /briefing_async
*/
(function () {
  "use strict";

  var LANG = "de";
  var SCHEMA_VERSION = "1.5.2";
  var STORAGE_PREFIX = "autosave_form_";
  var SUBMIT_PATH = "/briefing_async";

  /* ---------- Helpers: API-Base, Token, Email ---------- */
  function getBaseUrl() {
    try {
      var meta = document.querySelector('meta[name="api-base"]');
      var v = (meta && meta.content) || (window.API_BASE || "");
      return String(v || "").replace(/\/+$/, "");
    } catch (e) { return ""; }
  }
  function getToken() {
    var keys = ["jwt", "access_token", "id_token", "AUTH_TOKEN", "token"];
    for (var i = 0; i < keys.length; i++) { try { var t = localStorage.getItem(keys[i]); if (t) return t; } catch (e) {} }
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
    try { document.dispatchEvent(new CustomEvent("fb:progress", { detail: { step: step, total: total } })); } catch (_) {}
  }

  /* ---------- Styles ---------- */
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
      + ".slider-value-label{min-width:48px;padding:8px 12px;background:#dbeafe;border-radius:8px;font-weight:600;color:#1e3a5f;text-align:center}"
      + "#fb-msg{margin-top:10px;color:#dc2626;font-weight:600}";
    var s=document.createElement("style"); s.type="text/css"; s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
  }catch(_){}})();

  /* ---------- Intro-Texte ---------- */
  var BLOCK_INTRO = [
    "Basisdaten (Branche, Größe, Standort). Wir personalisieren Report, Beispiele und Förderung.",
    "Status Quo: Prozesse, Daten & bisherige KI-Nutzung – damit wir schnelle Quick Wins finden.",
    "Ziele & Use-Cases – wir fokussieren messbare Maßnahmen (3–6 Monate).",
    "Strategie & Governance – pragmatische Leitplanken ohne Overhead.",
    "Ressourcen/Präferenzen – Empfehlungen passend zu Budget und Tempo.",
    "Rechtliches & Förderung – DSGVO, EU AI Act, Programme.",
    "Datenschutz & Absenden – Einwilligung bestätigen, Analyse starten."
  ];

  /* ---------- Felder (vollständig) ---------- */
  var fields = [
    /* — Unternehmen / Basis — */
    { key: "branche", label: "In welcher Branche ist Ihr Unternehmen tätig?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & Werbung" },
        { value: "beratung", label: "Beratung & Dienstleistungen" },
        { value: "it", label: "IT & Software" },
        { value: "finanzen", label: "Finanzen & Versicherungen" },
        { value: "handel", label: "Handel & E‑Commerce" },
        { value: "bildung", label: "Bildung" },
        { value: "verwaltung", label: "Verwaltung" },
        { value: "gesundheit", label: "Gesundheit & Pflege" },
        { value: "bau", label: "Bauwesen & Architektur" },
        { value: "medien", label: "Medien & Kreativwirtschaft" },
        { value: "industrie", label: "Industrie & Produktion" },
        { value: "logistik", label: "Transport & Logistik" }
      ],
      description: "Wählen Sie die Richtung, die am besten passt. Wir nutzen diese Info für Beispiele, Tools und Förder-/Compliance-Hinweise."
    },
    { key: "unternehmensgroesse", label: "Firmengröße", type: "select",
      options: [
        { value: "solo", label: "1 (Solo/Freiberuflich)" },
        { value: "team", label: "2–10 (Kleines Team)" },
        { value: "kmu", label: "11–100 (KMU)" }
      ],
      description: "Eine grobe Schätzung genügt – hilft bei realistischen Empfehlungen und Förderoptionen."
    },
    { key: "selbststaendig", label: "Rechtsform (nur bei Solo)", type: "select",
      options: [
        { value: "freiberufler", label: "Freiberufler" },
        { value: "kapitalgesellschaft", label: "Ein-Personen-Kapitalgesellschaft (UG/GmbH/Ltd.)" },
        { value: "einzelunternehmer", label: "Einzelunternehmer (Gewerbe)" },
        { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Nur relevant bei Größe = 1.",
      showIf: function (data) { return data.unternehmensgroesse === "solo"; }
    },
    { key: "bundesland", label: "Bundesland / Region (Förderprogramme)", type: "select",
      options: [
        { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" }, { value: "be", label: "Berlin" },
        { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" },
        { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" }, { value: "ni", label: "Niedersachsen" },
        { value: "nw", label: "Nordrhein-Westfalen" }, { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" },
        { value: "sn", label: "Sachsen" }, { value: "st", label: "Sachsen-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thüringen" }
      ],
      description: "Hauptstandort – wir filtern regionale Förderprogramme."
    },
    { key: "hauptleistung", label: "Was ist Ihre Hauptdienstleistung oder Ihr wichtigstes Produkt?", type: "textarea",
      placeholder: "z. B. Social-Media-Kampagnen, CNC-Fertigung, Steuerberatung für Startups",
      description: "1–2 Sätze genügen. Wenn es mehrere Leistungen gibt, nennen Sie bitte die wichtigste."
    },
    { key: "zielgruppen", label: "Zielgruppen", type: "checkbox",
      options: [
        { value: "b2b", label: "B2B" }, { value: "b2c", label: "B2C" }, { value: "kmu", label: "KMU" }, { value: "grossunternehmen", label: "Großunternehmen" },
        { value: "selbststaendige", label: "Selbstständige/Freiberufler" }, { value: "oeffentliche_hand", label: "Öffentliche Hand" },
        { value: "privatpersonen", label: "Privatpersonen" }, { value: "startups", label: "Startups" }, { value: "andere", label: "Andere" }
      ],
      description: "Mehrfachauswahl möglich – hilft bei passenden Beispielen."
    },
    { key: "jahresumsatz", label: "Jahresumsatz (grobe Einordnung)", type: "select",
      options: [
        { value: "unter_100k", label: "bis 100.000 €" }, { value: "100k_500k", label: "100.000–500.000 €" },
        { value: "500k_2m", label: "500.000–2 Mio. €" }, { value: "2m_10m", label: "2–10 Mio. €" },
        { value: "ueber_10m", label: "über 10 Mio. €" }, { value: "keine_angabe", label: "keine Angabe" }
      ],
      description: "Nur zur Kalibrierung von Benchmarks & Förderung – nichts wird veröffentlicht."
    },

    /* — optional: kurze System-/Daten-Infos — */
    { key: "it_infrastruktur", label: "IT-Infrastruktur (kurz)", type: "textarea",
      placeholder: "z. B. Microsoft 365, Google Workspace, On-Prem-ERP, Cloud-CRM …",
      description: "Optional – hilft, Tool-Empfehlungen zu präzisieren." },
    { key: "interne_ki_kompetenzen", label: "Interne KI-Kompetenzen", type: "textarea",
      placeholder: "z. B. Prompt-Know-how, Python/R, Automatisierungen, DataOps …",
      description: "Optional – Rollen/Skill-Level, falls vorhanden." },
    { key: "datenquellen", label: "Wichtige Datenquellen", type: "textarea",
      placeholder: "z. B. CRM, ERP, Support-Tickets, DMS, Web-Analytics …",
      description: "Optional – für realistische Quick-Wins/Use-Cases." },

    /* — Status Quo — */
    { key: "digitalisierungsgrad", label: "Wie digital sind Ihre Prozesse? (1–10)", type: "slider", min: 1, max: 10, step: 1,
      description: "Gefühl: 1 = viel Papier, 10 = weitgehend automatisiert." },
    { key: "prozesse_papierlos", label: "Anteil papierloser Prozesse", type: "select",
      options: [ { value: "0-20", label: "0–20 %" }, { value: "21-50", label: "21–50 %" }, { value: "51-80", label: "51–80 %" }, { value: "81-100", label: "81–100 %" } ],
      description: "Schätzung genügt – hilft, Quick Wins zu identifizieren." },
    { key: "automatisierungsgrad", label: "Automatisierungsgrad", type: "select",
      options: [
        { value: "sehr_niedrig", label: "sehr niedrig" }, { value: "eher_niedrig", label: "eher niedrig" }, { value: "mittel", label: "mittel" },
        { value: "eher_hoch", label: "eher hoch" }, { value: "sehr_hoch", label: "sehr hoch" }
      ],
      description: "Bezieht sich auf Arbeitsabläufe insgesamt (nicht nur IT)." },
    { key: "ki_einsatz", label: "Wo wird KI heute genutzt?", type: "checkbox",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Vertrieb" }, { value: "buchhaltung", label: "Buchhaltung" },
        { value: "produktion", label: "Produktion/Betrieb" }, { value: "kundenservice", label: "Kundenservice" }, { value: "it", label: "IT" },
        { value: "forschung", label: "Forschung/Entwicklung" }, { value: "personal", label: "Personal/HR" }, { value: "keine", label: "Noch kein Einsatz" }, { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Wenn unsicher: „Noch kein Einsatz“ auswählen." },
    { key: "ki_knowhow", label: "KI‑Know-how im Team", type: "select",
      options: [
        { value: "keine", label: "keine" }, { value: "grundkenntnisse", label: "Grundkenntnisse" }, { value: "mittel", label: "mittel" },
        { value: "fortgeschritten", label: "fortgeschritten" }, { value: "expertenwissen", label: "Expertenwissen" }
      ],
      description: "Selbsteinschätzung – Roadmap/Training wird angepasst." },

    /* — Ziele & Projekte — */
    { key: "projektziel", label: "Primäre Ziele (nächste 3–6 Monate)", type: "checkbox",
      options: [
        { value: "prozessautomatisierung", label: "Prozessautomatisierung" }, { value: "kostensenkung", label: "Kostensenkung" },
        { value: "compliance", label: "Compliance/Datenschutz" }, { value: "produktinnovation", label: "Produkt-/Service-Innovation" },
        { value: "kundenservice", label: "Kundenservice verbessern" }, { value: "markterschliessung", label: "Neue Märkte" },
        { value: "personalentlastung", label: "Team entlasten" }, { value: "foerdermittel", label: "Fördermittel beantragen" }, { value: "andere", label: "Andere" }
      ],
      description: "Bitte realistische Ziele mit messbaren Ergebnissen wählen." },
    { key: "ki_projekte", label: "Aktuelle/geplante KI‑Projekte", type: "textarea",
      placeholder: "z. B. Chatbot, Angebotsautomatisierung, Generatoren …",
      description: "Stichpunkte reichen. Tools/Prozesse nennen, falls relevant." },
    { key: "ki_usecases", label: "Interessante KI‑Use-Cases", type: "checkbox",
      options: [
        { value: "texterstellung", label: "Texterstellung" }, { value: "bildgenerierung", label: "Bildgenerierung" }, { value: "spracherkennung", label: "Spracherkennung" },
        { value: "prozessautomatisierung", label: "Prozessautomatisierung" }, { value: "datenanalyse", label: "Datenanalyse/Forecasting" },
        { value: "kundensupport", label: "Kundensupport" }, { value: "wissensmanagement", label: "Wissensmanagement" },
        { value: "marketing", label: "Marketing-Optimierung" }, { value: "sonstiges", label: "Sonstiges" }
      ],
      description: "Markieren Sie Bereiche mit größtem Alltagsnutzen." },
    { key: "ki_potenzial", label: "Wo liegt das größte KI‑Potenzial?", type: "textarea",
      placeholder: "z. B. schnellere Reports, personalisierte Angebote, Automatisierung …",
      description: "Wo würden 10 % Zeitersparnis am meisten helfen?" },
    { key: "usecase_priority", label: "Höchste Priorität", type: "select",
      options: [
        { value: "marketing", label: "Marketing" }, { value: "vertrieb", label: "Vertrieb" }, { value: "buchhaltung", label: "Buchhaltung" },
        { value: "produktion", label: "Produktion/Betrieb" }, { value: "kundenservice", label: "Kundenservice" }, { value: "it", label: "IT" },
        { value: "forschung", label: "F&E" }, { value: "personal", label: "HR" }, { value: "unbekannt", label: "Noch unklar" }
      ],
      description: "Wählen Sie den leichtesten Startpunkt für einen Piloten." },
    { key: "ki_geschaeftsmodell_vision", label: "Wie könnte KI Ihr Geschäftsmodell verändern?", type: "textarea",
      placeholder: "z. B. KI‑Portal, datengetriebene Services …", description: "Wo entsteht Mehrwert (neue Services, schnellere Lieferung)?" },
    { key: "moonshot", label: "Ihre ambitionierte 3‑Jahres‑Vision", type: "textarea",
      placeholder: "z. B. 80 % Automatisierung, doppelter Umsatz …", description: "Ambitioniert aber realistisch – hilft bei Priorisierung." },

    /* — Strategie & Governance — */
    { key: "strategische_ziele", label: "Konkrete Ziele mit KI", type: "textarea",
      placeholder: "z. B. Effizienz, neue Produkte, besserer Service",
      description: "An GeschäftskPIs koppeln (z. B. −30 % Bearbeitungszeit)." },
    { key: "datenqualitaet", label: "Datenqualität", type: "select",
      options: [
        { value: "hoch", label: "hoch (vollständig, strukturiert, aktuell)" },
        { value: "mittel", label: "mittel (teilweise strukturiert)" },
        { value: "niedrig", label: "niedrig (unstrukturiert, Lücken)" }
      ],
      description: "Nur für Aufwandsschätzung – bitte grob einordnen." },
    { key: "ai_roadmap", label: "AI‑Roadmap/Strategie vorhanden?", type: "select",
      options: [ { value: "ja", label: "ja – umgesetzt" }, { value: "in_planung", label: "in Planung" }, { value: "nein", label: "nein" } ],
      description: "Falls nicht: völlig ok – wir liefern einen Starter‑Pfad." },
    { key: "governance", label: "Regeln zu Data/AI‑Governance", type: "select",
      options: [ { value: "ja", label: "ja" }, { value: "teilweise", label: "teilweise" }, { value: "nein", label: "nein" } ],
      description: "Zugriffssicherheit, Modellfreigaben etc. – Vorlagen verfügbar." },
    { key: "innovationskultur", label: "Einstellung zu Innovation", type: "select",
      options: [
        { value: "sehr_offen", label: "sehr offen" }, { value: "eher_offen", label: "eher offen" }, { value: "neutral", label: "neutral" },
        { value: "eher_zurueckhaltend", label: "eher zurückhaltend" }, { value: "sehr_zurueckhaltend", label: "sehr zurückhaltend" }
      ],
      description: "Gefühl genügt – hilft beim richtigen Tempo." },

    /* — Ressourcen & Präferenzen — */
    { key: "zeitbudget", label: "Wöchentliches Zeitbudget für KI‑Projekte", type: "select",
      options: [ { value: "unter_2", label: "unter 2 Std." }, { value: "2_5", label: "2–5 Std." }, { value: "5_10", label: "5–10 Std." }, { value: "ueber_10", label: "über 10 Std." } ],
      description: "Wir planen realistisch zum Kalender." },
    { key: "vorhandene_tools", label: "Bereits genutzte Systeme", type: "checkbox",
      options: [
        { value: "crm", label: "CRM (HubSpot, Salesforce …)" }, { value: "erp", label: "ERP (SAP, Odoo …)" },
        { value: "projektmanagement", label: "Projektmanagement (Asana, Trello …)" }, { value: "marketing_automation", label: "Marketing‑Automation" },
        { value: "buchhaltung", label: "Buchhaltung" }, { value: "keine", label: "Keine/sonstige" }
      ],
      description: "Bitte aktiv genutzte Systeme markieren – vermeidet Tool‑Dopplungen." },
    { key: "regulierte_branche", label: "Regulierter Bereich", type: "checkbox",
      options: [
        { value: "gesundheit", label: "Gesundheit/Medizin" }, { value: "finanzen", label: "Finanzen/Versicherung" },
        { value: "oeffentlich", label: "Öffentliche Hand" }, { value: "recht", label: "Rechtsdienstleistungen" }, { value: "keine", label: "Keiner davon" }
      ],
      description: "Wenn zutreffend – wir berücksichtigen besondere Anforderungen." },
    { key: "trainings_interessen", label: "Interesse an Trainings", type: "checkbox",
      options: [
        { value: "prompt_engineering", label: "Prompt‑Engineering" }, { value: "llm_basics", label: "LLM‑Grundlagen" },
        { value: "datenqualitaet_governance", label: "Datenqualität & Governance" }, { value: "automatisierung", label: "Automatisierung & Skripte" },
        { value: "ethik_recht", label: "Ethik & Recht" }, { value: "keine", label: "Keins / unentschieden" }
      ],
      description: "Empfehlen i. d. R. 2–4 Std. Starter‑Session – abhängig von Auswahl." },
    { key: "vision_prioritaet", label: "Wichtigster Vision‑Aspekt", type: "select",
      options: [
        { value: "gpt_services", label: "GPT‑basierte Services" }, { value: "kundenservice", label: "Kundenservice verbessern" },
        { value: "datenprodukte", label: "Datenprodukte" }, { value: "prozessautomation", label: "Prozessautomation" },
        { value: "marktfuehrerschaft", label: "Marktführerschaft" }, { value: "keine_angabe", label: "keine Präferenz" }
      ],
      description: "Welcher „große Hebel“ ist Ihnen am wichtigsten?" },

    /* — Recht & Förderung — */
    { key: "datenschutzbeauftragter", label: "Datenschutzbeauftragter vorhanden?", type: "select",
      options: [ { value: "ja", label: "ja" }, { value: "nein", label: "nein" }, { value: "teilweise", label: "teilweise (extern/geplant)" } ],
      description: "Wenn nicht gesetzlich nötig: „nein“ wählen – wir flaggen, falls erforderlich." },
    { key: "technische_massnahmen", label: "Technische Schutzmaßnahmen", type: "select",
      options: [ { value: "alle", label: "vollständig" }, { value: "teilweise", label: "teilweise vorhanden" }, { value: "keine", label: "noch keine" } ],
      description: "Ehrliche Einordnung – wir schlagen schnelle Sicherheitsgewinne vor." },
    { key: "folgenabschaetzung", label: "Datenschutz-Folgenabschätzung (DPIA)", type: "select",
      options: [ { value: "ja", label: "ja" }, { value: "nein", label: "nein" }, { value: "teilweise", label: "teilweise" } ],
      description: "Wir weisen darauf hin, wann eine DPIA empfohlen/erforderlich ist." },
    { key: "meldewege", label: "Meldewege bei Zwischenfällen", type: "select",
      options: [ { value: "ja", label: "ja, klar definiert" }, { value: "teilweise", label: "teilweise definiert" }, { value: "nein", label: "nein" } ],
      description: "Sind Eskalationspfade festgelegt?" },
    { key: "loeschregeln", label: "Lösch-/Anonymisierungsregeln", type: "select",
      options: [ { value: "ja", label: "ja" }, { value: "teilweise", label: "teilweise" }, { value: "nein", label: "nein" } ],
      description: "Aufbewahrungs-/Löschregeln. Wir liefern einfache Starter." },
    { key: "ai_act_kenntnis", label: "Kenntnis EU AI Act", type: "select",
      options: [ { value: "sehr_gut", label: "sehr gut" }, { value: "gut", label: "gut" }, { value: "gehoert", label: "schon gehört" }, { value: "unbekannt", label: "unbekannt" } ],
      description: "Vorwissen nicht nötig – wir fassen Pflichten zusammen." },
    { key: "ki_hemmnisse", label: "Haupthindernisse für KI‑Einführung", type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Rechtsunsicherheit" }, { value: "datenschutz", label: "Datenschutz" }, { value: "knowhow", label: "Know‑how fehlt" },
        { value: "budget", label: "Begrenztes Budget" }, { value: "teamakzeptanz", label: "Akzeptanz im Team" }, { value: "zeitmangel", label: "Zeitmangel" },
        { value: "it_integration", label: "IT‑Integration" }, { value: "keine", label: "Keine Hindernisse" }, { value: "andere", label: "Andere" }
      ],
      description: "Alles Zutreffende wählen – wir schlagen pragmatische Umgehungen vor." },
    { key: "bisherige_foerdermittel", label: "Bisher Fördermittel erhalten?", type: "select",
      options: [ { value: "ja", label: "ja" }, { value: "nein", label: "nein" } ],
      description: "Hilft bei Folgeprogrammen." },
    { key: "interesse_foerderung", label: "Interesse an Förderung?", type: "select",
      options: [ { value: "ja", label: "ja, Programme vorschlagen" }, { value: "nein", label: "nein" }, { value: "unklar", label: "unsicher, bitte beraten" } ],
      description: "Bei „unsicher“ prüfen wir unverbindlich die Eignung." },
    { key: "erfahrung_beratung", label: "Erfahrung mit Digital-/KI‑Beratung", type: "select",
      options: [ { value: "ja", label: "ja" }, { value: "nein", label: "nein" }, { value: "unklar", label: "unklar" } ],
      description: "Damit bauen wir auf Vorhandenem auf." },
    { key: "investitionsbudget", label: "Budget für KI/Digital (nächste 12 Monate)", type: "select",
      options: [
        { value: "unter_2000", label: "unter 2.000 €" }, { value: "2000_10000", label: "2.000–10.000 €" },
        { value: "10000_50000", label: "10.000–50.000 €" }, { value: "ueber_50000", label: "über 50.000 €" },
        { value: "unklar", label: "unklar" }
      ],
      description: "Sinnvolle Starts sind auch mit kleinem Budget machbar – wir priorisieren." },
    { key: "marktposition", label: "Marktposition", type: "select",
      options: [
        { value: "marktfuehrer", label: "Marktführer" }, { value: "oberes_drittel", label: "Oberes Drittel" },
        { value: "mittelfeld", label: "Mittelfeld" }, { value: "nachzuegler", label: "Nachzügler" }, { value: "unsicher", label: "Schwer zu sagen" }
      ],
      description: "Grobe Einordnung genügt." },
    { key: "benchmark_wettbewerb", label: "Wettbewerbs‑Benchmarking", type: "select",
      options: [ { value: "ja", label: "ja, regelmäßig" }, { value: "nein", label: "nein" }, { value: "selten", label: "selten" } ],
      description: "Nur Kontext – keine Pflicht." },
    { key: "innovationsprozess", label: "Wie entstehen Innovationen?", type: "select",
      options: [
        { value: "innovationsteam", label: "Innovationsteam" }, { value: "mitarbeitende", label: "Mitarbeitende" },
        { value: "kunden", label: "Mit Kund:innen" }, { value: "berater", label: "Externe Berater" },
        { value: "zufall", label: "Eher zufällig" }, { value: "unbekannt", label: "Keine klare Strategie" }
      ],
      description: "Wir leiten Taktiken für Veränderung ab." },
    { key: "risikofreude", label: "Risikofreude (1–5)", type: "slider", min: 1, max: 5, step: 1,
      description: "Gefühl – hilft beim Tempo." },

    /* — Einwilligung — */
    { key: "datenschutz", label:
      "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"Datenschutz\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und stimme zu.",
      type: "privacy",
      description: "Bitte bestätigen Sie die Hinweise zum Datenschutz."
    }
  ];

  /* ---------- Schritt-Layout ---------- */
  var blocks = [
    { name: "Unternehmensinfos", keys: ["branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung","zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"] },
    { name: "Status Quo", keys: ["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
    { name: "Ziele & Projekte", keys: ["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
    { name: "Strategie & Governance", keys: ["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
    { name: "Ressourcen & Präferenzen", keys: ["zeitbudget","vorhandene_tools","regulierte_branche","trainings_interessen","vision_prioritaet"] },
    { name: "Rechtliches & Förderung", keys: ["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
    { name: "Datenschutz & Absenden", keys: ["datenschutz"] }
  ];

  /* ---------- State (Autosave) ---------- */
  var currentBlock = 0;
  var formData = {};
  var autosaveKey = (function () {
    try { var t = getToken(); var e = getEmailFromJWT(t); return (e ? (STORAGE_PREFIX + e) : (STORAGE_PREFIX + "test")) + ":" + LANG; }
    catch (e) { return STORAGE_PREFIX + "test:" + LANG; }
  })();
  var stepKey = autosaveKey + ":step";

  function loadAutosave(){ try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }catch(e){ formData = {}; } }
  function saveAutosave(){ try{ localStorage.setItem(autosaveKey, JSON.stringify(formData)); }catch(e){} }
  function loadStep(){
    try { var raw = localStorage.getItem(stepKey); var n = raw==null ? 0 : parseInt(raw,10); currentBlock = isNaN(n)?0:Math.max(0,Math.min(blocks.length-1,n)); }
    catch(_) { currentBlock = 0; }
  }
  function saveStep(){ try { localStorage.setItem(stepKey, String(currentBlock)); } catch(_){} }

  /* ---------- Utilities ---------- */
  function findField(key){ for (var i=0;i<fields.length;i++) if (fields[i].key===key) return fields[i]; return null; }
  function labelOf(key){ var f=findField(key); return (f && f.label) || key; }

  function collectValue(f){
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

  function scrollToStepTop(instant){
    try {
      var root = document.getElementById('formbuilder');
      if (!root) { window.scrollTo({ top: 0, behavior: (instant?'auto':'smooth') }); return; }
      var y = root.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 16;
      window.scrollTo({ top: y, behavior: (instant?'auto':'smooth') });
    } catch(e){ try{ window.scrollTo(0,0); }catch(_){} }
  }

  /* ---------- Rendering ---------- */
  function renderField(f) {
    var v = formData[f.key];
    var guidance = f.description ? '<div class="guidance'+(f.type==="privacy"?" important":"")+'" id="'+f.key+'_desc">'+f.description+'</div>' : "";
    var aria = ' aria-describedby="'+f.key+'_desc"';
    var html = "";
    if (f.type === "select") {
      var opts = '<option value="">Bitte wählen…</option>';
      for (var i=0;i<(f.options||[]).length;i++){
        var o=f.options[i]; var sel = (String(v||"")===String(o.value))?' selected':'';
        opts += '<option value="'+o.value+'"'+sel+'>'+o.label+'</option>';
      }
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<select id="'+f.key+'" name="'+f.key+'"'+aria+'>'+opts+'</select>';
    } else if (f.type === "textarea") {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<textarea id="'+f.key+'" name="'+f.key+'" placeholder="'+(f.placeholder||"")+'"'+aria+'>'+ (v||"") +'</textarea>';
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
      html = '<div class="guidance important" role="note">'+(f.description||"")+'</div>'+
             '<label class="checkbox-label"><input type="checkbox" id="'+f.key+'" name="'+f.key+'"'+chk+' required><span>'+f.label+'</span></label>';
    } else {
      html = '<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+
             '<input type="text" id="'+f.key+'" name="'+f.key+'" value="'+(v||"")+'"'+aria+'>';
    }
    return '<div class="form-group" data-key="'+f.key+'">'+html+'</div>';
  }

  function renderStep() {
    var root = document.getElementById("formbuilder");
    if (!root) return;

    var block = blocks[currentBlock];
    var intro = BLOCK_INTRO[currentBlock] || "";
    var html = '<section class="fb-section" aria-live="polite" aria-busy="false">'
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
         +  '<button type="button" class="btn btn-secondary mr-auto" id="btn-reset">Zurücksetzen</button>'
         +  '<button type="button" class="btn btn-secondary" id="btn-back" '+(currentBlock===0?'disabled':'')+'>Zurück</button>'
         +  (currentBlock < blocks.length-1
              ? '<button type="button" class="btn btn-primary" id="btn-next">Weiter</button>'
              : '<button type="button" class="btn btn-primary" id="btn-submit" aria-label="Absenden (E-Mail mit PDF wird versendet)">Absenden</button>')
         +  '</div>'
         +  '<div id="fb-msg" aria-live="assertive"></div>';

    root.innerHTML = html;

    root.addEventListener("change", handleChange);
    root.addEventListener("input", handleChange);

    root.addEventListener("keydown", function (ev) {
      var isEnter = (ev.key === "Enter" || ev.keyCode === 13);
      var tag = (ev.target && ev.target.tagName) ? ev.target.tagName.toUpperCase() : "";
      if (isEnter && tag !== "TEXTAREA" && currentBlock < blocks.length - 1) { ev.preventDefault(); }
    });

    var back = document.getElementById("btn-back");
    if (back) back.addEventListener("click", function () {
      if (currentBlock>0) { currentBlock--; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
    });

    var next = document.getElementById("btn-next");
    if (next) {
      next.addEventListener("click", function () {
        var missing = validateCurrentBlock(true);
        if (missing.length === 0 && currentBlock < blocks.length-1) { currentBlock++; saveStep(); renderStep(); updateProgress(); scrollToStepTop(true); }
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

  /* ---------- Daten/Validierung ---------- */
  function handleChange(e) {
    var block = blocks[currentBlock];
    for (var i=0;i<block.keys.length;i++){
      var k = block.keys[i]; var f = findField(k); if (!f) continue;
      if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
      formData[k] = collectValue(f);
    }
    saveAutosave();

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
      "vision_prioritaet":1,"selbststaendig":1
    };
    var missing = [];
    var block = blocks[currentBlock];
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

  /* ---------- Submit ---------- */
  function submitForm() {
    // letzte Aktualisierung
    for (var bi=0; bi<blocks.length; bi++) {
      var b = blocks[bi];
      for (var ki=0; ki<b.keys.length; ki++) {
        var k = b.keys[ki]; var f = findField(k); if (!f) continue;
        if (typeof f.showIf === "function" && !f.showIf(formData)) continue;
        if (document.getElementById(f.key)) { formData[k] = collectValue(f); }
      }
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
        + 'Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E‑Mail.</div></section>';
    }

    var token = getToken();
    if (!token) {
      if (root) root.insertAdjacentHTML("beforeend",
        '<div class="guidance important" role="alert">Ihre Sitzung ist abgelaufen. '
        + '<a href="/login.html">Bitte neu anmelden</a>, wenn Sie eine weitere Analyse durchführen möchten.</div>');
      return;
    }

    var data = {};
    for (var i=0;i<fields.length;i++){ data[fields[i].key] = formData[fields[i].key]; }
    data.lang = LANG;

    // JWT → E-Mail
    var tokenEmail = getEmailFromJWT(token);
    if (tokenEmail) { data.email = tokenEmail; data.to = tokenEmail; }

    // Hilfreiche Zusatzlabels für Admin/Debug (redundant zum Backend)
    var brancheLabels = {
      "marketing":"Marketing & Werbung","beratung":"Beratung","it":"IT & Software","finanzen":"Finanzen & Versicherungen","handel":"Handel & E‑Commerce","bildung":"Bildung","verwaltung":"Verwaltung","gesundheit":"Gesundheit & Pflege","bau":"Bauwesen & Architektur","medien":"Medien & Kreativwirtschaft","industrie":"Industrie & Produktion","logistik":"Transport & Logistik"
    };
    var sizeLabels = {"solo":"solo","team":"2–10","kmu":"11–100"};
    if (data.branche && !data.branche_label) data.branche_label = brancheLabels[data.branche] || (""+data.branche).toUpperCase();
    if (data.unternehmensgroesse && !data.unternehmensgroesse_label) data.unternehmensgroesse_label = sizeLabels[data.unternehmensgroesse] || data.unternehmensgroesse;
    if (data.bundesland) data.bundesland_code = (""+data.bundesland).toUpperCase();

    var url = getBaseUrl() + SUBMIT_PATH;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(data),
      credentials: "include",
      keepalive: true
    }).then(function (res) {
      if (res && res.status === 401) { try { localStorage.removeItem("jwt"); } catch (e) {} }
    }).catch(function(){});
  }

  /* ---------- Sanity-Check: warnen, falls Keys/Felder fehlen ---------- */
  function checkSchema() {
    try {
      var defined = {}; for (var i=0;i<fields.length;i++) defined[fields[i].key] = 1;
      var missing = [];
      for (var b=0;b<blocks.length;b++){
        var karr = blocks[b].keys || [];
        for (var j=0;j<karr.length;j++){ if (!defined[karr[j]]) missing.push(karr[j]); }
      }
      if (missing.length) console.warn("[Formbuilder-DE] Fehlende Felddefinitionen:", missing.join(", "));
    } catch (_) {}
  }

  /* ---------- Init ---------- */
  window.addEventListener("DOMContentLoaded", function(){
    loadAutosave(); loadStep(); checkSchema();
    var b0 = blocks[0];
    for (var i=0;i<b0.keys.length;i++){ var f=findField(b0.keys[i]); if (f && formData[f.key]===undefined) formData[f.key] = ""; }
    renderStep(); scrollToStepTop(true);
  });
})();
