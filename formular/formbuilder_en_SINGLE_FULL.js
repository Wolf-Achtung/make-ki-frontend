/* File: formular/formbuilder_en_SINGLE_FULL.js */
/* Multi-step wizard with strict required-fields validation & persistent autosave. */
(function () {
  "use strict";

  var LANG = "en";
  var SCHEMA_VERSION = "1.5.0";
  var STORAGE_PREFIX = "autosave_form_";
  var SUBMIT_PATH = "/briefing_async";

  function getBaseUrl() {
    try { var meta = document.querySelector('meta[name="api-base"]'); var v = (meta && meta.content) || (window.API_BASE || ""); return String(v || "").replace(/\/+$/, ""); }
    catch (e) { return ""; }
  }
  function getToken() { var keys = ["jwt","access_token","id_token","AUTH_TOKEN","token"]; for (var i=0;i<keys.length;i++){ try{ var t=localStorage.getItem(keys[i]); if(t) return t; }catch(e){} } return null; }
  function getEmailFromJWT(token){ try{ if(!token || token.split(".").length!==3) return null; var p=JSON.parse(atob(token.split(".")[1])); return p.email || p.preferred_username || p.sub || null; }catch(e){ return null; } }
  function dispatchProgress(step,total){ try{ document.dispatchEvent(new CustomEvent("fb:progress",{detail:{step:step,total:total}})); }catch(_){} }

  // Minimal styles omitted for brevity (same as DE)
  (function injectCSS(){ try{ var css=""; /* same CSS as DE file */ var s=document.createElement("style"); s.type="text/css"; s.appendChild(document.createTextNode(css)); document.head.appendChild(s); }catch(_){}})();

  var fields = [
    { key: "branche", label: "In which industry is your company active?", type: "select",
      options: [
        { value: "marketing", label: "Marketing & advertising" }, { value: "beratung", label: "Consulting & services" },
        { value: "it", label: "IT & software" }, { value: "finanzen", label: "Finance & insurance" },
        { value: "handel", label: "Retail & e-commerce" }, { value: "bildung", label: "Education" },
        { value: "verwaltung", label: "Administration" }, { value: "gesundheit", label: "Health & care" },
        { value: "bau", label: "Construction & architecture" }, { value: "medien", label: "Media & creative industries" },
        { value: "industrie", label: "Industry & production" }, { value: "logistik", label: "Transport & logistics" }
      ],
      description: "Industry drives personalisation, benchmarks and compliance notes."
    },
    { key: "unternehmensgroesse", label: "Company size", type: "select",
      options: [ { value: "solo", label: "1 (sole proprietor / freelancer)" }, { value: "small", label: "2–10 (small team)" }, { value: "kmu", label: "11–100 (SME)" } ]
    },
    { key: "bundesland", label: "State (DE)", type: "select",
      options: [ { value: "bw", label: "Baden-Württemberg" }, { value: "by", label: "Bayern" }, { value: "be", label: "Berlin" }, { value: "bb", label: "Brandenburg" }, { value: "hb", label: "Bremen" }, { value: "hh", label: "Hamburg" }, { value: "he", label: "Hessen" }, { value: "mv", label: "Mecklenburg-Vorpommern" }, { value: "ni", label: "Niedersachsen" }, { value: "nw", label: "Nordrhein-Westfalen" }, { value: "rp", label: "Rheinland-Pfalz" }, { value: "sl", label: "Saarland" }, { value: "sn", label: "Saxony" }, { value: "st", label: "Saxony-Anhalt" }, { value: "sh", label: "Schleswig-Holstein" }, { value: "th", label: "Thuringia" } ]
    },
    { key: "hauptleistung", label: "Main product / core service", type: "textarea", placeholder: "e.g. CNC production, social media campaigns, tax consulting" },

    { key: "digitalisierungsgrad", label: "How digital are processes? (1–10)", type: "slider", min: 1, max: 10, step: 1 },
    { key: "prozesse_papierlos", label: "Share of paperless processes", type: "select",
      options: [ { value: "0-20", label: "0–20%" }, { value: "21-50", label: "21–50%" }, { value: "51-80", label: "51–80%" }, { value: "81-100", label: "81–100%" } ] },
    { key: "automatisierungsgrad", label: "Degree of automation", type: "select",
      options: [ { value: "sehr_niedrig", label: "Very low" }, { value: "eher_niedrig", label: "Rather low" }, { value: "mittel", label: "Medium" }, { value: "eher_hoch", label: "Rather high" }, { value: "sehr_hoch", label: "Very high" } ] },
    { key: "innovationskultur", label: "Openness to innovation", type: "select",
      options: [ { value: "sehr_offen", label: "Very open" }, { value: "eher_offen", label: "Rather open" }, { value: "neutral", label: "Neutral" }, { value: "eher_zurueckhaltend", label: "Rather reluctant" }, { value: "sehr_zurueckhaltend", label: "Very reluctant" } ] },
    { key: "ki_knowhow", label: "Team AI know‑how", type: "select",
      options: [ { value: "keine", label: "None" }, { value: "grundkenntnisse", label: "Basic" }, { value: "mittel", label: "Medium" }, { value: "fortgeschritten", label: "Advanced" }, { value: "expertenwissen", label: "Expert" } ] },

    { key: "datenschutz", label: "I have read the <a href='privacy.html' onclick='window.open(this.href, \"PrivacyPopup\", \"width=600,height=700\"); return false;'>privacy notice</a> and agree.", type: "privacy" },
    { key: "investitionsbudget", label: "Budget for AI/digitalisation next year", type: "select",
      options: [ { value: "unter_2000", label: "Under €2,000" }, { value: "2000_10000", label: "€2,000–10,000" }, { value: "10000_50000", label: "€10,000–50,000" }, { value: "ueber_50000", label: "Over €50,000" }, { value: "unklar", label: "Unclear" } ] }
  ];

  var blocks = [
    { name: "Company", keys: ["branche","unternehmensgroesse","bundesland","hauptleistung"] },
    { name: "Status Quo", keys: ["digitalisierungsgrad","prozesse_papierlos","automatisierungsgrad","innovationskultur","ki_knowhow"] },
    { name: "Legal & Funding", keys: ["datenschutz","investitionsbudget"] }
  ];

  var currentBlock = 0;
  var formData = {};
  var autosaveKey = (function () { try{ var t=getToken(); var e=getEmailFromJWT(t); return (e ? (STORAGE_PREFIX+e) : (STORAGE_PREFIX+"test"))+":"+LANG+":"+SCHEMA_VERSION; }catch(e){ return STORAGE_PREFIX+"test:"+LANG+":"+SCHEMA_VERSION; }})();
  var stepKey = autosaveKey + ":step";

  function loadAutosave(){ try{ formData = JSON.parse(localStorage.getItem(autosaveKey) || "{}"); }catch(e){ formData = {}; } }
  function saveAutosave(){ try{ localStorage.setItem(autosaveKey, JSON.stringify(formData)); }catch(e){} }
  function loadStep(){ try{ var raw=localStorage.getItem(stepKey); var n=raw==null?0:parseInt(raw,10); if(isNaN(n)) n=0; currentBlock=Math.max(0,Math.min(blocks.length-1,n)); }catch(_){ currentBlock=0; } }
  function saveStep(){ try{ localStorage.setItem(stepKey, String(currentBlock)); }catch(_){ } }

  function findField(k){ for (var i=0;i<fields.length;i++) if(fields[i].key===k) return fields[i]; return null; }
  function labelOf(k){ var f=findField(k); return (f && f.label) || k; }
  function collectValue(f){
    if (f.type==="privacy"){ var ch=document.getElementById(f.key); return ch ? !!ch.checked : false; }
    if (f.type==="slider"){ var el=document.getElementById(f.key); return el ? el.value : (f.min||1); }
    var inp=document.getElementById(f.key); return inp ? inp.value : "";
  }

  function renderField(f){
    var v=formData[f.key]||""; var guidance=f.description?'<div class="guidance'+(f.type==="privacy"?" important":"")+'">'+f.description+'</div>':"";
    var html="";
    if(f.type==="select"){
      var opts='<option value="">Please select…</option>'; for(var i=0;i<(f.options||[]).length;i++){ var o=f.options[i]; var sel=(String(v||"")===String(o.value))?' selected':''; opts+='<option value="'+o.value+'"'+sel+'>'+o.label+'</option>'; }
      html='<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+'<select id="'+f.key+'" name="'+f.key+'">'+opts+'</select>';
    } else if(f.type==="textarea"){
      html='<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+'<textarea id="'+f.key+'" name="'+f.key+'" placeholder="'+(f.placeholder||"")+'">'+(v||"")+'</textarea>';
    } else if(f.type==="slider"){
      var val=(v!=null?v:(f.min||1));
      html='<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+'<div class="slider-container"><input type="range" id="'+f.key+'" name="'+f.key+'" min="'+(f.min||1)+'" max="'+(f.max||10)+'" step="'+(f.step||1)+'" value="'+val+'" oninput="this.parentElement.querySelector(\'.slider-value-label\').innerText=this.value"><span class="slider-value-label">'+val+'</span></div>';
    } else if(f.type==="privacy"){
      var chk=(v===true)?' checked':'';
      html='<div class="guidance important">'+(f.description||"")+'</div><label class="checkbox-label"><input type="checkbox" id="'+f.key+'" name="'+f.key+'"'+chk+' required><span>'+f.label+'</span></label>';
    } else {
      html='<label for="'+f.key+'"><b>'+f.label+'</b></label>'+guidance+'<input type="text" id="'+f.key+'" name="'+f.key+'" value="'+(v||"")+'">';
    }
    return '<div class="form-group" data-key="'+f.key+'">'+html+'</div>';
  }

  function renderStep(){
    var root=document.getElementById("formbuilder"); if(!root) return;
    var block=blocks[currentBlock]; var html='<section class="fb-section"><div class="fb-head"><span class="fb-step">Step '+(currentBlock+1)+'/'+blocks.length+'</span><span class="fb-title">'+block.name+'</span></div>';
    for (var i=0;i<block.keys.length;i++){ var k=block.keys[i]; var f=findField(k); if(!f) continue; root.innerHTML=html+(root.innerHTML||""); }
    html+='';
    var inner=''; for (var j=0;j<block.keys.length;j++){ inner+=renderField(findField(block.keys[j])); }
    html+=inner+'</section><div class="form-nav"><button type="button" class="btn btn-secondary mr-auto" id="btn-reset">Reset</button><button type="button" class="btn btn-secondary" id="btn-back" '+(currentBlock===0?'disabled':'')+'>Back</button>'+(currentBlock<blocks.length-1?'<button type="button" class="btn btn-primary" id="btn-next">Next</button>':'<button type="button" class="btn btn-primary" id="btn-submit">Submit</button>')+'</div><div id="fb-msg" aria-live="polite"></div>';
    root.innerHTML=html;

    root.addEventListener("change", handleChange);
    root.addEventListener("input", handleChange);
    var back=document.getElementById("btn-back"); if(back) back.addEventListener("click", function(){ if(currentBlock>0){ currentBlock--; saveStep(); renderStep(); updateProgress(); } });
    var next=document.getElementById("btn-next");
    if(next){ next.addEventListener("click", function(){ var missing=validateCurrentBlock(true); if(missing.length===0 && currentBlock<blocks.length-1){ currentBlock++; saveStep(); renderStep(); updateProgress(); } }); next.disabled=validateCurrentBlock(false).length>0; }
    var reset=document.getElementById("btn-reset"); if(reset) reset.addEventListener("click", function(){ if(confirm("Reset the form?")){ try{ localStorage.removeItem(autosaveKey); localStorage.removeItem(stepKey);}catch(_){} formData={}; currentBlock=0; saveStep(); renderStep(); updateProgress(); } });
    var submit=document.getElementById("btn-submit"); if(submit) submit.addEventListener("click", submitForm);
    updateProgress();
  }

  function handleChange(){ var block=blocks[currentBlock]; for (var i=0;i<block.keys.length;i++){ var k=block.keys[i]; var f=findField(k); if(!f) continue; formData[k]=collectValue(f);} saveAutosave(); var next=document.getElementById("btn-next"); if(next) next.disabled=validateCurrentBlock(false).length>0; }
  function markInvalid(key,on){ var grp=document.querySelector('.form-group[data-key="'+key+'"]'); if(!grp) return; if(on) grp.classList.add("invalid-group"); else grp.classList.remove("invalid-group"); var input=document.getElementById(key); if(input){ if(on) input.classList.add("invalid"); else input.classList.remove("invalid"); } }

  function validateCurrentBlock(focusFirst){
    var mandatory={"branche":1,"unternehmensgroesse":1,"bundesland":1,"hauptleistung":1,"investitionsbudget":1,"datenschutz":1};
    var missing=[]; var block=blocks[currentBlock];
    for(var j=0;j<block.keys.length;j++) markInvalid(block.keys[j],false);
    for(var i=0;i<block.keys.length;i++){
      var k=block.keys[i],f=findField(k); if(!f) continue; var v=formData[k], ok=true;
      if(mandatory[k]){ if(f.type==="privacy") ok=(v===true); else ok=!!v && String(v).trim()!==""; }
      if(!ok){ missing.push(labelOf(k)); markInvalid(k,true); }
    }
    if(missing.length && focusFirst){ var msg=document.getElementById("fb-msg"); if(msg){ msg.textContent="Please complete: "+missing.join(", "); msg.setAttribute("role","alert"); } }
    return missing;
  }
  function updateProgress(){ dispatchProgress(currentBlock+1, blocks.length); }

  function submitForm(){
    for(var bi=0; bi<blocks.length; bi++){ var b=blocks[bi]; for(var ki=0; ki<b.keys.length; ki++){ var k=b.keys[ki]; var f=findField(k); if(!f) continue; formData[k]=collectValue(f);} }
    var hardMissing=[]; ["branche","unternehmensgroesse","bundesland","hauptleistung","investitionsbudget","datenschutz"].forEach(function(k){ var f=findField(k),v=formData[k],ok=true; if(f && f.type==="privacy") ok=(v===true); else ok=!!v && String(v).trim()!==""; if(!ok) hardMissing.push(labelOf(k)); });
    if(hardMissing.length){ var msg=document.getElementById("fb-msg"); if(msg){ msg.textContent="Please complete: "+hardMissing.join(", "); msg.setAttribute("role","alert"); } return; }

    var token=getToken(), root=document.getElementById("formbuilder");
    if(root) root.innerHTML='<section class="fb-section"><h2>Thank you!</h2><div class="guidance">Your AI analysis is being generated. You will receive the PDF by e‑mail.</div></section>';
    if(!token){ if(root) root.insertAdjacentHTML("beforeend",'<div class="guidance important" role="alert">Your session has expired. <a href="/login.html">Please log in again</a>.</div>'); return; }

    var data={}; for(var i=0;i<fields.length;i++){ data[fields[i].key]=formData[fields[i].key]; } data.lang=LANG;
    var email=getEmailFromJWT(token); if(email){ data.email=email; data.to=email; }
    var url=getBaseUrl()+SUBMIT_PATH;
    fetch(url,{ method:"POST", headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+token }, body:JSON.stringify(data), credentials:"include", keepalive:true }).then(function(res){ if(res && res.status===401){ try{ localStorage.removeItem("jwt"); }catch(e){} } }).catch(function(){});
  }

  window.addEventListener("DOMContentLoaded", function(){ loadAutosave(); loadStep(); renderStep(); });
})();
