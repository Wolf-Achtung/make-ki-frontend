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
      ],
      required: true
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
      ],
      required: true
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
        { value: "forschung", label: "Forschung & Entwicklung" },
        { value: "personal", label: "Personal" },
        { value: "keine", label: "Noch keine Nutzung" },
        { value: "sonstiges", label: "Sonstiges" }
      ],
      required: false
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
      ],
      required: true
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
      ],
      required: true
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
      ],
      required: true
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
      ],
      required: false
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
      ],
      required: false
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
      label: "Was sind für Ihr Unternehmen aktuell die größten Hemmnisse oder Risiken beim Einsatz von KI? Mehrfachauswahl möglich.",
      type: "checkbox",
      options: [
        { value: "rechtsunsicherheit", label: "Unsicherheit bei Rechtslage" },
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
        { value: "2000-10000", label: "2.000–10.000 €" },
        { value: "10000-50000", label: "10.000–50.000 €" },
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
        { value: "oben", label: "Im oberen Drittel" },
        { value: "mittelfeld", label: "Mittelfeld" },
        { value: "aufholer", label: "Aufholer/Nachzügler" },
        { value: "schwer", label: "Schwer einzuschätzen" }
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
        { value: "internes_team", label: "Durch internes Innovationsteam" },
        { value: "mitarbeitende", label: "Durch Mitarbeitende" },
        { value: "kunden", label: "In Zusammenarbeit mit Kunden" },
        { value: "berater", label: "Externe Berater/Partner" },
        { value: "zufaellig", label: "Zufällig/ungeplant" },
        { value: "nicht_definiert", label: "Noch nicht definiert" }
      ]
    },
    {
      key: "risikofreude",
      label: "Wie risikofreudig ist Ihr Unternehmen bei Innovationen?(1 = wenig, 5 = sehr)",
      type: "slider",
      min: 1,
      max: 5,
      step: 1
    }
  ];
  // Hilfsfunktion: Field Rendering
  function renderField(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group mb-4";
    const label = document.createElement("label");
    label.innerText = field.label;
    label.htmlFor = field.key;
    wrapper.appendChild(label);

    // Render nach Feldtyp
    if (field.type === "select") {
      const select = document.createElement("select");
      select.id = select.name = field.key;
      select.className = "form-control";
      select.required = !!field.required;
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.innerText = "Bitte auswählen...";
      select.appendChild(defaultOption);
      field.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.innerText = opt.label;
        select.appendChild(option);
      });
      wrapper.appendChild(select);
    }
    else if (field.type === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.id = textarea.name = field.key;
      textarea.className = "form-control";
      textarea.placeholder = field.placeholder || "";
      textarea.required = !!field.required;
      wrapper.appendChild(textarea);
    }
    else if (field.type === "checkbox") {
      const group = document.createElement("div");
      field.options.forEach(opt => {
        const cbWrapper = document.createElement("div");
        cbWrapper.className = "form-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `${field.key}_${opt.value}`;
        input.name = field.key;
        input.value = opt.value;
        input.className = "form-check-input";
        cbWrapper.appendChild(input);
        const cbLabel = document.createElement("label");
        cbLabel.htmlFor = input.id;
        cbLabel.innerText = opt.label;
        cbLabel.className = "form-check-label";
        cbWrapper.appendChild(cbLabel);
        group.appendChild(cbWrapper);
      });
      wrapper.appendChild(group);
    }
    else if (field.type === "slider") {
      const input = document.createElement("input");
      input.type = "range";
      input.id = input.name = field.key;
      input.className = "form-range";
      input.min = field.min;
      input.max = field.max;
      input.step = field.step || 1;
      input.value = field.min;
      const output = document.createElement("span");
      output.className = "ms-2 slider-value";
      output.innerText = field.min;
      input.addEventListener("input", () => output.innerText = input.value);
      wrapper.appendChild(input);
      wrapper.appendChild(output);
    }
    return wrapper;
  }

  // Formular dynamisch bauen
  const form = document.getElementById("ki-form");
  fields.forEach(field => form.appendChild(renderField(field)));

  // Submit-Handler
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const formData = {};
    fields.forEach(field => {
      if (field.type === "checkbox") {
        const checked = Array.from(form.querySelectorAll(`[name="${field.key}"]:checked`)).map(cb => cb.value);
        formData[field.key] = checked;
      } else if (field.type === "slider") {
        formData[field.key] = form[field.key].value;
      } else {
        formData[field.key] = form[field.key].value;
      }
    });

    // Optional: Ladeanimation
    document.getElementById("feedback").innerHTML = "Analyse wird durchgeführt ...";

    // POST an Backend
    try {
      const res = await fetch("/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json && json.pdf_url) {
        document.getElementById("feedback").innerHTML =
          `<div class="alert alert-success">
            <b>Analyse abgeschlossen!</b><br>
            <a href="${json.pdf_url}" target="_blank" class="btn btn-primary mt-2">PDF-Report anzeigen & herunterladen</a>
          </div>`;
      } else {
        document.getElementById("feedback").innerHTML =
          `<div class="alert alert-danger">Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.</div>`;
      }
    } catch (e) {
      document.getElementById("feedback").innerHTML =
        `<div class="alert alert-danger">Fehler beim Senden des Formulars. ${e}</div>`;
    }
  });
});
