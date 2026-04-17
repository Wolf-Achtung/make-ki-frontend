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

Ausgewählter Chip bekommt einen „✓"-Marker (oder `.selected`-Klasse), bleibt aber weiterhin klickbar — erneuter Klick fügt den Text noch einmal an (User entscheidet). Sobald `state_update` ein neues `next_fields[0]` meldet, wird die Leiste neu berechnet — oder versteckt, wenn das neue Feld `chat_mode: "QR"` hat.

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

---

# Teil B: Event-Flow + Code-Skizzen

Datenquellen gemäß korrigierter Feasibility: `state.next_fields[0]`,
`state.next_fields_meta[field].chat_mode`, `state.collected_fields`,
`state.pending_field`.

---

## B.1 Event-Lifecycle — was löst was aus?

```
 SSE-Event                Reaktion auf Smart-Chips-Leiste
 ─────────────────────────────────────────────────────────────────────
 state_update   ────▶   renderSmartChips(next_fields[0], meta, fields)
                         └─ intern: clear, Suppression-Checks, Render
 draft_value    ────▶   clearSmartChips()          (pending_field aktiv)
 field_confirmed ───▶   (nichts — nächstes state_update regelt es)
 quick_replies  ────▶   (nichts — state_update davor hat chat_mode)
 preview_qr     ────▶   (nichts)
 typing/token   ────▶   (nichts — niemals auf Token-Stream reagieren)
 done           ────▶   (nichts — state_update desselben Turns war führend)
 error          ────▶   clearSmartChips()          (defensiv)
```

**User-Aktionen:**

| User-Aktion | Effekt |
|---|---|
| Chip-Klick | Append des Chip-Texts in `#chatInput`, Fokus in Textarea, `.selected`-Klasse setzen. **Chips bleiben sichtbar.** |
| `sendMessage()` (Z. 338) | **Nichts.** Leiste bleibt. Das folgende `state_update` entscheidet: gleiches Feld → unverändert; neues Feld → neu rendern; Feld geschlossen → verstecken. |
| Resume (`checkResume` Z. 1568) | `updateProgress(sessionData.state)` an Z. 1691 trifft denselben Pfad wie `state_update`. Kein Sonderweg. |

**Suppression-Matrix — wann gar nichts rendern?**

| Bedingung | Quelle | Verhalten |
|---|---|---|
| `next_fields` fehlt oder leer | Backend (Summary/Complete-Phase) | Chips leer |
| `next_fields_meta[field].chat_mode !== "textarea"` | Live-API | Chips leer (QR übernimmt) |
| `pending_field` gesetzt | Live-API | Chips leer (Draft-Chip führt) |
| `_editMode === true` | Z. 864 | Chips leer (Edit-Panel führt) |
| keine Suggestions in statischer Map | Frontend | Chips leer |
| `#chatQuickReplies` nicht leer | DOM-State | Chips leer (Safety-Net) |

Leerer Container wird per `.chat-smart-chips:empty { display: none }` unsichtbar
— kein manuelles `style.display`-Handling.

---

## B.2 Code-Skizze: `renderSmartChipsIfApplicable(state)`

Pseudocode, nicht produktionsreif. Ergänzt den `state_update`-Handler (Z. 450).

```js
// Modul-Scope (neben _lastState Z. 1325)
var _collectedFields = {};
var _lastRenderedField = null;

function renderSmartChipsIfApplicable(state) {
    var container = document.getElementById("chatSmartChips");
    if (!container) return;

    // --- Suppression ---
    var field = state.next_fields && state.next_fields[0];
    var meta  = field && state.next_fields_meta && state.next_fields_meta[field];
    var mode  = meta && meta.chat_mode;
    var qrContainer = document.getElementById("chatQuickReplies");

    if (!field || mode !== "textarea") return clearSmartChips();
    if (state.pending_field) return clearSmartChips();       // Draft aktiv
    if (_editMode) return clearSmartChips();                 // Edit-Modus
    if (qrContainer && qrContainer.children.length) return clearSmartChips();

    // --- Feld unverändert? Dann nicht neu rendern (erhält .selected-Zustand) ---
    if (field === _lastRenderedField) return;

    // --- Suggestions ziehen ---
    var branche = _collectedFields.branche;
    var suggestions = lookupSmartChips(field, branche);
    if (!suggestions || !suggestions.length) return clearSmartChips();

    // --- Render ---
    container.innerHTML = "";
    container.appendChild(makeLabel("Vorschläge — klicken zum Übernehmen:"));
    suggestions.forEach(function(s) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "smart-chip";
        btn.textContent = "+ " + s;
        btn.addEventListener("click", onChipClick);
        container.appendChild(btn);
    });
    _lastRenderedField = field;
}

function clearSmartChips() {
    var container = document.getElementById("chatSmartChips");
    if (container) container.innerHTML = "";
    _lastRenderedField = null;
}

function onChipClick(e) {
    var input = document.getElementById("chatInput");
    var text = e.currentTarget.textContent.replace(/^\+\s*/, "");
    var sep  = input.value && !input.value.endsWith(", ") ? ", " : "";
    input.value = input.value + sep + text;
    input.focus();
    e.currentTarget.classList.add("selected");
}
```

**Anschluss im bestehenden Handler** (Z. 450):

```js
case "state_update":
    updateProgress(data);
    _collectedFields = data.collected_fields || {};
    renderSmartChipsIfApplicable(data);
    if (data.is_completable === true) showCompletionUI();
    break;
```

Zusätzlich in `handleDraftValue` (Z. 467): `clearSmartChips();` als erste Zeile.

---

## B.3 Suggestion-Map — Struktur

Analog zu `window.FIELD_EXAMPLES` (`field_examples_de.js`, bereits in `strategy.html` Z. 1093 geladen). Neue Datei `smart_chips_de.js` oder Inline im Widget, je nach Pflege-Präferenz.

```js
window.SMART_CHIPS_DE = {

    strategische_ziele: {
        default: [
            "Effizienz steigern",
            "Kosten senken",
            "Qualität verbessern",
            "Mitarbeiter entlasten"
        ],
        byBranche: {
            marketing: [
                "Leads generieren",
                "Content-Produktion skalieren",
                "Personalisierung verbessern",
                "Marketing-Automation ausbauen"
            ],
            it: [
                "Code-Qualität verbessern",
                "Incident-Response beschleunigen",
                "Dokumentation automatisieren",
                "Testing-Coverage erhöhen"
            ],
            beratung: [
                "Research-Zeit verkürzen",
                "Berichte automatisiert erstellen",
                "Wissensmanagement aufbauen",
                "Mandantenkommunikation skalieren"
            ]
        }
    },

    hauptleistung: {
        default: [
            "Beratung",
            "Dienstleistung",
            "Produktentwicklung",
            "Vertrieb"
        ]
        // byBranche optional pro Feld
    }

};
```

**Lookup-Funktion:**

```js
function lookupSmartChips(field, branche) {
    var entry = window.SMART_CHIPS_DE && window.SMART_CHIPS_DE[field];
    if (!entry) return null;
    if (branche && entry.byBranche && entry.byBranche[branche]) {
        return entry.byBranche[branche];
    }
    return entry.default || null;
}
```

**Regeln für Pflege:**

- `default` ist Pflicht, sobald ein `field`-Schlüssel existiert — Fallback für unbekannte Branchen.
- `byBranche` optional; Branchenschlüssel exakt wie in `collected_fields.branche` (z. B. `"marketing"`, nicht `"Marketing & Werbung"`).
- Max 5 Suggestions pro Eintrag — mehr würde die Chip-Leiste visuell überladen.
- Sprache: deutsch. Englische Map separat (`SMART_CHIPS_EN`) — analog zu `FIELD_EXAMPLES`.

**Teil B fertig.** Bereit für Teil C (Open Questions + Aufwand) auf Wolf's Signal.
