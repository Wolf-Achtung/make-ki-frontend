// --- JWT & Security ---
const token = localStorage.getItem("jwt");
if (!token) window.location.href = "/login.html";

function getEmailFromJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.sub || null;
  } catch (e) { return null; }
}
function isAdmin(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin";
  } catch (e) { return false; }
}

// --- Alle Felder (siehe vollständiges Array oben) ---
const fields = [
  {
    key: "branche",
    label: "Branche des Unternehmens",
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
    description: "Bestimmt Benchmarks, Tool-Empfehlungen und die branchenspezifische Auswertung."
  },
{
  key: "unternehmensgroesse",
  label: "Wie groß ist das Unternehmen?",
  type: "select",
  options: [
    { value: "solo", label: "1 Person (Einzelunternehmen, Solo-Selbstständig, Freiberufler, 1-Personen-GmbH/UG)" },
    { value: "team", label: "2–10 Personen (Kleines Team)" },
    { value: "kmu", label: "11–100 Personen (KMU)" }
  ],
  description: "Bitte wählen Sie die passende Größe entsprechend der Zahl der Mitarbeitenden oder Inhaber."
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
    label: "Bundesland",
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
    description: "Regionale Fördermittel und rechtliche Rahmenbedingungen sind oft länderspezifisch."
  },
  {
    key: "hauptleistung",
    label: "Hauptprodukt oder wichtigste Dienstleistung",
    type: "textarea",
    placeholder: "z. B. Softwareentwicklung, Marketingberatung, CNC-Fertigung",
    description: "Kernangebot möglichst präzise beschreiben, damit Analyse und Tool-Tipps gezielt ausfallen."
  },
  {
    key: "zielgruppen",
    label: "Zielgruppen oder Kundensegmente",
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
    description: "Beeinflusst Usecase-Empfehlungen, Marketing-Ansätze und Automatisierung."
  },
  {
    key: "projektziel",
    label: "Ziele des nächsten KI-/Digitalisierungsprojekts",
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
    description: "Hauptziele helfen, Analyse und Empfehlungen zu fokussieren. Mehrfachauswahl möglich."
  },
  {
    key: "ki_einsatz",
    label: "Einsatzgebiete von KI im Unternehmen (heute)",
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
    description: "Einsatzfelder von Künstlicher Intelligenz oder Automatisierung (Mehrfachauswahl möglich)."
  },
  {
    key: "digitalisierungsgrad",
    label: "Digitalisierungsgrad der Prozesse (1–10)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    description: "Skala von 1 (analog, keine Automatisierung) bis 10 (voll digital, integrierte Systeme)."
  },
  {
    key: "prozesse_papierlos",
    label: "Anteil papierloser Prozesse",
    type: "select",
    options: [
      { value: "0-20", label: "0-20%" },
      { value: "21-50", label: "21-50%" },
      { value: "51-80", label: "51-80%" },
      { value: "81-100", label: "81-100%" }
    ],
    description: "Schätzung, wie viel Prozent der Abläufe/Dokumente bereits komplett ohne Papier funktionieren."
  },
  {
    key: "automatisierungsgrad",
    label: "Automatisierungsgrad der Arbeitsabläufe",
    type: "select",
    options: [
      { value: "sehr_niedrig", label: "Sehr niedrig" },
      { value: "eher_niedrig", label: "Eher niedrig" },
      { value: "mittel", label: "Mittel" },
      { value: "eher_hoch", label: "Eher hoch" },
      { value: "sehr_hoch", label: "Sehr hoch" }
    ],
    description: "Wie viele Arbeitsschritte laufen automatisiert ab (durch KI, Scripte, Tools)?"
  },
  {
    key: "ki_knowhow",
    label: "Internes KI-Knowhow",
    type: "select",
    options: [
      { value: "keine", label: "Keine Erfahrung" },
      { value: "grundkenntnisse", label: "Grundkenntnisse" },
      { value: "mittel", label: "Mittel" },
      { value: "fortgeschritten", label: "Fortgeschritten" },
      { value: "expertenwissen", label: "Expertenwissen" }
    ],
    description: "Kenntnisstand und Erfahrung mit KI-Technologien im Unternehmen."
  },
  {
    key: "ki_projekte",
    label: "Geplante oder laufende KI-Projekte",
    type: "textarea",
    placeholder: "z. B. Chatbot, automatisierte Angebotskalkulation",
    description: "Kurze Beschreibung erster KI-Projekte, Ideen oder Überlegungen."
  },
  {
    key: "ki_usecases",
    label: "Wunsch-Anwendungsfälle für KI",
    type: "checkbox",
    options: [
      { value: "texterstellung", label: "Texterstellung" },
      { value: "bildgenerierung", label: "Bildgenerierung" },
      { value: "spracherkennung", label: "Spracherkennung" },
      { value: "prozessautomatisierung", label: "Prozessautomatisierung" },
      { value: "datenanalyse", label: "Datenanalyse & Prognose" },
      { value: "kundensupport", label: "Kundensupport" },
      { value: "wissensmanagement", label: "Wissensmanagement" },
      { value: "marketing", label: "Marketing" },
      { value: "sonstiges", label: "Sonstiges" }
    ],
    description: "KI-Anwendungsfelder, die für das Unternehmen besonders interessant sind (Mehrfachauswahl)."
  },
  {
    key: "ki_potenzial",
    label: "Größtes Potenzial für KI im Unternehmen",
    type: "textarea",
    placeholder: "z. B. Automatisierte Berichte, vorausschauende Wartung",
    description: "Einschätzung, wo KI besonders viel bewirken könnte."
  },
  {
    key: "usecase_priority",
    label: "KI-Priorität: Bereich mit dem größten Nutzen",
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
    description: "Bereich, in dem KI zuerst eingeführt/priorisiert werden sollte."
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "Zukunftsvision für Geschäftsmodell/Branche durch KI",
    type: "textarea",
    placeholder: "z. B. Digitale Plattform, neue Produkte, Geschäftsmodelle",
    description: "Chancen und Veränderungen, die durch KI langfristig erwartet werden."
  },
  {
    key: "moonshot",
    label: "Moonshot: Visionärer KI-Durchbruch in 3 Jahren",
    type: "textarea",
    placeholder: "z. B. KI automatisiert 70% aller Geschäftsprozesse",
    description: "Visionärer, mutiger Durchbruch, der durch KI erreicht werden könnte."
  },
  {
    key: "datenschutzbeauftragter",
    label: "Vorhandensein eines Datenschutzbeauftragten",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (externer Berater/Planung)" }
    ],
    description: "Zuständigkeit für Datenschutz im Unternehmen."
  },
  {
    key: "technische_massnahmen",
    label: "Umgesetzte technische Maßnahmen für Datenschutz/Cybersicherheit",
    type: "select",
    options: [
      { value: "alle", label: "Alle relevanten Maßnahmen vorhanden" },
      { value: "teilweise", label: "Teilweise umgesetzt" },
      { value: "keine", label: "Noch keine umgesetzt" }
    ],
    description: "Umsetzungsstand von Firewalls, Zugriffskontrolle etc."
  },
  {
    key: "folgenabschaetzung",
    label: "DSGVO-Folgenabschätzung für KI-Anwendungen durchgeführt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (in Planung)" }
    ],
    description: "Rechtssicherheit und Vertrauen werden durch DSFA erhöht."
  },
  {
    key: "meldewege",
    label: "Definierte Meldewege bei Datenschutzvorfällen",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Klare Prozesse für den Umgang mit Datenschutzverletzungen."
  },
  {
    key: "loeschregeln",
    label: "Regeln zur Datenlöschung/Anonymisierung",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Wichtig für DSGVO-Konformität und IT-Sicherheit."
  },
  {
    key: "ai_act_kenntnis",
    label: "Kenntnisstand EU AI Act",
    type: "select",
    options: [
      { value: "sehr_gut", label: "Sehr gut" },
      { value: "gut", label: "Gut" },
      { value: "gehört", label: "Habe davon gehört" },
      { value: "unbekannt", label: "Noch nicht beschäftigt" }
    ],
    description: "Kenntnisstand über die Pflichten und Anforderungen des EU AI Act."
  },
  {
    key: "ki_hemmnisse",
    label: "Größte Hemmnisse/Risiken beim Einsatz von KI",
    type: "checkbox",
    options: [
      { value: "rechtsunsicherheit", label: "Unsicherheit bei Rechtslage" },
      { value: "datenschutz", label: "Datenschutz" },
      { value: "knowhow", label: "Knowhow" },
      { value: "budget", label: "Budget" },
      { value: "teamakzeptanz", label: "Akzeptanz im Team" },
      { value: "zeitmangel", label: "Zeitmangel" },
      { value: "it_integration", label: "IT-Integration" },
      { value: "keine", label: "Keine Hemmnisse" },
      { value: "andere", label: "Andere" }
    ],
    description: "Mehrfachauswahl möglich. Was blockiert aktuell den Einsatz von KI?"
  },
  {
    key: "bisherige_foerdermittel",
    label: "Bereits genutzte Fördermittel für Digitalisierung/KI",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    description: "Haben bereits Fördermittelprojekte stattgefunden?"
  },
  {
    key: "interesse_foerderung",
    label: "Interesse an Fördermitteln für KI-/Digitalisierungsprojekte",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ],
    description: "Gezielte Recherche und Roadmap mit passenden Fördermöglichkeiten?"
  },
  {
    key: "erfahrung_beratung",
    label: "Bisherige Beratung zum Thema Digitalisierung/KI",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ],
    description: "Hat bereits eine externe Beratung stattgefunden?"
  },
  {
    key: "investitionsbudget",
    label: "Investitionsbudget für KI/Digitalisierung (12 Monate)",
    type: "select",
    options: [
      { value: "unter_2000", label: "Unter 2.000 €" },
      { value: "2000_10000", label: "2.000–10.000 €" },
      { value: "10000_50000", label: "10.000–50.000 €" },
      { value: "ueber_50000", label: "Mehr als 50.000 €" },
      { value: "unklar", label: "Noch unklar" }
    ],
    description: "Geplantes Budget für KI oder Digitalisierung im nächsten Jahr (inkl. Förderung)."
  },
  {
    key: "marktposition",
    label: "Aktuelle Marktposition im Wettbewerb",
    type: "select",
    options: [
      { value: "marktfuehrer", label: "Marktführer" },
      { value: "oberes_drittel", label: "Im oberen Drittel" },
      { value: "mittelfeld", label: "Mittelfeld" },
      { value: "nachzuegler", label: "Aufholer/Nachzügler" },
      { value: "unsicher", label: "Schwer einzuschätzen" }
    ],
    description: "Selbsteinschätzung im Vergleich zum Wettbewerb."
  },
  {
    key: "benchmark_wettbewerb",
    label: "Vergleich der Digitalisierung/KI-Readiness mit Wettbewerbern",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "selten", label: "Selten" }
    ],
    description: "Wird regelmäßig beobachtet, wie digital/ki-fit die Konkurrenz ist?"
  },
  {
    key: "innovationsprozess",
    label: "Entwicklung von Innovationen im Unternehmen",
    type: "select",
    options: [
      { value: "innovationsteam", label: "Durch internes Innovationsteam" },
      { value: "mitarbeitende", label: "Durch Mitarbeitende" },
      { value: "kunden", label: "In Zusammenarbeit mit Kunden" },
      { value: "berater", label: "Externe Berater/Partner" },
      { value: "zufall", label: "Zufällig/ungeplant" },
      { value: "unbekannt", label: "Noch nicht definiert" }
    ],
    description: "Systematik und Organisation der Innovationsentwicklung."
  },
  {
    key: "risikofreude",
    label: "Risikofreude bei Innovationen (1–5)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    description: "Eher sicherheitsorientiert oder bereit, Neues auszuprobieren?"
  }  // <--- Komma hier weg! (letztes Feld im Array)
]; // <--- FELD-ARRAY SCHLIESSEN!

// --- State & Progress ---
let formData = {};
let currentBlock = 0; // Start-Block
const blocks = [
  // Blöcke für Abschnitt-Splitting (optional)
  ["branche", "unternehmensgroesse", "selbststaendig"],
  ["bundesland", "hauptleistung", "zielgruppen", "projektziel"],
  // ... restliche Block-Einteilung
];

// --- Hilfsfunktionen für Feld-Rendering ---
function createFieldHTML(field, value = "") {
  let html = `<label for="${field.key}">${field.label}</label>`;
  if (field.type === "select") {
    html += `<select id="${field.key}" name="${field.key}">` +
      field.options.map(opt =>
        `<option value="${opt.value}" ${value === opt.value ? "selected" : ""}>${opt.label}</option>`
      ).join("") +
      `</select>`;
  } else if (field.type === "checkbox") {
    html += field.options.map(opt =>
      `<label><input type="checkbox" name="${field.key}" value="${opt.value}" ${Array.isArray(value) && value.includes(opt.value) ? "checked" : ""}/> ${opt.label}</label>`
    ).join("<br>");
  } else if (field.type === "slider") {
    html += `<input type="range" id="${field.key}" name="${field.key}" min="${field.min}" max="${field.max}" step="${field.step}" value="${value || field.min}" />` +
      `<span id="${field.key}-value">${value || field.min}</span>`;
  } else if (field.type === "textarea") {
    html += `<textarea id="${field.key}" name="${field.key}">${value || ""}</textarea>`;
  } else {
    html += `<input type="text" id="${field.key}" name="${field.key}" value="${value || ""}" />`;
  }
  if (field.description)
    html += `<div class="description">${field.description}</div>`;
  return `<div class="form-field">${html}</div>`;
}

// --- Haupt-Rendering-Funktion ---
function renderForm(blockIdx = 0) {
  const mainForm = document.getElementById("mainForm");
  mainForm.innerHTML = "";

  // Progressbar
  const progress = document.getElementById("progress");
  const percent = Math.round((blockIdx + 1) / blocks.length * 100);
  progress.innerHTML = `Fortschritt: ${percent}%`;

  // Felder für diesen Block
  const blockFields = fields.filter(f => blocks[blockIdx].includes(f.key));
  blockFields.forEach(field => {
    // showIf prüfen (für dynamische Felder)
    if (typeof field.showIf === "function" && !field.showIf(formData)) return;
    mainForm.innerHTML += createFieldHTML(field, formData[field.key]);
  });

  // Weiter/Zurück Buttons
  let navHtml = "";
  if (blockIdx > 0)
    navHtml += `<button type="button" id="backBtn">Zurück</button> `;
  if (blockIdx < blocks.length - 1)
    navHtml += `<button type="button" id="nextBtn">Weiter</button>`;
  else
    navHtml += `<button type="submit">Absenden</button>`;
  mainForm.innerHTML += `<div class="nav-buttons">${navHtml}</div>`;

  // Event Listener für Weiter/Zurück
  document.getElementById("mainForm").onsubmit = handleSubmit;
  if (document.getElementById("nextBtn"))
    document.getElementById("nextBtn").onclick = () => { saveBlock(blockIdx); renderForm(blockIdx + 1); };
  if (document.getElementById("backBtn"))
    document.getElementById("backBtn").onclick = () => { renderForm(blockIdx - 1); };

  // Slider Live-Update
  Array.from(document.querySelectorAll('input[type="range"]')).forEach(slider => {
    slider.oninput = (e) => {
      document.getElementById(`${slider.id}-value`).textContent = e.target.value;
    };
  });
}

// --- Block speichern ---
function saveBlock(blockIdx) {
  blocks[blockIdx].forEach(key => {
    const field = fields.find(f => f.key === key);
    if (!field) return;
    if (field.type === "checkbox") {
      formData[key] = Array.from(document.querySelectorAll(`[name="${key}"]:checked`)).map(el => el.value);
    } else {
      const el = document.getElementById(key);
      if (el) formData[key] = el.value;
    }
  });
}

// --- Submit-Handler ---
async function handleSubmit(e) {
  e.preventDefault();
  saveBlock(currentBlock);
  // JWT-Mail anhängen:
  formData.email = getEmailFromJWT(token);

  // API-Call (dein Backend-Endpoint anpassen!)
  try {
    const res = await fetch("/briefing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert("Erfolgreich abgesendet!");
      window.location.href = "/report.html";
    } else {
      alert("Fehler beim Absenden!");
    }
  } catch (err) {
    alert("Netzwerkfehler: " + err.message);
  }
}

// --- Initiales Rendern
document.addEventListener("DOMContentLoaded", function() {
  renderForm(currentBlock);
});

