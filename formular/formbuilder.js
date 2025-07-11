document.addEventListener("DOMContentLoaded", function() {
    const fields = [
  {
    key: "branche",
    label: "In welcher Branche ist Ihr Unternehmen hauptsächlich tätig?",
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
    required: true
  },
  {
    key: "unternehmensgroesse",
    label: "Wie viele Mitarbeiter:innen hat Ihr Unternehmen?",
    type: "select",
    options: [
      { value: "solo", label: "Solo-Selbstständig" },
      { value: "klein", label: "Kleines Team (2–5)" },
      { value: "team", label: "Größeres Team (6–10)" },
      { value: "kmu", label: "KMU (11–100)" },
      { value: "gross", label: "101+" }
    ],
    required: true
  },
  {
    key: "selbststaendig",
    label: "Sind Sie selbstständig oder freiberuflich tätig?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    required: true
  },
  {
    key: "bundesland",
    label: "Bundesland (regionale Fördermöglichkeiten)",
    type: "select",
    options: [
      { value: "baden-wuerttemberg", label: "Baden-Württemberg" },
      { value: "bayern", label: "Bayern" },
      { value: "berlin", label: "Berlin" },
      { value: "brandenburg", label: "Brandenburg" },
      { value: "bremen", label: "Bremen" },
      { value: "hamburg", label: "Hamburg" },
      { value: "hessen", label: "Hessen" },
      { value: "mecklenburg-vorpommern", label: "Mecklenburg-Vorpommern" },
      { value: "niedersachsen", label: "Niedersachsen" },
      { value: "nordrhein-westfalen", label: "Nordrhein-Westfalen" },
      { value: "rheinland-pfalz", label: "Rheinland-Pfalz" },
      { value: "saarland", label: "Saarland" },
      { value: "sachsen", label: "Sachsen" },
      { value: "sachsen-anhalt", label: "Sachsen-Anhalt" },
      { value: "schleswig-holstein", label: "Schleswig-Holstein" },
      { value: "thueringen", label: "Thüringen" }
    ],
    required: true
  },
  {
    key: "hauptleistung",
    label: "Was ist das Hauptprodukt / die wichtigste Dienstleistung Ihres Unternehmens?",
    type: "textarea",
    placeholder: "z. B. Softwareentwicklung, Marketingberatung, CNC-Fertigung",
    required: true
  },
  {
    key: "zielgruppen",
    label: "Wer sind Ihre wichtigsten Zielgruppen oder Kundensegmente? Mehrfachauswahl möglich",
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
    label: "Welches Ziel verfolgen Sie mit Ihrem nächsten KI-/Digitalisierungsprojekt? Mehrfachauswahl möglich.",
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
    label: "Wo wird KI heute bereits in Ihrem Unternehmen eingesetzt? Mehrfachauswahl möglich.",
    type: "checkbox",
    options: [
      { value: "marketing", label: "Marketing" },
      { value: "vertrieb", label: "Vertrieb" },
      { value: "buchhaltung", label: "Buchhaltung" },
      { value: "produktion", label: "Produktion" },
      { value: "kundenservice", label: "Kundenservice" },
      { value: "it", label: "IT" },
      { value: "forschung_entwicklung", label: "Forschung & Entwicklung" },
      { value: "personal", label: "Personal" },
      { value: "keine_nutzung", label: "Noch keine Nutzung" },
      { value: "sonstiges", label: "Sonstiges" }
    ]
  },
  {
    key: "digitalisierungsgrad",
    label: "Wie digital sind Ihre internen Prozesse bereits? (1 = analog, 10 = voll digital)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    required: true
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
    label: "Für welche Anwendungsfälle möchten Sie KI gezielt nutzen? Mehrfachauswahl möglich.",
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
      { value: "forschung_entwicklung", label: "Forschung & Entwicklung" },
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
      { value: "vollstaendig", label: "Alle relevanten Maßnahmen vorhanden" },
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
    label: "Was sind für Ihr Unternehmen aktuell die größten Hemmnisse oder Risiken beim Einsatz von KI? Mehrfachauswahl möglich.",
    type: "checkbox",
    options: [
      { value: "rechtsunsicherheit", label: "Unsicherheit bei Rechtslage" },
      { value: "datenschutz", label: "Datenschutz" },
      { value: "knowhow", label: "Knowhow" },
      { value: "budget", label: "Budget" },
      { value: "teamakzeptanz", label: "Akzeptanz im Team" },
      { value: "zeitmangel", label: "Zeitmangel" },
      { value: "it_integration", label: "IT-Integration" },
      { value: "keine_hemmnisse", label: "Keine Hemmnisse" },
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
      { value: "ueber_50000", label: "Mehr als 50.000 €" },
      { value: "unklar", label: "Noch unklar" }
    ]
  },
  {
    key: "marktposition",
    label: "Wie schätzen Sie Ihre aktuelle Marktposition im Wettbewerb ein?",
    type: "select",
    options: [
      { value: "marktfuehrer", label: "Marktführer" },
      { value: "oben", label: "Im oberen Drittel" },
      { value: "mittelfeld", label: "Mittelfeld" },
      { value: "aufholer", label: "Aufholer/Nachzügler" },
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
      { value: "berater", label: "Externe Berater/Partner" },
      { value: "ungeplant", label: "Zufällig/ungeplant" },
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
];

// Dein bisheriger Code zum Rendern/Verarbeiten der Felder bleibt im Grundsatz erhalten.
// Wichtig: Beim Parsen/Auswerten IMMER die Value-Keys verwenden!


    buildForm(fields);

    document.getElementById("dynamic-form").addEventListener("submit", function(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) data[key] = [data[key]];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        // Datenschutz-Checkbox prüfen
        const dsCheck = form.querySelector('input[name="datenschutz_ok"]');
        data["datenschutz_ok"] = dsCheck && dsCheck.checked ? true : false;

        // --- User-Feedback: Loader anzeigen ---
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        const oldBtnText = submitBtn.textContent;
        submitBtn.textContent = "Report wird erstellt ... bitte warten";
        
        // Sende Daten an Backend
        fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
        .then(async response => {
            const json = await response.json();
            if (json.error) throw new Error(json.error);

            // Erfolgsnachricht statt Sofort-Download
            submitBtn.textContent = "Report erfolgreich erstellt!";
            submitBtn.style.background = "#059e3b";
            // Download-Link anzeigen
            const resultDiv = document.createElement("div");
            resultDiv.style.marginTop = "24px";
            resultDiv.style.padding = "18px";
            resultDiv.style.background = "#e5f8e6";
            resultDiv.style.borderRadius = "8px";
            resultDiv.style.textAlign = "center";
            let url = json.pdf_url;
            if (url && !url.startsWith("http")) {
                url = "https://make-ki-backend-neu-production.up.railway.app" + url;
            }
            resultDiv.innerHTML = `
                <b>Dein individueller Report wurde erfolgreich erstellt.</b><br>
                <a href="${url}" target="_blank" style="display:inline-block;margin-top:12px;padding:8px 18px;background:#005EB8;color:white;border-radius:4px;text-decoration:none;">Report als PDF öffnen</a>
            `;
            form.parentNode.insertBefore(resultDiv, form.nextSibling);

            // Formular wieder benutzbar machen (optional, oder Button ausgegraut lassen)
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = oldBtnText;
                submitBtn.style.background = "#005EB8";
            }, 5000);

        })
        .catch(err => {
            submitBtn.disabled = false;
            submitBtn.textContent = oldBtnText;
            alert("Beim Erstellen des Berichts ist ein Fehler aufgetreten: " + err.message);
        });
    });
});

// --------------------------------------
// Dynamischer Formbuilder
// --------------------------------------
function buildForm(fields) {
    const form = document.getElementById("dynamic-form");
    form.innerHTML = ""; // vorherigen Inhalt leeren

    fields.forEach(field => {
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "18px";

        const label = document.createElement("label");
        label.style.display = "block";
        label.style.fontWeight = "bold";
        label.style.marginBottom = "6px";
        label.textContent = field.label;

        let inputElem;

        // --- SELECT ---
        if (field.type === "select") {
            inputElem = document.createElement("select");
            inputElem.name = field.key;
            inputElem.style.width = "100%";
            inputElem.style.padding = "0.5em";
            inputElem.style.borderRadius = "4px";
            field.options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt;
                inputElem.appendChild(option);
            });
        }
        // --- TEXTAREA ---
        else if (field.type === "textarea") {
            inputElem = document.createElement("textarea");
            inputElem.name = field.key;
            inputElem.placeholder = field.placeholder || "";
            inputElem.rows = 3;
            inputElem.style.width = "100%";
            inputElem.style.padding = "0.5em";
            inputElem.style.borderRadius = "4px";
        }
        // --- CHECKBOX-GRUPPE ---
        else if (field.type === "checkbox") {
            inputElem = document.createElement("div");
            field.options.forEach(opt => {
                const checkboxWrapper = document.createElement("label");
                checkboxWrapper.style.display = "inline-block";
                checkboxWrapper.style.marginRight = "15px";
                checkboxWrapper.style.fontWeight = "normal";
                const box = document.createElement("input");
                box.type = "checkbox";
                box.name = field.key;
                box.value = opt;
                checkboxWrapper.appendChild(box);
                checkboxWrapper.appendChild(document.createTextNode(" " + opt));
                inputElem.appendChild(checkboxWrapper);
            });
        }
        // --- SLIDER ---
        else if (field.type === "slider") {
            inputElem = document.createElement("input");
            inputElem.type = "range";
            inputElem.name = field.key;
            inputElem.min = field.min;
            inputElem.max = field.max;
            inputElem.step = field.step || 1;
            inputElem.value = field.min;
            inputElem.style.width = "70%";

            // Value-Anzeige
            const valueLabel = document.createElement("span");
            valueLabel.style.marginLeft = "12px";
            valueLabel.textContent = inputElem.value;
            inputElem.addEventListener("input", function() {
                valueLabel.textContent = this.value;
            });
            wrapper.appendChild(valueLabel);
        }
        // --- DEFAULT (Text) ---
        else {
            inputElem = document.createElement("input");
            inputElem.type = "text";
            inputElem.name = field.key;
            inputElem.placeholder = field.placeholder || "";
            inputElem.style.width = "100%";
            inputElem.style.padding = "0.5em";
            inputElem.style.borderRadius = "4px";
        }

        label.appendChild(document.createElement("br"));
        wrapper.appendChild(label);
        wrapper.appendChild(inputElem);
        form.appendChild(wrapper);
    });

    // --- Datenschutz-Checkbox ---
    const dsDiv = document.createElement("div");
    dsDiv.style.marginBottom = "18px";
    dsDiv.innerHTML = `
        <label style="font-weight:normal">
            <input type="checkbox" name="datenschutz_ok" style="margin-right:8px">
            Ich akzeptiere die <a href="/datenschutz.html" target="_blank">Datenschutzerklärung</a>.
        </label>
    `;
    form.appendChild(dsDiv);

    // --- Submit-Button ---
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Individuellen Report erstellen";
    submitBtn.style.marginTop = "12px";
    submitBtn.style.padding = "0.75em 2em";
    submitBtn.style.background = "#005EB8";
    submitBtn.style.color = "white";
    submitBtn.style.border = "none";
    submitBtn.style.borderRadius = "4px";
    submitBtn.style.cursor = "pointer";
    form.appendChild(submitBtn);
}
