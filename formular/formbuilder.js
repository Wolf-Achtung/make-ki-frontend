// formbuilder.js (Goldlevel, Stand 11.07.2025)
// Frontend für KI-Readiness-Check, vollständig synchronisiert mit Backend-Keys/Values
// Backend-URL hier anpassen! (Railway: Production oder Dev)
const BACKEND_URL = "https://make-ki-backend-neu-production.up.railway.app/briefing";
// Alternativ für lokale Entwicklung: "http://localhost:8000/briefing"

// Formularfelder Definition (alle synchron zu Backend)
const fields = [
  {
    key: "branche",
    label: "In welcher Branche ist Ihr Unternehmen hauptsächlich tätig?",
    type: "select",
    required: true,
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
    ]
  },
  {
    key: "unternehmensgroesse",
    label: "Wie viele Mitarbeitende hat Ihr Unternehmen?",
    type: "select",
    required: true,
    options: [
      { value: "solo", label: "Solo (Selbstständig/Freiberuflich)" },
      { value: "team", label: "Kleines Team (2–10)" },
      { value: "kmu", label: "KMU (11–100)" }
    ]
  },
  {
    key: "selbststaendig",
    label: "Sind Sie selbstständig oder freiberuflich tätig?",
    type: "select",
    required: true,
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ]
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
    ]
  },
  {
    key: "hauptleistung",
    label: "Was ist das Hauptprodukt / die wichtigste Dienstleistung Ihres Unternehmens?",
    type: "textarea",
    placeholder: "z. B. Softwareentwicklung, Marketingberatung, CNC-Fertigung"
  },
  {
    key: "zielgruppen",
    label: "Wer sind Ihre wichtigsten Zielgruppen oder Kundensegmente? (Mehrfachauswahl möglich)",
    type: "checkbox",
    options: [
      { value: "b2b", label: "B2B" },
      { value: "b2c", label: "B2C" },
      { value: "kmu", label: "KMU" },
      { value: "grossunternehmen", label: "Großunternehmen" },
      { value: "selbststaendige", label: "Selbstständige" },
      { value: "oeffentliche_hand", label: "Öffentliche Hand" },
      { value: "privatpersonen", label: "Privatpersonen" },
      { value: "startups", label: "Startups" },
      { value: "andere", label: "Andere" }
    ]
  },
  {
    key: "projektziel",
    label: "Welches Ziel verfolgen Sie mit Ihrem nächsten KI-/Digitalisierungsprojekt? (Mehrfachauswahl möglich)",
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
    ]
  },
  {
    key: "ki_einsatz",
    label: "Wo wird KI heute bereits in Ihrem Unternehmen eingesetzt? (Mehrfachauswahl möglich)",
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
      { value: "noch_keine", label: "Noch keine Nutzung" },
      { value: "sonstiges", label: "Sonstiges" }
    ]
  },
  {
    key: "digitalisierungsgrad",
    label: "Wie digital sind Ihre internen Prozesse bereits? (1 = analog, 10 = voll digital)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1
  },
  {
    key: "prozesse_papierlos",
    label: "Wie hoch ist der Anteil papierloser Prozesse in Ihrem Unternehmen?",
    type: "select",
    options: [
      { value: "0-20", label: "0-20%" },
      { value: "21-50", label: "21-50%" },
      { value: "51-80", label: "51-80%" },
      { value: "81-100", label: "81-100%" }
    ]
  },
  // --- Fortsetzung in Teil 2 ---
];
// --- Fortsetzung fields-Array ---
fields.push(
  {
    key: "automatisierungsgrad",
    label: "Wie hoch schätzen Sie den Automatisierungsgrad Ihrer Arbeitsabläufe ein?",
    type: "select",
    options: [
      { value: "sehr_niedrig", label: "Sehr niedrig" },
      { value: "eher_niedrig", label: "Eher niedrig" },
      { value: "mittel", label: "Mittel" },
      { value: "eher_hoch", label: "Eher hoch" },
      { value: "sehr_hoch", label: "Sehr hoch" }
    ]
  },
  {
    key: "ki_knowhow",
    label: "Wie schätzen Sie das interne KI-Knowhow Ihres Teams ein?",
    type: "select",
    options: [
      { value: "keine", label: "Keine Erfahrung" },
      { value: "grundkenntnisse", label: "Grundkenntnisse" },
      { value: "mittel", label: "Mittel" },
      { value: "fortgeschritten", label: "Fortgeschritten" },
      { value: "expertenwissen", label: "Expertenwissen" }
    ]
  },
  {
    key: "ki_projekte",
    label: "Gibt es geplante oder laufende KI-Projekte?",
    type: "textarea",
    placeholder: "z. B. Chatbot, automatisierte Angebotskalkulation"
  },
  {
    key: "ki_usecases",
    label: "Für welche Anwendungsfälle möchten Sie KI gezielt nutzen? (Mehrfachauswahl möglich)",
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
    ]
  },
  {
    key: "ki_potenzial",
    label: "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "z. B. Automatisierte Berichte, vorausschauende Wartung"
  },
  {
    key: "usecase_priority",
    label: "In welchem Geschäftsbereich sollte KI zuerst eingesetzt oder priorisiert werden?",
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
      { value: "unklar", label: "Noch unklar" }
    ]
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "Wie könnte KI Ihr Geschäftsmodell oder Ihre Branche grundlegend verändern?",
    type: "textarea",
    placeholder: "z. B. Vollständige digitale Plattform, neue Geschäftsmodelle"
  },
  {
    key: "moonshot",
    label: "Was wäre ein wirklich großer, mutiger Durchbruch, den Sie sich durch KI wünschen? Was wäre Ihr Traum für Ihr Unternehmen in 3 Jahren mit KI?",
    type: "textarea",
    placeholder: "z. B. In 3 Jahren macht KI 70% unserer Vertriebsarbeit"
  },
  {
    key: "datenschutzbeauftragter",
    label: "Gibt es in Ihrem Unternehmen einen Datenschutzbeauftragten?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (externer Berater/noch in Planung)" }
    ]
  },
  {
    key: "technische_massnahmen",
    label: "Welche technischen Maßnahmen (Firewalls, Zugriffskontrolle etc.) sind zum Schutz von Daten vorhanden?",
    type: "select",
    options: [
      { value: "alle", label: "Alle relevanten Maßnahmen vorhanden" },
      { value: "teilweise", label: "Teilweise umgesetzt" },
      { value: "keine", label: "Noch keine umgesetzt" }
    ]
  },
  {
    key: "folgenabschaetzung",
    label: "Wurde für KI-Anwendungen eine DSGVO-Folgenabschätzung durchgeführt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (in Planung)" }
    ]
  },
  {
    key: "meldewege",
    label: "Gibt es definierte Meldewege bei Datenschutzvorfällen?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ]
  },
  {
    key: "loeschregeln",
    label: "Gibt es klare Regeln zur Löschung oder Anonymisierung von Daten?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ]
  },
  {
    key: "ai_act_kenntnis",
    label: "Wie gut kennen Sie den EU AI Act und seine Anforderungen?",
    type: "select",
    options: [
      { value: "sehr_gut", label: "Sehr gut" },
      { value: "gut", label: "Gut" },
      { value: "gehoert", label: "Habe davon gehört" },
      { value: "nicht_beschaeftigt", label: "Noch nicht beschäftigt" }
    ]
  },
  {
    key: "ki_hemmnisse",
    label: "Was sind für Ihr Unternehmen aktuell die größten Hemmnisse oder Risiken beim Einsatz von KI? (Mehrfachauswahl möglich)",
    type: "checkbox",
    options: [
      { value: "rechtslage", label: "Unsicherheit bei Rechtslage" },
      { value: "datenschutz", label: "Datenschutz" },
      { value: "knowhow", label: "Knowhow" },
      { value: "budget", label: "Budget" },
      { value: "akzeptanz", label: "Akzeptanz im Team" },
      { value: "zeitmangel", label: "Zeitmangel" },
      { value: "it_integration", label: "IT-Integration" },
      { value: "keine", label: "Keine Hemmnisse" },
      { value: "andere", label: "Andere" }
    ]
  },
  {
    key: "bisherige_foerdermittel",
    label: "Haben Sie bereits Fördermittel für Digitalisierung oder KI erhalten/genutzt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ]
  },
  {
    key: "interesse_foerderung",
    label: "Besteht Interesse an Fördermitteln für KI- oder Digitalisierungsprojekte?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ]
  },
  {
    key: "erfahrung_beratung",
    label: "Gab es bereits Beratung zum Thema Digitalisierung/KI?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ]
  },
  {
    key: "investitionsbudget",
    label: "Welches Investitionsbudget planen Sie für KI/Digitalisierung in den nächsten 12 Monaten?",
    type: "select",
    options: [
      { value: "unter_2000", label: "Unter 2.000 €" },
      { value: "2000_10000", label: "2.000–10.000 €" },
      { value: "10000_50000", label: "10.000–50.000 €" },
      { value: "mehr_50000", label: "Mehr als 50.000 €" },
      { value: "unklar", label: "Noch unklar" }
    ]
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
      { value: "schwer_einschaetzen", label: "Schwer einzuschätzen" }
    ]
  },
  {
    key: "benchmark_wettbewerb",
    label: "Vergleichen Sie Ihre Digitalisierung/KI-Readiness regelmäßig mit Wettbewerbern?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "selten", label: "Selten" }
    ]
  },
  {
    key: "innovationsprozess",
    label: "Wie werden Innovationen in Ihrem Unternehmen entwickelt?",
    type: "select",
    options: [
      { value: "innovationsteam", label: "Durch internes Innovationsteam" },
      { value: "mitarbeitende", label: "Durch Mitarbeitende" },
      { value: "kunden", label: "In Zusammenarbeit mit Kunden" },
      { value: "berater_partner", label: "Externe Berater/Partner" },
      { value: "zufall", label: "Zufällig/ungeplant" },
      { value: "nicht_definiert", label: "Noch nicht definiert" }
    ]
  },
  {
    key: "risikofreude",
    label: "Wie risikofreudig ist Ihr Unternehmen bei Innovationen? (1 = wenig, 5 = sehr)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1
  }
);
// --- Rendering und Logik folgt in Teil 3 ---
// ----------- FORMULAR-RENDERING UND SUBMIT-LOGIK ------------

const form = document.getElementById("formbuilder");
const feedbackBox = document.getElementById("feedback");
let formState = {};

function renderField(field) {
  const fieldWrapper = document.createElement("div");
  fieldWrapper.className = "form-field mb-6"; // Abstand zu anderen Feldern

  // Label
  const label = document.createElement("label");
  label.textContent = field.label + (field.required ? " *" : "");
  label.className = "block font-bold mb-1";
  label.setAttribute("for", field.key);
  fieldWrapper.appendChild(label);

  // Feld-Typen
  if (field.type === "select") {
    const select = document.createElement("select");
    select.id = field.key;
    select.name = field.key;
    select.required = field.required || false;
    select.className = "w-full border rounded p-2";
    select.innerHTML = `<option value="">Bitte wählen...</option>`;
    field.options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    fieldWrapper.appendChild(select);
  }
  else if (field.type === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.id = field.key;
    textarea.name = field.key;
    textarea.placeholder = field.placeholder || "";
    textarea.className = "w-full border rounded p-2";
    fieldWrapper.appendChild(textarea);
  }
  else if (field.type === "checkbox") {
    const optionsDiv = document.createElement("div");
    optionsDiv.className = "flex flex-wrap gap-3 mt-2"; // Abstand über Frage
    field.options.forEach(opt => {
      const cbLabel = document.createElement("label");
      cbLabel.className = "flex items-center gap-2 mr-4";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.name = field.key;
      cb.value = opt.value;
      cbLabel.appendChild(cb);
      cbLabel.appendChild(document.createTextNode(opt.label));
      optionsDiv.appendChild(cbLabel);
    });
    fieldWrapper.appendChild(optionsDiv);
  }
  else if (field.type === "slider") {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = field.key;
    slider.name = field.key;
    slider.min = field.min;
    slider.max = field.max;
    slider.step = field.step;
    slider.value = field.min;
    slider.className = "w-full";
    fieldWrapper.appendChild(slider);

    // Zahl-Anzeige daneben
    const valSpan = document.createElement("span");
    valSpan.id = field.key + "_value";
    valSpan.className = "ml-3 font-mono";
    valSpan.textContent = field.min;
    slider.addEventListener("input", () => valSpan.textContent = slider.value);
    fieldWrapper.appendChild(valSpan);
  }

  return fieldWrapper;
}

function renderForm() {
  form.innerHTML = ""; // Reset
  fields.forEach(f => form.appendChild(renderField(f)));

  // Datenschutz-Checkbox
  const datenschutzDiv = document.createElement("div");
  datenschutzDiv.className = "mb-6 mt-6";
  const datenschutzBox = document.createElement("input");
  datenschutzBox.type = "checkbox";
  datenschutzBox.id = "datenschutz_ok";
  datenschutzBox.name = "datenschutz_ok";
  datenschutzBox.required = true;
  datenschutzBox.className = "mr-2";
  const datenschutzLabel = document.createElement("label");
  datenschutzLabel.setAttribute("for", "datenschutz_ok");
  datenschutzLabel.innerHTML = `
    Ich habe die <a href="/datenschutz.html" target="_blank" class="underline text-blue-700">Datenschutzerklärung</a> gelesen und akzeptiert.
  `;
  datenschutzDiv.appendChild(datenschutzBox);
  datenschutzDiv.appendChild(datenschutzLabel);
  form.appendChild(datenschutzDiv);

  // Submit-Button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "bg-blue-700 text-white rounded px-6 py-3 font-bold w-full shadow-md hover:bg-blue-900 transition";
  submitBtn.textContent = "Report erstellen";
  form.appendChild(submitBtn);
}

// Formular absenden
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  feedbackBox.textContent = "";
  feedbackBox.className = "";

  // Datenerfassung (inkl. Checkboxen als Array)
  const data = {};
  fields.forEach(f => {
    if (f.type === "checkbox") {
      data[f.key] = [];
      document.querySelectorAll(`input[name="${f.key}"]:checked`).forEach(cb => {
        data[f.key].push(cb.value);
      });
    } else if (f.type === "slider") {
      data[f.key] = document.getElementById(f.key).value;
    } else {
      data[f.key] = document.getElementById(f.key)?.value || "";
    }
  });
  data["datenschutz_ok"] = document.getElementById("datenschutz_ok").checked;

  // Validierung
  if (!data["datenschutz_ok"]) {
    feedbackBox.textContent = "Bitte Datenschutzerklärung akzeptieren!";
    feedbackBox.className = "text-red-600 font-bold mb-4";
    return;
  }

  // Feedback Loading
  feedbackBox.textContent = "Report wird erstellt…";
  feedbackBox.className = "text-blue-800 font-bold mb-4";

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const resJson = await response.json();
      // Annahme: { pdf_url: "...", ... }
      if (resJson.pdf_url) {
        feedbackBox.innerHTML = `<a href="${resJson.pdf_url}" target="_blank" class="text-blue-800 underline font-bold">Report als PDF herunterladen</a>`;
      } else {
        feedbackBox.textContent = "Report erstellt! (Aber kein Download-Link erhalten.)";
      }
    } else {
      throw new Error("Fehler vom Server: " + response.status);
    }
  } catch (err) {
    feedbackBox.textContent = "Fehler beim Erstellen des Reports: " + err.message;
    feedbackBox.className = "text-red-600 font-bold mb-4";
  }
});

document.addEventListener("DOMContentLoaded", renderForm);
