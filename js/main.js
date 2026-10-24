/* ============================================================
   main.js — boot, and a safety net.

   Everything here beyond the one boot call exists because this
   game runs on a Chromebook on the other side of the world. If
   a file fails to arrive, or something throws, the page must
   say so out loud instead of sitting there looking fine while
   the keyboard does nothing.
   ============================================================ */
(function () {
  "use strict";

  const EXPECTED_GAMES = 7;

  function banner(text) {
    let el = document.getElementById("trouble");
    if (!el) {
      el = document.createElement("div");
      el.id = "trouble";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.className = "show";
  }

  /* anything that throws anywhere becomes visible */
  window.addEventListener("error", function (e) {
    banner("Something went wrong: " + (e.message || "unknown") +
           " — please refresh with Ctrl+Shift+R");
  });

  function go() {
    if (!window.KB || !window.KB.ui || !window.KB.ui.boot) {
      banner("The game did not load properly. Please refresh with Ctrl+Shift+R.");
      return;
    }

    window.KB.ui.boot();

    /* a half-loaded page is the worst kind: the games that did
       arrive look normal, so nobody suspects the missing ones */
    const got = window.KB.ui.modeCount();
    if (got < EXPECTED_GAMES) {
      banner("Only " + got + " of " + EXPECTED_GAMES + " games loaded. " +
             "Please refresh with Ctrl+Shift+R.");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();
