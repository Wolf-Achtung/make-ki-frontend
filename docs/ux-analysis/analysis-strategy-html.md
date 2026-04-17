# Jetzt-Zustand: `strategy.html`

**Datei:** `/home/user/make-ki-frontend/strategy.html`
**Stand:** 2026-04-17
**Analyse-Scope:** Strategie-Fragebogen (R2), baut auf R1-Briefing auf

---

## 1. Struktur

| Kennzahl | Wert |
|---|---|
| Zeilen gesamt | **1505** |
| CSS-Block inline | Z. 15–535 (ca. 35 % der Datei) |
| HTML-Body (Formular) | Z. 536–1091 |
| JS-Block inline | Z. 1094–1502 (IIFE) |
| Architektur | **Vanilla HTML + inline IIFE**, keine Framework-Abhängigkeit |
| State-Management | `localStorage` mit Key `strategy_form_data` (Z. 1169) |
| Submit-Flow | 2-step: `POST /api/strategy/questions/{id}` → `POST /api/strategy/generate/{id}` → Polling `/api/strategy/status/{id}` |

### Besonderheit: Dualer Modus
strategy.html bietet dem User **schon heute eine Wahl** (Z. 1114–1145):
- **Mode A:** „KI-gestütztes Gespräch" → `window.initChat({ report_type: 'strategy', briefing_id })` — **Chat-Modus existiert bereits** über `chat-widget.js` und die `/api/chat/*` Endpoints
- **Mode B:** „Fragebogen direkt ausfüllen" (statisches Formular mit Radio/Checkbox)

Der Chat-Modus ist **kein Ersatz**, sondern Alternativpfad. Die jetzige UX-Baustelle betrifft nur Mode B.

---

## 2. Felder-Inventar

14 explizit nummerierte Blöcke (S1–S10 + 3 Moat-Felder, davon ein Sub-Feld `s5_vision`).

| Feld-ID | Label (gekürzt) | Typ | Pflicht | Kritikalität | Bestehende Hilfe |
|---|---|---|---|---|---|
| `s1_budget` | Budget nächste 12 Mon. | radio (5) | ✅ | 🟢 | Hint: Abgrenzung zu früherer Angabe |
| `s2_zeitrahmen` | Umsetzungszeitraum | radio (4) | ✅ | 🟢 | – |
| `s3_prioritaeten` | Wichtigste Prioritäten | checkbox (8, **max 3**) | ✅ | 🟡 | Hint + JS-Limit `setupMaxCheckboxes` (Z. 1148) |
| `s4_engpass` | Größter Engpass | radio (7) | ✅ | 🟡 | Hint: „nur einer — der wichtigste" |
| `s5_tools` | Genutzte Software | checkbox (15, gruppiert) | ❌ | 🟢 | Kategorie-Überschriften (Produktivität, KI-Tools, …) |
| `s5_tools_other` | Weitere Tools | text | ❌ | 🟢 | Placeholder mit Beispielen |
| **`s5_vision`** | **Persönliche KI-Vision** | **textarea** | ❌ | **🔴** | Placeholder + **FIELD_EXAMPLES-Toggle** (Z. 1418–1481) |
| `s6_foerderinteresse` | Förderinteresse | radio (4) | ✅ | 🟢 | Hint |
| `s7_entscheidung` | Entscheidungsstruktur | radio (4) | ✅ | 🟢 | – |
| `s8_erfahrung` | KI-Erfahrung | radio (4) | ❌ | 🟢 | Hint: „Optional" |
| `s9_ansatz` | Infrastruktur-Ansatz | radio (4) | ❌ | 🟡 | **Inline-Erklärung** pro Option (`.mk-option-hint`) |
| `s10_datenschutz` | Datenschutz-Priorität | radio (3) | ❌ | 🟢 | – |
| `wettbewerber_anzahl` | Anzahl Wettbewerber | radio (4) | ❌ | 🟢 | – |
| `kundenbindung_typ` | Kundenbeziehungs-Typ | radio (3) | ❌ | 🟡 | – |
| `datenreife` | Eigene Datenbestände | radio (4) | ❌ | 🟡 | Hint mit Beispielen |

**Pflichtfelder-Summe:** 6 (S1, S2, S3, S4, S6, S7) — validiert in `strategy.html:1276`.

### Das einzige 🔴-Feld: `s5_vision`
```html
<!-- strategy.html:800-807 -->
<div class="mk-question-group" data-field="s5_vision">
  <span class="mk-question-label">
    <span class="mk-section-number">S5b</span>
    Wie sieht Ihre persönliche KI-Vision für Ihr Unternehmen aus?
  </span>
  <p class="mk-question-hint">Optional — beschreiben Sie in eigenen Worten, wo Sie mit KI hinwollen.</p>
  <textarea id="s5_vision" name="s5_vision" class="mk-form-textarea" rows="4"
    placeholder="Was wäre für Sie der größte Gewinn durch KI? Wo soll Ihr Unternehmen in 2–3 Jahren stehen?"></textarea>
</div>
```

Positiv:
- **FIELD_EXAMPLES-Integration existiert** und zieht `branche` + `unternehmensgroesse` aus dem geladenen Briefing (`GET /api/briefings/{id}`, Z. 1484–1500) → der Datenzugriff-Mechanismus für Smart-Suggestions **ist bereits da**
- Toggle-UI „💡 Beispiel anzeigen" + Adopt-Button „als Vorlage übernehmen" sind umgesetzt (Z. 1446–1480)

Negativ:
- Nur **1 von 14 Feldern** nutzt diese Hilfe — bei den Radio/Checkbox-Fragen gibt es keine equivalente Orientierungshilfe
- S3 (Prioritäten, max 3) hat **keine Priorisierungs-Hilfe** (außer Counter) — User wählt blind, ohne Hinweis auf „was passt zu Branche X"
- S4 (Engpass, „nur einer") zwingt zur schmerzhaften Reduktion ohne Vorauswahl-Hinweis basierend auf bisheriger R1-Analyse

---

## 3. Bestehende Hilfe-Mechanismen im Überblick

| Mechanismus | Vorhanden? | Umfang |
|---|---|---|
| Placeholder-Texte | ✅ | Nur Textarea/Text-Input (s5_vision, s5_tools_other) |
| Inline-Hints (`.mk-question-hint`) | ✅ | 7 von 14 Feldern |
| Option-Hints (Erklärung pro Radio) | ✅ | Nur S9 (Cloud/On-Prem/Hybrid) |
| Kategorie-Überschriften | ✅ | Nur S5 (Tool-Checkbox-Gruppen) |
| Auto-Complete / Suggestions | ❌ | **Fehlt komplett** außer s5_vision |
| Progress-Indicator | ❌ | Kein Block-Progress (vs. formbuilder, der `fb:progress` dispatcht) |
| Skip-Option / „Weiß ich nicht" | ⚠️ Partiell | S6 hat „Weiß nicht", S4 hat „Andere" — aber **keine Geführter-Dialog-Fallback** |
| Max-Selection-Feedback | ✅ | S3: `setupMaxCheckboxes("s3_prioritaeten", 3)` disabled weitere Checkboxen |
| Autosave | ✅ | `saveStrategyForm()` bei `change` + `input` (Z. 1262–1264) |

---

## 4. UX-Probleme im Detail

### 🔴 Hauptproblem: `s5_vision` ist nur die Spitze des Eisbergs
Die Vision-Frage ist optional, aber inhaltlich **die reichste Quelle für einen guten Strategiebericht**. Aktuell:
- Leeres Textfeld mit Placeholder
- Beispiel ist hinter einem Toggle versteckt („💡 Beispiel anzeigen")
- Kein Hinweis auf bereits erfasste R1-Daten („Sie hatten bei R1 angegeben …")
- Kein Voice-Input, kein Bullet-Mode, kein AI-Prompt-Assistant

### 🟡 Zweit-Problem: S3 Priorisierung zu mechanisch
Max-3-Checkbox ist technisch umgesetzt, aber es fehlt:
- Kein Drag&Drop für Reihenfolge (1. / 2. / 3. Priorität)
- Keine Smart-Suggestion basierend auf R1-Branche („In Marketing sind typisch: Kosten senken, Qualität verbessern, Kundenerlebnis")
- Kein „Ich weiß es nicht" → Geführter Dialog

### 🟡 S4 Engpass-Wahl: fehlende Kontextualisierung
User muss ohne Hilfe aus 7 generischen Engpässen einen wählen. R1 enthält `ki_hemmnisse` (Multi-Select!) — **das sollte hier als Vorauswahl dienen**, stattdessen startet S4 bei null.

### 🟢 S9 Infrastruktur-Erklärung: Best-Practice im Haus
Die inline Option-Hints bei S9 (Cloud/On-Premise/Hybrid/Egal, Z. 899–934) zeigen, **dass Wolf die Komponenten bereits hat**. Dieses Pattern ist nur nicht überall ausgerollt.

---

## 5. Datenfluss-Analyse (für Smart-Suggestions)

```
┌─────────────────────────┐       ┌───────────────────────────────┐
│  URL: ?briefing_id=XYZ  │──────▶│  GET /api/briefings/{id}      │
└─────────────────────────┘       │  liefert komplettes R1-Profil │
                                  │  (branche, groesse, ziele,    │
                                  │   hauptleistung, digitalis.)  │
                                  └───────────────┬───────────────┘
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                ▼                                 ▼                                 ▼
    ┌───────────────────┐           ┌────────────────────────┐        ┌────────────────────────┐
    │ Aktuell genutzt:  │           │ Aktuell ignoriert:     │        │ Aktuell ignoriert:     │
    │ branche + size    │           │ ki_ziele, ki_hemmnisse │        │ vision_3_jahre,        │
    │ → FIELD_EXAMPLES  │           │ ki_einsatz, ...        │        │ strategische_ziele,... │
    │   (nur s5_vision) │           │                        │        │                        │
    └───────────────────┘           └────────────────────────┘        └────────────────────────┘
```

**Implikation:** Das Backend liefert bereits das komplette R1-Profil an strategy.html. Für Smart-Suggestions ist **kein neuer API-Call nötig** — die Daten sind schon im Frontend vorhanden (nur im `.then()`-Callback Z. 1489, aber dort lokal). Das Objekt `briefing` müsste in eine globale oder `window`-Variable gehoben werden.

### Smart-Suggestions-Machbarkeit

| Pattern | Machbar? | Bemerkung |
|---|---|---|
| 1. **Context-Aware Smart Suggestions** | ✅ Sofort | R1-Daten schon geladen; Chip-Rendering ist neu, aber trivial |
| 2. **Question-Decomposition** | ✅ Sofort | Rein HTML/JS-lokal, keine Backend-Änderung |
| 3. **AI-Powered Prompt-Assistant** | ⚠️ Backend-Endpoint fehlt | Chat-Endpoints existieren (`/api/chat/message`), aber kein dedizierter „Suggest for field X" — entweder Chat-Flow wiederverwenden oder neuer Endpoint `/api/strategy/suggest` |
| 4. **Voice-Input** | ⚠️ Browser-API | Web Speech API ist verfügbar; kein Backend nötig |
| 4b. **Bullet-Mode** | ✅ Sofort | Nur Client-seitige Eingabe-Modi-Umschaltung |
| 5. **„Ich weiß es nicht"-Escape-Hatch** | ✅ Sofort | Chat-Modus existiert bereits → Weiterleitung ins Gespräch statt in Chat-Widget integriert |

---

## 6. Technische Machbarkeit

### Framework-Kompatibilität: ✅ Einfach
- Kein Framework → Dynamische Chips/Buttons sind direktes DOM-Manipulieren
- Das `s5_vision`-Example-Toggle-Pattern (Z. 1446–1480) ist **wiederverwendbar** für alle Felder

### CSS-Architektur
- Custom Properties (`--mk-text-primary`, `--mk-border-light`, …)
- BEM-artig (`mk-question-group`, `mk-radio-card`, `mk-check-card`)
- Inline im `<style>`-Block der HTML → **keine externe Build-Kette**, Änderungen sind einzelne Edits

### Accessibility
- **Nur 4 aria-/role-Attribute** in der gesamten Datei (Grep-Count)
- Mode-Cards nutzen `tabindex="0"` + `role="button"` (Z. 1119, 1126)
- `aria-hidden="true"` bei Icons
- **Keine `aria-live` auf Fehler-Bereichen**, keine `aria-describedby`-Verknüpfung zwischen Label und Hint
- Bei neuen Drag&Drop-Priority-UIs ist das eine Hürde — aber Radio/Checkbox bleiben grundsätzlich tastaturbedienbar

### Mobile-Responsiveness
- **Nur 1 Mobile-Breakpoint** (`@media (max-width: 640px)`, Z. 524)
- Radio-Grid ist Flex-Column → skaliert vertikal ok
- Checkbox-Gruppen für Tools (S5) könnten auf 320 px eng werden, aber `.mk-check-grid` ist Grid-basiert

---

## 7. Empfehlungen für `strategy.html`

### Top-3 Quick-Wins (je < 2 h Arbeit)
1. **Hint-Zeile mit R1-Rückblick oberhalb jedes Feldes**: „In Ihrer Readiness-Analyse hatten Sie als Branche *Marketing & Werbung* und als Ziel *Kundenerlebnis verbessern* angegeben." → Kognitive Brücke zwischen R1 und R2.
2. **S3-Vorauswahl aus R1 `ki_ziele`**: Die in R1 gewählten KI-Ziele als **Pre-Check** für S3 setzen (User kann ändern). Code-Pfad: `briefing.ki_ziele` → Map auf S3-Values → `checked=true`.
3. **Beispiel-Toggle-Pattern auf S5b erweitern auf die Mode-Selector-Seite**: Oberhalb des Formulars einen „KI-Assistent" anbieten als prominenten Fallback („Unsicher bei einer Frage? Starten Sie stattdessen den geführten Dialog"). Die `modeSelector`-Komponente existiert bereits.

### Top-3 Deep-Fixes (> 1 Tag)
1. **Smart-Suggestion-Chips für S3 + S4** basierend auf R1-Daten: Chip „Aus Ihrer R1: Kosten senken, Compliance sichern" → Klick setzt Checkbox. Rendering via Mini-Template-Funktion wiederverwendbar.
2. **S5_vision: Inline-„Prompt-Assistant"** statt statischem Beispiel: Nutzt `/api/chat/message`-Endpoint mit einem Meta-Prompt („Gib mir 3 Formulierungs-Varianten für Vision eines $branche-$size-Unternehmens, das in R1 folgende Ziele angegeben hat: …").
3. **Question-Decomposition für S3**: Statt „Wählen Sie bis zu 3 Prioritäten" aufteilen in „Was ist die Nr.1-Priorität?" (Radio) → „Was ist Nr.2?" (Radio, Nr. 1 ausgeblendet) → „Was ist Nr.3?" (optional). Explizit gewichtete Reihenfolge als Backend-Signal.

### Architektur-Entscheidung nötig
- **Soll der Chat-Modus als primärer Fallback dienen** oder sollen Smart-Suggestions im Form-Modus die Komplexität kompensieren? Aktuell sind es zwei Parallel-Welten — eine Teil-Integration (Chat-triggern aus einzelnen Feldern heraus) wäre technisch schön, aber UX-Verwirrung ist real.
