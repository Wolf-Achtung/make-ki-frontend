# Smart-Chips — Pflege-Guide

## Überblick

Smart-Chips ergänzen den Chat-Modus um kontextuelle Formulierungs-Vorschläge.
MVP-Scope: R1-Chat, 3 Felder (`strategische_ziele`, `vision_3_jahre`, `hauptleistung`).

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

Aktuell: `marketing`, `it`, `beratung` für `strategische_ziele`.

Weitere Branchen hinzufügen:

1. `byBranche.{branche_key}` analog den existierenden anlegen
2. Branche-Keys müssen mit Backend-Values matchen (z. B. `"handel"`, `"finanzen"`, `"gesundheit"`)
3. 3–5 Chips pro Branche

## Rollback-Plan

- **Soft-Rollback:** `data-smart-chips="1"`-Attribut entfernen → keine Chips
- **Hard-Rollback:** Git-Revert des Merge-Commits
- Kein Datenverlust, kein Schema-Change

## Bekannte Einschränkungen

- DE-only (EN kommt in Phase 2 Rollout)
- Nur 3 Felder (weitere in Phase 2 Rollout)
- R1 only (R2 kommt in Phase 2 Rollout)
- Keine LLM-generierten Chips (statische Map only)
