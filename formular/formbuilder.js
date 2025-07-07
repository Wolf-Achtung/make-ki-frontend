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

    // Frage als Label
    const label = document.createElement('label');
    label.textContent = field.label;
    label.setAttribute('for', field.name);
    label.className = "form-label";
    group.appendChild(label);

    // Feldbeschreibung (optional)
    if (field.description) {
      const desc = document.createElement('div');
      desc.className = "form-desc";
      desc.innerText = field.description;
      group.appendChild(desc);
    }

    // Eingabefeld-Typ
    if (field.type === "checkbox" && Array.isArray(field.options)) {
      // Checkbox-Gruppe für Mehrfachauswahl
      const checkboxGroup = document.createElement('div');
      checkboxGroup.className = "checkbox-group";
      field.options.forEach((opt, i) => {
        const id = `${field.name}_${i}`;
        const wrapper = document.createElement('label');
        wrapper.className = "checkbox-label";
        wrapper.style.display = "block";
        const input = document.createElement('input');
        input.type = "checkbox";
        input.name = field.name; // KEIN [] nötig, JS sammelt das!
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
      // Radiobutton-Gruppe
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
      // Mehrzeiliges Textfeld
      const textarea = document.createElement('textarea');
      textarea.name = field.name;
      textarea.id = field.name;
      textarea.className = "form-control";
      textarea.rows = 3;
      group.appendChild(textarea);

    } else if (field.type === "select" && Array.isArray(field.options)) {
      // Dropdown
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
      // Zahleneingabe
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
      // Einzelne Checkbox
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
      // Standard Textfeld
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

  formContainer.innerHTML = ""; // vorherigen Inhalt entfernen
  formContainer.appendChild(form);

  // Formular absenden (hier ggf. eigene Logik, z.B. Animation)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Animation oder Datenverarbeitung...
    form.classList.add("submitted");
    setTimeout(() => {
      form.classList.remove("submitted");
    }, 1200);
    // Sende-Logik siehe Backend...
  });
}
