document.getElementById("kiForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());

  // Score berechnen aus frage1–frage10
  const scoreFields = [...Array(10).keys()].map(i => `frage${i + 1}`);
  const score = scoreFields.reduce((sum, field) => sum + Number(data[field] || 0), 0);
  data.score = score;

  const res = await fetch("https://make-ki-backend-production.up.railway.app/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  sessionStorage.setItem("gpt_result", JSON.stringify(result));
  window.location.href = "vorschau.html";
});
