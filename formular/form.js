document.getElementById("kiForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const formData = new FormData(this);
  const payload = {};

  // Alle Felder erfassen
  formData.forEach((value, key) => {
    // Unterstützung für Mehrfachwerte wie Checkboxen oder Listen
    if (payload[key]) {
      if (Array.isArray(payload[key])) {
        payload[key].push(value);
      } else {
        payload[key] = [payload[key], value];
      }
    } else {
      payload[key] = value;
    }
  });

  console.log("📦 Sende folgende Daten an Backend:", payload);

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
      console.log("✅ Vorschau-URL erhalten:", result.preview);
      sessionStorage.setItem("previewUrl", result.preview);
      window.location.href = "vorschau.html";
    } else {
      console.error("⚠️ Fehlerhafte Server-Antwort:", result);
      alert("❌ Fehler beim Erzeugen der Vorschau: " + (result.message || "Unbekannter Fehler"));
    }
  } catch (error) {
    console.error("🚨 Netzwerkfehler oder Server nicht erreichbar:", error);
    alert("❌ Netzwerk-/Serverfehler: " + error.message);
  }
});
