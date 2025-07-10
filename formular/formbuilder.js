document.addEventListener("DOMContentLoaded", function() {
    const fields = [
        {
            "key": "branche",
            "label": "In welcher Branche ist Ihr Unternehmen hauptsächlich tätig?",
            "type": "select",
            "options": ["Marketing & Werbung", "Beratung & Dienstleistungen", "IT & Software", "Handwerk", "Gesundheitswesen", "Bauwesen", "Handel & E-Commerce", "Industrie/Produktion", "Finanzen & Versicherungen", "Bildung", "Sonstige"]
        },
        {
            "key": "unternehmensgroesse",
            "label": "Wie viele Mitarbeiter:innen hat Ihr Unternehmen?",
            "type": "select",
            "options": ["1 (Solo-Selbstständig)", "2-5", "6-10", "11-25", "26-50", "51-100", "101+"]
        },
        {
            "key": "selbststaendig",
            "label": "Sind Sie selbstständig oder freiberuflich tätig?",
            "type": "select",
            "options": ["Ja", "Nein"]
        },
        {
            "key": "bundesland",
            "label": "Bundesland (regionale Fördermöglichkeiten)",
            "type": "select",
            "options": ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"]
        },
        {
            "key": "hauptleistung",
            "label": "Was ist das Hauptprodukt / die wichtigste Dienstleistung Ihres Unternehmens?",
            "type": "textarea",
            "placeholder": "z. B. Softwareentwicklung, Marketingberatung, CNC-Fertigung"
        },
        {
            "key": "zielgruppen",
            "label": "Wer sind Ihre wichtigsten Zielgruppen oder Kundensegmente? Mehrfachauswahl möglich",
            "type": "checkbox",
            "options": ["B2B", "B2C", "KMU", "Großunternehmen", "Selbstständige", "Öffentliche Hand", "Privatpersonen", "Startups", "Andere"]
        },
        {
            "key": "projektziel",
            "label": "Welches Ziel verfolgen Sie mit Ihrem nächsten KI-/Digitalisierungsprojekt? Mehrfachauswahl möglich.",
            "type": "checkbox",
            "options": ["Prozessautomatisierung", "Kostensenkung", "Compliance/Datenschutz", "Produktinnovation", "Kundenservice verbessern", "Markterschließung", "Personalentlastung", "Fördermittel beantragen", "Andere"]
        },
        {
            "key": "ki_einsatz",
            "label": "Wo wird KI heute bereits in Ihrem Unternehmen eingesetzt? Mehrfachauswahl möglich.",
            "type": "checkbox",
            "options": ["Marketing", "Vertrieb", "Buchhaltung", "Produktion", "Kundenservice", "IT", "Forschung & Entwicklung", "Personal", "Noch keine Nutzung", "Sonstiges"]
        },
        {
            "key": "digitalisierungsgrad",
            "label": "Wie digital sind Ihre internen Prozesse bereits? (1 = analog, 10 = voll digital)",
            "type": "slider",
            "min": 1,
            "max": 10,
            "step": 1
        },
        {
            "key": "prozesse_papierlos",
            "label": "Wie hoch ist der Anteil papierloser Prozesse in Ihrem Unternehmen?",
            "type": "select",
            "options": ["0-20%", "21-50%", "51-80%", "81-100%"]
        },
        {
            "key": "automatisierungsgrad",
            "label": "Wie hoch schätzen Sie den Automatisierungsgrad Ihrer Arbeitsabläufe ein?",
            "type": "select",
            "options": ["Sehr niedrig", "Eher niedrig", "Mittel", "Eher hoch", "Sehr hoch"]
        },
        {
            "key": "ki_knowhow",
            "label": "Wie schätzen Sie das interne KI-Knowhow Ihres Teams ein?",
            "type": "select",
            "options": ["Keine Erfahrung", "Grundkenntnisse", "Mittel", "Fortgeschritten", "Expertenwissen"]
        },
        {
            "key": "ki_projekte",
            "label": "Gibt es geplante oder laufende KI-Projekte?",
            "type": "textarea",
            "placeholder": "z. B. Chatbot, automatisierte Angebotskalkulation"
        },
        {
            "key": "ki_usecases",
            "label": "Für welche Anwendungsfälle möchten Sie KI gezielt nutzen?Mehrfachauswahl möglich.",
            "type": "checkbox",
            "options": ["Texterstellung", "Bildgenerierung", "Spracherkennung", "Prozessautomatisierung", "Datenanalyse & Prognose", "Kundensupport", "Wissensmanagement", "Marketing", "Sonstiges"]
        },
        {
            "key": "ki_potenzial",
            "label": "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
            "type": "textarea",
            "placeholder": "z. B. Automatisierte Berichte, vorausschauende Wartung"
        },
        {
            "key": "usecase_priority",
            "label": "In welchem Geschäftsbereich sollte KI zuerst eingesetzt oder priorisiert werden?",
            "type": "select",
            "options": ["Marketing", "Vertrieb", "Buchhaltung", "Produktion", "Kundenservice", "IT", "Forschung & Entwicklung", "Personal", "Noch unklar"]
        },
        {
            "key": "ki_geschaeftsmodell_vision",
            "label": "Wie könnte KI Ihr Geschäftsmodell oder Ihre Branche grundlegend verändern?",
            "type": "textarea",
            "placeholder": "z. B. Vollständige digitale Plattform, neue Geschäftsmodelle"
        },
        {
            "key": "moonshot",
            "label": "Was wäre ein wirklich großer, mutiger Durchbruch, den Sie sich durch KI wünschen? Was wäre Ihr Traum für Ihr Unternehmen in 3 Jahren mit KI?",
            "type": "textarea",
            "placeholder": "z. B. In 3 Jahren macht KI 70% unserer Vertriebsarbeit"
        },
        {
            "key": "datenschutzbeauftragter",
            "label": "Gibt es in Ihrem Unternehmen einen Datenschutzbeauftragten?",
            "type": "select",
            "options": ["Ja", "Nein", "Teilweise (externer Berater/noch in Planung)"]
        },
        {
            "key": "technische_massnahmen",
            "label": "Welche technischen Maßnahmen (Firewalls, Zugriffskontrolle etc.) sind zum Schutz von Daten vorhanden?",
            "type": "select",
            "options": ["Alle relevanten Maßnahmen vorhanden", "Teilweise umgesetzt", "Noch keine umgesetzt"]
        },
        {
            "key": "folgenabschaetzung",
            "label": "Wurde für KI-Anwendungen eine DSGVO-Folgenabschätzung durchgeführt?",
            "type": "select",
            "options": ["Ja", "Nein", "Teilweise (in Planung)"]
        },
        {
            "key": "meldewege",
            "label": "Gibt es definierte Meldewege bei Datenschutzvorfällen?",
            "type": "select",
            "options": ["Ja", "Teilweise", "Nein"]
        },
        {
            "key": "loeschregeln",
            "label": "Gibt es klare Regeln zur Löschung oder Anonymisierung von Daten?",
            "type": "select",
            "options": ["Ja", "Teilweise", "Nein"]
        },
        {
            "key": "ai_act_kenntnis",
            "label": "Wie gut kennen Sie den EU AI Act und seine Anforderungen?",
            "type": "select",
            "options": ["Sehr gut", "Gut", "Habe davon gehört", "Noch nicht beschäftigt"]
        },
        {
            "key": "ki_hemmnisse",
            "label": "Was sind für Ihr Unternehmen aktuell die größten Hemmnisse oder Risiken beim Einsatz von KI? Mehrfachauswahl möglich.",
            "type": "checkbox",
            "options": ["Unsicherheit bei Rechtslage", "Datenschutz", "Knowhow", "Budget", "Akzeptanz im Team", "Zeitmangel", "IT-Integration", "Keine Hemmnisse", "Andere"]
        },
        {
            "key": "bisherige_foerdermittel",
            "label": "Haben Sie bereits Fördermittel für Digitalisierung oder KI erhalten/genutzt?",
            "type": "select",
            "options": ["Ja", "Nein"]
        },
        {
            "key": "interesse_foerderung",
            "label": "Besteht Interesse an Fördermitteln für KI- oder Digitalisierungsprojekte?",
            "type": "select",
            "options": ["Ja", "Nein", "Unklar"]
        },
        {
            "key": "erfahrung_beratung",
            "label": "Gab es bereits Beratung zum Thema Digitalisierung/KI?",
            "type": "select",
            "options": ["Ja", "Nein", "Unklar"]
        },
        {
            "key": "investitionsbudget",
            "label": "Welches Investitionsbudget planen Sie für KI/Digitalisierung in den nächsten 12 Monaten?",
            "type": "select",
            "options": ["Unter 2.000 €", "2.000–10.000 €", "10.000–50.000 €", "Mehr als 50.000 €", "Noch unklar"]
        },
        {
            "key": "marktposition",
            "label": "Wie schätzen Sie Ihre aktuelle Marktposition im Wettbewerb ein?",
            "type": "select",
            "options": ["Marktführer", "Im oberen Drittel", "Mittelfeld", "Aufholer/Nachzügler", "Schwer einzuschätzen"]
        },
        {
            "key": "benchmark_wettbewerb",
            "label": "Vergleichen Sie Ihre Digitalisierung/KI-Readiness regelmäßig mit Wettbewerbern?",
            "type": "select",
            "options": ["Ja", "Nein", "Selten"]
        },
        {
            "key": "innovationsprozess",
            "label": "Wie werden Innovationen in Ihrem Unternehmen entwickelt?",
            "type": "select",
            "options": ["Durch internes Innovationsteam", "Durch Mitarbeitende", "In Zusammenarbeit mit Kunden", "Externe Berater/Partner", "Zufällig/ungeplant", "Noch nicht definiert"]
        },
        {
            "key": "risikofreude",
            "label": "Wie risikofreudig ist Ihr Unternehmen bei Innovationen?(1 = wenig, 5 = sehr)",
            "type": "slider",
            "min": 1,
            "max": 5,
            "step": 1
        }
    ];

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

        // Sende Daten an Backend
        fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
        .then(async response => {
            const json = await response.json();
            if (json.error) throw new Error(json.error);
            window.open(json.pdf_url, "_blank");
        })
        .catch(err => {
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
