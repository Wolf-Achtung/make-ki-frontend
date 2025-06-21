
document.getElementById("ki-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Optional: Ergänze zusammengesetzte Felder
    if (data["branche"] === "Sonstige") {
        data["branche"] = data["branche_sonstige"] || "Sonstige";
    }
    delete data["branche_sonstige"];

    if (data["use_case"] === "Sonstiges") {
        data["use_case"] = data["use_case_sonstiges"] || "Sonstiges";
    }
    delete data["use_case_sonstiges"];

    try {
        const response = await fetch("/generate-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            window.location.href = "vorschau.html";
        } else {
            alert("Es gab ein Problem beim Generieren der Auswertung.");
        }
    } catch (error) {
        console.error("Fehler beim Absenden:", error);
        alert("Verbindungsfehler beim Absenden des Formulars.");
    }
});
