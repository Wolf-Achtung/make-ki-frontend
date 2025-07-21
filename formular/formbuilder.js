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

// Optionaler Admin-Button für Demo-Auslösung
window.addEventListener("DOMContentLoaded", () => {
  if (isAdmin(token)) {
    const btn = document.createElement("button");
    btn.innerText = "🧪 Demo-Daten absenden";
    btn.style = "margin-bottom:20px;background:#eee;border:1px solid #ccc;padding:8px 12px;cursor:pointer;";
    btn.onclick = async () => {
      const demo = await fetch("demodaten.json").then(r => r.json());
      const res = await fetch("https://make-ki-backend-neu-production.up.railway.app/api/briefing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(demo)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "KI-Readiness-Report-DEMO.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert("Demo-PDF erfolgreich erstellt.");
      } else {
        alert("Fehler beim Senden der Demo-Daten.");
      }
    };
    document.body.insertBefore(btn, document.getElementById("formbuilder"));
  }
});

// -- Hier folgt dein komplettes "fields"-Array (wie gehabt) --
// (Du kannst es aus deiner Datei komplett übernehmen. Keine Änderungen hier nötig!)
// ...fields = [ ... ] ;
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
    description: "Die Branche bestimmt die Benchmarks, Tool-Empfehlungen und branchenspezifische Auswertung. Bitte wählen Sie die Hauptbranche aus, für die Sie den Report erstellen."
  },
  {
    key: "unternehmensgroesse",
    label: "Wie viele Mitarbeiter:innen hat Ihr Unternehmen?",
    type: "select",
    options: [
      { value: "solo", label: "1 (Solo-Selbstständig/Freiberuflich)" },
      { value: "team", label: "2–10 (Kleines Team)" },
      { value: "kmu", label: "11–100 (KMU)" }
    ],
    description: "Die Unternehmensgröße beeinflusst Score, Fördermittel-Optionen, empfohlene Tools und Praxisbeispiele."
  },
  {
    key: "selbststaendig",
    label: "Sind Sie selbstständig oder freiberuflich tätig?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    description: "Wählen Sie 'Ja', falls Sie das Unternehmen allein führen – z. B. Einzelunternehmer:in, Freelancer, Solopreneur. So erhalten Sie individuelle Empfehlungen für Einzelunternehmen."
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
    description: "Fördermittel und rechtliche Rahmenbedingungen sind oft länderspezifisch. Ihr Bundesland wird für die individuellen Empfehlungen benötigt."
  },
  {
    key: "hauptleistung",
    label: "Was ist das Hauptprodukt / die wichtigste Dienstleistung Ihres Unternehmens?",
    type: "textarea",
    placeholder: "z. B. Softwareentwicklung, Marketingberatung, CNC-Fertigung",
    description: "Beschreiben Sie Ihr Kerngeschäft möglichst präzise, damit die Analyse und die Tools auf Ihren konkreten Geschäftszweck zugeschnitten werden können."
  },
  {
    key: "zielgruppen",
    label: "Wer sind Ihre wichtigsten Zielgruppen oder Kundensegmente?",
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
    description: "Wählen Sie alle Segmente aus, für die Ihr Unternehmen Angebote oder Leistungen bereitstellt. Die Zielgruppen beeinflussen Empfehlungen für KI-Usecases, Marketing und Automatisierung."
  },
  {
    key: "projektziel",
    label: "Welches Ziel verfolgen Sie mit Ihrem nächsten KI-/Digitalisierungsprojekt?",
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
    description: "Wählen Sie die Hauptziele Ihrer nächsten Projekte. Das hilft, die Analyse und die Empfehlungen auf Ihre Unternehmensziele auszurichten. Mehrfachauswahl möglich."
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
    key: "digitalisierungsgrad",
    label: "Wie digital sind Ihre internen Prozesse bereits? (1 = analog, 10 = voll digital)",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    description: "Einschätzung auf einer Skala von 1 (überwiegend Papier, keine Automatisierung) bis 10 (voll digitalisierte, integrierte Systeme in allen Prozessen)."
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
    description: "Wählen Sie die grobe Schätzung, wie viel Prozent Ihrer Prozesse und Dokumente bereits komplett ohne Papier funktionieren."
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
    description: "Automatisierung bedeutet, dass Arbeitsabläufe ohne manuelles Eingreifen ablaufen. Schätzen Sie: Sind viele Arbeitsschritte noch manuell, oder ist vieles automatisiert (z. B. durch KI, Scripte, Tools)?"
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
    description: "Wie fit ist Ihr Team, was KI-Technologien und deren Einsatz betrifft? Nutzen Sie KI bereits aktiv oder haben Sie KI-Expert:innen im Haus?"
  },
  {
    key: "ki_projekte",
    label: "Gibt es geplante oder laufende KI-Projekte?",
    type: "textarea",
    placeholder: "z. B. Chatbot, automatisierte Angebotskalkulation",
    description: "Beschreiben Sie kurz, ob es schon erste KI-Projekte oder Überlegungen gibt (z. B. Automatisierung, Vorhersagemodelle, Datenanalyse, etc.)."
  },
  {
    key: "ki_usecases",
    label: "Für welche Anwendungsfälle möchten Sie KI gezielt nutzen?",
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
    description: "Wählen Sie alle KI-Anwendungsfelder aus, die Sie interessieren. Das hilft bei der gezielten Auswertung und der Tool-Empfehlung."
  },
  {
    key: "ki_potenzial",
    label: "Wo sehen Sie das größte Potenzial für KI in Ihrem Unternehmen?",
    type: "textarea",
    placeholder: "z. B. Automatisierte Berichte, vorausschauende Wartung",
    description: "Tragen Sie frei Ihre Einschätzung ein – das kann eine Vision, ein konkretes Problem oder eine strategische Idee sein."
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
      { value: "unbekannt", label: "Noch unklar" }
    ],
    description: "Wo versprechen Sie sich den größten Nutzen durch den ersten/weitern KI-Einsatz? Gibt es einen Bereich, der am meisten profitieren würde?"
  },
  {
    key: "ki_geschaeftsmodell_vision",
    label: "Wie könnte KI Ihr Geschäftsmodell oder Ihre Branche grundlegend verändern?",
    type: "textarea",
    placeholder: "z. B. Vollständige digitale Plattform, neue Geschäftsmodelle",
    description: "Welche großen Chancen oder Veränderungen sehen Sie durch KI in Ihrer Branche? Wo erwarten Sie langfristig disruptive Innovationen, neue Produkte oder Marktchancen?"
  },
  {
    key: "moonshot",
    label: "Was wäre ein wirklich großer, mutiger Durchbruch, den Sie sich durch KI wünschen? Was wäre Ihr Traum für Ihr Unternehmen in 3 Jahren mit KI?",
    type: "textarea",
    placeholder: "z. B. In 3 Jahren macht KI 70% unserer Vertriebsarbeit",
    description: "Denken Sie groß! Formulieren Sie einen echten 'Moonshot' für Ihr Unternehmen – also einen visionären KI-Erfolg, der alles verändert."
  },
  {
    key: "datenschutzbeauftragter",
    label: "Gibt es in Ihrem Unternehmen einen Datenschutzbeauftragten?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (externer Berater/noch in Planung)" }
    ],
    description: "Eine verantwortliche Person für Datenschutz ist in vielen Unternehmen Pflicht – egal ob intern oder extern (z. B. Dienstleister)."
  },
  {
    key: "technische_massnahmen",
    label: "Welche technischen Maßnahmen (Firewalls, Zugriffskontrolle etc.) sind zum Schutz von Daten vorhanden?",
    type: "select",
    options: [
      { value: "alle", label: "Alle relevanten Maßnahmen vorhanden" },
      { value: "teilweise", label: "Teilweise umgesetzt" },
      { value: "keine", label: "Noch keine umgesetzt" }
    ],
    description: "Technische Maßnahmen sind für Datenschutz und Cyber-Sicherheit essentiell. Wählen Sie den aktuellen Umsetzungsgrad aus."
  },
  {
    key: "folgenabschaetzung",
    label: "Wurde für KI-Anwendungen eine DSGVO-Folgenabschätzung durchgeführt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "teilweise", label: "Teilweise (in Planung)" }
    ],
    description: "Bei sensiblen KI-Systemen ist oft eine Datenschutz-Folgenabschätzung (DSFA) notwendig. Das erhöht Rechtssicherheit und Vertrauen."
  },
  {
    key: "meldewege",
    label: "Gibt es definierte Meldewege bei Datenschutzvorfällen?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Gibt es klare Prozesse, wie mit möglichen Datenschutzverletzungen umgegangen wird (z. B. interne Meldestelle, externes Reporting)?"
  },
  {
    key: "loeschregeln",
    label: "Gibt es klare Regeln zur Löschung oder Anonymisierung von Daten?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "teilweise", label: "Teilweise" },
      { value: "nein", label: "Nein" }
    ],
    description: "Wählen Sie aus, ob Daten-Löschkonzepte in Ihrem Unternehmen vorhanden sind – wichtig für DSGVO-Konformität und IT-Sicherheit."
  },
  {
    key: "ai_act_kenntnis",
    label: "Wie gut kennen Sie den EU AI Act und seine Anforderungen?",
    type: "select",
    options: [
      { value: "sehr_gut", label: "Sehr gut" },
      { value: "gut", label: "Gut" },
      { value: "gehört", label: "Habe davon gehört" },
      { value: "unbekannt", label: "Noch nicht beschäftigt" }
    ],
    description: "Der neue EU AI Act bringt strenge Pflichten für viele KI-Anwendungen. Wo schätzen Sie sich und Ihr Team aktuell ein?"
  },
  {
    key: "ki_hemmnisse",
    label: "Was sind für Ihr Unternehmen aktuell die größten Hemmnisse oder Risiken beim Einsatz von KI?",
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
    description: "Mehrfachauswahl möglich. Was blockiert aktuell den (weiteren) Einsatz von KI? Je ehrlicher Sie sind, desto gezielter kann beraten werden."
  },
  {
    key: "bisherige_foerdermittel",
    label: "Haben Sie bereits Fördermittel für Digitalisierung oder KI erhalten/genutzt?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" }
    ],
    description: "Fördermittel helfen, Projekte zu realisieren. Wenn Sie bereits Erfahrungen damit gemacht haben, hilft das bei der Einschätzung weiterer Programme."
  },
  {
    key: "interesse_foerderung",
    label: "Besteht Interesse an Fördermitteln für KI- oder Digitalisierungsprojekte?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ],
    description: "Möchten Sie gezielt passende Fördermöglichkeiten recherchieren lassen und in Ihre Roadmap aufnehmen?"
  },
  {
    key: "erfahrung_beratung",
    label: "Gab es bereits Beratung zum Thema Digitalisierung/KI?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "unklar", label: "Unklar" }
    ],
    description: "Externe Beratung kann helfen, blinde Flecken zu vermeiden. Je nach Erfahrung werden die Empfehlungen im Report anders gewichtet."
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
    ],
    description: "Schätzen Sie, welches Budget im nächsten Jahr für KI oder Digitalisierung verfügbar sein wird (inkl. externer Mittel/Förderung)."
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
      { value: "unsicher", label: "Schwer einzuschätzen" }
    ],
    description: "Wie sehen Sie Ihr Unternehmen aktuell im Vergleich zum Wettbewerb? Das hilft, Benchmark-Analysen präziser einzuordnen."
  },
  {
    key: "benchmark_wettbewerb",
    label: "Vergleichen Sie Ihre Digitalisierung/KI-Readiness regelmäßig mit Wettbewerbern?",
    type: "select",
    options: [
      { value: "ja", label: "Ja" },
      { value: "nein", label: "Nein" },
      { value: "selten", label: "Selten" }
    ],
    description: "Wird aktiv beobachtet, wie digital bzw. KI-fit die Konkurrenz ist? Gibt es systematische Wettbewerbsanalysen?"
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
      { value: "zufall", label: "Zufällig/ungeplant" },
      { value: "unbekannt", label: "Noch nicht definiert" }
    ],
    description: "Wie systematisch geht Ihr Unternehmen bei Innovationen vor? Gibt es Prozesse, Teams, externe Partner oder läuft alles eher ungeplant?"
  },
  {
    key: "risikofreude",
    label: "Wie risikofreudig ist Ihr Unternehmen bei Innovationen? (1 = wenig, 5 = sehr)",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    description: "Wählen Sie den Wert, der am ehesten auf Ihr Unternehmen zutrifft. Eher sicherheitsorientiert oder bereit, Neues auszuprobieren?"
  },
  {
    key: "datenschutz",
    label: "Ich habe die <a href=\"datenschutz.html\" onclick=\"window.open(this.href, 'DatenschutzPopup', 'width=600,height=700'); return false;\">Datenschutzhinweise</a> gelesen und bin einverstanden.",
    type: "privacy",
    description: "<span class='important'>Bitte beachten: Die Erstellung Ihres Executive Briefings kann mehrere Minuten dauern. Während dieser Zeit den ABSENDEN-Button nicht wiederholt drücken. Bitte lassen Sie diese Webseite geöffnet. Nach Fertigstellung wird das PDF zum Download bereitgestellt.</span> Ihre Daten werden nur zur individuellen Auswertung verwendet. Es erfolgt keine Weitergabe an Dritte."

  }
];

function renderForm(fields, formId = "formbuilder") {
  const form = document.getElementById(formId);
  if (!form) return;

  form.innerHTML = fields.map(field => {
    let input = "";
    switch (field.type) {
      case "select":
        input = `
          <select id="${field.key}" name="${field.key}">
            <option value="">Bitte wählen...</option>
            ${field.options.map(opt => `
              <option value="${opt.value}">${opt.label}</option>
            `).join("")}
          </select>
        `;
        break;
      case "textarea":
        input = `<textarea id="${field.key}" name="${field.key}" placeholder="${field.placeholder || ""}"></textarea>`;
        break;
      case "checkbox":
        input = `
          <div class="checkbox-group">
            ${field.options.map(opt => `
              <label class="checkbox-label">
                <input type="checkbox" name="${field.key}" value="${opt.value}" />
                ${opt.label}
              </label>
            `).join("")}
          </div>
        `;
        break;
      case "slider":
        input = `
          <input type="range" id="${field.key}" name="${field.key}" min="${field.min||1}" max="${field.max||10}" step="${field.step||1}" value="${field.min||1}" oninput="this.nextElementSibling.innerText=this.value"/>
          <span class="slider-value-label">${field.min||1}</span>
        `;
        break;
      case "privacy":
        input = `
          <div class="privacy-section">
            <label>
              <input type="checkbox" id="${field.key}" name="${field.key}" required />
              ${field.label}
            </label>
          </div>
        `;
        break;
      default:
        input = `<input type="text" id="${field.key}" name="${field.key}" />`;
    }
    const guidance = field.description
      ? `<div class="guidance${field.key === "datenschutz" ? " important" : ""}">${field.description}</div>`
      : "";

    return field.type === "privacy"
      ? `<div class="form-group privacy-group">${input}${guidance}</div>`
      : `<div class="form-group"><label for="${field.key}">${field.label}</label>${guidance}${input}</div>`;
  }).join('');

  if (!document.getElementById('loading-indicator')) {
    const loader = document.createElement("div");
    loader.id = "loading-indicator";
    loader.style.display = "none";
    loader.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="spinner" style="width:22px;height:22px;border:4px solid #2166c2;border-right-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <span style="font-size:1.1em;color:#2166c2;">Ihr persönlicher KI-Report wird erstellt...</span>
      </div>
      <style>@keyframes spin{100%{transform:rotate(360deg);}}</style>
    `;
    form.parentNode.insertBefore(loader, form.nextSibling);
  }
  if (!form.querySelector('button, [type=submit]')) {
    form.innerHTML += `<button type="submit" id="submit-btn">Absenden</button>`;
  }
}

renderForm(fields);

document.getElementById("formbuilder").addEventListener("submit", async function(e) {
  e.preventDefault();
  const dsCheckbox = document.getElementById('datenschutz');
  if (!dsCheckbox || !dsCheckbox.checked) {
    alert('Bitte akzeptieren Sie die Datenschutzhinweise.');
    dsCheckbox && dsCheckbox.focus();
    return false;
  }

  const formData = new FormData(this);
  const data = {};
  for (let [key, value] of formData.entries()) {
    if (data[key]) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  }
  // E-Mail aus JWT hinzufügen
  const email = getEmailFromJWT(token);
  if (email) {
    data.email = email;
  }
  const button = this.querySelector("button[type=submit]");
  const loader = document.getElementById('loading-indicator');
  const feedback = document.getElementById("feedback");
  if (button) button.disabled = true;
  if (loader) loader.style.display = "block";
  feedback.style.display = "none";
  feedback.innerHTML = "";

  try {
    const res = await fetch("https://make-ki-backend-neu-production.up.railway.app/api/briefing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const blob = await res.blob();
      // PDF-Download auslösen
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "KI-Readiness-Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Feedback anzeigen
      feedback.style.display = "block";
      feedback.innerHTML = `
        <div style="margin-top:16px;">
          <span style="color:#267B3B;font-weight:600;">PDF wurde erfolgreich generiert und automatisch heruntergeladen.</span>
          <div style="margin-top:24px;font-size:1.05em;color:#204769;">
            Wie hat Dir der KI-Check gefallen?<br>
            Gib uns bitte 1 Minute Feedback, um ihn noch besser zu machen.<br>
            <a href="feedback.html" style="display:inline-block;margin-top:12px;padding:10px 26px;background:#e3eeff;
            color:#2166c2;border-radius:8px;text-decoration:none;font-weight:600;font-size:1.1em;">
             Jetzt Feedback geben</a>
          </div>
        </div>
      `;
      this.reset();
    } else {
      feedback.style.display = "block";
      feedback.innerHTML = `<span style="color:#c22;font-weight:600;">Fehler: Ihre Angaben konnten nicht verarbeitet werden.</span>`;
      if (button) button.disabled = false;
    }
  } catch (err) {
    feedback.style.display = "block";
    feedback.innerHTML = `<span style="color:#c22;font-weight:600;">Fehler beim Übertragen: ${err?.message || err}</span>`;
    console.error("FEHLER:", error);
    if (button) button.disabled = false;
  } finally {
    if (loader) loader.style.display = "none";
  }
});
