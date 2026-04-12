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
            + '    <span class="mode-badge">Empfohlen · ca. 5–7 Min.</span>'
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
            + '    <span class="chat-progress" id="chatProgress" role="status">Schritt 1 von 8: Ihr Unternehmen</span>'
            + '  </div>'
            + '  <div class="chat-header-right">'
            + '    <div class="chat-progress-bar-container" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">'
            + '      <div class="chat-progress-bar" id="chatProgressBar" style="width:0%"></div>'
            + '    </div>'
            + '    <button class="chat-switch-btn" id="chatSwitchToForm">Zum Formular wechseln</button>'
            + '  </div>'
            + '</div>'
            + '<div class="chat-messages" id="chatMessages" role="log" aria-live="polite" aria-label="Chat-Verlauf"></div>'
            + '<div class="chat-quick-replies" id="chatQuickReplies" role="group" aria-label="Schnellantworten"></div>'
            + '<div class="chat-input-area">'
            + '  <textarea id="chatInput" placeholder="Je mehr Sie verraten, desto mehr Umsatzpotenzial findet die Analyse." rows="1" aria-label="Ihre Antwort eingeben"></textarea>'
            + '  <button id="chatSend" disabled aria-label="Nachricht senden">Senden</button>'
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
        var message = text || (input ? input.value.trim() : "");
        if (!message || chatState.isStreaming) return;

        appendMessage("user", message);

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

        fetch(getApiBase() + "/api/chat/message", {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify(Object.assign({
                session_id: chatState.sessionId,
                message: message
            }, extra || {}))
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
                }
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

        if (!replies || !replies.length) return;

        for (var r = 0; r < replies.length; r++) {
            var reply = replies[r];
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
                        };
                    })(group, maxSelect));
                } else {
                    btn.addEventListener("click", function() {
                        handleQuickReply(this.dataset.field, this.dataset.value, this.textContent);
                    });
                }

                group.appendChild(btn);
            }

            container.appendChild(group);

            if (isMulti) {
                var confirmBtn = document.createElement("button");
                confirmBtn.className = "qr-confirm-btn";
                confirmBtn.textContent = "Auswahl bestätigen \u2713";
                confirmBtn.addEventListener("click", (function(groupEl) {
                    return function() {
                        var selected = groupEl.querySelectorAll(".qr-btn-selected");
                        if (!selected.length) return;
                        var labels = [];
                        for (var i = 0; i < selected.length; i++) {
                            labels.push(selected[i].textContent);
                        }
                        sendMessage(labels.join(", "));
                    };
                })(group));
                container.appendChild(confirmBtn);
            }
        }

        scrollToBottom();
    }

    function handleQuickReply(field, value, label) {
        sendMessage(label, { quick_reply_field: field, quick_reply_value: value });
    }

    function clearQuickReplies() {
        var container = document.getElementById("chatQuickReplies");
        if (container) container.innerHTML = "";
    }

    /* ── Draft-Chip State ── */
    var currentDraft = null;

    function handleDraftValue(data) {
        // data = { field, value, label }
        // Implemented in Schritt 2
    }

    function handleFieldConfirmed(data) {
        // data = { field, value }
        // Implemented in Schritt 4
    }

    function handleDialogMode(data) {
        // data = { active: true|false }
        // Implemented in Schritt 5
    }

    /* ── Progress ── */
    function updateProgress(state) {
        if (!state) return;

        var progressEl = document.getElementById("chatProgress");
        if (progressEl && state.current_section_name != null) {
            progressEl.textContent = "Schritt " + (state.current_section + 1)
                + " von " + state.total_sections
                + ": " + state.current_section_name;
        }

        var bar = document.getElementById("chatProgressBar");
        if (bar && state.progress_percent != null) {
            bar.style.width = state.progress_percent + "%";
            var barContainer = bar.parentElement;
            if (barContainer) {
                barContainer.setAttribute("aria-valuenow", state.progress_percent);
            }
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
        document.getElementById("chat-container").style.display = "none";
        var card = document.getElementById("formbuilder-card");
        if (card) card.style.display = "block";
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

        var msgs = sessionData.messages || [];

        for (var i = 0; i < msgs.length; i++) {
            appendMessage(msgs[i].role, msgs[i].content);
        }

        if (sessionData.state) {
            updateProgress(sessionData.state);
        }

        var qr = (sessionData.state && sessionData.state.quick_replies)
            || sessionData.quick_replies;
        if (qr) {
            renderQuickReplies(qr);
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
