/* schema_autofill.js
   Non-destructive autofill for selects from schemaClient.
   - Fills ONLY if a select has 0/1 option (placeholder) → never overwrites user choices.
   - Preserves previous selection when rebuilding options.
*/
(function () {
  "use strict";

  function hasRealOptions(select) {
    if (!select) return false;
    var opts = select.querySelectorAll("option");
    if (opts.length <= 1) return false;
    if (opts.length === 2 && (opts[1].value || "").trim() === "") return false;
    return true;
  }

  function ensurePlaceholder(select, text) {
    if (!select) return;
    var first = select.querySelector("option[value='']");
    if (!first) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = text || (document.documentElement.lang === "de" ? "Bitte wählen…" : "Please choose…");
      select.insertBefore(opt, select.firstChild);
    } else {
      first.textContent = text || first.textContent || (document.documentElement.lang === "de" ? "Bitte wählen…" : "Please choose…");
    }
  }

  function safePopulate(key, placeholderText) {
    try {
      var select = document.getElementById(key);
      if (!select) return;

      // Only populate if there are no real options yet
      if (hasRealOptions(select)) return;

      var prev = select.value;
      var options = (window.schemaClient && window.schemaClient.options(key)) || [];
      ensurePlaceholder(select, placeholderText);
      // Clear existing (keep placeholder)
      select.querySelectorAll("option:not([value=''])").forEach(function (n) { n.remove(); });

      options.forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        select.appendChild(opt);
      });

      // Preserve selection if possible
      if (prev && select.querySelector("option[value='" + prev + "']")) {
        select.value = prev;
      } else {
        // leave at placeholder
        select.value = "";
      }
    } catch (_) {}
  }

  function init() {
    // Fill canonical selects once the schema is ready.
    safePopulate("branche");
    safePopulate("unternehmensgroesse");
    safePopulate("bundesland");
    // "selbststaendig" depends on unternehmensgroesse, but we still keep it non-destructive
    safePopulate("selbststaendig", document.documentElement.lang === "de" ? "Nur relevant bei Größe = 1" : "Only relevant if size = 1");

    // Mark selects as user‑touched to avoid any future overwrite
    ["branche", "unternehmensgroesse", "bundesland", "selbststaendig"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", function () { el.dataset.userSelected = "1"; });
    });

    // If company size changes, we may (re)populate the legal form – but never touch "branche"
    var sizeEl = document.getElementById("unternehmensgroesse");
    if (sizeEl) {
      sizeEl.addEventListener("change", function () {
        var legal = document.getElementById("selbststaendig");
        if (!legal) return;
        // Only (re)populate if empty; otherwise keep user's choice
        if (!hasRealOptions(legal)) safePopulate("selbststaendig");
      });
    }
  }

  document.addEventListener("schema:ready", init);
  // If schemaClient loaded before this script:
  if (window.schemaClient && window.schemaClient.ready) { init(); }
})();
