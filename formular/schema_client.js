/* schema_client.js
   Lightweight client to load a shared form schema (industry, size, states, etc.)
   Safe by default: never throws, exposes a tiny API on window.schemaClient.
*/
(function () {
  "use strict";

  var SCHEMA_URLS = [
    "/schema",  // backend canonical schema (FastAPI)

    "/schema.json",
    "./schema.json",
    "/formular/schema.json",
    "/config/schema.json",
    "/data/schema.json"
  ];

  var state = {
    loaded: false,
    version: "fallback",
    fields: null,
    lang: (document.documentElement.getAttribute("lang") || "de").toLowerCase().startsWith("de") ? "de" : "en",
    source: "fallback"
  };

  function fallbackSchema() {
    // Minimal, aber vollständig: deckt Branche/Größe/Bundesland/Rechtsform ab
    state.version = "fallback-2025-10-10";
    state.source = "inline-fallback";
    state.fields = {
      branche: [
        { value: "marketing", label_de: "Marketing & Werbung", label_en: "Marketing & Advertising" },
        { value: "beratung", label_de: "Beratung", label_en: "Consulting & Services" },
        { value: "it", label_de: "IT & Software", label_en: "IT & Software" },
        { value: "finanzen", label_de: "Finanzen & Versicherungen", label_en: "Finance & Insurance" },
        { value: "handel", label_de: "Handel & E‑Commerce", label_en: "Retail & E‑Commerce" },
        { value: "bildung", label_de: "Bildung", label_en: "Education" },
        { value: "verwaltung", label_de: "Verwaltung", label_en: "Public Sector" },
        { value: "gesundheit", label_de: "Gesundheit & Pflege", label_en: "Healthcare" },
        { value: "bau", label_de: "Bauwesen & Architektur", label_en: "Construction & Architecture" },
        { value: "medien", label_de: "Medien & Kreativwirtschaft", label_en: "Media & Creative Industries" },
        { value: "industrie", label_de: "Industrie & Produktion", label_en: "Manufacturing & Industry" },
        { value: "logistik", label_de: "Transport & Logistik", label_en: "Transport & Logistics" }
      ],
      unternehmensgroesse: [
        { value: "solo", label_de: "solo", label_en: "1 (Solo/Freelance)" },
        { value: "team", label_de: "2–10", label_en: "2–10 (Small Team)" },
        { value: "kmu", label_de: "11–100", label_en: "11–100 (SME)" }
      ],
      selbststaendig: [
        { value: "freiberufler", label_de: "Freiberufler", label_en: "Freelancer/Sole trader" },
        { value: "kapitalgesellschaft", label_de: "Kapitalgesellschaft (1‑Person)", label_en: "Single‑person company (Ltd./UG/GmbH)" },
        { value: "einzelunternehmer", label_de: "Einzelunternehmer (Gewerbe)", label_en: "Sole proprietor (trade)" },
        { value: "sonstiges", label_de: "Sonstiges", label_en: "Other" }
      ],
      bundesland: [
        { value: "bw", label_de: "Baden‑Württemberg", label_en: "Baden‑Württemberg" },
        { value: "by", label_de: "Bayern", label_en: "Bavaria" },
        { value: "be", label_de: "Berlin", label_en: "Berlin" },
        { value: "bb", label_de: "Brandenburg", label_en: "Brandenburg" },
        { value: "hb", label_de: "Bremen", label_en: "Bremen" },
        { value: "hh", label_de: "Hamburg", label_en: "Hamburg" },
        { value: "he", label_de: "Hessen", label_en: "Hesse" },
        { value: "mv", label_de: "Mecklenburg‑Vorpommern", label_en: "Mecklenburg‑Western Pomerania" },
        { value: "ni", label_de: "Niedersachsen", label_en: "Lower Saxony" },
        { value: "nw", label_de: "Nordrhein‑Westfalen", label_en: "North Rhine‑Westphalia" },
        { value: "rp", label_de: "Rheinland‑Pfalz", label_en: "Rhineland‑Palatinate" },
        { value: "sl", label_de: "Saarland", label_en: "Saarland" },
        { value: "sn", label_de: "Sachsen", label_en: "Saxony" },
        { value: "st", label_de: "Sachsen‑Anhalt", label_en: "Saxony‑Anhalt" },
        { value: "sh", label_de: "Schleswig‑Holstein", label_en: "Schleswig‑Holstein" },
        { value: "th", label_de: "Thüringen", label_en: "Thuringia" }
      ]
    };
  }

  function toLocalizedOptions(arr) {
    if (!Array.isArray(arr)) return [];
    var lang = state.lang;
    return arr.map(function (o) {
      var lab = (lang === "de") ? (o.label_de || o.label || "") : (o.label_en || o.label || "");
      return { value: String(o.value || ""), label: String(lab || String(o.value || "")) };
    });
  }

  function resolveOptions(key) {
    if (!state.fields || !state.fields[key]) return [];
    return toLocalizedOptions(state.fields[key]);
  }

  function dispatchReady() {
    try {
      document.dispatchEvent(new CustomEvent("schema:ready", {
        detail: { version: state.version, source: state.source }
      }));
    } catch (_) {}
  }

  function load() {
    if (state.loaded) return Promise.resolve(state);
    var tried = 0;

    function next() {
      if (tried >= SCHEMA_URLS.length) {
        fallbackSchema();
        state.loaded = true;
        console.info("[schema] using fallback schema:", state.version);
        dispatchReady();
        return Promise.resolve(state);
      }
      var url = SCHEMA_URLS[tried++];
      return fetch(url, { credentials: "omit" })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
        .then(function (data) {
          // Accept formats: {version, fields:{key:[...]}} or a flat map {key:[...]}
          if (data && data.fields) {
            state.fields = data.fields;
          } else {
            state.fields = data;
          }
          if (!state.fields || typeof state.fields !== "object") throw new Error("invalid schema");
          state.version = String(data.version || "custom");
          state.source = url;
          state.loaded = true;
          console.info("[schema] loaded", state.version, "from", url);
          dispatchReady();
          return state;
        })
        .catch(function () { return next(); });
    }
    return next();
  }

  // public API
  window.schemaClient = {
    get ready() { return state.loaded; },
    get version() { return state.version; },
    get source() { return state.source; },
    load: load,
    options: function (key) { return resolveOptions(key); },
    field: function (key) { return (state.fields && state.fields[key]) ? state.fields[key] : null; }
  };

  // auto-load
  document.addEventListener("DOMContentLoaded", function(){ load(); });
})();
