# Konsolidierte UX-Optimierungs-Strategie

**Scope:** `strategy.html` (R2-Strategie-Fragebogen) + `formular/formbuilder_de_SINGLE_FULL.js` (R1-Grundfragebogen)
**Stand:** 2026-04-17
**Prinzip:** Diagnose-Basis aus Einzel-Analysen — jetzt: gemeinsame Strategie

---

## Gemeinsamkeiten & Unterschiede der beiden Fragebögen

| Dimension | formbuilder (R1) | strategy.html (R2) |
|---|---|---|
| **Scope** | 50 Felder, 8 Blöcke, 10–15 Min. | 14 Felder, 1 Seite, 3 Min. |
| **Architektur** | Dynamisches Rendering (Vanilla JS IIFE) | Statisches HTML + inline IIFE |
| **Hilfe-Pattern** | description + FIELD_EXAMPLES direkt sichtbar + wichtig-Badge | mk-question-hint + S9-Option-Hints + nur s5_vision mit Toggle-Example |
| **LLM-Alternative** | ❌ kein Chat-Modus | ✅ Dual-Mode (Chat oder Form) |
| **Prefill aus Vorgänger** | ❌ keine R0-Daten | ✅ `GET /api/briefings/{id}` lädt R1 |
| **State-Key** | `autosave_form_data` | `strategy_form_data` |
| **Pflicht vs. Optional** | 34 Pflicht / 16 optional | 6 Pflicht / 8 optional |
| **🔴 kritische Felder** | 6 Textareas (WICHTIG_FIELDS) | 1 Textarea (s5_vision) |

### Divergenz im UX-Ansatz — hier droht Inkonsistenz
- **R1** hat ausführlichere Microcopy (Block-Intros, Klammer-Begründung bei jedem Feld), **aber** schlechtere LLM-Integration (nur statische FIELD_EXAMPLES)
- **R2** hat schlankere Microcopy, **aber** echte dynamische Features: Mode-Selector, Briefing-Prefill, Adopt-Button bei s5_vision
- User wandert R1 → Status → R2: Beim Wechsel fällt ihm auf, dass R2 „intelligenter" wirkt → R1-Upgrade ist überfällig

### Wo sie vereinheitlicht werden sollten
- **Ein gemeinsamer Chip-Renderer** (z. B. `renderSuggestionChips(fieldKey, sourceData)`), der in beiden Formularen wiederverwendet wird
- **Ein gemeinsames „KI-Hilfe"-Widget** für das „Ich weiß es nicht"-Pattern (heute nur in strategy.html als Modus vorhanden)
- **FIELD_EXAMPLES-Struktur** ist schon geteilt (`/field_examples_de.js`) — der Toggle-vs.-direkt-sichtbar-Unterschied sollte aufgelöst werden (Empfehlung: direkt sichtbar bei ≤5 Felder, Toggle bei langen Formularen wie R1)

---

## Quick-Wins (≤ 1 Tag, sofort umsetzbar)

1. **R1: Chip-basierte Smart Suggestions für die 6 WICHTIG-Textareas** (`formbuilder_de_SINGLE_FULL.js`)
   - Datenquelle: bereits beantwortete `formData`-Felder im gleichen oder Vorblock
   - Ort: direkt nach `example-box` im `renderInput`-Flow (Z. 650)
   - UI: Chips mit `+`-Symbol → Klick hängt Text an Textarea an
   - Aufwand: ~4 h
   - **Beispiel-Mapping:**
     - `vision_3_jahre` ← Chips aus `ki_ziele`-Labels + `hauptleistung`-Extrakt
     - `strategische_ziele` ← Chips aus `anwendungsfaelle`-Labels
     - `ki_guardrails` ← Chips aus `regulierte_branche` + Standard-Guardrails für die Branche

2. **R2: R1-Rückblick-Zeile oberhalb S3 und S4** (`strategy.html`)
   - „In Ihrer Readiness-Analyse hatten Sie als Ziele angegeben: *Effizienz, Kundenservice*. Übernehmen?" [Übernehmen-Button]
   - Datenquelle: Das bereits geladene `briefing`-Objekt (Z. 1489) — globalisieren
   - Aufwand: ~2 h

3. **R1: Slider-Ankerpunkte** für `digitalisierungsgrad` und `risikofreude`
   - Labels „1 = Papier" / „5 = Mix" / „10 = Voll digital" unter dem Slider
   - Aufwand: ~1 h (CSS `.slider-labels` existiert bereits Z. 312)

4. **R2: `example-box`-Pattern ohne Toggle** in strategy.html ausrollen für Moat-Felder (`datenreife`), analog zu R1
   - Aufwand: ~2 h

---

## Mittelfristig (1–3 Tage, Architektur-Änderungen)

1. **Gemeinsamer Suggestion-Renderer-Helper** (`/common/suggestion-chips.js`, neu)
   - API: `renderSuggestionChips({ fieldKey, sourceData, strategy: 'append' | 'replace' })` → HTML-String
   - Wird in beiden Formularen importiert
   - Mapping-Matrix (welches Ziel-Feld bekommt Suggestions aus welchen Source-Feldern) in derselben Datei

2. **„Ich weiß es nicht"-Button unter 🔴-Textareas**
   - Öffnet ein Modal / Side-Panel mit kurzem Chat
   - Nutzt existierende `/api/chat/message`-Endpoints (keine neue Backend-Arbeit)
   - Übernahme-Button: Finaler Chat-Output wird als Textarea-Value gesetzt

3. **Question-Decomposition**
   - **R1 `vision_3_jahre`** → 3 Teilfragen (Sie / Team / Geschäftsmodell)
   - **R2 S3 Prioritäten** → „Nr. 1 / Nr. 2 / Nr. 3" (3 Radio-Sets statt max-3 Checkbox)
   - Backend-Schema bleibt gleich (concat vor Submit)

4. **Voice-Input + Bullet-Mode-Toggle** auf allen Textareas
   - Web Speech API, kein Backend
   - Pro Textarea: 3 Mode-Icons (🎤 / • / ¶) oberhalb

5. **R1 Doppelfrage-Auflösung**: `ki_ziele` (Block 3, Checkbox) und `strategische_ziele` (Block 4, Textarea) zusammenführen
   - Entweder: Textarea wird vorbelegt mit Checkbox-Auswahl-Text
   - Oder: Inhaltliche Neu-Abgrenzung im Microcopy klarstellen

---

## Langfristig (> 3 Tage, neue Features)

1. **Neues Backend-Endpoint `/api/suggest/{field}`**
   - Input: `{ field_key, form_data, context: { report_type: 'r1' | 'strategy' } }`
   - Output: `{ chips: [{ text, source_field }], example_text: string }`
   - Haiku-Call mit strukturiertem Prompt
   - Caching nach `hash(form_data)` für wiederholte Anfragen

2. **Drag&Drop Priority-Matrix für R2 S3** (statt Question-Decomposition)
   - 8 Prioritäten als Karten → User zieht Top-3 in Reihenfolge
   - A11y-Risiko: braucht vollständige Tastatur-Alternative
   - **Nur wenn Benutzer-Tests Decomposition als umständlich zeigen**

3. **R1 Block-weises Mini-Feedback** nach jedem Block: „Sie sind bei Block 3 von 8. Bisher sehen wir: [Mini-Zusammenfassung]. Sind Sie zufrieden oder wollen Sie was ändern?"
   - Retention-Booster
   - LLM-Zusammenfassung nach Block-Ende

4. **Persönlicher „KI-Begleiter"-Widget** über beide Fragebögen hinweg
   - Permanenter Chat-Button am Rand („💬 Frag nach")
   - Kontext-bewusst (weiß, welches Feld gerade fokussiert ist)
   - Wiederverwendung `chat-widget.js`

---

## Priorisierung pro Fragebogen

### strategy.html — Priorisierung der Felder
**Höchste Priorität:** S3 (Prioritäten), S4 (Engpass), S5b (Vision)
**Begründung:** S3 und S4 sind Pflicht + abstrakt; S5b ist kein Pflicht, aber inhaltlich der reichste Datenlieferant.

| Rang | Feld | Pattern | Begründung |
|---|---|---|---|
| 1 | S3 Prioritäten | R1-Rückblick + Vorauswahl | Pflicht + max-3 ist mental teuer |
| 2 | S4 Engpass | Smart Suggestions aus R1 `ki_hemmnisse` | Zwingt Reduktion auf 1 aus 7 |
| 3 | S5b Vision | AI-Prompt-Assistant + Voice | Größter inhaltlicher Hebel |
| 4 | S7 Entscheidung | Keine Änderung | 🟢 einfach |
| 5 | Moat-Felder | Decomposition-Hilfe | Optional, aber Datenreife ist abstrakt |

### formbuilder — Priorisierung der Felder
**Höchste Priorität:** Die 6 WICHTIG_FIELDS-Textareas (`hauptleistung`, `ki_projekte`, `zeitersparnis_prioritaet`, `vision_3_jahre`, `strategische_ziele`, `ki_guardrails`)

| Rang | Feld | Pattern | Begründung |
|---|---|---|---|
| 1 | `vision_3_jahre` | Decomposition (3 Teile) + Voice + Assistant | Größte kognitive Last |
| 2 | `strategische_ziele` | Smart Chips aus `anwendungsfaelle` + `ki_ziele` | Overlap mit `vision_3_jahre` |
| 3 | `ki_guardrails` | Smart Chips + Standard-Guardrails für Branche | Oft leer gelassen |
| 4 | `zeitersparnis_prioritaet` | Chips aus Branche + Hauptleistung | Quick-Win-Generator |
| 5 | `geschaeftsmodell_evolution` | „Ich weiß es nicht" → Assistent | Optional + sehr abstrakt |
| 6 | `hauptleistung` | Bullet-Mode | Gleich im Block 1 → Einstiegs-Hürde |
| 7 | `ki_projekte` | Voice-Input | Meist informelle Liste → Sprache natürlicher |

---

## Offene Architektur-Fragen an Wolf

1. **LLM-Budget pro User-Session**
   - Wie viele zusätzliche LLM-Calls sind pro R1-Ausfüllung ok? (heute: 0; mit Suggestions potenziell 6–10)
   - Caching akzeptabel oder sind personalisierte Suggestions Pflicht?

2. **Chat-Modus vs. Form-Modus — welcher ist das strategische Ziel?**
   - In strategy.html ist der Chat heute nur Alternative. Soll er perspektivisch **der Haupt-Modus** werden (und Form nur noch Fallback)?
   - Oder sollen beide gleichrangig bleiben und das Form-UX wird mit Chat-Bausteinen aufgeladen?

3. **Question-Decomposition: Nur bei 🔴-Feldern oder flächendeckend?**
   - Flächendeckend erhöht Formular-Länge (gefühlt); selektiv ist UX-inkonsistent
   - Empfehlung aus Analyse: **selektiv bei 🔴**, dokumentiert im Style-Guide

4. **R1 ↔ R2 Datenfluss-Symmetrie**
   - R2 liest R1 via `/api/briefings/{id}` — soll R1 seinerseits einen leichtgewichtigen Vorgänger-Check haben (URL-Param-Prefill aus Schnellcheck existiert teilweise via `prefill.js`)?

5. **A11y-Level — Zielsetzung**
   - Aktuell beide Formulare nur teilweise WCAG-2.1-AA. Bei Drag&Drop, Voice-Input etc. steigt der Aufwand. Was ist die Zielsetzung?

6. **`robustSubmitForm` (formbuilder:992)**
   - Legacy-Duplikat? Soll es vor den neuen Features entfernt werden?

7. **i18n-Strategie**
   - Es existieren `formbuilder_en_SINGLE_FULL.js` und `field_examples_de.js`. Neue Features in DE first oder parallel?

---

## Risiken & Fallstricke

- **Re-Render-Gefahr bei formbuilder**: Der `handleChange`-Flow (Z. 720) re-rendert bei Country/Size-Änderung und könnte Suggestion-Chip-State verlieren. Jedes neue UI muss idempotent renderbar sein.
- **Autosave-Schema-Versionierung**: Bei Feld-Struktur-Änderungen `SCHEMA_VERSION` hochziehen (Z. 36) → alte Autosaves werden verworfen. User verliert Fortschritt, falls mitten im Ausfüllen deployt wird.
- **Chat-Endpoint-Rate-Limiting**: Wenn `/api/chat/message` für Suggestions wiederverwendet wird, sollten die Rate-Limits überprüft werden (chat-widget.js nutzt diesen Endpoint auch interaktiv).
- **FIELD_EXAMPLES-Fallback**: Für Branchen ohne explizites Beispiel gibt es Kaskade `branche+size → branche → size → default` (Z. 222–224, 1398–1410). Bei Smart Chips braucht es einen ähnlichen Fallback.
- **Mobile-Tastatur bei Voice-Input**: Auf iOS ist `navigator.mediaDevices.getUserMedia` hinter User-Gesture — der „🎤"-Button muss explizit der Auslöser sein.
