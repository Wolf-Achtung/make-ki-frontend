
document.getElementById("formular").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    try {
        const response = await fetch("https://make-ki-backend-production.up.railway.app/generate-pdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result && result.preview) {
            // Vorschau anzeigen
            sessionStorage.setItem("previewURL", result.preview);
            sessionStorage.setItem("fullURL", result.full);
            window.location.href = "vorschau.html";
        } else {
            alert("Fehler beim Generieren der Auswertung (Ungültige Antwort).");
            console.error("Serverantwort:", result);
        }
    } catch (error) {
        alert("Es gab ein Problem beim Generieren der Auswertung.");
        console.error("Fehler beim Absenden:", error);
    }
});
