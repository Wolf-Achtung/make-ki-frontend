// Formular-Builder – optimiert, defensiv, ready für moderne UX

document.addEventListener("DOMContentLoaded", () => {
  fetch("fields.json")
    .then((res) => res.json())
    .then((fields) => buildForm(fields))
    .catch((err) => {
      showError("Fehler beim Laden des Formulars.");
      console.error(err);
    });
});

function buildForm(fields) {
  const formRoot = document.getElementById("form-root");
  if (!formRoot) {
    console.error("Container mit id 'form-root' nicht gefunden.");
    return;
  }

  // Thematische Gruppierung (optional: kannst du im JSON ergänzen)
  // Sonst erscheinen die Felder in JSON-Reihenfolge

  const form = document.createElement("form");
  form.className = "main-form";
  form.autocomplete = "off";

  // Formularfelder
  fields.forEach((field) => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "form-field";

    // Label
    if (field.label) {
      const label = document.createElement("label");
      label.innerText = field.label;
      if (field.id) label.htmlFor = field.id;
      fieldDiv.appendChild(label);
    }

    // Feldtyp
    let input;
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        input = document.createElement("input");
        input.type = field.type;
        break;
      case "textarea":
        input = document.createElement("textarea");
        break;
      case "select":
        input = document.createElement("select");
        (field.options || []).forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt.value ?? opt;
          option.innerText = opt.label ?? opt;
          input.appendChild(option);
        });
        break;
      case "checkbox":
        input = document.createElement("input");
        input.type = "checkbox";
        break;
      case "radio":
        input = document.createElement("div");
        (field.options || []).forEach((opt, idx) => {
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = field.id;
          radio.value = opt.value ?? opt;
          radio.id = `${field.id}_${idx}`;
          const radioLabel = document.createElement("label");
          radioLabel.htmlFor = radio.id;
          radioLabel.innerText = opt.label ?? opt;
          input.appendChild(radio);
          input.appendChild(radioLabel);
        });
        break;
      case "slider":
        input = document.createElement("input");
        input.type = "range";
        input.min = field.min ?? 1;
        input.max = field.max ?? 10;
        input.value = field.value ?? field.min ?? 1;
        input.classList.add("slider");
        // Live Value anzeigen
        const val = document.createElement("span");
        val.className = "slider-value";
        val.innerText = input.value;
        input.addEventListener("input", () => {
          val.innerText = input.value;
        });
        fieldDiv.appendChild(val);
        break;
      default:
        input = document.createElement("input");
        input.type = "text";
    }

    if (field.id) input.id = field.id;
    if (field.name) input.name = field.name;
    if (field.required) input.required = true;
    if (field.placeholder) input.placeholder = field.placeholder;

    // Checkboxen/Radio nebeneinander
    if (field.type === "checkbox" || field.type === "radio") {
      fieldDiv.classList.add("form-inline");
    }

    // Slider nach Label
    if (field.type === "slider") {
      fieldDiv.appendChild(input);
    } else {
      fieldDiv.appendChild(input);
    }

    form.appendChild(fieldDiv);
  });

  // Absenden-Button
  const btnDiv = document.createElement("div");
  btnDiv.className = "form-actions";
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.innerText = "Auswertung starten";
  submitBtn.className = "btn-primary";
  btnDiv.appendChild(submitBtn);
  form.appendChild(btnDiv);

  // Meldung
  const msg = document.createElement("div");
  msg.className = "form-message";
  form.appendChild(msg);

  // Submit-Handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    msg.innerText = "Wird gesendet...";
    msg.classList.remove("error");

    const data = {};
    new FormData(form).forEach((value, key) => {
      if (data[key]) {
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    fetch("/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((result) => {
        msg.innerText = "Erfolgreich gesendet!";
        msg.classList.add("success");
        submitBtn.disabled = false;
        // Ggf. Redirect oder PDF-Link anzeigen
        if (result.pdf_url) {
          msg.innerHTML += `<br><a href="${result.pdf_url}" target="_blank" class="btn-link">PDF herunterladen</a>`;
        }
      })
      .catch((err) => {
        msg.innerText = "Fehler beim Absenden.";
        msg.classList.add("error");
        submitBtn.disabled = false;
        console.error(err);
      });
  });

  // Ins DOM einfügen
  formRoot.innerHTML = "";
  formRoot.appendChild(form);
}

function showError(msg) {
  const formRoot = document.getElementById("form-root");
  if (formRoot) formRoot.innerHTML = `<div class="form-message error">${msg}</div>`;
}
