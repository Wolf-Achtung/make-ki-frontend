// form.js – wandelt Formulardaten in JSON um und speichert sie im LocalStorage

document.getElementById('fragebogen-formular')?.addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const payload = {};

  formData.forEach((value, key) => {
    payload[key] = value;
  });

  // Speichern für Vorschau
  localStorage.setItem("payload", JSON.stringify(payload));
  window.location.href = "vorschau.html";
});
