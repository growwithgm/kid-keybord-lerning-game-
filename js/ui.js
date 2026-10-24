/* ============================================================
   ui.js — the shell every game plays inside.

   Built for a five-year-old, so: a home screen of big picture
   cards instead of a strip of tabs, one house button to get
   back, short words on screen and the longer explaining done
   by the voice.

   There is no picture of a keyboard anywhere. She uses the real
   one; when she is stuck we say which hand and which key.
   ============================================================ */
(function (KB) {
  "use strict";

  const ui = {};
  KB.ui = ui;

  const modes = [];
  let current = null;

  let elStage, elHands, elHome, elBack, elSound;

  ui.register = function (mode) { modes.push(mode); };
  ui.modeCount = function () { return modes.length; };

  /* ---------------- home screen ---------------- */

  ui.home = function () {
    picks = null;
    if (current && current.stop) current.stop();
    current = null;
    KB.hush();
    KB.state.lastMode = null;
    KB.save();

    ui.hideHands();
    ui.backButton(null);
    elHome.classList.remove("show");

    elStage.className = "stage home";
    elStage.innerHTML = "";
    elStage.appendChild(KB.el("h1", "home-title", "Keyboard Fun 🌈"));
    elStage.appendChild(KB.el("p", "home-lead", "Pick a game!"));

    const row = KB.el("div", "home-row");
    const entries = [];
    modes.forEach(m => {
      const c = KB.el("button", "home-card");
      c.style.setProperty("--c", m.color || "#7a6ff0");
      c.innerHTML = '<span class="home-icon">' + m.icon + "</span>" +
                    '<span class="home-name">' + m.label + "</span>";
      c.addEventListener("click", () => ui.go(m.id));
      row.appendChild(c);
      entries.push({ el: c, pick: () => ui.go(m.id) });
    });
    elStage.appendChild(row);
    elStage.appendChild(KB.el("p", "pick-hint", ui.pickHint(modes.length)));
    ui.pickable(entries);

    const stamp = document.getElementById("version");
    if (stamp) stamp.textContent = KB.VERSION;
  };

  ui.go = function (id) {
    if (!id) { ui.home(); return; }
    picks = null;
    if (current && current.stop) current.stop();
    KB.hush();
    current = modes.find(m => m.id === id);
    if (!current) { ui.home(); return; }
    KB.state.lastMode = current.id;
    KB.save();
    ui.hideHands();
    ui.backButton(null);
    elHome.classList.add("show");
    elStage.innerHTML = "";
    elStage.className = "stage mode-" + current.id;
    current.start(elStage);
  };

  ui.currentId = function () { return current ? current.id : null; };

  /* ---------------- keyboard-driven menus ----------------
     Every menu in the game used to need the trackpad: a child
     could open a game, press every key she knew and have
     nothing happen at all. In a game about the keyboard that is
     the one place a mouse must not be needed, so menus are now
     driven by the number keys, the arrows and Enter.

     A menu stays "live" only while its buttons are still in the
     page. The moment a mode replaces the stage with a level the
     buttons are detached, the menu goes quiet by itself, and
     keys go back to the mode. No bookkeeping to forget.      */

  let picks = null, picked = 0, onBack = null;

  function picksAlive() {
    return picks && picks.length && document.body.contains(picks[0].el);
  }

  function highlight(i) {
    if (!picksAlive()) return;
    picked = (i + picks.length) % picks.length;
    picks.forEach((p, n) => p.el.classList.toggle("sel", n === picked));
  }

  ui.pickable = function (entries, opts) {
    picks = entries.filter(e => e && e.el && !e.locked);
    onBack = (opts && opts.onBack) || null;
    if (!picks.length) { picks = null; return; }
    /* a card always wears its number, even when it is the only one
       unlocked — "press 1" is plainer to a child than "press Enter" */
    picks.forEach((p, i) => {
      if (i > 8) return;
      if (p.el.classList.contains("card") || p.el.classList.contains("home-card")) {
        p.el.appendChild(KB.el("span", "card-key", String(i + 1)));
      }
    });
    highlight(0);
  };

  ui.pickHint = function (n, kind) {
    if (kind === "button") return "Press <b>Enter</b> to start — or click.";
    if (n <= 1) return "Press <b>1</b> to start — or click.";
    const list = n === 2 ? "<b>1</b> or <b>2</b>"
                         : "<b>1</b> to <b>" + Math.min(n, 9) + "</b>";
    return "Press " + list + " to choose — or click.";
  };

  function menuKey(k) {
    if (/^[1-9]$/.test(k)) {
      const i = parseInt(k, 10) - 1;
      if (i < picks.length) { highlight(i); KB.sfx.pop(); picks[i].pick(); }
      else KB.sfx.tick();
      return true;
    }
    if (k === "ENTER" || k === "SPACE") { KB.sfx.pop(); picks[picked].pick(); return true; }
    if (k === "LEFT" || k === "UP")    { KB.sfx.tick(); highlight(picked - 1); return true; }
    if (k === "RIGHT" || k === "DOWN") { KB.sfx.tick(); highlight(picked + 1); return true; }
    if (k === "BACK") {
      KB.sfx.pop();
      if (onBack) onBack(); else ui.home();
      return true;
    }
    return true;   /* a stray letter on a menu simply does nothing */
  }

  /* a second, smaller button a mode can borrow to step back out
     of a level into its own list */
  ui.backButton = function (label, onClick) {
    if (!label) { elBack.classList.remove("show"); elBack.onclick = null; return; }
    elBack.textContent = label;
    elBack.onclick = onClick;
    elBack.classList.add("show");
  };

  /* ---------------- hands guide ----------------
     Only ever shown as a hint, and only ever says which hand. */

  ui.showHands = function (key) {
    const f = key ? KB.FINGER[key] : null;
    elHands.classList.add("show");
    elHands.querySelectorAll(".hand-wrap").forEach(n => {
      n.classList.toggle("lit", !!f && (n.dataset.hand === f.hand || f.hand === "T"));
    });
  };

  ui.hideHands = function () {
    elHands.classList.remove("show");
    elHands.querySelectorAll(".hand-wrap").forEach(n => n.classList.remove("lit"));
  };

  function buildHands() {
    ["L", "R"].forEach(hand => {
      const wrap = KB.el("div", "hand-wrap");
      wrap.dataset.hand = hand;
      wrap.appendChild(KB.el("div", "hand-emoji", hand === "L" ? "🤚" : "✋"));
      wrap.appendChild(KB.el("div", "hand-label", hand === "L" ? "left" : "right"));
      elHands.appendChild(wrap);
    });
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

  /* ---------------- keys ---------------- */

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
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^F\d+$/.test(e.key)) return;
    if (e.key === "Escape") return;

    if (e.key === "Tab") {                      /* Tab = big screen */
      e.preventDefault();
      ui.toggleFullscreen();
      return;
    }

    e.preventDefault();
    const k = normalize(e);
    if (!k) return;

    if (picksAlive()) { if (!e.repeat) menuKey(k); return; }

    if (e.repeat) {
      if (current && current.onRepeat) current.onRepeat(k, e);
      return;
    }
    if (current && current.onKey) current.onKey(k, { shift: e.shiftKey });
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
        if (p && p.catch) p.catch(() => ui.toast("Big screen is not available here"));
      }
      ui.toast("Press Esc to come back");
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    }
  };

  /* ---------------- boot ---------------- */

  ui.boot = function () {
    elStage = document.getElementById("stage");
    elHands = document.getElementById("hands");
    elHome  = document.getElementById("homebtn");
    elBack  = document.getElementById("back");
    elSound = document.getElementById("sound");

    buildHands();

    elHome.addEventListener("click", () => ui.home());

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

    ui.home();
  };

})(window.KB);
