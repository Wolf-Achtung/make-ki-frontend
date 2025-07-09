function buildForm(fields, container) {
  const form = document.createElement("form");
  form.innerHTML = "";

  fields.forEach(field => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-field";

    const label = document.createElement("label");
    label.textContent = field.label;

    if (field.type === "select") {
      form.appendChild(label);
      const select = document.createElement("select");
      select.name = field.name || field.key;
      field.options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
      });
      wrapper.appendChild(select);

    } else if (field.type === "checkbox" && Array.isArray(field.options)) {
      form.appendChild(label);
      wrapper.style.marginBottom = "18px";
      wrapper.style.padding = "10px";
      wrapper.style.border = "1px solid #dde8f3";
      wrapper.style.borderRadius = "12px";
      wrapper.style.background = "#fafdff";

      field.options.forEach(option => {
        const checkboxLabel = document.createElement("label");
        checkboxLabel.style.display = "block";
        checkboxLabel.style.margin = "4px 0";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = field.name || field.key;
        checkbox.value = option;
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(" " + option));
        wrapper.appendChild(checkboxLabel);
      });

    } else if (field.type === "checkbox") {
      form.appendChild(label);
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = field.name || field.key;
      wrapper.appendChild(input);

    } else if (field.type === "number") {
      form.appendChild(label);
      const input = document.createElement("input");
      input.type = "number";
      input.name = field.name || field.key;
      wrapper.appendChild(input);

    } else {
      form.appendChild(label);
      const input = document.createElement("input");
      input.type = "text";
      input.name = field.name || field.key;
      if (field.placeholder) input.placeholder = field.placeholder;
      wrapper.appendChild(input);
    }

    form.appendChild(wrapper);
  });

  const dsField = document.createElement("div");
  dsField.innerHTML = `
    <label><input type="checkbox" name="datenschutz_ok" required /> 
    Ich habe die <a href="/datenschutz.html" target="_blank">Datenschutzerklärung</a> gelesen und akzeptiere sie.</label>
  `;
  form.appendChild(dsField);

  const submit = document.createElement("button");
  submit.textContent = "Absenden";
  form.appendChild(submit);

  // Ladeanzeige-Element hinzufügen
  const loadingMsg = document.createElement("div");
  loadingMsg.style.display = "none";
  loadingMsg.style.marginTop = "15px";
  loadingMsg.style.fontSize = "0.95em";
  loadingMsg.style.color = "#555";
  loadingMsg.textContent = "Der individuelle KI-Report wird erstellt. Und "Gut' Ding will Weile haben"... also Zeit für eine Kaffeepause...";
  form.appendChild(loadingMsg);

  container.appendChild(form);

  form.onsubmit = function(e) {
    e.preventDefault();
    submit.disabled = true;
    submit.textContent = "Wird verarbeitet...";
    loadingMsg.style.display = "block";

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
    if (attempt < 2) {
      console.log(`Erneuter Versuch ${attempt+2} in 2 Sekunden...`);
      setTimeout(() => sendDataWithRetry(data, attempt + 1), 2000);
    } else {
      alert("Es gab einen Fehler bei der Erstellung des Reports. Bitte erneut versuchen.");
    }
  });
}
