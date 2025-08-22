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

/* ============================================================================
   Hilfsfunktionen für Valdierung & Checkbox-Labels
   ========================================================================== */

// Robuste Aufteilung von Checkbox-Labels in Hauptlabel + Kurzbeschreibung.
// 1) "(...)" wird bevorzugt geparst
// 2) Falls keine Klammern: auf doppelte Leerzeichen / Trennstriche splitten
function splitLabelAndHint(raw) {
  if (!raw) return ["", ""];
  const s = String(raw).trim();

  // 1) Klammerformat "Main (Hint)"
  const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return [m[1].trim(), m[2].trim()];

  // 2) Fallback: 2+ Spaces oder Trennstriche
  const parts = s.split(/\s{2,}| — | – | - /).map(x => x.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(" ")];

  // 3) kein Trenner vorhanden
  return [s, ""];
}

// Ermittelt die Felddefinition zum Key
function findField(key) { return fields.find(f => f.key === key); }
// Liefert das sichtbare Label eines Feldes (Fallback: Key)
function getFieldLabel(key) { const f = findField(key); return f?.label || key; }
// Markiert/entfernt Markierung am Eingabefeld/Block
function markInvalid(key, on = true) {
  const el = document.getElementById(key);
  if (el) {
    if (on) el.classList.add('invalid'); else el.classList.remove('invalid');
    const grp = el.closest('.form-group');
    if (grp) on ? grp.classList.add('invalid-group') : grp.classList.remove('invalid-group');
  }
}
// Detaillierte Validierung mit Liste fehlender Felder
function validateBlockDetailed(blockIdx) {
  const block = blocks[blockIdx];
  const optional = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"]);
  const missing = [];
  block.keys.forEach(k => markInvalid(k, false)); // alte Marker entfernen

  for (const key of block.keys) {
    const f = findField(key);
    if (!f) continue;
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
// Liefert den Feedback-Container unter der Navigation (falls vorhanden), sonst global
function getFeedbackBox() {
  return document.querySelector('#formbuilder .form-nav + #feedback') || document.getElementById('feedback');
}

/* ============================================================================
   Felder (de) – wie in deiner Datei
   ========================================================================== */

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

  // Erweiterte Unternehmensangaben (Gold-Standard)
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
      { value: "cloud", label: "Cloud-basiert (externe Services, z. B. Microsoft 365, Google Cloud…)" },
      { value: "on_premise", label: "Eigenes Rechenzentrum (On-Premises)" },
      { value: "hybrid", label: "Hybrid (Cloud + eigene Server)" },
      { value: "unklar", label: "Unklar / Noch offen" }
    ],
    description: "Ihre Antwort hilft uns, passende Empfehlungen für Sicherheit, Integration und moderne Tools auszuwählen."
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
    description: "Ein internes Kompetenzteam kann Prozesse beschleunigen. Diese Angabe hilft bei der Empfehlung von Schulungen und internen Strukturen."
  },
  {
    key: "datenquellen",
    label: "Welche Datentypen stehen Ihnen für KI-Projekte und Analysen zur Verfügung?",
    type: "checkbox",
    options: [
      { value: "kundendaten", label: "Kundendaten (CRM, Service, Historie)" },
      { value: "verkaufsdaten", label: "Verkaufs- und Bestelldaten (z. B. Shop, Aufträge)" },
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
      { value: "0-20", label: "0–20 %" },
      { value: "21-50", label: "21–50 %" },
      { value: "51-80", label: "51–80 %" },
      { value: "81-100", label: "81–100 %" }
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
    placeholder: "z. B. Chatbot für Kundenanfragen, automatisierte Angebotserstellung, Text- oder Bildgeneratoren, Analyse-Tools für Vertrieb",
    description: "Beschreiben Sie laufende oder geplante Projekte möglichst konkret. Gibt es bereits Überlegungen, Experimente oder Pilotprojekte?"
  },
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
    description: "Welche KI-Anwendungsbereiche interessieren Sie besonders? Mehrfachauswahl möglich."
  },
  {
    key: "ki_potenzial",
    label: "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "z. B. Schnelleres Reporting, personalisierte Angebote, Kostenreduktion durch Automatisierung, neue Services ...",
    description: "Wo sehen Sie für Ihr Unternehmen das größte Potenzial durch KI? Gerne frei formulieren – alles ist willkommen."
  },
  {
    key: "usecase_priority",
    label: "In welchem Bereich soll KI am ehesten zum Einsatz kommen?",
    type: "select",
    options: [
      "marketing","vertrieb","buchhaltung","produktion","kundenservice","it",
      "forschung","personal","unbekannt"
    ].map(v => ({ value: v, label:
      v==="marketing"?"Marketing":
      v==="vertrieb"?"Vertrieb":
      v==="buchhaltung"?"Buchhaltung":
      v==="produktion"?"Produktion":
      v==="kundenservice"?"Kundenservice":
      v==="it"?"IT":
      v==="forschung"?"Forschung & Entwicklung":
      v==="personal"?"Personal":"Noch unklar / Entscheide ich später"
    })),
    description: "Gibt es einen Unternehmensbereich, in dem KI besonders dringend gebraucht wird oder das größte Potenzial bietet?"
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "Wie könnte KI Ihr Geschäftsmodell oder Ihre Branche grundlegend verändern?",
    type: "textarea",
    placeholder: "z. B. Automatisierte Online-Beratungen, datenbasierte Plattform-Services, völlig neue Produkte, …",
    description: "Welche Veränderungen oder neuen Möglichkeiten sehen Sie langfristig durch KI? Hier geht es um Ihre größere Vision – ob konkret oder visionär."
  },
  {
    key: "moonshot",
    label: "Was wäre ein mutiger Durchbruch – Ihre KI-Vision in 3 Jahren?",
    type: "textarea",
    placeholder: "z. B. 80 % meiner Routinearbeiten übernimmt KI; mein Umsatz verdoppelt sich durch smarte Automatisierung …",
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
  // ... (der restliche „Rechtliches & Förderung“-Block aus deiner Datei bleibt unverändert)
];

/* ============================================================================
   Blockstruktur / Progress / Renders
   ========================================================================== */

const blocks = [
  {
    name: "Unternehmensinfos",
    keys: [
      "branche","unternehmensgroesse","selbststaendig","bundesland","hauptleistung",
      "zielgruppen","jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"
    ]
  },
  { name: "Status Quo", keys: ["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","ki_einsatz","ki_knowhow"] },
  { name: "Ziele & Projekte", keys: ["projektziel","ki_projekte","ki_usecases","ki_potenzial","usecase_priority","ki_geschaeftsmodell_vision","moonshot"] },
  { name: "Strategie & Governance", keys: ["strategische_ziele","datenqualitaet","ai_roadmap","governance","innovationskultur"] },
  { name: "Rechtliches & Förderung", keys: ["datenschutzbeauftragter","technische_massnahmen","folgenabschaetzung","meldewege","loeschregeln","ai_act_kenntnis","ki_hemmnisse","bisherige_foerdermittel","interesse_foerderung","erfahrung_beratung","investitionsbudget","marktposition","benchmark_wettbewerb","innovationsprozess","risikofreude"] },
  { name: "Datenschutz & Absenden", keys: ["datenschutz"] }
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
  <div class="progress-label">Schritt ${blockIdx+1} / ${blocks.length} – <b>${blocks[blockIdx].name}</b></div>`;
}

function renderBlock(blockIdx) {
  formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}");
  showProgress(blockIdx);
  const block = blocks[blockIdx];
  const form = document.getElementById("formbuilder");
  if (!form) return;

  form.innerHTML = block.keys.map(key => {
    const field = findField(key);
    if (!field) return "";
    if (field.showIf && !field.showIf(formData)) return "";

    const guidance = field.description
      ? `<div class="guidance${field.key === "datenschutz" ? " important" : ""}">${field.description}</div>`
      : "";

    let input = "";
    switch (field.type) {
      case "select": {
        const selectedValue = formData[field.key] || "";
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Bitte wählen...</option>
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
        ${blockIdx > 0 ? `<button type="button" id="btn-prev">Zurück</button>` : ""}
      </div>
      <div class="nav-right">
        ${blockIdx < blocks.length - 1
          ? `<button type="button" id="btn-next">Weiter</button>`
          : `<button type="button" id="btn-send" class="btn-next">Absenden</button>`}
        <button type="button" id="btn-reset" class="btn-reset">Zurücksetzen</button>
      </div>
    </div>
    <div id="feedback"></div>`;
}
function saveAutosave() { localStorage.setItem(autosaveKey, JSON.stringify(formData)); }
function loadAutosave() { formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }

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
      if (el.nextElementSibling) el.nextElementSibling.innerText = val;
    } else if (field.type === "privacy") {
      el.checked = formData[key] === true;
    } else {
      if (formData[key] !== undefined) el.value = formData[key];
    }
  }
}

function blockIsValid(blockIdx) {
  const block = blocks[blockIdx];
  const optionalKeys = new Set(["jahresumsatz","it_infrastruktur","interne_ki_kompetenzen","datenquellen"]);
  return block.keys.every(key => {
    const field = findField(key);
    if (!field) return true;
    if (field.showIf && !field.showIf(formData)) return true;
    if (optionalKeys.has(key)) return true;
    const val = formData[key];
    if (field.type === "checkbox") return Array.isArray(val) && val.length > 0;
    if (field.type === "privacy") return val === true;
    return val !== undefined && String(val).trim() !== "";
  });
}

function handleFormEvents() {
  // Live-Änderungen: Autosave + ggf. Fehler zurücksetzen + Rerender (bei Größe)
  document.getElementById("formbuilder").addEventListener("change", () => {
    const block = blocks[currentBlock];
    let needsRerender = false;

    for (const key of block.keys) {
      const field = findField(key);
      if (!field) continue;
      const prev = formData[key];
      const curr = getFieldValue(field);
      formData[key] = curr;
      // Markierung sofort entfernen, wenn Feld ausgefüllt wird
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

  // Buttons
  document.getElementById("formbuilder").addEventListener("click", e => {
    const box = getFeedbackBox();

    if (e.target.id === "btn-next") {
      // Werte JIT
      const block = blocks[currentBlock];
      for (const key of block.keys) {
        const f = findField(key);
        if (f) formData[key] = getFieldValue(f);
      }
      saveAutosave();

      // Detaillierte Validierung
      const missing = validateBlockDetailed(currentBlock);
      if (missing.length) {
        if (box) {
          box.innerHTML = `<div class="form-error">Bitte ergänzen Sie die folgenden Felder:<ul>${missing.map(m => `<li>${m}</li>`).join("")}</ul></div>`;
          box.style.display = 'block'; box.classList.add('error');
        }
        const firstInvalid = document.querySelector('.invalid, .invalid-group');
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      } else if (box) {
        box.innerHTML = ""; box.style.display = 'none'; box.classList.remove('error');
      }

      currentBlock++;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (e.target.id === "btn-prev") {
      currentBlock--; renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (e.target.id === "btn-reset") {
      localStorage.removeItem(autosaveKey);
      formData = {}; currentBlock = 0;
      renderBlock(currentBlock);
      setTimeout(() => setFieldValues(currentBlock), 20);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (e.target.id === "submit-btn" || e.target.id === "btn-send") submitAllBlocks();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadAutosave();
  renderBlock(currentBlock);
  setTimeout(() => {
    setFieldValues(currentBlock);
    renderBlock(currentBlock);
    setTimeout(() => { setFieldValues(currentBlock); handleFormEvents(); }, 20);
  }, 20);
});

function submitAllBlocks() {
  const data = {}; fields.forEach(field => data[field.key] = formData[field.key]);
  data.lang = "de";
  const BASE_URL = "https://make-ki-backend-neu-production.up.railway.app";
  fetch(`${BASE_URL}/briefing_async`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data), keepalive: true
  }).then(async (res) => {
    if (res.status === 401) { localStorage.removeItem("jwt"); window.location.href = "/login.html"; return; }
    window.location.href = "thankyou.html";
  }).catch(() => { window.location.href = "thankyou.html"; });
}

// === showSuccess() unverändert wie in deiner Datei ===
// === formbuilder.js: Erweiterung von showSuccess() ===
function showSuccess(data) {
  localStorage.removeItem(autosaveKey);
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
  if (htmlContent) {
    fetch("https://make-ki-pdfservice-production.up.railway.app/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "text/html",
        "X-User-Email": userEmail
      },
      body: htmlContent
    }).catch(() => {});
  }
  document.getElementById("formbuilder").innerHTML = `
    <h2>Vielen Dank für Ihre Angaben!</h2>
    <div class="success-msg">
      Ihre KI-Analyse wird jetzt erstellt.<br>
      Nach Fertigstellung erhalten Sie Ihre individuelle Auswertung als PDF per E-Mail zugestellt.<br>
    </div>
  `;
}
