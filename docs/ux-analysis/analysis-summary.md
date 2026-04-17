# Executive Summary — Fragebogen-UX-Analyse

**Datum:** 17.04.2026 · **Scope:** R1 `formbuilder_de_SINGLE_FULL.js` (1094 Zeilen, 50 Felder) + R2 `strategy.html` (1505 Zeilen, 14 Felder) · **Branch:** `claude/analyze-questionnaire-ux-W763D`

---

## Kernbefund in einem Satz
Beide Fragebögen haben **gute bestehende Fundamente** (FIELD_EXAMPLES, dynamischer `briefing_id`-Prefill in R2, ausführliche Microcopy in R1), aber die **kritischen offenen Textareas** — 6 in R1, 1 in R2 — überfordern den User ausgerechnet dort, wo die Report-Qualität entschieden wird.

## Die 3 wichtigsten Einsichten

1. **Smart-Suggestions sind ohne Backend-Arbeit machbar.** In R2 lädt `strategy.html` bereits das komplette R1-Briefing via `GET /api/briefings/{id}` (Z. 1484–1500), nutzt davon aber nur `branche` + `unternehmensgroesse`. Alle R1-Antworten sind bereits im Frontend — sie werden nur nicht für Suggestion-Chips verwendet. **Sofort umsetzbarer Quick-Win.**

2. **Die Bausteine existieren bereits — sie sind nur nicht ausgerollt.** Das `s5_vision`-Toggle-Pattern in strategy.html (Z. 1418–1481) mit Adopt-Button ist exakt das, was für alle 6 WICHTIG-Textareas in R1 gebraucht wird. Die Inline-Option-Hints bei S9 (Cloud/Hybrid/On-Premise) zeigen, wie Option-Erklärungen aussehen. **Hauptarbeit ist Roll-out, nicht Neu-Entwicklung.**

3. **Ein dualer Modus ist in R2 schon Realität.** strategy.html bietet „KI-Gespräch" ODER „Formular" (Z. 1114–1145). Der Chat-Modus (`/api/chat/*`) kann als „Ich weiß es nicht"-Escape-Hatch für Einzel-Felder in R1 wiederverwendet werden — kein neuer Backend-Endpoint nötig.

## Top-3 Quick-Wins (≤ 1 Tag insgesamt)

| # | Maßnahme | Datei | Aufwand |
|---|---|---|---|
| 1 | **Chip-Suggestions für die 6 R1-WICHTIG-Textareas**, gespeist aus bereits beantworteten Feldern derselben Session | formbuilder Z. 650 | ~4 h |
| 2 | **R1-Rückblick oberhalb R2-S3 + S4** („Aus Ihrer R1: Kosten senken, Compliance sichern" [Übernehmen]) | strategy.html Z. 625, 669 | ~2 h |
| 3 | **Slider-Ankerpunkte** für `digitalisierungsgrad` (1 = Papier, 10 = Voll digital) | formbuilder Z. 438 | ~1 h |

## Die 5 Patterns gemappt auf Felder (Wolf's Priorisierung als Ausgangspunkt)

| Pattern | R1-Einsatzorte | R2-Einsatzorte |
|---|---|---|
| **Smart Suggestions** (Chips aus Session-Daten) | Alle 6 WICHTIG-Textareas, `ki_hemmnisse` | S3 Prioritäten, S4 Engpass, S5_vision |
| **Question-Decomposition** | `vision_3_jahre` (→ Sie/Team/Geschäftsmodell) | S3 Prioritäten (→ Nr. 1/2/3 sequenziell) |
| **AI-Prompt-Assistant** | 🔴-Felder, via Chat-Endpoint wiederverwenden | S5b Vision primär |
| **Voice + Bullet-Mode** | Alle 7 Textareas | S5_vision |
| **„Ich weiß es nicht"** | Nach jeder 🔴-Textarea als Escape-Button | Bereits vorhanden als Mode-Selector — auf Feld-Ebene ausrollen |

## Kritische offene Fragen für das Briefing

1. **LLM-Budget pro Session**: Heute 0 Calls während Ausfüllens. Sind 6–10 zusätzliche Haiku-Calls pro User akzeptabel?
2. **Chat vs. Form-Strategie**: Soll Chat-Modus langfristig führend werden, oder bleibt Form-UX der Hauptpfad?
3. **Question-Decomposition-Scope**: Nur bei 🔴-Feldern (selektiv) oder flächendeckend?
4. **R1 Doppelfrage**: `ki_ziele` (Checkbox, Block 3) + `strategische_ziele` (Textarea, Block 4) — zusammenlegen oder inhaltlich klarer abgrenzen?
5. **Legacy-Aufräumen**: `robustSubmitForm` (formbuilder Z. 992) — entfernbar vor Umbau?

## Risiken für Implementierung

- **formbuilder re-rendert vollständig** bei Country/Size-Änderung (Z. 777) → neue UI muss idempotent sein
- **Autosave-Schema-Version** (`SCHEMA_VERSION = "1.7.0"`) muss bei Feld-Struktur-Änderungen hochgezogen werden → Mid-Deploy verlieren User sonst Fortschritt
- **A11y-Baseline ist niedrig** (4 ARIA-Attribute in strategy.html, keine `aria-describedby`-Verknüpfung Label↔Hint in beiden) — jede neue interaktive Komponente erhöht den A11y-Backlog

## Empfehlung für nächsten Schritt

Mit **Quick-Win #1 beginnen** (R1-Chips) — niedriger Aufwand, größter UX-Effekt genau an der Stelle, wo der Live-Test-User blockiert hat. Danach Wolf-Feedback einholen, bevor Backend-seitige Änderungen (Endpoint `/api/suggest/{field}`, Chat-Integration) angegangen werden.

**Keine Implementierung ohne Briefing-Bestätigung pro Pattern.**

---

*Vollständige Analysen: `analysis-strategy-html.md`, `analysis-formbuilder.md`, `analysis-consolidated-recommendations.md`*
