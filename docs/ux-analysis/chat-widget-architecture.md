# Chat-Widget-Architektur — Ist-Zustand

**Datei:** `chat-widget.js` (1766 Zeilen, IIFE-wrapped, strict mode, ES5)
**Einbindung:** `strategy.html` Zeile 1092 `<script src="/chat-widget.js"></script>`
**Public-API:** `window.initChat = initChat;` (Zeile 1748)
**Analysedatum:** 2026-04-17

---

## 1. Datei-Struktur (Haupt-Funktionen mit Zeilenankern)

Die gesamte Datei ist eine einzige IIFE `(function() { "use strict"; ... })()` ab Zeile 5.

| Bereich | Zeilen | Haupt-Funktionen |
|---------|--------|------------------|
| State-Variablen | 8–13 | `chatState = {sessionId, messages, isStreaming}` |
| Konstanten | 16–31 | `BLOCK_LABELS`, `BLOCK_TIME_ESTIMATES`, `SUMMARY_MARKER` |
| API-Helpers | 34–55 | `getApiBase()`, `getAuthHeaders()` |
| Mode-Selector | 58–107 | `renderModeSelector()`, `startChatMode()`, `startFormMode()` |
| Container-Rendering | 110–190 | `renderChatContainer()` |
| Init | 193–241 | `initChat()` — POST `/api/chat/start` |
| Message-Rendering | 244–280 | `appendMessage()`, `formatMessageContent()` |
| Typing-Indikator | 283–321 | `showTypingIndicator()`, `hideTypingIndicator()` |
| Send + SSE | 338–570 | `sendMessage()`, SSE-Stream-Reader, `handleSSEEvent()` |
| Quick-Replies | 572–772 | `renderQuickReplies()` |
| Skip-Button | 774–791 | `renderSkipButtonIfOptional()` |
| Help-Button | 793–821 | `renderHelpButton()` + `SIMPLE_FIELDS` |
| Draft-Chip | 868–1072 | `handleDraftValue()`, `confirmDraft()`, `editDraft()` |
| Summary-Cards | 1074–1197 | `parseSummary()`, `renderSummaryCards()` |
| Edit-Mode | 1200–1285 | `renderEditMode()` |
| Progress + Phase | 1324–1435 | `_lastState`, `updateProgress()`, `updateBlockProgress()` |
| Completion-UI | 1437–1488 | `showCompletionUI()` |
| Form-Switch | 1490–1565 | `switchToForm()` → `/api/chat/session/{id}/fields` → `prefillForm()` |
| Resume | 1567–1730 | `checkResume()` |
| Init-Hook | 1751–1765 | DOMContentLoaded → `init()` |

**SSE-Dispatch** sitzt in `handleSSEEvent()` Zeilen 429–501. Event-Typen: `heartbeat`, `typing`, `token`, `state_update`, `quick_replies`, `preview_qr`, `draft_value`, `field_confirmed`, `dialog_mode`, `done`, `report_started`, `error`.

---

## 2. State-Management

### 2.1 `session_id`

- **Primärer Ort:** `chatState.sessionId` (Zeile 10, gesetzt bei `initChat`-Response Zeile 220).
- **Persistenz:** `localStorage["chat_session_id"]` (Zeile 231) — für Resume.
- **Resume-Restore:** `chatState.sessionId = stored;` (Zeile 1598 via `checkResume`).
- **Verwendung:** Jeder `/api/chat/*`-Request trägt `session_id` im Body oder Path.

### 2.2 `report_type`

- **Nicht im `chatState`.** Wird zur `initChat`-Zeit aus `document.body.dataset.reportType` gelesen und **nur** als Request-Payload an `/api/chat/start` geschickt (Zeile 209).
- **Zur Laufzeit nicht abrufbar** aus Widget-Sicht — muss erneut aus `document.body.dataset.reportType` gelesen werden.
- **Folge:** Der Chat selbst unterscheidet R1/R2 intern nicht — diese Differenzierung liegt serverseitig.

### 2.3 `current_field`

- **Primärer Ort:** `_lastState.current_field` (Module-Variable `_lastState` deklariert Zeile 1325).
- **Befüllung:** Jeder `state_update`-Event überschreibt `_lastState = state;` (Zeile 1379 in `updateProgress`).
- **Lesezugriffe im Widget:**
  - Zeile 778: `renderSkipButtonIfOptional` fallback `fieldName || _lastState.current_field`
  - Zeile 818: `renderHelpButton` liest `_lastState.current_field`
- **Format:** String-Feldname wie `"strategische_ziele"`, `"hauptleistung"` — kein offizielles Schema im Widget-Code; implizit über Backend-Vertrag.
- **Wichtig:** Nicht in `chatState`, nicht in localStorage — nur im Modul-Scope, verloren bei Page-Reload bis zum nächsten `state_update`.

### 2.4 `collected_fields`

- **Nicht im Widget-State gespeichert.** Weder in `chatState`, noch in `_lastState`, noch in localStorage.
- **Nur serverseitig gehalten** — einziger Frontend-Zugriff:
  - `GET /api/chat/session/{sessionId}/fields` (Zeile 1496) → Response `{fields: {key: value, ...}}`.
  - Aktuell **nur** beim Chat→Formular-Wechsel aufgerufen (`switchToForm` → `prefillForm` Zeile 1505–1506).
- **Keine Auto-Synchronisation** während der Chat-Session. Das Frontend weiß also zur Laufzeit nicht, welche Felder bereits beantwortet sind — es sei denn, es pollt den Endpoint.

### 2.5 Übrige State-Variablen (Kontext)

| Variable | Zeile | Zweck |
|----------|-------|-------|
| `chatState.messages` | 11 | `[{role, content}]` — Dialog-Verlauf in-memory |
| `chatState.isStreaming` | 12 | Send-Guard |
| `_lastState` (komplett) | 1325 | Letzter `state_update`-Payload, siehe unten |
| `_lastSectionIndex` | 1326 | Section-Separator-Heuristik |
| `_currentPhase` | 1327 | `"grunddaten" \| "vertiefung" \| "zusammenfassung"` |
| `_editMode` | 864 | Edit-Panel aktiv → QR-Rendering unterdrückt |
| `_summaryFields` | 865 | Aus Summary geparst |
| `currentDraft` | 868 | Aktuell angezeigter Draft-Chip-Wert |

**`_lastState` — bekannte Felder aus Widget-Zugriffen (Backend-Vertrag implizit):**

- `conversation_phase` (Z. 1331)
- `current_field` (Z. 778, 818)
- `current_block` (Z. 1294, 1408)
- `current_section`, `total_sections`, `current_section_name` (Z. 1392–1397)
- `block_progress`, `block_total`, `block_label` (Z. 1424–1434)
- `progress_percent` (Z. 1340)
- `is_completable` (Z. 452, 1338)
- `missing_optional` (Z. 762, 776, 781)
- `unsurveyed_note` (Z. 1166)
- `pending_field`, `pending_value`, `pending_label` (Z. 1718 — Resume)

**Was fehlt:** `collected_fields`, `field_type`, `field_label` — werden nicht aus `_lastState` gelesen.

---

## 3. DOM-Container-Liste

Aufbau via `renderChatContainer()` (Zeilen 110–190), injiziert in `#chat-container` (statisch in `strategy.html`, Zeile 537).

### 3.1 Erzeugte Container-Hierarchie

| Selektor | Zeile | Zweck |
|----------|-------|-------|
| `#chat-container` | strategy.html:537 | Root (vom Widget befüllt) |
| `.chat-header` | 113 | Kopfzeile |
| `.chat-title` | 115 | Titel „KI-Bestandsaufnahme" |
| `#phaseIndicator` | 117 | 3-Stufen-Phasenanzeige |
| `.phase-segment[data-phase="grunddaten"]` | 118 | — |
| `.phase-segment[data-phase="vertiefung"]` | 122 | — |
| `.phase-segment[data-phase="zusammenfassung"]` | 126 | — |
| `.phase-connector` | 121, 125 | Verbindungslinien |
| `#chatSwitchToForm` | 131 | „Zum Formular wechseln"-Button |
| `#chatMessages` | 134 | Nachrichten-Log, `role="log"`, `aria-live="polite"` |
| `#draftChip` | 135 | Draft-Chip-Container (`display:none` initial) |
| `#draftChipLabel` | 138 | — |
| `#draftChipValue` | 140 | — |
| `#draftChipActions` | 141 | — |
| `#draftConfirmBtn` | 142 | „✓ Übernehmen" |
| `#draftEditBtn` | 143 | „✏️ Ändern" |
| `.chat-input-area` | 146 | **Input-Bereich-Wrapper** (kein ID, aber eindeutiger Selektor) |
| `#chatQuickReplies` | 147 | Quick-Reply-Buttons, `role="group"` |
| `.chat-input-row` | 148 | Input-Zeile (Textarea + Send-Button) |
| `#chatInput` | 149 | Textarea, `rows="1"`, Auto-Resize ≤120px |
| `#chatSend` | 150 | Send-Button, initial `disabled` |

### 3.2 Dynamisch nachgezogene Container (NICHT in `renderChatContainer`)

| Selektor | Erzeugt in | Einfügeort |
|----------|------------|-----------|
| `#block-progress-bar` | `updateBlockProgress` Z. 1413–1420 | Zwischen `.chat-input-area` und Vorgänger |
| `.section-separator` | `insertSectionSeparator` (via Z. 1394) | in `#chatMessages` bei Block-Wechsel |
| `.help-trigger` | `renderHelpButton` Z. 802 | angehängt an `#chatMessages` |
| `.chat-message.chat-message-assistant` | `token`-Handler Z. 441–443 | angehängt an `#chatMessages` |
| `.chat-message.chat-message-user` | `appendMessage` Z. 244 | angehängt an `#chatMessages` |
| `.chat-message.chat-message-system` | `appendMessage("system", ...)` | angehängt an `#chatMessages` |
| `.typing-indicator` | `showTypingIndicator` Z. 283–321 | angehängt an `#chatMessages` |
| `.qr-label`, `.qr-group`, `.qr-btn`, `.qr-confirm-btn`, `.qr-skip-btn` | `renderQuickReplies` Z. 572–772 | in `#chatQuickReplies` |

### 3.3 Initiale Sichtbarkeit

- `#chat-container` ist in `strategy.html` `display:none`; wird durch `startChatMode()` (Z. 98) auf `flex` gesetzt.
- `#draftChip` startet mit Inline-Style `display:none` (Z. 135) — wird von `handleDraftValue` eingeblendet.
- `#chatQuickReplies` ist immer im DOM, aber leer, bis ein `quick_replies`- oder `preview_qr`-Event es füllt.

### 3.4 Relevanz für Smart-Chips

- **Textarea `#chatInput` bleibt immer im DOM** und immer sichtbar — sie wird nicht zwischen Modi umgeschaltet.
- **Parallel** koexistieren `#chatQuickReplies` (Buttons) und `#chatInput` (Textarea).
- **`.chat-input-area`** ist der einzige Wrapper, der Input + QR zusammenfasst — der natürliche Ankerpunkt für einen neuen Smart-Chips-Container zwischen QR und Input-Row.

---

**Deliverable 1/4 abgeschlossen.** Bereit für Schritt 2 (Feasibility) auf Wolf's Signal.
