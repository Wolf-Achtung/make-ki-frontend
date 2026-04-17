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

    /* ── Summary Marker (backend contract, mirrors SUMMARY_MARKER in backend) ── */
    var SUMMARY_MARKER = "**Zusammenfassung Ihrer Angaben:**";

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
            + '  <div class="chat-smart-chips" id="chatSmartChips" role="group" aria-label="Formulierungs-Vorschl\u00e4ge"></div>'
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

        // Feature-Flag aus HTML lesen — Smart-Chips nur aktiv, wenn data-smart-chips="1" gesetzt ist
        SMART_CHIPS_ENABLED = !!document.querySelector('[data-smart-chips="1"]');

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
        if (document.getElementById("chatTypingIndicator")) return;
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

    /* ── Report Redirect (Bug A Fix) ── */
    function handleReportRedirect(data) {
        if (!data || !data.redirect_url) return;
        try { localStorage.removeItem("chat_session_id"); } catch(e) {}
        setTimeout(function() {
            window.location.href = data.redirect_url;
        }, 2000);
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
        clearSmartChips();
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
                                if (currentEvent === 'draft_value' || currentEvent === 'field_confirmed' || currentEvent === 'dialog_mode') {
                                    console.log('🔥 SSE-PARSER: Parsed event=' + currentEvent + ', raw dataStr=' + dataStr);
                                }
                                handleSSEEvent(currentEvent, data);
                            } catch(e) {
                                console.warn("SSE parse error:", e, dataStr);
                                if (currentEvent === 'draft_value') {
                                    console.error('🔥 SSE-PARSER: FAILED to parse draft_value data! Raw:', dataStr);
                                }
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

                    case "typing":
                        showTypingIndicator();
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
                        _collectedFields = data.collected_fields || {};
                        renderSmartChipsIfApplicable(data);
                        if (data.is_completable === true) {
                            showCompletionUI();
                        }
                        break;

                    case "quick_replies":
                        renderQuickReplies(data);
                        break;

                    case "preview_qr":
                        if (data && data.length) {
                            renderQuickReplies(data, { preview: true });
                        }
                        break;

                    case "draft_value":
                        console.log('SSE draft_value received:', JSON.stringify(data));
                        handleDraftValue(data);
                        setTimeout(function() {
                            var chip = document.getElementById("draftChip");
                            if (chip && !chip.classList.contains("draft-active")) {
                                console.log('Draft chip backup trigger');
                                handleDraftValue(data);
                            }
                        }, 150);
                        break;

                    case "field_confirmed":
                        handleFieldConfirmed(data);
                        break;

                    case "dialog_mode":
                        handleDialogMode(data);
                        break;

                    case "done":
                        finishStream(data);
                        break;

                    case "report_started":
                        handleReportRedirect(data);
                        break;

                    case "error":
                        hideTypingIndicator();
                        appendMessage("system", data.message || "Ein Fehler ist aufgetreten.");
                        chatState.isStreaming = false;
                        break;
                }
            }

            function finishStream(doneData) {
                hideTypingIndicator();
                chatState.isStreaming = false;

                // Template-Turn: No token events were sent, so streamDiv was never created.
                // Create the bot message container now so the done text can be rendered.
                if (doneData && doneData.text && !streamDiv) {
                    streamDiv = document.createElement("div");
                    streamDiv.className = "chat-message chat-message-assistant";
                    document.getElementById("chatMessages").appendChild(streamDiv);
                }

                // Set final text: for template turns this is the only text,
                // for streamed turns this replaces raw tokens with post-processed text (Bug C Fix)
                if (doneData && doneData.text && streamDiv) {
                    fullResponse = doneData.text;
                    streamDiv.innerHTML = formatMessageContent(fullResponse);
                    scrollToBottom();
                }

                // Render quick_replies from done payload (template turns bundle them here)
                if (doneData && doneData.quick_replies) {
                    renderQuickReplies(doneData.quick_replies);
                } else {
                    // V5-FE: Activate preview QR buttons if no new QR set arrives
                    activatePreviewButtons();
                }

                if (fullResponse) {
                    chatState.messages.push({ role: "assistant", content: fullResponse });
                    announceForScreenReader("Neue Nachricht vom Assistenten");
                    // Check if response is a summary and render as cards
                    if (fullResponse.indexOf(SUMMARY_MARKER) !== -1 && streamDiv) {
                        console.info("[EditMode] Summary marker detected, rendering cards");
                        renderSummaryCards(streamDiv, fullResponse);
                    } else if (_currentPhase === "zusammenfassung") {
                        console.warn("[EditMode] Summary marker not found in response — _summaryFields will remain empty");
                    }
                }

                // Bug A Fix: Redirect to report dashboard if briefing was created
                if (doneData && doneData.briefing_id && doneData.redirect_url) {
                    handleReportRedirect(doneData);
                    return; // Skip input re-enable — user is being redirected
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
    function renderQuickReplies(replies, opts) {
        if (_editMode) return; // Preserve edit panel — QR buttons suppressed in edit mode

        var container = document.getElementById("chatQuickReplies");
        if (!container) return;

        // V5-FE: Preview mode — only clear if not already showing preview buttons
        var isPreview = opts && opts.preview;
        if (!isPreview) {
            container.innerHTML = "";
        } else {
            // Don't overwrite existing non-preview buttons
            if (container.children.length && !container.querySelector(".qr-btn--preview")) {
                return;
            }
            container.innerHTML = "";
        }

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

        // Route meta-action QRs (e.g. __summary_action__) to dedicated completion UI
        for (var m = 0; m < replies.length; m++) {
            if (replies[m].field && replies[m].field === "__summary_action__") {
                showCompletionUI();
                return;
            }
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

                // V8-FE: Apply primary/secondary styling from backend
                if (option.style) {
                    btn.classList.add("qr-btn--" + option.style);
                }

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

                // V5-FE: Preview mode — buttons disabled and semi-transparent
                if (isPreview) {
                    btn.disabled = true;
                    btn.classList.add("qr-btn--preview");
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

        // V3: Send immediately — no undo bar, correction only in summary
        sendMessage(label, {
            quick_reply_field: field,
            quick_reply_value: value
        });
    }

    function clearQuickReplies() {
        if (_editMode) return; // Preserve edit panel
        var container = document.getElementById("chatQuickReplies");
        if (container) container.innerHTML = "";
    }

    function activatePreviewButtons() {
        var previews = document.querySelectorAll(".qr-btn--preview");
        for (var i = 0; i < previews.length; i++) {
            previews[i].disabled = false;
            previews[i].classList.remove("qr-btn--preview");
        }
    }

    /* ── Smart-Chips (Sprint C1) ─────────────────────────────────────────
     * Vorschlags-Chips für Freitext-Felder. Datenquelle: window.SMART_CHIPS_DE
     * (smart-chips-de.js) + window.getSmartChips(field, branche). Briefing:
     * docs/sprints/sprint-c1-smart-chips-briefing.md
     * ────────────────────────────────────────────────────────────────── */

    function clearSmartChips() {
        var container = document.getElementById("chatSmartChips");
        if (container) {
            container.innerHTML = "";
            container.classList.remove("smart-chips--active");
        }
        _lastRenderedField = null;
    }

    function renderSmartChipsIfApplicable(state) {
        // Suppression-Matrix (alle 6 Punkte gegen-prüfen, sonst clear + return)
        if (!SMART_CHIPS_ENABLED) return clearSmartChips();
        if (!state) return clearSmartChips();

        var field = state.next_fields && state.next_fields[0];
        if (!field) return clearSmartChips();

        // Backend-Vertrag: chat_mode "FT" = Free Text (Textarea), "QR" = Quick Reply (Enum)
        // Verifiziert via Live-Debug am 2026-04-17 (Session auf make.ki-sicherheit.jetzt/formular/)
        var meta = state.next_fields_meta && state.next_fields_meta[field];
        var mode = meta && meta.chat_mode;
        if (mode !== "FT") return clearSmartChips();

        if (state.pending_field) return clearSmartChips();
        if (_editMode) return clearSmartChips();

        var branche = _collectedFields && _collectedFields.branche;
        var chips = (typeof window.getSmartChips === "function")
            ? window.getSmartChips(field, branche)
            : null;
        if (!chips || !chips.length) return clearSmartChips();

        // Idempotenz: gleiches Feld → DOM nicht neu bauen (erhält .smart-chip--used-Zustand)
        if (field === _lastRenderedField) return;

        renderChipsDom(field, chips);
        _lastRenderedField = field;
    }

    function renderChipsDom(fieldKey, chips) {
        var container = document.getElementById("chatSmartChips");
        if (!container) return;

        var html = '<div class="smart-chips-label">Vorschl\u00e4ge — klicken zum \u00dcbernehmen, frei erg\u00e4nzbar:</div>';
        html += '<div class="smart-chips-group" data-field="' + escapeHtml(fieldKey) + '">';
        for (var i = 0; i < chips.length; i++) {
            var text = String(chips[i]);
            html += '<button type="button" class="smart-chip"'
                  + ' data-chip-text="' + escapeHtml(text) + '"'
                  + ' aria-label="Vorschlag \u00fcbernehmen: ' + escapeHtml(text) + '"'
                  + ' aria-pressed="false">'
                  + '+ ' + escapeHtml(text)
                  + '</button>';
        }
        html += '</div>';

        container.innerHTML = html;
        container.classList.add("smart-chips--active");
    }

    /* ── Edit-Mode State ── */
    var _editMode = false;
    var _summaryFields = []; // Parsed summary sections stored for edit mode

    /* ── Draft-Chip State ── */
    var currentDraft = null;

    function createFallbackDraftChip() {
        if (document.getElementById("draftChip")) return;

        var parent = document.getElementById("chat-container");
        if (!parent) return;

        var inputArea = parent.querySelector(".chat-input-area");
        var chip = document.createElement("div");
        chip.id = "draftChip";
        chip.className = "draft-chip";
        chip.style.display = "none";
        chip.innerHTML = ''
            + '<div class="draft-chip-header">'
            + '  <span class="draft-chip-icon">\uD83D\uDCDD</span>'
            + '  <span class="draft-chip-label" id="draftChipLabel">Erkannt</span>'
            + '</div>'
            + '<div class="draft-chip-value" id="draftChipValue"></div>'
            + '<div class="draft-chip-actions" id="draftChipActions">'
            + '  <button class="draft-confirm-btn" id="draftConfirmBtn">\u2713 \u00dcbernehmen</button>'
            + '  <button class="draft-edit-btn" id="draftEditBtn">\u270f\ufe0f \u00c4ndern</button>'
            + '</div>';

        if (inputArea) {
            parent.insertBefore(chip, inputArea);
        } else {
            parent.appendChild(chip);
        }

        chip.addEventListener("click", function(e) {
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

        console.log('Draft chip: fallback element created');
    }

    function handleDraftValue(data) {
        clearSmartChips();
        // data = { field, value, label }
        console.log('Draft event received:', JSON.stringify(data));

        currentDraft = data;
        window.currentDraft = data;

        var chip = document.getElementById("draftChip");

        if (!chip) {
            console.warn('draftChip not found, creating fallback');
            createFallbackDraftChip();
            chip = document.getElementById("draftChip");
        }

        if (!chip) {
            console.error('Could not create draftChip');
            return;
        }

        var label = document.getElementById("draftChipLabel");
        var value = document.getElementById("draftChipValue");
        var actions = document.getElementById("draftChipActions");

        if (label) label.textContent = data.label || "Erkannt";

        if (value) {
            if (Array.isArray(data.value)) {
                value.textContent = data.value.join(", ");
            } else {
                value.textContent = String(data.value);
            }
        }

        chip.classList.remove("draft-confirmed", "draft-confirming");
        if (actions) {
            actions.innerHTML = ''
                + '<button class="draft-confirm-btn" id="draftConfirmBtn">\u2713 \u00dcbernehmen</button>'
                + '<button class="draft-edit-btn" id="draftEditBtn">\u270f\ufe0f \u00c4ndern</button>';
        }

        chip.classList.add("draft-active");
        chip.style.setProperty("display", "block", "important");
        chip.style.visibility = "visible";
        chip.style.opacity = "1";

        scrollToBottom();

        setTimeout(function() {
            if (chip && chip.classList.contains("draft-active")) {
                chip.style.setProperty("display", "block", "important");
            }
        }, 100);
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
            chip.classList.remove("draft-active", "draft-confirmed");
            chip.style.setProperty("display", "none", "important");
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
        if (chip) {
            chip.classList.remove("draft-active");
            chip.style.setProperty("display", "none", "important");
        }
        currentDraft = null;
        window.currentDraft = null;
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

        // Store fields for edit mode
        _summaryFields = sections;

        // If in edit mode, refresh the edit panel with updated values
        if (_editMode) {
            renderEditMode();
        }

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

    /* ── Edit Mode ── */
    function renderEditMode() {
        var container = document.getElementById("chatQuickReplies");
        if (!container) return;
        if (!_summaryFields.length) return;

        container.innerHTML = "";

        var panel = document.createElement("div");
        panel.className = "edit-mode-panel";
        panel.id = "editModePanel";

        var header = document.createElement("div");
        header.className = "edit-mode-header";
        header.textContent = "Welches Feld m\u00f6chten Sie \u00e4ndern?";
        panel.appendChild(header);

        for (var i = 0; i < _summaryFields.length; i++) {
            var section = _summaryFields[i];
            if (!section.fields || !section.fields.length) continue;

            var sectionTitle = document.createElement("div");
            sectionTitle.className = "edit-section-title";
            sectionTitle.textContent = section.title;
            panel.appendChild(sectionTitle);

            for (var j = 0; j < section.fields.length; j++) {
                var field = section.fields[j];
                var row = document.createElement("div");
                row.className = "edit-field-row";

                var labelSpan = document.createElement("span");
                labelSpan.className = "edit-field-label";
                labelSpan.textContent = field.label;

                var valueSpan = document.createElement("span");
                valueSpan.className = "edit-field-value";
                valueSpan.textContent = field.value;

                var btn = document.createElement("button");
                btn.className = "edit-field-btn";
                btn.textContent = "\u00c4ndern";
                btn.dataset.fieldLabel = field.label;
                btn.addEventListener("click", (function(fieldLabel) {
                    return function() {
                        // Highlight the field being edited
                        var rows = panel.querySelectorAll(".edit-field-row");
                        for (var r = 0; r < rows.length; r++) {
                            rows[r].classList.remove("edit-field-active");
                        }
                        this.closest(".edit-field-row").classList.add("edit-field-active");

                        sendMessage('Ich m\u00f6chte "' + fieldLabel + '" \u00e4ndern.');
                    };
                })(field.label));

                row.appendChild(labelSpan);
                row.appendChild(valueSpan);
                row.appendChild(btn);
                panel.appendChild(row);
            }
        }

        // Footer with action button
        var footer = document.createElement("div");
        footer.className = "edit-mode-footer";

        var completeBtn = document.createElement("button");
        completeBtn.className = "edit-mode-complete-btn";
        completeBtn.textContent = "Fertig \u2014 Auswertung starten";
        completeBtn.addEventListener("click", function() {
            exitEditMode();
            submitComplete();
        });
        footer.appendChild(completeBtn);

        panel.appendChild(footer);
        container.appendChild(panel);

        scrollToBottom();
    }

    function exitEditMode() {
        _editMode = false;
        var container = document.getElementById("chatQuickReplies");
        if (container) container.innerHTML = "";
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

    /* ── Smart-Chips State (Sprint C1) ── */
    var _collectedFields = {};       // Spiegel von state.collected_fields, replace bei jedem state_update
    var _lastRenderedField = null;   // Idempotenz-Guard: gleiches Feld → kein Re-Render
    var SMART_CHIPS_ENABLED = false; // HTML-Feature-Flag (data-smart-chips="1"), in initChat gesetzt

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

        // Block progress bar (V7-FE)
        updateBlockProgress(state);

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

    function updateBlockProgress(state) {
        var bar = document.getElementById("block-progress-bar");

        // Hide progress bar when not in a block (phase 1a/1b, summary, no block data)
        if (!state.current_block || !state.block_total) {
            if (bar) bar.style.display = "none";
            return;
        }

        if (!bar) {
            bar = document.createElement("div");
            bar.id = "block-progress-bar";
            bar.className = "block-progress-bar";
            var inputArea = document.querySelector(".chat-input-area");
            if (inputArea && inputArea.parentElement) {
                inputArea.parentElement.insertBefore(bar, inputArea);
            }
        }

        bar.style.display = "flex";
        var progress = state.block_progress || 0;
        var total = state.block_total;
        var pct = Math.round((progress / total) * 100);
        var label = state.block_label || BLOCK_LABELS[state.current_block] || state.current_block;

        bar.innerHTML = ''
            + '<span class="bp-label">' + escapeHtml(label) + '</span>'
            + '<div class="bp-track">'
            + '  <div class="bp-fill" style="width: ' + pct + '%"></div>'
            + '</div>'
            + '<span class="bp-count">' + progress + '/' + total + '</span>';
    }

    /* ── Completion UI ── */
    function showCompletionUI() {
        if (_editMode) return; // Don't overwrite edit panel

        clearQuickReplies();
        var container = document.getElementById("chatQuickReplies");
        if (!container) return;

        container.innerHTML = ''
            + '<div class="chat-completion">'
            + '  <button class="btn-complete" id="btnComplete">'
            + '    Angaben best\u00e4tigen &amp; Report starten'
            + '  </button>'
            + '  <button class="btn-edit" id="btnEdit">Angaben korrigieren</button>'
            + '</div>';

        document.getElementById("btnComplete").addEventListener("click", submitComplete);
        document.getElementById("btnEdit").addEventListener("click", function() {
            if (!_summaryFields.length) return;
            _editMode = true;
            renderEditMode();
            sendMessage("Ich m\u00f6chte einige Angaben korrigieren.", { _hideUserMessage: true });
        });

        scrollToBottom();
    }

    function submitComplete() {
        var btn = document.getElementById("btnComplete");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Wird verarbeitet\u2026";
        }

        sendMessage("Auswertung starten", {
            quick_reply_field: "__summary_action__",
            quick_reply_value: "__start_report__",
            _hideUserMessage: true
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

    /* ── Smart-Chips Click-Delegation (Sprint C1) ── */
    document.addEventListener("click", function(e) {
        var chip = e.target.closest && e.target.closest(".smart-chip");
        if (!chip) return;

        var chipText = chip.dataset.chipText || chip.textContent.replace(/^\+\s*/, "");
        var input = document.getElementById("chatInput");
        if (!input) return;

        var current = input.value.trim();
        var separator = current ? (current.slice(-1) === "." ? " " : ", ") : "";
        input.value = current + separator + chipText;

        // Auto-Resize triggern (existierender Listener auf "input")
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();

        chip.classList.add("smart-chip--used");
        chip.setAttribute("aria-pressed", "true");
    });

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
