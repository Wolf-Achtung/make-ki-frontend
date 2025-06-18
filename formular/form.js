// form.js

async function submitForm(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  // Datum erzeugen, falls nicht vorhanden
  if (!data.datum) {
    const today = new Date().toISOString().slice(0, 10);
    data.datum = today;
  }

  try {
    const res = await fetch("https://make-ki-backend-production.up.railway.app/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (res.ok) {
      sessionStorage.setItem("kiCheckResult", JSON.stringify(result));
      window.location.href = "vorschau.html";
    } else {
      alert("Fehler bei der Analyse: " + result.error);
    }
  } catch (err) {
    console.error("❌ Fehler beim Absenden:", err);
    alert("Verbindung zum Server fehlgeschlagen.");
  }
}

document.querySelector("form").addEventListener("submit", submitForm);
