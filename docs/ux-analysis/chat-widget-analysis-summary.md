# Chat-Widget Smart-Chips — Executive Summary

**Scope:** Kontextuelle Vorschlags-Chips bei Freitext-Fragen im Chat-Modus, ausgelöst durch Wolf's Live-Test („Was sind Ihre wichtigsten Ziele beim KI-Einsatz?" mit leerem Eingabefeld).
**Status (2026-04-17):** Analyse abgeschlossen, GO-Empfehlung, 5 Entscheidungen für Wolf offen.
**Vollständige Analysen:** `chat-widget-architecture.md` (Code-Struktur), `chat-widget-smart-chips-feasibility.md` (technische Machbarkeit), `chat-widget-smart-chips-concept.md` (UI + Event-Flow + Sprint-Plan).

---

## 1. Kernbefund

Smart-Chips im Chat sind frontend-only umsetzbar, ohne Backend-Änderung, in rund **9 Stunden Entwicklungszeit** — die Live-API liefert bereits alle benötigten Daten bei jedem `state_update`.

## 2. Top-3-Einsichten

1. **Feld-Kontext ist unterschätzt verfügbar.** Das Backend schickt in jedem SSE-`state_update` sowohl das nächste abzufragende Feld (`next_fields[0]`) als auch dessen Typ (`next_fields_meta[...].chat_mode: "QR" | "textarea"`). Widget-Code-Pfade, die auf `current_field` zugreifen, laufen heute ins Leere — dieser Key existiert nicht im Backend-Vertrag. Smart-Chips wechseln die Quelle und stehen damit auf verifizierter, live-getesteter Grundlage.
2. **Collected-Fields sind schon da, ohne Polling.** Jede `state_update`-Payload trägt die komplette Map der bereits beantworteten Felder (`collected_fields: {"branche": "marketing", …}`). Der ursprünglich geplante Cache aus `field_confirmed`-Events und der REST-Fallback auf `GET /api/chat/session/{id}/fields` entfallen — drei Zeilen im bestehenden Handler reichen.
3. **Injection-Point existiert ohne Kollision.** Ein neues Geschwister-Element in `.chat-input-area` (zwischen Quick-Replies und Textarea) überlebt `clearQuickReplies`-Wipes, koexistiert mit Draft-Chip und Help-Button, und verhält sich visuell ruhig — keine Änderung an bestehenden Komponenten nötig.

## 3. Die 5 Wolf-Entscheidungen (mit Empfehlung)

| Frage | Empfehlung |
|---|---|
| Welche Felder bekommen Smart-Chips? | MVP: 3 Felder (`strategische_ziele`, `hauptleistung`, `vision_3_jahre`), Ausweitung in Phase 2 |
| Für welche Felder branche-spezifische Varianten? | Nur `strategische_ziele` × 3 Branchen (marketing/it/beratung); andere Felder nur `default` |
| Feature-Flag? | `data-smart-chips="1"` auf `<body>`, Default aus, Kill-Switch als einzeiliges `return` |
| R1 und/oder R2? | Zunächst nur R2 (`strategy.html`), R1-Ausweitung in Phase 2 bei Bedarf |
| Sprachen? | MVP nur deutsch (`SMART_CHIPS_DE`), englische Map in Phase 2 |

## 4. Aufwand + Risiken

**Aufwand MVP:** ~9 h (7,5 h Kernarbeit + 1,5 h Puffer) — passt in einen Sprint-Tag. Phase-2-Rollout separat: +6–10 h.

**Top-3-Risiken:**

- **Suggestion-Qualität wirkt generisch** → Mitigation: Wolf reviewt die Suggestion-Map im PR, branche-Varianten nur wo Nutzen spürbar.
- **UI-Clutter durch parallele Helfer** → Mitigation: Help-Button bei aktiven Chips unterdrücken, Screenshot-Vergleich vor Release.
- **Feature-Flag-Disziplin** → Mitigation: Default aus, Staging-Test, Kill-Switch eingebaut.

## 5. Empfohlener nächster Schritt

1. **Wolf entscheidet** die 5 Fragen aus §3 (schätzungsweise 15 Minuten Lesezeit + Entscheidung).
2. **Sprint-C1-Briefing** auf Basis der Entscheidungen formulieren (inkl. konkreter Suggestion-Map-Entwürfe für die 3 MVP-Felder).
3. **Implementation** im Sprint C1 (~9 h), Feature-Flag bleibt bis Smoke-Test auf Staging aus.
4. **Phase-2-Planung** nach internem Test des MVP mit Wolf und ggf. einem zweiten Tester.

**Bis hierhin** keine Code-Änderungen im Produkt. Alle weiteren Schritte sind blockiert, bis Wolf die 5 Entscheidungen getroffen hat.
