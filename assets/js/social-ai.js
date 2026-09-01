(function () {
  "use strict";

  const KEY = "6LfZcKItAAAAAMqw7z5Dxm7eioGfUTlk17V_iaGZ";
  let lastPayload = null, config = null;

  const $ = id => document.getElementById(id);

  const setFormError = msg => { if ($("form-error")) $("form-error").textContent = msg || ""; };

  function setLoading(isLoading) {
    const btn = $("generate-btn"), box = $("result-box"), txt = $("result-text");
    if (btn) { btn.disabled = isLoading; btn.setAttribute("aria-busy", isLoading ? "true" : "false"); }
    if (isLoading && box && txt) {
      box.hidden = false; box.setAttribute("aria-busy", "true");
      txt.innerHTML = '<div class="flex items-center gap-2" role="status"><span class="spinner"></span><span>Generating…</span></div>';
    } else if (box) { box.removeAttribute("aria-busy"); }
  }

  function showResultText(text) {
    if ($("result-box") && $("result-text")) { $("result-text").textContent = text; $("result-box").hidden = false; }
  }

  function generatePrompt(p) {
    const sys = "You are Gamermaid AI, a specialized social media assistant. ";
    switch(p.tool) {
      case "caption": return `${sys}Write an engaging social caption about "${p.topic}". Platform: ${p.platform}. Tone: ${p.tone}. Language: ${p.language}. Include emojis and a CTA.`;
      case "hashtag": return `${sys}Find trending and relevant hashtags for: "${p.topic}". Language: ${p.language}.`;
      case "youtube-title": return `${sys}Generate 5 catchy, SEO-friendly YouTube titles for: "${p.topic}". Tone: ${p.tone}. Language: ${p.language}.`;
      case "youtube-description": return `${sys}Write a full YouTube description for: "${p.topic}". Tone: ${p.tone}. Language: ${p.language}.`;
      case "bio": return `${sys}Craft a brief profile bio about: "${p.topic}". Platform: ${p.platform}. Tone: ${p.tone}. Language: ${p.language}.`;
      case "post-ideas": return `${sys}Brainstorm 5 high-engagement post ideas for: "${p.topic}". Tone: ${p.tone}. Language: ${p.language}.`;
      case "script": return `${sys}Write a short-form video script (under 60s) about: "${p.topic}". Include visual cues in brackets. Tone: ${p.tone}. Language: ${p.language}.`;
      case "comment-reply": return `${sys}Write an on-brand reply to this social comment/topic: "${p.topic}". Tone: ${p.tone}. Language: ${p.language}.`;
      case "content-calendar": return `${sys}Create a detailed 7-day social media content calendar table for: "${p.topic}". Tone: ${p.tone}. Language: ${p.language}.`;
      default: return `Write content about "${p.topic}".`;
    }
  }

  async function runRequest(payload) {
    lastPayload = payload; setFormError(""); setLoading(true);
    try {
      const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js");
      const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import("https://www.gstatic.com/firebasejs/12.18.0/firebase-app-check.js");
      const { getAI, getGenerativeModel, GoogleAIBackend } = await import("https://www.gstatic.com/firebasejs/12.18.0/firebase-ai.js");

      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

      const app = getApps().length ? getApps()[0] : initializeApp(window.__FIREBASE_CONFIG__);

      try {
        initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(KEY), isTokenAutoRefreshEnabled: true });
      } catch (e) {}

      const ai = getAI(app, { backend: new GoogleAIBackend() });
      const model = getGenerativeModel(ai, { model: "gemini-3.7-flash" });

      const result = await model.generateContent(generatePrompt(payload));
      setLoading(false); showResultText(result.response.text());
    } catch (err) {
      setLoading(false); console.error(err); showResultText("Error generating: " + (err.message || err));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      tool: config.tool,
      topic: $("topic") ? $("topic").value.trim() : "",
      platform: $("platform") ? $("platform").value : "",
      tone: $("tone") ? $("tone").value : "",
      language: $("language") ? $("language").value : "",
    };
    if (!payload.topic) { setFormError("Please enter a topic."); if ($("topic")) $("topic").focus(); return; }
    setFormError(""); runRequest(payload);
  }

  function handleCopy() {
    const txt = $("result-text"), btn = $("copy-btn");
    if (!txt || !btn || !txt.textContent.trim()) return;
    const orig = btn.textContent;
    navigator.clipboard.writeText(txt.textContent).then(() => {
      btn.textContent = "Copied"; setTimeout(() => btn.textContent = orig, 1500);
    });
  }

  function wireFavoriteToggle() {
    const btn = document.querySelector("[data-favorite-toggle]");
    if (!btn || !config) return;
    function render() {
      const isFav = window.GM_IS_FAVORITE ? window.GM_IS_FAVORITE(config.tool) : false;
      btn.classList.toggle("is-active", isFav);
    }
    btn.addEventListener("click", () => {
      if (window.GM_TOGGLE_FAVORITE) window.GM_TOGGLE_FAVORITE(config.tool, btn.getAttribute("data-tool-title") || document.title, btn.getAttribute("data-tool-url") || "");
      render();
    });
    render();
  }

  window.GM_INIT_SOCIAL_TOOL = function (cfg) {
    config = cfg || {};
    if ($("social-form")) $("social-form").addEventListener("submit", handleSubmit);
    if ($("copy-btn")) $("copy-btn").addEventListener("click", handleCopy);
    if ($("regenerate-btn")) $("regenerate-btn").addEventListener("click", () => { if (lastPayload) runRequest(lastPayload); });
    if ($("clear-btn")) $("clear-btn").addEventListener("click", () => {
      if ($("social-form")) $("social-form").reset(); setFormError("");
      if ($("result-box")) $("result-box").hidden = true; lastPayload = null;
    });
    wireFavoriteToggle();
    if (window.GM_TRACK_TOOL_USE && config.tool) {
      window.GM_TRACK_TOOL_USE(config.tool, document.title.split("—")[0].trim() || config.tool, "social-media/" + config.tool + ".html");
    }
  };
})();
