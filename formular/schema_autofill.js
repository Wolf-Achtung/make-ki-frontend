/* filename: schema_autofill.js
   Auto-populate <select> elements for branche/unternehmensgroesse/bundesland using schemaClient.
   Robust: works even when the form is inserted later (MutationObserver).
*/
(function () {
  "use strict";
  const FIELD_KEYS = ["branche", "unternehmensgroesse", "bundesland"];
  const LANG = (document.documentElement.getAttribute("lang") || "de").toLowerCase().startsWith("de") ? "de" : "en";
  const PLACEHOLDER = LANG === "de" ? "Bitte wählen…" : "Please choose…";

  function ensureOptions(select, options) {
    const hasRealOptions = Array.from(select.options).some(opt => opt.value && opt.value !== "");
    if (hasRealOptions && select.dataset.autofilled === "1") return; // don't override user's config
    // wipe
    select.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = PLACEHOLDER;
    ph.disabled = true;
    ph.selected = true;
    select.appendChild(ph);
    for (const o of options) {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      select.appendChild(opt);
    }
    select.dataset.autofilled = "1";
  }

  function tryPopulate(root) {
    if (!window.schemaClient || !window.schemaClient.options) return;
    FIELD_KEYS.forEach(key => {
      // by name
      const byName = root.querySelectorAll(`select[name="${key}"]`);
      // by id
      const byId = root.querySelectorAll(`select#${key}`);
      const nodes = new Set([...byName, ...byId]);
      const options = window.schemaClient.options(key, LANG);
      nodes.forEach(sel => ensureOptions(sel, options));
    });
  }

  function setupObserver() {
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(n => {
            if (!(n instanceof HTMLElement)) return;
            tryPopulate(n);
          });
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  (async function init() {
    if (window.schemaClient && window.schemaClient.ready) {
      try { await window.schemaClient.ready; } catch (e) {}
    }
    tryPopulate(document);
    setupObserver();
  })();
})();