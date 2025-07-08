fetch('fields.json')
  .then(res => res.json())
  .then(fields => buildForm(fields));

function buildForm(fields) {
  const formContainer = document.getElementById('form-container');
  if (!formContainer) return;

  const form = document.createElement('form');
  form.id = "mainForm";
  form.className = "questionnaire-form";
  form.autocomplete = "off";

  fields.forEach((field, idx) => {
    // POSTLEITZAHL überspringen
    if (field.key === "plz") return;

    const group = document.createElement('div');
    group.className = "form-group";
    group.style.background = "#fff";

    const label = document.createElement('label');
    label.textContent = field.label;
    label.setAttribute('for', field.name);
    label.className = "form-label";
    group.appendChild(label);

    if (field.description) {
      const desc = document.createElement('div');
      desc.className = "form-desc";
      desc.innerText = field.description;
      group.appendChild(desc);
    }

    // Spezialbehandlung für die Slider (als Dropdown)
    if (field.key === "digitalisierungsgrad") {
      const select = document.createElement('select');
      select.name = field.key;
      select.id = field.key;
      select.className = "form-control";
      for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
      }
      group.appendChild(select);

    } else if (field.key === "risikofreude") {
      const select = document.createElement('select');
      select.name = field.key;
      select.id = field.key;
      select.className = "form-control";
      for (let i = 1; i <= 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
      }
      group.appendChild(select);

    } else if (field.type === "checkbox" && Array.isArray(field.options)) {
      const checkboxGroup = document.createElement('div');
      checkboxGroup.className = "checkbox-group";
      field.options.forEach((opt, i) => {
        const id = `${field.name}_${i}`;
        const wrapper = document.createElement('label');
        wrapper.className = "checkbox-label";
        wrapper.style.display = "block";
        const input = document.createElement('input');
        input.type = "checkbox";
        input.name = field.name;
        input.value = opt;
        input.id = id;
        wrapper.appendChild(input);
        const span = document.createElement('span');
        span.textContent = opt;
        wrapper.appendChild(span);
        checkboxGroup.appendChild(wrapper);
      });
      group.appendChild(checkboxGroup);

    } else if (field.type === "select" && Array.isArray(field.options)) {
      const select = document.createElement('select');
      select.name = field.name;
      select.id = field.name;
      select.className = "form-control";
      field.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });
      group.appendChild(select);

    } else if (field.type === "textarea") {
      const textarea = document.createElement('textarea');
      textarea.name = field.name;
      textarea.id = field.name;
      textarea.className = "form-control";
      textarea.rows = 3;
      group.appendChild(textarea);

    } else {
      const input = document.createElement('input');
      input.type = field.type || "text";
      input.name = field.name;
      input.id = field.name;
      input.className = "form-control";
      group.appendChild(input);
    }

    form.appendChild(group);
  });

  // DSGVO Checkbox manuell anhängen
  const datenschutzGroup = document.createElement('div');
  datenschutzGroup.className = "form-group";
  const datenschutzLabel = document.createElement('label');
  const datenschutzInput = document.createElement('input');
  datenschutzInput.type = "checkbox";
  datenschutzInput.name = "datenschutz_ok";
  datenschutzInput.id = "datenschutz_ok";
  datenschutzInput.className = "form-checkbox";
  datenschutzLabel.appendChild(datenschutzInput);
  const span = document.createElement('span');
  span.textContent = " Ich habe die Datenschutzerklärung gelesen und akzeptiere sie.";
  datenschutzLabel.appendChild(span);
  datenschutzGroup.appendChild(datenschutzLabel);
  form.appendChild(datenschutzGroup);

  // Submit-Button
  const submitBtn = document.createElement('button');
  submitBtn.type = "submit";
  submitBtn.className = "submit-btn";
  submitBtn.textContent = "Absenden";
  form.appendChild(submitBtn);

  formContainer.innerHTML = "";
  formContainer.appendChild(form);

  document.addEventListener('input', function (event) {
    if (event.target.tagName.toLowerCase() !== 'textarea') return;
    event.target.style.height = 'auto';
    event.target.style.height = (event.target.scrollHeight) + 'px';
  }, false);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      if (data[key]) {
        if (Array.isArray(data[key])) data[key].push(value);
        else data[key] = [data[key], value];
      } else {
        data[key] = value;
      }
    });

    // DSGVO Checkbox normalisieren
    data.datenschutz_ok = !!form.querySelector('#datenschutz_ok').checked;

    console.log("🚀 Daten werden gesendet:", data);

    fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log("✅ Antwort:", result);
      if (result.pdf_url) {
        window.location.href = result.pdf_url;
      } else {
        alert(result.error || "Report erstellt, aber kein PDF-Link zurückgegeben.");
      }
    })
    .catch(err => {
      console.error("❌ Fehler:", err);
      alert("Es gab einen Fehler bei der Erstellung des Reports.");
    });
  });
}
