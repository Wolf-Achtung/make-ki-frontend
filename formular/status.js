/**
 * status.js – Polling-basierte Status-Seite für den KI-Readiness Report.
 * Zeigt Bestätigung nach Submit, pollt den Backend-Status und zeigt
 * Fortschritt, Ergebnis oder Fehlermeldung.
 *
 * URL-Parameter: ?id={briefing_id}&email={user_email}&lang={de|en}
 * Backend: GET /api/briefings/{briefing_id}
 *
 * Sprach-Erkennung (KIS-1251):
 *   1. URL-Param ?lang=en (primär, wird von Backend-Mails angehängt)
 *   2. Feld "lang" aus der Briefing-Antwort (sekundär, beim Polling)
 *   3. Fallback: de
 */
(function () {
  "use strict";

  // --- Config ---
  var POLL_INTERVAL_MS = 5000;
  var POLL_MAX_ATTEMPTS = 120; // 10 Minuten bei 5s Intervall
  var CONSECUTIVE_ERROR_MAX = 8; // Nach 8 aufeinanderfolgenden Fehlern aufgeben

  // --- State ---
  var briefingId = null;
  var userEmail = null;
  var pollTimer = null;
  var pollCount = 0;
  var consecutiveErrors = 0;
  var startTime = null;

  // --- "Wussten Sie schon?" Facts ---
  var kiFacts = [];
  var currentFactIndex = 0;
  var factInterval = null;
  var factsLoaded = false;
  var factsLoading = false;

  // --- I18N ---
  // DE-Texte wortgleich zur bisherigen Version; EN konsistent mit
  // formbuilder_en_SINGLE_FULL.js / index_en.html.
  var LANG = "de";
  var langLockedByUrl = false; // true, wenn ?lang=... gesetzt ist

  var I18N = {
    de: {
      pageTitle: "Report-Status – KI-Sicherheit.jetzt",
      factsUrl: "/formular/data/ki-facts.json",
      newAssessmentHref: "/formular/index.html",
      privacyHref: "/formular/datenschutz.html",
      footerImprint: "Impressum",
      footerPrivacy: "Datenschutz",
      footerContact: "Kontakt",
      elapsedMinSec: function (min, sec) { return "vor " + min + " Min. " + sec + " Sek."; },
      elapsedSec: function (sec) { return "vor " + sec + " Sekunden"; },
      statusLabelProcessing: "Analyse läuft",
      statusLabelAccepted: "Auftrag angenommen",
      processingTitle: "Ihr KI-Readiness Report wird erstellt...",
      processingText: "Vielen Dank für Ihre Angaben! Ihr individueller Report wird jetzt generiert. Das dauert in der Regel <strong>ca. 10 Minuten</strong>.",
      emailToLabel: "Sie erhalten Ihren Report per E-Mail an:",
      startedElapsed: function (elapsed) { return "Gestartet " + elapsed; },
      infoEmailWhenDone: "Sie erhalten eine E-Mail sobald Ihr Report fertig ist.",
      infoCanClose: "Sie können diese Seite auch schließen — Ihr Report wird trotzdem erstellt.",
      emailWarning: "Die E-Mail konnte nicht zugestellt werden. Bitte laden Sie Ihren Report hier direkt herunter.",
      emailSentTo: function (email) { return "&#128231; Eine E-Mail mit Ihrem Report wurde an <strong>" + email + "</strong> gesendet."; },
      emailSentGeneric: "&#128231; Eine E-Mail mit Ihrem Report wurde an Ihre hinterlegte Adresse gesendet.",
      btnPdf: "&#128229; PDF herunterladen",
      btnWeb: "&#127760; Web-Version anzeigen",
      doneTitle: "Ihr KI-Readiness Report ist fertig!",
      analysisHint: "&#128203; Ihre <strong>KI-Potenzial-Analyse</strong> wird gerade erstellt und kommt in wenigen Minuten als separate E-Mail.",
      nextSteps: "<strong>Wie geht es weiter?</strong> Sie erhalten zusätzlich eine E-Mail mit dem Link zu Ihrem <strong>KI-Strategiebericht</strong> — ein kurzer Zusatz-Fragebogen (ca. 5 Minuten) macht daraus Ihre 12-Monats-Strategie.",
      feedbackLink: "Feedback geben",
      homeLink: "Zur Startseite",
      failedTitle: "Bei der Erstellung ist ein Problem aufgetreten.",
      failedText: "Wir wurden automatisch informiert und arbeiten an einer Lösung. In der Regel wird Ihr Report innerhalb von 30 Minuten nachgeliefert.",
      failedContact: "Falls Sie nach 1 Stunde noch keinen Report erhalten haben, kontaktieren Sie uns bitte unter: ",
      btnRecheck: "&#128260; Erneut prüfen",
      notFoundTitle: "Report nicht gefunden.",
      notFoundText: "Der angegebene Report existiert nicht oder wurde bereits gelöscht.",
      btnNewAssessment: "&#128221; Neues Assessment starten",
      loadErrorHint: function (email) { return "Falls Ihr Report bereits fertig ist, prüfen Sie bitte Ihr E-Mail-Postfach: <strong>" + email + "</strong>"; },
      loadErrorTitle: "Status konnte nicht geladen werden.",
      loadErrorText: "Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
      btnRetry: "&#128260; Erneut versuchen",
      noIdTitle: "Kein Report angegeben.",
      noIdText: "Es wurde keine Report-ID übergeben. Bitte starten Sie ein neues Assessment."
    },
    en: {
      pageTitle: "Report Status – KI-Sicherheit.jetzt",
      factsUrl: "/formular/data/ki-facts_en.json",
      newAssessmentHref: "/formular/index_en.html",
      privacyHref: "/formular/privacy.html",
      footerImprint: "Legal Notice",
      footerPrivacy: "Privacy",
      footerContact: "Contact",
      elapsedMinSec: function (min, sec) { return min + " min " + sec + " sec ago"; },
      elapsedSec: function (sec) { return sec + " seconds ago"; },
      statusLabelProcessing: "Analysis in progress",
      statusLabelAccepted: "Request received",
      processingTitle: "Your AI Readiness Report is being generated...",
      processingText: "Thank you for your input! Your individual report is now being generated. This usually takes <strong>about 10 minutes</strong>.",
      emailToLabel: "You will receive your report by email at:",
      startedElapsed: function (elapsed) { return "Started " + elapsed; },
      infoEmailWhenDone: "You will receive an email as soon as your report is ready.",
      infoCanClose: "You can also close this page — your report will still be generated.",
      emailWarning: "The email could not be delivered. Please download your report directly here.",
      emailSentTo: function (email) { return "&#128231; An email with your report has been sent to <strong>" + email + "</strong>."; },
      emailSentGeneric: "&#128231; An email with your report has been sent to the address you provided.",
      btnPdf: "&#128229; Download PDF",
      btnWeb: "&#127760; View web version",
      doneTitle: "Your AI Readiness Report is ready!",
      analysisHint: "&#128203; Your <strong>AI Potential Analysis</strong> is being generated right now and will arrive in a few minutes as a separate email.",
      nextSteps: "<strong>What happens next?</strong> You will also receive an email with the link to your <strong>AI Strategy Report</strong> — a short follow-up questionnaire (about 5 minutes) turns it into your 12-month strategy.",
      feedbackLink: "Give feedback",
      homeLink: "Back to homepage",
      failedTitle: "A problem occurred while generating your report.",
      failedText: "We have been notified automatically and are working on a solution. Your report is usually delivered within 30 minutes.",
      failedContact: "If you have not received your report after 1 hour, please contact us at: ",
      btnRecheck: "&#128260; Check again",
      notFoundTitle: "Report not found.",
      notFoundText: "The requested report does not exist or has already been deleted.",
      btnNewAssessment: "&#128221; Start a new assessment",
      loadErrorHint: function (email) { return "If your report is already finished, please check your email inbox: <strong>" + email + "</strong>"; },
      loadErrorTitle: "Status could not be loaded.",
      loadErrorText: "Please check your internet connection and try again.",
      btnRetry: "&#128260; Try again",
      noIdTitle: "No report specified.",
      noIdText: "No report ID was provided. Please start a new assessment."
    }
  };

  function t(key) {
    var table = I18N[LANG] || I18N.de;
    return (key in table) ? table[key] : I18N.de[key];
  }

  function normalizeLang(value) {
    return /^en/i.test(String(value || "")) ? "en" : "de";
  }

  // Sekundäre Sprach-Erkennung: "lang" aus der Briefing-Antwort übernehmen,
  // solange kein URL-Param die Sprache festlegt.
  function setLangFromData(data) {
    if (langLockedByUrl || !data || !data.lang) return;
    var next = normalizeLang(data.lang);
    if (next !== LANG) {
      LANG = next;
      onLangChanged();
    }
  }

  function onLangChanged() {
    // Facts in der neuen Sprache neu laden
    if (factInterval) {
      clearInterval(factInterval);
      factInterval = null;
    }
    kiFacts = [];
    currentFactIndex = 0;
    factsLoaded = false;
    applyChrome();
  }

  // Titel + Footer (außerhalb von #status-content) an die Sprache anpassen
  function applyChrome() {
    try {
      document.title = t("pageTitle");
      try { document.documentElement.lang = LANG; } catch (_) {}
      var links = document.querySelectorAll("footer a");
      if (links.length >= 3) {
        links[0].textContent = t("footerImprint");
        links[1].textContent = t("footerPrivacy");
        links[1].setAttribute("href", t("privacyHref"));
        links[2].textContent = t("footerContact");
      }
    } catch (_) {}
  }

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
    if (min > 0) return t("elapsedMinSec")(min, sec);
    return t("elapsedSec")(sec);
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
    var statusLabel = (data && data.status === "processing")
      ? t("statusLabelProcessing")
      : t("statusLabelAccepted");

    render(
      '<div class="status-icon">&#9203;</div>' +
      '<h2 class="status-title">' + t("processingTitle") + "</h2>" +
      '<p class="status-text">' + t("processingText") + "</p>" +
      (userEmail
        ? '<p class="status-text">' + t("emailToLabel") + "</p>" + emailHtml()
        : "") +
      '<div class="progress-container">' +
        '<div class="progress-bar-track">' +
          '<div class="progress-bar-fill indeterminate"></div>' +
        "</div>" +
        '<div class="progress-meta">' +
          "<span>" + statusLabel + "</span>" +
          "<span>" + t("startedElapsed")(elapsed) + "</span>" +
        "</div>" +
      "</div>" +
      '<div class="info-box">' +
        "<p>" + t("infoEmailWhenDone") + "</p>" +
        "<p>" + t("infoCanClose") + "</p>" +
      "</div>" +
      factsCardHtml()
    );

    // Facts laden und anzeigen
    if (factsLoaded) {
      showCurrentFact(false); // Instant repopulate after DOM re-render (no animation)
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
      emailWarning = '<div class="warning-box">' + t("emailWarning") + "</div>";
    }

    var emailInfo = "";
    if (emailSent && userEmail) {
      emailInfo = '<p class="status-text">' + t("emailSentTo")(escapeHtml(userEmail)) + "</p>";
    } else if (emailSent) {
      emailInfo = '<p class="status-text">' + t("emailSentGeneric") + "</p>";
    }

    var buttons = "";
    if (pdfAvailable) {
      buttons =
        '<div class="btn-row">' +
          '<a href="' + pdfUrl() + '" target="_blank" rel="noopener" class="btn btn-primary">' +
            t("btnPdf") +
          "</a>" +
          '<a href="' + htmlReportUrl() + '" target="_blank" rel="noopener" class="btn btn-secondary">' +
            t("btnWeb") +
          "</a>" +
        "</div>";
    }

    render(
      '<div class="status-icon">&#9989;</div>' +
      '<h2 class="status-title">' + t("doneTitle") + "</h2>" +
      emailInfo +
      emailWarning +
      '<div class="progress-container">' +
        '<div class="progress-bar-track">' +
          '<div class="progress-bar-fill done"></div>' +
        "</div>" +
      "</div>" +
      buttons +
      '<div class="analysis-hint">' + t("analysisHint") + "</div>" +
      '<div class="info-box" style="margin-top:16px;">' +
        "<p>" + t("nextSteps") + "</p>" +
        '<p style="margin-top:8px;"><a href="/feedback/feedback.html">' + t("feedbackLink") + "</a> &middot; " +
        '<a href="/">' + t("homeLink") + "</a></p>" +
      "</div>"
    );
  }

  // Zustand 3: Fehler
  function renderFailed() {
    render(
      '<div class="status-icon">&#9888;&#65039;</div>' +
      '<h2 class="status-title">' + t("failedTitle") + "</h2>" +
      '<p class="status-text">' + t("failedText") + "</p>" +
      '<div class="error-box">' +
        t("failedContact") +
        '<a href="mailto:kontakt@ki-sicherheit.jetzt" class="contact-link">kontakt@ki-sicherheit.jetzt</a>' +
      "</div>" +
      '<div class="btn-row">' +
        '<button class="btn btn-primary" onclick="window.location.reload()">' +
          t("btnRecheck") +
        "</button>" +
      "</div>"
    );
  }

  // Zustand 4: Nicht gefunden
  function renderNotFound() {
    render(
      '<div class="status-icon">&#128270;</div>' +
      '<h2 class="status-title">' + t("notFoundTitle") + "</h2>" +
      '<p class="status-text">' + t("notFoundText") + "</p>" +
      '<div class="btn-row">' +
        '<a href="' + t("newAssessmentHref") + '" class="btn btn-primary">' +
          t("btnNewAssessment") +
        "</a>" +
      "</div>"
    );
  }

  // Fehler beim Laden
  function renderLoadError() {
    var emailHint = "";
    if (userEmail) {
      emailHint =
        '<div class="info-box" style="margin-top: 16px;">' +
          "<p>" + t("loadErrorHint")(escapeHtml(userEmail)) + "</p>" +
        "</div>";
    }
    render(
      '<div class="status-icon">&#9888;&#65039;</div>' +
      '<h2 class="status-title">' + t("loadErrorTitle") + "</h2>" +
      '<p class="status-text">' + t("loadErrorText") + "</p>" +
      emailHint +
      '<div class="btn-row">' +
        '<button id="retry-btn" class="btn btn-primary">' +
          t("btnRetry") +
        "</button>" +
      "</div>"
    );

    var retryBtn = document.getElementById("retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        consecutiveErrors = 0;
        pollCount = 0;
        renderProcessing({ status: "accepted", created_at: null });
        startPolling();
      });
    }
  }

  // Keine Briefing-ID
  function renderNoId() {
    render(
      '<div class="status-icon">&#128270;</div>' +
      '<h2 class="status-title">' + t("noIdTitle") + "</h2>" +
      '<p class="status-text">' + t("noIdText") + "</p>" +
      '<div class="btn-row">' +
        '<a href="' + t("newAssessmentHref") + '" class="btn btn-primary">' +
          t("btnNewAssessment") +
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

  function showCurrentFact(animate) {
    if (!kiFacts.length) return;
    var card = document.getElementById("ki-fact-card");
    var fact = kiFacts[currentFactIndex];
    if (!card || !fact) return;

    if (animate) {
      // Fade out, update, fade in
      card.style.opacity = "0";
      setTimeout(function () {
        var icon = document.getElementById("ki-fact-icon");
        var cat = document.getElementById("ki-fact-category");
        var txt = document.getElementById("ki-fact-text");
        if (icon) icon.textContent = fact.icon;
        if (cat) cat.textContent = fact.category;
        if (txt) txt.textContent = fact.text;
        card.style.opacity = "1";
      }, 500);
    } else {
      // Instant update (no animation) – used after DOM re-render by polling
      var icon = document.getElementById("ki-fact-icon");
      var cat = document.getElementById("ki-fact-category");
      var txt = document.getElementById("ki-fact-text");
      if (icon) icon.textContent = fact.icon;
      if (cat) cat.textContent = fact.category;
      if (txt) txt.textContent = fact.text;
      card.style.opacity = "1";
    }
  }

  function nextFact() {
    currentFactIndex = (currentFactIndex + 1) % kiFacts.length;
    showCurrentFact(true);
  }

  function loadKiFacts() {
    if (factsLoaded || factsLoading) return;
    factsLoading = true;
    var requestedLang = LANG;
    fetch(t("factsUrl"))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        factsLoading = false;
        // Sprache hat inzwischen gewechselt → verwerfen und neu laden
        if (requestedLang !== LANG) {
          loadKiFacts();
          return;
        }
        kiFacts = data || [];
        // Fisher-Yates Shuffle für gleichverteilte Zufallsreihenfolge
        for (var i = kiFacts.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = kiFacts[i];
          kiFacts[i] = kiFacts[j];
          kiFacts[j] = tmp;
        }
        factsLoaded = true;
        showCurrentFact(true);
        if (!factInterval && kiFacts.length > 1) {
          factInterval = setInterval(nextFact, 8000);
        }
      })
      .catch(function (e) {
        factsLoading = false;
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
    // Kein Authorization-Header — /api/briefings/{id} ist öffentlich

    var controller = new AbortController();
    var timeout = setTimeout(function () {
      controller.abort();
    }, 15000);

    fetch(url, {
      method: "GET",
      headers: headers,
      signal: controller.signal,
    })
      .then(function (res) {
        clearTimeout(timeout);

        if (res.status === 404) {
          stopPolling();
          renderNotFound();
          return null;
        }

        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }

        return res.json();
      })
      .then(function (data) {
        if (!data) return;

        consecutiveErrors = 0; // Reset on successful response
        setLangFromData(data); // Sekundäre Sprach-Erkennung vor dem Rendern
        var status = data.status;

        if (status === "done") {
          stopPolling();
          stopFacts();
          try { sessionStorage.setItem('kis_done_' + briefingId, JSON.stringify(data)); } catch(_) {}
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
        consecutiveErrors++;

        if (consecutiveErrors >= CONSECUTIVE_ERROR_MAX) {
          stopPolling();
          renderLoadError();
        } else if (consecutiveErrors > 1) {
          // Backoff: bei wiederholten Fehlern Intervall verzögern
          clearInterval(pollTimer);
          pollTimer = setTimeout(function () {
            fetchStatus();
            pollTimer = setInterval(function () { fetchStatus(); }, POLL_INTERVAL_MS);
          }, POLL_INTERVAL_MS * Math.min(consecutiveErrors, 4));
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
    stopFacts();
  }

  // --- Init ---
  function init() {
    briefingId = getParam("id");
    userEmail = getParam("email");
    startTime = Date.now();

    // Primäre Sprach-Erkennung: URL-Param ?lang=...
    var langParam = getParam("lang");
    if (langParam) {
      langLockedByUrl = true;
      LANG = normalizeLang(langParam);
      if (LANG === "en") applyChrome();
    }

    if (!briefingId) {
      renderNoId();
      return;
    }

    // Gecachten "done"-Status sofort anzeigen
    try {
      var cached = sessionStorage.getItem('kis_done_' + briefingId);
      if (cached) {
        var cachedData = JSON.parse(cached);
        setLangFromData(cachedData);
        renderDone(cachedData);
        // Trotzdem einmal frisch laden für aktuellste Daten
        fetchStatus();
        return;
      }
    } catch(_) {}

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

  // Sofort re-pollen wenn Tab wieder sichtbar wird (Browser throttelt setInterval im Hintergrund)
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && pollTimer && briefingId) {
      fetchStatus();
    }
  });
})();
