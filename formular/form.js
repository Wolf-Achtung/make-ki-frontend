document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("fragebogen-formular");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
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
      if (result.message === "PDF wird generiert") {
        window.location.href = "vorschau.html";
      } else {
        alert("Es gab ein Problem beim Generieren der Auswertung.");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Senden des Formulars.");
    }
  });
});