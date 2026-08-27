/* ==========================================================================
   Gamermaid — dropdown.js
   Handles desktop dropdown menus AND the mobile hamburger/accordion panel.

   INIT ORDER CONTRACT (read this):
   navbar.js injects the header/footer markup at runtime (it does not exist
   at parse time), so this file only *defines* two global functions and does
   NOT run any DOM queries at load time:
     - window.initDropdowns()   wires up desktop [data-dropdown] menus
     - window.initMobileNav()   wires up the hamburger + mobile accordion
   navbar.js MUST call both of these immediately after it injects the header
   HTML into #site-header. Do not call them from this file automatically.
   ========================================================================== */

(function () {
  "use strict";

  // Module-level "currently open" tracker — only one desktop dropdown (or
  // one mobile accordion section) may be open at a time.
  let openDropdown = null; // { toggle, panel } for desktop
  let openAccordion = null; // { trigger, panel } for mobile

  function closeDropdown() {
    if (!openDropdown) return;
    openDropdown.panel.classList.remove("is-open");
    openDropdown.toggle.setAttribute("aria-expanded", "false");
    openDropdown = null;
  }

  function openDropdownItem(toggle, panel) {
    if (openDropdown && openDropdown.toggle !== toggle) closeDropdown();
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    openDropdown = { toggle, panel };
  }

  window.initDropdowns = function initDropdowns(root) {
    const scope = root || document;
    const toggles = scope.querySelectorAll("[data-dropdown-toggle]");

    toggles.forEach((toggle) => {
      const id = toggle.getAttribute("data-dropdown-toggle");
      const panel = scope.querySelector('[data-dropdown-panel="' + id + '"]');
      if (!panel) return;

      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.contains("is-open");
        if (isOpen) {
          closeDropdown();
        } else {
          openDropdownItem(toggle, panel);
        }
      });

      // Clicking a link inside closes the dropdown.
      panel.addEventListener("click", (e) => {
        if (e.target.closest("a")) closeDropdown();
      });
    });

    // Outside click closes any open dropdown.
    document.addEventListener("click", (e) => {
      if (openDropdown && !openDropdown.panel.contains(e.target) && !openDropdown.toggle.contains(e.target)) {
        closeDropdown();
      }
    });

    // Escape closes.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && openDropdown) closeDropdown();
    });
  };

  /* ------------------------------------------------------------------ */
  /* Mobile hamburger + accordion                                       */
  /* ------------------------------------------------------------------ */

  function closeAccordion() {
    if (!openAccordion) return;
    openAccordion.panel.style.maxHeight = "0px";
    openAccordion.trigger.setAttribute("aria-expanded", "false");
    openAccordion = null;
  }

  function openAccordionItem(trigger, panel) {
    if (openAccordion && openAccordion.trigger !== trigger) closeAccordion();
    panel.style.maxHeight = panel.scrollHeight + "px";
    trigger.setAttribute("aria-expanded", "true");
    openAccordion = { trigger, panel };
  }

  window.initMobileNav = function initMobileNav(root) {
    const scope = root || document;
    const hamburger = scope.querySelector("#mobile-menu-toggle");
    const panel = scope.querySelector("#mobile-panel");

    if (hamburger && panel) {
      hamburger.addEventListener("click", () => {
        const isOpen = panel.classList.contains("is-open");
        if (isOpen) {
          panel.classList.remove("is-open");
          hamburger.setAttribute("aria-expanded", "false");
        } else {
          panel.classList.add("is-open");
          hamburger.setAttribute("aria-expanded", "true");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("is-open")) {
          panel.classList.remove("is-open");
          hamburger.setAttribute("aria-expanded", "false");
          closeAccordion();
          hamburger.focus();
        }
      });
    }

    const accordionTriggers = scope.querySelectorAll("[data-accordion-trigger]");
    accordionTriggers.forEach((trigger) => {
      const id = trigger.getAttribute("data-accordion-trigger");
      const accPanel = scope.querySelector('[data-accordion-panel="' + id + '"]');
      if (!accPanel) return;

      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        if (isOpen) {
          closeAccordion();
        } else {
          openAccordionItem(trigger, accPanel);
        }
      });
    });

    // Clicking a link inside the mobile panel closes the whole panel.
    if (panel) {
      panel.addEventListener("click", (e) => {
        if (e.target.closest("a") && hamburger) {
          panel.classList.remove("is-open");
          hamburger.setAttribute("aria-expanded", "false");
        }
      });
    }
  };
})();
