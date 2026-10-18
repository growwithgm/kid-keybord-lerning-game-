/* ============================================================
   mode-balloon.js — "Balloons"

   Balloons drift up the screen with a letter on each. Press the
   letter and it pops.

   Kept deliberately gentle: only three balloons at a time, they
   float slowly, a wrong key costs nothing, and a balloon that
   gets away just floats off with no penalty and no game over.
   The only thing that goes up is the number she has popped.
   ============================================================ */
(function (KB) {
  "use strict";

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const DIGITS  = "123456789".split("");

  const MAX_ON_SCREEN = 3;
  const SPAWN_EVERY   = 1800;   /* ms between new balloons */
  const SPEED         = 55;     /* px per second: about ten seconds to
                                   cross the sky — gentle, but it does
                                   visibly move */
  const GOAL          = 8;      /* balloons to pop for a star */

  const ROUNDS = [
    { id: "b1", icon: "🎈", name: "Letters", blurb: "pop the letter", pool: () => LETTERS },
    { id: "b2", icon: "🔢", name: "Numbers", blurb: "pop the number", pool: () => DIGITS }
  ];

  let round = null, sky = null, dom = null;
  let balloons = [], raf = null, lastTime = 0, sinceSpawn = 0;
  let popped = 0, lock = false;

  /* ---------------- menu ---------------- */

  function stars(id) {
    const n = (KB.state.balloons && KB.state.balloons[id]) || 0;
    return "⭐".repeat(Math.min(n, 3)) + "☆".repeat(Math.max(3 - n, 0));
  }

  function showMenu(stage) {
    stop();
    round = null;
    KB.ui.backButton(null);
    stage.innerHTML = "";
    stage.appendChild(KB.el("h2", "title", "Balloons 🎈"));
    stage.appendChild(KB.el("p", "lead", "Press the letter on the balloon to pop it!"));

    const row = KB.el("div", "card-row");
    ROUNDS.forEach(r => {
      const c = KB.el("button", "card");
      c.innerHTML = '<span class="card-icon">' + r.icon + "</span>" +
                    '<span class="card-name">' + r.name + "</span>" +
                    '<span class="card-blurb">' + r.blurb + "</span>" +
                    '<span class="card-stars">' + stars(r.id) + "</span>";
      c.addEventListener("click", () => play(stage, r));
      row.appendChild(c);
    });
    stage.appendChild(row);
  }

  /* ---------------- playing ---------------- */

  function play(stage, r) {
    round = r;
    balloons = [];
    popped = 0;
    lock = false;
    sinceSpawn = SPAWN_EVERY;     /* one shows up straight away */

    stage.innerHTML = "";
    sky = KB.el("div", "sky");
    dom = {
      score: KB.el("div", "balloon-score"),
      note:  KB.el("div", "note")
    };
    stage.append(sky, dom.score, dom.note);
    KB.ui.backButton("← Back", () => showMenu(stage));
    KB.ui.hideHands();
    updateScore();
    KB.speak(round.id === "b1"
      ? "Press the letter on the balloon to pop it!"
      : "Press the number on the balloon to pop it!");

    lastTime = 0;
    raf = requestAnimationFrame(tick);
  }

  function updateScore() {
    dom.score.textContent = "🎈 " + popped + " / " + GOAL;
  }

  function onScreen(ch) {
    return balloons.some(b => b.ch === ch && !b.popping);
  }

  function spawn() {
    if (balloons.filter(b => !b.popping).length >= MAX_ON_SCREEN) return;

    const pool = round.pool().filter(c => !onScreen(c));
    if (!pool.length) return;
    const ch = KB.pick(pool);

    const el = KB.el("div", "balloon");
    el.textContent = ch;
    const colour = KB.pick(KB.COLORS);
    el.style.background = colour;
    sky.appendChild(el);

    const w = sky.clientWidth || 600;
    const h = sky.clientHeight || 400;
    const bw = el.offsetWidth || 86;
    const x = 10 + Math.random() * Math.max(w - bw - 20, 10);

    /* start just below the sky so it rises into view, not half
       cut off along the bottom edge */
    const b = { ch: ch, el: el, x: x, y: h, called: false, popping: false };
    el.style.left = x + "px";
    el.style.top = b.y + "px";
    balloons.push(b);
  }

  function tick(now) {
    if (!round) { raf = null; return; }
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.05);   /* cap after a stall */
    lastTime = now;

    sinceSpawn += dt * 1000;
    if (sinceSpawn >= SPAWN_EVERY) { sinceSpawn = 0; spawn(); }

    const h = sky.clientHeight || 400;

    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      if (b.popping) continue;

      b.y -= SPEED * dt;
      b.el.style.top = b.y + "px";

      /* a nudge when it is getting near the top, said just once */
      if (!b.called && b.y < h * 0.3) {
        b.called = true;
        if (balloons.filter(x => !x.popping).length <= 2) {
          KB.speak("Find " + b.ch + "!");
        }
      }

      /* floated away — no penalty, no fuss */
      if (b.y < -140) {
        b.el.remove();
        balloons.splice(i, 1);
      }
    }

    raf = requestAnimationFrame(tick);
  }

  function pop(b) {
    b.popping = true;
    b.el.classList.add("pop");
    const r = b.el.getBoundingClientRect();
    KB.fx(r.left + r.width / 2, r.top + r.height / 2, false);
    KB.sfx.pop();
    setTimeout(() => {
      b.el.remove();
      const i = balloons.indexOf(b);
      if (i !== -1) balloons.splice(i, 1);
    }, 300);

    popped++;
    updateScore();
    if (popped >= GOAL) finish();
  }

  function finish() {
    lock = true;
    stop();
    KB.state.balloons = KB.state.balloons || {};
    KB.state.balloons[round.id] = Math.min((KB.state.balloons[round.id] || 0) + 1, 3);
    KB.save();

    KB.sfx.great();
    KB.cheer(true);
    balloons.forEach(b => b.el.remove());
    balloons = [];
    dom.note.textContent = "🎉 You popped " + GOAL + " balloons!";
    KB.speak("Hooray! You popped " + GOAL + " balloons!");

    const stage = document.getElementById("stage");
    const r = round;
    setTimeout(() => {
      if (KB.ui.currentId() === "balloon" && round === r) play(stage, r);
    }, 2600);
  }

  function stop() {
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    lastTime = 0;
  }

  /* ---------------- mode object ---------------- */

  KB.ui.register({
    id: "balloon",
    icon: "🎈",
    label: "Balloons",
    color: "#ef476f",

    start(stage) { showMenu(stage); },

    stop() {
      stop();
      round = null;
      balloons.forEach(b => b.el && b.el.remove());
      balloons = [];
    },

    onKey(k) {
      if (!round || lock) return;
      if (!/^[A-Z0-9]$/.test(k)) return;

      /* pop the one closest to the top — the one about to get away */
      let best = null;
      balloons.forEach(b => {
        if (b.popping || b.ch !== k) return;
        if (!best || b.y < best.y) best = b;
      });

      if (best) {
        /* clear any old message first — popping may put the
           celebration there, and wiping it afterwards would rub
           out the very thing she just earned */
        dom.note.textContent = "";
        pop(best);
      } else {
        KB.sfx.tick();         /* a wrong key costs nothing at all */
      }
    },

    onBlur() { stop(); if (round) raf = requestAnimationFrame(tick); }
  });

})(window.KB);
