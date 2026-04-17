# Chat-Widget Smart-Chips — Konzept (Teil A: UI)

Konzept für kontextuelle Vorschlags-Chips bei Freitext-Fragen im Chat-Modus.
Grundlage: `chat-widget-architecture.md` und `chat-widget-smart-chips-feasibility.md`.

---

## A.1 UI-Idee in einem Satz

Zwischen Quick-Reply-Bereich und Textarea erscheint eine schmale Chip-Leiste mit 3–5 kontextuell passenden Vorschlägen, die per Klick **in die Textarea eingefügt** werden — nicht direkt gesendet. Der User bleibt Autor, die Chips sind Starthilfen.

### Kernprinzipien

1. **Ergänzen, nicht ersetzen.** Textarea bleibt immer Haupt-Interaktion; Chips sind sekundär.
2. **Keine Pflicht.** Kein Chip-Click = Normal-Verhalten wie heute.
3. **Stumm, wenn nichts zu bieten ist.** Ohne passende Suggestions: Container per `:empty { display:none }` unsichtbar.
4. **Diegetisch konsistent.** Chips wirken wie ein Notizblock neben dem Eingabefeld, keine KI-Overlays mit Animationen.
5. **Kontext-reich, nicht generisch.** Der Text jedes Chips berücksichtigt schon gemachte Angaben (Branche, Unternehmensgröße, bisherige Antworten).

---

## A.2 ASCII-Mockup — Wolf's Live-Test-Szenario konkret

### Ausgangspunkt (heute, ohne Smart-Chips)

```
┌─────────────────────────────────────────────────────────────────┐
│  KI-Bestandsaufnahme   ● Grunddaten─○─Vertiefung─○─Zusammenfass. │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bot:  Alles klar. Was sind Ihre wichtigsten Ziele beim         │
│        KI-Einsatz?                                              │
│                                                                 │
│        💡 Was ist hier gemeint?                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐   ┌───────┐  │
│  │                                               │   │       │  │
│  └───────────────────────────────────────────────┘   │ Senden│  │
│                                                      │       │  │
│                                                      └───────┘  │
└─────────────────────────────────────────────────────────────────┘
```

User steht vor leerem Feld. Hilfe gibt es nur auf Klick („Was ist hier gemeint?"), und das ist eine Rückfrage, keine Starthilfe.

### Neu (mit Smart-Chips, Branche = Marketing bekannt)

```
┌─────────────────────────────────────────────────────────────────┐
│  KI-Bestandsaufnahme   ● Grunddaten─○─Vertiefung─○─Zusammenfass. │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bot:  Alles klar. Was sind Ihre wichtigsten Ziele beim         │
│        KI-Einsatz?                                              │
│                                                                 │
│        💡 Was ist hier gemeint?                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Vorschläge — klicken zum Übernehmen, dann frei ergänzen:       │
│  [＋ Leads generieren] [＋ Content skalieren]                   │
│  [＋ Personalisierung verbessern] [＋ Marketing-Automation]     │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐   ┌───────┐  │
│  │                                               │   │       │  │
│  └───────────────────────────────────────────────┘   │ Senden│  │
│                                                      │       │  │
│                                                      └───────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Nach Klick auf „＋ Leads generieren" (und User ergänzt frei)

```
├─────────────────────────────────────────────────────────────────┤
│  Vorschläge — klicken zum Übernehmen, dann frei ergänzen:       │
│  [✓ Leads generieren] [＋ Content skalieren]                   │
│  [＋ Personalisierung verbessern] [＋ Marketing-Automation]     │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐   ┌───────┐  │
│  │ Leads generieren, vor allem für B2B-Kunden    │   │       │  │
│  │ mit langen Verkaufszyklen│                     │   │ Senden│  │
│  └───────────────────────────────────────────────┘   │       │  │
│                                                      └───────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Ausgewählter Chip bekommt einen „✓"-Marker (oder `.selected`-Klasse), bleibt aber weiterhin klickbar — erneuter Klick fügt den Text noch einmal an (User entscheidet). Nach Senden und `field_confirmed`-Event verschwindet die Leiste.

---

## A.3 Visuelle Regeln (für CSS-Arbeit in Teil B)

- **Position**: Neues Element `#chatSmartChips` als Child von `.chat-input-area`, zwischen `#chatQuickReplies` (oben) und `.chat-input-row` (unten). Details in Feasibility §3.3.
- **Höhe**: Eine bis zwei Zeilen. Bei Overflow → `flex-wrap: wrap`, kein horizontales Scrollen.
- **Chip-Styling**: Pill-Form (border-radius: 999px), dezent, nicht wie Primär-Buttons. Distinktion zu Quick-Replies: QR haben kräftigere Primär-/Sekundär-Styles (siehe `chat-widget.css` Z. 655 ff. und `qr-btn--primary`), Smart-Chips bleiben bewusst leiser.
- **Label-Zeile** („Vorschläge — klicken zum Übernehmen…"): klein, gräulich, wie `.qr-label` (`chat-widget.css`). Kann optional entfallen, wenn Chips visuell selbsterklärend sind.
- **Leerer Container**: `.chat-smart-chips:empty { display: none }` — analog zu `.chat-quick-replies:empty` (Z. 662).
- **A11y**: Container `role="group"`, `aria-label="Vorschläge zur Antwort"`. Jeder Chip `<button type="button">`, kein Link, damit Enter fokussiert klickt statt sendet. Tabulator reiht Chips zwischen Help-Button und Textarea ein.
- **Tastatur**: Fokusreihenfolge Help-Button → Chips → Textarea → Senden. Kein Chord nötig; Standard-TAB reicht.
- **Mobile**: Bei `<640px` Viewport genug Padding, damit Chips nicht zu nah am Bildschirmrand sitzen; `gap: 6px` statt `8px`.

---

## A.4 Edge-Case-Screens

**(1) Keine Suggestions verfügbar (z. B. Feld nicht in statischer Map).**

```
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐   ┌───────┐  │
│  │                                               │   │ Senden│  │
│  └───────────────────────────────────────────────┘   └───────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Container ist leer → `:empty { display:none }` → Layout wie heute. Kein Platz-Halter, kein „Wird geladen".

**(2) Quick-Replies aktiv (z. B. Branche-Frage mit festem Optionsset).**

Smart-Chips **unterdrückt**. QR-Buttons übernehmen die Führung. Textarea bleibt als Freitext-Ausweg sichtbar. Siehe Suppression-Regel in Feasibility §3.3.

**(3) Draft-Chip aktiv (Backend hat Wert aus User-Freitext erkannt).**

Smart-Chips **unterdrückt**. `#draftChip` zeigt „Erkannt: …" mit Übernehmen/Ändern. Nach Confirm verschwinden beide, nächster Turn.

**(4) User hat schon getippt, dann klickt Chip.**

Chip-Text wird **angehängt** (append), mit Trennzeichen `, ` oder `\n`, abhängig von Feld-Typ (Liste vs. Freitext). Fokus bleibt in Textarea, Cursor ans Ende.

---

## A.5 Was dieses Konzept bewusst NICHT tut

- Kein automatisches Senden beim Chip-Klick. Der User drückt Senden.
- Keine Chip-Empfehlungen auf Basis von Live-Tippen (kein Autocomplete-Popup). Chips sind pro Turn stabil, nicht reaktiv auf jeden Tastendruck.
- Kein Ersatz für Quick-Replies bei Options-Feldern. Smart-Chips sind **zusätzlich** und nur bei Freitext.
- Keine Animationen, keine Sound, keine „KI-schreibt-für-dich"-Effekte. Bewusst ruhig.

---

**Teil A fertig.** Bereit für Teil B (Event-Flow + Code-Skizzen) auf Wolf's Signal.
