/* ============================================================
   mode-robot.js — "Robot Coder"

   Real programming, typed on a real keyboard. The child writes
   a sequence of commands, presses Enter, and watches the robot
   carry them out one at a time. When it bumps into something
   they can see exactly which command was wrong and fix it —
   sequencing, then debugging, then loops.
   ============================================================ */
(function (KB) {
  "use strict";

  const DIRS = [
    { dx: 1,  dy: 0,  arrow: "▶" },   /* 0 east  */
    { dx: 0,  dy: 1,  arrow: "▼" },   /* 1 south */
    { dx: -1, dy: 0,  arrow: "◀" },   /* 2 west  */
    { dx: 0,  dy: -1, arrow: "▲" }    /* 3 north */
  ];

  const LEVELS = [
    {
      name: "Straight on",
      goal: "Drive the robot to the star.",
      tip: "F means go forward one square.",
      w: 6, h: 4, start: { x: 0, y: 1, dir: 0 }, star: { x: 4, y: 1 }, walls: []
    },
    {
      name: "One turn",
      goal: "The star is round the corner.",
      tip: "R turns the robot to its right.",
      w: 6, h: 4, start: { x: 0, y: 0, dir: 0 }, star: { x: 3, y: 3 }, walls: []
    },
    {
      name: "Two turns",
      goal: "Two corners this time.",
      tip: "L turns left, R turns right.",
      w: 6, h: 4, start: { x: 0, y: 3, dir: 3 }, star: { x: 5, y: 1 }, walls: []
    },
    {
      name: "Round the wall",
      goal: "Bricks block the way. Go around!",
      tip: "If the robot bumps, fix the command and run again.",
      w: 6, h: 4, start: { x: 0, y: 2, dir: 0 }, star: { x: 5, y: 2 },
      walls: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 1 }]
    },
    {
      name: "Paint a line",
      goal: "Paint every grey square.",
      tip: "P puts the pen down — then the robot draws as it moves.",
      w: 6, h: 4, start: { x: 1, y: 1, dir: 0 },
      paint: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }], walls: []
    },
    {
      name: "The short way",
      goal: "Reach the star using 4 commands or fewer.",
      tip: "Type a number first: 5F means forward five times!",
      w: 7, h: 4, start: { x: 0, y: 2, dir: 0 }, star: { x: 5, y: 0 }, walls: [], maxTokens: 4
    },
    {
      name: "Paint a square",
      goal: "Paint the whole grey ring.",
      tip: "Pen down, then drive all the way round. Numbers make it short.",
      w: 6, h: 5, start: { x: 1, y: 1, dir: 0 },
      paint: [
        { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
        { x: 3, y: 2 }, { x: 3, y: 3 },
        { x: 2, y: 3 }, { x: 1, y: 3 },
        { x: 1, y: 2 }
      ], walls: []
    },
    {
      name: "Free build",
      goal: "No star, no rules — write a program and draw!",
      tip: "P starts and stops the pen. Backspace rubs out the last command.",
      w: 8, h: 5, start: { x: 0, y: 2, dir: 0 }, sandbox: true, walls: []
    }
  ];

  const STEP_MS = 400;
  const MAX_TOKENS = 24;

  let lv = null, lvIndex = 0;
  let program = [];        /* [{ n, cmd }] */
  let pending = 0;         /* digit typed but no command yet */
  let robot = null, painted = null, penDown = false;
  let running = false, timer = null, runSteps = null, runAt = 0;
  let dom = null;

  /* ---------------- menu ---------------- */

  function clearedCount() { return (KB.state.robot && KB.state.robot.cleared) || 0; }

  function showMenu(stage) {
    stop();
    lv = null;
    KB.ui.backButton(null);
    stage.innerHTML = "";
    stage.appendChild(KB.el("h2", "title", "Robot Coder 🤖"));
    stage.appendChild(KB.el("p", "lead",
      "Write the robot a program, press Enter, and watch it go."));

    const row = KB.el("div", "card-row");
    LEVELS.forEach((l, idx) => {
      const open = idx <= clearedCount();
      const c = KB.el("button", "card" + (open ? "" : " locked"));
      c.innerHTML = '<span class="card-icon">' + (open ? (l.sandbox ? "🎨" : "🤖") : "🔒") + "</span>" +
                    '<span class="card-name">' + (idx + 1) + ". " + l.name + "</span>" +
                    '<span class="card-blurb">' + (open ? l.goal : "Finish the one before") + "</span>" +
                    '<span class="card-stars">' + (idx < clearedCount() ? "⭐" : "") + "</span>";
      if (open) c.addEventListener("click", () => startLevel(stage, idx));
      row.appendChild(c);
    });
    stage.appendChild(row);
  }

  /* ---------------- level setup ---------------- */

  function startLevel(stage, idx) {
    stop();
    lvIndex = idx;
    lv = LEVELS[idx];
    program = [];
    pending = 0;
    robot = { x: lv.start.x, y: lv.start.y, dir: lv.start.dir };
    painted = {};
    penDown = false;

    stage.innerHTML = "";

    dom = {
      goal:  KB.el("div", "sub", lv.goal),
      grid:  KB.el("div", "grid"),
      prog:  KB.el("div", "program"),
      note:  KB.el("div", "note", lv.tip),
      help:  KB.el("div", "cmd-help")
    };

    dom.help.innerHTML =
      '<span class="cmd"><b>F</b> forward</span>' +
      '<span class="cmd"><b>L</b> turn left</span>' +
      '<span class="cmd"><b>R</b> turn right</span>' +
      '<span class="cmd"><b>P</b> pen down / up</span>' +
      '<span class="cmd"><b>2-9</b> repeat</span>' +
      '<span class="cmd go"><b>Enter</b> GO!</span>' +
      '<span class="cmd"><b>Backspace</b> rub out</span>';

    stage.append(dom.goal, dom.grid, dom.prog, dom.note, dom.help);
    KB.ui.backButton("← All levels", () => showMenu(stage));
    KB.ui.hideHands();

    drawGrid();
    drawProgram();
    KB.speak(lv.goal + " " + lv.tip);
  }

  function key(x, y) { return x + "," + y; }

  function isWall(x, y) {
    return lv.walls.some(w => w.x === x && w.y === y);
  }

  function drawGrid() {
    dom.grid.style.setProperty("--cols", lv.w);
    dom.grid.innerHTML = "";
    for (let y = 0; y < lv.h; y++) {
      for (let x = 0; x < lv.w; x++) {
        const c = KB.el("div", "cell");
        if (isWall(x, y)) c.classList.add("wall");
        if (lv.paint && lv.paint.some(p => p.x === x && p.y === y)) c.classList.add("target");
        if (painted[key(x, y)]) c.classList.add("painted");
        if (lv.star && lv.star.x === x && lv.star.y === y) c.appendChild(KB.el("span", "star", "⭐"));
        if (robot.x === x && robot.y === y) {
          const r = KB.el("span", "robot", "🤖");
          r.appendChild(KB.el("i", "facing", DIRS[robot.dir].arrow));
          c.appendChild(r);
        }
        dom.grid.appendChild(c);
      }
    }
  }

  function drawProgram(activeIdx) {
    dom.prog.innerHTML = "";
    if (!program.length && !pending) {
      dom.prog.appendChild(KB.el("span", "prog-empty", "Type F, L, R or P to begin…"));
      return;
    }
    program.forEach((t, i) => {
      const chip = KB.el("span", "chip" + (i === activeIdx ? " active" : ""));
      chip.textContent = (t.n > 1 ? t.n + "×" : "") + t.cmd;
      dom.prog.appendChild(chip);
    });
    if (pending) dom.prog.appendChild(KB.el("span", "chip pending", pending + "×…"));
  }

  /* ---------------- building the program ---------------- */

  function addToken(cmd) {
    if (program.length >= MAX_TOKENS) { KB.ui.toast("That program is long enough!"); return; }
    program.push({ n: pending > 1 ? pending : 1, cmd: cmd });
    pending = 0;
    KB.sfx.tick();
    drawProgram();
  }

  function rubOut() {
    if (pending) { pending = 0; }
    else if (program.length) program.pop();
    else return;
    KB.sfx.pop();
    drawProgram();
  }

  /* ---------------- running ---------------- */

  function expand() {
    const out = [];
    program.forEach((t, i) => {
      for (let j = 0; j < t.n; j++) out.push({ cmd: t.cmd, token: i });
    });
    return out;
  }

  function run() {
    if (running) return;
    if (!program.length) {
      dom.note.textContent = "Write some commands first!";
      KB.speak("Write some commands first.");
      return;
    }
    if (lv.maxTokens && program.length > lv.maxTokens) {
      dom.note.textContent = "Too many commands — this level wants " + lv.maxTokens + " or fewer. Try a number, like 5F.";
      KB.speak("Try to make it shorter. Put a number in front, like five F.");
      KB.sfx.nope();
      return;
    }
    running = true;
    robot = { x: lv.start.x, y: lv.start.y, dir: lv.start.dir };
    painted = {};
    penDown = false;
    runSteps = expand();
    runAt = 0;
    dom.note.textContent = "Running…";
    drawGrid();
    timer = setTimeout(tick, STEP_MS);
  }

  function tick() {
    if (!running) return;
    if (runAt >= runSteps.length) { finishRun(null); return; }

    const step = runSteps[runAt];
    drawProgram(step.token);

    if (step.cmd === "L") { robot.dir = (robot.dir + 3) % 4; KB.sfx.step(); }
    else if (step.cmd === "R") { robot.dir = (robot.dir + 1) % 4; KB.sfx.step(); }
    else if (step.cmd === "P") {
      /* P works like a pen: down, and the robot draws wherever it
         goes; press it again to lift the pen back up */
      penDown = !penDown;
      if (penDown) painted[key(robot.x, robot.y)] = true;
      KB.sfx.pop();
    }
    else {
      const d = DIRS[robot.dir];
      const nx = robot.x + d.dx, ny = robot.y + d.dy;
      if (nx < 0 || ny < 0 || nx >= lv.w || ny >= lv.h) { finishRun("edge"); return; }
      if (isWall(nx, ny)) { finishRun("wall"); return; }
      robot.x = nx; robot.y = ny;
      if (penDown) painted[key(robot.x, robot.y)] = true;
      KB.sfx.step();
    }

    drawGrid();
    runAt++;
    timer = setTimeout(tick, STEP_MS);
  }

  function won() {
    if (lv.sandbox) return false;
    if (lv.star) return robot.x === lv.star.x && robot.y === lv.star.y;
    if (lv.paint) return lv.paint.every(p => painted[key(p.x, p.y)]);
    return false;
  }

  function finishRun(crash) {
    running = false;
    clearTimeout(timer);
    drawProgram();

    if (crash) {
      KB.sfx.nope();
      dom.grid.classList.remove("shake");
      void dom.grid.offsetWidth;
      dom.grid.classList.add("shake");
      const msg = crash === "wall"
        ? "Bump! A brick is in the way. Change the program and run it again."
        : "Oops, off the edge! Change the program and run it again.";
      dom.note.textContent = msg;
      KB.speak(msg);
      return;
    }

    if (won()) {
      KB.sfx.great();
      KB.cheer(true);
      dom.note.textContent = "🎉 You did it in " + program.length + " command" +
                             (program.length === 1 ? "" : "s") + "!";
      KB.speak("You did it! The robot got there.");
      if (lvIndex + 1 > clearedCount()) {
        KB.state.robot = { cleared: lvIndex + 1 };
        KB.save();
      }
      const stage = document.getElementById("stage");
      setTimeout(() => {
        if (KB.ui.currentId() !== "robot" || !lv) return;
        if (lvIndex + 1 < LEVELS.length) startLevel(stage, lvIndex + 1);
        else showMenu(stage);
      }, 2600);
      return;
    }

    if (lv.sandbox) {
      dom.note.textContent = "Nice pattern! Backspace to change it, Enter to run again.";
      return;
    }

    KB.sfx.nope();
    dom.note.textContent = lv.paint
      ? "Not every grey square is painted yet. Have another go!"
      : "The robot stopped short of the star. Have another go!";
    KB.speak("Not quite there. Try changing the program.");
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    timer = null;
  }

  /* ---------------- mode object ---------------- */

  KB.ui.register({
    id: "robot",
    icon: "🤖",
    label: "Robot Coder",

    start(stage) { showMenu(stage); },
    stop() { stop(); lv = null; },

    onKey(k) {
      if (!lv) return;
      if (running) {
        if (k === "BACK" || k === "ENTER") { stop(); drawProgram(); dom.note.textContent = "Stopped."; }
        return;
      }
      if (k === "ENTER") { run(); return; }
      if (k === "BACK")  { rubOut(); return; }
      if (k === "F" || k === "L" || k === "R" || k === "P") { addToken(k); return; }
      if (/^[2-9]$/.test(k)) { pending = parseInt(k, 10); KB.sfx.tick(); drawProgram(); return; }
      if (k === "1") { pending = 0; drawProgram(); return; }
    }
  });

})(window.KB);
