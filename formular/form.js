document.getElementById("kiForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const formData = new FormData(this);
  const payload = {};

  // Alle Felder erfassen – inkl. Mehrfachauswahl
  formData.forEach((value, key) => {
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

  console.log("📦 Daten an Backend:", payload);

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
      console.log("✅ Vorschau-Link erhalten:", result.preview);
      sessionStorage.setItem("previewUrl", result.preview);
      window.location.href = "vorschau.html";
    } else {
      console.error("⚠️ Serverfehler:", result);
      alert("Fehler beim Erzeugen der Vorschau: " + (result.message || "Unbekannter Fehler"));
    }
  } catch (error) {
    console.error("🚨 Netzwerkfehler:", error);
    alert("Netzwerkfehler oder Server nicht erreichbar: " + error.message);
  }
});
