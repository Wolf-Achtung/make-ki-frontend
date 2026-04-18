(function () {
  "use strict";

  const API_BASE = "https://api-ki-backend-neu-production.up.railway.app";

  const state = {
    initialized: false,
    history: [],
    isStreaming: false,
    sessionMeta: null,
  };

  const el = {
    loading: document.getElementById("coach-loading"),
    error: document.getElementById("coach-error"),
    errorMsg: document.querySelector("#coach-error .error-message"),
    chat: document.getElementById("coach-chat"),
    messages: document.getElementById("messages"),
    input: document.getElementById("user-input"),
    sendBtn: document.getElementById("send-btn"),
    btnText: document.querySelector("#send-btn .btn-text"),
    btnLoading: document.querySelector("#send-btn .btn-loading"),
  };

  const pathMatch = window.location.pathname.match(/\/coach\/(\d+)\/?$/);
  if (!pathMatch) {
    showError("Ungültige URL. Bitte verwenden Sie den Link aus Ihrer Email.");
    return;
  }
  const briefingId = parseInt(pathMatch[1], 10);

  async function init() {
    try {
      const res = await fetch(`${API_BASE}/api/coach/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefing_id: briefingId }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          showError("Report nicht gefunden. Bitte prüfen Sie den Link aus Ihrer Email.");
        } else {
          showError(`Verbindung zum Coach nicht möglich (${res.status}). Bitte später erneut versuchen.`);
        }
        return;
      }

      state.sessionMeta = await res.json();
      state.initialized = true;

      el.loading.classList.add("hidden");
      el.chat.classList.remove("hidden");

      await sendMessage("Starte die Coaching-Session.", { silent: true });

      el.input.focus();
    } catch (e) {
      console.error("[coach] init error:", e);
      showError("Verbindung zum Coach nicht möglich. Bitte später erneut versuchen.");
    }
  }

  async function sendMessage(message, opts) {
    if (!state.initialized || state.isStreaming) return;

    const silent = !!(opts && opts.silent);

    if (!silent) {
      appendMessage("user", message);
    }

    const historyBeforeRequest = state.history.slice();
    state.history.push({ role: "user", content: message });

    el.input.value = "";
    autoResizeInput();
    setStreamingState(true);

    const assistantEl = appendMessage("assistant", "");
    let fullResponse = "";
    let rollbackUserMessage = true;

    try {
      const res = await fetch(`${API_BASE}/api/coach/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefing_id: briefingId,
          message: message,
          history: historyBeforeRequest,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamErrored = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);

          if (data === "[DONE]") {
            continue;
          }

          if (data.startsWith("[ERROR]")) {
            const errMsg = data.slice(7).trim();
            console.error("[coach] stream error:", errMsg);
            assistantEl.innerHTML =
              `<em class="error-text">Fehler: ${escapeHtml(errMsg)}</em>`;
            streamErrored = true;
            break;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed && typeof parsed.text === "string") {
              fullResponse += parsed.text;
              assistantEl.innerHTML = renderMarkdown(fullResponse);
              scrollToBottom();
            }
          } catch (parseErr) {
            console.warn("[coach] could not parse frame:", data, parseErr);
          }
        }

        if (streamErrored) break;
      }

      if (streamErrored) {
        return;
      }

      state.history.push({ role: "assistant", content: fullResponse });
      rollbackUserMessage = false;
    } catch (e) {
      console.error("[coach] sendMessage error:", e);
      assistantEl.innerHTML =
        `<em class="error-text">Fehler beim Laden der Antwort. Bitte versuchen Sie es erneut.</em>`;
    } finally {
      if (rollbackUserMessage) {
        state.history.pop();
      }
      setStreamingState(false);
      el.input.focus();
    }
  }

  function appendMessage(role, content) {
    const div = document.createElement("div");
    div.className = `message message-${role}`;
    div.innerHTML = renderMarkdown(content);
    el.messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function renderMarkdown(text) {
    let html = escapeHtml(text);

    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    html = html.replace(
      /(^|\s)\*([^*\n]+?)\*(?=\s|[.,;:!?]|$)/g,
      function (_m, pre, inner) {
        return `${pre}<em>${inner}</em>`;
      }
    );

    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");
    html = `<p>${html}</p>`;
    html = html.replace(/<p><\/p>/g, "");

    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollToBottom() {
    el.messages.scrollTop = el.messages.scrollHeight;
  }

  function setStreamingState(isStreaming) {
    state.isStreaming = isStreaming;
    el.sendBtn.disabled = isStreaming;
    el.input.disabled = isStreaming;
    if (isStreaming) {
      el.btnText.classList.add("hidden");
      el.btnLoading.classList.remove("hidden");
    } else {
      el.btnText.classList.remove("hidden");
      el.btnLoading.classList.add("hidden");
    }
  }

  function autoResizeInput() {
    el.input.style.height = "auto";
    el.input.style.height = Math.min(el.input.scrollHeight, 200) + "px";
  }

  function showError(msg) {
    if (el.loading) el.loading.classList.add("hidden");
    if (el.chat) el.chat.classList.add("hidden");
    if (el.errorMsg) el.errorMsg.textContent = msg;
    if (el.error) el.error.classList.remove("hidden");
  }

  el.sendBtn.addEventListener("click", function () {
    const msg = el.input.value.trim();
    if (msg && !state.isStreaming) {
      sendMessage(msg);
    }
  });

  el.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const msg = el.input.value.trim();
      if (msg && !state.isStreaming) {
        sendMessage(msg);
      }
    }
  });

  el.input.addEventListener("input", autoResizeInput);

  init();
})();
