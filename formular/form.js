document.getElementById("formular").addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const payload = {};

  // Alle Felder erfassen
  formData.forEach((value, key) => {
    payload[key] = value;
  });

  console.log("📦 Sende folgende Daten:", payload);

  try {
    const response = await fetch("/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.preview) {
      console.log("✅ PDF-Vorschau erhalten:", result.preview);
      sessionStorage.setItem("previewUrl", result.preview);
      window.location.href = "vorschau.html";
    } else {
      console.error("⚠️ Fehlerhafte Antwort:", result);
      alert("❌ Fehler bei der Auswertung: " + (result.message || "Unbekannter Fehler."));
    }

  } catch (error) {
    console.error("🔥 Netzwerk-/Serverfehler:", error);
    alert("❌ Fehler bei der Auswertung: Ein Dienst hat versagt.");
  }
});
