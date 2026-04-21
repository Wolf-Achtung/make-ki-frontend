# Chat-Intake UX — Bug-Diagnose (Index)

**Datum:** 21.04.2026
**Branch:** `claude/review-chat-intake-ux-qzeT3`
**Anlass:** Smoke-Test (R1 + Strategy) vom Nachmittag des 21.04.2026
**Scope:** Nur Diagnose + Fix-Vorschlag. Kein Code-Fix in diesem Commit
  (Arbeitsprinzip „Diagnose VOR Implementation / Ein Fix pro Commit").

## Bugs

| # | Titel | Prio | Datei |
|---|-------|------|-------|
| 1 | DSGVO-Datenschutz-Frage ohne Hilfestellung | P1 | `bug-01-datenschutz-inspiration-chips.md` |
| 2 | QR-Premature-Render bei Follow-up-Turns | P2 | `bug-02-qr-premature-render.md` |
| 3 | Inspiration-Chips zeigen bereits gewählte Optionen | P2 | `bug-03-inspiration-chip-used-state.md` |

## Wichtigste Erkenntnis (Cross-cutting)

Der einzige aktive Chip-Lieferant für `#chatSmartChips` ist **KIS-1138 Inspiration-
Chips** (`chat-widget.js:941-970`). Quelle: `state.field_examples` + `state.field_examples_for`,
gesendet vom Backend im `state_update`-SSE-Event. Das alte Smart-Chips-System
(`smart-chips-de.js`) ist hart deaktiviert (`chat-widget.js:1949`, `SMART_CHIPS_ENABLED = false`).

Die lokale Datei `field_examples_de.js` wird im Chat-Widget **nicht** importiert
(Grep auf `FIELD_EXAMPLES`/`field_examples_de` in `chat-widget.js`: kein Treffer
außer via `state.field_examples` aus dem Backend). Sie ist vermutlich eine Referenz-
Kopie oder Quelle für Backend-Seeding — eine Frontend-Änderung dort hat keinen
Effekt auf das Chat-Widget.

**Folge:** Bug #1 ist überwiegend ein Backend-Problem (welche Felder liefern
`state.field_examples`?). PR **#959 `kis-1138-freetext-help-analysis`** (Backend)
adressiert das mit hoher Wahrscheinlichkeit — Abstimmung nötig.

Bugs #2 und #3 sind zumindest **teilweise** im Frontend lösbar (siehe Einzeldokumente).

## Offene Punkte, die Wolf entscheiden muss

1. **Backend-Abhängigkeit Bug #1:** Soll der Frontend einen eigenen Client-
   side Fallback bekommen (z. B. wieder `SMART_CHIPS_ENABLED = true` für
   bestimmte Felder), oder warten wir auf Backend-#959?
2. **Backend-Contract Bug #2:** Backend muss signalisieren, ob ein Turn eine
   Follow-up/Clarifying-Frage ist (Vorschlag: neues SSE-Event `clarification`
   oder Feld `state.turn_kind === "clarification"`). Ohne dieses Signal kann
   das Frontend nicht sauber zwischen QR-fähigem Main-Turn und Freetext-
   Follow-up unterscheiden.
3. **Fix-Ort Bug #3:** Frontend-Filter (session-lokaler Set von geklickten
   Chip-Indices) vs. Backend-Filter (`state.field_examples` enthält nur noch
   ungenutzte). PR #962 könnte Letzteres erledigen — bitte prüfen.

## PR-Referenzen (nicht verifizierbar)

Die im Briefing genannten PRs #959, #960, #962 liegen auf dem Backend-Repo und
sind aus diesem Frontend-Repo heraus nicht sichtbar (`list_pull_requests` auf
`wolf-achtung/make-ki-frontend` = leer). Die PR-Beziehungen sind in den
Einzel­dokumenten als Hypothesen markiert, nicht bestätigt.
