/* ============================================================
   mode-hands.js — "Two Hands"

   The next step after knowing where the letters are: knowing
   WHICH HAND and which finger belongs to a key. Research says
   five- and six-year-olds can take on home-row awareness and
   the F/J bumps as long as nobody pushes them for speed, so
   none of these drills are timed.
   ============================================================ */
(function (KB) {
  "use strict";

  const HOME_KEYS = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  const ALL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const DRILLS = [
    {
      id: "leftright",
      icon: "✋",
      name: "Left or Right?",
      blurb: "Which hand does this key belong to?",
      rounds: 10,
      make() {
        return KB.shuffle(ALL).slice(0, 10).map(letter => ({
          letter: letter,
          hand: KB.handOf(letter),
          show: letter,
          ask: "Left hand or right hand?",
          say: "The letter " + letter + ". Left hand, or right hand?",
          answers: [KB.handOf(letter) === "L" ? "LEFT" : "RIGHT"],
          help(letter) {
            return "Press the " + (KB.handOf(letter) === "L" ? "left" : "right") +
                   " arrow key. " + letter + " lives on your " +
                   (KB.handOf(letter) === "L" ? "left" : "right") + " hand.";
          }
        }));
      }
    },
    {
      id: "bumps",
      icon: "⠿",
      name: "Find the Bumps",
      blurb: "Your keyboard has two bumpy keys. Find them!",
      rounds: 8,
      make() {
        const steps = [
          { show: "⠿", ask: "Feel for the LEFT bumpy key and press it", answers: ["F"],
            say: "Your keyboard has two little bumps. Feel for the left one and press it." },
          { show: "⠿", ask: "Now the RIGHT bumpy key", answers: ["J"],
            say: "Now feel for the right bumpy key and press it." }
        ];
        for (let i = 0; i < 6; i++) {
          const k = i % 2 === 0 ? "F" : "J";
          steps.push({
            show: k, ask: "Press " + k + " without looking down!", answers: [k],
            say: "Press " + k + "."
          });
        }
        return steps;
      }
    },
    {
      id: "homekeys",
      icon: "🏠",
      name: "Home Keys",
      blurb: "The row your fingers live on: A S D F  J K L",
      rounds: 9,
      make() {
        return KB.shuffle(HOME_KEYS).map(k => ({
          show: k, ask: "Press " + k, answers: [k],
          say: "Press " + k + ". " + KB.fingerHint(k)
        }));
      }
    }
  ];

  let steps = null, i = 0, wrong = 0, drill = null, dom = null, lock = false;

  /* ---------------- menu ---------------- */

  function starsFor(id) {
    const n = (KB.state.hands && KB.state.hands[id]) || 0;
    return "⭐".repeat(n) + "☆".repeat(3 - n);
  }

  function award(id) {
    KB.state.hands = KB.state.hands || {};
    KB.state.hands[id] = Math.min((KB.state.hands[id] || 0) + 1, 3);
    KB.save();
  }

  function showMenu(stage) {
    steps = null; drill = null; lock = false;
    KB.ui.hideHands();
    KB.ui.backButton(null);
    stage.innerHTML = "";

    stage.appendChild(KB.el("h2", "title", "Two Hands ✋"));
    stage.appendChild(KB.el("p", "lead",
      "Ten fingers, one job each. No rushing — just find the right finger."));

    const row = KB.el("div", "card-row");
    DRILLS.forEach(d => {
      const c = KB.el("button", "card");
      c.innerHTML = '<span class="card-icon">' + d.icon + "</span>" +
                    '<span class="card-name">' + d.name + "</span>" +
                    '<span class="card-blurb">' + d.blurb + "</span>" +
                    '<span class="card-stars">' + starsFor(d.id) + "</span>";
      c.addEventListener("click", () => startDrill(stage, d));
      row.appendChild(c);
    });
    stage.appendChild(row);
  }

  /* ---------------- a drill ---------------- */

  function startDrill(stage, d) {
    drill = d;
    steps = d.make();
    i = 0; wrong = 0; lock = false;

    stage.innerHTML = "";
    dom = {
      big:  KB.el("div", "big"),
      sub:  KB.el("div", "sub"),
      note: KB.el("div", "note"),
      dots: KB.el("div", "dots")
    };
    stage.append(dom.big, dom.sub, dom.note, dom.dots);
    KB.ui.backButton("← All drills", () => showMenu(stage));
    show();
  }

  function dots() {
    return "✅".repeat(i) + "⬜".repeat(steps.length - i);
  }

  function show() {
    const s = steps[i];
    wrong = 0;
    lock = false;
    /* single letters are shown as capital + the small letter that
       is actually printed on the Chromebook key */
    if (/^[A-Z]$/.test(s.show)) dom.big.innerHTML = KB.keyFace(s.show);
    else dom.big.textContent = s.show;
    dom.big.classList.toggle("tiny", s.show.length > 2);
    dom.sub.textContent = s.ask;
    dom.note.textContent = "";
    dom.dots.textContent = dots();
    /* the hands picture is the point of this mode, so it stays up */
    KB.ui.showHands(drill.id === "leftright" ? null : s.answers[0]);
    KB.speak(s.say);
  }

  function right() {
    lock = true;
    KB.sfx.good();
    KB.cheer(false);
    dom.note.textContent = KB.pick(KB.PRAISE);
    i++;
    dom.dots.textContent = dots();
    setTimeout(() => {
      if (!steps) return;
      if (i >= steps.length) finish();
      else show();
    }, 1100);
  }

  function missed(s) {
    wrong++;
    KB.sfx.nope();
    dom.big.classList.remove("shake");
    void dom.big.offsetWidth;
    dom.big.classList.add("shake");
    if (wrong >= 2) {
      const help = s.help ? s.help(s.letter || s.answers[0]) : KB.fingerHint(s.answers[0]);
      dom.note.textContent = help;
      KB.speak(help);
    } else {
      dom.note.textContent = "Not that one — try again!";
    }
  }

  function finish() {
    award(drill.id);
    const stage = document.getElementById("stage");
    KB.sfx.great();
    KB.cheer(true);
    dom.big.textContent = "🏅";
    dom.big.classList.remove("tiny");
    dom.sub.textContent = "Drill finished!";
    dom.note.textContent = "";
    dom.dots.textContent = "";
    KB.ui.hideHands();
    KB.speak("Lovely work! " + drill.name + " finished!");
    steps = null;
    setTimeout(() => { if (KB.ui.currentId() === "hands") showMenu(stage); }, 2600);
  }

  /* ---------------- mode object ---------------- */

  KB.ui.register({
    id: "hands",
    icon: "✋",
    label: "Two Hands",

    start(stage) { showMenu(stage); },

    stop() { steps = null; drill = null; },

    onKey(k) {
      if (!steps || lock) return;
      const s = steps[i];
      if (s.answers.indexOf(k) !== -1) right();
      else if (/^[A-Z0-9]$/.test(k) || k === "LEFT" || k === "RIGHT" ||
               k === "UP" || k === "DOWN" || k === "SPACE") missed(s);
    }
  });

})(window.KB);
