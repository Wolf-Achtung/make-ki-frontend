/**
 * status.js – Polling-basierte Status-Seite für den KI-Readiness Report.
 * Zeigt Bestätigung nach Submit, pollt den Backend-Status und zeigt
 * Fortschritt, Ergebnis oder Fehlermeldung.
 *
 * URL-Parameter: ?id={briefing_id}&email={user_email}
 * Backend: GET /api/briefings/{briefing_id}
 */
(function () {
  "use strict";

  // --- Config ---
  var POLL_INTERVAL_MS = 5000;
  var POLL_MAX_ATTEMPTS = 120; // 10 Minuten bei 5s Intervall

  // --- State ---
  var briefingId = null;
  var userEmail = null;
  var pollTimer = null;
  var pollCount = 0;
  var startTime = null;

  // --- "Wussten Sie schon?" Facts ---
  var kiFacts = [];
  var currentFactIndex = 0;
  var factInterval = null;
  var factsLoaded = false;

  // --- API Base URL ---
  function getApiBase() {
    try {
      var cfg = window.APP_CONFIG || window.__CONFIG__ || {};
      var v = cfg.API_BASE || "";
      if (!v) {
        var meta = document.querySelector('meta[name="api-base"]');
        v = (meta && meta.content) || "/api";
      }
      return String(v || "/api").replace(/\/+$/, "");
    } catch (_) {
      return "/api";
    }
  }

  // --- URL-Parameter auslesen ---
  function getParam(name) {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get(name) || null;
    } catch (_) {
      return null;
    }
  }

  // --- Render-Funktion ---
  function render(html) {
    var el = document.getElementById("status-content");
    if (el) el.innerHTML = html;
  }

  // --- Zeitdifferenz formatieren ---
  function formatElapsed(created) {
    var now = Date.now();
    var start = created ? new Date(created).getTime() : (startTime || now);
    var diffSec = Math.max(0, Math.floor((now - start) / 1000));
    var min = Math.floor(diffSec / 60);
    var sec = diffSec % 60;
    if (min > 0) return "vor " + min + " Min. " + sec + " Sek.";
    return "vor " + sec + " Sekunden";
  }

  // --- Email-Anzeige ---
  function emailHtml() {
    if (!userEmail) return "";
    return '<div class="email-highlight">&#128231; ' + escapeHtml(userEmail) + "</div>";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str || ""));
    return div.innerHTML;
  }

  // --- Backend-URL für PDF/HTML ---
  function pdfUrl() {
    return getApiBase() + "/report/pdf/" + briefingId;
  }

  function htmlReportUrl() {
    return getApiBase() + "/report/html/" + briefingId;
  }

  // --- Zustands-Renderer ---

  // Zustand 1: Generierung läuft
  function renderProcessing(data) {
    var created = data && data.created_at;
    var elapsed = formatElapsed(created);
    var statusLabel = (data && data.status === "processing") ? "Analyse läuft" : "Auftrag angenommen";

    render(
      '<div class="status-icon">&#9203;</div>' +
      '<h2 class="status-title">Ihr KI-Readiness Report wird erstellt...</h2>' +
      '<p class="status-text">' +
        "Vielen Dank für Ihre Angaben! Ihr individueller Report wird jetzt generiert. " +
        "Das dauert in der Regel <strong>2–4 Minuten</strong>." +
      "</p>" +
      (userEmail
        ? '<p class="status-text">Sie erhalten Ihren Report per E-Mail an:</p>' + emailHtml()
        : "") +
      '<div class="progress-container">' +
        '<div class="progress-bar-track">' +
          '<div class="progress-bar-fill indeterminate"></div>' +
        "</div>" +
        '<div class="progress-meta">' +
          "<span>" + statusLabel + "</span>" +
          "<span>Gestartet: " + elapsed + "</span>" +
        "</div>" +
      "</div>" +
      '<div class="info-box">' +
        "<p>Sie erhalten eine E-Mail sobald Ihr Report fertig ist.</p>" +
        "<p>Sie können diese Seite auch schließen — Ihr Report wird trotzdem erstellt.</p>" +
      "</div>" +
      factsCardHtml()
    );

    // Facts laden und anzeigen
    if (factsLoaded) {
      showCurrentFact();
    } else {
      loadKiFacts();
    }
  }

  // Zustand 2: Report fertig
  function renderDone(data) {
    var pdfAvailable = data && data.pdf_available;
    var emailSent = data && data.email_sent;

    var emailWarning = "";
    if (!emailSent) {
      emailWarning =
        '<div class="warning-box">' +
          "Die E-Mail konnte nicht zugestellt werden. " +
          "Bitte laden Sie Ihren Report hier direkt herunter." +
        "</div>";
    }

    var emailInfo = "";
    if (emailSent && userEmail) {
      emailInfo =
        '<p class="status-text">&#128231; Eine E-Mail mit Ihrem Report wurde an ' +
        "<strong>" + escapeHtml(userEmail) + "</strong> gesendet.</p>";
    } else if (emailSent) {
      emailInfo =
        '<p class="status-text">&#128231; Eine E-Mail mit Ihrem Report wurde an Ihre hinterlegte Adresse gesendet.</p>';
    }

    var buttons = "";
    if (pdfAvailable) {
      buttons =
        '<div class="btn-row">' +
          '<a href="' + pdfUrl() + '" target="_blank" rel="noopener" class="btn btn-primary">' +
            "&#128229; PDF herunterladen" +
          "</a>" +
          '<a href="' + htmlReportUrl() + '" target="_blank" rel="noopener" class="btn btn-secondary">' +
            "&#127760; Web-Version anzeigen" +
          "</a>" +
        "</div>";
    }

    render(
      '<div class="status-icon">&#9989;</div>' +
      '<h2 class="status-title">Ihr KI-Readiness Report ist fertig!</h2>' +
      emailInfo +
      emailWarning +
      '<div class="progress-container">' +
        '<div class="progress-bar-track">' +
          '<div class="progress-bar-fill done"></div>' +
        "</div>" +
      "</div>" +
      buttons +
      '<div class="analysis-hint">' +
        "&#128203; Ihre <strong>KI-Potenzial-Analyse</strong> wird gerade erstellt und " +
        "kommt in wenigen Minuten als separate E-Mail." +
      "</div>"
    );
  }

  // Zustand 3: Fehler
  function renderFailed() {
    render(
      '<div class="status-icon">&#9888;&#65039;</div>' +
      '<h2 class="status-title">Bei der Erstellung ist ein Problem aufgetreten.</h2>' +
      '<p class="status-text">' +
        "Wir wurden automatisch informiert und arbeiten an einer Lösung. " +
        "In der Regel wird Ihr Report innerhalb von 30 Minuten nachgeliefert." +
      "</p>" +
      '<div class="error-box">' +
        "Falls Sie nach 1 Stunde noch keinen Report erhalten haben, " +
        'kontaktieren Sie uns bitte unter: ' +
        '<a href="mailto:kontakt@ki-sicherheit.jetzt" class="contact-link">kontakt@ki-sicherheit.jetzt</a>' +
      "</div>" +
      '<div class="btn-row">' +
        '<button class="btn btn-primary" onclick="window.location.reload()">' +
          "&#128260; Erneut prüfen" +
        "</button>" +
      "</div>"
    );
  }

  // Zustand 4: Nicht gefunden
  function renderNotFound() {
    render(
      '<div class="status-icon">&#128270;</div>' +
      '<h2 class="status-title">Report nicht gefunden.</h2>' +
      '<p class="status-text">' +
        "Der angegebene Report existiert nicht oder wurde bereits gelöscht." +
      "</p>" +
      '<div class="btn-row">' +
        '<a href="/formular/index.html" class="btn btn-primary">' +
          "&#128221; Neues Assessment starten" +
        "</a>" +
      "</div>"
    );
  }

  // Fehler beim Laden
  function renderLoadError() {
    render(
      '<div class="status-icon">&#9888;&#65039;</div>' +
      '<h2 class="status-title">Status konnte nicht geladen werden.</h2>' +
      '<p class="status-text">' +
        "Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut." +
      "</p>" +
      '<div class="btn-row">' +
        '<button class="btn btn-primary" onclick="window.location.reload()">' +
          "&#128260; Erneut versuchen" +
        "</button>" +
      "</div>"
    );
  }

  // Keine Briefing-ID
  function renderNoId() {
    render(
      '<div class="status-icon">&#128270;</div>' +
      '<h2 class="status-title">Kein Report angegeben.</h2>' +
      '<p class="status-text">' +
        "Es wurde keine Report-ID übergeben. Bitte starten Sie ein neues Assessment." +
      "</p>" +
      '<div class="btn-row">' +
        '<a href="/formular/index.html" class="btn btn-primary">' +
          "&#128221; Neues Assessment starten" +
        "</a>" +
      "</div>"
    );
  }

  // --- "Wussten Sie schon?" Info-Karten ---

  function factsCardHtml() {
    return (
      '<div id="ki-facts-container" style="margin-top: 24px;">' +
        '<div id="ki-fact-card" style="' +
          "background: var(--bg-card);" +
          "border: 1px solid var(--border-light);" +
          "border-left: 4px solid var(--navy-400);" +
          "border-radius: 8px;" +
          "padding: 16px 20px;" +
          "transition: opacity 0.5s ease;" +
          "opacity: 0;" +
        '">' +
          '<div style="display: flex; align-items: flex-start; gap: 12px;">' +
            '<span id="ki-fact-icon" style="font-size: 24px; line-height: 1;"></span>' +
            "<div>" +
              '<div id="ki-fact-category" style="' +
                "font-size: 11px; color: var(--navy-400); font-weight: 600;" +
                "text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;" +
              '"></div>' +
              '<div id="ki-fact-text" style="' +
                "font-size: 14px; color: var(--text-secondary); line-height: 1.5;" +
              '"></div>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function showCurrentFact() {
    if (!kiFacts.length) return;
    var card = document.getElementById("ki-fact-card");
    var fact = kiFacts[currentFactIndex];
    if (!card || !fact) return;

    // Fade out
    card.style.opacity = "0";

    setTimeout(function () {
      var icon = document.getElementById("ki-fact-icon");
      var cat = document.getElementById("ki-fact-category");
      var txt = document.getElementById("ki-fact-text");
      if (icon) icon.textContent = fact.icon;
      if (cat) cat.textContent = fact.category;
      if (txt) txt.textContent = fact.text;
      // Fade in
      card.style.opacity = "1";
    }, 500);
  }

  function nextFact() {
    currentFactIndex = (currentFactIndex + 1) % kiFacts.length;
    showCurrentFact();
  }

  function loadKiFacts() {
    if (factsLoaded) return;
    fetch("/formular/data/ki-facts.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        kiFacts = data || [];
        // Zufällige Reihenfolge
        kiFacts.sort(function () { return Math.random() - 0.5; });
        factsLoaded = true;
        showCurrentFact();
        if (!factInterval && kiFacts.length > 1) {
          factInterval = setInterval(nextFact, 8000);
        }
      })
      .catch(function (e) {
        // Fakten sind optional
        console.log("KI-Facts nicht geladen:", e);
      });
  }

  function stopFacts() {
    if (factInterval) {
      clearInterval(factInterval);
      factInterval = null;
    }
  }

  // --- Polling ---

  function fetchStatus() {
    var url = getApiBase() + "/briefings/" + briefingId;

    var headers = {
      Accept: "application/json",
      "X-Client": "ki-readiness-frontend",
    };

    // Add auth token if available
    try {
      var token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = "Bearer " + token;
      }
    } catch (_) {}

    var controller = new AbortController();
    var timeout = setTimeout(function () {
      controller.abort();
    }, 15000);

    fetch(url, {
      method: "GET",
      headers: headers,
      credentials: "include",
      signal: controller.signal,
    })
      .then(function (res) {
        clearTimeout(timeout);

        if (res.status === 404) {
          stopPolling();
          renderNotFound();
          return null;
        }

        if (res.status === 401) {
          stopPolling();
          window.location.href = "/login.html";
          return null;
        }

        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }

        return res.json();
      })
      .then(function (data) {
        if (!data) return;

        var status = data.status;

        if (status === "done") {
          stopPolling();
          stopFacts();
          renderDone(data);
        } else if (status === "failed") {
          stopPolling();
          stopFacts();
          renderFailed();
        } else {
          // accepted, processing, or unknown → keep polling
          renderProcessing(data);
        }
      })
      .catch(function (err) {
        clearTimeout(timeout);
        console.error("[Status] Fehler bei Status-Abfrage:", err);
        pollCount++;

        if (pollCount >= POLL_MAX_ATTEMPTS) {
          stopPolling();
          renderLoadError();
        }
        // Sonst: weiter pollen, nächster Versuch beim nächsten Intervall
      });
  }

  function startPolling() {
    fetchStatus(); // Sofort erste Abfrage
    pollTimer = setInterval(function () {
      pollCount++;
      if (pollCount >= POLL_MAX_ATTEMPTS) {
        stopPolling();
        renderLoadError();
        return;
      }
      fetchStatus();
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  // --- Init ---
  function init() {
    briefingId = getParam("id");
    userEmail = getParam("email");
    startTime = Date.now();

    if (!briefingId) {
      renderNoId();
      return;
    }

    // Sofort Bestätigungs-Zustand zeigen, dann pollen
    renderProcessing({ status: "accepted", created_at: null });
    startPolling();
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
