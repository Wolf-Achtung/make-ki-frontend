document.getElementById("kiForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = document.querySelector("button[type=submit]");
  const previewToggle = document.getElementById("previewToggle");
  button.disabled = true;
  button.textContent = "⏳ wird ausgewertet ...";

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  // READINESS scoring (r1–r5)
  const readinessFields = ["r1", "r2", "r3", "r4", "r5"];
  const complianceFields = ["c2", "c3", "c5"]; // scored (1–4)
  const useCaseFields = []; // optional for future weighting

  const scaleMap = {
    "trifft nicht zu": 1,
    "teilweise": 2,
    "überwiegend": 3,
    "voll zutreffend": 4
  };

  const sumScores = (fields) =>
    fields.reduce((sum, field) => sum + (scaleMap[data[field]] || 0), 0);

  const score_readiness = sumScores(readinessFields);
  const score_compliance = sumScores(complianceFields);
  const score_total = score_readiness + score_compliance;

  data.score_readiness = score_readiness;
  data.score_compliance = score_compliance;
  data.score_total = score_total;

  data.bewertung = score_total < 10
    ? "kritisch"
    : score_total < 20
    ? "ausbaufähig"
    : "gut";

  // API: Analyse-Daten senden
  const response = await fetch("https://make-ki-backend-production.up.railway.app/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  sessionStorage.setItem("gpt_result", JSON.stringify(result));

  // PDF erzeugen (preview/full toggle)
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
