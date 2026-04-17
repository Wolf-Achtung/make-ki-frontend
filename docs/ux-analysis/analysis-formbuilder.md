# Jetzt-Zustand: `formular/formbuilder_de_SINGLE_FULL.js`

**Datei:** `/home/user/make-ki-frontend/formular/formbuilder_de_SINGLE_FULL.js`
**Stand:** 2026-04-17
**Analyse-Scope:** R1-Grundfragebogen (KI-Readiness-Status), Schema 1.7.0

---

## 1. Struktur

| Kennzahl | Wert |
|---|---|
| Zeilen gesamt | **1094** |
| Architektur | **Vanilla JS IIFE**, kein Framework |
| Haupt-Module | injected helpers (Z. 1–28), IIFE (Z. 31–989), `robustSubmitForm` (Z. 992–1094) |
| CSS | In JS injiziert via `injectCSS()` (Z. 282–320) |
| State | In-memory `formData = {}` + `localStorage` (`autosave_form_data`, `autosave_form_step`) |
| Submit | `POST /briefings/submit` (Z. 911, 1061) mit Idempotency-Key |
| Schema-Version | `SCHEMA_VERSION = "1.7.0"` (Z. 36) |

### Architektur-Eigenheiten
- **Render-by-Block:** Nicht das ganze Formular wird gerendert, sondern `renderStep()` (Z. 626) rendert nur den aktuellen Block (1 von 8)
- **Schema-Invalidierung:** `ensureSchema()` löscht Autosave, wenn Schema-Version sich ändert
- **Zwei Submit-Pfade:** `submitForm` (Haupt, Z. 846) und `robustSubmitForm` (Legacy-Wrapper, Z. 992) — aktuell ist Robust disabled (Z. 1090 Kommentar)
- **Conditional Re-Render:** `handleChange` (Z. 720) triggert Full-Re-Render wenn `country` oder `unternehmensgroesse` sich ändert (für `showIf`-Conditionals)

---

## 2. Felder-Inventar

**50 Felder** in **8 Blöcken** (`blocks`-Definition Z. 614–623).

### Block-Struktur
| # | Titel | Felder | Zeit |
|---|---|---|---|
| 1 | Firmendaten & Branche | 11 | ca. 3 Min. |
| 2 | Status Quo | 5 | ca. 2 Min. |
| 3 | Ziele & Use Cases | 7 | ca. 4 Min. |
| 4 | Strategie & Governance | 6 | ca. 3 Min. |
| 5 | Ressourcen & Präferenzen | 5 | ca. 1 Min. |
| 6 | Rechtliches & Compliance | 7 | ca. 2 Min. |
| 7 | Förderung & Investition | 8 | ca. 1 Min. |
| 8 | Datenschutz & Absenden | 1 | 30 s |

### Felder im Detail (Auszug — 🔴 und 🟡)

| Feld-Key | Label (gekürzt) | Typ | Pflicht | Kritikalität | WICHTIG-Badge? | Beispiel (FIELD_EXAMPLES)? |
|---|---|---|---|---|---|---|
| `branche` | Branche | select (13) | ✅ | 🟢 | ❌ | ❌ |
| `unternehmensgroesse` | Unternehmensgröße | select (3) | ✅ | 🟢 | ❌ | ❌ |
| `selbststaendig` | Unternehmensform (bei 1 Pers.) | select (4) | ❌ | 🟢 | ❌ | ❌ |
| `country` / `bundesland` | Land / Region | select | ✅ | 🟢 | ❌ | ❌ |
| **`hauptleistung`** | Hauptdienstleistung / Produkt | **textarea** | ✅ | **🔴** | ✅ | ✅ |
| `zielgruppen` | Zielgruppen | checkbox (9) | ✅ min. 1 | 🟡 | ❌ | – |
| `digitalisierungsgrad` | Digital (1–10) | slider | ✅ | 🟢 | ❌ | – |
| `ki_ziele` | **KI-Ziele 3–6 Monate** | checkbox (8) | ✅ min. 1 | 🟡 | ❌ | – |
| **`ki_projekte`** | Bestehende KI-Projekte | **textarea** | ✅ | **🔴** | ✅ | ✅ |
| `anwendungsfaelle` | Interessante Use Cases | checkbox (8) | ✅ min. 1 | 🟡 | ❌ | – |
| **`zeitersparnis_prioritaet`** | Wo frisst am meisten Zeit? | **textarea** | ✅ | **🔴** | ✅ | ✅ |
| `pilot_bereich` | Bester KI-Projekt-Start | select (6) | ✅ | 🟡 | ❌ | – |
| **`geschaeftsmodell_evolution`** | KI-Ideen für Geschäftsmodell | **textarea** | ❌ | **🔴** | ❌ | ✅ |
| **`vision_3_jahre`** | Vision 2–3 Jahre | **textarea** | ✅ | **🔴** | ✅ | ✅ |
| **`strategische_ziele`** | KI 6–12 Mon. konkret | **textarea** | ✅ | **🔴** | ✅ | ✅ |
| **`ki_guardrails`** | No-Gos / sensible Themen | **textarea** | ✅ | **🔴** | ✅ | ✅ |
| `ki_hemmnisse` | Hemmnisse | checkbox (9) | ✅ min. 1 | 🟡 | ❌ | – |
| Restliche 29 Select/Slider/Checkbox | — | — | gemischt | 🟢 | ❌ | ❌ |

### Die 7 Textarea-Felder (🔴 Hauptproblem-Zone)
```
hauptleistung                    Z. 395  (wichtig)
ki_projekte                      Z. 473  (wichtig)
zeitersparnis_prioritaet         Z. 482  (wichtig)
geschaeftsmodell_evolution       Z. 491  (optional)
vision_3_jahre                   Z. 493  (wichtig)
strategische_ziele               Z. 496  (wichtig)
ki_guardrails                    Z. 497  (wichtig)
```

**6 von 7** Textareas sind in `WICHTIG_FIELDS` markiert (Z. 211, 810). Sie sind **die zentralen Treiber der Report-Qualität** — genau dort wo User heute „blockieren".

---

## 3. Bestehende Hilfe-Mechanismen

| Mechanismus | Vorhanden? | Details |
|---|---|---|
| Beschreibungs-Text pro Feld | ✅ | `f.description` → `.guidance`-Box, **fast alle Felder** |
| Placeholder bei Textareas | ✅ | Alle 7 Textareas haben konkrete Placeholder |
| **FIELD_EXAMPLES-Beispielbox** | ✅ | Z. 650–658: `getFieldExample(k)` liefert branche+size-spezifische Beispiele für **alle Textareas**. Anders als bei strategy.html ist die Box **nicht hinter einem Toggle**, sondern direkt sichtbar. |
| „Wichtig für Ihren Report"-Badge | ✅ | `badge-wichtig` für 6 Felder (Z. 641) |
| Block-Intros | ✅ | Ausführliche Block-Einleitung (3–4 Sätze) pro Block (Z. 323–332) |
| Block 3+4 haben „Je konkreter, desto besser"-Hinweis | ✅ | `BLOCK_INTRO[2]` und `[3]` |
| Autosave | ✅ | `saveAutosave()` bei jedem Change + `fb:progress`-Event (Z. 273) |
| Validation mit Invalid-Markierung | ✅ | `markInvalid()` (Z. 794), Auto-Scroll zu erstem Fehler |
| Progress-Indicator | ✅ | CustomEvent `fb:progress` für externes Progress-UI |
| Skip-Option („Noch unklar") | ⚠️ Partiell | Viele Checkbox-Felder haben `keine_angabe` / „Noch unklar" — aber **kein geführter Fallback-Dialog** |
| Auto-Complete / dynamische Suggestions | ❌ | **Fehlt komplett** |
| Voice-Input | ❌ | Fehlt |
| AI-Prompt-Assistant | ❌ | Fehlt |
| Tooltips | ❌ | Keine `<details>`, keine hover-Tooltips |
| Conditional-Logic | ✅ | `showIf()` für `selbststaendig` (nur bei Solo), `bundesland` (nur bei DE/AT/CH/GB) |

### Positiv-Beispiel: Die guidance-Boxen
```js
// formbuilder:644-648
if (f.description) html += "<div class='guidance'>" + f.description + "</div>";
if (f.type === "checkbox" && (f.key === "zielgruppen" || f.key === "ki_ziele" || f.key === "anwendungsfaelle")) {
  html += "<div class='guidance important'>Bitte mindestens eine Option auswählen.</div>";
}
```
Die `description`-Klammer-Texte sind **gut geschrieben** („*Damit wir ...*") — dieses Pattern ist der UX-Anker des Formulars.

### Negativ-Beispiel: Offene Textareas ohne Mikro-Struktur
```js
// formbuilder:482-483
{ key: "zeitersparnis_prioritaet", label: "Wo frisst heute am meisten Zeit oder Nerven?",
  type: "textarea",
  placeholder: "In welchen Bereichen verlieren Sie heute am meisten Zeit? (z. B. E-Mails, Angebote, Dokumentation)",
  description: "(Damit wir sehr konkrete Quick-Win-Empfehlungen zur Entlastung ableiten können – ...)" }
```
User sieht: Leeres Feld + Placeholder + Beispielbox (wenn FIELD_EXAMPLES für seine Branche definiert ist). Aber **keine klickbaren Chips**, kein „Meine Antwort aus R1 übernehmen"-Button (es gibt in R1 keinen „R1" — aber die Vorgänger-Felder `ki_einsatz`, `anwendungsfaelle` sind bereits beantwortet und **sollten in Suggestions einfließen**).

---

## 4. UX-Probleme im Detail

### 🔴 Die 6 WICHTIG_FIELDS-Textareas sind die Blockade-Zone
Alle folgen demselben Pattern: Frage + Placeholder + Description + Beispielbox (falls branche-spezifisch vorhanden). Bei branche `default` wird teils kein Beispiel gezeigt → User sieht nur Placeholder.

**Spezifische Schwachstellen:**
1. **`ki_ziele` (checkbox, Z. 465) — nicht Textarea, aber 🟡-kritisch**: Liefert 8 vorgefertigte Optionen inklusive „Noch unklar". Gut im Prinzip, aber **der User aus dem Live-Test scheiterte an einer ähnlich formulierten Frage**, was darauf hindeutet, dass die Grenze zwischen `ki_ziele` (Checkbox, Block 3) und `strategische_ziele` (Textarea, Block 4) **nicht klar ist** → Duplikat-Frage ohne sichtbaren Mehrwert.

2. **`geschaeftsmodell_evolution` (Z. 491, optional)**: „Haben Sie Ideen, wie KI Ihr Geschäftsmodell verändern oder ergänzen könnte?" → **höchste kognitive Last aller Felder**. Optional zu markieren ist die aktuelle Antwort; besser wäre ein aktiver Guide-Modus („Keine Ideen? Wir schlagen 3 basierend auf Ihrer Branche vor").

3. **`vision_3_jahre` vs. `strategische_ziele` vs. `geschaeftsmodell_evolution`**: Drei inhaltlich überlappende offene Felder in Block 3+4. Risk: User tippt erschöpft bis Feld 2 und lässt Feld 3 leer — genau die Report-wichtige Vision geht verloren.

### 🟡 Sekundär-Probleme
- **Block 1 ist 11 Felder lang** → längster Block; `hauptleistung` (Textarea) ist hier mittendrin, der User hat noch keine Routine entwickelt
- **`zielgruppen`, `datenquellen`, `ki_einsatz`, `anwendungsfaelle`, `ki_hemmnisse`** sind alle Multi-Select-Checkboxen mit 8–9 Optionen. Auf Mobile → viel Scrollen
- **`digitalisierungsgrad` (Slider 1–10)**: Kein Tick-Label außer dem numerischen Value. User weiß nicht, was „7" vs. „8" bedeutet
- **Keine Query-Param-Prefill** wie bei strategy.html (`prefill.js` existiert im formular/-Ordner, aber nicht in diesem File referenziert) — Untersuchen ob Live-Test-Scenarios damit abgedeckt sind

---

## 5. Datenfluss-Analyse

```
User-Input → handleChange() → formData[key] = collectValue()
           → saveAutosave() → localStorage["autosave_form_data"]
           → renderStep() (nur wenn showIf-relevant)

Submit: formData → payload.answers → POST /briefings/submit
        → server returns briefing_id
        → redirect /formular/status.html?id=<briefing_id>
        → danach: strategy.html?briefing_id=<id> (R2-Runde)
```

### State-Verfügbarkeit für Smart-Suggestions
- **`formData`** ist im IIFE-Scope (Z. 950) — **nicht global, aber zugänglich** über Closures in den injectedHelpers, die im selben File definiert sind
- `getFieldExample(fieldKey)` (Z. 217–232) nutzt bereits `formData.branche` und `formData.unternehmensgroesse` für Kontext-Lookup — **das Pattern existiert, muss nur erweitert werden**
- Alle bisher beantworteten Felder eines früheren Blocks sind in `formData` bei `renderStep()` des aktuellen Blocks verfügbar ✅

### Für echtes LLM-basiertes Smart-Suggest
- Aktuell: **Kein Backend-Call während des Ausfüllens** außer dem finalen Submit
- `chat-widget.js` nutzt `/api/chat/start`, `/api/chat/message` — könnte bei Bedarf aus formbuilder heraus aufgerufen werden
- **Kein dedizierter `/api/suggest/{field}`-Endpoint** → müsste entweder neu gebaut oder der Chat-Flow wiederverwendet werden

---

## 6. Technische Machbarkeit

### Framework-Kompatibilität: ✅
- Vanilla JS → Änderungen sind direkt
- **Rendering ist string-konkateniert** (`html += "<div ..."`) — keine reaktive UI, aber Chip-Einfügen ist trivial: Neuen Helper `renderSuggestionChips(fieldKey)` aufrufen und in den existierenden `html +=`-Flow einschieben
- Das Re-Render-Pattern bei `showIf` (Z. 777) ist **invasiv** (zerstört DOM) — Chips müssten nach jedem Render neu gerendert werden

### CSS
- Alles inline injiziert (`injectCSS()`) → neue Klassen dort ergänzen
- Kein Tailwind, kein Build-Step

### Accessibility
- `aria-live="polite"` auf `#fb-msg` (Z. 662) — gut für Fehler-Ankündigung
- `aria-describedby`-Verknüpfung Label↔Description **fehlt** (Description wird als `<div>` nach `<label>` gesetzt, nicht verknüpft)
- Fieldsets für Checkbox-Gruppen fehlen — alle Checkboxen sind lose `<input>` ohne `<fieldset>/<legend>`
- Slider hat keine `aria-valuenow` / `aria-valuetext`

### Mobile
- `.checkbox-group { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)) }` (Z. 297) → bei 320 px Viewport teilt Grid in 1 Spalte, ok
- `form-nav` ist sticky-bottom (Z. 303) → gut, aber auf iOS Safari potenziell Z-Index-Probleme
- Sehr lange Blöcke (Block 1: 11 Felder) → kein progressiver Block-Scroll, alles auf einer Seite

### Rate-Limiting / Timeout
- Nicht sichtbar im Frontend. Submit hat Idempotency-Key, aber kein Client-seitiger Retry
- Für Suggestions-LLM-Calls: Neue Infrastruktur nötig (Debouncing, Abort-Controller)

---

## 7. Empfehlungen für `formbuilder_de_SINGLE_FULL.js`

### Top-3 Quick-Wins (je 2–4 h)
1. **Smart-Suggestion-Chips für die 6 WICHTIG-Textareas** basierend auf bereits beantworteten Feldern:
   - `vision_3_jahre` Chips aus `formData.ki_ziele`, `formData.pilot_bereich`, `formData.hauptleistung`
   - `ki_guardrails` Chips aus `formData.regulierte_branche`, `formData.datenschutzbeauftragter`
   - Render-Hook: Im `renderStep()` bei `f.type === "textarea"` (Z. 650) einen neuen Block „`<div class='suggest-chips'>`" einschieben
2. **Slider-Ankerpunkte** für `digitalisierungsgrad` und `risikofreude`: Labels „1 = Papier-lastig", „5 = Mix", „10 = Voll digital" als `.slider-labels`-Block (der CSS existiert bereits, Z. 312)
3. **Vereinheitlichung `ki_ziele` (Checkbox) vs. `strategische_ziele` (Textarea)**: Entweder zusammenlegen oder Textarea vorbelegen mit gewählten Checkbox-Werten: „*Ausgewählt: Effizienz, Kundenservice. Ergänzen Sie gerne konkret ...*"

### Top-3 Deep-Fixes (1–3 Tage)
1. **Question-Decomposition für `vision_3_jahre`**: Aufteilen in „Was soll sich für **Sie** ändern?" (1 Satz) + „Was soll sich für Ihr **Team** ändern?" (1 Satz) + „Was soll sich am **Geschäftsmodell** ändern?" (1 Satz). Die 3 Antworten concat für Backend-Payload.
2. **„Ich weiß es nicht"-Escape-Hatch**: Button unter jeder Textarea → öffnet einen Chat-Flow (wiederverwendbar aus `chat-widget.js`) mit einem Meta-Prompt wie „Ich führe gerade die KI-Readiness-Analyse durch. Bei Feld X bin ich unsicher. Bisher habe ich angegeben: [formData-Auszug]. Hilf mir formulieren." Der Chat liefert am Ende einen Text, den der User übernehmen kann.
3. **Voice-Input + Bullet-Mode** als Eingabe-Modus-Toggle pro Textarea: 3 Icons „🎤 Sprechen / • Stichpunkte / ¶ Fließtext". Voice via Web Speech API, Bullet ist nur eine `<ol>`-Darstellung mit `+`-Button für neuen Punkt.

### Architektur-Entscheidung nötig
- **Wenn Smart-Suggestions LLM-basiert sein sollen**: Neuer Endpoint `/api/suggest/{field}` (oder Wiederverwendung Chat-Endpoints mit fixiertem Prompt). Entscheidung: Ist das Projekt bereit für einen **zweiten LLM-Call pro Feld** (Kosten, Latenz), oder reicht die statische FIELD_EXAMPLES-Matrix + kontext-bewusste Chip-Auswahl?
- **`robustSubmitForm` am Ende der Datei** (Z. 992–1094) — ist das noch benötigt? Es überschreibt `submitForm` (Z. 1088). Wenn Legacy, sollte es vor weiteren Änderungen entfernt werden, um Verwirrung zu vermeiden.
