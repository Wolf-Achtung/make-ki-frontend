document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("dynamicForm");
  const ergebnis = document.getElementById("ergebnis");
  const debug = document.getElementById("debug");
  // Felder von Server holen (fields.json im selben Verzeichnis)
  const res = await fetch("fields.json");
  const { fields } = await res.json();
  // Formular dynamisch bauen
  fields.forEach(field => {
    const div = document.createElement("div");
    div.className = "form-group";
    const label = document.createElement("label");
    label.innerText = field.label;
    label.htmlFor = field.key;
    div.appendChild(label);
    let input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
      input.placeholder = field.placeholder || "";
    } else if (field.type === "select" && Array.isArray(field.options)) {
      input = document.createElement("select");
      if (field.multiple) {
        input.multiple = true;
        input.size = Math.min(field.options.length, 6);
      }
      field.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.text = opt;
        input.add(option);
      });
    } else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.value = "true";
      input.style.width = "22px";
      input.style.height = "22px";
      input.style.verticalAlign = "middle";
      label.innerHTML = field.label; // HTML für Link!
    } else if (field.type === "input") {
      input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.placeholder || "";
    } else if (field.type === "range") {
      input = document.createElement("input");
      input.type = "range";
      input.min = field.min || 0;
      input.max = field.max || 10;
      input.step = field.step || 1;
      input.value = field.min || 0;
      input.style.width = "250px";
      // Range-Value-Label
      const rangeLabel = document.createElement("span");
      rangeLabel.style.marginLeft = "10px";
      rangeLabel.innerText = input.value;
      input.addEventListener("input", () => {
        rangeLabel.innerText = input.value;
      });
      div.appendChild(rangeLabel);
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.placeholder || "";
    }
    input.name = field.key;
    input.id = field.key;
    if (field.required) input.required = true;
    div.appendChild(input);
    form.appendChild(div);
  });
  // Submit-Handler
  form.onsubmit = async function (e) {
    e.preventDefault();
    debug.innerText = "⏳ Wird ausgewertet ...";
    const data = {};
    fields.forEach(field => {
      const el = form.querySelector(`[name="${field.key}"]`);
      if (el) {
        if (el.multiple) {
          data[field.key] = Array.from(el.selectedOptions).map(o => o.value);
        } else if (field.type === "checkbox") {
          data[field.key] = el.checked;
        } else {
          data[field.key] = el.value;
        }
      }
    });
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
          const link = document.createElement("a");
          link.href = json.pdf_url;
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
