/* filename: schema_client.js
   Lightweight client to load /schema from the backend and expose utility helpers.
*/
(function () {
  "use strict";
  const apiBase = (function () {
    const m = document.querySelector('meta[name="api-base"]');
    return (m && m.content) ? m.content.replace(/\/+$/,'') : '';
  })();

  const state = { schema: null, version: null, logPrefix: "[schema-client]" };

  function fetchJson(url) {
    return fetch(url, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
  }

  function resolveLocalFallback() {
    const path = "./shared/report_schema.json";
    return fetchJson(path);
  }

  function loadSchema() {
    const primary = apiBase ? fetchJson(apiBase + "/schema") : Promise.reject(new Error("no api base"));
    return primary.catch(() => resolveLocalFallback());
  }

  function normEnum(field) {
    if (!field || !Array.isArray(field.enum)) return [];
    return field.enum.map(it => {
      let lbl = it.label;
      if (typeof lbl === "string") {
        return { value: String(it.value), label: { de: lbl, en: lbl } };
      }
      return { value: String(it.value), label: lbl || { de: String(it.value), en: String(it.value) } };
    });
  }

  function bestLabel(lblObj, lang) { if (typeof lblObj === "string") return lblObj; return (lblObj && (lblObj[lang] || lblObj.de || lblObj.en)) || ""; }

  window.schemaClient = { ready: Promise.resolve() };

  window.schemaClient.ready = loadSchema().then(obj => {
    state.schema = obj || {};
    state.version = (obj && obj.version) || "0";
    console.info(state.logPrefix, "loaded schema version", state.version);
  }).catch(err => {
    console.warn(state.logPrefix, "failed to load schema – falling back to empty:", err && err.message);
    state.schema = { fields: {} };
    state.version = "0";
  });

  window.schemaClient.options = function (fieldKey, lang) {
    const fld = (state.schema.fields || {})[fieldKey];
    const items = normEnum(fld);
    return items.map(it => ({ value: it.value, label: bestLabel(it.label, lang || "de") }));
  };
})();