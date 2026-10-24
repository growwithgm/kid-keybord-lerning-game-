/* ============================================================
   drill.js — the engine behind Rhyme Time, Two Letters and
   Tricky Words.

   All three are the same shape: show a picture and the word,
   she copies it, and a wrong letter stays on the screen in red
   until she rubs it out with Backspace. Only the word lists and
   the banner above them differ, so they share this one file.
   ============================================================ */
(function (KB) {
  "use strict";

  KB.makeDrill = function (cfg) {
    let level = null, queue = null, qi = 0, typed = "", wrongs = 0, clean = 0;
    let lock = false, dom = null;

    /* ---------------- menu ---------------- */

    function starsFor(id) {
      const got = (KB.state[cfg.id] && KB.state[cfg.id][id]) || 0;
      return "⭐".repeat(Math.min(got, 3)) + "☆".repeat(Math.max(3 - got, 0));
    }

    function unlocked(i) {
      if (i === 0) return true;
      const prev = cfg.levels[i - 1].id;
      return ((KB.state[cfg.id] && KB.state[cfg.id][prev]) || 0) > 0;
    }

    function showMenu(stage) {
      level = null; queue = null; lock = false;
      KB.ui.hideHands();
      KB.ui.backButton(null);
      stage.innerHTML = "";
      stage.appendChild(KB.el("h2", "title", cfg.title));
      stage.appendChild(KB.el("p", "lead", cfg.lead));

      const row = KB.el("div", "card-row");
      cfg.levels.forEach((lv, i) => {
        const open = unlocked(i);
        const c = KB.el("button", "card" + (open ? "" : " locked"));
        c.innerHTML = '<span class="card-icon">' + (open ? lv.icon : "🔒") + "</span>" +
                      '<span class="card-name">' + lv.name + "</span>" +
                      '<span class="card-blurb">' + (open ? (lv.blurb || "") : "") + "</span>" +
                      '<span class="card-stars">' + starsFor(lv.id) + "</span>";
        if (open) c.addEventListener("click", () => startLevel(stage, lv));
        row.appendChild(c);
      });
      stage.appendChild(row);
    }

    /* ---------------- play ---------------- */

    function startLevel(stage, lv) {
      level = lv;
      const items = lv.items();
      queue = KB.shuffle(items).slice(0, lv.need || 3);
      qi = 0; clean = 0; lock = false;

      stage.innerHTML = "";
      dom = {
        banner:  KB.el("div", "banner"),
        picture: KB.el("div", "fix-picture"),
        word:    KB.el("div", "word"),
        note:    KB.el("div", "note"),
        dots:    KB.el("div", "dots"),
        keys:    KB.el("div", "cmd-help", '<span class="cmd"><b>⌫ Backspace</b> rubs out</span>')
      };
      stage.append(dom.banner, dom.picture, dom.word, dom.note, dom.dots, dom.keys);
      KB.ui.backButton("← Back", () => showMenu(stage));
      if (lv.banner) {
        dom.banner.innerHTML = lv.banner;
        dom.banner.style.display = "";
      } else {
        dom.banner.style.display = "none";
      }
      showWord(true);
    }

    function target() { return queue[qi][0]; }
    function picture() { return queue[qi][1]; }

    function goodUpTo() {
      const w = target();
      let i = 0;
      while (i < typed.length && i < w.length && typed[i] === w[i]) i++;
      return i;
    }

    function hasMistake() { return goodUpTo() < typed.length; }

    function render() {
      const w = target();
      const stuck = hasMistake();
      const n = Math.max(typed.length, w.length);
      dom.word.innerHTML = "";
      for (let i = 0; i < n; i++) {
        let ch, cls;
        if (i < typed.length) {
          ch = typed[i];
          cls = (i < w.length && typed[i] === w[i]) ? "done" : "bad";
        } else {
          ch = w[i];
          cls = (!stuck && i === typed.length) ? "next" : "todo";
        }
        dom.word.appendChild(
          KB.el("span", cls + (ch === " " ? " gap" : ""), ch === " " ? "␣" : ch));
      }
    }

    function showWord(fresh) {
      typed = ""; wrongs = 0; lock = false;
      dom.picture.textContent = picture() || "";
      dom.picture.style.display = picture() ? "" : "none";
      render();
      dom.note.textContent = "";
      dom.dots.textContent = (level.dot || "📖") + " " + (qi + 1) + " / " + queue.length;
      KB.ui.hideHands();
      if (fresh && cfg.say) KB.speak(cfg.say(target(), level));
    }

    function askForBackspace() {
      dom.note.textContent = "Oops! Press ⌫ to rub it out.";
      KB.speak("Oops! Press backspace to rub it out. It is in the top right corner.");
    }

    function wordDone() {
      lock = true;
      if (wrongs === 0) clean++;
      KB.sfx.great();
      KB.cheer(true);
      dom.note.textContent = KB.pick(KB.PRAISE) + "  " + target();
      KB.speak(cfg.cheer ? cfg.cheer(target(), level) : target().toLowerCase() + "!");
      qi++;
      setTimeout(() => {
        if (!queue) return;
        if (qi >= queue.length) finish();
        else showWord(true);
      }, 1700);
    }

    function finish() {
      const stage = document.getElementById("stage");
      KB.state[cfg.id] = KB.state[cfg.id] || {};
      KB.state[cfg.id][level.id] = Math.min((KB.state[cfg.id][level.id] || 0) + 1, 3);
      KB.save();

      KB.sfx.great();
      KB.cheer(true);
      dom.banner.style.display = "none";
      dom.picture.style.display = "";
      dom.picture.textContent = "🏅";
      dom.word.textContent = level.name + " done!";
      dom.note.textContent = clean + " of " + queue.length + " with no mistakes!";
      dom.dots.textContent = "";
      KB.ui.hideHands();
      KB.speak("Well done!");
      queue = null;
      setTimeout(() => { if (KB.ui.currentId() === cfg.id) showMenu(stage); }, 2800);
    }

    /* ---------------- the mode ---------------- */

    KB.ui.register({
      id: cfg.id,
      icon: cfg.icon,
      label: cfg.label,
      color: cfg.color,

      start(stage) { showMenu(stage); },
      stop() { queue = null; level = null; },

      onKey(k) {
        if (!queue || lock) return;

        if (k === "BACK") {
          if (!typed.length) return;
          typed = typed.slice(0, -1);
          KB.sfx.pop();
          KB.ui.hideHands();
          if (!hasMistake()) dom.note.textContent = "";
          render();
          return;
        }

        if (k !== "SPACE" && !/^[A-Z0-9]$/.test(k)) return;

        /* a wrong letter has to go before anything else can happen */
        if (hasMistake()) { KB.sfx.nope(); askForBackspace(); return; }

        const w = target();
        if (typed.length >= w.length) { askForBackspace(); return; }

        const ch = (k === "SPACE") ? " " : k;
        typed += ch;
        const want = w[typed.length - 1];

        if (ch === want) {
          KB.sfx.pop();
          render();
          if (typed === w) { wordDone(); return; }
          dom.note.textContent = "";
          return;
        }

        wrongs++;
        KB.sfx.nope();
        render();
        dom.word.classList.remove("shake");
        void dom.word.offsetWidth;
        dom.word.classList.add("shake");

        if (wrongs >= 2) {
          const wantKey = want === " " ? "SPACE" : want;
          dom.note.textContent = "Press ⌫, then " + (want === " " ? "the long bar" : want) + ".";
          KB.ui.showHands(wantKey);
          KB.speak("Rub it out, then press " + (want === " " ? "the space bar" : want) + ". " +
                   KB.fingerHint(wantKey));
        } else {
          askForBackspace();
        }
      },

      onRepeat(k) {
        if (k === "BACK" && queue && !lock && typed.length) {
          typed = typed.slice(0, -1);
          render();
        }
      }
    });
  };

})(window.KB);
