# Smart-Chips — Pflege-Guide

## Überblick

Smart-Chips ergänzen den Chat-Modus um kontextuelle Formulierungs-Vorschläge.
MVP-Scope (Sprint C1): R1-Chat, 3 Felder (`strategische_ziele`, `vision_3_jahre`, `hauptleistung`).
Phase-5-Erweiterung: 5 zusätzliche Branchen, Größen-Varianten für `vision_3_jahre`.

## Coverage-Stand

| Feld | Default | Branche-Varianten | Größen-Varianten |
|------|---------|-------------------|------------------|
| `hauptleistung` | 5 Chips (strict) | — | — |
| `vision_3_jahre` | 5 Chips | — | `solo`, `kleines_team`, `kmu` (je 5) |
| `strategische_ziele` | 5 Chips | **8 von 13 Branchen** (je 4) | — |

> **Hinweis `hauptleistung`:** `strict: true` unterdrückt den default-Fallback. Ohne `byBranche`-Match werden **keine** Chips gezeigt — die Defaults wirken in Branchen wie Bildung oder Bau als Kontextbruch. Siehe Abschnitt „Strict-Modus".

**Branche-Coverage (strategische_ziele):** `marketing`, `it`, `beratung`, `finanzen`, `bildung`, `verwaltung`, `bau`, `medien`.
**Fallback auf `default`:** `handel`, `gesundheit`, `industrie`, `logistik`, `gastronomie` — bewusst, weil für diese Branchen noch keine distinkten Formulierungen kuratiert sind (Regel: nur wo spürbar anders).

## Lookup-Priorität

`window.getSmartChips(field, branche, size)` prüft in dieser Reihenfolge:

1. `entry.byBranche[branche]` — wenn matchend, gewinnt immer (auch bei gesetztem `size`).
2. `entry.bySize[sizeKey]` — wenn keine Branche-Variante passt.
3. `entry.strict === true` → `null` (kein Fallback, keine Chips).
4. `entry.default` — Fallback, sofern nicht `strict`.

`sizeKey` wird aus dem Backend-Code via `SIZE_MAP` abgeleitet:

| Backend-Code | interner Key |
|--------------|--------------|
| `"1"` | `solo` |
| `"2-10"` | `kleines_team` |
| `"11-100"` | `kmu` |

## Aktivierung / Deaktivierung

- **Aktivieren:** `<body data-smart-chips="1">` in HTML (aktuell: `formular/index.html`)
- **Deaktivieren:** Attribut entfernen oder auf `"0"` setzen
- **Phase-2-Rollout zu R2:** Attribut in `strategy.html` ergänzen — 1-Zeilen-Change

## Suggestion-Map bearbeiten

Datei: `smart-chips-de.js` (Repo-Root)

Beim Hinzufügen neuer Chips:

1. Max. 60 Zeichen pro Chip (Mobile-Readability)
2. KMU-verständliche Sprache (Zielgruppe: KMU-Geschäftsführer)
3. Branche-Varianten nur wo wirklich unterschiedlich
4. Chips müssen ergänzungsfähig sein (User kann mehrere kombinieren)

## Neue Felder hinzufügen

1. In `SMART_CHIPS_DE.{fieldKey}` mit mindestens `default`-Array anlegen
2. Backend-Verifikation: Sendet das Feld `next_fields_meta[fieldKey].chat_mode === "textarea"`?
   (curl-Test gegen `/api/chat/message` empfohlen)
3. Live-Test mit aktivem Feature-Flag

## Branche-Varianten erweitern

Aktuell abgedeckt: `marketing`, `it`, `beratung`, `finanzen`, `bildung`, `verwaltung`, `bau`, `medien` für `strategische_ziele`.

Weitere Branchen hinzufügen:

1. `byBranche.{branche_key}` analog den existierenden anlegen
2. Branche-Keys müssen mit Backend-Values matchen (z. B. `"handel"`, `"gesundheit"`, `"industrie"`, `"logistik"`, `"gastronomie"`)
3. 3–5 Chips pro Branche
4. Nur hinzufügen, wenn spürbar anders als `default` — sonst Pflegeaufwand ohne UX-Nutzen

## Größen-Varianten erweitern

Aktuell: `vision_3_jahre` mit `bySize.solo`, `bySize.kleines_team`, `bySize.kmu` (je 5 Chips).

Weiteres Feld um Größen-Varianten ergänzen:

1. Am Feld-Eintrag einen `bySize`-Block neben `default` anlegen — optional zusätzlich zu `byBranche`, beide koexistieren.
2. Keys aus der `SIZE_MAP` verwenden (`solo`, `kleines_team`, `kmu`). Falls weitere Größen-Stufen nötig werden, `SIZE_MAP` zentral erweitern.
3. Beachten: `byBranche` gewinnt immer vor `bySize`. Wenn ein Feld beide Dimensionen gleichzeitig nutzen soll, muss die Priorität bewusst gesetzt werden.

## Strict-Modus

`strict: true` am Feld-Eintrag verhindert den `default`-Fallback. Wenn weder eine `byBranche`- noch eine `bySize`-Variante greift, liefert `getSmartChips` `null` → es werden **keine** Chips angezeigt.

**Use-Case:** Felder, bei denen generische Default-Chips in bestimmten Branchen als Kontextbruch wirken würden — z. B. `hauptleistung`: Die Default-Chips („Software- und Web-Entwicklung", „Vertrieb und Handel" …) passen für Bildungs-, Bau- oder Verwaltungs-Geschäftsführer nicht zum Chat-Kontext und wirken peinlich.

**Richtlinie:** `strict` nur setzen, wenn der Kontextbruch durch Defaults größer wiegt als der Nutzen der Chips. `default` dennoch befüllt lassen (dokumentarisch) — so bleibt sichtbar, welche Chips greifen würden, falls `strict` später auf `false` gesetzt wird.

## Rollback-Plan

- **Soft-Rollback:** `data-smart-chips="1"`-Attribut entfernen → keine Chips
- **Hard-Rollback:** Git-Revert des Merge-Commits
- Kein Datenverlust, kein Schema-Change

## Bekannte Einschränkungen

- DE-only (EN kommt in Phase 2 Rollout)
- Nur 3 Felder (weitere in Phase 2 Rollout)
- R1 only (R2 kommt in Phase 2 Rollout)
- Keine LLM-generierten Chips (statische Map only)
