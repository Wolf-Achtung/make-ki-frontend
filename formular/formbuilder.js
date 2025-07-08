// formbuilder.js
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
    const group = document.createElement('div');
    group.className = "form-group";
    group.style.background = "#fff";

    const label = document.createElement('label');
    label.textContent = field.label;
    label.setAttribute('for', field.name);
    label.className = "form-label";

    if (field.help) {
      const help = document.createElement('span');
      help.className = "form-help";
      help.textContent = " ⓘ ";
      help.title = field.help;
      help.style.cursor = "help";
      help.style.marginLeft = "7px";
      label.appendChild(help);
    }
    group.appendChild(label);

    if (field.description) {
      const desc = document.createElement('div');
      desc.className = "form-desc";
      desc.innerText = field.description;
      group.appendChild(desc);
    }

    if (field.type === "checkbox" && Array.isArray(field.options)) {
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
    } else if (field.type === "radio" && Array.isArray(field.options)) {
      const radioGroup = document.createElement('div');
      radioGroup.className = "radio-group";
      field.options.forEach((opt, i) => {
        const id = `${field.name}_${i}`;
        const wrapper = document.createElement('label');
        wrapper.className = "radio-label";
        const input = document.createElement('input');
        input.type = "radio";
        input.name = field.name;
        input.value = opt;
        input.id = id;
        wrapper.appendChild(input);
        const span = document.createElement('span');
        span.textContent = opt;
        wrapper.appendChild(span);
        radioGroup.appendChild(wrapper);
      });
      group.appendChild(radioGroup);
    } else if (field.type === "textarea") {
      const textarea = document.createElement('textarea');
      textarea.name = field.name;
      textarea.id = field.name;
      textarea.className = "form-control";
      textarea.rows = 3;
      group.appendChild(textarea);
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
    } else if (field.type === "number" || field.type === "range") {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.id = field.name;
      input.className = "form-control";
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
      group.appendChild(input);
    } else if (field.type === "bool" || field.type === "checkbox") {
      if (!field.options) {
        const input = document.createElement('input');
        input.type = "checkbox";
        input.name = field.name;
        input.id = field.name;
        input.className = "form-checkbox";
        group.appendChild(input);
        const span = document.createElement('span');
        span.textContent = field.boxLabel || '';
        group.appendChild(span);
      }
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

  // Submit-Button
  const submitBtn = document.createElement('button');
  submitBtn.type = "submit";
  submitBtn.className = "submit-btn";
  submitBtn.textContent = "Absenden";
  form.appendChild(submitBtn);

  formContainer.innerHTML = "";
  formContainer.appendChild(form);

  // Autosize für Textareas
  document.addEventListener('input', function (event) {
    if (event.target.tagName.toLowerCase() !== 'textarea') return;
    event.target.style.height = 'auto';
    event.target.style.height = (event.target.scrollHeight) + 'px';
  }, false);

  // >>> NEU: Formular absenden an dein Railway-Backend <<<
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Daten sammeln (inkl. Checkbox-Arrays)
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    console.log("🚀 Daten werden gesendet:", data);

    fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log("✅ Antwort vom Server:", result);
      if (result.pdf_url) {
        window.location.href = result.pdf_url; // Download automatisch starten
      } else {
        alert("Report erstellt, aber kein PDF-Link zurückgegeben.");
      }
    })
    .catch(err => {
      console.error("❌ Fehler beim Senden:", err);
      alert("Es gab einen Fehler bei der Erstellung des Reports.");
    });
  });
}
