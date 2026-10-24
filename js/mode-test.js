/* ============================================================
   mode-test.js — "Lab Test"

   Version 1's test checked whether the child could find keys.
   This one checks the new ground: which hand owns a key, the
   home keys, longer words, Shift, reading a robot program, and
   whether they have grasped that a robot learns from examples.

   A point is scored only when the answer is right first time,
   but nobody ever gets stuck: after two misses the hint says
   which hand and finger to use and where to look on the real
   keyboard.
   ============================================================ */
(function (KB) {
  "use strict";

  const PASS = 5, LENGTH = 6;

  const JUNK = "XQZJWVK".split("");

  let paper = null, dom = null;

  /* ---------------- the paper ---------------- */

  function build() {
    const q = [];
    const pick = KB.pick;

    /* 1 · first sound: see a picture, press the letter it starts with */
    const p1 = pick(KB.CLEAR_PICTURE_WORDS);
    q.push({ group: "Sounds", face: p1[1],
             ask: "What does this start with?",
             say: p1[0].toLowerCase() + ". What letter does it start with?",
             answer: p1[0][0],
             help: p1[0].toLowerCase() + " starts with " + p1[0][0] + "." });

    /* 2 · rhyme: change the first letter of a word she knows.
       Both pictures have to be ones she can name on sight. */
    const famsWithClearPics = KB.FAMILIES
      .map(f => ({ ending: f.ending, words: f.words.filter(w => KB.isClearPicture(w[0])) }))
      .filter(f => f.words.length >= 2);
    const fam = pick(famsWithClearPics);
    const two = KB.shuffle(fam.words).slice(0, 2);
    q.push({ group: "Sounds", face: two[0][1] + " ➜ " + two[1][1], tiny: true,
             ask: two[0][0] + " becomes " + two[1][0] + ". Press the new first letter",
             say: two[0][0].toLowerCase() + " becomes " + two[1][0].toLowerCase() +
                  ". Which letter does it start with now?",
             answer: two[1][0][0],
             help: two[1][0].toLowerCase() + " starts with " + two[1][0][0] + "." });

    /* 3 · a word family word */
    const famW = pick(pick(KB.FAMILIES).words);
    q.push({ group: "Words", face: famW[1], word: famW[0],
             say: "Type " + famW[0].toLowerCase() + "." });

    /* 4 · a two-letter sound word */
    const dig = pick(KB.DIGRAPHS);
    const digW = pick(dig.words);
    q.push({ group: "Words", face: digW[1], word: digW[0],
             say: "Type " + digW[0].toLowerCase() + ". Remember, " +
                  dig.pair.split("").join(" ") + " says " + dig.says + "." });

    /* 5 · a tricky word */
    const tw = pick(KB.TRICKY_EASY.concat(KB.TRICKY_HARD));
    q.push({ group: "Tricky", face: "⭐", word: tw,
             say: "Type the tricky word " + tw.toLowerCase() + "." });

    /* 6 · fixing: rub the wrong letters off */
    const fx = pick(KB.WORDS_3);
    let tail = "";
    for (let i = 0; i < 2; i++) tail += pick(JUNK);
    q.push({ group: "Fixing", face: fx[1], fix: fx[0], start: fx[0] + tail,
             say: "Too many letters! Press backspace until it says " + fx[0].toLowerCase() + "." });

    return q;
  }

  /* ---------------- screens ---------------- */

  function showIntro(stage) {
    paper = null;
    KB.ui.backButton(null);
    KB.ui.hideHands();
    stage.innerHTML = "";

    const best = (KB.state.test3 && KB.state.test3.best) || 0;
    const card = KB.el("div", "panel");
    card.appendChild(KB.el("div", "panel-emoji", "⭐"));
    card.appendChild(KB.el("h2", "title", "Star Test"));
    card.appendChild(KB.el("p", "lead", "Just " + LENGTH + " little questions. Ready?"));
    if (best) {
      card.appendChild(KB.el("div", "score", "Best: " + best + " / " + LENGTH));
      card.appendChild(KB.el("p", "lead",
        (KB.state.test3.passed ? "Passed already! 🏆" : "Try to beat it!")));
    }
    const go = KB.el("button", "big-btn", "▶️ Start");
    go.addEventListener("click", () => start(stage));
    card.appendChild(go);
    stage.appendChild(card);
  }

  function start(stage) {
    paper = { q: build(), i: 0, results: [], first: true, wrong: 0, li: 0, lock: false };
    stage.innerHTML = "";
    dom = {
      big:  KB.el("div", "big"),
      sub:  KB.el("div", "sub"),
      word: KB.el("div", "word"),
      note: KB.el("div", "note"),
      dots: KB.el("div", "dots")
    };
    stage.append(dom.big, dom.sub, dom.word, dom.note, dom.dots);
    KB.ui.backButton("← Stop", () => showIntro(stage));
    showQ();
  }

  function marks() {
    let s = "";
    for (let j = 0; j < paper.q.length; j++) {
      const r = paper.results[j];
      s += r ? (r.ok ? "✅" : "❌") : "⬜";
    }
    return s;
  }

  function renderWord() {
    const q = paper.q[paper.i];
    let html = "";
    for (let j = 0; j < q.word.length; j++) {
      const ch = q.word[j];
      const cls = j < paper.li ? "done" : (j === paper.li ? "next" : "todo");
      html += ch === " " ? '<span class="' + cls + ' gap">␣</span>'
                         : '<span class="' + cls + '">' + ch + "</span>";
    }
    dom.word.innerHTML = html;
  }

  /* an editing question: show what is written, right letters green,
     wrong ones red, and the rest of the word greyed in as a guide */
  function renderFix() {
    const q = paper.q[paper.i];
    const w = q.fix, t = paper.typed;
    const stuck = fixHasMistake();
    let html = "";
    for (let j = 0; j < Math.max(t.length, w.length); j++) {
      let ch, cls;
      if (j < t.length) { ch = t[j]; cls = (j < w.length && t[j] === w[j]) ? "done" : "bad"; }
      else { ch = w[j]; cls = (!stuck && j === t.length) ? "next" : "todo"; }
      html += '<span class="' + cls + '">' + ch + "</span>";
    }
    dom.word.innerHTML = html;
  }

  function fixHasMistake() {
    const w = paper.q[paper.i].fix, t = paper.typed;
    let i = 0;
    while (i < t.length && i < w.length && t[i] === w[i]) i++;
    return i < t.length;
  }

  function showQ() {
    const q = paper.q[paper.i];
    paper.first = true; paper.wrong = 0; paper.li = 0; paper.lock = false;

    if (/^[A-Z]$/.test(q.face)) dom.big.innerHTML = KB.keyFace(q.face);
    else dom.big.textContent = q.face;
    dom.big.classList.toggle("tiny", !!q.tiny || q.face.length > 2);

    if (q.word) {
      dom.sub.textContent = "Type the word";
      renderWord();
      dom.word.style.display = "";
    } else if (q.fix) {
      paper.typed = q.start;
      dom.sub.textContent = "Make it say " + q.fix;
      renderFix();
      dom.word.style.display = "";
    } else {
      dom.sub.textContent = q.ask;
      dom.word.innerHTML = "";          /* don't leave the last word lying around */
      dom.word.style.display = "none";
    }

    dom.note.textContent = "";
    dom.dots.innerHTML = '<span class="marks">' + marks() + "</span>" +
                         '<span class="count">🎓 ' + (paper.i + 1) + " / " + paper.q.length + "</span>";
    KB.ui.hideHands();
    KB.speak(q.say);
  }

  function missed(expectKey, q) {
    paper.first = false;
    paper.wrong++;
    KB.sfx.nope();
    const shakeMe = q.word ? dom.word : dom.big;
    shakeMe.classList.remove("shake");
    void shakeMe.offsetWidth;
    shakeMe.classList.add("shake");
    if (paper.wrong >= 2) {
      const help = q.help || KB.fingerHint(expectKey);
      dom.note.textContent = help;
      if (/^[A-Z]$/.test(expectKey) || expectKey === "SPACE") KB.ui.showHands(expectKey);
      KB.speak(help);
    } else {
      dom.note.textContent = "Try again!";
    }
  }

  function correct() {
    const q = paper.q[paper.i];
    paper.results.push({ group: q.group, ok: paper.first });
    paper.lock = true;                 /* keys during the cheer must not count */
    KB.sfx.great();
    KB.cheer(paper.first);
    dom.note.textContent = paper.first ? KB.pick(KB.PRAISE) : "Got it! 👍";
    dom.dots.innerHTML = '<span class="marks">' + marks() + "</span>" +
                         '<span class="count">🎓 ' + (paper.i + 1) + " / " + paper.q.length + "</span>";
    KB.ui.hideHands();
    KB.speak(paper.first ? "Yes!" : "Got it!");
    paper.i++;
    setTimeout(() => {
      if (KB.ui.currentId() !== "test" || !paper) return;
      if (paper.i >= paper.q.length) finish();
      else showQ();
    }, 1500);
  }

  function finish() {
    const score = paper.results.filter(r => r.ok).length;
    const total = paper.results.length;
    const passed = score >= PASS;

    const groups = {};
    paper.results.forEach(r => {
      if (!groups[r.group]) groups[r.group] = { ok: 0, n: 0 };
      groups[r.group].n++;
      if (r.ok) groups[r.group].ok++;
    });

    const prev = KB.state.test3 || {};
    KB.state.test3 = {
      best: Math.max(prev.best || 0, score),
      passed: !!prev.passed || passed
    };
    KB.save();

    const stage = document.getElementById("stage");
    paper = null;
    KB.ui.backButton(null);
    KB.ui.hideHands();
    stage.innerHTML = "";

    const card = KB.el("div", "panel");
    card.appendChild(KB.el("div", "panel-emoji", passed ? "🏆" : "🌱"));
    card.appendChild(KB.el("h2", "title", passed ? "You passed!" : "Good try!"));
    card.appendChild(KB.el("div", "score", score + " / " + total));
    card.appendChild(KB.el("p", "lead", passed
      ? "You are brilliant at this! 🎉"
      : "Have another play, then try again!"));

    const chips = KB.el("div", "chips");
    Object.keys(groups).forEach(g => {
      const { ok, n } = groups[g];
      const cls = ok === n ? "chip good" : (ok * 2 < n ? "chip weak" : "chip");
      chips.appendChild(KB.el("span", cls, g + " " + ok + "/" + n));
    });
    card.appendChild(chips);

    card.appendChild(KB.el("p", "fineprint",
      "For grown-ups: a star is only given when the answer is right first time. " +
      PASS + " out of " + total + " passes."));

    const row = KB.el("div", "card-row tight");
    const again = KB.el("button", "big-btn", "🎓 Try again");
    again.addEventListener("click", () => start(stage));
    const home = KB.el("button", "big-btn ghost", "🏠 Home");
    home.addEventListener("click", () => KB.ui.home());
    row.append(again, home);
    card.appendChild(row);

    stage.appendChild(card);

    if (passed) KB.cheer(true);
    KB.speak(passed
      ? "Hooray! You passed with " + score + " out of " + total + "!"
      : "Good try! " + score + " out of " + total + ". Let's practise and come back.");
  }

  /* ---------------- mode object ---------------- */

  KB.ui.register({
    id: "test",
    icon: "⭐",
    label: "Star Test",
    color: "#ffc300",

    start(stage) { showIntro(stage); },
    stop() { paper = null; },

    onKey(k, mod) {
      if (!paper || paper.lock) return;
      const q = paper.q[paper.i];

      if (q.word) {
        const ch = q.word[paper.li];
        const expect = ch === " " ? "SPACE" : ch.toUpperCase();
        if (k === expect) {
          const needsShift = q.shift && ch === ch.toUpperCase() && /[A-Z]/.test(ch);
          if (needsShift && !mod.shift) {
            paper.first = false;
            KB.sfx.nope();
            dom.note.textContent = "Hold Shift with your other hand, then press " + expect + ".";
            KB.speak("Hold shift, then press " + expect + ".");
            return;
          }
          KB.sfx.pop();
          paper.li++;
          if (paper.li >= q.word.length) { correct(); return; }
          renderWord();
          return;
        }
        if (/^[A-Z0-9]$/.test(k) || k === "SPACE") missed(expect, q);
        return;
      }

      if (q.fix) {
        if (k === "BACK") {
          if (paper.typed.length) {
            paper.typed = paper.typed.slice(0, -1);
            KB.sfx.pop();
            KB.ui.hideHands();
            renderFix();
            if (paper.typed === q.fix) correct();
          }
          return;
        }
        if (k !== "SPACE" && !/^[A-Z0-9]$/.test(k)) return;
        if (fixHasMistake() || paper.typed.length >= q.fix.length) {
          /* the only way forward is to rub the wrong letter out */
          paper.first = false;
          paper.wrong++;
          KB.sfx.nope();
          dom.note.textContent = paper.wrong >= 2
            ? "Press ⌫ Backspace — " + KB.whereIs("BACK") + "."
            : "Rub out the wrong letter first with ⌫ Backspace.";
          if (paper.wrong >= 2) KB.speak("Press backspace to rub out the wrong letter.");
          return;
        }
        const want = q.fix[paper.typed.length];
        paper.typed += (k === "SPACE" ? " " : k);
        if (paper.typed[paper.typed.length - 1] === want) KB.sfx.pop();
        else { paper.first = false; paper.wrong++; KB.sfx.nope(); }
        renderFix();
        if (paper.typed === q.fix) correct();
        else if (paper.wrong >= 2) {
          dom.note.textContent = "Rub it out with ⌫ Backspace, then press " + want + ". " +
                                 KB.fingerHint(want);
          KB.ui.showHands(want);
        }
        return;
      }

      if (k === q.answer) { correct(); return; }
      if (/^[A-Z0-9]$/.test(k) || k === "SPACE" ||
          k === "LEFT" || k === "RIGHT" || k === "UP" || k === "DOWN") missed(q.answer, q);
    },

    onRepeat(k) {
      if (!paper || paper.lock || k !== "BACK") return;
      const q = paper.q[paper.i];
      if (!q.fix || !paper.typed.length) return;
      paper.typed = paper.typed.slice(0, -1);
      renderFix();
      if (paper.typed === q.fix) correct();
    }
  });

})(window.KB);
