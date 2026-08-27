/* ==========================================================================
   Gamermaid — social-ai.js
   Shared logic for all 9 Social Media Studio tool pages (caption, hashtag,
   youtube-title, youtube-description, bio, post-ideas, script,
   comment-reply, content-calendar).

   Each tool page includes this script AFTER the standard script order
   (main.js, search-index.js, dropdown.js, navbar.js, firebase-config.js,
   auth.js) and then calls, in its own trailing inline <script>:

     window.GM_INIT_SOCIAL_TOOL({
       tool: "caption",              // one of the 9 tool slugs
       resultLabel: "Generated Caption"
     });

   ----------------------------------------------------------------------
   REQUIRED DOM CONTRACT — every tool page must render this exact markup
   (ids matter, classes can be styled but ids must match):

     <form id="social-form">
       <input id="topic">
       <select id="platform">...</select>
       <select id="tone">...</select>
       <select id="language">...</select>
       <div id="form-error" aria-live="polite"></div>
       <button id="generate-btn" type="submit">Generate Content</button>
     </form>

     <div id="result-box" hidden>
       <div id="result-text"></div>
       <button id="copy-btn">Copy</button>
       <button id="regenerate-btn">Regenerate</button>
       <button id="clear-btn">Clear</button>
     </div>

   API contract:
     POST https://gamermaid-social-ai-api.tze-oms.workers.dev/
     body: { tool, topic, platform, tone, language }
     No Authorization header / API key — the worker is public.
   ========================================================================== */

(function () {
  "use strict";

  const API_URL = "https://gamermaid-social-ai-api.tze-oms.workers.dev/";

  let lastPayload = null;
  let config = null;

  function $(id) {
    return document.getElementById(id);
  }

  function setFormError(message) {
    const el = $("form-error");
    if (!el) return;
    el.textContent = message || "";
  }

  function setLoading(isLoading) {
    const btn = $("generate-btn");
    const resultBox = $("result-box");
    const resultText = $("result-text");

    if (btn) {
      btn.disabled = isLoading;
      btn.setAttribute("aria-busy", isLoading ? "true" : "false");
    }

    if (isLoading && resultBox && resultText) {
      resultBox.hidden = false;
      resultBox.setAttribute("aria-busy", "true");
      resultText.innerHTML =
        '<div class="flex items-center gap-2" role="status" aria-live="polite">' +
        '<span class="spinner" aria-hidden="true"></span>' +
        "<span>Generating…</span>" +
        "</div>";
    } else if (resultBox) {
      resultBox.removeAttribute("aria-busy");
    }
  }

  function showResultText(text) {
    const resultBox = $("result-box");
    const resultText = $("result-text");
    if (!resultBox || !resultText) return;
    resultText.textContent = text;
    resultBox.hidden = false;
  }

  function extractResultText(data) {
    if (data == null) return null;
    if (typeof data === "string") {
      const trimmed = data.trim();
      return trimmed.length ? trimmed : null;
    }
    if (typeof data !== "object") return null;

    const candidates = [
      data.result,
      data.text,
      data.output,
      data.content,
      data.message,
      data.caption,
      data.data,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length) {
        return candidate.trim();
      }
    }

    return null;
  }

  function extractErrorMessage(data) {
    if (data && typeof data === "object") {
      if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
      if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
    }
    return null;
  }

  async function runRequest(payload) {
    lastPayload = payload;
    setFormError("");
    setLoading(true);

    let response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      setLoading(false);
      showResultText("Network error, please try again.");
      return;
    }

    let data = null;
    let rawText = null;
    try {
      rawText = await response.text();
      data = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      data = null;
    }

    setLoading(false);

    if (!response.ok) {
      const errMessage = extractErrorMessage(data) || "Something went wrong. Please try again.";
      showResultText(errMessage);
      return;
    }

    const resultText = extractResultText(data) || (typeof rawText === "string" && rawText.trim().length ? rawText.trim() : null);

    if (!resultText) {
      showResultText("Gamermaid received an unexpected response. Please try again.");
      return;
    }

    showResultText(resultText);
  }

  function readFormPayload() {
    const topicEl = $("topic");
    const platformEl = $("platform");
    const toneEl = $("tone");
    const languageEl = $("language");

    return {
      tool: config.tool,
      topic: topicEl ? topicEl.value.trim() : "",
      platform: platformEl ? platformEl.value : "",
      tone: toneEl ? toneEl.value : "",
      language: languageEl ? languageEl.value : "",
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = readFormPayload();

    if (!payload.topic) {
      setFormError("Please enter a topic before generating.");
      const topicEl = $("topic");
      if (topicEl) topicEl.focus();
      return;
    }

    setFormError("");
    runRequest(payload);
  }

  function handleCopy() {
    const resultText = $("result-text");
    const copyBtn = $("copy-btn");
    if (!resultText || !copyBtn) return;

    const text = resultText.textContent || "";
    if (!text.trim()) return;

    const originalLabel = copyBtn.textContent;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = originalLabel;
        }, 1500);
      })
      .catch(() => {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => {
          copyBtn.textContent = originalLabel;
        }, 1500);
      });
  }

  function handleRegenerate() {
    if (!lastPayload) return;
    runRequest(lastPayload);
  }

  function handleClear() {
    const form = $("social-form");
    const resultBox = $("result-box");
    const resultText = $("result-text");

    if (form) form.reset();
    setFormError("");
    if (resultBox) resultBox.hidden = true;
    if (resultText) resultText.textContent = "";
    lastPayload = null;
  }

  function wireFavoriteToggle() {
    const favBtn = document.querySelector("[data-favorite-toggle]");
    if (!favBtn || !config) return;

    const slug = config.tool;
    const title = favBtn.getAttribute("data-tool-title") || document.title;
    const url = favBtn.getAttribute("data-tool-url") || "";

    function render() {
      const isFav = window.GM_IS_FAVORITE ? window.GM_IS_FAVORITE(slug) : false;
      favBtn.classList.toggle("is-active", isFav);
      favBtn.setAttribute("aria-label", isFav ? "Remove to favorites" : "Add to favorites");
      favBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
    }

    favBtn.addEventListener("click", () => {
      if (window.GM_TOGGLE_FAVORITE) window.GM_TOGGLE_FAVORITE(slug, title, url);
      render();
    });

    render();
  }

  window.GM_INIT_SOCIAL_TOOL = function GM_INIT_SOCIAL_TOOL(cfg) {
    config = cfg || {};

    const form = $("social-form");
    const copyBtn = $("copy-btn");
    const regenerateBtn = $("regenerate-btn");
    const clearBtn = $("clear-btn");

    if (form) form.addEventListener("submit", handleSubmit);
    if (copyBtn) copyBtn.addEventListener("click", handleCopy);
    if (regenerateBtn) regenerateBtn.addEventListener("click", handleRegenerate);
    if (clearBtn) clearBtn.addEventListener("click", handleClear);

    wireFavoriteToggle();

    if (window.GM_TRACK_TOOL_USE && config.tool) {
      const title = document.title.split("—")[0].trim() || config.tool;
      const url = "social-media/" + config.tool + ".html";
      window.GM_TRACK_TOOL_USE(config.tool, title, url);
    }
  };
})();
