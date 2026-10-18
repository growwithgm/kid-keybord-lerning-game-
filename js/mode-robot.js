/* ============================================================
   mode-robot.js — "Robot"

   The first version of this asked her to write a program of
   commands, work out left and right from the robot's point of
   view, and press Enter to run it. That is a lot for five.

   So now the arrow keys just move the robot, straight away. She
   still has to work out a route and press the keys in the right
   order — which is the seed of a program — but she sees what
   happens on every single press. Writing the whole plan down
   first can come when she is older.
   ============================================================ */
(function (KB) {
  "use strict";

  const LEVELS = [
    { w: 5, h: 3, start: { x: 0, y: 1 }, stars: [{ x: 3, y: 1 }], walls: [] },
    { w: 5, h: 3, start: { x: 0, y: 0 }, stars: [{ x: 3, y: 2 }], walls: [] },
    { w: 6, h: 4, start: { x: 0, y: 3 }, stars: [{ x: 5, y: 0 }], walls: [] },
    { w: 6, h: 4, start: { x: 0, y: 1 }, stars: [{ x: 5, y: 1 }],
      walls: [{ x: 2, y: 1 }, { x: 2, y: 0 }] },
    { w: 6, h: 4, start: { x: 0, y: 0 },
      stars: [{ x: 2, y: 0 }, { x: 4, y: 2 }, { x: 1, y: 3 }], walls: [] },
    { w: 7, h: 4, start: { x: 3, y: 1 },
      stars: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 0, y: 3 }, { x: 6, y: 3 }],
      walls: [{ x: 3, y: 2 }] }
  ];

  const ARROWS = {
    LEFT:  { dx: -1, dy: 0 },
    RIGHT: { dx: 1,  dy: 0 },
    UP:    { dx: 0,  dy: -1 },
    DOWN:  { dx: 0,  dy: 1 }
  };

  let idx = 0, lv = null, robot = null, got = null, moves = 0, dom = null, lock = false;

  function key(x, y) { return x + "," + y; }
  function isWall(x, y) { return lv.walls.some(w => w.x === x && w.y === y); }
  function left() { return lv.stars.filter(s => !got[key(s.x, s.y)]).length; }

  function draw() {
    dom.grid.style.setProperty("--cols", lv.w);
    dom.grid.innerHTML = "";
    for (let y = 0; y < lv.h; y++) {
      for (let x = 0; x < lv.w; x++) {
        const c = KB.el("div", "cell");
        if (isWall(x, y)) c.classList.add("wall");
        const star = lv.stars.find(s => s.x === x && s.y === y);
        if (star && !got[key(x, y)]) c.appendChild(KB.el("span", "star", "⭐"));
        if (robot.x === x && robot.y === y) c.appendChild(KB.el("span", "robot", "🤖"));
        dom.grid.appendChild(c);
      }
    }
    const n = left();
    dom.count.textContent = n ? "⭐".repeat(n) + " to go" : "";
  }

  function start(stage, i) {
    idx = i;
    lv = LEVELS[i];
    robot = { x: lv.start.x, y: lv.start.y };
    got = {};
    moves = 0;
    lock = false;

    stage.innerHTML = "";
    dom = {
      sub:   KB.el("div", "sub", "Drive the robot to the star!"),
      grid:  KB.el("div", "grid"),
      count: KB.el("div", "dots"),
      note:  KB.el("div", "note"),
      keys:  KB.el("div", "cmd-help",
                   '<span class="cmd"><b>◀ ▲ ▼ ▶</b> move the robot</span>')
    };
    stage.append(dom.sub, dom.grid, dom.count, dom.note, dom.keys);
    KB.ui.backButton("← All robots", () => menu(stage));
    draw();
    KB.speak(lv.stars.length > 1
      ? "Use the arrow keys to get all the stars!"
      : "Use the arrow keys to drive the robot to the star.");
  }

  function menu(stage) {
    lv = null;
    KB.ui.backButton(null);
    stage.innerHTML = "";
    stage.appendChild(KB.el("h2", "title", "Robot 🤖"));
    stage.appendChild(KB.el("p", "lead", "Use the arrow keys to get the stars."));
    const done = (KB.state.robot && KB.state.robot.done) || 0;
    const row = KB.el("div", "card-row");
    LEVELS.forEach((l, i) => {
      const open = i <= done;
      const c = KB.el("button", "card" + (open ? "" : " locked"));
      c.innerHTML = '<span class="card-icon">' + (open ? "🤖" : "🔒") + "</span>" +
                    '<span class="card-name">' + (i + 1) + "</span>" +
                    '<span class="card-stars">' + (i < done ? "⭐" : "") + "</span>";
      if (open) c.addEventListener("click", () => start(stage, i));
      row.appendChild(c);
    });
    stage.appendChild(row);
  }

  function win() {
    lock = true;
    KB.sfx.great();
    KB.cheer(true);
    dom.note.textContent = "🎉 You got them all!";
    KB.speak("You did it!");
    if (idx + 1 > ((KB.state.robot && KB.state.robot.done) || 0)) {
      KB.state.robot = { done: idx + 1 };
      KB.save();
    }
    const stage = document.getElementById("stage");
    setTimeout(() => {
      if (KB.ui.currentId() !== "robot" || !lv) return;
      if (idx + 1 < LEVELS.length) start(stage, idx + 1);
      else menu(stage);
    }, 2400);
  }

  KB.ui.register({
    id: "robot",
    icon: "🤖",
    label: "Robot",
    color: "#118ab2",

    start(stage) { menu(stage); },
    stop() { lv = null; },

    onKey(k) {
      if (!lv || lock) return;
      const d = ARROWS[k];
      if (!d) return;

      const nx = robot.x + d.dx, ny = robot.y + d.dy;

      if (nx < 0 || ny < 0 || nx >= lv.w || ny >= lv.h) {
        KB.sfx.nope();
        dom.note.textContent = "That is the edge! Try another arrow.";
        return;
      }
      if (isWall(nx, ny)) {
        KB.sfx.nope();
        dom.note.textContent = "A brick! Go round it.";
        return;
      }

      robot.x = nx; robot.y = ny;
      moves++;
      dom.note.textContent = "";
      KB.sfx.step();

      if (lv.stars.some(s => s.x === nx && s.y === ny) && !got[key(nx, ny)]) {
        got[key(nx, ny)] = true;
        KB.sfx.good();
        KB.cheer(false);
      }

      draw();
      if (!left()) win();
    },

    /* holding an arrow walks the robot along */
    onRepeat(k) { if (lv && !lock && ARROWS[k]) this.onKey(k); }
  });

})(window.KB);
