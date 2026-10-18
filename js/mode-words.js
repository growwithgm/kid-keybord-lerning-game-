/* ============================================================
   mode-words.js — "Word Lab"

   Typing words, one rung at a time: three letters, four, five,
   two words with a space, then capitals with Shift.

   The important part is what happens when the child gets a
   letter wrong. Version 1 of this mode quietly refused the key,
   so the mistake never appeared and Backspace was never needed
   — the game was doing the noticing. Now the wrong letter lands
   on the screen in red and stays there until the child rubs it
   out, which is how typing actually works and is what the UK
   Year 1 curriculum calls adding and removing text.
   ============================================================ */
(function (KB) {
  "use strict";

  const LEVELS = [
    { id: "w3",  name: "3 letters", icon: "🐱", need: 3, blurb: "CAT · DOG · SUN",  words: () => KB.WORDS_3 },
    { id: "w4",  name: "4 letters", icon: "🐟", need: 3, blurb: "FISH · STAR",      words: () => KB.WORDS_4 },
    { id: "wsp", name: "two words", icon: "🐈", need: 3, blurb: "mind the gap!",    words: () => KB.PHRASES }
  ];

  let level = null, queue = null, wi = 0, typed = "", wrongs = 0, clean = 0, lock = false, dom = null;

  /* ---------------- menu ---------------- */

  function cleared(id) { return (KB.state.words && KB.state.words[id]) || 0; }
  function unlocked(i) { return i === 0 || cleared(LEVELS[i - 1].id) > 0; }

  function showMenu(stage) {
    level = null; queue = null; lock = false;
    KB.ui.hideHands();
    KB.ui.backButton(null);
    stage.innerHTML = "";
    stage.appendChild(KB.el("h2", "title", "Words 📖"));
    stage.appendChild(KB.el("p", "lead",
      "Copy the word. Wrong letter? Press <b>⌫</b> to rub it out."));

    const row = KB.el("div", "card-row");
    LEVELS.forEach((lv, idx) => {
      const open = unlocked(idx);
      const n = cleared(lv.id);
      const c = KB.el("button", "card" + (open ? "" : " locked"));
      c.innerHTML = '<span class="card-icon">' + (open ? lv.icon : "🔒") + "</span>" +
                    '<span class="card-name">' + lv.name + "</span>" +
                    '<span class="card-blurb">' + (open ? lv.blurb : "") + "</span>" +
                    '<span class="card-stars">' + "⭐".repeat(Math.min(n, 3)) +
                    "☆".repeat(Math.max(3 - n, 0)) + "</span>";
      if (open) c.addEventListener("click", () => startLevel(stage, lv));
      row.appendChild(c);
    });
    stage.appendChild(row);
  }

  /* ---------------- play ---------------- */

  function startLevel(stage, lv) {
    level = lv;
    queue = KB.shuffle(lv.words()).slice(0, lv.need);
    wi = 0; clean = 0; lock = false;

    stage.innerHTML = "";
    dom = {
      picture: KB.el("div", "fix-picture"),
      word:    KB.el("div", "word"),
      note:    KB.el("div", "note"),
      dots:    KB.el("div", "dots"),
      keys:    KB.el("div", "cmd-help")
    };
    dom.keys.innerHTML = '<span class="cmd"><b>⌫ Backspace</b> rubs out</span>';
    stage.append(dom.picture, dom.word, dom.note, dom.dots, dom.keys);
    KB.ui.backButton("← All levels", () => showMenu(stage));
    showWord(true);
  }

  function target() { return queue[wi][0]; }

  /* How far does what they typed still agree with the word? */
  function goodUpTo() {
    const w = target();
    let i = 0;
    while (i < typed.length && i < w.length && typed[i] === w[i]) i++;
    return i;
  }

  function hasMistake() { return goodUpTo() < typed.length; }

  /* One line shows everything: the letters they got right, the
     wrong one they actually typed, and the rest of the word in
     grey as a guide. */
  function render() {
    const w = target();
    const n = Math.max(typed.length, w.length);
    /* while a mistake is on screen the only move is Backspace, so
       don't also point at the next letter — one thing to do at a time */
    const stuck = hasMistake();
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
      const span = KB.el("span", cls + (ch === " " ? " gap" : ""), ch === " " ? "␣" : ch);
      dom.word.appendChild(span);
    }
  }

  function showWord(fresh) {
    typed = ""; wrongs = 0; lock = false;
    const [w, emoji] = queue[wi];
    dom.picture.textContent = emoji;
    render();
    dom.note.textContent = "";
    dom.dots.textContent = "📖 " + (wi + 1) + " / " + queue.length;
    KB.ui.hideHands();
    if (fresh) KB.speak("Type the word " + w.toLowerCase() + ".");
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
    KB.speak("You typed " + target().toLowerCase() + "!");
    wi++;
    setTimeout(() => {
      if (!queue) return;
      if (wi >= queue.length) finish();
      else showWord(true);
    }, 1600);
  }

  function finish() {
    const stage = document.getElementById("stage");
    KB.state.words = KB.state.words || {};
    KB.state.words[level.id] = Math.min((KB.state.words[level.id] || 0) + 1, 3);
    KB.save();

    KB.sfx.great();
    KB.cheer(true);
    dom.picture.textContent = "🏅";
    dom.word.textContent = level.name + " cleared!";
    dom.note.textContent = clean + " of " + queue.length + " with no mistakes!";
    dom.dots.textContent = "";
    KB.ui.hideHands();
    KB.speak("Level cleared!");
    queue = null;
    setTimeout(() => { if (KB.ui.currentId() === "words") showMenu(stage); }, 2800);
  }

  KB.ui.register({
    id: "words",
    icon: "📖",
    label: "Words",
    color: "#06d6a0",

    start(stage) { showMenu(stage); },
    stop() { queue = null; level = null; },

    onKey(k) {
      if (!queue || lock) return;

      if (k === "BACK") {
        if (!typed.length) return;
        typed = typed.slice(0, -1);
        KB.sfx.pop();
        KB.ui.hideHands();
        dom.note.textContent = hasMistake() ? dom.note.textContent : "";
        render();
        return;
      }

      if (k !== "SPACE" && !/^[A-Z0-9]$/.test(k)) return;

      /* while a wrong letter is sitting there, the only way on is
         to rub it out — that is the habit being taught */
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

      /* wrong: let it show, and say what to do about it */
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
      if (k === "BACK" && typed.length && !lock) {
        typed = typed.slice(0, -1);
        render();
      }
    }
  });

})(window.KB);
