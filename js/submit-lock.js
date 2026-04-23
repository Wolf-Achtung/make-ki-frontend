/**
 * Submit-Lock helper (KIS-1140 pattern, generalised).
 *
 * Prevents double-submits on long-running form handlers by combining:
 *   - a synchronous in-flight flag that early-returns on a second call,
 *   - immediate `button.disabled = true` + busy class for browser-level
 *     click suppression and visual feedback,
 *   - a stable idempotency key persisted in sessionStorage (per endpoint)
 *     so transparent browser/network retries of the same submission
 *     dedupe on the backend.
 *
 * Usage pattern (must call acquire() as the FIRST sync action in the handler):
 *
 *   var lock = SubmitLock.create({
 *     buttonSelector: "#btn-submit",
 *     busyLabel: "Wird gesendet …",
 *     busyClass: "submitting",
 *     idempotencyStorageKey: "submit.briefings"
 *   });
 *
 *   function onSubmit() {
 *     var idem = lock.acquire();
 *     if (!idem) return;            // already submitting
 *     if (!isValid()) {             // validation-fail path
 *       lock.release();
 *       return;
 *     }
 *     fetch(url, { headers: { "Idempotency-Key": idem }, ... })
 *       .then(onSuccess)            // success: UI redirects, do NOT release
 *       .catch(function() {
 *         lock.resetIdempotency();  // final error: allow fresh retry on reload
 *         showErrorScreen();
 *       });
 *   }
 *
 * Notes:
 *   - Do not call release() in the success path; the UI should redirect or
 *     replace the form. Releasing would reopen the double-submit window.
 *   - Do not call release() on network-fail either; surface an error screen
 *     that requires a reload. Call resetIdempotency() so the fresh page gets
 *     a new key.
 *   - The idempotency key survives an accidental page reload via
 *     sessionStorage, so a reload+retry still dedupes at the backend.
 *   - After 30 min (configurable) the stored key is considered stale and a
 *     new one is generated on the next acquire().
 *
 * Exposes: window.SubmitLock.create(options) -> controller
 */
(function(){
  "use strict";

  var DEFAULT_MAX_AGE_MS = 30 * 60 * 1000;

  function genKey() {
    return Date.now().toString(36) + Math.random().toString(16).slice(2);
  }

  function loadStoredKey(storageKey, maxAgeMs) {
    if (!storageKey) return "";
    try {
      var raw = window.sessionStorage.getItem(storageKey);
      if (!raw) return "";
      var data = JSON.parse(raw);
      if (!data || typeof data.key !== "string" || typeof data.ts !== "number") return "";
      if (Date.now() - data.ts > maxAgeMs) {
        window.sessionStorage.removeItem(storageKey);
        return "";
      }
      return data.key;
    } catch (_) { return ""; }
  }

  function storeKey(storageKey, key) {
    if (!storageKey) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({ key: key, ts: Date.now() }));
    } catch (_) {}
  }

  function clearStoredKey(storageKey) {
    if (!storageKey) return;
    try { window.sessionStorage.removeItem(storageKey); } catch (_) {}
  }

  function resolveButton(selectorOrEl) {
    if (!selectorOrEl) return null;
    if (typeof selectorOrEl === "string") {
      try { return document.querySelector(selectorOrEl); } catch (_) { return null; }
    }
    return selectorOrEl;
  }

  function create(options) {
    options = options || {};
    var buttonSelector = options.buttonSelector || options.button || null;
    var busyLabel = typeof options.busyLabel === "string" ? options.busyLabel : "";
    var busyHtml = typeof options.busyHtml === "string" ? options.busyHtml : "";
    var busyClass = options.busyClass || "submitting";
    var storageKey = options.idempotencyStorageKey || "";
    var maxAgeMs = options.idempotencyMaxAgeMs || DEFAULT_MAX_AGE_MS;

    var locked = false;
    var savedLabel = null;
    var savedHtml = null;
    var lockedButton = null;

    function acquire() {
      if (locked) return null;
      locked = true;

      lockedButton = resolveButton(buttonSelector);
      if (lockedButton) {
        savedLabel = lockedButton.textContent;
        savedHtml = lockedButton.innerHTML;
        lockedButton.disabled = true;
        lockedButton.setAttribute("aria-busy", "true");
        if (busyClass) lockedButton.classList.add(busyClass);
        if (busyHtml) {
          lockedButton.innerHTML = busyHtml;
        } else if (busyLabel) {
          lockedButton.textContent = busyLabel;
        }
      }

      var key = loadStoredKey(storageKey, maxAgeMs) || genKey();
      storeKey(storageKey, key);
      return key;
    }

    function release() {
      locked = false;
      if (lockedButton) {
        lockedButton.disabled = false;
        lockedButton.removeAttribute("aria-busy");
        if (busyClass) lockedButton.classList.remove(busyClass);
        if (savedHtml != null) {
          lockedButton.innerHTML = savedHtml;
        } else if (savedLabel != null) {
          lockedButton.textContent = savedLabel;
        }
      }
      lockedButton = null;
      savedLabel = null;
      savedHtml = null;
    }

    function resetIdempotency() {
      clearStoredKey(storageKey);
    }

    function isLocked() { return locked; }

    return {
      acquire: acquire,
      release: release,
      resetIdempotency: resetIdempotency,
      isLocked: isLocked
    };
  }

  window.SubmitLock = { create: create };
})();
