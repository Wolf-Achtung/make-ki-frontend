document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('fragebogen');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log("📨 Formular-Absenden gestartet...");

    const formData = new FormData(form);
    const jsonData = {};

    for (const [key, value] of formData.entries()) {
      jsonData[key] = value;
    }

    console.log("📦 Daten gesammelt:", jsonData);

    try {
      const response = await fetch('https://make-ki-backend-production.up.railway.app/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      if (!response.ok) {
        console.error("❌ Fehler vom Server:", response.status, response.statusText);
        alert("⚠️ Fehler bei der Auswertung: Ein Dienst hat versagt.");
        return;
      }

      const result = await response.json();
      console.log("✅ Antwort erhalten:", result);

      if (result.preview) {
        sessionStorage.setItem('previewUrl', result.preview);
        window.location.href = 'vorschau.html';
      } else {
        alert("⚠️ Kein PDF-Link in der Antwort gefunden.");
        console.warn("⚠️ Unerwartetes Antwortformat:", result);
      }
    } catch (error) {
      console.error("❌ Netzwerk- oder Serverfehler:", error);
      alert("⚠️ Fehler beim Senden des Formulars: Netzwerkproblem oder Backendfehler.");
    }
  });
});
