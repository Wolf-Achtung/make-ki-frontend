document.getElementById("kiForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = document.querySelector("button[type=submit]");
  const previewToggle = document.getElementById("previewToggle");
  button.disabled = true;
  button.textContent = "⏳ wird ausgewertet ...";

  const data = Object.fromEntries(new FormData(e.target).entries());

  // Score berechnen aus frage1–frage10
  const scoreFields = [...Array(10).keys()].map(i => `frage${i + 1}`);
  const score = scoreFields.reduce((sum, field) => sum + Number(data[field] || 0), 0);
  data.score = score;
  data.bewertung = score < 20 ? "kritisch" : score > 30 ? "gut" : "ausbaufähig";
  data.status = score < 25 ? "in Prüfung" : "aktiv";

  const res = await fetch("https://make-ki-backend-production.up.railway.app/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  sessionStorage.setItem("gpt_result", JSON.stringify(result));

  // PDF erzeugen
  const pdfRes = await fetch("https://make-ki-backend-production.up.railway.app/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...result,
      template_variant: previewToggle?.checked ? "preview" : "full"
    })
  });

  const pdf = await pdfRes.json();
  if (pdf.pdf_url) window.location.href = pdf.pdf_url;
  else alert("Fehler beim Erzeugen der PDF.");

  button.disabled = false;
  button.textContent = "Zur Auswertung";
});