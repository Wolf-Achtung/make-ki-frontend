// formbuilder.js
function buildForm(fields, container) {
  const form = document.createElement("form");
  form.innerHTML = "";
  
  fields.forEach(field => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-field";

    const label = document.createElement("label");
    label.textContent = field.label;
    wrapper.appendChild(label);

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      field.options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        input.appendChild(opt);
      });
    } else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
    } else if (field.type === "number") {
      input = document.createElement("input");
      input.type = "number";
    } else {
      input = document.createElement("input");
      input.type = "text";
    }

    input.name = field.name;
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  const dsField = document.createElement("div");
  dsField.innerHTML = `
    <label><input type="checkbox" name="datenschutz_ok" required /> Ich habe die Datenschutzerklärung gelesen und akzeptiere sie.</label>
  `;
  form.appendChild(dsField);

  const submit = document.createElement("button");
  submit.textContent = "Absenden";
  form.appendChild(submit);

  container.appendChild(form);

  form.onsubmit = function(e) {
    e.preventDefault();
    const data = new FormData(form);
    const json = {};
    data.forEach((value, key) => {
      if (json[key] !== undefined) {
        if (!Array.isArray(json[key])) json[key] = [json[key]];
        json[key].push(value);
      } else {
        json[key] = value;
      }
    });
    json["datenschutz_ok"] = true;
    sendDataWithRetry(json, 0);
  };
}

// --- Retry-Funktion ---
function sendDataWithRetry(data, attempt) {
  fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error("Server antwortete nicht korrekt");
    return res.json();
  })
  .then(result => {
    if (result.pdf_url) {
      window.location.href = result.pdf_url;
    } else {
      alert("Report erstellt, aber kein PDF-Link zurückgegeben.");
    }
  })
  .catch(err => {
    console.error("Fehler beim Fetch:", err);
    if (attempt < 2) { // insgesamt 3 Versuche
      console.log(`Erneuter Versuch ${attempt+2} in 2 Sekunden...`);
      setTimeout(() => sendDataWithRetry(data, attempt + 1), 2000);
    } else {
      alert("Es gab einen Fehler bei der Erstellung des Reports. Bitte erneut versuchen.");
    }
  });
}
