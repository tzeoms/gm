/* ==========================================================================
   Gamermaid — search-index.js
   Defines window.SEARCH_INDEX and the search panel UI (window.initSearchPanel).

   URL CONVENTION: every "url" below is stored WITHOUT a leading slash and
   WITHOUT a base prefix, e.g. "image-studio/upscaler.html" or "index.html".
   At render time the current page's base ("" for depth 0, "../" for depth 1
   — read from document.body.dataset.depth, same convention as navbar.js)
   is prepended: base + entry.url.
   ========================================================================== */

window.SEARCH_INDEX = [
  { title: "Home", description: "AI tools built for creators — image editing, social media growth, and more.", category: "Home", url: "index.html" },

  // Image Studio
  { title: "Image Studio", description: "All AI-powered image tools in one place.", category: "Image Studio", url: "image-studio/" },
  { title: "AI Image Upscaler", description: "Upscale images with AI while preserving detail.", category: "Image Studio", url: "image-studio/upscaler.html" },
  { title: "Image Converter", description: "Convert images between formats like PNG, JPG, and WebP.", category: "Image Studio", url: "image-studio/converter.html" },
  { title: "Image Resizer", description: "Resize images to exact dimensions or presets.", category: "Image Studio", url: "image-studio/resizer.html" },
  { title: "Image Compressor", description: "Shrink image file size without losing quality.", category: "Image Studio", url: "image-studio/compressor.html" },
  { title: "Image Cropper", description: "Crop images with precise aspect ratios.", category: "Image Studio", url: "image-studio/cropper.html" },

  // Social Media Studio
  { title: "Social Media Studio", description: "AI tools to plan, write, and grow your social presence.", category: "Social Media Studio", url: "social-media/" },
  { title: "AI Caption Generator", description: "Generate catchy captions for any platform.", category: "Social Media Studio", url: "social-media/caption.html" },
  { title: "AI Hashtag Generator", description: "Find trending, relevant hashtags instantly.", category: "Social Media Studio", url: "social-media/hashtag.html" },
  { title: "YouTube Title Generator", description: "Craft click-worthy YouTube video titles.", category: "Social Media Studio", url: "social-media/youtube-title.html" },
  { title: "YouTube Description Generator", description: "Write SEO-friendly YouTube descriptions fast.", category: "Social Media Studio", url: "social-media/youtube-description.html" },
  { title: "Bio Generator", description: "Create a standout social media bio.", category: "Social Media Studio", url: "social-media/bio.html" },
  { title: "Post Idea Generator", description: "Never run out of content ideas.", category: "Social Media Studio", url: "social-media/post-ideas.html" },
  { title: "Script Generator", description: "Generate short-form video scripts with AI.", category: "Social Media Studio", url: "social-media/script.html" },
  { title: "Comment Reply Generator", description: "Draft thoughtful replies to comments in seconds.", category: "Social Media Studio", url: "social-media/comment-reply.html" },
  { title: "Content Calendar", description: "Plan your posting schedule with AI suggestions.", category: "Social Media Studio", url: "social-media/content-calendar.html" },

  // Other sections
  { title: "Online Video Downloader", description: "Download videos quickly and easily.", category: "Tools", url: "video-downloader/" },
  { title: "Earn With AI", description: "Discover ways to earn using AI tools.", category: "Earn", url: "earn/" },
  { title: "News", description: "Latest updates from the world of AI creator tools.", category: "News", url: "news/" },
  { title: "About Gamermaid", description: "Learn more about Gamermaid and its mission.", category: "About", url: "about/" },
  { title: "Sign In", description: "Sign in to your Gamermaid account.", category: "Account", url: "login/" },
  { title: "Sign Up", description: "Create a free Gamermaid account.", category: "Account", url: "signup/" },
  { title: "Dashboard", description: "Your saved tools, favorites, and recent activity.", category: "Account", url: "dashboard/" },
  { title: "Privacy Policy", description: "How Gamermaid handles your data.", category: "Legal", url: "privacy/" },
  { title: "Terms of Service", description: "Terms for using Gamermaid.", category: "Legal", url: "terms/" },

  // Placeholder news articles (titles may be adjusted by the news-page builder)
  { title: "The State of AI Creator Tools in 2026", description: "A look at how AI is reshaping content creation this year.", category: "News", url: "news/#article-ai-trends-2026" },
  { title: "5 Ways to Grow Your Social Media with AI", description: "Practical AI-powered tactics for faster growth.", category: "News", url: "news/#article-grow-social-ai" },
  { title: "Image Upscaling Explained: How AI Restores Detail", description: "A behind-the-scenes look at AI upscaling technology.", category: "News", url: "news/#article-upscaling-explained" },
  { title: "How Creators Are Monetizing AI Workflows", description: "Real strategies creators use to earn with AI tools.", category: "News", url: "news/#article-monetizing-ai-workflows" },
  { title: "Short-Form Video Trends to Watch", description: "What's next for short-form video content.", category: "News", url: "news/#article-short-form-trends" },
  { title: "A Beginner's Guide to AI Hashtag Strategy", description: "Getting started with smarter hashtag research.", category: "News", url: "news/#article-hashtag-strategy-guide" },
  { title: "Behind the Build: Gamermaid's New Tools", description: "What we shipped recently and what's coming next.", category: "News", url: "news/#article-behind-the-build" },
];

/* ==========================================================================
   Search panel UI — window.initSearchPanel()
   Same init-order contract as dropdown.js: navbar.js calls this after
   injecting the header (the #search-toggle button lives in the injected
   markup). Safe to call more than once; it guards against double-binding.
   ========================================================================== */
(function () {
  "use strict";
  let bound = false;

  function getBase() {
    const depth = document.body.getAttribute("data-depth") || "0";
    return depth === "0" ? "" : "../";
  }

  function renderResults(container, query) {
    const base = getBase();
    const q = query.trim().toLowerCase();
    container.innerHTML = "";

    if (!q) {
      container.innerHTML = '<p class="search-empty">Start typing to search tools, pages, and news.</p>';
      return;
    }

    const matches = window.SEARCH_INDEX.filter((item) =>
      item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    ).slice(0, 20);

    if (matches.length === 0) {
      container.innerHTML = '<p class="search-empty">No results found.</p>';
      return;
    }

    matches.forEach((item) => {
      const a = document.createElement("a");
      a.className = "search-result-item";
      a.href = base + item.url;
      a.innerHTML =
        '<span class="result-title">' + item.title + "</span>" +
        '<div class="result-desc">' + item.description + "</div>" +
        '<span class="result-category">' + item.category + "</span>";
      container.appendChild(a);
    });
  }

  window.initSearchPanel = function initSearchPanel(root) {
    const scope = root || document;
    const overlay = scope.querySelector("#search-overlay");
    const input = scope.querySelector("#search-input");
    const results = scope.querySelector("#search-results");
    const openTriggers = scope.querySelectorAll("[data-search-open]");
    const closeTriggers = scope.querySelectorAll("[data-search-close]");

    if (!overlay || !input || !results) return;

    function open() {
      overlay.classList.add("is-open");
      renderResults(results, input.value);
      window.setTimeout(() => input.focus(), 50);
    }

    function close() {
      overlay.classList.remove("is-open");
    }

    if (!bound) {
      input.addEventListener("input", () => renderResults(results, input.value));

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const first = results.querySelector(".search-result-item");
          if (first) window.location.href = first.getAttribute("href");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
      });

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });

      bound = true;
    }

    openTriggers.forEach((btn) => btn.addEventListener("click", open));
    closeTriggers.forEach((btn) => btn.addEventListener("click", close));
  };
})();
