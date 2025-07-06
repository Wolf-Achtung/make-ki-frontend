document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("dynamicForm");
  const ergebnis = document.getElementById("ergebnis");
  const debug = document.getElementById("debug");

  // Felder laden
  let fields = [];
  try {
    const res = await fetch("fields.json");
    fields = await res.json();
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      debug.innerText = "❌ Fehler: Keine Formularfelder geladen.";
      return;
    }
  } catch (e) {
    debug.innerText = "❌ Fehler beim Laden von fields.json: " + e;
    return;
  }

  // Formular bauen
  fields.forEach(field => {
    const div = document.createElement("div");
    div.className = "form-group";
    div.style.marginBottom = "1.2em";

    // Label
    if (field.label) {
      const label = document.createElement("label");
      label.innerText = field.label;
      label.htmlFor = field.key;
      label.style.fontWeight = "500";
      label.style.display = "block";
      div.appendChild(label);
    }

    // Hilfetext
    if (field.help) {
      const help = document.createElement("small");
      help.innerText = field.help;
      help.style.display = "block";
      help.style.marginBottom = "0.2em";
      help.style.color = "#666";
      div.appendChild(help);
    }

    let input;

    // Checkbox-Gruppe (Mehrfachauswahl)
    if (field.type === "checkbox" && Array.isArray(field.options)) {
      const group = document.createElement("div");
      group.className = "form-checkbox-group";
      group.style.display = "flex";
      group.style.flexWrap = "wrap";
      group.style.gap = "16px 24px";
      field.options.forEach(option => {
        const boxLabel = document.createElement("label");
        boxLabel.style.display = "flex";
        boxLabel.style.alignItems = "center";
        boxLabel.style.cursor = "pointer";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = field.key; // WICHTIG: gleicher Name für alle Optionen!
        checkbox.value = option;
        checkbox.style.marginRight = "8px";
        boxLabel.appendChild(checkbox);
        boxLabel.appendChild(document.createTextNode(option));
        group.appendChild(boxLabel);
      });
      div.appendChild(group);
    }
    // Einzelne Checkbox (z.B. DSGVO)
    else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.name = field.key;
      input.id = field.key;
      input.style.width = "22px";
      input.style.height = "22px";
      input.style.verticalAlign = "middle";
      div.appendChild(input);
    }
    // Textarea
    else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
      input.placeholder = field.placeholder || "";
      input.name = field.key;
      input.id = field.key;
      div.appendChild(input);
    }
    // Select
    else if (field.type === "select" && Array.isArray(field.options)) {
      input = document.createElement("select");
      input.name = field.key;
      input.id = field.key;
      field.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.text = opt;
        input.add(option);
      });
      div.appendChild(input);
    }
    // Slider/Range
    else if (field.type === "slider" || field.type === "range") {
      input = document.createElement("input");
      input.type = "range";
      input.min = field.min || 0;
      input.max = field.max || 10;
      input.step = field.step || 1;
      input.value = field.min || 0;
      input.name = field.key;
      input.id = field.key;
      input.style.width = "250px";
      // Live-Label für Slider-Wert
      const rangeLabel = document.createElement("span");
      rangeLabel.style.marginLeft = "10px";
      rangeLabel.innerText = input.value;
      input.addEventListener("input", () => {
        rangeLabel.innerText = input.value;
      });
      div.appendChild(input);
      div.appendChild(rangeLabel);
    }
    // Input (Text)
    else {
      input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.placeholder || "";
      input.name = field.key;
      input.id = field.key;
      div.appendChild(input);
    }

    // Required-Felder
    if (field.required && input) input.required = true;

    // Stil für Inputs (außer Checkboxen)
    if (input && field.type !== "checkbox") {
      input.style.width = "100%";
      input.style.maxWidth = "540px";
      input.style.fontSize = "1.1em";
      input.style.marginTop = "0.2em";
      input.style.marginBottom = "0.3em";
      input.style.padding = "0.3em 0.7em";
      input.style.border = "1.5px solid #193B54";
      input.style.borderRadius = "6px";
      input.style.boxSizing = "border-box";
    }

    form.appendChild(div);
  });

  // Analyse-Button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.innerText = "Analyse starten";
  submitBtn.className = "btn-primary";
  submitBtn.style.marginTop = "2em";
  submitBtn.style.fontSize = "1.2em";
  submitBtn.style.padding = "0.7em 2em";
  submitBtn.style.background = "#003b5a";
  submitBtn.style.color = "#fff";
  submitBtn.style.border = "none";
  submitBtn.style.borderRadius = "6px";
  submitBtn.style.cursor = "pointer";
  form.appendChild(submitBtn);

  // Submit-Handler
  form.onsubmit = async function (e) {
    e.preventDefault();
    debug.innerText = "⏳ Wird ausgewertet ...";
    ergebnis.innerHTML = "";
    const data = {};

    let missingRequired = false;
    fields.forEach(field => {
      // Für Checkbox-Gruppen (Mehrfachauswahl)
      if (field.type === "checkbox" && Array.isArray(field.options)) {
        const selected = [];
        form.querySelectorAll(`input[name="${field.key}"]:checked`).forEach(cb => selected.push(cb.value));
        data[field.key] = selected;
        if (field.required && selected.length === 0) missingRequired = true;
      }
      // Für einzelne Checkbox (z.B. DSGVO)
      else if (field.type === "checkbox") {
        const el = form.querySelector(`[name="${field.key}"]`);
        data[field.key] = el ? el.checked : false;
        if (field.required && !data[field.key]) missingRequired = true;
      }
      // Slider
      else if (field.type === "slider" || field.type === "range") {
        const el = form.querySelector(`[name="${field.key}"]`);
        data[field.key] = el ? parseInt(el.value, 10) : null;
      }
      // Alle anderen Inputs/Selects
      else {
        const el = form.querySelector(`[name="${field.key}"]`);
        data[field.key] = el ? el.value : "";
        if (field.required && (!el.value || el.value.trim() === "")) missingRequired = true;
      }
    });

    if (missingRequired) {
      debug.innerText = "⚠️ Bitte füllen Sie alle Pflichtfelder aus!";
      return;
    }

    try {
      const resp = await fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await resp.json();
      if (json.html) {
        ergebnis.innerHTML = json.html;
        if (json.pdf_url) {
          let pdfUrl = json.pdf_url;
          if (pdfUrl && pdfUrl.startsWith("/downloads")) {
            pdfUrl = "https://make-ki-backend-neu-production.up.railway.app" + pdfUrl;
          }
          const link = document.createElement("a");
          link.href = pdfUrl;
          link.innerText = "PDF herunterladen";
          link.target = "_blank";
          link.className = "btn";
          link.style.display = "inline-block";
          link.style.marginTop = "2em";
          ergebnis.appendChild(link);
        }
        debug.innerText = "✅ Analyse erfolgreich geladen.";
      } else {
        debug.innerText = "⚠️ Server hat kein HTML zurückgegeben.";
      }
    } catch (err) {
      debug.innerText = "❌ Fehler: " + err;
    }
  };
});
