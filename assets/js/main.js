/* ==========================================================================
   Gamermaid — main.js
   Shared page init: copyright year, reduced-motion handling, localStorage
   helpers used by later pages (dashboard, favorites, recent tools).

   Load order: this file loads FIRST (see script order documented at the
   top of navbar.js), so it must not assume the header/footer exist yet
   when it runs — the year span, for example, is set on DOMContentLoaded.
   ========================================================================== */

(function () {
  "use strict";

  function setCopyrightYear() {
    const el = document.getElementById("copyright-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function applyReducedMotion() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let manualOverride = false;
    try {
      manualOverride = JSON.parse(window.localStorage.getItem("gm_pref_reduced_motion") || "false") === true;
    } catch (e) {
      manualOverride = false;
    }
    if (prefersReduced || manualOverride) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  }

  function init() {
    setCopyrightYear();
    applyReducedMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ========================================================================
     window.GM_STORAGE — safe localStorage JSON helper.
     Usage: GM_STORAGE.get("key", fallback), GM_STORAGE.set("key", value)
     ======================================================================== */
  window.GM_STORAGE = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  /* ========================================================================
     window.GM_TRACK_TOOL_USE(toolSlug, toolTitle, toolUrl)
     Call this on load of any tool page to record it as "recently used".
     Stored under localStorage key "gm_recent_tools", capped at 8 entries,
     most recent first, deduped by toolSlug. toolUrl should be the same
     "no leading slash, no base prefix" style used in search-index.js
     (e.g. "image-studio/upscaler.html") — pages should prefix it with
     their own `base` when rendering it back out.
     ======================================================================== */
  window.GM_TRACK_TOOL_USE = function GM_TRACK_TOOL_USE(toolSlug, toolTitle, toolUrl) {
    const key = "gm_recent_tools";
    let list = window.GM_STORAGE.get(key, []);
    if (!Array.isArray(list)) list = [];
    list = list.filter((item) => item.slug !== toolSlug);
    list.unshift({ slug: toolSlug, title: toolTitle, url: toolUrl, ts: Date.now() });
    list = list.slice(0, 8);
    window.GM_STORAGE.set(key, list);
    return list;
  };

  /* ========================================================================
     Favorites helpers, backed by localStorage key "gm_favorite_tools".
     window.GM_TOGGLE_FAVORITE(toolSlug, toolTitle, toolUrl) -> returns
       the new favorited state (true/false).
     window.GM_IS_FAVORITE(toolSlug) -> boolean
     ======================================================================== */
  const FAV_KEY = "gm_favorite_tools";

  window.GM_TOGGLE_FAVORITE = function GM_TOGGLE_FAVORITE(toolSlug, toolTitle, toolUrl) {
    let list = window.GM_STORAGE.get(FAV_KEY, []);
    if (!Array.isArray(list)) list = [];
    const exists = list.some((item) => item.slug === toolSlug);
    if (exists) {
      list = list.filter((item) => item.slug !== toolSlug);
      window.GM_STORAGE.set(FAV_KEY, list);
      return false;
    }
    list.push({ slug: toolSlug, title: toolTitle, url: toolUrl, ts: Date.now() });
    window.GM_STORAGE.set(FAV_KEY, list);
    return true;
  };

  window.GM_IS_FAVORITE = function GM_IS_FAVORITE(toolSlug) {
    const list = window.GM_STORAGE.get(FAV_KEY, []);
    if (!Array.isArray(list)) return false;
    return list.some((item) => item.slug === toolSlug);
  };
})();
