# Sprint C1 — Manuelle Test-Checkliste

Zweck: Wolf-Abnahme vor Merge zu `main`.
Aktivierung: `data-smart-chips="1"` auf `<body>` (bereits in `formular/index.html` gesetzt).
Testumgebung: `make.ki-sicherheit.jetzt/formular/` im Chat-Modus.

---

## Feature-Flag-Verhalten

- [ ] Ohne Flag (`strategy.html`): Keine Chips sichtbar, Chat funktioniert normal
- [ ] Mit Flag (`formular/index.html`): Chips erscheinen bei passenden Feldern

## Chip-Rendering je Feld

- [ ] `hauptleistung` → 5 default-Chips
- [ ] `vision_3_jahre` → 5 default-Chips (ohne matchende Größe)
- [ ] `strategische_ziele` (Branche Marketing) → 4 marketing-Chips
- [ ] `strategische_ziele` (Branche IT) → 4 it-Chips
- [ ] `strategische_ziele` (Branche Beratung) → 4 beratung-Chips

## Phase-5: Neue Branche-Varianten (strategische_ziele)

- [ ] Branche Finanzen → 4 finanzen-Chips (u. a. „Compliance-Aufwand beherrschbar halten")
- [ ] Branche Bildung → 4 bildung-Chips (u. a. „Lernmaterialien individualisieren")
- [ ] Branche Verwaltung → 4 verwaltung-Chips (u. a. „Bürgeranfragen schneller beantworten")
- [ ] Branche Bau → 4 bau-Chips (u. a. „Angebotserstellung beschleunigen")
- [ ] Branche Medien → 4 medien-Chips (u. a. „Redaktionelle Produktion skalieren")

## Phase-5: Fallback auf default bei nicht-gecoverten Branchen

- [ ] Branche Handel → 5 default-Chips
- [ ] Branche Gesundheit → 5 default-Chips
- [ ] Branche Industrie → 5 default-Chips
- [ ] Branche Logistik → 5 default-Chips
- [ ] Branche Gastronomie → 5 default-Chips

## Phase-5: Größen-Varianten (vision_3_jahre)

- [ ] Größe `"1"` (solo) → 5 solo-Chips (u. a. „Work-Life-Balance halten bei steigendem Umsatz")
- [ ] Größe `"2-10"` (kleines_team) → 5 kleines_team-Chips (u. a. „Nicht mehr alles selbst machen müssen")
- [ ] Größe `"11-100"` (kmu) → 5 kmu-Chips (u. a. „Strukturen für echte Skalierung schaffen")
- [ ] Unbekannte/leere Größe → 5 default-Chips

## Phase-5: Lookup-Priorität

- [ ] Feld mit passender Branche **und** passender Größe → Branche gewinnt (nur relevant, wenn zukünftig ein Feld beide Dimensionen kombiniert; heute hat `strategische_ziele` nur byBranche, `vision_3_jahre` nur bySize — daher ist dieser Fall synthetisch)
- [ ] Feld nur mit passender Größe, kein byBranche → bySize greift (`vision_3_jahre` bei bekannter Größe)
- [ ] Weder matchende Branche noch Größe → default greift

## Suppression-Matrix (alle 6 Regeln müssen greifen)

- [ ] Feature-Flag aus → keine Chips
- [ ] Leere `next_fields` → keine Chips
- [ ] `chat_mode != "textarea"` (z. B. Branche-QR) → keine Chips
- [ ] `pending_field` gesetzt (Draft aktiv) → Chips verschwinden
- [ ] Edit-Mode aktiv → keine Chips
- [ ] Feld nicht in Suggestion-Map → keine Chips

## Click-Interaktion

- [ ] Chip-Klick hängt Text an Input an
- [ ] Zweiter Chip-Klick ergänzt mit `", "`-Separator
- [ ] Input endet mit `"."` → Separator ist `" "` statt `", "`
- [ ] Klick auf bereits-used Chip funktioniert nochmal (fügt nochmal an)
- [ ] Used-Chip ist visuell grau, aber klickbar

## State-Management

- [ ] Nach Senden: Chips verschwinden während `typing`-Indicator
- [ ] Nach `state_update`: neue Chips für neues Feld oder clear
- [ ] Idempotenz: 2× `state_update` für dasselbe Feld → kein Re-Render (used-State bleibt)

## A11y

- [ ] Tab-Navigation: Chips sind fokussierbar
- [ ] Enter / Space auf Chip: triggert Click
- [ ] Screen-Reader liest `aria-label` vor („Vorschlag übernehmen: …")
- [ ] Focus-Ring sichtbar bei Tab
- [ ] Farbkontrast WCAG AA (blau `#1e40af` auf `#f0f7ff` — geprüft in Phase 3)

## Mobile

- [ ] 320 px Viewport: Chips umbrechen ohne horizontales Scroll
- [ ] 480 px Viewport: Mediaquery greift (kleinere Schrift/Padding)
- [ ] Longest Chip (`"Abhängigkeit von einzelnen Mitarbeitern reduzieren"`) passt auf 2 Zeilen

## Edge-Cases

- [ ] Session-Resume (Page-Reload mit aktiver Session): Chips erscheinen beim nächsten `state_update`
- [ ] Schnelles Klicken mehrerer Chips: kein JS-Error, alle Texte landen im Input
- [ ] Chat-Ende erreicht: Keine stale Chips nach finalem State
