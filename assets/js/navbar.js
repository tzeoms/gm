/* ==========================================================================
   Gamermaid — navbar.js
   Injects the shared header (nav) and footer markup into every page.

   ============================================================================
   PATH / DEPTH CONVENTION — READ THIS BEFORE BUILDING ANY PAGE
   ============================================================================
   Every HTML page's <body> tag must declare data-depth:
     - <body data-depth="0">  -> ONLY the repo-root /index.html
     - <body data-depth="1">  -> every other page in the site, including
         folder landing pages (/image-studio/index.html, /about/index.html,
         /login/index.html, etc.) AND nested tool pages
         (/image-studio/upscaler.html, /social-media/caption.html, etc).
   There is no depth-2 page anywhere in this site.

   From data-depth we compute a `base` prefix used for every generated href:
     depth "0" -> base = ""       (assets referenced as "assets/...")
     depth "1" -> base = "../"    (assets referenced as "../assets/...")

   All internal links in the injected navbar/footer/search markup are built
   as `base + "some/path"` — NEVER a root-absolute "/some/path". This keeps
   the site working unmodified on Netlify and on GitHub Pages under a
   subpath.

   ============================================================================
   SCRIPT INIT ORDER CONTRACT
   ============================================================================
   Because this file injects HTML at runtime, dropdown.js / search-index.js
   only *define* global init functions (window.initDropdowns,
   window.initMobileNav, window.initSearchPanel) without running them at
   parse time. This file calls all three immediately after injecting the
   header, and also calls window.GM_INIT_AUTH_SLOT (defined in auth.js) if
   present, so auth state can populate #auth-nav-slot once it exists.

   Required <script> order on every page (see index.html for the reference
   implementation):
     1. assets/js/main.js
     2. assets/js/search-index.js   (defines SEARCH_INDEX + initSearchPanel)
     3. assets/js/dropdown.js       (defines initDropdowns + initMobileNav)
     4. assets/js/navbar.js         (THIS FILE — injects markup, calls inits)
     5. assets/js/firebase-config.js
     6. assets/js/auth.js
   ========================================================================== */

(function () {
  "use strict";

  function getBase() {
    const depth = document.body.getAttribute("data-depth") || "0";
    return depth === "0" ? "" : "../";
  }

  function buildHeader(base) {
    return (
      '<header class="site-header">' +
        '<div class="navbar">' +
          '<div class="navbar-inner">' +
            '<a class="navbar-logo" href="' + base + 'index.html">' +
              '<span class="logo-mark" aria-hidden="true"></span>' +
              "Gamermaid" +
            "</a>" +

            '<nav class="navbar-nav" aria-label="Primary">' +
              '<a class="nav-link" href="' + base + 'index.html">Home</a>' +

              buildDesktopDropdown("img-studio", "Image Studio", [
                ["AI Image Upscaler", base + "image-studio/upscaler.html"],
                ["Image Converter", base + "image-studio/converter.html"],
                ["Image Resizer", base + "image-studio/resizer.html"],
                ["Image Compressor", base + "image-studio/compressor.html"],
                ["Image Cropper", base + "image-studio/cropper.html"],
              ], ["View Image Studio", base + "image-studio/"]) +

              buildDesktopDropdown("social-studio", "Social Media Studio", [
                ["Caption Generator", base + "social-media/caption.html"],
                ["Hashtag Generator", base + "social-media/hashtag.html"],
                ["YouTube Title Generator", base + "social-media/youtube-title.html"],
                ["YouTube Description Generator", base + "social-media/youtube-description.html"],
                ["Bio Generator", base + "social-media/bio.html"],
                ["Post Idea Generator", base + "social-media/post-ideas.html"],
                ["Script Generator", base + "social-media/script.html"],
                ["Comment Reply Generator", base + "social-media/comment-reply.html"],
                ["Content Calendar", base + "social-media/content-calendar.html"],
              ], ["View Social Media Studio", base + "social-media/"]) +

              '<a class="nav-link" href="' + base + "video-downloader/index.html" + '">Online Video Downloader</a>' +

              buildDesktopDropdown("earn", "Earn", [
                ["Earn With AI", base + "earn/#earn-with-ai"],
                ["Creator Resources", base + "earn/#creator-resources"],
                ["Freelancing", base + "earn/#freelancing"],
                ["AI Income Ideas", base + "earn/#ai-income-ideas"],
              ]) +

              '<a class="nav-link" href="' + base + "news/index.html" + '">News</a>' +

              buildDesktopDropdown("about", "About", [
                ["About Gamermaid", base + "about/"],
                ["FAQ", base + "about/#faq"],
                ["Contact", base + "about/#contact"],
                ["Privacy Policy", base + "privacy/"],
                ["Terms", base + "terms/"],
              ]) +
            "</nav>" +

            '<div class="navbar-actions">' +
              '<button class="btn-icon" id="search-toggle" data-search-open aria-label="Search">' +
                searchIconSvg() +
              "</button>" +
              '<div id="auth-nav-slot">' + defaultAuthSlot(base) + "</div>" +
              '<button class="navbar-hamburger" id="mobile-menu-toggle" aria-label="Open menu" aria-expanded="false">' +
                hamburgerIconSvg() +
              "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +

        buildMobilePanel(base) +
        buildSearchOverlay() +
      "</header>"
    );
  }

  function defaultAuthSlot(base) {
    // navbar.js renders this default state immediately; auth.js overwrites
    // #auth-nav-slot's innerHTML once it determines real auth state.
    return '<a class="btn btn-secondary btn-sm" href="' + base + "login/index.html" + '">Sign In</a>';
  }

  function buildDesktopDropdown(id, label, items, viewAll) {
    let panel = '<div class="dropdown-panel" data-dropdown-panel="' + id + '">';
    items.forEach(([text, href]) => {
      panel += '<a href="' + href + '">' + text + "</a>";
    });
    if (viewAll) {
      panel += '<a class="dropdown-view-all" href="' + viewAll[1] + '">' + viewAll[0] + "</a>";
    }
    panel += "</div>";

    return (
      '<div class="nav-dropdown">' +
        '<button class="nav-link" data-dropdown-toggle="' + id + '" aria-expanded="false" aria-haspopup="true">' +
          label + chevronSvg() +
        "</button>" +
        panel +
      "</div>"
    );
  }

  function buildMobilePanel(base) {
    return (
      '<div class="mobile-panel" id="mobile-panel">' +
        '<a class="mobile-nav-link" href="' + base + "index.html" + '">Home</a>' +

        buildMobileAccordion("m-img-studio", "Image Studio", [
          ["Image Studio Home", base + "image-studio/"],
          ["AI Image Upscaler", base + "image-studio/upscaler.html"],
          ["Image Converter", base + "image-studio/converter.html"],
          ["Image Resizer", base + "image-studio/resizer.html"],
          ["Image Compressor", base + "image-studio/compressor.html"],
          ["Image Cropper", base + "image-studio/cropper.html"],
        ]) +

        buildMobileAccordion("m-social-studio", "Social Media Studio", [
          ["Social Media Studio Home", base + "social-media/"],
          ["Caption Generator", base + "social-media/caption.html"],
          ["Hashtag Generator", base + "social-media/hashtag.html"],
          ["YouTube Title Generator", base + "social-media/youtube-title.html"],
          ["YouTube Description Generator", base + "social-media/youtube-description.html"],
          ["Bio Generator", base + "social-media/bio.html"],
          ["Post Idea Generator", base + "social-media/post-ideas.html"],
          ["Script Generator", base + "social-media/script.html"],
          ["Comment Reply Generator", base + "social-media/comment-reply.html"],
          ["Content Calendar", base + "social-media/content-calendar.html"],
        ]) +

        '<a class="mobile-nav-link" href="' + base + "video-downloader/index.html" + '">Online Video Downloader</a>' +

        buildMobileAccordion("m-earn", "Earn", [
          ["Earn With AI", base + "earn/#earn-with-ai"],
          ["Creator Resources", base + "earn/#creator-resources"],
          ["Freelancing", base + "earn/#freelancing"],
          ["AI Income Ideas", base + "earn/#ai-income-ideas"],
        ]) +

        '<a class="mobile-nav-link" href="' + base + "news/index.html" + '">News</a>' +

        buildMobileAccordion("m-about", "About", [
          ["About Gamermaid", base + "about/"],
          ["FAQ", base + "about/#faq"],
          ["Contact", base + "about/#contact"],
          ["Privacy Policy", base + "privacy/"],
          ["Terms", base + "terms/"],
        ]) +

        '<button class="mobile-nav-link" data-search-open style="width:100%;text-align:left;background:none;border:none;">Search</button>' +
        '<a class="mobile-nav-link" href="' + base + "login/index.html" + '">Sign In</a>' +
      "</div>"
    );
  }

  function buildMobileAccordion(id, label, items) {
    let panel = '<div class="accordion-panel" data-accordion-panel="' + id + '">';
    items.forEach(([text, href]) => {
      panel += '<a href="' + href + '">' + text + "</a>";
    });
    panel += "</div>";

    return (
      '<div class="accordion-item">' +
        '<button class="accordion-trigger" data-accordion-trigger="' + id + '" aria-expanded="false">' +
          "<span>" + label + "</span>" + chevronSvg() +
        "</button>" +
        panel +
      "</div>"
    );
  }

  function buildSearchOverlay() {
    return (
      '<div class="search-overlay" id="search-overlay">' +
        '<div class="search-panel" role="dialog" aria-label="Search">' +
          '<div class="search-input-row">' +
            '<input type="text" id="search-input" class="input" placeholder="Search tools, pages, and news…" aria-label="Search">' +
            '<button class="btn-icon" data-search-close aria-label="Close search">' + closeIconSvg() + "</button>" +
          "</div>" +
          '<div class="search-results" id="search-results"></div>' +
        "</div>" +
      "</div>"
    );
  }

  function buildFooter(base) {
    return (
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div class="footer-col">' +
              "<h4>Gamermaid AI</h4>" +
              '<p class="text-muted">AI-powered tools for creators — image editing, social media growth, and everyday workflow shortcuts, all in one place.</p>' +
            "</div>" +
            '<div class="footer-col">' +
              "<h4>Tools</h4>" +
              '<a href="' + base + "image-studio/" + '">Image Studio</a>' +
              '<a href="' + base + "social-media/" + '">Social Media Studio</a>' +
              '<a href="' + base + "image-studio/upscaler.html" + '">AI Upscaler</a>' +
              '<a href="' + base + "image-studio/converter.html" + '">Image Converter</a>' +
              '<a href="' + base + "image-studio/resizer.html" + '">Image Resizer</a>' +
            "</div>" +
            '<div class="footer-col">' +
              "<h4>Resources</h4>" +
              '<a href="' + base + "earn/" + '">Earn</a>' +
              '<a href="' + base + "news/" + '">News</a>' +
              '<a href="' + base + "earn/#creator-resources" + '">Creator Resources</a>' +
            "</div>" +
            '<div class="footer-col">' +
              "<h4>Company</h4>" +
              '<a href="' + base + "about/" + '">About</a>' +
              '<a href="' + base + "about/#faq" + '">FAQ</a>' +
              '<a href="' + base + "about/#contact" + '">Contact</a>' +
            "</div>" +
            '<div class="footer-col">' +
              "<h4>Legal</h4>" +
              '<a href="' + base + "privacy/" + '">Privacy Policy</a>' +
              '<a href="' + base + "terms/" + '">Terms</a>' +
            "</div>" +
          "</div>" +
          '<div class="footer-bottom">' +
            "© <span id=\"copyright-year\">2026</span> Gamermaid. All rights reserved." +
          "</div>" +
        "</div>" +
      "</footer>"
    );
  }

  /* ---- inline SVG icons (no emojis anywhere on the site) ---- */
  function chevronSvg() {
    return '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  }
  function searchIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:20px;height:20px;"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
  }
  function hamburgerIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  }
  function closeIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:18px;height:18px;"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  }

  function inject() {
    const base = getBase();
    const headerMount = document.getElementById("site-header");
    const footerMount = document.getElementById("site-footer");

    if (headerMount) headerMount.innerHTML = buildHeader(base);
    if (footerMount) footerMount.innerHTML = buildFooter(base);

    // Post-injection init — see "SCRIPT INIT ORDER CONTRACT" above.
    if (window.initDropdowns) window.initDropdowns();
    if (window.initMobileNav) window.initMobileNav();
    if (window.initSearchPanel) window.initSearchPanel();
    if (window.GM_INIT_AUTH_SLOT) window.GM_INIT_AUTH_SLOT();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
