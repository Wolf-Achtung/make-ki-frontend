# Sprint C1 — Smart-Chips im Chat-Widget (R1 MVP)

**Branch:** `claude/chat-smart-chips-mvp`
**Basis:** Phase-0-Analyse unter `docs/ux-analysis/` (alle 4 Dokumente, gemerged via PR #102)
**Sprint-Größe:** ~9 h, vier umsetzungsphasen mit Phasen-Commits

---

## Wolf's 5 MVP-Entscheidungen

| # | Entscheidung | Wert |
|---|--------------|------|
| 1 | Feld-Scope | 3 Felder: `strategische_ziele`, `vision_3_jahre`, `hauptleistung` |
| 2 | Branche-Varianten | Nur `strategische_ziele` (Schlüssel: `marketing`, `it`, `beratung`) + `default` für alle anderen |
| 3 | Feature-Flag | HTML-Attribut `data-smart-chips="1"` (Default: nicht gesetzt) |
| 4 | Scope (R1/R2) | **Nur R1** (`formular/index.html`); R2 (`strategy.html`) später in Phase 2 |
| 5 | Sprache | DE-only (`window.SMART_CHIPS_DE`); EN-Map ungeplant |

Feature-Flag-Mechanismus: HTML entscheidet, nicht JS. Kein Runtime-Check auf `report_type`. Aktivierung in R2 ist später eine 1-Zeilen-Änderung in `strategy.html`.

---

## 4 Implementierungs-Phasen

| Phase | Inhalt | Aufwand | Commit-Strategie |
|-------|--------|---------|-------------------|
| **0 — Setup + Diagnose** | Branch, Briefing, Entry-Point-Verifikation | ~30 min | Dieser Commit |
| **1 — Suggestion-Map** | `smart_chips_de.js` mit kuratierten Inhalten | ~1.5 h | Eigener Commit, **STOPP für Wolf-Review** |
| **2 — Core-Logik + DOM + Click-Handler** | Widget-Code (Suppression, Render, Append) | ~2.5 h | Eigener Commit |
| **3 — CSS-Styling** | Pill-Buttons, `:empty`-Collapse, Mobile | ~1 h | Eigener Commit |
| **4 — Tests + Dokumentation** | Manueller Walkthrough, Pflege-README, PR | ~2 h | Eigener Commit + PR |

---

## Suggestion-Map — Struktur (Inhalte folgen in Phase 1)

```js
window.SMART_CHIPS_DE = {
  hauptleistung:   { default: [/* … */] },
  vision_3_jahre:  { default: [/* … */] },
  strategische_ziele: {
    default: [/* … */],
    byBranche: {
      marketing: [/* … */],
      it:        [/* … */],
      beratung:  [/* … */]
    }
  }
};
```

Datei-Ablage: `smart_chips_de.js` im Root, geladen analog `field_examples_de.js`.
Lookup-Helper: `lookupSmartChips(field, branche)` mit `byBranche`-Fallback auf `default`.

---

## DOM-Integration (verifizierte Entry-Points im aktuellen `chat-widget.js`)

| Eingriff | Datei : Zeile | Aktion |
|----------|---------------|--------|
| Container-Markup | `chat-widget.js : 147` (in `renderChatContainer()`) | Neuer `<div id="chatSmartChips" class="chat-smart-chips" role="group" aria-label="Vorschläge zur Antwort"></div>` zwischen `#chatQuickReplies` (Z. 147) und `.chat-input-row` (Z. 148) |
| Init-Flag-Lesen | `chat-widget.js : 193` (Anfang `initChat`) | `SMART_CHIPS_ENABLED = !!document.querySelector('[data-smart-chips="1"]')` |
| state_update-Hook | `chat-widget.js : 450` (`case "state_update"`) | Nach `updateProgress(data)`: `_collectedFields = data.collected_fields \|\| {}; renderSmartChipsIfApplicable(data);` |
| Draft-Suppression | `chat-widget.js : 918` (`handleDraftValue()`) | Erste Zeile: `clearSmartChips();` |
| Send-Reset | `chat-widget.js : 338` (`sendMessage()`) | Am Ende des Sync-Pfads: `clearSmartChips();` |
| HTML-Aktivierung | `formular/index.html` | `<body data-smart-chips="1">` (oder Chat-Container-Wrapper) |
| CSS | `chat-widget.css` (Ende) | Neuer Block `.chat-smart-chips`, `.smart-chip`, `.smart-chip.selected`, `:empty { display: none }`, Mobile-Anpassungen |

**Hinweis:** Es gibt keine `injectCSS()`-Funktion im JS. CSS lebt ausschließlich in `chat-widget.css` (via `<link>` geladen).

---

## Modul-Variablen (neu, im IIFE-Scope einzuführen)

| Variable | Init | Zweck |
|----------|------|-------|
| `_collectedFields` | `{}` | Aus `state_update.collected_fields` per Replace |
| `_lastRenderedField` | `null` | Idempotenz: gleiches Feld → kein Re-Render |
| `SMART_CHIPS_ENABLED` | aus HTML-Attribut bei `initChat` | Kill-Switch / Feature-Flag |

---

## Suppression-Matrix (alle 6 Punkte gegen-prüfen, sonst `clearSmartChips()` und `return`)

1. `SMART_CHIPS_ENABLED === false` (HTML-Flag fehlt)
2. `next_fields` fehlt oder leer
3. `next_fields_meta[field].chat_mode !== "textarea"`
4. `pending_field` ist gesetzt (Draft aktiv)
5. `_editMode === true`
6. Kein Treffer in der Suggestion-Map (`lookupSmartChips()` liefert `null`)

---

## Out-of-Scope (strikt, nicht in Sprint C1)

- Backend-Änderungen jeglicher Art
- R2 (`strategy.html`) — kommt in Phase 2
- Englische Map (`SMART_CHIPS_EN`)
- LLM-generierte Suggestions
- Telemetrie / Analytics zu Chip-Klicks
- Smart-Chips im statischen `formbuilder_de_SINGLE_FULL.js`
- Autocomplete-/Live-Tipp-Unterstützung

---

## Validation vor PR

| Kriterium | Was geprüft wird |
|-----------|------------------|
| **E1 — Technisch** | Suppression-Matrix greift in allen 6 Fällen; `clearSmartChips` wird in `handleDraftValue` und `sendMessage` aufgerufen; `_collectedFields`-Replace bei jedem `state_update`. |
| **E2 — Inhaltlich** | Suggestion-Map vollständig (3 Felder × 1–4 Varianten), Branche-Schlüssel exakt `"marketing" \| "it" \| "beratung"` (case-sensitive Lowercase). |
| **E3 — User** | Wolf's Live-Test-Szenario (Branche „Marketing & Werbung" → Frage „Was sind Ihre wichtigsten Ziele…?") zeigt 3–5 marketing-spezifische Chips über dem Input. |
| **A11y** | Container `role="group"` + `aria-label`; Chip-Buttons sind `<button type="button">`; Tab-Reihenfolge: Help-Button → Chips → Textarea → Senden; Focus-Ring sichtbar. |
| **Manueller Test** | Mit `data-smart-chips="1"` aktiviert + ohne Flag (= keine Chips überall, identisch zu heute). |

---

## Referenz-Dokumente

- `docs/ux-analysis/chat-widget-architecture.md` — Code-Struktur, State, DOM
- `docs/ux-analysis/chat-widget-smart-chips-feasibility.md` — verifizierte Backend-Datenquellen (27 Keys aus Live-API)
- `docs/ux-analysis/chat-widget-smart-chips-concept.md` — UI-Mockups, Event-Lifecycle, Code-Skizzen
- `docs/ux-analysis/chat-widget-analysis-summary.md` — Executive Summary
