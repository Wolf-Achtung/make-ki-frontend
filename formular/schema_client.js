
/**
 * schema_client.js – robustes Laden des Schemas (mit ETag-Caching & If-None-Match).
 * Reihenfolge: /schema → /schema.json → Fallback-URL
 * Non-destructive Autofill bleibt gewahrt: writeOnly Felder werden nicht überschrieben.
 */
(function(global){
  "use strict";

  var SCHEMA_URLS = [
    "/schema",
    "/schema.json"
  ];

  var CACHE_KEY = "SCHEMA_CACHE_V1";
  var CACHE_ETAG_KEY = "SCHEMA_CACHE_ETAG_V1";

  function loadFromCache(){
    try{
      var raw = localStorage.getItem(CACHE_KEY);
      if(!raw){ return null; }
      return JSON.parse(raw);
    }catch(e){ return null; }
  }
  function saveToCache(obj, etag){
    try{
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
      if(etag){ localStorage.setItem(CACHE_ETAG_KEY, etag); }
    }catch(e){}
  }

  function fetchWithETag(url, etag){
    var headers = {};
    if(etag){ headers["If-None-Match"] = etag; }
    return fetch(url, { headers: headers, credentials: "same-origin" });
  }

  function pickUrl(urls){ return urls[0]; }

  function normalizeSchema(schema){
    // Stelle sicher, dass fields-Objekt existiert.
    schema = schema || {};
    schema.fields = schema.fields || (schema.properties || {});
    return schema;
  }

  function applySchemaToForm(schema){
    // Hier nur Platzhalter – Integration in Deinen Formbuilder bleibt projekt-spezifisch.
    // Wichtig: Non-destructive – vorhandene Values nicht überschreiben.
    console.debug("[schema_client] schema fields:", Object.keys(schema.fields||{}).length);
  }

  async function loadSchema(){
    var cache = loadFromCache();
    var etag = localStorage.getItem(CACHE_ETAG_KEY) || "";
    var url = pickUrl(SCHEMA_URLS);

    try{
      var resp = await fetchWithETag(url, etag);
      if(resp.status === 304 && cache){
        applySchemaToForm(cache);
        return cache;
      }
      if(resp.ok){
        var newEtag = resp.headers.get("ETag") || "";
        var data = await resp.json();
        data = normalizeSchema(data);
        saveToCache(data, newEtag);
        applySchemaToForm(data);
        return data;
      }
      // Fallback auf 2. URL
      var resp2 = await fetchWithETag(SCHEMA_URLS[1], etag);
      if(resp2.status === 304 && cache){
        applySchemaToForm(cache); return cache;
      }
      if(resp2.ok){
        var newEtag2 = resp2.headers.get("ETag") || "";
        var data2 = await resp2.json();
        data2 = normalizeSchema(data2);
        saveToCache(data2, newEtag2);
        applySchemaToForm(data2);
        return data2;
      }
      throw new Error("Schema nicht gefunden");
    }catch(err){
      console.error("[schema_client] Fehler beim Laden des Schemas:", err);
      if(cache){ applySchemaToForm(cache); return cache; }
      return null;
    }
  }

  // Auto-load
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", loadSchema);
  }else{
    loadSchema();
  }
})(this);
