(function(global){
  "use strict";
  var SCHEMA_URLS = ["/schema","/schema.json"];
  var CACHE_KEY = "SCHEMA_CACHE_V1";
  var CACHE_ETAG_KEY = "SCHEMA_CACHE_ETAG_V1";
  function loadFromCache(){ try{ var raw = localStorage.getItem(CACHE_KEY); return raw? JSON.parse(raw): null; }catch(e){ return null; } }
  function saveToCache(obj, etag){ try{ localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); if(etag){ localStorage.setItem(CACHE_ETAG_KEY, etag); } }catch(e){} }
  function fetchWithETag(url, etag){ var headers = {}; if(etag){ headers["If-None-Match"] = etag; } return fetch(url, { headers: headers, credentials: "same-origin" }); }
  function normalizeSchema(schema){ schema = schema || {}; schema.fields = schema.fields || (schema.properties || {}); return schema; }
  function applySchemaToForm(schema){ console.debug("[schema_client] fields:", Object.keys(schema.fields||{}).length); }
  async function loadSchema(){
    var cache = loadFromCache(); var etag = localStorage.getItem(CACHE_ETAG_KEY) || "";
    try{
      var resp = await fetchWithETag(SCHEMA_URLS[0], etag);
      if(resp.status === 304 && cache){ applySchemaToForm(cache); return cache; }
      if(resp.ok){ var e1 = resp.headers.get("ETag") || ""; var d1 = normalizeSchema(await resp.json()); saveToCache(d1, e1); applySchemaToForm(d1); return d1; }
      var resp2 = await fetchWithETag(SCHEMA_URLS[1], etag);
      if(resp2.status === 304 && cache){ applySchemaToForm(cache); return cache; }
      if(resp2.ok){ var e2 = resp2.headers.get("ETag") || ""; var d2 = normalizeSchema(await resp2.json()); saveToCache(d2, e2); applySchemaToForm(d2); return d2; }
      throw new Error("Schema not found");
    }catch(err){ console.error("[schema_client] load error:", err); if(cache){ applySchemaToForm(cache); return cache; } return null; }
  }
  if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", loadSchema); } else { loadSchema(); }
})(this);