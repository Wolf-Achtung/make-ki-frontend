// formbuilder_en.js — FULL
(function(){
  const el = document.getElementById("ai-form-en");
  if(!el){ return; }

  el.innerHTML = `
    <form id="frmEN">
      <h2>AI Status – Questionnaire (EN)</h2>
      <label>Your email*<br><input type="email" name="email" required /></label><br>
      <label>Company<br><input type="text" name="company" /></label><br>
      <label>Industry*<br>
        <select name="branche" required>
          <option value="">Please choose…</option>
          <option>consulting</option><option>it</option><option>marketing</option>
          <option>construction</option><option>industry</option><option>trade</option>
          <option>finance</option><option>health</option><option>media</option>
          <option>logistics</option><option>public administration</option><option>education</option>
        </select>
      </label><br>
      <label>Company size*<br>
        <select name="company_size" required>
          <option value="">Please choose…</option>
          <option value="solo">Solo</option>
          <option value="team">Small team (2–10)</option>
          <option value="kmu">SME (11+)</option>
        </select>
      </label><br>
      <label>State (DE)<br><input type="text" name="state" placeholder="e.g., BE, NW, BY" /></label><br>
      <label>Main service / product*<br><input type="text" name="main_product" required /></label><br>

      <fieldset>
        <legend>Your preferences</legend>
        <label>Risk appetite (1–5)
          <input type="range" name="risk_appetite" min="1" max="5" step="1" value="3" />
        </label><span id="lbl_risk_en">3</span><br>
        <label>Time capacity (hrs/week, 0–10)
          <input type="range" name="time_capacity" min="0" max="10" step="1" value="2" />
        </label><span id="lbl_time_en">2</span><br>
        <label>Tool affinity (1–5)
          <input type="range" name="tool_affinity" min="1" max="5" step="1" value="3" />
        </label><span id="lbl_tool_en">3</span>
      </fieldset><br>

      <label>Free text – goals/use cases<br><textarea name="goals" rows="3"></textarea></label><br>
      <button type="submit">Generate report</button>
    </form>
  `;

  const frm = document.getElementById("frmEN");
  const risk = frm.querySelector('input[name="risk_appetite"]');
  const time = frm.querySelector('input[name="time_capacity"]');
  const tool = frm.querySelector('input[name="tool_affinity"]');
  const setLbl = () => {
    document.getElementById("lbl_risk_en").textContent = risk.value;
    document.getElementById("lbl_time_en").textContent = time.value;
    document.getElementById("lbl_tool_en").textContent = tool.value;
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
    const payload = {...data, lang:"en", to: data.email};
    const res = await fetch("/briefing_async", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    alert("Report started. Job ID: "+j.job_id);
  });
})();
