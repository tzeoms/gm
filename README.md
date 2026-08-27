# Gamermaid

Gamermaid is an all-in-one AI and creator tools website: image editing tools, AI-powered social media content generators, a page on ways to earn online as a creator, and an AI/technology news section.

## Tech used

Plain static HTML5, CSS, and vanilla JavaScript — no framework, no build step, no bundler, and no npm dependencies required to run the site. This is intentional: the site needs to work unmodified on static hosts such as GitHub Pages as well as Netlify, so every internal link and asset reference uses relative paths (e.g. `assets/css/style.css` from the root, `../assets/css/style.css` from a page one folder deep) rather than root-absolute paths.

Two optional third-party integrations are used, both loaded from CDNs directly in HTML — no local install needed:

- **Google Fonts** for typography.
- **Firebase JS SDK** (Authentication) for Google / email-password sign-in, used on `/login/`, `/signup/`, and the navbar auth state. Firebase web config values are safe to ship in frontend code by design, but the checked-in `assets/js/firebase-config.js` ships with clearly-labeled placeholder values. Until real project values are filled in, `window.GM_AUTH_CONFIGURED` is `false` and the UI shows an explicit "Authentication is not configured yet" message instead of faking a signed-in state.

The Social Media Studio tools call a public Cloudflare Worker API (`https://gamermaid-social-ai-api.tze-oms.workers.dev/`) for AI-generated text. The five Image Studio tools (upscaler, converter, resizer, compressor, cropper) run entirely client-side using the Canvas and File APIs — no backend or upload required.

## Running locally

No build step. Any static file server works, for example:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed local URL. Opening `index.html` directly in a browser also works for browsing most pages, though `fetch`-based features behave more reliably when served over `http://localhost`.

## Configuring Firebase Authentication

1. Create a project in the [Firebase console](https://console.firebase.google.com/) and enable the Google and Email/Password sign-in providers.
2. Copy the web app config object into `assets/js/firebase-config.js`, replacing the placeholder values.
3. Reload the site — the navbar and `/login/`, `/signup/`, `/dashboard/` pages pick up the change automatically via `window.GM_AUTH_CONFIGURED`.

## Deploying

- **Netlify**: deploy the repository root as a static site (no build command, publish directory `.`).
- **GitHub Pages**: works from the repository root or from a subpath (e.g. `/v2/`) since every asset and internal link is relative.
