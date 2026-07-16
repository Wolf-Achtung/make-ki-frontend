/**
 * KIS-1269: Cookiefreie First-Party-Reichweitenmessung.
 *
 * Sendet anonyme Zähl-Events an das eigene Backend — KEINE Cookies,
 * KEINE IDs, KEIN Fingerprinting. Nur: Event-Name (feste Allowlist im
 * Backend), Seitenpfad, Sprache, Referrer-HOST. Fehler werden bewusst
 * verschluckt: Analytics darf die Seite nie stören.
 */
(function () {
  "use strict";

  function apiBase() {
    var meta = document.querySelector('meta[name="api-base"]');
    return (meta && meta.content) ||
      "https://api-ki-backend-neu-production.up.railway.app";
  }

  function payload(eventName) {
    var refHost = "";
    try { if (document.referrer) refHost = new URL(document.referrer).hostname; } catch (e) {}
    return JSON.stringify({
      event: eventName,
      page: location.pathname,
      lang: (document.documentElement.getAttribute("lang") || "").slice(0, 8),
      ref: refHost
    });
  }

  function track(eventName) {
    try {
      var url = apiBase() + "/api/metrics/event";
      var body = payload(eventName);
      // text/plain => simple request, kein Preflight; sendBeacon überlebt
      // auch Seitenwechsel (CTA-Klicks, Submits).
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
      } else {
        fetch(url, { method: "POST", keepalive: true,
                     headers: { "Content-Type": "text/plain" }, body: body });
      }
    } catch (e) { /* nie die Seite stören */ }
  }

  window.kisTrack = track;
  track("pageview");

  // CTA auf der Landingpage (falls vorhanden)
  var cta = document.getElementById("ctaLogin");
  if (cta) cta.addEventListener("click", function () { track("cta_click"); });
})();
