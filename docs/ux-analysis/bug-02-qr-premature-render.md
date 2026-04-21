# Bug #2 — QR-Premature-Render bei Follow-up-Turns

**Prio:** P2 · **Status:** Diagnose, kein Code-Fix · **Branch:** `claude/review-chat-intake-ux-qzeT3`

## Kurze Diagnose

Das Frontend rendert QR-Buttons rein nach SSE-Event-Typ — es hat **keinen
expliziten Follow-up/Clarification-Flag**. Der V5-FE-Mechanismus
`preview_qr` → `activatePreviewButtons()` nimmt an, dass nach einem Turn immer
die nächste Hauptfrage folgt, und aktiviert deshalb am `done`-Event bereits
vorab gerenderte Preview-Buttons — auch dann, wenn der Bot in Wirklichkeit eine
Freitext-Rückfrage stellt.

## Relevante Code-Stellen

- `chat-widget.js:439-448` — `state_update`: nimmt `data.field_examples`,
  rendert Inspiration-Chips.
- `chat-widget.js:455-459` — `preview_qr`-Event: rendert Preview-QR-Buttons
  (disabled, semi-transparent) via `renderQuickReplies(data, {preview:true})`.
- `chat-widget.js:518-525` — `finishStream`: wenn `done` keine eigenen
  `quick_replies` bündelt, ruft es `activatePreviewButtons()` auf — aktiviert
  jede noch im DOM stehende `.qr-btn--preview`.
- `chat-widget.js:858-864` — `activatePreviewButtons()`: entfernt nur
  `disabled`/`qr-btn--preview`, **prüft keinerlei Kontext**.
- `chat-widget.js:1093-1105` — `handleDialogMode({active})`: versteckt QR-
  Container per `display:none`, setzt aber keine Flag-Variable. Sobald
  `active:false` eintrifft, werden die alten (falschen) Preview-Buttons wieder
  sichtbar — sie wurden weder gelöscht noch invalidiert.

## Was passiert in einem Follow-up-Turn

1. **Main-Turn N:** Bot stellt Hauptfrage (z. B. „Hauptleistung?"). Backend
   streamt `preview_qr` für die **nächste** Hauptfrage
   (`digitalisierungsgrad` 1–10). Frontend hängt 10 disabled, semi-transparente
   Preview-Buttons an — V5-FE-Feature.
2. User antwortet per Freitext.
3. **Follow-up-Turn N+1:** Bot entscheidet, eine Rückfrage zu stellen
   („Von der Kundenakquise bis zur Projektumsetzung?"). Streamt Tokens +
   `done` — **keine neuen `quick_replies`, kein neues `preview_qr`**.
4. `finishStream` (Z. 522-525) greift auf den „no QR → activate preview"-
   Fallback zurück. Preview-Buttons werden aktiviert, obwohl sie zur
   **nächsten** Hauptfrage gehören.

Dasselbe Muster bei Inspiration-Chips: `state_update` im Follow-up-Turn enthält
noch `field_examples` für das aktuelle Feld (die es weiterhin erfragt) → Chips
werden sichtbar unter der Rückfrage.

## Fix-Empfehlung

**Option A (bevorzugt, Backend-Contract-Erweiterung):** Backend kennzeichnet
Follow-up/Clarifying-Turns explizit in einem der SSE-Events:
  - `state.turn_kind === "clarification"` im `state_update`, **oder**
  - neues Event `clarification` direkt vor Tokens, **oder**
  - `dialog_mode`-Event auch für Follow-ups nutzen (derzeit nur für „User
    stellt Gegenfrage").

Frontend-Patch (nur wenn Flag da ist):

```js
// chat-widget.js:439-448
case "state_update":
    updateProgress(data);
    _collectedFields = data.collected_fields || {};
    _inspirationFieldName = data.field_examples_for || null;
    if (data.turn_kind === "clarification") {
        clearQuickReplies();   // Preview-Buttons eliminieren
        clearSmartChips();     // Inspiration-Chips eliminieren
        _suppressPreviewActivation = true;   // finishStream skippt activate
    } else {
        _suppressPreviewActivation = false;
        renderSmartChipsIfApplicable(data);
        renderInspirationChipsIfApplicable(data);
    }
    if (data.is_completable === true) showCompletionUI();
    break;

// chat-widget.js:522-525
} else if (!_suppressPreviewActivation) {
    activatePreviewButtons();
}
```

**Option B (defensiv, Frontend-only — weniger sauber):** Preview-Buttons vor
jedem neuen Main-Turn zwingend löschen, nicht erst beim nächsten
`quick_replies`. Ändert die V5-FE-Absicht (Preview soll über mehrere Turns
sichtbar bleiben) — bitte mit Backend/Wolf abstimmen, bevor gebaut wird.

**Ohne Backend-Flag:** Frontend kann **nicht** zuverlässig zwischen Follow-up
und Main-Turn unterscheiden. Keine Heuristik („Bot-Text kurz" etc.) einbauen.

## Reproduktionsschritte (Browser-Smoke-Test)

1. Inkognito, R1-Intake starten.
2. Die Frage nach Hauptleistung erreichen (Freitextfeld).
3. DevTools → Network → SSE-Stream öffnen, Events mitlesen
   (`event: preview_qr` erwartet nach Token-Stream).
4. Antwort tippen, die der Bot wahrscheinlich per Rückfrage präzisieren will
   (z. B. „Beratung").
5. **Erwartet (nach Fix):** Follow-up-Frage erscheint, **keine** QR-Buttons,
   **keine** Chips darunter.
6. **Aktuell:** Follow-up-Frage + aktivierte QR-Buttons zu
   `digitalisierungsgrad`.

## STOPP-Punkte für Wolf

- Entscheidung Backend-Contract: Flag-Name + Transport-Weg
  (`state_update.turn_kind` vs. neues Event).
- Ohne Einigung: **nicht bauen** — Frontend-only-Fix ist eine Heuristik und
  kann Main-Turns kaputtmachen.
