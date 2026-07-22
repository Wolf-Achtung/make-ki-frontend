/**
 * Zentrale API-Konfiguration — EINZIGE kanonische Quelle der Backend-URL.
 *
 * Auflösungsreihenfolge:
 *   1. <meta name="api-base">           (optional, seitenweiser Override)
 *   2. window.APP_CONFIG.API_BASE      (falls vor diesem Skript gesetzt)
 *   3. DEFAULT_API_BASE                (kanonischer Fallback, s. u.)
 *
 * Hinweis: Die <meta name="api-base">-Tags in den HTML-Seiten sind OPTIONAL —
 * sie dienen nur als Override-Mechanismus. Ohne Meta-Tag greift automatisch
 * DEFAULT_API_BASE; neue Seiten müssen nur dieses Skript einbinden.
 * Andere Module lesen die Basis-URL über window.APP_CONFIG.API_BASE
 * (bzw. window.__CONFIG__.API_BASE) und dürfen die URL nicht hartkodieren.
 */
(function(){
  var DEFAULT_API_BASE = 'https://api-ki-backend-neu-production.up.railway.app/api';
  try{
    var meta = document.querySelector('meta[name=api-base]');
    var base = (meta && meta.content)
      || (window.APP_CONFIG && window.APP_CONFIG.API_BASE)
      || DEFAULT_API_BASE;
    base = String(base || DEFAULT_API_BASE).replace(/\/+$/,''); // trim trailing slashes
    window.APP_CONFIG = window.APP_CONFIG || {};
    window.APP_CONFIG.API_BASE = base;
    window.__CONFIG__ = window.__CONFIG__ || {};
    window.__CONFIG__.API_BASE = base;

    // Sichtbare Branchen im Fragebogen (Allowlist der option-values des
    // branche-Selects). Leeres Array oder Weglassen = alle Branchen sichtbar;
    // hier lässt sich die Sichtbarkeit jederzeit zurückdrehen.
    if (!window.APP_CONFIG.VISIBLE_BRANCHES) {
      window.APP_CONFIG.VISIBLE_BRANCHES = ['medien'];
    }
  }catch(_){}
})();
