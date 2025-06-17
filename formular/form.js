document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("kiForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (/frage_\\d+/.test(key)) {
        data[key] = parseInt(value); // Skalenfragen als Zahl
      } else {
        data[key] = value.trim(); // Freitextfelder bereinigen
      }
    }

    try {
      const response = await fetch("https://glorious-reverence-production.up.railway.app/analyze", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: data })
      });

      if (!response.ok) throw new Error("Serverfehler: " + response.status);

      const result = await response.json();
      console.log("✅ GPT-Ergebnis:", result);

      sessionStorage.setItem("kiCheckResult", JSON.stringify(result));
      window.location.href = "/formular/vorschau.html";

    } catch (error) {
      console.error("❌ Fehler bei der Analyse:", error);
      alert("Leider ist ein Fehler aufgetreten. Bitte später erneut versuchen.");
    }
  });
});
