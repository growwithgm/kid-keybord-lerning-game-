/* ============================================================
   mode-words.js — "Word Lab"

   The one weak spot in the last test was typing words, so this
   mode climbs one rung at a time: three letters, four, five,
   then two words with a space, then capitals with Shift — the
   first time both hands have to work together.
   ============================================================ */
(function (KB) {
  "use strict";

  const LEVELS = [
    {
      id: "w3", name: "Three Letters", icon: "🐱", need: 5,
      blurb: "CAT, DOG, SUN…",
      words: [["CAT","🐱"],["DOG","🐶"],["SUN","☀️"],["BUS","🚌"],["CUP","☕"],
              ["HAT","🎩"],["BEE","🐝"],["PIG","🐷"],["EGG","🥚"],["CAR","🚗"],
              ["BAT","🦇"],["FOX","🦊"]]
    },
    {
      id: "w4", name: "Four Letters", icon: "🐟", need: 5,
      blurb: "FISH, STAR, MOON…",
      words: [["FISH","🐟"],["STAR","⭐"],["MOON","🌙"],["CAKE","🎂"],["TREE","🌳"],
              ["BIRD","🐦"],["FROG","🐸"],["DUCK","🦆"],["LION","🦁"],["BEAR","🐻"],
              ["BOAT","⛵"],["DOOR","🚪"]]
    },
    {
      id: "w5", name: "Five Letters", icon: "🐴", need: 5,
      blurb: "HORSE, TRAIN, ROBOT…",
      words: [["HORSE","🐴"],["TRAIN","🚂"],["APPLE","🍎"],["SNAKE","🐍"],["MOUSE","🐭"],
              ["CLOUD","☁️"],["HOUSE","🏠"],["TIGER","🐯"],["ROBOT","🤖"],["PIZZA","🍕"],
              ["WHALE","🐳"],["SHEEP","🐑"]]
    },
    {
      id: "wsp", name: "Space Bar", icon: "🐈", need: 4,
      blurb: "Two words — mind the gap!",
      words: [["BIG CAT","🐈"],["RED BUS","🚌"],["HOT SUN","☀️"],["MY DOG","🐶"],
              ["BLUE SKY","🌤️"],["TWO CATS","🐈‍⬛"],["OLD TREE","🌳"],["BAD EGG","🥚"]]
    },
    {
      id: "wsh", name: "Shift Power", icon: "🔼", need: 4,
      blurb: "Hold Shift for a BIG letter",
      shift: true,
      words: [["Sam","🧒"],["Ben","👦"],["Mia","👧"],["Tom","👦"],
              ["Zoe","👧"],["Ali","🧒"],["Max","👦"],["Eva","👧"]]
    }
  ];

  let level = null, queue = null, wi = 0, li = 0, wrong = 0, clean = 0, lock = false, dom = null;

  /* ---------------- menu ---------------- */

  function cleared(id) { return (KB.state.words && KB.state.words[id]) || 0; }

  function unlocked(idx) {
    if (idx === 0) return true;
    return cleared(LEVELS[idx - 1].id) > 0;
  }

  function showMenu(stage) {
    level = null; queue = null; lock = false;
    KB.ui.hideHands();
    KB.ui.backButton(null);
    stage.innerHTML = "";

    stage.appendChild(KB.el("h2", "title", "Word Lab 📖"));
    stage.appendChild(KB.el("p", "lead",
      "Build words one letter at a time. Clear a level to open the next."));

    const row = KB.el("div", "card-row");
    LEVELS.forEach((lv, idx) => {
      const open = unlocked(idx);
      const c = KB.el("button", "card" + (open ? "" : " locked"));
      const n = cleared(lv.id);
      c.innerHTML = '<span class="card-icon">' + (open ? lv.icon : "🔒") + "</span>" +
                    '<span class="card-name">' + lv.name + "</span>" +
                    '<span class="card-blurb">' + (open ? lv.blurb : "Clear the one before") + "</span>" +
                    '<span class="card-stars">' + "⭐".repeat(Math.min(n, 3)) + "☆".repeat(Math.max(3 - n, 0)) + "</span>";
      if (open) c.addEventListener("click", () => startLevel(stage, lv));
      row.appendChild(c);
    });
    stage.appendChild(row);
  }

  /* ---------------- play ---------------- */

  function startLevel(stage, lv) {
    level = lv;
    queue = KB.shuffle(lv.words).slice(0, lv.need);
    wi = 0; li = 0; wrong = 0; clean = 0; lock = false;

    stage.innerHTML = "";
    dom = {
      big:   KB.el("div", "big"),
      word:  KB.el("div", "word"),
      note:  KB.el("div", "note"),
      dots:  KB.el("div", "dots")
    };
    stage.append(dom.big, dom.word, dom.note, dom.dots);
    KB.ui.backButton("← All levels", () => showMenu(stage));
    showWord(true);
  }

  function target() { return queue[wi][0]; }

  function renderWord() {
    const w = target();
    let html = "";
    for (let j = 0; j < w.length; j++) {
      const ch = w[j];
      const cls = j < li ? "done" : (j === li ? "next" : "todo");
      html += ch === " "
        ? '<span class="' + cls + ' gap">␣</span>'
        : '<span class="' + cls + '">' + ch + "</span>";
    }
    dom.word.innerHTML = html;
  }

  function showWord(fresh) {
    li = 0; wrong = 0; lock = false;
    const [w, emoji] = queue[wi];
    dom.big.textContent = emoji;
    dom.big.classList.remove("tiny");
    renderWord();
    dom.note.textContent = level.shift
      ? "The first letter is BIG — hold Shift with your other hand."
      : "";
    dom.dots.textContent = "📖 " + (wi + 1) + " / " + queue.length;
    KB.ui.hideHands();
    if (fresh) KB.speak("Type the word " + w.toLowerCase() + ".");
  }

  function wantsShift(ch) { return level.shift && ch === ch.toUpperCase() && /[A-Z]/.test(ch); }

  function wordDone() {
    lock = true;
    if (wrong === 0) clean++;
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

  function missed(expected) {
    wrong++;
    KB.sfx.nope();
    dom.word.classList.remove("shake");
    void dom.word.offsetWidth;
    dom.word.classList.add("shake");
    if (wrong >= 2) {
      const key = expected === " " ? "SPACE" : expected.toUpperCase();
      const hint = KB.fingerHint(key);
      dom.note.textContent = (expected === " " ? "You need the long space bar. " : "Looking for " + key + ". ") + hint;
      KB.ui.showHands(key);
      KB.speak(hint);
    } else {
      dom.note.textContent = "Nearly — try again!";
    }
  }

  function finish() {
    const stage = document.getElementById("stage");
    KB.state.words = KB.state.words || {};
    KB.state.words[level.id] = Math.min((KB.state.words[level.id] || 0) + 1, 3);
    KB.save();

    KB.sfx.great();
    KB.cheer(true);
    dom.big.textContent = "🏅";
    dom.word.textContent = level.name + " cleared!";
    dom.note.textContent = clean + " of " + queue.length + " typed with no mistakes.";
    dom.dots.textContent = "";
    KB.ui.hideHands();
    KB.speak("Level cleared! " + clean + " out of " + queue.length + " perfect.");
    queue = null;
    setTimeout(() => { if (KB.ui.currentId() === "words") showMenu(stage); }, 2800);
  }

  /* ---------------- mode object ---------------- */

  KB.ui.register({
    id: "words",
    icon: "📖",
    label: "Word Lab",

    start(stage) { showMenu(stage); },
    stop() { queue = null; level = null; },

    onKey(k, mod) {
      if (!queue || lock) return;
      const w = target();
      const ch = w[li];
      const expectKey = ch === " " ? "SPACE" : ch.toUpperCase();

      if (k === expectKey) {
        /* a capital really does need Shift held down */
        if (wantsShift(ch) && !mod.shift) {
          wrong++;
          KB.sfx.nope();
          dom.note.textContent = "Hold Shift, then press " + expectKey + " — both hands!";
          KB.ui.showHands(expectKey);
          KB.speak("Hold shift with your other hand, then press " + expectKey + ".");
          return;
        }
        KB.sfx.pop();
        li++;
        if (li >= w.length) { wordDone(); return; }
        renderWord();
        return;
      }

      if (/^[A-Z0-9]$/.test(k) || k === "SPACE") missed(ch);
    }
  });

})(window.KB);
