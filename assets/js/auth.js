/* ==========================================================================
   Gamermaid — auth.js
   Wraps Firebase Authentication (compat SDK). Any page that needs auth
   must include, IN THIS ORDER, before this script:
     1. https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js
     2. https://www.gstatic.com/firebasejs/10.13.2/firebase-auth-compat.js
     3. assets/js/firebase-config.js
     4. assets/js/auth.js  (this file)
   These CDN <script> tags are NOT added automatically — pages that don't
   need auth UI may omit them, but the standard page template includes
   firebase-config.js + auth.js at the end of body (see navbar.js's
   "SCRIPT INIT ORDER CONTRACT" comment) so #auth-nav-slot always resolves
   consistently across the site.

   Exposes:
     window.GM_AUTH_CONFIGURED  (boolean) — false until real config is set
     window.GM_AUTH = {
       signInWithGoogle(), signInWithEmail(email, pw),
       registerWithEmail(email, pw), signOut(), onAuthStateChanged(cb)
     }
   ========================================================================== */

(function () {
  "use strict";

  const PLACEHOLDER_VALUES = [
    "YOUR_FIREBASE_API_KEY",
    "YOUR_PROJECT_ID",
    "YOUR_PROJECT.firebaseapp.com",
  ];

  const config = window.__FIREBASE_CONFIG__ || {};
  const isPlaceholder =
    !config.apiKey || PLACEHOLDER_VALUES.includes(config.apiKey) || PLACEHOLDER_VALUES.includes(config.projectId);

  window.GM_AUTH_CONFIGURED = false;

  const NOT_CONFIGURED_MSG = "Authentication is not configured yet.";

  function notConfiguredRejection() {
    return Promise.reject(new Error(NOT_CONFIGURED_MSG));
  }

  window.GM_AUTH = {
    signInWithGoogle: notConfiguredRejection,
    signInWithEmail: notConfiguredRejection,
    registerWithEmail: notConfiguredRejection,
    signOut: notConfiguredRejection,
    onAuthStateChanged: function (cb) {
      // No-op when not configured — immediately report "signed out".
      if (typeof cb === "function") cb(null);
      return function unsubscribe() {};
    },
  };

  if (!isPlaceholder && typeof firebase !== "undefined") {
    try {
      firebase.initializeApp(config);
      window.GM_AUTH_CONFIGURED = true;

      window.GM_AUTH = {
        signInWithGoogle() {
          const provider = new firebase.auth.GoogleAuthProvider();
          return firebase.auth().signInWithPopup(provider);
        },
        signInWithEmail(email, pw) {
          return firebase.auth().signInWithEmailAndPassword(email, pw);
        },
        registerWithEmail(email, pw) {
          return firebase.auth().createUserWithEmailAndPassword(email, pw);
        },
        signOut() {
          return firebase.auth().signOut();
        },
        onAuthStateChanged(cb) {
          return firebase.auth().onAuthStateChanged(cb);
        },
      };
    } catch (e) {
      // Firebase failed to initialize (bad config, network, etc.) — treat
      // as unconfigured rather than throwing on every page.
      window.GM_AUTH_CONFIGURED = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /* #auth-nav-slot rendering                                           */
  /* ------------------------------------------------------------------ */

  function getBase() {
    const depth = document.body.getAttribute("data-depth") || "0";
    return depth === "0" ? "" : "../";
  }

  function getInitials(user) {
    const source = user.displayName || user.email || "?";
    return source.trim().charAt(0).toUpperCase();
  }

  function renderSignedIn(slot, base, user) {
    slot.innerHTML =
      '<div class="flex items-center gap-2">' +
        '<a class="btn btn-secondary btn-sm" href="' + base + "dashboard/index.html" + '">' +
          '<span aria-hidden="true">' + getInitials(user) + "</span> Dashboard" +
        "</a>" +
        '<button class="btn btn-ghost btn-sm" id="auth-sign-out-btn">Sign Out</button>' +
      "</div>";

    const signOutBtn = slot.querySelector("#auth-sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        window.GM_AUTH.signOut().catch(() => {});
      });
    }
  }

  function renderSignedOut(slot, base) {
    slot.innerHTML = '<a class="btn btn-secondary btn-sm" href="' + base + "login/index.html" + '">Sign In</a>';
  }

  // Called by navbar.js right after it injects the header (see the
  // "SCRIPT INIT ORDER CONTRACT" comment in navbar.js). If GM_AUTH_CONFIGURED
  // is false, this leaves navbar.js's default "Sign In" link untouched.
  window.GM_INIT_AUTH_SLOT = function GM_INIT_AUTH_SLOT() {
    const slot = document.getElementById("auth-nav-slot");
    if (!slot) return;
    if (!window.GM_AUTH_CONFIGURED) return; // default Sign In link stays as-is

    const base = getBase();
    window.GM_AUTH.onAuthStateChanged((user) => {
      if (user) {
        renderSignedIn(slot, base, user);
      } else {
        renderSignedOut(slot, base);
      }
    });
  };
})();
