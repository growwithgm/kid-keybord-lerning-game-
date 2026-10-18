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
    { id: "w3",  name: "Three Letters", icon: "🐱", need: 5, blurb: "CAT, DOG, SUN…",      words: () => KB.WORDS_3 },
    { id: "w4",  name: "Four Letters",  icon: "🐟", need: 5, blurb: "FISH, STAR, MOON…",   words: () => KB.WORDS_4 },
    { id: "w5",  name: "Five Letters",  icon: "🐴", need: 5, blurb: "HORSE, TRAIN, ROBOT…", words: () => KB.WORDS_5 },
    { id: "wsp", name: "Space Bar",     icon: "🐈", need: 4, blurb: "Two words — mind the gap!", words: () => KB.PHRASES },
    { id: "wsh", name: "Shift Power",   icon: "🔼", need: 4, blurb: "Hold Shift for a BIG letter",
      shift: true, words: () => KB.NAMES }
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
    stage.appendChild(KB.el("h2", "title", "Word Lab 📖"));
    stage.appendChild(KB.el("p", "lead",
      "Copy the word. If a letter comes out wrong it stays on the screen — " +
      "rub it out with <b>⌫ Backspace</b> and try that one again."));

    const row = KB.el("div", "card-row");
    LEVELS.forEach((lv, idx) => {
      const open = unlocked(idx);
      const n = cleared(lv.id);
      const c = KB.el("button", "card" + (open ? "" : " locked"));
      c.innerHTML = '<span class="card-icon">' + (open ? lv.icon : "🔒") + "</span>" +
                    '<span class="card-name">' + lv.name + "</span>" +
                    '<span class="card-blurb">' + (open ? lv.blurb : "Clear the one before") + "</span>" +
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
    dom.keys.innerHTML =
      '<span class="cmd"><b>letters</b> write</span>' +
      '<span class="cmd"><b>Backspace</b> rub out a wrong letter</span>' +
      (lv.shift ? '<span class="cmd"><b>Shift</b> + letter = BIG letter</span>' : "");
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
    dom.note.textContent = level.shift
      ? "The first letter is BIG — hold Shift with your other hand."
      : "";
    dom.dots.textContent = "📖 " + (wi + 1) + " / " + queue.length;
    KB.ui.hideHands();
    if (fresh) KB.speak("Type the word " + w.toLowerCase() + ".");
  }

  function askForBackspace() {
    dom.note.textContent = "That one is wrong — press ⌫ Backspace to rub it out. It is " +
                           KB.whereIs("BACK") + ".";
    KB.speak("That letter is wrong. Press backspace to rub it out.");
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
    dom.note.textContent = clean + " of " + queue.length + " typed with no mistakes at all.";
    dom.dots.textContent = "";
    KB.ui.hideHands();
    KB.speak("Level cleared!");
    queue = null;
    setTimeout(() => { if (KB.ui.currentId() === "words") showMenu(stage); }, 2800);
  }

  KB.ui.register({
    id: "words",
    icon: "📖",
    label: "Word Lab",

    start(stage) { showMenu(stage); },
    stop() { queue = null; level = null; },

    onKey(k, mod) {
      if (!queue || lock) return;

      if (k === "BACK") {
        if (!typed.length) { dom.note.textContent = "Nothing to rub out yet."; return; }
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

      /* in the Shift level the case matters, so keep what was really typed */
      let ch;
      if (k === "SPACE") ch = " ";
      else if (level.shift) ch = mod.shift ? k : k.toLowerCase();
      else ch = k;

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

      if (level.shift && ch.toUpperCase() === want.toUpperCase() && want === want.toUpperCase()) {
        dom.note.textContent = "Almost! That needs to be a BIG " + want +
                               " — rub it out, hold Shift, and press it again.";
        KB.speak("Almost! Rub it out, then hold shift and press " + want + ".");
      } else if (wrongs >= 2) {
        dom.note.textContent = "Rub it out with ⌫ Backspace, then press " +
                               (want === " " ? "the space bar" : want) + ". " +
                               KB.fingerHint(want === " " ? "SPACE" : want.toUpperCase());
        KB.ui.showHands(want === " " ? "SPACE" : want.toUpperCase());
        KB.speak("Rub it out, then press " + (want === " " ? "the space bar" : want) + ".");
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
