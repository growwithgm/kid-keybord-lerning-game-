/* ============================================================
   mode-fix.js — "Fix It"

   One mechanic, four levels of difficulty: here is the word it
   should say, here is what is actually written — make them
   match. Backspace rubs out, letters write.

   This is the skill the UK Year 1 computing curriculum calls
   "adding and removing text", and it is the one a child needs
   before anything else on a computer: notice the mistake, take
   it out, put the right thing in.
   ============================================================ */
(function (KB) {
  "use strict";

  const JUNK = "XQZJWVK".split("");

  const LEVELS = [
    {
      id: "f1", icon: "🧽", name: "Rub it out", need: 4,
      blurb: "Too many letters at the end — take them off.",
      make(word) {
        let extra = "";
        const n = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) extra += KB.pick(JUNK);
        return word + extra;
      },
      say: "Too many letters! Press backspace until it says the word."
    },
    {
      id: "f2", icon: "✏️", name: "Last one wrong", need: 4,
      blurb: "The last letter is wrong. Rub it out and type the right one.",
      make(word) {
        let bad = KB.pick(JUNK);
        while (bad === word[word.length - 1]) bad = KB.pick(JUNK);
        return word.slice(0, -1) + bad;
      },
      say: "The last letter is wrong. Rub it out, then type the right one."
    },
    {
      id: "f3", icon: "➕", name: "Finish it", need: 4,
      blurb: "Some letters are missing — type the rest.",
      make(word) {
        const keep = 1 + Math.floor(Math.random() * (word.length - 2));
        return word.slice(0, keep);
      },
      say: "It is not finished. Type the letters that are missing."
    },
    {
      id: "f4", icon: "🔎", name: "Wrong in the middle", need: 4,
      blurb: "A letter in the middle is wrong. Go back and fix it.",
      make(word) {
        const at = 1 + Math.floor(Math.random() * (word.length - 2));
        let bad = KB.pick(JUNK);
        while (bad === word[at]) bad = KB.pick(JUNK);
        return word.slice(0, at) + bad + word.slice(at + 1);
      },
      say: "A letter in the middle is wrong. Rub back to it, then type the rest."
    }
  ];

  let level = null, queue = null, qi = 0, text = "", dom = null, lock = false, clean = 0, touched = 0;

  /* ---------------- menu ---------------- */

  function stars(id) {
    const n = (KB.state.fix && KB.state.fix[id]) || 0;
    return "⭐".repeat(Math.min(n, 3)) + "☆".repeat(Math.max(3 - n, 0));
  }

  function open(idx) {
    if (idx === 0) return true;
    return ((KB.state.fix && KB.state.fix[LEVELS[idx - 1].id]) || 0) > 0;
  }

  function showMenu(stage) {
    level = null; queue = null; lock = false;
    KB.ui.hideHands();
    KB.ui.backButton(null);
    stage.innerHTML = "";
    stage.appendChild(KB.el("h2", "title", "Fix It ✏️"));
    stage.appendChild(KB.el("p", "lead",
      "The word is written wrong. Use <b>⌫ Backspace</b> to rub out, " +
      "and the letter keys to write — until it matches the picture."));

    const row = KB.el("div", "card-row");
    LEVELS.forEach((lv, idx) => {
      const unlocked = open(idx);
      const c = KB.el("button", "card" + (unlocked ? "" : " locked"));
      c.innerHTML = '<span class="card-icon">' + (unlocked ? lv.icon : "🔒") + "</span>" +
                    '<span class="card-name">' + lv.name + "</span>" +
                    '<span class="card-blurb">' + (unlocked ? lv.blurb : "Clear the one before") + "</span>" +
                    '<span class="card-stars">' + stars(lv.id) + "</span>";
      if (unlocked) c.addEventListener("click", () => startLevel(stage, lv));
      row.appendChild(c);
    });
    stage.appendChild(row);
  }

  /* ---------------- play ---------------- */

  function wordPool() {
    return KB.WORDS_3.concat(KB.WORDS_4);
  }

  function startLevel(stage, lv) {
    level = lv;
    queue = KB.shuffle(wordPool()).slice(0, lv.need);
    qi = 0; clean = 0; lock = false;

    stage.innerHTML = "";
    dom = {
      picture: KB.el("div", "fix-picture"),
      target:  KB.el("div", "fix-target"),
      line:    KB.el("div", "write-line"),
      note:    KB.el("div", "note"),
      dots:    KB.el("div", "dots"),
      keys:    KB.el("div", "cmd-help")
    };
    dom.keys.innerHTML =
      '<span class="cmd"><b>Backspace</b> rub out one letter</span>' +
      '<span class="cmd"><b>letters</b> write</span>';
    stage.append(dom.picture, dom.target, dom.line, dom.note, dom.dots, dom.keys);
    KB.ui.backButton("← All levels", () => showMenu(stage));
    showOne(true);
  }

  function target() { return queue[qi][0]; }

  function render() {
    const want = target();
    dom.line.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
      const good = i < want.length && text[i] === want[i];
      const s = KB.el("span", "ch " + (good ? "ok" : "bad"), text[i]);
      dom.line.appendChild(s);
    }
    dom.line.appendChild(KB.el("span", "caret", ""));
  }

  function showOne(fresh) {
    const [word, emoji] = queue[qi];
    text = level.make(word);
    touched = 0;
    lock = false;
    dom.picture.textContent = emoji;
    dom.target.innerHTML = "it should say <b>" + word + "</b>";
    dom.note.textContent = "";
    dom.dots.textContent = "✏️ " + (qi + 1) + " / " + queue.length;
    render();
    if (fresh) KB.speak(level.say + " The word is " + word.toLowerCase() + ".");
  }

  function done() {
    lock = true;
    if (touched <= target().length + 2) clean++;
    KB.sfx.great();
    KB.cheer(true);
    dom.note.textContent = KB.pick(KB.PRAISE) + " It says " + target() + " now.";
    KB.speak("Fixed it! " + target().toLowerCase() + ".");
    qi++;
    setTimeout(() => {
      if (!queue) return;
      if (qi >= queue.length) finish();
      else showOne(true);
    }, 1700);
  }

  function finish() {
    const stage = document.getElementById("stage");
    KB.state.fix = KB.state.fix || {};
    KB.state.fix[level.id] = Math.min((KB.state.fix[level.id] || 0) + 1, 3);
    KB.save();

    KB.sfx.great();
    KB.cheer(true);
    dom.picture.textContent = "🏅";
    dom.target.textContent = level.name + " cleared!";
    dom.line.innerHTML = "";
    dom.note.textContent = clean + " of " + queue.length + " fixed without any extra rubbing out.";
    dom.dots.textContent = "";
    KB.ui.hideHands();
    KB.speak("Level cleared!");
    queue = null;
    setTimeout(() => { if (KB.ui.currentId() === "fix") showMenu(stage); }, 2800);
  }

  function nudge() {
    const want = target();
    /* what should they do next? rub out, or write? */
    let i = 0;
    while (i < text.length && i < want.length && text[i] === want[i]) i++;
    if (text.length > i) {
      const hint = "Press ⌫ Backspace — " + KB.whereIs("BACK") + ".";
      dom.note.textContent = hint;
      KB.speak("Press backspace to rub out the wrong letter.");
    } else {
      const next = want[i];
      dom.note.textContent = "Now type " + next + ". " + KB.fingerHint(next);
      KB.ui.showHands(next);
      KB.speak("Now type " + next + ".");
    }
  }

  KB.ui.register({
    id: "fix",
    icon: "✏️",
    label: "Fix It",

    start(stage) { showMenu(stage); },
    stop() { queue = null; level = null; },

    onKey(k) {
      if (!queue || lock) return;

      if (k === "BACK") {
        if (!text.length) { dom.note.textContent = "Nothing left to rub out."; return; }
        text = text.slice(0, -1);
        touched++;
        KB.sfx.pop();
        KB.ui.hideHands();
        render();
        if (text === target()) done();
        return;
      }

      if (k === "SPACE" || /^[A-Z0-9]$/.test(k)) {
        if (text.length >= target().length + 4) {
          nudge();
          return;
        }
        text += (k === "SPACE" ? " " : k);
        touched++;
        KB.sfx.tick();
        KB.ui.hideHands();
        render();
        if (text === target()) { done(); return; }
        /* a wrong letter is allowed to sit there — noticing it is the lesson */
        if (touched >= target().length + 3) nudge();
      }
    },

    onRepeat(k) {
      if (k === "BACK" && text.length && !lock) {
        text = text.slice(0, -1);
        render();
        if (text === target()) done();
      }
    }
  });

})(window.KB);
