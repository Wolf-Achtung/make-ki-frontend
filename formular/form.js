// form.js – wandelt Formulardaten in JSON um und übergibt sie an die Vorschau

document.getElementById('fragebogen-formular')?.addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const payload = {};

  formData.forEach((value, key) => {
    payload[key] = value;
  });

  // Vorschau anzeigen (simuliert clientseitige Logik)
  localStorage.setItem("payload", JSON.stringify(payload));
  window.location.href = "vorschau.html";
});

// Auf der vorschau.html laden
if (window.location.pathname.includes("vorschau.html")) {
  const data = localStorage.getItem("payload");
  if (data) {
    document.getElementById("payload-json").value = data;
  }
}
