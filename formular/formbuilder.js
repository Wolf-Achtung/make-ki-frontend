document.addEventListener("DOMContentLoaded", function () {
    // Statt fetch: direkter Import des Fields-Arrays
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

    function buildForm(fields) {
        const form = document.getElementById("dynamic-form");
        fields.forEach(field => {
            const div = document.createElement("div");
            div.className = "form-group";

            const label = document.createElement("label");
            label.textContent = field.label;
            div.appendChild(label);

            if (field.type === "text" || field.type === "textarea") {
                const input = document.createElement(field.type === "textarea" ? "textarea" : "input");
                if (field.type === "text") input.type = "text";
                if (field.placeholder) input.placeholder = field.placeholder;
                input.name = field.key;
                div.appendChild(input);
            } else if (field.type === "select") {
                const select = document.createElement("select");
                select.name = field.key;
                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.textContent = opt;
                    select.appendChild(option);
                });
                div.appendChild(select);
            } else if (field.type === "checkbox") {
                field.options.forEach(opt => {
                    const checkboxLabel = document.createElement("label");
                    checkboxLabel.style.display = "block";
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.name = field.key;
                    checkbox.value = opt;
                    checkboxLabel.appendChild(checkbox);
                    checkboxLabel.append(` ${opt}`);
                    div.appendChild(checkboxLabel);
                });
            } else if (field.type === "slider") {
                const input = document.createElement("input");
                input.type = "range";
                input.min = field.min;
                input.max = field.max;
                input.step = field.step;
                input.name = field.key;

                const output = document.createElement("span");
                output.style.marginLeft = "10px";
                output.textContent = input.value;

                input.addEventListener("input", () => {
                    output.textContent = input.value;
                });

                div.appendChild(input);
                div.appendChild(output);
            }

            form.insertBefore(div, form.lastElementChild);
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            showLoadingOverlay();

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

            fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            })
            .then(response => response.blob())
            .then(blob => {
                hideLoadingOverlay();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "KI-Readiness-Report.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(() => {
                hideLoadingOverlay();
                alert("Beim Erstellen des Berichts ist ein Fehler aufgetreten.");
            });
        });
    }

    function showLoadingOverlay() {
        const overlay = document.createElement("div");
        overlay.id = "loading-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(255,255,255,0.9)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        const spinner = document.createElement("div");
        spinner.style.width = "60px";
        spinner.style.height = "60px";
        spinner.style.border = "6px solid #4a90e2";
        spinner.style.borderTop = "6px solid transparent";
        spinner.style.borderRadius = "50%";
        spinner.style.animation = "spin 1s linear infinite";
        overlay.appendChild(spinner);

        const text = document.createElement("div");
        text.style.marginTop = "20px";
        text.style.fontSize = "1.2em";
        text.style.color = "#333";
        text.textContent = 'Der individuelle KI-Report wird erstellt. Fas kann bis zu 10 Minuten dauern...';
        overlay.appendChild(text);

        document.body.appendChild(overlay);

        const style = document.createElement("style");
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    function hideLoadingOverlay() {
        const overlay = document.getElementById("loading-overlay");
        if (overlay) overlay.remove();
    }
});