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

  const PASS = 9, LENGTH = 12;
  const HOME = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  /* Only the keys a finger actually rests on: G and H are stretches
     for the pointing fingers, so asking "which key is under your
     pointing finger" with those in the list has two right answers. */
  const HOME_RESTING = ["A", "S", "D", "F", "J", "K", "L"];
  const ALL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const JUNK = "XQZJWVK".split("");

  let paper = null, dom = null;

  /* ---------------- the paper ---------------- */

  function build() {
    const q = [];
    const pick = KB.pick;

    /* --- hands: which side does this key live on --- */
    const h1 = pick(ALL);
    q.push({
      group: "Hands", face: h1,
      ask: "Left hand or right hand? Press that arrow.",
      say: "The letter " + h1 + ". Is it left hand or right hand? Press that arrow key.",
      answer: KB.handOf(h1) === "L" ? "LEFT" : "RIGHT",
      help: "Press the " + (KB.handOf(h1) === "L" ? "left" : "right") +
            " arrow, in the bottom right corner."
    });

    /* --- hands: the bumpy key --- */
    const bump = pick(["F", "J"]);
    q.push({
      group: "Hands", face: "⠿",
      ask: "Press the " + (bump === "F" ? "LEFT" : "RIGHT") + " bumpy key",
      say: "Feel for the " + (bump === "F" ? "left" : "right") +
           " key with the little bump, and press it.",
      answer: bump
    });

    /* --- hands: a key by finger name alone --- */
    const fk = pick(HOME_RESTING);
    const ff = KB.FINGER[fk];
    q.push({
      group: "Hands", face: "🤔",
      ask: "Which key sits under your " + KB.HAND_NAMES[ff.hand] + " " +
           KB.FINGER_NAMES[ff.finger] + " on the home row?",
      say: "Which home key sits under your " + KB.HAND_NAMES[ff.hand] + " " +
           KB.FINGER_NAMES[ff.finger] + "?",
      answer: fk
    });

    /* --- words --- */
    const w4 = pick(KB.WORDS_4);
    q.push({ group: "Words", face: w4[1], word: w4[0], say: "Type the word " + w4[0].toLowerCase() + "." });

    const ph = pick(KB.PHRASES);
    q.push({ group: "Words", face: ph[1], word: ph[0],
             say: "Type " + ph[0].toLowerCase() + ". Do not forget the space bar." });

    const nm = pick(KB.NAMES);
    q.push({ group: "Words", face: nm[1], word: nm[0], shift: true,
             say: "Type the name " + nm[0] + ". The first letter is big, so hold shift." });

    /* --- fixing: the skill that matters most at this age --- */
    const fx1 = pick(KB.WORDS_3);
    let tail = "";
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) tail += pick(JUNK);
    q.push({
      group: "Fixing", face: fx1[1], fix: fx1[0], start: fx1[0] + tail,
      say: "Too many letters! Rub them out until it says " + fx1[0].toLowerCase() + "."
    });

    const fx2 = pick(KB.WORDS_4);
    let badLast = pick(JUNK);
    while (badLast === fx2[0][fx2[0].length - 1]) badLast = pick(JUNK);
    q.push({
      group: "Fixing", face: fx2[1], fix: fx2[0], start: fx2[0].slice(0, -1) + badLast,
      say: "The last letter is wrong. Fix it so it says " + fx2[0].toLowerCase() + "."
    });

    const fx3 = pick(KB.WORDS_4);
    const at = 1 + Math.floor(Math.random() * (fx3[0].length - 2));
    let badMid = pick(JUNK);
    while (badMid === fx3[0][at]) badMid = pick(JUNK);
    q.push({
      group: "Fixing", face: fx3[1], fix: fx3[0],
      start: fx3[0].slice(0, at) + badMid + fx3[0].slice(at + 1),
      say: "A letter in the middle is wrong. Make it say " + fx3[0].toLowerCase() + "."
    });

    /* --- code --- */
    q.push({
      group: "Code", face: "↩️",
      ask: "Which command turns the robot LEFT?",
      say: "Which letter turns the robot to the left?",
      answer: "L"
    });

    q.push({
      group: "Code", face: "🖍️",
      ask: "Which command puts the robot's pen down so it draws?",
      say: "Which letter puts the pen down, so the robot draws as it moves?",
      answer: "P"
    });

    /* --- the AI idea: can they apply a rule the robot was taught? --- */
    const rule = pick([
      { feat: "big",   box: 1, shown: ["a big red circle", "a big blue star"], test: "a big green square", ans: "1" },
      { feat: "small", box: 2, shown: ["a small red star", "a small blue circle"], test: "a small yellow square", ans: "2" },
      { feat: "red",   box: 1, shown: ["a red circle", "a red square"], test: "a red triangle", ans: "1" },
      { feat: "blue",  box: 2, shown: ["a blue star", "a blue square"], test: "a blue circle", ans: "2" }
    ]);
    q.push({
      group: "Robot brain", face: "🧠",
      ask: "You taught the robot: " + rule.shown.join(" and ") + " both went in box " +
           rule.box + ". Where will it put " + rule.test + "? Press 1 or 2.",
      say: "You taught the robot that " + rule.shown[0] + " and " + rule.shown[1] +
           " both go in box " + rule.box + ". Where will it put " + rule.test + "?",
      answer: rule.ans,
      help: "The robot copies what you taught it. Those were all " + rule.feat +
            ", so it picks box " + rule.box + "."
    });

    return q;
  }

  /* ---------------- screens ---------------- */

  function showIntro(stage) {
    paper = null;
    KB.ui.backButton(null);
    KB.ui.hideHands();
    stage.innerHTML = "";

    const best = (KB.state.test2 && KB.state.test2.best) || 0;
    const card = KB.el("div", "panel");
    card.appendChild(KB.el("div", "panel-emoji", "🎓"));
    card.appendChild(KB.el("h2", "title", "Lab Test"));
    card.appendChild(KB.el("p", "lead",
      LENGTH + " questions on the new skills: two hands, home keys, " +
      "longer words, Shift, the robot's commands and how it learns."));
    if (best) {
      card.appendChild(KB.el("div", "score", "Best: " + best + " / " + LENGTH));
      card.appendChild(KB.el("p", "lead",
        (KB.state.test2.passed ? "Passed already! 🏆" : "Try to beat it!")));
    }
    const go = KB.el("button", "big-btn", "▶️ Start the test");
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
    KB.ui.backButton("← Stop the test", () => showIntro(stage));
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
      dom.sub.textContent = q.shift ? "Type the name — big letter first!" : "Type the word";
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

    const prev = KB.state.test2 || {};
    KB.state.test2 = {
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
      ? "You really know this keyboard now. 🎉"
      : "Play the drills a bit more, then come back and beat it."));

    const chips = KB.el("div", "chips");
    Object.keys(groups).forEach(g => {
      const { ok, n } = groups[g];
      const cls = ok === n ? "chip good" : (ok * 2 < n ? "chip weak" : "chip");
      chips.appendChild(KB.el("span", cls, g + " " + ok + "/" + n));
    });
    card.appendChild(chips);

    card.appendChild(KB.el("p", "fineprint",
      "For grown-ups: a point is scored only when the answer is right first time. " +
      PASS + " out of " + total + " passes. The weak chips show what to practise next."));

    const row = KB.el("div", "card-row tight");
    const again = KB.el("button", "big-btn", "🎓 Try again");
    again.addEventListener("click", () => start(stage));
    const home = KB.el("button", "big-btn ghost", "🏠 Back to the lab");
    home.addEventListener("click", () => KB.ui.go("hands"));
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
    icon: "🎓",
    label: "Lab Test",

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
