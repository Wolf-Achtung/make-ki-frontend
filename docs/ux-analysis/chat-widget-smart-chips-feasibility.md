# Chat-Widget Smart-Chips — Feasibility

Kontextuelle Suggestion-Chips bei Freitext-Fragen im Chat.
Analyse basiert auf Code-Evidenz aus `chat-widget.js` (1766 Zeilen) **und**
Live-API-Befunden aus Parent-Session `734e4396-02fb-4ed0-ace3-c12430d519ef`
(27 Keys in `state_update` verifiziert).

> **Hinweis (2026-04-17):** §§1, 2 und 4 wurden nach dem Live-API-Test korrigiert.
> Frühere Annahmen zu `current_field` waren falsch. Die autoritative Quelle ist
> jetzt `state.next_fields[0]` + `state.next_fields_meta[field].chat_mode`.

---

## 1. Feld-Kontext-Erkennung — KORRIGIERT

### 1.1 Was der Live-API-Test wirklich ergeben hat

Die SSE-`state_update`-Payload trägt **27 Keys**. Relevant für Feld-Kontext:

| Key | Bedeutung | Beispielwert |
|-----|-----------|--------------|
| `next_fields` | Array der noch offenen Felder, **Index 0 = aktuell abgefragt** | `["strategische_ziele", "hauptleistung", …]` |
| `next_fields_meta` | Map `field → {chat_mode, label?, hint?, …}` | `{"strategische_ziele": {"chat_mode": "textarea", …}}` |
| `collected_fields` | Map bereits beantworteter Felder | `{"branche": "marketing"}` |
| `pending_field` | gesetzt, solange ein Draft schwebt | `"hauptleistung"` oder `null` |
| `pending_value`, `pending_label` | Draft-Begleiter | — |

**Was nicht existiert:** Kein Key `current_field` in der Live-API.

### 1.2 Konsequenz für den Widget-Code

`chat-widget.js` liest an zwei Stellen `_lastState.current_field` — Z. 778 (`renderSkipButtonIfOptional`) und Z. 818 (`renderHelpButtonIfApplicable`). Diese Zugriffe liefern **zur Laufzeit `undefined`**. Beide Funktionen sind defensiv gebaut (`if (!fieldName) return;`), fallen also still aus — der Code-Pfad existiert, greift aber nie. Für Smart-Chips ist `current_field` damit **keine** Quelle.

Autoritative Feld-Ermittlung für Smart-Chips:

```js
// Pseudocode für den state_update-Handler
var state = data;
var field = (state.next_fields && state.next_fields[0]) || null;
var meta  = field && state.next_fields_meta && state.next_fields_meta[field];
var mode  = meta && meta.chat_mode;   // "QR" | "textarea" | ...
if (field && mode === "textarea") {
    renderSmartChips(field, state.collected_fields, meta);
}
```

### 1.3 Zuverlässigkeit

**Jeder** `state_update` (laut Live-Test) trägt `next_fields`. Der Replace-Overwrite an Z. 1379 (`_lastState = state;`) ist damit kein Problem — alle relevanten Keys werden bei jedem Event erneut gesetzt. Ein separater `_lastKnownField`-Cache ist **nicht** nötig; das war ein Workaround gegen ein Problem, das in der Realität nicht existiert.

### 1.4 Bekannte Edge-Cases (nach Korrektur)

**(a) Reihenfolge innerhalb eines Turns.** Der SSE-Parser (Z. 388–426) ist strikt sequentiell. Übliche Reihenfolge: `typing → token* → state_update → quick_replies|preview_qr → done`. Smart-Chips reagieren auf `state_update` — ab diesem Zeitpunkt ist `next_fields[0]` aktuell. **Regel bleibt:** Nicht auf `token` reagieren, sonst falscher Feld-Kontext.

**(b) Template-Turns.** Manche Turns senden nur `done` ohne `state_update` (vgl. `finishStream` Z. 509–512). In diesen Fällen bleibt `_lastState` auf dem Stand des vorherigen Turns. Smart-Chips sollten dann **nicht** neu rendern; der aktive Chip-Zustand bleibt gültig, weil das abzufragende Feld unverändert ist.

**(c) `clearQuickReplies()` bei jedem `sendMessage()`** (Z. 355). Wipet `#chatQuickReplies.innerHTML`. Smart-Chips in einem anderen Container bleiben unberührt — bestätigt Injection-Point aus §3.

**(d) Page-Reload / Resume.** `_lastState = null` bis der erste `state_update` kommt. Bei Resume (`checkResume` Z. 1568) ruft das Widget `updateProgress(sessionData.state)` (Z. 1691) mit identischer `state`-Struktur auf — also inklusive `next_fields` und `collected_fields`. Kein zusätzlicher Fetch nötig.

**(e) `pending_field` aktiv.** Während ein Draft schwebt, ist `pending_field` gesetzt. Smart-Chips sollen dann unterdrückt werden, weil `#draftChip` die UI belegt (siehe §3.2).

### 1.5 Fazit Abschnitt 1

Feld-Kontext ist aus `state.next_fields[0]` **zuverlässig und ohne Cache** ablesbar. Der `chat_mode` aus `next_fields_meta` beantwortet zusätzlich gratis die Frage „Freitext oder nicht?" — das Frontend muss nichts mehr heuristisch ableiten.

Für Wolf's Live-Test-Szenario („Was sind Ihre wichtigsten Ziele beim KI-Einsatz?"):
- Nach dem Branche-Confirm sendet Backend `state_update` mit `next_fields[0] = "strategische_ziele"` und `next_fields_meta["strategische_ziele"].chat_mode = "textarea"`.
- Smart-Chips rendern deterministisch. Kein Rätselraten, kein Parser für Bot-Messages.

---

## 2. Collected-Fields-Verfügbarkeit — KORRIGIERT

### 2.1 Live-API-Befund

`state_update` trägt `collected_fields` direkt als Map. Bestätigt im Live-Test nach Branche-Confirmation:

```json
{
  "collected_fields": {"branche": "marketing"},
  "collected_count": 1,
  "next_fields": ["…"],
  "next_fields_meta": { "…": {"chat_mode": "textarea"} }
}
```

Das Backend sendet bei **jedem** `state_update` das vollständige Collected-Bild. Keine Inkrement-Events nötig, kein Merge-Konflikt — einfacher Replace.

### 2.2 Konsequenz: Plan-B wird Plan-A

Alle in der Vor-Korrektur-Version diskutierten Workarounds entfallen:

| Ursprünglich geplant | Status nach Live-API |
|---|---|
| REST-Polling `GET /api/chat/session/{id}/fields` bei jedem Freitext-Turn | **Entfällt zur Runtime** — Daten kommen via SSE. |
| Inkrementeller Cache aus `field_confirmed`-Events | **Entfällt.** `collected_fields` im `state_update` ist bereits das vollständige Bild. |
| Fallback-Fetch bei Resume | **Entfällt.** `checkResume` ruft `updateProgress(sessionData.state)` (Z. 1691) — enthält bereits `collected_fields`. |
| Doppel-Cache-Invalidierung bei Draft-Confirm | **Entfällt.** Nächstes `state_update` trägt den aktualisierten Stand. |

### 2.3 Implementierung (minimal)

Im `state_update`-Handler (Z. 450):

```js
case "state_update":
    updateProgress(data);                            // Bestandscode
    _collectedFields = data.collected_fields || {};  // Neu: Replace, kein Merge
    renderSmartChipsIfApplicable(data);              // Neu: Trigger
    if (data.is_completable === true) {
        showCompletionUI();
    }
    break;
```

- `_collectedFields` ist eine neue Modul-Variable neben `_lastState` (Z. 1325).
- Replace, nicht Merge: Backend ist die einzige Wahrheit, Frontend spiegelt nur.
- `null`/`undefined`-Werte einzelner Felder bleiben im Bild — falls Wolf das später filtern will, macht das die Konsumfunktion (`renderSmartChips`), nicht der Handler.

### 2.4 Was vom REST-Endpoint bleibt

`GET /api/chat/session/{id}/fields` (Z. 1496) wird weiterhin von `switchToForm()` benutzt — **keine Änderung** an diesem Pfad. Für Smart-Chips ist er irrelevant. Falls Wolf den Endpoint später ohnehin vereinfachen will, kann er auf Basis von `collected_fields` aus `state_update` sogar ganz entfallen, aber das ist ein separates Aufräum-Ticket.

### 2.5 Fazit Abschnitt 2

Collected-Fields sind ab dem ersten `state_update` vollständig verfügbar, ohne Zusatzrequest, ohne Cache-Logik, ohne Invalidierung. Drei Zeilen im bestehenden SSE-Handler reichen. Der Aufwandsposten „Collected-Fields-Cache" aus §4.3 (vor Korrektur: 2 h) schrumpft auf ~15 min.

---

## 3. Injection-Points Bewertung

### 3.1 Kandidaten

Aus der DOM-Hierarchie (`renderChatContainer()` Z. 110–190, vgl. Doc 1 §3) kommen drei Positionen in Betracht. Zur Orientierung — die relevante Teil-Struktur:

```
#chat-container
├── #chatMessages                  (Nachrichten-Log, wächst nach unten, scrollt)
├── #draftChip                     (Geschwister-Element, display:none initial)
└── .chat-input-area               (flex-column, border-top, flex-shrink:0)
    ├── #chatQuickReplies          (Buttons, leer wenn keine QR)
    └── .chat-input-row            (Textarea + Send-Button)
```

| Kandidat | Position | Pro | Contra |
|----------|----------|-----|--------|
| **A:** Zwischen `#chatQuickReplies` und `.chat-input-row` | `.chat-input-area`-Child, Index 1 (neu) | Direkt über der Textarea — maximale visuelle Nähe zum Input, wo der User gerade steht. Persistiert durch `clearQuickReplies()` (Z. 849–853 wipet nur `#chatQuickReplies.innerHTML`, nicht Geschwister). Kein Layout-Shift bei QR-Wipe. | Erfordert neues DOM-Element (kein Container vorhanden). Muss einmalig in `renderChatContainer()` angelegt werden — kleine Änderung. |
| **B:** Als erstes Child in `#chatQuickReplies` (vor den QR-Buttons) | innerhalb existierendem Container | Null neues Markup nötig. QR-Container ist schon adressiert (role="group"). | **Konflikt:** `clearQuickReplies()` (Z. 852) wipet den ganzen Container bei jedem `sendMessage` (Z. 355). Smart-Chips würden bei jedem User-Send verschwinden. Auch `renderQuickReplies` selbst setzt `container.innerHTML = ""` (Z. 582). **Zu fragil.** |
| **C:** Am Ende von `#chatMessages` (nach letzter Assistant-Bubble) | Scrollt mit Nachrichten mit | Gleiche Position wie bereits der `help-trigger` (Z. 799–812, `container.appendChild(helpBtn)`). Bewährtes Muster. | Scrollt nach oben weg, sobald neue Messages kommen — für multi-turn Freitext-Dialoge (Help-Response + Neu-Frage) verlieren die Chips Kontextnähe zum Input. Auch: bei `finishStream` erzeugt `token` neue `streamDiv`s (Z. 443) — Chips bleiben zwar stehen, werden aber begraben. |

### 3.2 Wechselwirkungen mit existierenden UI-Elementen

**Draft-Chip (`#draftChip`) — parallel sichtbar?**

- `#draftChip` ist **Geschwister** von `.chat-input-area` (Z. 134–145, direkt unter `#chatMessages`), nicht Teil davon.
- CSS (`chat-widget.css` Z. 1036–1046): eigener Block, `border: 1px solid #3b82f6`, `.draft-active`-Klasse schaltet Sichtbarkeit.
- **Kandidat A** ist physisch unter dem Draft-Chip — beide können gleichzeitig sichtbar sein, Draft-Chip oben (Wert-Vorschlag), Smart-Chips unten (Suggestion-Alternative). Semantisch aber doppelt: Wenn das Backend einen Draft hat, sind Suggestions redundant. **Regel:** Smart-Chips nicht rendern, solange `#draftChip.draft-active`.
- **Kandidat B/C**: Draft-Chip bleibt davon unberührt, aber B wird eh durch clearQR zerstört.

**Quick-Replies (`#chatQuickReplies`) — Konflikt bei Freitext-Turns?**

- Bei reinem Freitext-Feld (z. B. `strategische_ziele` Freitext-Variante) sendet das Backend **kein** `quick_replies`. Dann ist `#chatQuickReplies` leer (Z. 662 CSS `.chat-quick-replies:empty` — existiert als Selector, vermutlich `display:none`).
- **Kandidat A** koexistiert problemlos: leerer QR-Container oben (kein visueller Platz verbraucht), Smart-Chips darunter.
- Bei **Mischfeldern** (QR + Freitext erlaubt, z. B. Multi-Select mit Confirm-Button) stehen Smart-Chips und QR-Buttons nebeneinander — Gefahr visueller Redundanz. **Regel:** Smart-Chips unterdrücken, solange `#chatQuickReplies` Buttons enthält (außer explizit als ergänzende Freitext-Hilfe gewollt).
- **Skip-Button** (Z. 783–789) wird ebenfalls in `#chatQuickReplies` angehängt — unabhängig von Smart-Chips-Position.

**Help-Trigger (`renderHelpButton`, Z. 796–813) — Position-Konflikt?**

- Wird **in `#chatMessages`** angehängt (Z. 812), direkt nach der letzten Bot-Nachricht. **Nicht** in `.chat-input-area`.
- Triggert erst **nach `done`** (Z. 556 via `renderHelpButtonIfApplicable`). Smart-Chips an **Kandidat A** sind räumlich getrennt — kein Layout-Konflikt.
- Semantisch überlappen sie aber: Help-Button sagt „Was ist gemeint?", Smart-Chips sagen „Hier ist ein Vorschlag". Beides zielt auf denselben User-Zustand (Unsicherheit). **Entscheidung (für Doc 3):** Smart-Chips machen den Help-Button für Felder mit Suggestions obsolet oder ergänzen ihn. Nicht beide gleichzeitig zeigen, sonst Clutter.

### 3.3 Empfehlung — finaler Injection-Point

**Kandidat A: Neues `<div id="chatSmartChips" class="chat-smart-chips">` als Child von `.chat-input-area`, eingefügt zwischen `#chatQuickReplies` (Index 0) und `.chat-input-row` (Index 1).**

**Begründung:**

1. **Robust gegen `clearQuickReplies()`** (Z. 852): Der Wipe trifft nur `#chatQuickReplies.innerHTML`, nicht das neue Geschwisterelement. Smart-Chips überleben User-Sends, solange sie nicht aktiv entfernt werden.
2. **Visuelle Nähe zum Input**: Direkt über der Textarea, wo der User ohnehin hinschaut. Kein „Scrollen nach oben, um Hinweise zu sehen".
3. **Bestehende Flex-Struktur**: `.chat-input-area` ist bereits `flex-direction: column` (CSS Z. 917) — neues Child ordnet sich automatisch korrekt ein.
4. **Koexistenz mit Draft-Chip**: Draft-Chip (Geschwister von `.chat-input-area`) bleibt oben, Smart-Chips unten. Suppression-Regel: Chips nur rendern, wenn kein `#draftChip.draft-active`.
5. **Keine Kollision mit Help-Trigger**: Hilfe sitzt im Message-Log, Smart-Chips im Input-Bereich — zwei verschiedene visuelle Layer.

**CSS-Ankerpunkt:**

- Neuer Selector `.chat-smart-chips` — analog zu `.chat-quick-replies` (CSS Z. 655–662), mit `:empty { display: none }` für automatisches Ausblenden, wenn keine Suggestions da sind.
- `border-top` nicht nötig, da `.chat-input-area` schon einen hat (CSS Z. 916).
- Empfohlen: `padding: 8px 24px 0; display: flex; flex-wrap: wrap; gap: 8px;`

**Event-Lifecycle (korrigiert gegen Live-API):**

| Zeitpunkt | Aktion |
|-----------|--------|
| `handleSSEEvent('state_update', data)` Z. 450 | `_collectedFields = data.collected_fields`. Wenn `data.next_fields[0]` gesetzt und `data.next_fields_meta[field].chat_mode === "textarea"` und kein Draft aktiv (`data.pending_field == null`) und `#chatQuickReplies` leer → Chips rendern aus `_collectedFields` + statischer Suggestion-Map. |
| `handleSSEEvent('draft_value', data)` Z. 467 | Chips unterdrücken/leeren, solange Draft aktiv (`pending_field` gesetzt). |
| `handleSSEEvent('field_confirmed', data)` Z. 479 | Keine explizite Aktion nötig — das folgende `state_update` liefert ohnehin neuen `next_fields[0]` und aktualisiertes `collected_fields`. Alternativ: sofort leeren, wenn `data.field === _lastRenderedField` (reine UX-Kosmetik). |
| `handleSSEEvent('quick_replies', data)` Z. 457 mit non-leerer Liste | Chips leeren (QR-Buttons übernehmen die Führung). Redundant mit `chat_mode === "QR"`, aber als Safety-Net sinnvoll. |
| `sendMessage(...)` Z. 338 | **Nicht** automatisch leeren — Chips sollen über den User-Send hinweg sichtbar bleiben, bis das nächste `state_update` entscheidet. |
| Resume via `checkResume()` Z. 1568 | `updateProgress(sessionData.state)` (Z. 1691) durchläuft denselben Pfad — Chips zeigen sich automatisch, sobald der neue `state_update` kommt. Kein Sonderweg. |

**Kleinste Implementierungs-Fußabdruck (nach Korrektur):** +1 Zeile in `renderChatContainer` (neuer `<div id="chatSmartChips">`), +1 Funktion `renderSmartChips(field, meta, collectedFields)`, +eine Modul-Variable `_collectedFields`, +CSS-Block `.chat-smart-chips`. Keine Cache-Invalidierung, kein Fetch, keine Änderung an `clearQuickReplies`, `renderQuickReplies`, `renderHelpButton`.

---

## 4. Backend-Voraussetzungen & Gesamtbewertung — KORRIGIERT

### 4.1 Backend-Änderungen — nötig, nice-to-have, nicht nötig

**Frontend-only lösbar (keine Backend-Änderung, Live-API liefert alles):**

- **DOM-Container** (Kandidat A aus §3): reine Widget-Änderung in `renderChatContainer()`.
- **Feld-Kontext-Lesen**: `state.next_fields[0]` aus dem ohnehin empfangenen `state_update`.
- **Feld-Typ-Unterscheidung**: `state.next_fields_meta[field].chat_mode` (`"QR"` | `"textarea"`) — keine Heuristik nötig.
- **Collected-Fields-Zugriff**: `state.collected_fields` kommt bei jedem `state_update` mit; einfacher Replace in Modul-Variable `_collectedFields`.
- **Draft-Detection**: `state.pending_field` ist gesetzt, solange Draft schwebt — Chips dann unterdrücken.
- **Suggestion-Daten** (MVP): statische Frontend-Map analog `FIELD_EXAMPLES` (`field_examples_de.js`, bereits geladen in `strategy.html` Z. 1093).
- **Trigger-Logik**: Chips erscheinen bei `state_update`, verschwinden implizit beim nächsten `state_update` (neues `next_fields[0]`).

**Nice-to-have (Backend-Erweiterung wäre Qualitätshebel, aber nicht Voraussetzung):**

- **LLM-generierte Suggestions** pro Turn (aus Kontext vorheriger Antworten) in einem neuen Key `state.next_fields_meta[field].suggestions` oder einem dedizierten SSE-Event `smart_chips`. Stärkster UX-Hebel, aber nicht MVP-kritisch.
- **Kuratierte Suggestions pro Feld × Branche** serverseitig (statt Frontend-Map) für zentrale Pflegbarkeit.

**Entfällt komplett (war in Vor-Korrektur-Version gelistet, jetzt obsolet):**

- `field_label` / `field_type` im `state_update` → via `next_fields_meta` bereits da.
- `collected_fields` im `state_update` → bereits da.
- `GET /api/chat/session/{id}/fields` als Runtime-Quelle → nicht mehr nötig.
- `field_confirmed`-basierter Cache → nicht mehr nötig.

**Absolut nicht nötig:**

- Neuer API-Endpoint.
- Neuer SSE-Event-Typ für MVP.
- Backend-seitige Session-Persistenz für Chip-State.
- Änderungen am Request-Format von `/api/chat/message`.

### 4.2 Wolf's Live-Test-Durchgang — Szenario in 6 Schritten (korrigiert)

**Ausgang:** User klickt QR-Button „Marketing & Werbung" → `sendMessage` (Z. 338) → `POST /api/chat/message`.

1. **Backend empfängt `branche = marketing`.** Interner State wird aktualisiert.
2. **SSE-Stream:** `typing` → `token`-Stream („Alles klar. Was sind Ihre wichtigsten Ziele beim KI-Einsatz?") → **`state_update`** mit u. a.:
   ```json
   {
     "collected_fields": {"branche": "marketing"},
     "next_fields": ["strategische_ziele", "hauptleistung", "…"],
     "next_fields_meta": {"strategische_ziele": {"chat_mode": "textarea"}},
     "pending_field": null
   }
   ```
   → `done`.
3. **`state_update`-Handler** (Z. 450): `_collectedFields = {branche: "marketing"}`; `field = "strategische_ziele"`; `mode = "textarea"`; `pending_field == null` → Suppression-Checks negativ → `renderSmartChipsIfApplicable()` aufgerufen.
4. **Chip-Auswahl:** Lookup in statischer Map `SMART_CHIPS["strategische_ziele"]["marketing"]` → z. B. `["Leads generieren", "Content-Produktion skalieren", "Personalisierung verbessern", "Marketing-Automation ausbauen"]`. Injection in `#chatSmartChips` (neuer Geschwister-Div in `.chat-input-area`).
5. **User klickt „Leads generieren"** → Text wird in `#chatInput` **angehängt**, Fokus in Textarea, Chip bekommt `.selected`-Klasse. User ergänzt frei („…vor allem für B2B") und drückt Enter. `sendMessage` schickt Gesamttext. Chips bleiben sichtbar.
6. **Backend bestätigt** (mit oder ohne `field_confirmed`, egal): Das nächste `state_update` hat `collected_fields = {branche, strategische_ziele}` und `next_fields[0] = "hauptleistung"` → Handler leert Chips für alten Kontext, rendert neue für `hauptleistung`. Kein separater Cache-Pflege-Code nötig.

**Kein offener Klärungspunkt.** Die Annahme, dass Backend einen Feld-Kontext im `state_update` sendet, ist durch den Live-Test bestätigt (27 Keys, inkl. `next_fields`, `next_fields_meta`, `collected_fields`).

### 4.3 Gesamtbewertung

**✅ Machbar frontend-only? — Ja, ohne Einschränkung.**

Die Live-API liefert alle drei Kernbausteine (Feld-Kontext, Feld-Typ, Collected-Fields) direkt im `state_update`. Suggestion-Inhalte starten als statische Map (später Backend-seitig). Kein Blocker, kein Klärungspunkt.

**Aufwandsschätzung (Frontend, MVP — nach Korrektur):**

| Position | Stunden (vorher) | Stunden (korrigiert) | Delta |
|----------|------------------|----------------------|-------|
| DOM-Container + CSS | 1 | 1 | — |
| `renderSmartChips()` + Click-Handler + Suppression-Regeln | 2 | 2 | — |
| Collected-Fields-Handling | 2 | **0.25** | −1.75 (nur Replace statt Cache) |
| Statische Suggestion-Map (3 Felder × 4 Branchen, je 3–5 Suggestions) | 3 | 2 | −1 (kleinerer MVP-Scope) |
| Smoke-Tests (manuell, 3 Browser) | 1 | 1 | — |
| Dokumentation inline + README | 1 | 1 | — |
| **Summe MVP** | **~10 h** | **~7–8 h** | **−2 bis −3 h** |

Optional Backend-Integration (Server-seitige Suggestions statt Frontend-Map): +4–6 h, separat zu planen.

**Top-3-Risiken (aktualisiert):**

1. **`next_fields` fehlt/leer.** Hauptsächlich am Ende der Session (Summary-/Complete-Phase) und in seltenen Template-Turns. Mitigation: defensiver Check `next_fields[0]` auf `null/undefined`, Chips stumm.
2. **Semantische Doppelungen** mit Help-Button und Draft-Chip. Mitigation: strikte Suppression-Regeln (§3.3) bleiben unverändert — `pending_field` ist jetzt die Quelle für Draft-Erkennung, kein Polling am `#draftChip`-DOM nötig.
3. **Pflegeaufwand statischer Map.** Gleicher Punkt wie vorher, aber mit kleinerem Start-Scope (Top-3-Felder × Top-4-Branchen) überschaubar. Plan B: Backend-LLM-Generation.

**Empfehlung für Sprint C1: GO — keine Vor-Klärung mehr nötig.**

Live-API-Test ist beantwortet, Backend-Vertrag ist klar, alle Datenquellen sind verifiziert. MVP ~7–8 h reines Frontend. Nächster Schritt: Dokument 3 (Konzept) auf korrigierter Basis fertigstellen, dann Sprint-Planung.

---

## Appendix: API-Live-Test (beantwortet)

**Test erfolgreich durchgeführt** in der Parent-Session (außerhalb dieser Sandbox, mit `--retry 3` und `sleep 5` zwischen Calls gegen gelegentliche 503s).

- **Test-Session-ID:** `734e4396-02fb-4ed0-ace3-c12430d519ef`
- **Verifizierte 27 Keys in `state_update`:**
  `session_id`, `report_type`, `status`, `current_section`, `current_section_name`, `total_sections`, `progress_percent`, `collected_fields`, `collected_count`, `missing_required`, `missing_optional`, `total_fields`, `next_fields`, `next_fields_meta`, `is_completable`, `pending_field`, `pending_value`, `dialog_mode`, `edit_mode`, `conversation_phase`, `selected_blocks`, `completed_blocks`, `current_block`, `unsurveyed_note`, `block_label`, `block_progress`, `block_total`, `quick_replies`.
- **`current_field` ist NICHT in dieser Liste.** Widget-Code Z. 778 und Z. 818 lesen `_lastState.current_field`, bekommen aber `undefined`; ihre defensiven Guards (`if (!fieldName) return;`) greifen, der Code-Pfad ist still.
- **`collected_fields` bestätigt:** Nach Branche-Confirmation `{"branche": "marketing"}` — genau das Format, das Smart-Chips brauchen.
- **`next_fields_meta[field].chat_mode` bestätigt:** Liefert `"QR"` oder `"textarea"` — erlaubt Feld-Typ-Entscheidung ohne Heuristik.

**Konsequenz für diese Analyse:**

- §1, §2, §4 wurden nach dieser Korrektur überarbeitet (siehe Commits auf dem Branch).
- Der in der Vorversion dokumentierte „Sandbox-blockt-curl"-Befund gilt weiterhin für diese Analyse-Umgebung, ist aber obsolet, weil der Test außerhalb gelaufen ist.

**Sandbox-Notiz (bleibt zur Dokumentation):** Die Code-Analyse-Umgebung hat keinen direkten Zugriff auf `api-ki-backend-neu-production.up.railway.app` (`POST` → „Host not in allowlist"; `GET /` → 403). Für zukünftige API-Tests aus einer Claude-Code-Analyse-Session heraus ist eine manuelle Ausführung aus Wolf's lokaler Umgebung der zuverlässige Weg.
