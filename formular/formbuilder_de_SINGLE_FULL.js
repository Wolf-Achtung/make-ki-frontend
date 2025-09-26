(function(){ try{
  const css = `
    .fb-section{ 
      background:white; 
      border:1px solid #e2e8f0; 
      border-radius:20px; 
      padding:32px; 
      margin:24px 0; 
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
    .fb-section-head{ 
      font-size:24px; 
      font-weight:700; 
      color:#1e3a5f; 
      margin-bottom:16px; 
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .fb-step{
      display:inline-block;
      background: #dbeafe;
      color: #1e3a5f;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .section-intro{ 
      background: linear-gradient(135deg, #e0f2fe, #dbeafe);
      border-left: 4px solid #2563eb;
      border-radius:12px; 
      padding:16px 24px; 
      margin:16px 0 32px; 
      color:#1e3a5f;
      font-size: 16px;
      line-height: 1.6;
    }
    .form-group{ 
      margin:32px 0; 
    }
    .form-group label{ 
      display:block; 
      font-weight:600; 
      color:#1e3a5f; 
      margin-bottom:8px;
      font-size: 17px;
    }
    .guidance{ 
      font-size:15px; 
      color:#475569; 
      margin:8px 0 16px;
      background: #f0f9ff;
      padding: 16px;
      border-radius: 10px;
      border-left: 3px solid #dbeafe;
      line-height: 1.5;
    }
    .guidance.important{ 
      background:#fef3c7; 
      border-left-color:#f59e0b; 
      color:#92400e;
    }
    select, textarea, input[type="text"], input[type="range"]{
      width:100%; 
      box-sizing:border-box; 
      border:2px solid #e2e8f0; 
      border-radius:12px; 
      padding:14px 16px; 
      font-size:16px; 
      background:#ffffff;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    select:hover, textarea:hover, input[type="text"]:hover {
      border-color: #cbd5e1;
    }
    select:focus, textarea:focus, input[type="text"]:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    textarea{ 
      min-height:120px; 
      resize:vertical; 
    }
    .checkbox-group{ 
      display:grid; 
      grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); 
      gap:16px;
      margin-top: 16px;
    }
    .checkbox-label{ 
      display:flex; 
      gap:12px; 
      align-items:flex-start;
      padding: 16px;
      background: #f0f9ff;
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .checkbox-label:hover {
      background: #e0f2fe;
      border-color: #dbeafe;
    }
    .checkbox-label input[type="checkbox"] {
      margin-top: 4px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .checkbox-label span {
      flex: 1;
      font-weight: 500;
    }
    .option-example{ 
      font-size:14px; 
      color:#64748b; 
      margin-top:4px; 
      display: block;
    }
    .privacy-section label {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 16px;
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 500;
    }
    .privacy-section input[type="checkbox"] {
      margin-top: 4px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .invalid{ 
      border-color:#ef4444 !important; 
      background:#fef2f2 !important; 
    }
    .invalid-group{ 
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
      border-radius: 12px;
    }
    .form-nav{ 
      position: sticky;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      margin-top: 32px;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
    }
    .btn-next{ 
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color:white; 
      border:0; 
      border-radius:12px; 
      padding:14px 28px; 
      font-size:16px; 
      font-weight:600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-next:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
    }
    .btn-reset{ 
      background:white; 
      color:#1e293b; 
      border:2px solid #cbd5e1; 
      border-radius:12px; 
      padding:14px 28px; 
      font-size:16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-reset:hover {
      background: #f0f9ff;
      border-color: #2563eb;
    }
    .success-msg{ 
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-left: 4px solid #10b981;
      color: #065f46;
      padding: 24px;
      border-radius: 12px;
      margin: 24px 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .form-error{ 
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border-left: 4px solid #ef4444;
      color: #991b1b;
      padding: 24px;
      border-radius: 12px;
      margin: 24px 0;
    }
    .slider-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .slider-value-label{ 
      min-width: 48px;
      padding: 8px 12px;
      background: #dbeafe;
      border-radius: 8px;
      font-weight: 600;
      color: #1e3a5f;
      text-align: center;
    }
    input[type="range"] {
      flex: 1;
    }
    h2 {
      color: #1e3a5f;
      font-size: 28px;
      margin-bottom: 16px;
    }
  `;
  const s=document.createElement('style'); 
  s.type='text/css'; 
  s.appendChild(document.createTextNode(css)); 
  document.head.appendChild(s);
}catch(_){}})();

// JWT Utilities
function getToken() {
  try { 
    return localStorage.getItem("jwt") || null; 
  } catch(e) { 
    return null; 
  }
}

function getEmailFromJWT(token) {
  try {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.sub || null;
  } catch (e) {
    return null;
  }
}

// Helper functions
function findField(key) { 
  return fields.find(f => f.key === key); 
}

function getFieldLabel(key) { 
  const f = findField(key); 
  return f?.label || key; 
}

function markInvalid(key, on = true) {
  const el = document.getElementById(key);
  if (el) {
    if (on) { 
      el.classList.add('invalid'); 
    } else { 
      el.classList.remove('invalid'); 
    }
    const grp = el.closest('.form-group');
    if (grp) { 
      if (on) { 
        grp.classList.add('invalid-group'); 
      } else { 
        grp.classList.remove('invalid-group'); 
      }
    }
  }
}

function validateAllFields() {
  const missing = [];
  
  const optional = new Set([
    "jahresumsatz", "it_infrastruktur", "interne_ki_kompetenzen", "datenquellen",
    "zeitbudget", "vorhandene_tools", "regulierte_branche", "trainings_interessen", 
    "vision_prioritaet", "selbststaendig"
  ]);
  
  for (const field of fields) {
    if (field.showIf && !field.showIf(formData)) continue;
    if (optional.has(field.key)) continue;
    
    const val = formData[field.key];
    let ok = true;
    
    if (field.type === "checkbox") {
      ok = Array.isArray(val) && val.length > 0;
    } else if (field.type === "privacy") {
      ok = (val === true);
    } else {
      ok = (val !== undefined && String(val).trim() !== "");
    }
    
    if (!ok) {
      missing.push(getFieldLabel(field.key));
      markInvalid(field.key, true);
    } else {
      markInvalid(field.key, false);
    }
  }
  
  return missing;
}

// Section introductions
const BLOCK_INTRO = [
  "Hier erfassen wir Basisdaten (Branche, Größe, Standort). Sie steuern die Personalisierung des Reports und die passenden Förder- & Compliance-Hinweise.",
  "Status-Quo zu Prozessen, Daten und bisherigen KI-Erfahrungen. Damit kalibrieren wir Quick Wins und die Start-Roadmap.",
  "Ziele & wichtigste Anwendungsfälle: Was soll KI konkret leisten? Das fokussiert Empfehlungen und priorisiert Maßnahmen.",
  "Strategie & Governance: Grundlagen für nachhaltigen KI-Einsatz und verantwortungsvolle Umsetzung.",
  "Ressourcen & Präferenzen (Zeit, Tool-Affinität, vorhandene Lösungen). So passen wir Empfehlungen an Machbarkeit & Tempo an.",
  "Rechtliches & Förderung: DSGVO, EU AI Act, Fördermöglichkeiten und Compliance-Aspekte für sicheren KI-Einsatz.",
  "Datenschutz & Absenden: Einwilligung bestätigen und den personalisierten Report starten."
];

// Field definitions
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
    description: "Ihre Hauptbranche beeinflusst Benchmarks, Tool-Empfehlungen und die Auswertung."
  },
  {
    key: "unternehmensgroesse",
    label: "Wie groß ist Ihr Unternehmen?",
    type: "select",
    options: [
      { value: "solo", label: "1 (Solo-Selbstständig/Freiberuflich)" },
      { value: "team", label: "2–10 (Kleines Team)" },
      { value: "kmu", label: "11–100 (KMU)" }
    ],
    description: "Die Unternehmensgröße beeinflusst Empfehlungen und Fördermöglichkeiten."
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
  {
    key: "bundesland",
    label: "Bundesland (regionale Fördermöglichkeiten)",
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
    description: "Ihr Standort bestimmt verfügbare Fördermittel und Programme."
  },
  {
    key: "hauptleistung",
    label: "Was ist Ihre Hauptdienstleistung oder Ihr wichtigstes Produkt?",
    type: "textarea",
    placeholder: "z.B. Social-Media-Kampagnen, CNC-Fertigung, Steuerberatung",
    description: "Beschreiben Sie Ihre zentrale Leistung möglichst konkret."
  },
  {
    key: "zielgruppen",
    label: "Welche Zielgruppen bedienen Sie?",
    type: "checkbox",
    options: [
      { value: "b2b", label: "B2B (Geschäftskunden)" },
      { value: "b2c", label: "B2C (Endverbraucher)" },
      { value: "kmu", label: "KMU" },
      { value: "grossunternehmen", label: "Großunternehmen" },
      { value: "selbststaendige", label: "Selbstständige/Freiberufler" },
      { value: "oeffentliche_hand", label: "Öffentliche Hand" },
      { value: "privatpersonen", label: "Privatpersonen" },
      { value: "startups", label: "Startups" },
      { value: "andere", label: "Andere" }
    ],
    description: "Mehrfachauswahl möglich."
  },
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
    description: "Hilft bei Benchmarks und Förderempfehlungen."
  },
  {
    key: "it_infrastruktur",
    label: "Wie ist Ihre IT-Infrastruktur organisiert?",
    type: "select",
    options: [
      { value: "cloud", label: "Cloud-basiert (z.B. Microsoft 365, Google Cloud)" },
      { value: "on_premise", label: "Eigenes Rechenzentrum (On-Premises)" },
      { value: "hybrid", label: "Hybrid (Cloud + eigene Server)" },
      { value: "unklar", label: "Unklar / noch offen" }
    ],
    description: "Hilft bei Sicherheits- und Integrationsempfehlungen."
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
    description: "Wichtig für Schulungs- und Struktur-Empfehlungen."
  },
  {
    key: "datenquellen",
    label: "Welche Datentypen stehen für KI-Projekte zur Verfügung?",
    type: "checkbox",
    options: [
      { value: "kundendaten", label: "Kundendaten (CRM, Service)" },
      { value: "verkaufsdaten", label: "Verkaufs-/Bestelldaten" },
      { value: "produktionsdaten", label: "Produktions-/Betriebsdaten" },
      { value: "personaldaten", label: "Personal-/HR-Daten" },
      { value: "marketingdaten", label: "Marketing-/Kampagnendaten" },
      { value: "sonstige", label: "Sonstige Datenquellen" }
    ],
    description: "Mehrfachauswahl möglich."
  },

  // Block 2: Status Quo
  {
    key: "digitalisierungsgrad",
    label: "Wie digital sind Ihre internen Prozesse? (1–10)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    description: "1 = hauptsächlich Papier/manuell, 10 = vollständig digital/automatisiert"
  },
  {
    key: "prozesse_papierlos",
    label: "Anteil papierloser Prozesse",
    type: "select",
    options: [
      { value: "0-20", label: "0–20%" },
      { value: "21-50", label: "21–50%" },
      { value: "51-80", label: "51–80%" },
      { value: "81-100", label: "81–100%" }
    ],
    description: "Grobe Schätzung genügt."
  },
  {
    key: "automatisierungsgrad",
    label: "Automatisierungsgrad",
    type: "select",
    options: [
      { value: "sehr_niedrig", label: "Sehr niedrig" },
      { value: "eher_niedrig", label: "Eher niedrig" },
      { value: "mittel", label: "Mittel" },
      { value: "eher_hoch", label: "Eher hoch" },
      { value: "sehr_hoch", label: "Sehr hoch" }
    ],
    description: "Wie viel läuft automatisiert vs. manuell?"
  },
  {
    key: "ki_einsatz",
    label: "Wo wird KI bereits eingesetzt?",
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
    description: "Alle relevanten Bereiche ankreuzen."
  },
  {
    key: "ki_knowhow",
    label: "KI-Know-how im Team",
    type: "select",
    options: [
      { value: "keine", label: "Keine Erfahrung" },
      { value: "grundkenntnisse", label: "Grundkenntnisse" },
      { value: "mittel", label: "Mittel" },
      { value: "fortgeschritten", label: "Fortgeschritten" },
      { value: "expertenwissen", label: "Expertenwissen" }
    ],
    description: "Selbsteinschätzung genügt."
  },

  // Block 3: Ziele & Projekte
  {
    key: "projektziel",
    label: "Ziel des nächsten KI-/Digitalisierungsprojekts",
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
    description: "Mehrfachauswahl möglich."
  },
  {
    key: "ki_projekte",
    label: "Laufende/geplante KI-Projekte",
    type: "textarea",
    placeholder: "z.B. Chatbot, Angebotsautomation, Generatoren...",
    description: "Bitte konkret beschreiben."
  },
  {
    key: "ki_usecases",
    label: "Besonders interessante KI-Use-Cases",
    type: "checkbox",
    options: [
      { value: "texterstellung", label: "Texterstellung" },
      { value: "bildgenerierung", label: "Bildgenerierung" },
      { value: "spracherkennung", label: "Spracherkennung" },
      { value: "prozessautomatisierung", label: "Prozessautomatisierung" },
      { value: "datenanalyse", label: "Datenanalyse & Prognose" },
      { value: "kundensupport", label: "Kundensupport" },
      { value: "wissensmanagement", label: "Wissensmanagement" },
      { value: "marketing", label: "Marketing-Optimierung" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "Mehrfachauswahl möglich."
  },
  {
    key: "ki_potenzial",
    label: "Größtes KI-Potenzial im Unternehmen",
    type: "textarea",
    placeholder: "z.B. Reporting, personalisierte Angebote, Automatisierung...",
    description: "Wo sehen Sie das größte Potenzial?"
  },
  {
    key: "usecase_priority",
    label: "Bereich mit höchster Priorität",
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
      { value: "unbekannt", label: "Noch unklar" }
    ],
    description: "Wo lohnt der Einstieg zuerst?"
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "Wie kann KI Ihr Geschäftsmodell verändern?",
    type: "textarea",
    placeholder: "z.B. KI-gestütztes Portal, datenbasierte Plattform...",
    description: "Ihre langfristige Vision für KI-Transformation."
  },
  {
    key: "moonshot",
    label: "Ihre mutige 3-Jahres-Vision",
    type: "textarea",
    placeholder: "z.B. 80% Automatisierung, verdoppelter Umsatz...",
    description: "Denken Sie groß - was wäre ein Durchbruch?"
  },

  // Block 4: Strategie & Governance
  {
    key: "strategische_ziele",
    label: "Konkrete Ziele mit KI",
    type: "textarea",
    placeholder: "z.B. Effizienz steigern, neue Produkte, besserer Service",
    description: "Nennen Sie Ihre strategischen Hauptziele."
  },
  {
    key: "datenqualitaet",
    label: "Qualität Ihrer Daten",
    type: "select",
    options: [
      { value: "hoch", label: "Hoch (vollständig, strukturiert, aktuell)" },
      { value: "mittel", label: "Mittel (teilweise strukturiert)" },
      { value: "niedrig", label: "Niedrig (unstrukturiert, Lücken)" }
    ],
    description: "Gut gepflegte Daten sind Basis für KI-Erfolg."
  },
  {
    key: "ai_roadmap",
    label: "KI-Roadmap oder Strategie",
    type: "select",
    options: [
      { value: "ja", label: "Ja - implementiert" },
      { value: "in_planung", label: "In Planung" },
      { value: "nein", label: "Noch nicht vorhanden" }
    ],
    description: "Eine klare Roadmap erleichtert die Umsetzung."
  },
  {
    key: "governance",
    label: "Richtlinien für Daten-/KI-Governance",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Governance fördert verantwortungsvolle Projekte."
  },
  {
    key: "innovationskultur",
    label: "Offenheit für Innovationen",
    type: "select",
    options: [
      { value: "sehr_offen", label: "Sehr offen" },
      { value: "eher_offen", label: "Eher offen" },
      { value: "neutral", label: "Neutral" },
      { value: "eher_zurueckhaltend", label: "Eher zurückhaltend" },
      { value: "sehr_zurueckhaltend", label: "Sehr zurückhaltend" }
    ],
    description: "Innovationsfreundliche Kultur erleichtert KI-Einführung."
  },

  // Block 5: Ressourcen & Präferenzen
  {
    key: "zeitbudget",
    label: "Zeit pro Woche für KI-Projekte",
    type: "select",
    options: [
      { value: "unter_2", label: "Unter 2 Stunden" },
      { value: "2_5", label: "2–5 Stunden" },
      { value: "5_10", label: "5–10 Stunden" },
      { value: "ueber_10", label: "Über 10 Stunden" }
    ],
    description: "Hilft, Empfehlungen an verfügbare Zeit anzupassen."
  },
  {
    key: "vorhandene_tools",
    label: "Bereits genutzte Systeme",
    type: "checkbox",
    options: [
      { value: "crm", label: "CRM-Systeme (HubSpot, Salesforce)" },
      { value: "erp", label: "ERP-Systeme (SAP, Odoo)" },
      { value: "projektmanagement", label: "Projektmanagement (Asana, Trello)" },
      { value: "marketing_automation", label: "Marketing Automation" },
      { value: "buchhaltung", label: "Buchhaltungssoftware" },
      { value: "keine", label: "Keine / andere" }
    ],
    description: "Mehrfachauswahl - hilft bei Integrationsempfehlungen."
  },
  {
    key: "regulierte_branche",
    label: "Regulierte Branche",
    type: "checkbox",
    options: [
      { value: "gesundheit", label: "Gesundheit & Medizin" },
      { value: "finanzen", label: "Finanzen & Versicherungen" },
      { value: "oeffentlich", label: "Öffentlicher Sektor" },
      { value: "recht", label: "Rechtliche Dienstleistungen" },
      { value: "keine", label: "Keine dieser Branchen" }
    ],
    description: "Regulierte Branchen brauchen besondere Compliance."
  },
  {
    key: "trainings_interessen",
    label: "Interessante KI-Trainingsthemen",
    type: "checkbox",
    options: [
      { value: "prompt_engineering", label: "Prompt Engineering" },
      { value: "llm_basics", label: "LLM-Grundlagen" },
      { value: "datenqualitaet_governance", label: "Datenqualität & Governance" },
      { value: "automatisierung", label: "Automatisierung & Skripte" },
      { value: "ethik_recht", label: "Ethische & rechtliche Grundlagen" },
      { value: "keine", label: "Keine / noch unklar" }
    ],
    description: "Hilft bei Schulungsempfehlungen."
  },
  {
    key: "vision_prioritaet",
    label: "Wichtigster Visions-Aspekt",
    type: "select",
    options: [
      { value: "gpt_services", label: "GPT-basierte Services" },
      { value: "kundenservice", label: "Kundenservice verbessern" },
      { value: "datenprodukte", label: "Neue datenbasierte Produkte" },
      { value: "prozessautomation", label: "Prozessautomatisierung" },
      { value: "marktfuehrerschaft", label: "Marktführerschaft erreichen" },
      { value: "keine_angabe", label: "Keine Angabe" }
    ],
    description: "Hilft, Empfehlungen zu priorisieren."
  },

  // Block 6: Rechtliches & Förderung
  {
    key: "datenschutzbeauftragter",
    label: "Datenschutzbeauftragter vorhanden?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (extern/Planung)" }
    ],
    description: "Oft Pflicht - intern oder extern."
  },
  {
    key: "technische_massnahmen",
    label: "Technische Schutzmaßnahmen",
    type: "select",
    options: [
      { value: "alle", label: "Alle relevanten Maßnahmen" },
      { value: "teilweise", label: "Teilweise vorhanden" },
      { value: "keine", label: "Noch keine" }
    ],
    description: "Firewalls, Backups, Zugangsbeschränkungen etc."
  },
  {
    key: "folgenabschaetzung",
    label: "Datenschutz-Folgenabschätzung (DSFA)",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise" }
    ],
    description: "Für viele KI-Anwendungen unter DSGVO erforderlich."
  },
  {
    key: "meldewege",
    label: "Meldewege bei Vorfällen",
    type: "select",
    options: [
      { value: "ja", label: "Ja, klar geregelt" },
      { value: "teilweise", label: "Teilweise geregelt" },
      { value: "nein", label: "Nein" }
    ],
    description: "Schnelle Reaktion auf Datenschutzverstöße."
  },
  {
    key: "loeschregeln",
    label: "Regeln für Datenlöschung/-anonymisierung",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Wichtig für KI-Compliance und DSGVO."
  },
  {
    key: "ai_act_kenntnis",
    label: "Kenntnis EU AI Act",
    type: "select",
    options: [
      { value: "sehr_gut", label: "Sehr gut" },
      { value: "gut", label: "Gut" },
      { value: "gehoert", label: "Schon mal gehört" },
      { value: "unbekannt", label: "Noch nicht bekannt" }
    ],
    description: "Der EU AI Act bringt neue Pflichten."
  },
  {
    key: "ki_hemmnisse",
    label: "Hemmnisse beim KI-Einsatz",
    type: "checkbox",
    options: [
      { value: "rechtsunsicherheit", label: "Rechtsunsicherheit" },
      { value: "datenschutz", label: "Datenschutz" },
      { value: "knowhow", label: "Fehlendes Know-how" },
      { value: "budget", label: "Begrenztes Budget" },
      { value: "teamakzeptanz", label: "Teamakzeptanz" },
      { value: "zeitmangel", label: "Zeitmangel" },
      { value: "it_integration", label: "IT-Integration" },
      { value: "keine", label: "Keine Hemmnisse" },
      { value: "andere", label: "Andere" }
    ],
    description: "Alle zutreffenden auswählen."
  },
  {
    key: "bisherige_foerdermittel",
    label: "Bereits Fördermittel erhalten?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    description: "Für Digitalisierungs-/KI-Projekte."
  },
  {
    key: "interesse_foerderung",
    label: "Interesse an Fördermöglichkeiten",
    type: "select",
    options: [
      { value: "ja", label: "Ja, Programme vorschlagen" },
      { value: "nein", label: "Kein Bedarf" },
      { value: "unklar", label: "Unklar, bitte beraten" }
    ],
    description: "Wir filtern passende Optionen."
  },
  {
    key: "erfahrung_beratung",
    label: "Bisherige Beratung zu Digitalisierung/KI",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ],
    description: "Externe Beratung stärkt Ihre Position."
  },
  {
    key: "investitionsbudget",
    label: "Budget für KI/Digitalisierung nächstes Jahr",
    type: "select",
    options: [
      { value: "unter_2000", label: "Unter 2.000 €" },
      { value: "2000_10000", label: "2.000–10.000 €" },
      { value: "10000_50000", label: "10.000–50.000 €" },
      { value: "ueber_50000", label: "Über 50.000 €" },
      { value: "unklar", label: "Noch unklar" }
    ],
    description: "Auch kleine Budgets können Fortschritt bringen."
  },
  {
    key: "marktposition",
    label: "Marktposition",
    type: "select",
    options: [
      { value: "marktfuehrer", label: "Marktführer" },
      { value: "oberes_drittel", label: "Oberes Drittel" },
      { value: "mittelfeld", label: "Mittelfeld" },
      { value: "nachzuegler", label: "Nachzügler" },
      { value: "unsicher", label: "Schwer einzuschätzen" }
    ],
    description: "Hilft bei der Einordnung Ihrer Ergebnisse."
  },
  {
    key: "benchmark_wettbewerb",
    label: "Vergleich mit Wettbewerbern",
    type: "select",
    options: [
      { value: "ja", label: "Ja, regelmäßig" },
      { value: "nein", label: "Nein" },
      { value: "selten", label: "Selten" }
    ],
    description: "Benchmarks helfen, Chancen zu identifizieren."
  },
  {
    key: "innovationsprozess",
    label: "Wie entstehen Innovationen?",
    type: "select",
    options: [
      { value: "innovationsteam", label: "Innovationsteam" },
      { value: "mitarbeitende", label: "Durch Mitarbeitende" },
      { value: "kunden", label: "Mit Kunden" },
      { value: "berater", label: "Externe Berater" },
      { value: "zufall", label: "Zufällig" },
      { value: "unbekannt", label: "Keine klare Strategie" }
    ],
    description: "Strukturierte Wege erleichtern KI-Einsatz."
  },
  {
    key: "risikofreude",
    label: "Risikofreude bei Innovation (1–5)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    description: "1 = sicherheitsorientiert, 5 = sehr mutig"
  },

  // Block 7: Datenschutz & Absenden
  {
    key: "datenschutz",
    label: "Ich habe die <a href='datenschutz.html' onclick='window.open(this.href, \"DatenschutzPopup\", \"width=600,height=700\"); return false;'>Datenschutzhinweise</a> gelesen und bin einverstanden.",
    type: "privacy",
    description: "Bitte bestätigen Sie die Kenntnisnahme der Datenschutzhinweise."
  }
];

// Block structure
const blocks = [
  {
    name: "Unternehmensinfos",
    keys: ["branche", "unternehmensgroesse", "selbststaendig", "bundesland", 
           "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur", 
           "interne_ki_kompetenzen", "datenquellen"]
  },
  {
    name: "Status Quo",
    keys: ["digitalisierungsgrad", "prozesse_papierlos", "automatisierungsgrad", 
           "ki_einsatz", "ki_knowhow"]
  },
  {
    name: "Ziele & Projekte",
    keys: ["projektziel", "ki_projekte", "ki_usecases", "ki_potenzial", 
           "usecase_priority", "ki_geschaeftsmodell_vision", "moonshot"]
  },
  {
    name: "Strategie & Governance",
    keys: ["strategische_ziele", "datenqualitaet", "ai_roadmap", "governance", 
           "innovationskultur"]
  },
  {
    name: "Ressourcen & Präferenzen",
    keys: ["zeitbudget", "vorhandene_tools", "regulierte_branche", 
           "trainings_interessen", "vision_prioritaet"]
  },
  {
    name: "Rechtliches & Förderung",
    keys: ["datenschutzbeauftragter", "technische_massnahmen", "folgenabschaetzung", 
           "meldewege", "loeschregeln", "ai_act_kenntnis", "ki_hemmnisse", 
           "bisherige_foerdermittel", "interesse_foerderung", "erfahrung_beratung", 
           "investitionsbudget", "marktposition", "benchmark_wettbewerb", 
           "innovationsprozess", "risikofreude"]
  },
  {
    name: "Datenschutz & Absenden",
    keys: ["datenschutz"]
  }
];

// State management
let autosaveKey = (() => {
  try {
    const token = localStorage.getItem('jwt');
    if (token) {
      const email = getEmailFromJWT(token);
      if (email) return `autosave_form_${email}`;
    }
  } catch (e) {}
  return 'autosave_form_test';
})();
let formData = {};

// Load saved data
function loadAutosave() {
  try {
    formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
  } catch(e) {
    formData = {};
  }
}

// Save data
function saveAutosave() {
  try {
    localStorage.setItem(autosaveKey, JSON.stringify(formData));
  } catch(e) {}
}

// Get field value
function getFieldValue(field) {
  switch (field.type) {
    case "checkbox":
      return Array.from(document.querySelectorAll(`input[name="${field.key}"]:checked`))
        .map(e => e.value);
    case "slider":
      return document.getElementById(field.key)?.value || field.min || 1;
    case "privacy":
      return document.getElementById(field.key)?.checked || false;
    default:
      return document.getElementById(field.key)?.value || "";
  }
}

// Set field values
function setFieldValues() {
  for (const block of blocks) {
    for (const key of block.keys) {
      const field = findField(key);
      if (!field) continue;
      
      const el = document.getElementById(field.key);
      if (!el) continue;
      
      if (field.type === "checkbox") {
        (formData[key] || []).forEach(v => {
          const box = document.querySelector(`input[name="${field.key}"][value="${v}"]`);
          if (box) box.checked = true;
        });
      } else if (field.type === "slider") {
        const val = formData[key] ?? field.min ?? 1;
        el.value = val;
        const label = el.parentElement?.querySelector('.slider-value-label');
        if (label) label.innerText = val;
      } else if (field.type === "privacy") {
        el.checked = formData[key] === true;
      } else {
        if (formData[key] !== undefined) el.value = formData[key];
      }
    }
  }
}

// Render all blocks
function renderAllBlocks() {
  const root = document.getElementById("formbuilder");
  if (!root) return;
  
  let html = "";
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    html += `<section class="fb-section">
      <div class="fb-section-head">
        <span class="fb-step">Schritt ${i+1}/${blocks.length}</span>
        <b>${block.name}</b>
      </div>`;
    
    const intro = BLOCK_INTRO[i];
    if (intro) {
      html += `<div class="section-intro">${intro}</div>`;
    }
    
    html += block.keys.map(key => {
      const field = findField(key);
      if (!field) return "";
      if (field.showIf && !field.showIf(formData)) return "";
      
      const guidance = field.description ? 
        `<div class="guidance${field.type === "privacy" ? " important" : ""}">${field.description}</div>` : "";
      
      let input = "";
      
      switch(field.type) {
        case "select": {
          const selectedValue = formData[field.key] || "";
          input = `<select id="${field.key}" name="${field.key}">
            <option value="">Bitte wählen...</option>` +
            (field.options||[]).map(opt => {
              const sel = selectedValue === opt.value ? ' selected' : '';
              return `<option value="${opt.value}"${sel}>${opt.label}</option>`;
            }).join("") + `</select>`;
          break;
        }
        case "textarea":
          input = `<textarea id="${field.key}" name="${field.key}" 
            placeholder="${field.placeholder||""}">${formData[field.key]||""}</textarea>`;
          break;
        case "checkbox":
          input = `<div class="checkbox-group">` +
            (field.options||[]).map(opt => {
              const checked = (formData[field.key]||[]).includes(opt.value) ? 'checked' : '';
              return `<label class="checkbox-label">
                <input type="checkbox" name="${field.key}" value="${opt.value}" ${checked}>
                <span>${opt.label}</span>
              </label>`;
            }).join("") + `</div>`;
          break;
        case "slider": {
          const v = formData[field.key] ?? field.min ?? 1;
          input = `<div class="slider-container">
            <input type="range" id="${field.key}" name="${field.key}" 
              min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" 
              value="${v}" oninput="this.parentElement.querySelector('.slider-value-label').innerText=this.value">
            <span class="slider-value-label">${v}</span>
          </div>`;
          break;
        }
        case "privacy":
          input = `<div class="privacy-section">
            <label>
              <input type="checkbox" id="${field.key}" name="${field.key}" 
                ${formData[field.key]?'checked':''} required>
              <span>${field.label}</span>
            </label>
          </div>`;
          break;
        default:
          input = `<input type="text" id="${field.key}" name="${field.key}" 
            value="${formData[field.key]||""}">`;
      }
      
      const labelHtml = field.type !== "privacy" ? 
        `<label for="${field.key}"><b>${field.label}</b></label>` : "";
      
      return `<div class="form-group">${labelHtml}${guidance}${input}</div>`;
    }).join("");
    
    html += `</section>`;
  }
  
  html += `<div class="form-nav">
    <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
    <button type="button" id="btn-send" class="btn-next">Absenden</button>
  </div>
  <div id="feedback"></div>`;
  
  root.innerHTML = html;
}

// Handle form events
function handleFormEvents() {
  const root = document.getElementById("formbuilder");
  if (!root) return;
  
  root.addEventListener("change", (e) => {
    // Save all field values
    for (const f of fields) {
      formData[f.key] = getFieldValue(f);
    }
    saveAutosave();
    
    // Handle conditional fields
    if (e.target.id === "unternehmensgroesse") {
      renderAllBlocks();
      setTimeout(() => {
        setFieldValues();
      }, 10);
    }
  });
  
  root.addEventListener("click", (e) => {
    if (e.target.id === "btn-reset") {
      if (confirm("Möchten Sie das Formular wirklich zurücksetzen?")) {
        localStorage.removeItem(autosaveKey);
        formData = {};
        renderAllBlocks();
        window.scrollTo({top: 0, behavior: "smooth"});
      }
    }
    
    if (e.target.id === "btn-send") {
      submitForm();
    }
  });
}

// Submit form
function submitForm() {
  // Collect all data
  for (const f of fields) {
    formData[f.key] = getFieldValue(f);
  }
  saveAutosave();
  
  // Validate privacy checkbox
  if (!formData.datenschutz) {
    alert("Bitte bestätigen Sie die Kenntnisnahme der Datenschutzhinweise.");
    return;
  }
  
  // Prepare data
  const data = {};
  fields.forEach(field => {
    data[field.key] = formData[field.key];
  });
  data.lang = "de";
  
  // Show success message
  const form = document.getElementById("formbuilder");
  if (form) {
    form.innerHTML = `
      <div class="fb-section">
        <h2>Vielen Dank für Ihre Angaben!</h2>
        <div class="success-msg">
          Ihre KI-Analyse wird jetzt erstellt.<br>
          Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E-Mail.<br>
          Sie können dieses Fenster jetzt schließen.
        </div>
      </div>
    `;
  }
  
  // Submit to backend
  const token = getToken();
  if (!token) {
    if (form) {
      form.insertAdjacentHTML("beforeend",
        `<div class="form-error">
          Ihre Sitzung ist abgelaufen. 
          <a href="/login.html">Bitte neu anmelden</a>, 
          wenn Sie eine weitere Analyse durchführen möchten.
        </div>`);
    }
    return;
  }
  
  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  fetch(`${BASE_URL}/briefing_async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
    keepalive: true
  }).then((res) => {
    if (res.status === 401) {
      try { 
        localStorage.removeItem("jwt"); 
      } catch(e) {}
      
      if (form) {
        form.insertAdjacentHTML("beforeend",
          `<div class="form-error">
            Ihre Sitzung ist abgelaufen. 
            <a href="/login.html">Bitte neu anmelden</a>, 
            wenn Sie eine weitere Analyse durchführen möchten.
          </div>`);
      }
    }
  }).catch(() => {
    // Ignore errors - email will be sent by backend
  });
}

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderAllBlocks();
  setTimeout(() => {
    setFieldValues();
    handleFormEvents();
  }, 100);
});