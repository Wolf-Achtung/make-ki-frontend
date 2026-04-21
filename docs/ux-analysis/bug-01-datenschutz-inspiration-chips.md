# Bug #1 — DSGVO/Datenschutz-Frage ohne Hilfestellung

**Prio:** P1 · **Status:** Diagnose, kein Code-Fix · **Branch:** `claude/review-chat-intake-ux-qzeT3`

## Kurze Diagnose

Das Chat-Widget rendert Inspiration-Chips ausschließlich aus Backend-Daten
(`state.field_examples`, KIS-1138). Das alte Client-seitige Smart-Chips-System ist
deaktiviert (`chat-widget.js:1949`, `SMART_CHIPS_ENABLED = false`). Wenn das Backend
für ein Freitext-Feld keine `field_examples` liefert, sieht der User ein leeres
Textarea ohne Chips, Placeholder oder Hilfetext — genau das beobachtete Symptom
bei der Datenschutz-Frage.

## Betroffene Stellen im Frontend

- `chat-widget.js:439-448` — `state_update`-Handler ruft
  `renderInspirationChipsIfApplicable(data)`; setzt `_inspirationFieldName =
  data.field_examples_for || null`.
- `chat-widget.js:941-970` — `renderInspirationChipsIfApplicable`: bricht
  stillschweigend ab, wenn `state.field_examples` leer/undefined ist
  (Zeile 944-945).
- `chat-widget.js:1949` — `SMART_CHIPS_ENABLED = false` deaktiviert den Client-
  Fallback (`smart-chips-de.js` ist laut Header-Kommentar ohnehin DEPRECATED).
- `field_examples_de.js` (Root) — wird im `chat-widget.js` nicht geladen
  (kein `FIELD_EXAMPLES`/`field_examples_de`-Import). Änderungen dort sind
  frontendseitig wirkungslos.

## Hypothesen-Check

- **H1 (Feld-Definition fehlt):** Nicht zutreffend für das Chat-Widget — die
  Feld-Definitionen in `formular/formbuilder_de_SINGLE_FULL.js` steuern den
  klassischen Fragebogen, nicht den Chat. Im Chat kommt jede Frage vom Backend.
- **H2 (Rendering filtert Felder):** Nicht zutreffend. Der Guard in Z. 891
  (`mode !== "FT"`) gilt nur für das deaktivierte Smart-Chips-System. Der
  aktive Inspiration-Chip-Renderer hat keinen Feld-Namens-Filter.
- **H3 (Feld-Definition komplett, Rendering bricht):** Unwahrscheinlich — bei
  ordnungsgemäß gefülltem `state.field_examples` rendert der Code zuverlässig.

**Echte Ursache:** Backend liefert für das Datenschutz-Feld kein
`state.field_examples`. Das deckt sich mit dem Stand von `field_examples_de.js`
im Repo (Root): Dort sind nur 7 Textarea-Felder abgedeckt
(`hauptleistung`, `ki_projekte`, `zeitersparnis_prioritaet`,
`geschaeftsmodell_evolution`, `vision_3_jahre`, `strategische_ziele`,
`ki_guardrails`), während die Block-5-Compliance-Felder
(`datenschutzbeauftragter`, `technische_massnahmen`, `folgenabschaetzung`,
`meldewege`, `loeschregeln`, `ai_act_kenntnis`, `ki_hemmnisse`) fehlen.

## Fix-Empfehlung

**Primär (Backend, vermutlich PR #959 `kis-1138-freetext-help-analysis`):**
Backend ergänzt `state.field_examples` + `state.field_examples_for` für alle
Compliance-Felder. Die Chips-Vorschläge aus dem Briefing („Vollständig DSGVO-
konform", „AVV mit allen Dienstleistern vorhanden", „Verschlüsselte Ablage
Mandantendaten", „Noch in Aufbau", „Fehlt komplett / unklar") sind plausible
Kandidaten, sollten aber mit Wolf + Backend-Thread abgestimmt werden.

**Frontend-Änderung: keine nötig**, wenn Backend-#959 aktiviert wird. Kein
Client-Fallback bauen — sonst Dual-System-Konflikt wie bei KIS-1164.

**Falls Backend-#959 verzögert und ein Zwischenstand nötig ist:**
Wolf-Entscheidung erforderlich. Option wäre, `SMART_CHIPS_ENABLED` wieder
einzuschalten und `smart-chips-de.js` um die Compliance-Felder zu erweitern —
das bricht aber das „Single Source of Truth"-Prinzip von KIS-1138 und müsste
nach Backend-Fix sauber zurückgebaut werden.

## Reproduktionsschritte (Browser-Smoke-Test)

1. Inkognito-Tab auf `https://make.ki-sicherheit.jetzt` öffnen.
2. „KI-gestütztes Gespräch" wählen, R1-Intake durchgehen bis Block „Recht &
   Datenschutz" (Progress 0/5).
3. Frage zur DSGVO-Konformität / Absicherung Mandantendaten erreichen.
4. **Erwartet (nach Fix):** Unter dem Eingabefeld erscheint
   `<div class="smart-chips--active">` mit mindestens 3 Inspiration-Chips;
   Chip-Klick füllt das Textarea.
5. **Aktuell:** Leeres Textarea, kein `smart-chips--active`, kein Chip.
6. DevTools → Network → `/api/chat/message` SSE-Stream: Im
   `state_update`-Event prüfen, ob `field_examples: []` oder komplett fehlt.

## STOPP-Punkte für Wolf

- Bestätigen, dass Backend-#959 dieses Problem löst.
- Falls PR #959 nicht rechtzeitig mergt: Entscheidung Client-Fallback ja/nein.
- Chip-Texte für alle 5 Block-5-Felder absegnen, bevor Backend sie ausrollt.
