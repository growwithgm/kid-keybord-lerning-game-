/* ============================================================
   main.js — boot.

   Mode files register themselves as they load; this just starts
   the shell once the page is ready. Keeping the order here means
   the tab strip reads as a learning path, left to right:
   hands → words → code → AI → test.
   ============================================================ */
(function (KB) {
  "use strict";

  function go() { KB.ui.boot(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }

})(window.KB);
