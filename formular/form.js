document.querySelector('form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const jsonData = {};
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    console.log("📤 Sende Daten an /generate-pdf", jsonData);

    try {
        const response = await fetch('https://make-ki-backend-production.up.railway.app/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();

        console.log("✅ Antwort erhalten:", result);

        if (response.ok && result.preview) {
            sessionStorage.setItem('previewText', result.preview);
            sessionStorage.setItem('fullText', result.full);
            alert("✅ Auswertung erfolgreich erstellt. Vorschau wird geöffnet.");
            window.location.href = 'vorschau.html';
        } else {
            alert(`⚠️ Fehler bei der Auswertung: ${result.error || 'Unbekannter Fehler'}`);
        }
    } catch (error) {
        console.error("❌ Netzwerk- oder Serverfehler:", error);
        alert("❌ Netzwerkfehler oder kein Server erreichbar.\n" + error);
    }
});
