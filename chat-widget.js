/* ========================================
   Chat Widget — ki-sicherheit.jetzt
   Konversationeller KI-Fragebogen (PoC)
   ======================================== */
(function() {
    "use strict";

    /* ── State ── */
    var chatState = {
        sessionId: null,
        messages: [],
        isStreaming: false
    };

    /* ── Phase + Block Constants ── */
    var BLOCK_LABELS = {
        "block_a": "F\u00f6rdermittel & Budget",
        "block_b": "KI-Strategie & Roadmap",
        "block_c": "Tools & Automatisierung",
        "block_d": "Recht & Datenschutz"
    };

    var BLOCK_TIME_ESTIMATES = {
        "block_a": "~2 Min",
        "block_b": "~3 Min",
        "block_c": "~4 Min",
        "block_d": "~2 Min"
    };

    /* ── API helpers ── */
    function getApiBase() {
        try {
            var meta = document.querySelector('meta[name="api-base"]');
            if (meta && meta.content) {
                return meta.content.replace(/\/api\/?$/, "");
            }
        } catch(e) {}
        return "https://api-ki-backend-neu-production.up.railway.app";
    }

    function getAuthHeaders() {
        var headers = { "Content-Type": "application/json" };
        try {
            if (window.AUTH && typeof window.AUTH.getAuthHeaders === "function") {
                var auth = window.AUTH.getAuthHeaders();
                for (var key in auth) {
                    if (auth.hasOwnProperty(key)) headers[key] = auth[key];
                }
            }
        } catch(e) {}
        return headers;
    }

    /* ── Mode Selector ── */
    function renderModeSelector() {
        var selector = document.getElementById("intake-mode-selector");
        if (!selector) return;

        selector.innerHTML = ''
            + '<div class="mode-selector">'
            + '  <div class="mode-card mode-primary" id="mode-chat" tabindex="0" role="button" aria-label="KI-gestuetztes Gespraech starten">'
            + '    <div class="mode-icon" aria-hidden="true">💬</div>'
            + '    <h3>KI-gestütztes Gespräch</h3>'
            + '    <p>Lassen Sie sich Schritt für Schritt durch die Bestandsaufnahme '
            + '       führen. Die KI erklärt Fachbegriffe und hilft bei Unsicherheiten.</p>'
            + '    <span class="mode-badge">Empfohlen · ca. 10–15 Min.</span>'
            + '  </div>'
            + '  <div class="mode-card mode-secondary" id="mode-form" tabindex="0" role="button" aria-label="Fragebogen direkt ausfuellen">'
            + '    <div class="mode-icon" aria-hidden="true">📋</div>'
            + '    <h3>Fragebogen direkt ausfüllen</h3>'
            + '    <p>Klassischer Fragebogen zum selbst Ausfüllen — '
            + '       für alle, die es lieber strukturiert mögen.</p>'
            + '    <span class="mode-time">ca. 10–15 Min.</span>'
            + '  </div>'
            + '</div>';

        var chatCard = document.getElementById("mode-chat");
        var formCard = document.getElementById("mode-form");

        chatCard.addEventListener("click", startChatMode);
        chatCard.addEventListener("keydown", function(e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startChatMode(); }
        });

        formCard.addEventListener("click", startFormMode);
        formCard.addEventListener("keydown", function(e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startFormMode(); }
        });
    }

    function startChatMode() {
        document.getElementById("intake-mode-selector").style.display = "none";
        var card = document.getElementById("formbuilder-card");
        if (card) card.style.display = "none";
        document.getElementById("chat-container").style.display = "flex";
        initChat();
    }

    function startFormMode() {
        document.getElementById("intake-mode-selector").style.display = "none";
        document.getElementById("chat-container").style.display = "none";
        var card = document.getElementById("formbuilder-card");
        if (card) card.style.display = "block";
    }

    /* ── Chat Container Rendering ── */
    function renderChatContainer() {
        var container = document.getElementById("chat-container");
        container.innerHTML = ''
            + '<div class="chat-header">'
            + '  <div class="chat-header-left">'
            + '    <span class="chat-title">KI-Bestandsaufnahme</span>'
            + '  </div>'
            + '  <div class="phase-indicator" id="phaseIndicator" role="navigation" aria-label="Fortschritt">'
            + '    <div class="phase-segment phase-active" data-phase="grunddaten">'
            + '      <span class="phase-dot"></span><span class="phase-label">Grunddaten</span>'
            + '    </div>'
            + '    <div class="phase-connector"></div>'
            + '    <div class="phase-segment" data-phase="vertiefung">'
            + '      <span class="phase-dot"></span><span class="phase-label">Vertiefung</span>'
            + '    </div>'
            + '    <div class="phase-connector"></div>'
            + '    <div class="phase-segment" data-phase="zusammenfassung">'
            + '      <span class="phase-dot"></span><span class="phase-label">Zusammenfassung</span>'
            + '    </div>'
            + '  </div>'
            + '  <div class="chat-header-right">'
            + '    <button class="chat-switch-btn" id="chatSwitchToForm">Zum Formular wechseln</button>'
            + '  </div>'
            + '</div>'
            + '<div class="chat-messages" id="chatMessages" role="log" aria-live="polite" aria-label="Chat-Verlauf"></div>'
            + '<div class="draft-chip" id="draftChip" style="display:none;">'
            + '  <div class="draft-chip-header">'
            + '    <span class="draft-chip-icon">\uD83D\uDCDD</span>'
            + '    <span class="draft-chip-label" id="draftChipLabel">Erkannt</span>'
            + '  </div>'
            + '  <div class="draft-chip-value" id="draftChipValue"></div>'
            + '  <div class="draft-chip-actions" id="draftChipActions">'
            + '    <button class="draft-confirm-btn" id="draftConfirmBtn">\u2713 \u00dcbernehmen</button>'
            + '    <button class="draft-edit-btn" id="draftEditBtn">\u270f\ufe0f \u00c4ndern</button>'
            + '  </div>'
            + '</div>'
            + '<div class="chat-input-area">'
            + '  <div class="chat-quick-replies" id="chatQuickReplies" role="group" aria-label="Schnellantworten"></div>'
            + '  <div class="chat-input-row">'
            + '    <textarea id="chatInput" placeholder="Ihre Antwort oder Frage..." rows="1" aria-label="Ihre Antwort eingeben"></textarea>'
            + '    <button id="chatSend" disabled aria-label="Nachricht senden">Senden</button>'
            + '  </div>'
            + '</div>';

        document.getElementById("chatSend").addEventListener("click", function() {
            sendMessage();
        });

        document.getElementById("chatInput").addEventListener("keydown", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        document.getElementById("chatInput").addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 120) + "px";
            document.getElementById("chatSend").disabled = !this.value.trim();
        });

        document.getElementById("chatSwitchToForm").addEventListener("click", switchToForm);

        // Event delegation for draft chip — survives innerHTML replacement
        document.getElementById("draftChip").addEventListener("click", function(e) {
            var target = e.target;
            while (target && target !== this) {
                if (target.id === "draftConfirmBtn" || target.classList.contains("draft-confirm-btn")) {
                    e.preventDefault();
                    confirmDraft();
                    return;
                }
                if (target.id === "draftEditBtn" || target.classList.contains("draft-edit-btn")) {
                    e.preventDefault();
                    editDraft();
                    return;
                }
                target = target.parentElement;
            }
        });
    }

    /* ── Chat Init ── */
    function initChat(options) {
        options = options || {};
        var reportType = options.report_type || "r1";
        var briefingId = options.briefing_id || null;

        renderChatContainer();

        var payload = {
            report_type: reportType,
            lang: "de",
            consent_report: true
        };
        if (briefingId) {
            payload.briefing_id = briefingId;
        }

        fetch(getApiBase() + "/api/chat/start", {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify(payload)
        })
        .then(function(res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function(data) {
            chatState.sessionId = data.session_id;

            appendMessage("assistant", data.welcome_message);

            if (data.state && data.state.quick_replies) {
                renderQuickReplies(data.state.quick_replies);
            }

            updateProgress(data.state);

            try {
                localStorage.setItem("chat_session_id", data.session_id);
            } catch(e) {}

            var input = document.getElementById("chatInput");
            if (input) input.focus();
        })
        .catch(function(err) {
            appendMessage("system", "Verbindungsfehler. Bitte laden Sie die Seite neu.");
            console.error("Chat start failed:", err);
        });
    }

    /* ── Message Display ── */
    function appendMessage(role, content) {
        var container = document.getElementById("chatMessages");
        if (!container) return null;

        var msgDiv = document.createElement("div");
        msgDiv.className = "chat-message chat-message-" + role;

        if (role === "assistant") {
            msgDiv.innerHTML = formatMessageContent(content);
        } else {
            msgDiv.textContent = content;
        }

        container.appendChild(msgDiv);
        scrollToBottom();

        chatState.messages.push({ role: role, content: content });

        if (role === "assistant") {
            announceForScreenReader("Neue Nachricht vom Assistenten");
        }

        return msgDiv;
    }

    function formatMessageContent(text) {
        if (!text) return "";
        var html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n\n/g, "</p><p>")
            .replace(/\n(\d+)\.\s/g, "<br>$1. ")
            .replace(/\n/g, "<br>");
        return "<p>" + html + "</p>";
    }

    function scrollToBottom() {
        var container = document.getElementById("chatMessages");
        if (!container) return;
        requestAnimationFrame(function() {
            container.scrollTop = container.scrollHeight;
        });
    }

    function scrollToLastBotMessage() {
        var container = document.getElementById("chatMessages");
        if (!container) return;
        var messages = container.querySelectorAll(".chat-message-assistant");
        var lastMsg = messages.length ? messages[messages.length - 1] : null;
        if (!lastMsg) {
            scrollToBottom();
            return;
        }
        requestAnimationFrame(function() {
            var msgTop = lastMsg.offsetTop - 12;
            var msgBottom = lastMsg.offsetTop + lastMsg.offsetHeight;
            if (msgBottom - msgTop <= container.clientHeight) {
                container.scrollTop = Math.max(0, msgTop);
            } else {
                container.scrollTop = container.scrollHeight;
            }
        });
    }

    /* ── Typing Indicator ── */
    function showTypingIndicator() {
        var container = document.getElementById("chatMessages");
        if (!container) return;
        var indicator = document.createElement("div");
        indicator.className = "chat-message chat-message-assistant chat-typing";
        indicator.id = "chatTypingIndicator";
        indicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        container.appendChild(indicator);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        var el = document.getElementById("chatTypingIndicator");
        if (el) el.remove();
    }

    /* ── Send Message (SSE Streaming) ── */
    function sendMessage(text, extra) {
        var input = document.getElementById("chatInput");
        var isResumeTrigger = extra && extra._resumeTrigger;
        var message = (text != null) ? String(text) : (input ? input.value.trim() : "");
        if (!message && !isResumeTrigger) return;
        if (chatState.isStreaming) return;

        if (message && !(extra && extra._hideUserMessage)) {
            appendMessage("user", message);
        }

        if (input) {
            input.value = "";
            input.style.height = "auto";
        }
        document.getElementById("chatSend").disabled = true;

        clearQuickReplies();
        showTypingIndicator();
        chatState.isStreaming = true;

        var streamDiv = null;
        var fullResponse = "";
        var currentEvent = null;
        var buffer = "";

        // Build request body, stripping internal flags (prefixed with _)
        var body = { session_id: chatState.sessionId, message: message };
        if (extra) {
            for (var key in extra) {
                if (extra.hasOwnProperty(key) && key.charAt(0) !== "_") {
                    body[key] = extra[key];
                }
            }
        }

        fetch(getApiBase() + "/api/chat/message", {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify(body)
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            var reader = response.body.getReader();
            var decoder = new TextDecoder();

            function processStream() {
                return reader.read().then(function(result) {
                    if (result.done) {
                        finishStream();
                        return;
                    }

                    buffer += decoder.decode(result.value, { stream: true });

                    var lines = buffer.split("\n");
                    buffer = lines.pop();

                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];

                        if (line.indexOf("event: ") === 0) {
                            currentEvent = line.substring(7).trim();
                        } else if (line.indexOf("data: ") === 0 && currentEvent) {
                            var dataStr = line.substring(6);

                            try {
                                var data = JSON.parse(dataStr);
                                handleSSEEvent(currentEvent, data);
                            } catch(e) {
                                console.warn("SSE parse error:", e, dataStr);
                            }

                            currentEvent = null;
                        }
                    }

                    return processStream();
                });
            }

            function handleSSEEvent(eventType, data) {
                switch (eventType) {
                    case "heartbeat":
                        break;

                    case "token":
                        if (!streamDiv) {
                            hideTypingIndicator();
                            streamDiv = document.createElement("div");
                            streamDiv.className = "chat-message chat-message-assistant";
                            document.getElementById("chatMessages").appendChild(streamDiv);
                        }
                        fullResponse += data.text;
                        streamDiv.innerHTML = formatMessageContent(fullResponse);
                        scrollToBottom();
                        break;

                    case "state_update":
                        updateProgress(data);
                        if (data.is_completable === true) {
                            showCompletionUI();
                        }
                        break;

                    case "quick_replies":
                        renderQuickReplies(data);
                        break;

                    case "draft_value":
                        handleDraftValue(data);
                        break;

                    case "field_confirmed":
                        handleFieldConfirmed(data);
                        break;

                    case "dialog_mode":
                        handleDialogMode(data);
                        break;

                    case "done":
                        finishStream();
                        break;

                    case "error":
                        hideTypingIndicator();
                        appendMessage("system", data.message || "Ein Fehler ist aufgetreten.");
                        chatState.isStreaming = false;
                        break;
                }
            }

            function finishStream() {
                hideTypingIndicator();
                chatState.isStreaming = false;
                if (fullResponse) {
                    chatState.messages.push({ role: "assistant", content: fullResponse });
                    announceForScreenReader("Neue Nachricht vom Assistenten");
                    // Check if response is a summary and render as cards
                    if (fullResponse.indexOf("**Zusammenfassung Ihrer Angaben:**") !== -1 && streamDiv) {
                        renderSummaryCards(streamDiv, fullResponse);
                    }
                }

                // Show skip button for freetext-only optional fields (no QR buttons rendered)
                var qrContainer = document.getElementById("chatQuickReplies");
                if (qrContainer && !qrContainer.children.length) {
                    renderSkipButtonIfOptional(qrContainer, null);
                }

                // Show help button for freetext fields (not simple ones)
                renderHelpButtonIfApplicable();

                var inp = document.getElementById("chatInput");
                if (inp) inp.focus();
            }

            return processStream();
        })
        .catch(function(err) {
            hideTypingIndicator();
            chatState.isStreaming = false;
            appendMessage("system", "Verbindungsfehler. Bitte versuchen Sie es erneut.");
            console.error("Chat message failed:", err);
        });
    }

    /* ── Quick Replies ── */
    function renderQuickReplies(replies) {
        var container = document.getElementById("chatQuickReplies");
        if (!container) return;
        container.innerHTML = "";

        if (!replies || !replies.length) {
            // No QR buttons but field might be optional — show skip if applicable
            renderSkipButtonIfOptional(container, null);
            scrollToBottom();
            return;
        }

        // Safety-net: only render first QR group (backend should send max 1)
        if (replies.length > 1) {
            replies = [replies[0]];
        }

        for (var r = 0; r < replies.length; r++) {
            var reply = replies[r];

            // Draft-action QR buttons suppressed — Draft Chip handles this
            if (reply.field === "_draft_action") {
                continue;
            }

            // Skip replies with no options
            if (!reply.options || !reply.options.length) continue;

            var isMulti = reply.multi_select === true;
            var maxSelect = reply.max_select || 0;

            var label = document.createElement("div");
            label.className = "qr-label";
            var labelText = reply.label;
            if (isMulti) {
                labelText += maxSelect
                    ? " (max. " + maxSelect + " auswählen)"
                    : " (mehrere möglich)";
            }
            label.textContent = labelText;
            container.appendChild(label);

            var group = document.createElement("div");
            group.className = "qr-group";

            for (var o = 0; o < reply.options.length; o++) {
                var option = reply.options[o];
                var btn = document.createElement("button");
                btn.className = "qr-btn";
                btn.textContent = option.label;
                btn.dataset.field = reply.field;
                btn.dataset.value = option.value;
                btn.setAttribute("role", "option");

                if (option.description) {
                    btn.title = option.description;
                }

                // Checkpoint enhancements for multi-select
                if (isMulti && BLOCK_TIME_ESTIMATES[option.value]) {
                    btn.dataset.label = option.label;
                    btn.innerHTML = escapeHtml(option.label)
                        + '<span class="qr-btn-time">' + BLOCK_TIME_ESTIMATES[option.value] + '</span>';
                    btn.classList.add("qr-btn-block");
                } else if (isMulti && !BLOCK_LABELS.hasOwnProperty(option.value)) {
                    btn.classList.add("qr-btn-meta");
                }

                if (isMulti) {
                    btn.addEventListener("click", (function(groupEl, max) {
                        return function() {
                            if (this.classList.contains("qr-btn-disabled")) return;
                            this.classList.toggle("qr-btn-selected");
                            this.setAttribute("aria-selected",
                                this.classList.contains("qr-btn-selected") ? "true" : "false");
                            if (max) {
                                var selected = groupEl.querySelectorAll(".qr-btn-selected");
                                var btns = groupEl.querySelectorAll(".qr-btn");
                                for (var i = 0; i < btns.length; i++) {
                                    if (!btns[i].classList.contains("qr-btn-selected")) {
                                        if (selected.length >= max) {
                                            btns[i].classList.add("qr-btn-disabled");
                                            btns[i].disabled = true;
                                        } else {
                                            btns[i].classList.remove("qr-btn-disabled");
                                            btns[i].disabled = false;
                                        }
                                    }
                                }
                            }
                            // Update confirm button state and text
                            var selectedCount = groupEl.querySelectorAll(".qr-btn-selected").length;
                            var confirmEl = groupEl.parentNode.querySelector(".qr-confirm-btn");
                            if (confirmEl) {
                                if (selectedCount > 0) {
                                    // Calculate estimated time from selected blocks
                                    var selBtns = groupEl.querySelectorAll(".qr-btn-selected");
                                    var totalMins = 0;
                                    for (var k = 0; k < selBtns.length; k++) {
                                        var tEst = BLOCK_TIME_ESTIMATES[selBtns[k].dataset.value];
                                        if (tEst) totalMins += parseInt(tEst.replace(/[^0-9]/g, ""), 10) || 0;
                                    }
                                    var timeInfo = totalMins > 0 ? " (~" + totalMins + " Min)" : "";
                                    confirmEl.disabled = false;
                                    confirmEl.textContent = selectedCount + " ausgew\u00e4hlt" + timeInfo + " \u2014 Best\u00e4tigen \u2713";
                                } else {
                                    confirmEl.disabled = true;
                                    confirmEl.textContent = "Bitte mindestens eine Option w\u00e4hlen";
                                }
                            }
                        };
                    })(group, maxSelect));
                } else {
                    btn.addEventListener("click", function() {
                        handleQuickReply(this.dataset.field, this.dataset.value, this.textContent);
                    });
                }

                // Insert separator before first meta button in multi-select
                if (btn.classList.contains("qr-btn-meta") && !group.querySelector(".qr-meta-sep")) {
                    var metaSep = document.createElement("div");
                    metaSep.className = "qr-meta-sep";
                    group.appendChild(metaSep);
                }
                group.appendChild(btn);
            }

            container.appendChild(group);

            if (isMulti) {
                var confirmBtn = document.createElement("button");
                confirmBtn.className = "qr-confirm-btn";
                confirmBtn.textContent = "Bitte mindestens eine Option w\u00e4hlen";
                confirmBtn.disabled = true;
                confirmBtn.addEventListener("click", (function(groupEl) {
                    return function() {
                        var selected = groupEl.querySelectorAll(".qr-btn-selected");
                        if (!selected.length) return;
                        hideDraftChip();
                        var labels = [];
                        var values = [];
                        var field = selected[0].dataset.field;
                        for (var i = 0; i < selected.length; i++) {
                            labels.push(selected[i].dataset.label || selected[i].textContent);
                            values.push(selected[i].dataset.value);
                        }
                        sendMessage(labels.join(", "), {
                            quick_reply_field: field,
                            quick_reply_value: values.join(",")
                        });
                    };
                })(group));
                container.appendChild(confirmBtn);
            }
        }

        // Add skip button for optional fields (with QR context)
        if (_lastState && _lastState.missing_optional && replies.length) {
            var lastReply = replies[replies.length - 1];
            var fieldName = lastReply.field;
            renderSkipButtonIfOptional(container, fieldName);
        }

        // Scroll to show bot message at top with QR visible below
        setTimeout(function() {
            scrollToLastBotMessage();
        }, 50);
    }

    /* ── Skip Button (standalone, works with and without QR) ── */
    function renderSkipButtonIfOptional(container, fieldName) {
        if (!_lastState || !_lastState.missing_optional) return;

        var fn = fieldName || (_lastState && _lastState.current_field);
        if (!fn) return;

        if (_lastState.missing_optional.indexOf(fn) === -1) return;

        var skipBtn = document.createElement("button");
        skipBtn.className = "qr-skip-btn";
        skipBtn.textContent = "\u00dcberspringen \u2192";
        skipBtn.addEventListener("click", function() {
            sendMessage("weiter");
        });
        container.appendChild(skipBtn);
        scrollToBottom();
    }

    /* ── Help Button ("Was ist hier gemeint?") ── */
    var SIMPLE_FIELDS = ["branche", "unternehmensgroesse", "land", "bundesland"];

    function renderHelpButton(fieldName) {
        if (!fieldName || SIMPLE_FIELDS.indexOf(fieldName) !== -1) return;

        var container = document.getElementById("chatMessages");
        if (!container) return;

        var helpBtn = document.createElement("div");
        helpBtn.className = "help-trigger";
        helpBtn.innerHTML = "\uD83D\uDCA1 Was ist hier gemeint?";
        helpBtn.addEventListener("click", function handler() {
            helpBtn.classList.add("help-trigger--used");
            helpBtn.removeEventListener("click", handler);
            appendMessage("user", "\uD83D\uDCA1 Erkl\u00e4rung angefordert");
            sendMessage("__HELP_REQUEST__", { _hideUserMessage: true });
        });

        container.appendChild(helpBtn);
        scrollToBottom();
    }

    function renderHelpButtonIfApplicable() {
        if (!_lastState) return;
        var fieldName = _lastState.current_field;
        if (!fieldName) return;
        renderHelpButton(fieldName);
    }

    /* ── Undo State ── */
    var _undoTimer = null;
    var _undoPendingMsg = null;

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function handleQuickReply(field, value, label) {
        // Draft-action QR buttons (confirm/edit) route to draft handlers
        if (field === "_draft_action") {
            if (value === "confirm") {
                confirmDraft();
            } else if (value === "edit") {
                editDraft();
            }
            return;
        }
        // Hide draft chip on normal QR click (new flow step)
        hideDraftChip();

        // Cancel any existing undo timer
        if (_undoTimer) {
            clearTimeout(_undoTimer);
            _undoTimer = null;
        }

        // Remove any leftover pending message
        if (_undoPendingMsg && _undoPendingMsg.parentNode) {
            _undoPendingMsg.parentNode.removeChild(_undoPendingMsg);
            _undoPendingMsg = null;
        }

        // Show pending message in chat (visual only, not pushed to chatState)
        var messagesContainer = document.getElementById("chatMessages");
        if (messagesContainer) {
            _undoPendingMsg = document.createElement("div");
            _undoPendingMsg.className = "chat-message chat-message-user chat-message-pending";
            _undoPendingMsg.textContent = label;
            messagesContainer.appendChild(_undoPendingMsg);
            scrollToBottom();
        }

        // Preserve QR nodes (detach instead of innerHTML to keep event listeners)
        var qrContainer = document.getElementById("chatQuickReplies");
        var savedNodes = [];
        while (qrContainer.firstChild) {
            savedNodes.push(qrContainer.removeChild(qrContainer.firstChild));
        }

        // Show undo bar
        showUndoBar(qrContainer, label, function onUndo() {
            // Remove pending message
            if (_undoPendingMsg && _undoPendingMsg.parentNode) {
                _undoPendingMsg.parentNode.removeChild(_undoPendingMsg);
            }
            _undoPendingMsg = null;
            // Restore QR buttons (event listeners preserved)
            qrContainer.innerHTML = "";
            savedNodes.forEach(function(node) {
                qrContainer.appendChild(node);
            });
            scrollToBottom();
        });

        // After 3 seconds: commit the message
        _undoTimer = setTimeout(function() {
            _undoTimer = null;
            // Remove pending message (sendMessage will re-add it properly)
            if (_undoPendingMsg && _undoPendingMsg.parentNode) {
                _undoPendingMsg.parentNode.removeChild(_undoPendingMsg);
            }
            _undoPendingMsg = null;
            // Actually send
            sendMessage(label, {
                quick_reply_field: field,
                quick_reply_value: value
            });
        }, 3000);
    }

    function showUndoBar(container, label, onUndo) {
        var bar = document.createElement("div");
        bar.className = "undo-bar";
        bar.innerHTML = ''
            + '<span class="undo-label">' + escapeHtml(label) + '</span>'
            + '<button class="undo-btn">Angabe korrigieren? Einfach hier klicken!</button>'
            + '<div class="undo-progress"><div class="undo-progress-fill"></div></div>';
        container.appendChild(bar);

        bar.querySelector(".undo-btn").addEventListener("click", function() {
            if (_undoTimer) {
                clearTimeout(_undoTimer);
                _undoTimer = null;
            }
            onUndo();
        });
    }

    function clearQuickReplies() {
        // Cancel any pending undo when quick replies are cleared
        if (_undoTimer) {
            clearTimeout(_undoTimer);
            _undoTimer = null;
        }
        var container = document.getElementById("chatQuickReplies");
        if (container) container.innerHTML = "";
    }

    /* ── Draft-Chip State ── */
    var currentDraft = null;

    function handleDraftValue(data) {
        // data = { field, value, label }
        currentDraft = data;

        var chip = document.getElementById("draftChip");
        var label = document.getElementById("draftChipLabel");
        var value = document.getElementById("draftChipValue");
        var actions = document.getElementById("draftChipActions");
        if (!chip) return;

        label.textContent = data.label || "Erkannt";

        if (Array.isArray(data.value)) {
            value.textContent = data.value.join(", ");
        } else {
            value.textContent = String(data.value);
        }

        // Reset chip state for new draft
        chip.classList.remove("draft-confirmed", "draft-confirming");
        actions.innerHTML = ''
            + '<button class="draft-confirm-btn" id="draftConfirmBtn">\u2713 \u00dcbernehmen</button>'
            + '<button class="draft-edit-btn" id="draftEditBtn">\u270f\ufe0f \u00c4ndern</button>';

        chip.style.display = "block";
        scrollToBottom();
    }

    function handleFieldConfirmed(data) {
        // data = { field, value }
        showConfirmSuccess();
        currentDraft = null;
    }

    function showConfirmSuccess() {
        var chip = document.getElementById("draftChip");
        if (!chip) return;

        chip.classList.remove("draft-confirming");
        chip.classList.add("draft-confirmed");

        var actions = document.getElementById("draftChipActions");
        if (actions) {
            actions.innerHTML = '<span class="draft-confirmed-text">\u2713 \u00dcbernommen</span>';
        }

        setTimeout(function() {
            chip.style.display = "none";
            chip.classList.remove("draft-confirmed");
        }, 1500);
    }

    function handleDialogMode(data) {
        // data = { active: true|false }
        var qrContainer = document.getElementById("chatQuickReplies");
        var input = document.getElementById("chatInput");

        if (data.active) {
            if (qrContainer) qrContainer.style.display = "none";
            if (input) input.placeholder = "Ihre Frage wird beantwortet \u2014 tippen Sie gerne weiter\u2026";
        } else {
            if (qrContainer) qrContainer.style.display = "";
            if (input) input.placeholder = "Ihre Antwort oder Frage...";
        }
    }

    function confirmDraft() {
        if (!currentDraft) return;

        var chip = document.getElementById("draftChip");
        if (chip) chip.classList.add("draft-confirming");

        fetch(getApiBase() + "/api/chat/confirm", {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify({
                session_id: chatState.sessionId,
                field: currentDraft.field,
                action: "confirm"
            })
        })
        .then(function(res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            // field_confirmed SSE event will handle success UI
        })
        .catch(function(err) {
            console.error("Confirm failed:", err);
            if (chip) chip.classList.remove("draft-confirming");
        });
    }

    function editDraft() {
        if (!currentDraft) return;

        fetch(getApiBase() + "/api/chat/confirm", {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify({
                session_id: chatState.sessionId,
                field: currentDraft.field,
                action: "edit"
            })
        })
        .then(function(res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            hideDraftChip();
            var input = document.getElementById("chatInput");
            if (input) {
                input.focus();
                input.placeholder = "Bitte geben Sie Ihre Antwort nochmal ein\u2026";
            }
        })
        .catch(function(err) {
            console.error("Edit failed:", err);
        });
    }

    function hideDraftChip() {
        var chip = document.getElementById("draftChip");
        if (chip) chip.style.display = "none";
        currentDraft = null;
    }

    /* ── Summary Cards ── */
    function parseSummary(text) {
        var sections = [];
        var lines = text.split("\n");
        var currentSection = null;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            // Section header: **Title**
            var sectionMatch = line.match(/^\*\*([^*]+)\*\*$/);
            if (sectionMatch && sectionMatch[1] !== "Zusammenfassung Ihrer Angaben:") {
                currentSection = { title: sectionMatch[1], fields: [] };
                sections.push(currentSection);
                continue;
            }

            // Field: - Label: Value
            var fieldMatch = line.match(/^-\s+(.+?):\s+(.+)$/);
            if (fieldMatch && currentSection) {
                currentSection.fields.push({
                    label: fieldMatch[1],
                    value: fieldMatch[2]
                });
            }
        }

        return sections;
    }

    function renderSummaryCards(container, summaryText) {
        // Force phase indicator to Zusammenfassung when summary is shown
        if (_currentPhase !== "zusammenfassung") {
            _currentPhase = "zusammenfassung";
            updatePhaseIndicator("zusammenfassung");
        }

        var sections = parseSummary(summaryText);
        if (!sections.length) return;

        // Remove old summary cards to prevent duplicates during edit flow
        var chatMessages = document.getElementById("chatMessages");
        if (chatMessages) {
            var oldSummaries = chatMessages.querySelectorAll(".summary-cards");
            for (var s2 = 0; s2 < oldSummaries.length; s2++) {
                var parentMsg = oldSummaries[s2].closest(".chat-message");
                if (parentMsg && parentMsg !== container) {
                    parentMsg.remove();
                }
            }
        }

        var html = '<div class="summary-cards">';
        html += '<div class="summary-header">Zusammenfassung Ihrer Angaben</div>';

        var cardIndex = 0;
        for (var i = 0; i < sections.length; i++) {
            var s = sections[i];
            // Skip sections with no fields
            if (!s.fields || !s.fields.length) continue;
            var isCollapsed = cardIndex > 2;
            cardIndex++;
            html += ''
                + '<div class="summary-card' + (isCollapsed ? ' collapsed' : '') + '">'
                + '  <div class="summary-card-header" data-toggle="' + i + '">'
                + '    <span class="summary-card-title">' + escapeHtml(s.title) + '</span>'
                + '    <span class="summary-card-toggle">' + (isCollapsed ? '\u25b8' : '\u25be') + '</span>'
                + '  </div>'
                + '  <div class="summary-card-body"' + (isCollapsed ? ' style="display:none"' : '') + '>';

            for (var j = 0; j < s.fields.length; j++) {
                html += '<div class="summary-field">'
                    + '<span class="summary-field-label">' + escapeHtml(s.fields[j].label) + '</span>'
                    + '<span class="summary-field-value">' + escapeHtml(s.fields[j].value) + '</span>'
                    + '</div>';
            }

            html += '  </div>'
                + '</div>';
        }

        html += '</div>';

        // Hint text for areas not explored in depth
        if (_lastState && _lastState.unsurveyed_note) {
            html += '<div class="summary-note">'
                + '<span class="summary-note-icon">\u2139\ufe0f</span>'
                + '<p>' + escapeHtml(_lastState.unsurveyed_note) + '</p>'
                + '</div>';
        }

        html += '<div class="summary-footer">Sind alle Angaben korrekt? Dann starte ich die Auswertung.</div>';

        container.innerHTML = html;

        // Bind toggle handlers
        var headers = container.querySelectorAll(".summary-card-header");
        for (var h = 0; h < headers.length; h++) {
            headers[h].addEventListener("click", function() {
                var card = this.parentElement;
                var body = card.querySelector(".summary-card-body");
                var toggle = this.querySelector(".summary-card-toggle");
                if (card.classList.contains("collapsed")) {
                    card.classList.remove("collapsed");
                    body.style.display = "";
                    toggle.textContent = "\u25be";
                } else {
                    card.classList.add("collapsed");
                    body.style.display = "none";
                    toggle.textContent = "\u25b8";
                }
            });
        }

        scrollToBottom();
    }

    /* ── Section Separator ── */
    function insertSectionSeparator(stepNum, totalSteps, sectionName) {
        var container = document.getElementById("chatMessages");
        if (!container) return;

        // Use block label from mapping if available, otherwise section name
        var label = sectionName;
        if (_lastState && _lastState.current_block && BLOCK_LABELS[_lastState.current_block]) {
            label = BLOCK_LABELS[_lastState.current_block];
        }

        var sep = document.createElement("div");
        sep.className = "chat-section-separator";
        sep.setAttribute("role", "separator");
        sep.innerHTML = ''
            + '<div class="section-sep-line"></div>'
            + '<span class="section-sep-label">'
            + escapeHtml(label)
            + '</span>'
            + '<div class="section-sep-line"></div>';

        // Insert separator BEFORE the currently streaming bot message
        // so it appears above the new section's content, not between
        // the bot message and QR buttons
        if (chatState.isStreaming) {
            var lastChild = container.lastElementChild;
            if (lastChild && lastChild.classList.contains("chat-message-assistant")) {
                container.insertBefore(sep, lastChild);
                scrollToBottom();
                return;
            }
        }

        container.appendChild(sep);
        scrollToBottom();
    }

    /* ── Progress ── */
    var _lastState = null;
    var _lastSectionIndex = 0;
    var _currentPhase = "grunddaten";

    function detectPhase(state) {
        // Prefer backend-provided conversation_phase
        if (state.conversation_phase) {
            var cp = state.conversation_phase;
            if (cp === "phase_1a" || cp === "phase_1b") return "grunddaten";
            if (cp === "checkpoint" || cp === "phase_2") return "vertiefung";
            if (cp === "summary" || cp === "complete") return "zusammenfassung";
        }
        // Fallback: infer from available state data
        if (state.is_completable) return "zusammenfassung";
        if (state.current_block) return "vertiefung";
        if (state.progress_percent != null) {
            if (state.progress_percent >= 85) return "zusammenfassung";
            if (state.progress_percent > 25) return "vertiefung";
        }
        return "grunddaten";
    }

    function updatePhaseIndicator(phase) {
        var indicator = document.getElementById("phaseIndicator");
        if (!indicator) return;

        var phases = ["grunddaten", "vertiefung", "zusammenfassung"];
        var activeIndex = phases.indexOf(phase);
        if (activeIndex === -1) activeIndex = 0;

        var segments = indicator.querySelectorAll(".phase-segment");
        var connectors = indicator.querySelectorAll(".phase-connector");

        for (var i = 0; i < segments.length; i++) {
            segments[i].classList.remove("phase-active", "phase-done");
            if (i < activeIndex) {
                segments[i].classList.add("phase-done");
            } else if (i === activeIndex) {
                segments[i].classList.add("phase-active");
            }
        }

        for (var j = 0; j < connectors.length; j++) {
            if (j < activeIndex) {
                connectors[j].classList.add("phase-connector-done");
            } else {
                connectors[j].classList.remove("phase-connector-done");
            }
        }
    }

    function updateProgress(state) {
        if (!state) return;

        _lastState = state;

        // Detect and update phase indicator
        var phase = detectPhase(state);
        if (phase !== _currentPhase) {
            _currentPhase = phase;
            updatePhaseIndicator(phase);
        }

        // Section separator on section change
        if (state.current_section != null && state.current_section !== _lastSectionIndex) {
            if (_lastSectionIndex > 0 || state.current_section > 0) {
                insertSectionSeparator(
                    state.current_section + 1,
                    state.total_sections,
                    state.current_section_name
                );
            }
            _lastSectionIndex = state.current_section;
        }
    }

    /* ── Completion UI ── */
    function showCompletionUI() {
        clearQuickReplies();
        var container = document.getElementById("chatQuickReplies");
        if (!container) return;

        container.innerHTML = ''
            + '<div class="chat-completion">'
            + '  <button class="btn-complete" id="btnComplete">'
            + '    Angaben best\u00e4tigen &amp; Report starten'
            + '  </button>'
            + '  <button class="btn-edit" id="btnEdit">'
            + '    Angaben korrigieren'
            + '  </button>'
            + '</div>';

        document.getElementById("btnComplete").addEventListener("click", submitComplete);
        document.getElementById("btnEdit").addEventListener("click", function() {
            clearQuickReplies();
            sendMessage("Ich m\u00f6chte einige Angaben korrigieren.");
        });

        scrollToBottom();
    }

    function submitComplete() {
        var btn = document.getElementById("btnComplete");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Wird verarbeitet\u2026";
        }

        fetch(getApiBase() + "/api/chat/complete", {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify({
                session_id: chatState.sessionId,
                confirmed: true
            })
        })
        .then(function(res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function(data) {
            if (data.success && data.redirect_url) {
                try { localStorage.removeItem("chat_session_id"); } catch(e) {}
                window.location.href = data.redirect_url;
            } else {
                appendMessage("system", "Unerwartete Antwort vom Server. Bitte versuchen Sie es erneut.");
                if (btn) { btn.disabled = false; btn.textContent = "Angaben best\u00e4tigen & Report starten"; }
            }
        })
        .catch(function(err) {
            appendMessage("system", "Fehler beim Abschlie\u00dfen. Bitte versuchen Sie es erneut.");
            console.error("Chat complete failed:", err);
            if (btn) { btn.disabled = false; btn.textContent = "Angaben best\u00e4tigen & Report starten"; }
        });
    }

    /* ── Switch to Form ── */
    function switchToForm() {
        var btn = document.getElementById("chatSwitchToForm");
        var sessionId = chatState.sessionId;

        // No session — just show form without prefill
        if (!sessionId) {
            showFormView();
            return;
        }

        // Loading state on button
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Wird geladen\u2026";
        }

        // Fetch collected fields from backend
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
    }

    function showFormView() {
        document.getElementById("chat-container").style.display = "none";
        var card = document.getElementById("formbuilder-card");
        if (card) card.style.display = "block";
    }

    function prefillForm(fields) {
        try {
            // Merge chat fields into existing form autosave data
            var existing = {};
            try {
                var saved = localStorage.getItem("autosave_form_data");
                if (saved) existing = JSON.parse(saved);
            } catch(e) {}

            for (var key in fields) {
                if (fields.hasOwnProperty(key) && fields[key] != null) {
                    existing[key] = fields[key];
                }
            }

            localStorage.setItem("autosave_form_data", JSON.stringify(existing));
            localStorage.setItem("autosave_form_step", "0");

            // Re-initialize formbuilder to pick up new data
            if (typeof window.initFormBuilder === "function") {
                window.initFormBuilder();
            }

            // Show toast notification
            showPrefillToast(Object.keys(fields).length);
        } catch(e) {
            console.error("Prefill failed:", e);
        }
    }

    function showPrefillToast(count) {
        var toast = document.createElement("div");
        toast.className = "prefill-toast";
        toast.textContent = count + " Angaben aus dem Chat \u00fcbernommen";
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.classList.add("prefill-toast-hide");
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 4000);
    }

    /* ── Resume ── */
    function checkResume() {
        var isLoggedIn = false;
        try {
            isLoggedIn = window.AUTH && window.AUTH.hasAuthCookie();
        } catch(e) {}

        if (isLoggedIn) {
            fetch(getApiBase() + "/api/chat/sessions?status=active", {
                headers: getAuthHeaders(),
                credentials: "include"
            })
            .then(function(res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function(sessions) {
                if (sessions && sessions.length > 0) {
                    showResumePrompt(sessions[0].session_id, sessions[0]);
                }
            })
            .catch(function() {
                checkResumeLocalStorage();
            });
        } else {
            checkResumeLocalStorage();
        }
    }

    function checkResumeLocalStorage() {
        try {
            var savedSessionId = localStorage.getItem("chat_session_id");
            if (!savedSessionId) return;

            fetch(getApiBase() + "/api/chat/session/" + savedSessionId, {
                headers: getAuthHeaders(),
                credentials: "include"
            })
            .then(function(res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function(data) {
                if (data.state && data.state.status === "active") {
                    showResumePrompt(savedSessionId, data);
                }
            })
            .catch(function() {
                localStorage.removeItem("chat_session_id");
            });
        } catch(e) {}
    }

    function showResumePrompt(sessionId, summaryData) {
        var selector = document.getElementById("intake-mode-selector");
        if (!selector) return;

        var state = summaryData.state || summaryData;
        var progress = state.progress_percent || 0;

        var resumeDiv = document.createElement("div");
        resumeDiv.className = "chat-resume-banner";
        resumeDiv.innerHTML = ''
            + '<p><strong>Sie haben ein offenes Gespr\u00e4ch</strong><br>'
            + '(' + progress + '% abgeschlossen)</p>'
            + '<div class="resume-actions">'
            + '  <button class="btn-resume" id="btnResume">Fortsetzen</button>'
            + '  <button class="btn-restart" id="btnRestart">Neu starten</button>'
            + '</div>';

        selector.insertBefore(resumeDiv, selector.firstChild);

        document.getElementById("btnResume").addEventListener("click", function() {
            fetch(getApiBase() + "/api/chat/session/" + sessionId, {
                headers: getAuthHeaders(),
                credentials: "include"
            })
            .then(function(res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function(sessionData) {
                chatState.sessionId = sessionId;
                try { localStorage.setItem("chat_session_id", sessionId); } catch(e) {}

                document.getElementById("intake-mode-selector").style.display = "none";
                var card = document.getElementById("formbuilder-card");
                if (card) card.style.display = "none";
                document.getElementById("chat-container").style.display = "flex";

                renderChatContainer();
                restoreSession(sessionData);
            })
            .catch(function(err) {
                console.error("Resume failed:", err);
            });
        });

        document.getElementById("btnRestart").addEventListener("click", function() {
            localStorage.removeItem("chat_session_id");
            resumeDiv.remove();
        });
    }

    function restoreSession(sessionData) {
        if (sessionData.session_id) {
            chatState.sessionId = sessionData.session_id;
        }

        hideDraftChip();

        var msgs = sessionData.messages || [];

        // Render messages with role normalization
        for (var i = 0; i < msgs.length; i++) {
            var msg = msgs[i];
            var role = msg.role || msg.sender || "user";
            if (role === "bot" || role === "model") role = "assistant";
            var content = msg.content || msg.text || "";
            if (!content) continue;
            appendMessage(role, content);
        }

        if (sessionData.state) {
            updateProgress(sessionData.state);
        }

        // Try quick replies from state, then sessionData, then last assistant message
        var qr = (sessionData.state && sessionData.state.quick_replies)
            || sessionData.quick_replies;
        if (!qr || !qr.length) {
            for (var j = msgs.length - 1; j >= 0; j--) {
                var m = msgs[j];
                var r = m.role || m.sender || "user";
                if (r === "bot" || r === "model") r = "assistant";
                if (r === "assistant" && m.quick_replies && m.quick_replies.length) {
                    qr = m.quick_replies;
                    break;
                }
            }
        }

        if (qr && qr.length) {
            renderQuickReplies(qr);
        } else if (msgs.length > 0) {
            // No quick replies available — trigger next turn from bot
            sendMessage("", { _resumeTrigger: true });
        }

        // Restore pending draft if present
        var state = sessionData.state;
        if (state && state.pending_field && state.pending_value != null) {
            handleDraftValue({
                field: state.pending_field,
                value: state.pending_value,
                label: state.pending_label || state.pending_field
            });
        }

        scrollToBottom();

        var input = document.getElementById("chatInput");
        if (input) input.focus();
    }

    /* ── Accessibility ── */
    function announceForScreenReader(text) {
        var announcer = document.getElementById("chatAnnouncer");
        if (!announcer) {
            announcer = document.createElement("div");
            announcer.id = "chatAnnouncer";
            announcer.setAttribute("aria-live", "assertive");
            announcer.setAttribute("role", "status");
            announcer.className = "sr-only";
            document.body.appendChild(announcer);
        }
        announcer.textContent = "";
        setTimeout(function() { announcer.textContent = text; }, 50);
    }

    /* ── Public API ── */
    window.initChat = initChat;

    /* ── Init on page load (R1 page only) ── */
    function init() {
        if (!document.getElementById("intake-mode-selector")) return;

        var card = document.getElementById("formbuilder-card");
        if (card) card.style.display = "none";

        renderModeSelector();
        checkResume();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
