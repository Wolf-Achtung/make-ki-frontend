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
