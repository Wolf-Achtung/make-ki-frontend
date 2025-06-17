document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("kiForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const params = new URLSearchParams(window.location.search);
    const partner = params.get("partner") || "default";

    try {
      const response = await fetch(`https://glorious-reverence-production.up.railway.app/analyze?partner=${partner}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers: data })
      });

      if (!response.ok) {
        throw new Error("Serverfehler: " + response.status);
      }

      const result = await response.json();

      // Ergebnis optional loggen
      console.log("GPT-Ergebnis:", result);

      // Vorschau (optional): Zeige Gamechanger-Idee
      if (result.gamechanger && result.gamechanger.idee) {
        alert("🧠 Gamechanger-Vorschlag:\n" + result.gamechanger.idee);
      }

      // Weiterleitung zur Danke-Seite (später mit PDF-Link möglich)
      window.location.href = "/formular/danke.html";

    } catch (error) {
      console.error("Fehler bei der Analyse:", error);
      alert("Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.");
    }
  });
});
