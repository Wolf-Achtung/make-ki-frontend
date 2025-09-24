// formbuilder_de.js — FULL
// Minimal-Form (Vanilla JS) mit 3 Schiebereglern und sauberem POST (inkl. `to`)
(function(){
  const el = document.getElementById("ki-form-de");
  if(!el){ return; }

  el.innerHTML = `
    <form id="frmDE">
      <h2>KI Status – Fragebogen (DE)</h2>
      <label>Ihre E-Mail*<br><input type="email" name="email" required /></label><br>
      <label>Unternehmensname<br><input type="text" name="company" /></label><br>
      <label>Branche*<br>
        <select name="branche" required>
          <option value="">Bitte wählen…</option>
          <option>beratung</option><option>it</option><option>marketing</option>
          <option>bau</option><option>industrie</option><option>handel</option>
          <option>finanzen</option><option>gesundheit</option><option>medien</option>
          <option>logistik</option><option>verwaltung</option><option>bildung</option>
        </select>
      </label><br>
      <label>Unternehmensgröße*<br>
        <select name="unternehmensgroesse" required>
          <option value="">Bitte wählen…</option>
          <option value="solo">Solo</option>
          <option value="team">Team (2–10)</option>
          <option value="kmu">KMU (11+)</option>
        </select>
      </label><br>
      <label>Bundesland<br><input type="text" name="bundesland" placeholder="z. B. BE, NW, BY" /></label><br>
      <label>Hauptleistung / wichtigstes Produkt*<br><input type="text" name="hauptleistung" required /></label><br>

      <fieldset>
        <legend>Ihre Präferenzen</legend>
        <label>Risikofreude (1–5)
          <input type="range" name="risikofreude" min="1" max="5" step="1" value="3" />
        </label><span id="lbl_risk">3</span><br>
        <label>Zeitbudget (Std/Woche, 0–10)
          <input type="range" name="zeitbudget" min="0" max="10" step="1" value="2" />
        </label><span id="lbl_time">2</span><br>
        <label>Tool‑Affinität (1–5)
          <input type="range" name="tool_affinitaet" min="1" max="5" step="1" value="3" />
        </label><span id="lbl_tool">3</span>
      </fieldset><br>

      <label>Freitext – Ziele/Use‑Cases<br><textarea name="ziele" rows="3"></textarea></label><br>
      <button type="submit">Report erstellen</button>
    </form>
  `;

  const frm = document.getElementById("frmDE");
  const risk = frm.querySelector('input[name="risikofreude"]');
  const time = frm.querySelector('input[name="zeitbudget"]');
  const tool = frm.querySelector('input[name="tool_affinitaet"]');
  const setLbl = () => {
    document.getElementById("lbl_risk").textContent = risk.value;
    document.getElementById("lbl_time").textContent = time.value;
    document.getElementById("lbl_tool").textContent = tool.value;
  };
  [risk,time,tool].forEach(i=>i.addEventListener("input", setLbl)); setLbl();

  async function login(email){
    const r = await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email, password:"test"})});
    const j = await r.json(); return j.access_token;
  }

  frm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const fd = new FormData(frm);
    const data = Object.fromEntries(fd.entries());
    const token = await login(data.email);
    const payload = {...data, lang:"de", to: data.email};
    const res = await fetch("/briefing_async", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    alert("Report gestartet. Job-ID: "+j.job_id);
  });
})();
