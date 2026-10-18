/* ============================================================
   mode-ai.js — "Teach the Robot"

   A first, honest look at how machine learning works. The child
   is the teacher: they sort shapes into two boxes, and a real
   (if tiny) classifier learns their rule from those examples.
   Then it guesses on shapes it has never seen, shows how sure
   it is and why, and learns from the ones it gets wrong.

   Nothing here is faked — the guesses really do come from what
   the child taught it, which is the whole point: more examples
   make it better, and it can still be wrong.
   ============================================================ */
(function (KB) {
  "use strict";

  const SHAPES  = ["circle", "square", "triangle", "star"];
  const COLORS  = ["red", "blue", "yellow", "green"];
  const SIZES   = ["big", "small"];
  const FEATURES = ["shape", "color", "size"];

  const HEX = { red: "#ef476f", blue: "#118ab2", yellow: "#ffc300", green: "#06d6a0" };

  const TEACH_FIRST = 4, TEACH_MORE = 3, TEST_N = 2;

  let examples = [];      /* [{ item, box }] — the training set */
  let phase = null;       /* "teach" | "test" | "done" */
  let queue = [], qi = 0;
  let testScore = 0, testTotal = 0, lifetimeRight = 0, lifetimeAsked = 0;
  let guess = null, lock = false;
  let dom = null;

  /* ---------------- items ---------------- */

  function randomItem() {
    return {
      shape: KB.pick(SHAPES),
      color: KB.pick(COLORS),
      size: KB.pick(SIZES)
    };
  }

  function itemKey(it) { return it.shape + "|" + it.color + "|" + it.size; }

  function freshItems(n, avoid) {
    const seen = {};
    (avoid || []).forEach(e => { seen[itemKey(e.item || e)] = true; });
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < 400) {
      const it = randomItem();
      if (seen[itemKey(it)]) continue;
      seen[itemKey(it)] = true;
      out.push(it);
    }
    while (out.length < n) out.push(randomItem());
    return out;
  }

  function shapeNode(it, cls) {
    const n = KB.el("div", "shape " + it.shape + " " + it.size + (cls ? " " + cls : ""));
    n.style.background = HEX[it.color];
    return n;
  }

  function describe(it) { return it.size + " " + it.color + " " + it.shape; }

  /* ---------------- the learner ----------------
     For each box, how often does a labelled example share this
     item's feature? The box with the better average match wins.
     Simple enough to explain to a five-year-old, and genuinely
     learned from their own labels.                              */

  function countIn(box) { return examples.filter(e => e.box === box).length; }

  function boxScore(item, box) {
    const n = countIn(box);
    if (!n) return 0;
    let hits = 0;
    examples.forEach(e => {
      if (e.box !== box) return;
      FEATURES.forEach(f => { if (e.item[f] === item[f]) hits++; });
    });
    return hits / (n * FEATURES.length);
  }

  function predict(item) {
    const s1 = boxScore(item, 1), s2 = boxScore(item, 2);
    const box = s1 >= s2 ? 1 : 2;
    const total = s1 + s2;
    /* how sure: the winner's share of the two scores */
    const confidence = total ? Math.max(s1, s2) / total : 0.5;
    return { box: box, confidence: confidence, s1: s1, s2: s2 };
  }

  /* Which single feature pushed the decision hardest? That is the
     robot's reason, and it is the truth, not a canned line. */
  function reasonFor(item, box) {
    const other = box === 1 ? 2 : 1;
    let best = null, bestGap = -Infinity;
    FEATURES.forEach(f => {
      const nWin = countIn(box), nOther = countIn(other);
      const win = nWin ? examples.filter(e => e.box === box && e.item[f] === item[f]).length / nWin : 0;
      const opp = nOther ? examples.filter(e => e.box === other && e.item[f] === item[f]).length / nOther : 0;
      const gap = win - opp;
      if (gap > bestGap) { bestGap = gap; best = f; }
    });
    if (!best || bestGap <= 0) return "I am really not sure about this one.";
    return "It is " + item[best] + ", and you put " + item[best] +
           " ones in box " + box + ".";
  }

  /* ---------------- screens ---------------- */

  function shell(stage) {
    stage.innerHTML = "";
    dom = {
      bubble: KB.el("div", "bubble"),
      item:   KB.el("div", "ai-item"),
      meter:  KB.el("div", "meter"),
      boxes:  KB.el("div", "boxes"),
      note:   KB.el("div", "note")
    };
    const head = KB.el("div", "ai-head");
    head.appendChild(KB.el("div", "ai-face", "🤖"));
    head.appendChild(dom.bubble);

    dom.meter.innerHTML = '<div class="meter-fill"></div><span class="meter-label"></span>';
    dom.meter.style.display = "none";

    [1, 2].forEach(b => {
      const box = KB.el("div", "box");
      box.dataset.box = String(b);
      box.innerHTML = '<div class="box-num">' + b + "</div>";
      box.appendChild(KB.el("div", "box-items"));
      dom.boxes.appendChild(box);
    });

    stage.append(head, dom.item, dom.meter, dom.boxes, dom.note);
  }

  function paintBoxes() {
    dom.boxes.querySelectorAll(".box").forEach(box => {
      const b = parseInt(box.dataset.box, 10);
      const holder = box.querySelector(".box-items");
      holder.innerHTML = "";
      examples.filter(e => e.box === b).slice(-8).forEach(e => {
        holder.appendChild(shapeNode(e.item, "mini"));
      });
    });
  }

  function setMeter(conf) {
    if (conf == null) { dom.meter.style.display = "none"; return; }
    dom.meter.style.display = "";
    const pct = Math.round(conf * 100);
    dom.meter.querySelector(".meter-fill").style.width = pct + "%";
    dom.meter.querySelector(".meter-label").textContent = "how sure I am: " + pct + "%";
  }

  function say(text, speakIt) {
    dom.bubble.textContent = text;
    if (speakIt !== false) KB.speak(text);
  }

  /* ---------------- intro ---------------- */

  function showIntro(stage) {
    examples = []; phase = null; queue = []; lock = false;
    lifetimeRight = 0; lifetimeAsked = 0;
    KB.ui.backButton(null);
    KB.ui.hideHands();
    stage.innerHTML = "";

    stage.appendChild(KB.el("h2", "title", "Teach the Robot 🧠"));
    stage.appendChild(KB.el("p", "lead",
      "Put the shapes in box <b>1</b> or box <b>2</b> — any way you like. " +
      "Then the robot tries to guess!"));

    const best = (KB.state.ai && KB.state.ai.best) || 0;
    if (best) {
      stage.appendChild(KB.el("p", "lead", "Best so far: <b>" + best + "%</b>"));
    }

    const go = KB.el("button", "big-btn", "▶️ Start");
    go.addEventListener("click", () => startTeaching(stage, TEACH_FIRST));
    stage.appendChild(go);
  }

  /* ---------------- teaching ---------------- */

  function startTeaching(stage, n) {
    if (!dom || !stage.querySelector(".ai-head")) shell(stage);
    KB.ui.backButton("← Start again", () => showIntro(stage));
    phase = "teach";
    queue = freshItems(n, examples);
    qi = 0;
    paintBoxes();
    setMeter(null);
    nextTeach();
  }

  function nextTeach() {
    lock = false;
    const it = queue[qi];
    dom.item.innerHTML = "";
    dom.item.appendChild(shapeNode(it));
    dom.note.textContent = "Press 1 or 2";
    say("Where does this one go? Press one or two.");
  }

  function teachAnswer(box) {
    const it = queue[qi];
    examples.push({ item: it, box: box });
    KB.sfx.pop();
    paintBoxes();
    qi++;
    if (qi < queue.length) { nextTeach(); return; }

    /* a rule needs both boxes to exist */
    const n1 = countIn(1), n2 = countIn(2);
    if (!n1 || !n2) {
      const empty = n1 ? 2 : 1;
      say("They all went in one box! Put some in box " + empty + " too.");
      dom.note.textContent = "Put some in box " + empty + " too!";
      setTimeout(() => {
        if (phase !== "teach") return;
        queue = freshItems(3, examples); qi = 0; nextTeach();
      }, 2600);
      return;
    }
    startTesting();
  }

  /* ---------------- testing ---------------- */

  function startTesting() {
    phase = "test";
    queue = freshItems(TEST_N, examples);
    qi = 0;
    testScore = 0; testTotal = 0;
    say("Now let me try to guess!");
    setTimeout(() => { if (phase === "test") nextTest(); }, 2200);
  }

  function nextTest() {
    lock = true;
    const it = queue[qi];
    dom.item.innerHTML = "";
    dom.item.appendChild(shapeNode(it));
    setMeter(null);
    dom.note.textContent = "thinking…";
    say("Hmm, let me think.");

    setTimeout(() => {
      if (phase !== "test") return;
      guess = predict(it);
      setMeter(guess.confidence);
      say("I think box " + guess.box + "! " + reasonFor(it, guess.box));
      dom.note.textContent = "Was I right? Press 1 or 2";
      lock = false;
    }, 1400);
  }

  function testAnswer(box) {
    const it = queue[qi];
    const right = guess.box === box;
    testTotal++; lifetimeAsked++;
    if (right) { testScore++; lifetimeRight++; }

    /* learn from it either way — that is what the examples are for */
    examples.push({ item: it, box: box });
    paintBoxes();

    if (right) {
      KB.sfx.great();
      KB.cheer(false);
      say("I got it right! Thank you!");
      dom.note.textContent = "✅ I was right!";
    } else {
      KB.sfx.nope();
      say("Oops, I was wrong. Now I know!");
      dom.note.textContent = "❌ I was wrong — now I know!";
    }

    lock = true;
    qi++;
    setTimeout(() => {
      if (phase !== "test") return;
      if (qi < queue.length) nextTest();
      else showResult();
    }, 2300);
  }

  /* ---------------- result ---------------- */

  function showResult() {
    phase = "done";
    lock = true;
    setMeter(null);
    dom.item.innerHTML = "";
    dom.item.appendChild(KB.el("div", "ai-big", testScore === testTotal ? "🏆" : "🤖"));

    const pct = Math.round((lifetimeRight / Math.max(lifetimeAsked, 1)) * 100);
    if (pct > ((KB.state.ai && KB.state.ai.best) || 0)) {
      KB.state.ai = { best: pct, taught: examples.length };
      KB.save();
    }

    say("I got " + testScore + " out of " + testTotal + " right! Teach me more and I get better.");

    dom.note.innerHTML = "<b>" + testScore + " / " + testTotal + "</b> right!";

    const stage = document.getElementById("stage");
    const row = KB.el("div", "card-row tight");

    const more = KB.el("button", "big-btn", "➕ Teach it more");
    more.addEventListener("click", () => startTeaching(stage, TEACH_MORE));

    const again = KB.el("button", "big-btn ghost", "🔄 Fresh robot");
    again.addEventListener("click", () => showIntro(stage));

    row.append(more, again);
    dom.note.appendChild(row);
  }

  /* ---------------- mode object ---------------- */

  KB.ui.register({
    id: "ai",
    icon: "🧠",
    label: "Teach Robot",
    color: "#f77f00",

    start(stage) { showIntro(stage); },
    stop() { phase = null; queue = []; },

    onKey(k) {
      if (lock || !phase) return;
      if (k !== "1" && k !== "2") return;
      const box = parseInt(k, 10);
      if (phase === "teach") { lock = true; teachAnswer(box); }
      else if (phase === "test") { lock = true; testAnswer(box); }
    }
  });

})(window.KB);
