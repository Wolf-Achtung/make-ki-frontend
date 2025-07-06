document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("ki-form");
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

  // Optional: Felder thematisch gruppieren, wenn section vorhanden
  let currentSection = "";
  fields.forEach(field => {
    // Abschnittsüberschrift (wenn gewünscht)
    if (field.section && field.section !== currentSection) {
      currentSection = field.section;
      const sectionH = document.createElement("h2");
      sectionH.innerText = currentSection;
      sectionH.className = "form-section";
      form.appendChild(sectionH);
    }

    const div = document.createElement("div");
    div.className = "form-group";
    div.style.marginBottom = "1.5em";

    // Label
    if (field.label) {
      const label = document.createElement("label");
      label.innerText = field.label;
      label.htmlFor = field.key;
      label.style.fontWeight = "500";
      label.style.display = "block";
      label.style.marginBottom = "0.2em";
      div.appendChild(label);
    }

    // Hilfetext
    if (field.help) {
      const help = document.createElement("small");
      help.innerText = field.help;
      help.style.display = "block";
      help.style.marginBottom = "0.25em";
      help.style.color = "#6a7683";
      div.appendChild(help);
    }

    let input;

    // Checkbox-Gruppe (Mehrfachauswahl) - NEU: untereinander, ruhiger
    if (field.type === "checkbox" && Array.isArray(field.options)) {
      const group = document.createElement("div");
      group.className = "form-checkbox-group";
      group.style.display = "flex";
      group.style.flexDirection = "column";
      group.style.gap = "7px";
      field.options.forEach(option => {
        const boxLabel = document.createElement("label");
        boxLabel.style.display = "flex";
        boxLabel.style.alignItems = "center";
        boxLabel.style.fontWeight = "400";
        boxLabel.style.cursor = "pointer";
        boxLabel.style.marginBottom = "0.2em";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = field.key;
        checkbox.value = option;
        checkbox.style.marginRight = "10px";
        boxLabel.appendChild(checkbox);
        boxLabel.appendChild(document.createTextNode(option));
        group.appendChild(boxLabel);
      });
      div.appendChild(group);
    }
    // Einzelne Checkbox
    else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.name = field.key;
      input.id = field.key;
      input.style.width = "20px";
      input.style.height = "20px";
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
      input.className = "form-textarea";
      div.appendChild(input);
    }
    // Select
    else if (field.type === "select" && Array.isArray(field.options)) {
      input = document.createElement("select");
      input.name = field.key;
      input.id = field.key;
      input.className = "form-select";
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
      input.style.width = "220px";
      // Live-Label für Slider-Wert
      const rangeLabel = document.createElement("span");
      rangeLabel.style.marginLeft = "12px";
      rangeLabel.innerText = input.value;
      input.addEventListener("input", () => {
        rangeLabel.innerText = input.value;
      });
      div.appendChild(input);
      div.appendChild(rangeLabel);
    }
    // Textinput
    else {
      input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.placeholder || "";
      input.name = field.key;
      input.id = field.key;
      input.className = "form-input";
      div.appendChild(input);
    }

    // Required
    if (field.required && input) input.required = true;

    // Modernes Input-Styling (ohne Checkboxen)
    if (input && field.type !== "checkbox") {
      input.style.width = "100%";
      input.style.maxWidth = "520px";
      input.style.fontSize = "1.06em";
      input.style.marginTop = "0.18em";
      input.style.marginBottom = "0.25em";
      input.style.padding = "0.45em 0.7em";
      input.style.border = "1.4px solid #1a4064";
      input.style.borderRadius = "14px";
      input.style.background = "#fafcff";
      input.style.boxSizing = "border-box";
      input.style.boxShadow = "0 1px 6px 0 rgba(0,0,0,0.08)";
      input.style.transition = "border 0.2s, box-shadow 0.3s";
    }

    form.appendChild(div);
  });

  // Analyse-Button
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.innerText = "Analyse starten";
  submitBtn.className = "btn-primary";
  submitBtn.style.marginTop = "2.2em";
  submitBtn.style.fontSize = "1.17em";
  submitBtn.style.padding = "0.7em 2em";
  submitBtn.style.background = "#003b5a";
  submitBtn.style.color = "#fff";
  submitBtn.style.border = "none";
  submitBtn.style.borderRadius = "14px";
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
      if (field.type === "checkbox" && Array.isArray(field.options)) {
        const selected = [];
        form.querySelectorAll(`input[name="${field.key}"]:checked`).forEach(cb => selected.push(cb.value));
        data[field.key] = selected;
        if (field.required && selected.length === 0) missingRequired = true;
      }
      else if (field.type === "checkbox") {
        const el = form.querySelector(`[name="${field.key}"]`);
        data[field.key] = el ? el.checked : false;
        if (field.required && !data[field.key]) missingRequired = true;
      }
      else if (field.type === "slider" || field.type === "range") {
        const el = form.querySelector(`[name="${field.key}"]`);
        data[field.key] = el ? parseInt(el.value, 10) : null;
      }
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
