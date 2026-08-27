# AGENTS.md

Guidance for AI agents (and humans) working on this repository.

## What this is

Gamermaid is a static, multi-page website — plain HTML5 + CSS + vanilla JavaScript, no framework, no bundler, no build step. This is a hard requirement, not a simplification: the site must run unmodified on GitHub Pages (including under a subpath such as `/v2/`) as well as on Netlify as a plain static site. **Never introduce root-absolute asset or link paths** (`/assets/...`, `href="/foo"` where `foo` isn't itself a real top-level page) — always use paths relative to the current file's depth.

## Directory layout

```
index.html                 Home
image-studio/               Image Studio landing + 5 tool pages (upscaler, converter, resizer, compressor, cropper)
social-media/                Social Media Studio landing + 9 AI generator tool pages
earn/, news/, about/         Content pages (single index.html each)
login/, signup/, dashboard/  Firebase-auth-backed pages
privacy/, terms/, video-downloader/   Standalone pages (video-downloader is explicitly labeled "coming soon" — no fake functionality)
assets/css/style.css          Design tokens, base styles, layout primitives
assets/css/components.css     Navbar, dropdown, cards, buttons, forms, tool-page and page-specific component styles
assets/js/*.js                 Shared behavior (see below)
robots.txt, sitemap.xml        SEO files listing every real page at https://gamermaid.site/
```

Every page one folder deep (`image-studio/`, `social-media/`, `earn/`, etc.) sets `data-depth="1"` on `<html>` and prefixes internal asset/script/link paths with `../`. Root-level pages use no prefix. When adding a new page, match this convention exactly — it's how the site stays portable across hosting roots.

## Shared component pattern

There's no framework, so "shared components" means: every page includes the same CSS files and the same JS files in the same order, and mounts the shared header/footer via placeholder elements that `navbar.js` / footer logic fill in at runtime. The canonical script load order (used on every page) is:

```
main.js → search-index.js → dropdown.js → navbar.js → firebase-config.js → auth.js
```

Followed by any page-specific script (e.g. `image-tools.js` + inline tool logic on image-studio pages, or `social-ai.js` + inline init on social-media pages). Keep this order when adding pages — later scripts assume earlier ones have already run (e.g. `dropdown.js`'s single-open-dropdown tracker must exist before `navbar.js` wires up the injected nav markup).

Key shared JS globals (defined once, consumed everywhere):

- `window.GM_STORAGE.get(key, fallback)` / `.set(key, value)` — JSON-safe localStorage wrapper (`main.js`).
- `window.GM_TRACK_TOOL_USE(slug, title, url)` — appends to the `gm_recent_tools` localStorage list, read by the dashboard's "Recently Used Tools" section. Real, not simulated — each tool page calls this on load.
- `window.GM_TOGGLE_FAVORITE(slug, title, url)` / `window.GM_IS_FAVORITE(slug)` — backs the star/favorite buttons on tool cards and the dashboard's "Favorite Tools" section, stored under `gm_favorite_tools`.
- `window.GM_AUTH_CONFIGURED` (boolean) and `window.GM_AUTH.{signInWithGoogle, signInWithEmail, registerWithEmail, signOut, onAuthStateChanged}` — from `firebase-config.js` / `auth.js`. `GM_AUTH_CONFIGURED` is `false` until real Firebase config values replace the placeholders in `firebase-config.js`; UI must check this flag and show an honest "not configured" message rather than fake a signed-in state.
- The dropdown/accordion "only one open at a time" behavior lives in `dropdown.js`: a single module-level "currently open" reference is closed before any new trigger opens, on outside click, and on Escape. When adding a new nav dropdown or mobile accordion section, register it through the same mechanism rather than writing bespoke open/close logic.

## Social AI tools contract

The 9 pages under `social-media/` (excluding the landing page) are thin wrappers around `assets/js/social-ai.js`, which POSTs JSON `{ tool, topic, platform, tone, language }` to `https://gamermaid-social-ai-api.tze-oms.workers.dev/` and renders the response. `tool` is a fixed per-page slug (`caption`, `hashtag`, `youtube-title`, `youtube-description`, `bio`, `post-ideas`, `script`, `comment-reply`, `content-calendar`). This is a public worker endpoint — do not add an `Authorization` header or invent a secret; there is none to protect here. Response parsing is defensive (tries several likely field names, falls back to raw text, shows an explicit "unexpected response" message rather than rendering `undefined`).

## Image tools

The 5 pages under `image-studio/` (excluding the landing page) are fully client-side using Canvas + File APIs — no network call, no server. Shared helpers (file validation, drag/drop wiring, download-as-file, size formatting) live in `assets/js/image-tools.js` as `window.GMImageTools`; reuse these rather than duplicating per-page. The upscaler explicitly labels itself as a canvas-based resize (not an AI model) since no AI upscaling backend is configured — this is intentional per the "no fake functionality" rule, not an oversight.

## Coding conventions

- No emojis anywhere in UI copy or code comments — use the inline SVG icons already established in the navbar/footer/card markup.
- Every page has exactly one `<h1>` and a real, unique `<title>`/meta description/canonical URL matching its entry in `sitemap.xml`.
- Buttons that don't yet have a real backend (contact form, video downloader, dashboard "Usage" stats) must say so explicitly in the UI rather than simulate success.
- New pages must be added to `sitemap.xml` and, if they belong in navigation, to the relevant dropdown in the navbar markup/`navbar.js` and to `assets/js/search-index.js`.
