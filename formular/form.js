document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kiForm");
  const message = document.getElementById("feedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value || "Nicht angegeben";
    }

    message.innerText = "⏳ Bitte warten – Ihre KI-Auswertung wird erstellt...";

    try {
      const response = await fetch("https://dein-backend-endpunkt/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.preview) {
        window.location.href = `vorschau.html?preview_url=${encodeURIComponent(result.preview)}`;
      } else {
        message.innerText = "❌ Fehler: Keine Vorschau-URL empfangen.";
      }
    } catch (error) {
      console.error("Fehler beim Senden:", error);
      message.innerText = "❌ Fehler beim Absenden. Bitte erneut versuchen.";
    }
  });
});
