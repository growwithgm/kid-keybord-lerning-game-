/* ============================================================
   ui.js — the shell every mode plays inside.

   Deliberately there is NO picture of a keyboard anywhere: the
   child looks down at the real one. When they get stuck we tell
   them which hand and finger to use instead of lighting up a
   fake key.
   ============================================================ */
(function (KB) {
  "use strict";

  const ui = {};
  KB.ui = ui;

  const modes = [];
  let current = null;

  let elTabs, elStage, elHands, elBack, elSound;

  /* ---------------- mode registry ---------------- */

  ui.register = function (mode) { modes.push(mode); };

  ui.go = function (id) {
    if (current && current.stop) current.stop();
    KB.hush();
    current = modes.find(m => m.id === id) || modes[0];
    KB.state.lastMode = current.id;
    KB.save();
    elTabs.querySelectorAll(".tab").forEach(t => {
      t.classList.toggle("on", t.dataset.id === current.id);
    });
    ui.hideHands();
    ui.backButton(null);
    elStage.innerHTML = "";
    elStage.className = "stage mode-" + current.id;
    current.start(elStage);
  };

  ui.currentId = function () { return current ? current.id : null; };

  /* ---------------- the "go back" button a mode can borrow ---------------- */

  ui.backButton = function (label, onClick) {
    if (!label) { elBack.classList.remove("show"); elBack.onclick = null; return; }
    elBack.textContent = label;
    elBack.onclick = onClick;
    elBack.classList.add("show");
  };

  /* ---------------- hands guide ----------------
     Two hands, ten fingers. Not a keyboard — it answers
     "which finger?" and sends the child's eyes downward.     */

  ui.showHands = function (key) {
    const f = key ? KB.FINGER[key] : null;
    elHands.classList.add("show");
    elHands.querySelectorAll(".finger").forEach(n => {
      const on = f && (
        (f.hand === "T" && n.dataset.finger === "T") ||
        (n.dataset.hand === f.hand && n.dataset.finger === String(f.finger))
      );
      n.classList.toggle("lit", !!on);
    });
  };

  ui.hideHands = function () {
    elHands.classList.remove("show");
    elHands.querySelectorAll(".finger").forEach(n => n.classList.remove("lit"));
  };

  function buildHands() {
    const mk = (hand) => {
      const h = KB.el("div", "hand hand-" + hand);
      const order = hand === "L" ? [3, 2, 1, 0] : [0, 1, 2, 3];
      const row = KB.el("div", "finger-row");
      order.forEach(i => {
        const f = KB.el("div", "finger");
        f.dataset.hand = hand;
        f.dataset.finger = String(i);
        f.style.setProperty("--fc", KB.FINGER_COLORS[i]);
        f.title = KB.HAND_NAMES[hand] + " " + KB.FINGER_NAMES[i];
        row.appendChild(f);
      });
      const thumb = KB.el("div", "finger thumb");
      thumb.dataset.hand = hand;
      thumb.dataset.finger = "T";
      thumb.style.setProperty("--fc", "#8b5cf6");
      if (hand === "L") { h.appendChild(row); h.appendChild(thumb); }
      else { h.appendChild(thumb); h.appendChild(row); }
      const label = KB.el("div", "hand-label", hand === "L" ? "left" : "right");
      const wrap = KB.el("div", "hand-wrap");
      wrap.appendChild(h);
      wrap.appendChild(label);
      return wrap;
    };
    elHands.appendChild(mk("L"));
    elHands.appendChild(mk("R"));
  }

  /* ---------------- toast ---------------- */

  let toastTimer = null;
  ui.toast = function (msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  };

  /* ---------------- key normalising ----------------
     Every mode receives the same small vocabulary:
     "A".."Z", "0".."9", SPACE, ENTER, BACK, LEFT/UP/DOWN/RIGHT,
     and SHIFT+letter arrives as { key, shift:true }.          */

  function normalize(e) {
    if (e.key === " " || e.code === "Space") return "SPACE";
    if (e.key === "Enter") return "ENTER";
    if (e.key === "Backspace") return "BACK";
    if (e.key === "ArrowLeft") return "LEFT";
    if (e.key === "ArrowUp") return "UP";
    if (e.key === "ArrowDown") return "DOWN";
    if (e.key === "ArrowRight") return "RIGHT";
    if (e.key.length === 1) {
      const k = e.key.toUpperCase();
      if (/^[A-Z0-9]$/.test(k)) return k;
    }
    return null;
  }

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;   /* leave browser shortcuts alone */
    if (/^F\d+$/.test(e.key)) return;
    if (e.key === "Escape") return;

    if (e.key === "Tab") {                            /* Tab = big screen */
      e.preventDefault();
      ui.toggleFullscreen();
      return;
    }

    e.preventDefault();
    if (e.repeat) {
      if (current && current.onRepeat) current.onRepeat(normalize(e), e);
      return;
    }

    const k = normalize(e);
    if (!k || !current || !current.onKey) return;
    current.onKey(k, { shift: e.shiftKey });
  });

  document.addEventListener("keyup", function (e) {
    if (!current || !current.onKeyUp) return;
    const k = normalize(e);
    if (k) current.onKeyUp(k);
  });

  window.addEventListener("blur", function () {
    if (current && current.onBlur) current.onBlur();
  });

  /* ---------------- fullscreen ---------------- */

  ui.toggleFullscreen = function () {
    const d = document, el = d.documentElement;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) {
        const p = req.call(el);
        if (p && p.catch) p.catch(() => ui.toast("Full screen is not available here"));
      }
      ui.toast("Press Esc to come back");
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    }
  };

  /* ---------------- boot ---------------- */

  ui.boot = function () {
    elTabs  = document.getElementById("tabs");
    elStage = document.getElementById("stage");
    elHands = document.getElementById("hands");
    elBack  = document.getElementById("back");
    elSound = document.getElementById("sound");

    buildHands();

    modes.forEach(m => {
      const t = KB.el("button", "tab", m.icon + " " + m.label);
      t.dataset.id = m.id;
      t.addEventListener("click", () => ui.go(m.id));
      elTabs.appendChild(t);
    });

    elSound.textContent = KB.soundOn ? "🔊" : "🔇";
    elSound.addEventListener("click", () => {
      KB.soundOn = !KB.soundOn;
      KB.state.soundOn = KB.soundOn;
      KB.save();
      elSound.textContent = KB.soundOn ? "🔊" : "🔇";
      if (!KB.soundOn) KB.hush();
    });

    document.getElementById("full").addEventListener("click", ui.toggleFullscreen);
    document.addEventListener("contextmenu", e => e.preventDefault());
    if ("speechSynthesis" in window) speechSynthesis.getVoices();

    const start = modes.find(m => m.id === KB.state.lastMode) ? KB.state.lastMode : modes[0].id;
    ui.go(start);
  };

})(window.KB);
