# Bug #3 — Inspiration-Chips zeigen bereits gewählte Optionen

**Prio:** P2 · **Status:** Diagnose, kein Code-Fix · **Branch:** `claude/review-chat-intake-ux-qzeT3`

## Kurze Diagnose

`renderInspirationChipsIfApplicable` baut den Chip-Container bei jedem
`state_update` per `container.innerHTML = html` komplett neu. Frontend-seitig
gibt es **kein Tracking geklickter Chips** — `smart-chip--used`-Markierungen
leben nur auf dem alten DOM-Knoten und verschwinden beim Re-Render. Die Klick-
Telemetrie geht per `/api/chat/inspiration-click` an das Backend, das Ergebnis
wird aber nicht in die nachfolgenden `state.field_examples` zurückgespielt (bzw.
das Frontend filtert nicht).

## Relevante Code-Stellen

- `chat-widget.js:941-970` — Inspiration-Chip-Renderer:
  - Zeile 968: `container.innerHTML = html;` → vollständiger Rebuild.
  - Kein Idempotenz-Guard (anders als `renderSmartChipsIfApplicable`, wo
    `_lastRenderedField`-Check in Zeile 905 einen Rebuild verhindert).
- `chat-widget.js:1884-1917` — Inspiration-Chip-Click-Handler:
  - Feuert Telemetrie an `/api/chat/inspiration-click` (fire-and-forget).
  - Markiert **nicht** den geklickten Chip im Frontend-State (der
    `smart-chip--used`-Block in Z. 1936 gilt nur für generische Smart-Chips,
    nicht für Inspiration-Chips).
- `chat-widget.js:1450-1454` — Frontend-State-Variablen; kein `_usedChips`/
  `_clickedInspirationChips`-Container.

## Warum es so auffällt

Bei Follow-up-Turns (siehe Bug #2) bleibt `state.next_fields[0]` dasselbe Feld.
Backend sendet dieselben `field_examples`. Frontend re-rendert dieselben drei
Chips, inklusive des gerade geklickten → User hat den Eindruck, seine Auswahl
wurde nicht registriert.

## Fix-Empfehlung

**Option A (Frontend-local, klein, niedriges Risiko):**
Session-lokalen Zustand pflegen, der pro Feld die geklickten Chip-Indices
speichert, und beim Rendering entweder filtern oder als „used" markieren.

```js
// Am Top des IIFE (bei den anderen State-Vars):
var _usedInspirationChips = {};   // { fieldKey: Set<index> }

// In renderInspirationChipsIfApplicable (Zeile 941-970): vor der Schleife:
var used = _usedInspirationChips[field] || new Set();

// In der Schleife (Z. 957-966): index markieren
var isUsed = used.has(i);
html += '<button type="button" class="smart-chip inspiration-chip'
      + (isUsed ? ' smart-chip--used' : '') + '"'
      + ' data-chip-text="' + escapeHtml(text) + '"'
      + ' data-chip-index="' + i + '"'
      + ' data-chip-field="' + escapeHtml(field) + '"'
      + (isUsed ? ' aria-pressed="true"' : '')
      + ' aria-label="Inspiration übernehmen: ' + escapeHtml(text) + '">'
      + escapeHtml(text)
      + '</button>';

// Im Click-Handler (Zeile 1888-1917): nach Telemetrie-Call:
if (!isNaN(index) && _inspirationFieldName) {
    if (!_usedInspirationChips[_inspirationFieldName]) {
        _usedInspirationChips[_inspirationFieldName] = new Set();
    }
    _usedInspirationChips[_inspirationFieldName].add(index);
    chip.classList.add("smart-chip--used");
    chip.setAttribute("aria-pressed", "true");
}
```

CSS-Klasse `smart-chip--used` existiert bereits (Z. 1936-Kontext), ob sie
visuell greift → CSS-Smoke-Test in `chat-widget.css` nötig.

**Option B (Backend, vermutlich PR #962 `fix-field-examples-awareness`):**
Backend filtert bereits konsumierte Beispiele aus `state.field_examples` raus.
Bestmögliche Lösung (Single Source of Truth), setzt aber voraus, dass Backend
jeden Klick zuverlässig trackt (Telemetrie-Endpoint `/inspiration-click` tut das
bereits fire-and-forget, aber keine Persistenz-Garantie).

**Empfehlung:** Zuerst prüfen, was PR #962 liefert. Wenn Backend-Fix da ist:
Frontend-Option A nicht bauen. Sonst Option A als niedriges Risiko.

## Reproduktionsschritte (Browser-Smoke-Test)

1. Inkognito, Strategy-Chat öffnen, bis Feld `vision_3_jahre` erreicht.
2. DevTools → Network → SSE-Stream mitschneiden.
3. Chip „Neue KI-basierte Produkte im Portfolio" klicken; Input wird gefüllt.
4. Senden. Bot stellt Follow-up-Frage.
5. **Erwartet (nach Fix):** Unter Follow-up erscheinen entweder nur 2 Chips
   (Option B, Backend filtert) oder 3 Chips mit dem geklickten als
   `.smart-chip--used` (Option A).
6. **Aktuell:** Drei Chips, keiner als „used" markiert, geklickter Chip ist
   optisch identisch zu den anderen beiden.

## STOPP-Punkte für Wolf

- Inhalts-Entscheidung zu PR #962: adressiert das Backend dieses Symptom?
- Wenn Option A gewählt: Chip-Index als Identifier stabil? (Backend könnte
  die Reihenfolge in `state.field_examples` zwischen Turns ändern — dann wäre
  Identifier besser der Chip-Text, nicht der Index.)
- UX-Policy: „geklickt = ausgeblendet" oder „geklickt = grau". Einheitliche
  Entscheidung über alle Chip-Typen hinweg wünschenswert.
