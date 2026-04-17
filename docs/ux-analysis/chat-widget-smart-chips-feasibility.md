# Chat-Widget Smart-Chips — Feasibility

Kontextuelle Suggestion-Chips bei Freitext-Fragen im Chat.
Analyse basiert ausschließlich auf Code-Evidenz aus `chat-widget.js` (1766 Zeilen).

---

## 1. Feld-Kontext-Erkennung

### 1.1 In welchen SSE-Events wird `_lastState.current_field` gesetzt/überschrieben?

**Einzige Schreibstelle im Widget:** `_lastState = state;` in `updateProgress()` **Zeile 1379**.

`updateProgress()` wird ausschließlich von **einem** SSE-Handler aufgerufen:

```js
// Zeile 450–455
case "state_update":
    updateProgress(data);
    if (data.is_completable === true) {
        showCompletionUI();
    }
    break;
```

**Konsequenzen:**

- `_lastState` und damit `current_field` werden **nur** bei `state_update`-Events aktualisiert.
- `_lastState = state` ist ein **kompletter Überschreibungs-Replace** (keine Merge-Logik). Sendet das Backend einen `state_update` **ohne** `current_field`, wird der vorher gesetzte Wert vernichtet — `_lastState.current_field` wird dann `undefined`.
- Kein anderes Event (`token`, `quick_replies`, `preview_qr`, `draft_value`, `field_confirmed`, `dialog_mode`, `done`, `error`) berührt `_lastState` oder `current_field`.
- Es gibt **keine Initial-Belegung** — vor dem ersten `state_update` in einer Session ist `_lastState = null` (Zeile 1325). Grep-Beleg: nur zwei Treffer für `_lastState =` — Zeile 1325 (Init auf `null`) und Zeile 1379 (Überschreibung).

### 1.2 Ist der Wert beim Textarea-Rendering zuverlässig verfügbar?

**Die Textarea (`#chatInput`) wird genau einmal gerendert** — in `renderChatContainer()` Zeile 149, vor dem allerersten Backend-Call. Zu diesem Zeitpunkt ist `_lastState = null`. Die Textarea ist also danach statisch und wird nie neu gerendert — der Wert von `_lastState.current_field` ist also **nicht an den Textarea-Lifecycle gekoppelt**.

**Relevanter Zeitpunkt für Smart-Chips:** Das „Rendering" für Smart-Chips wäre kein Textarea-Event, sondern ein Turn-Event. Dafür gibt es zwei natürliche Trigger:

| Trigger | Zuverlässigkeit `current_field` |
|---------|---------------------------------|
| Direkt im `state_update`-Handler (Z. 450) | **Maximal** — `data.current_field` wurde gerade empfangen; `_lastState` ist gerade erst gesetzt. |
| Nach `done` in `finishStream()` (Z. 503) — analog zu `renderHelpButtonIfApplicable()` Z. 556 | **Mittel** — `_lastState` stammt vom vorigen `state_update` im selben Turn. `renderHelpButtonIfApplicable()` (Z. 816–821) zeigt, dass das Widget dieses Muster heute schon vertrauenswürdig nutzt: `if (!_lastState) return; var fieldName = _lastState.current_field; if (!fieldName) return;` |

**Faustregel aus dem Code:** Nach `done` ist `_lastState.current_field` im Regelfall verfügbar — aber der Help-Button-Code verteidigt sich defensiv gegen `null` und `undefined`. Gleiche Defensive muss jeder Smart-Chips-Hook übernehmen.

### 1.3 Bekannte Race-Conditions / Edge-Cases

Der SSE-Parser (Zeile 388–426) ist **strikt sequentiell**: Zeilen werden per `\n`-Split verarbeitet, jeder `data:`-Chunk triggert **synchron** `handleSSEEvent()`. Keine parallele Ausführung. Dennoch existieren folgende relevante Fälle:

**(a) `state_update` nach `token`, nicht davor.** Die Reihenfolge pro Turn ist laut Handler-Code üblicherweise `typing → token* → state_update → quick_replies|preview_qr → done` (vgl. Doc 1 Abschnitt 7). Während die Token-Streams laufen, zeigt `_lastState` also noch den **vorigen** Feld-Kontext. Smart-Chips, die auf `token` reagieren, würden das falsche Feld adressieren. ⇒ **Zwingend auf `state_update` oder `done` reagieren, nie auf `token`.**

**(b) `state_update` ohne `current_field`.** Das Widget prüft defensiv (Z. 778, 818), aber das Überschreibungs-Replace bei Zeile 1379 löscht einen vorher gültigen Wert. Beispiel: Backend sendet Progress-Update (`state_update { progress_percent: 80 }`), `current_field` fehlt — Smart-Chips-Logik bekommt `undefined` zurück, obwohl das Feld noch offen ist. ⇒ **Frontend sollte den letzten bekannten `current_field`-Wert separat persistieren** (z. B. `_lastKnownField`), nicht blind aus `_lastState` lesen.

**(c) `clearQuickReplies()` bei jedem `sendMessage()` (Z. 355).** Vor jedem User-Send wird der QR-Container geleert. `_lastState` bleibt zwar bestehen, aber UI-Elemente an gleicher Stelle werden weggewischt. Smart-Chips, die im QR-Container liegen, würden automatisch mit entfernt. ⇒ **Injection-Point sollte außerhalb `#chatQuickReplies` liegen** oder aktiv vor `clearQuickReplies` geschützt werden.

**(d) Page-Reload.** `_lastState` ist nur im Modul-Scope (Z. 1325), kein localStorage. Nach Reload ist `_lastState = null`, bis das nächste `state_update` kommt. Bei Resume (Zeile 1567+) wird ein neuer `/api/chat/message`-Turn angestoßen — erst dessen `state_update` befüllt `_lastState` neu. **Im Resume-Zwischenfenster** (bis erste Backend-Antwort da ist) wären Smart-Chips blind. ⇒ **Akzeptabel, solange Smart-Chips nur NACH einem `state_update` erscheinen, nicht bei Initial-Render.**

**(e) Template-Turns.** In `finishStream()` (Z. 509–512) erzeugt das Widget einen Message-Container nachträglich, wenn kein einziges `token`-Event kam. Das heißt: Manche Turns senden **nur** `done` (+ ggf. `quick_replies`), ohne `state_update`. In solchen Turns bleibt `_lastState` auf dem Stand des vorigen Turns. Nicht schlimm, aber das Smart-Chips-Event-Design darf nicht annehmen, dass pro Turn immer ein `state_update` kommt.

### 1.4 Fazit Abschnitt 1

`_lastState.current_field` ist eine **vertrauenswürdige, aber nicht monoton wachsende** Quelle. Das Widget nutzt sie bereits produktiv für `renderHelpButtonIfApplicable()` (Z. 816–821) und `renderSkipButtonIfOptional()` (Z. 778) — Smart-Chips können dieselbe Quelle verwenden, müssen aber:

1. ausschließlich auf `state_update` oder `done` reagieren (nie `token`),
2. einen **zusätzlichen** `_lastKnownField`-Cache halten, um gegen Replace-Overwrites in (b) abgesichert zu sein,
3. außerhalb von `#chatQuickReplies` injiziert werden, um `clearQuickReplies()`-Wipes zu überleben.

**Wolf's Live-Test-Prüfstein:** Beim Turn, der die Frage „Was sind Ihre wichtigsten Ziele beim KI-Einsatz?" erzeugt, sendet das Backend mit sehr hoher Wahrscheinlichkeit einen `state_update` mit `current_field: "strategische_ziele"` (oder ähnlich) — das ist die implizite Annahme, auf der `renderHelpButton` heute schon für genau dieses Feld funktioniert. Technisch also **ja, Feld-Kontext ist verfügbar** — sofern das Backend den Vertrag einhält. Das ist **zu verifizieren** (Backend-Code oder DevTools-Netzwerkpanel), nicht zu annehmen.

---

## 2. Collected-Fields-Verfügbarkeit

### 2.1 Wie funktioniert `GET /api/chat/session/{id}/fields` heute?

**Einziger Caller im Widget:** `switchToForm()` Zeile 1496.

```js
// Zeile 1495–1514
fetch(getApiBase() + "/api/chat/session/" + sessionId + "/fields", {
    headers: getAuthHeaders(),
    credentials: "include"
})
.then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
})
.then(function(data) {
    if (data.fields && Object.keys(data.fields).length > 0) {
        prefillForm(data.fields);
    }
    showFormView();
})
.catch(function(err) {
    console.error("Field fetch failed:", err);
    // Still switch to form, just without prefill
    showFormView();
});
```

**Response-Format (aus Zugriffsmuster Zeile 1505 + `prefillForm` Zeile 1523–1551):**

```json
{ "fields": { "<field_name>": <value>, ... } }
```

- Flach, keine Metadaten (kein Feld-Typ, kein Label, kein Zeitstempel).
- Werte können beliebige Typen sein — `prefillForm` überträgt per `existing[key] = fields[key]` in `localStorage["autosave_form_data"]` (Zeile 1534).
- Filter `fields[key] != null` (Zeile 1533) — `null` wird ignoriert; `""`, `0`, `false` **werden übernommen**.

**Fehlerbehandlung:**

- Kein `sessionId` → Endpoint gar nicht aufgerufen, Fallback auf `showFormView()` ohne Prefill (Zeile 1484–1486).
- HTTP-Fehler → `throw`, `catch` loggt, zeigt Formular trotzdem (Zeile 1510–1513). **Kein Retry**, kein User-Feedback außer Konsole.
- Leere Response (`data.fields` fehlt/leer) → still kein Prefill, Form öffnet trotzdem (Zeile 1505 guard).

**Nicht implementiert:** Caching, Stale-Check, Timeout, Abort, Auth-Refresh-Flow. Der Endpoint wird genau einmal pro Switch konsumiert.

### 2.2 Schickt das Backend `collected_fields` bereits im `state_update`?

**Grep-Befund (gesamtes `chat-widget.js`):** Keine einzige Stelle liest `data.collected_fields`, `data.answers`, `data.fields_map` oder Ähnliches aus einem SSE-Event. Einziger Lesezugriff auf `data.fields` ist Zeile 1505 im Kontext des `/fields`-REST-Endpoints — **nicht** im SSE-Handler.

**Alle bekannten `_lastState`-Felder** (Doc 1 Abschnitt 2.5): `conversation_phase`, `current_field`, `current_block`, `current_section(_name)`, `total_sections`, `block_progress`, `block_total`, `block_label`, `progress_percent`, `is_completable`, `missing_optional`, `unsurveyed_note`, `pending_field/value/label`. Kein Feld für bereits beantwortete Werte.

**Indirekter Hinweis:** `pending_field` / `pending_value` / `pending_label` (Zeile 1718–1723) zeigen, dass das Backend feld-wertige Daten **in** `state` verpacken kann — aber nur für **einen** schwebenden Draft, nicht für die volle Collected-Map. Das ist ein Muster, kein Vollbild.

**Fazit:** Keine Code-Evidenz, dass das Backend bereits collected_fields über `state_update` liefert. Ob der Server es **könnte** (technisch), lässt sich aus dem Frontend allein **nicht** beantworten — muss backend-seitig geprüft werden (`/api/chat/message` SSE-Response im DevTools Netzwerk-Panel, oder Backend-Code `conversation_state`-Builder).

### 2.3 Falls Backend NICHT erweitert wird: Polling von `/fields`

**Wann bräuchten Smart-Chips frische Collected-Fields?**

- Beim Turn-Beginn eines Freitextfelds, um Suggestions aus Nachbarfeldern zu ziehen (z. B. `strategische_ziele` soll an `hauptleistung` und `zielgruppen` andocken).
- **Nicht** während des Streaming — die Suggestions sind feld-gebunden, nicht token-gebunden.

**Minimale Polling-Frequenz:** Genau **einmal pro Turn**, ausgelöst durch den `state_update`-Handler (Zeile 450), wenn `current_field` ein neues Freitext-Feld adressiert. Pseudo-Rhythmus pro Session (10–15 Min, ~25 Felder):

| Turn-Typ | Polling nötig? |
|----------|----------------|
| QR-Auswahl (z. B. Branche) | Nein — Smart-Chips greifen nur bei Freitext |
| Freitext-Frage (z. B. `hauptleistung`) | Ja — 1 Request |
| Summary/Checkpoint | Nein |

**Volumen-Abschätzung:** ~8–12 Freitext-Felder pro Session → 8–12 zusätzliche `GET /fields`-Requests. Response-Größe: alle bisherigen Felder (≤~5 kB JSON). Kein komplexer Aufruf — dedizierter Endpoint, vermutlich read-only Redis/Postgres.

**Performance:** Unkritisch pro User. Serverseitig je nach Backend-Implementierung (Caching vorhanden?) eventuell relevant bei hohem Parallel-Traffic. Aus Frontend-Sicht: zusätzlicher Round-Trip **nach** `state_update`, aber **vor** dem User die Eingabe macht — kein UI-Blocker, solange die Smart-Chips nachgezogen werden (erst ohne Suggestions rendern, dann nach Response auffüllen).

**UX-Impact:**

- (+) Smart-Chips bleiben „always fresh" — sofort sichtbar: „Du hast IT als Branche gewählt, hier sind IT-typische Ziele…"
- (−) Zusätzliche Latenz (~100–300 ms je nach Netz/Backend). Nicht blockierend, aber Chips „poppen" ggf. nach der Frage auf.
- (−) Duplikate: Gleiche Daten werden pro Turn neu geladen, obwohl sie sich selten ändern. Lösbar via Frontend-Cache (`_fieldsCache = data.fields` + Invalidierung bei `field_confirmed`-Event Z. 479).

**Alternative ohne Polling:** `field_confirmed`-Event (Z. 479) trägt `{field, value}`. Ein lokaler Cache könnte daraus `_collectedFields` inkrementell aufbauen — **ohne** jeden REST-Call. Guter Plan-B, aber braucht Backend-Verifikation, dass `field_confirmed` für **jede** bestätigte Feld-Speicherung feuert (nicht nur bei Draft-Confirm).

### 2.4 Fazit Abschnitt 2

- Endpoint funktioniert, aber heute nur für Form-Switch. Die Struktur `{fields: {...}}` reicht für Smart-Chips aus.
- Kein Code-Hinweis, dass `state_update` bereits collected_fields mitsendet.
- **Pragmatische Empfehlung** (Details in Abschnitt 4): Frontend baut sich einen **inkrementellen Cache** aus `field_confirmed`-Events auf und **ergänzt ihn** bei `state_update` mit einem `/fields`-Fetch, falls der Cache leer ist (z. B. bei Resume). Das vermeidet Polling pro Turn und hält Backend-Änderungen minimal.

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

**Event-Lifecycle:**

| Zeitpunkt | Aktion |
|-----------|--------|
| `handleSSEEvent('state_update', data)` Z. 450 | Wenn `data.current_field` ein Freitext-Feld ist und kein Draft aktiv und `#chatQuickReplies` leer bleibt → Chips rendern (Daten aus inkrementellem Cache + evtl. `/fields`-Fetch bei leerem Cache). |
| `handleSSEEvent('draft_value', data)` Z. 467 | Chips unterdrücken/leeren, solange Draft aktiv. |
| `handleSSEEvent('field_confirmed', data)` Z. 479 | Chips für aktuelles Feld leeren (Antwort ist eingetütet). Cache mit `data.field → data.value` aktualisieren. |
| `handleSSEEvent('quick_replies', data)` Z. 457 mit non-leerer Liste | Chips leeren (QR-Buttons übernehmen die Führung). |
| `sendMessage(...)` Z. 338 | **Nicht** automatisch leeren (Chips sollen über User-Send hinweg sichtbar bleiben, solange Feld offen). Backend entscheidet via `state_update`/`field_confirmed`, wann Schluss ist. |
| Resume via `checkResume()` Z. 1568 | Nach `updateProgress(sessionData.state)` (Z. 1691): Falls `state.current_field` ein Freitext-Feld ist, Chips nachladen (Fallback-`/fields`-Fetch). |

**Kleinste Implementierungs-Fußabdruck:** +1 Zeile in `renderChatContainer` (neuer `<div id="chatSmartChips">`), +1 Funktion `renderSmartChips(fieldName, suggestions)`, +ein Cache `_collectedFields`, +CSS-Block `.chat-smart-chips`. Keine Änderung an `clearQuickReplies`, `renderQuickReplies`, `renderHelpButton` nötig.

---

## 4. Backend-Voraussetzungen & Gesamtbewertung

### 4.1 Backend-Änderungen — nötig, nice-to-have, nicht nötig

**Frontend-only lösbar (kein Backend-Change):**

- **DOM-Container** (Kandidat A aus §3): reine Widget-Änderung in `renderChatContainer()`.
- **Feld-Kontext-Lesen**: `_lastState.current_field` existiert bereits (Z. 778, 818).
- **Collected-Fields-Cache**: aus bestehenden Events aufbaubar — `field_confirmed` (Z. 479) trägt `{field, value}`, bei leerem Cache Fallback auf `GET /api/chat/session/{id}/fields` (Z. 1496, bereits etabliert).
- **Suggestion-Daten** (Fallback): eine statische Map im Frontend (pro Feld + pro Branche) reicht für einen MVP. Analog zu `window.FIELD_EXAMPLES` im Formular (`field_examples_de.js`, 119 kB, bereits geladen in `strategy.html` Z. 1093).
- **Trigger-Logik**: Chips erscheinen bei `state_update`, verschwinden bei `field_confirmed`/`draft_value`/non-leerem `quick_replies`. Alles ohne Backend-Contract-Änderung.

**Nice-to-have (Backend-Erweiterung verbessert, aber nicht Voraussetzung):**

- `field_type` in `state_update` (z. B. `"freetext"|"single_select"|"multi_select"`) → Frontend kann sicher unterscheiden, ob Chips überhaupt passen. Heute muss das Frontend heuristisch ableiten („keine `quick_replies` + `current_field` gesetzt → Freitext").
- `field_label` in `state_update` → Gleicher Wortlaut wie Bot-Frage, ermöglicht Chip-Gruppen-Überschrift ohne Message-Parsing.
- **LLM-generierte Suggestions** pro Turn (z. B. aus Kontext vorheriger Antworten) in einem neuen SSE-Event `smart_chips` oder Feld `state.suggestions`. Stärkster UX-Hebel, aber nicht MVP-kritisch.
- `collected_fields` direkt im `state_update` → spart den `/fields`-Polling-Fallback.

**Absolut nicht nötig:**

- Neuer API-Endpoint. `/api/chat/session/{id}/fields` ist ausreichend.
- Neuer SSE-Event-Typ für MVP. Vorhandene Events (`state_update`, `field_confirmed`) reichen.
- Backend-seitige Session-Persistenz für Chip-State. Der Cache darf flüchtig sein.
- Änderungen an `/api/chat/message`-Request-Format.

### 4.2 Wolf's Live-Test-Durchgang — Szenario in 7 Schritten

**Ausgang:** User hat gerade QR-Button „Marketing & Werbung" geklickt. Payload aus `handleQuickReply` (Z. 712–714) → `sendMessage` (Z. 338) → `POST /api/chat/message`.

1. **Backend empfängt Antwort** für `branche`. Interner State wird fortgeschrieben.
2. **SSE-Stream beginnt.** Backend sendet `typing` → `token`-Stream („Alles klar. Was sind Ihre wichtigsten Ziele beim KI-Einsatz?") → `state_update { current_field: "strategische_ziele", conversation_phase: "phase_1b", ... }` → `done`. Das Feld hat **keine** `quick_replies` bei reiner Freitext-Variante, also kein QR-Event.
3. **`state_update`-Handler** (Z. 450) ruft `updateProgress(data)` (Z. 1376). `_lastState.current_field = "strategische_ziele"`. **Neue Logik**: `renderSmartChipsIfApplicable()` prüft: Feld freitext-tauglich? Kein Draft aktiv? QR-Container leer? → alle drei zutreffend → Chips rendern.
4. **Chip-Daten-Quelle**: Frontend-Cache `_collectedFields` enthält `{branche: "marketing"}` (aus `field_confirmed`-Event für `branche`, oder fallback `/fields`-Fetch). Cache wird gegen eine **statische Suggestion-Map** `SMART_CHIPS["strategische_ziele"]["marketing"]` konsultiert (Frontend-only, analog `FIELD_EXAMPLES`). Ergebnis z. B. `["Leads generieren", "Content-Produktion skalieren", "Personalisierung verbessern", "Marketing-Automation ausbauen"]`.
5. **DOM-Injection** in `#chatSmartChips` (neues Geschwister in `.chat-input-area`). Jeder Chip ist ein `<button class="smart-chip" data-value="...">`. Click-Handler: fügt Text in `#chatInput` ein (append, nicht replace), fokussiert Textarea, markiert Chip als `selected`.
6. **User klickt Chip „Leads generieren"** → Text erscheint in Textarea. User kann frei weitertippen („…vor allem für B2B") und drückt Enter. `sendMessage` schickt den Gesamttext. Chips bleiben sichtbar (nicht via `clearQuickReplies` betroffen), solange Feld offen.
7. **Backend bestätigt** das Feld: SSE `field_confirmed { field: "strategische_ziele", value: ... }` → Handler leert `#chatSmartChips`, schreibt in Cache. Beim nächsten `state_update` mit anderem `current_field` startet der Zyklus erneut.

**Kritische Annahme (zu verifizieren):** Schritt 2 setzt voraus, dass das Backend tatsächlich `current_field: "strategische_ziele"` in `state_update` sendet. Evidenz dafür: `renderHelpButtonIfApplicable` (Z. 816–821) funktioniert heute für genau dieses Feld, basiert auf derselben Quelle — ergo: Annahme belastbar, aber DevTools-Check vor Sprint-Start empfohlen.

### 4.3 Gesamtbewertung

**✅ Machbar frontend-only? — Ja, für MVP.**

Begründung: Alle drei Kernkomponenten (Feld-Kontext, Collected-Fields-Zugriff, DOM-Injection) sind heute im Widget- oder API-Code verfügbar. Die Suggestion-Inhalte selbst können als statische Map gepflegt werden (wie `FIELD_EXAMPLES`), bis Backend-LLM-Generation nachzieht. Kein Backend-Blocker. Nice-to-haves (§4.1) verbessern Qualität, sind nicht Voraussetzung.

**Aufwandsschätzung (Frontend, MVP):**

| Position | Stunden |
|----------|---------|
| DOM-Container + CSS | 1 |
| `renderSmartChips()` + Click-Handler + Suppression-Regeln | 2 |
| Collected-Fields-Cache (`field_confirmed`-Listener + `/fields`-Fallback bei Resume) | 2 |
| Statische Suggestion-Map (initial 6–8 Felder × 4 Branchen, je 3–5 Suggestions) | 3 |
| Smoke-Tests (manuell, 3 Browser, Wolf's Live-Szenario) | 1 |
| Dokumentation inline + README-Update | 1 |
| **Summe MVP** | **~10 h** |

Optional Backend-Integration (`smart_chips`-Event + Server-seitige Suggestion-Generierung): +6–10 h, separat zu planen.

**Top-3-Risiken:**

1. **Backend-Vertrag nicht eingehalten**: `state_update` sendet bei manchem Turn kein `current_field` (Race-Case §1.3-b). Mitigation: zusätzlicher `_lastKnownField`-Cache, defensives Read-Through-Pattern wie `renderHelpButtonIfApplicable`.
2. **Semantische Doppelungen**: Smart-Chips überlappen mit Help-Button, Draft-Chip, existierenden QR. Mitigation: strikte Suppression-Regeln (§3.3 Lifecycle-Tabelle), keine Parallelanzeige mit Draft oder QR.
3. **Pflegeaufwand statischer Map**: 6–8 Freitext-Felder × 4–8 Branchen × R1+R2 = schnell 100+ Einträge. Mitigation: Start mit Top-3-Feldern (`strategische_ziele`, `hauptleistung`, `vision_3_jahre`) × Top-4-Branchen. Später Backend-LLM-Generation als Plan B.

**Empfehlung für Sprint C1: GO mit einem Klärungspunkt.**

Der MVP ist frontend-only umsetzbar, ~10 h Aufwand, keine Backend-Blocker. **Vor Sprint-Start** sollte Wolf per DevTools-Netzwerk-Panel verifizieren (2 min Aufwand): Sendet das Backend in dem Turn, der die Frage „Was sind Ihre wichtigsten Ziele…?" auslöst, tatsächlich ein `state_update` mit `current_field: "strategische_ziele"` (oder einem äquivalenten Feldnamen)? Wenn ja: GO. Wenn nein: kleine Backend-Anpassung vorschalten, bevor Frontend-Arbeit startet.

---

## Appendix: API-Live-Test (Klärungspunkt)

**Geplanter Test (2026-04-17):** Session via `POST /api/chat/start` anlegen, Branche `marketing` bestätigen, SSE-Stream mitschneiden, auf `event: state_update` mit `current_field` prüfen (speziell beim Übergang zu einem Freitext-Feld).

**Ergebnis in dieser Session: nicht durchgeführt.** Die Analyse-Umgebung blockt ausgehende Requests an `api-ki-backend-neu-production.up.railway.app`:

- `POST /api/chat/start` → sandbox-seitiger Allowlist-Stop (`Host not in allowlist`).
- `GET /` (Sanity-Check) → 403 vom Server (origin-level), bestätigt Erreichbarkeit, aber nicht Autorisierung.

**Konsequenz:** Der Klärungspunkt aus §4.3 bleibt **offen** und muss außerhalb dieser Sandbox verifiziert werden. Zwei gleichwertige Wege:

1. **DevTools im Browser** (empfohlen, 2 min): `strategy.html` → Chat-Modus starten → Branche auswählen → Network-Tab → `/api/chat/message`-Response → SSE-Frames sichten.
2. **curl aus Wolf's lokaler Umgebung** mit dem ursprünglich vorgeschlagenen Kommando — gleicher Test, aber außerhalb dieser Sandbox.

Bis dieser Check läuft, bleibt die Empfehlung „GO mit Klärungspunkt" unverändert. Die Frontend-Arbeit selbst kann parallel beginnen, weil die Suppression-Regeln (§3.3) sie robust gegen fehlendes `current_field` machen — im Worst Case rendern Chips einfach nicht, und das System verhält sich wie heute.
