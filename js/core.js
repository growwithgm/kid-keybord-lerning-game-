/* ============================================================
   core.js — storage, sound, speech, sparkles and small helpers.
   Everything hangs off the global KB namespace so the files can
   be plain <script> tags: no build step, works on GitHub Pages
   and straight off the disk.
   ============================================================ */
window.KB = window.KB || {};

(function (KB) {
  "use strict";

  /* ---------------- saved progress ---------------- */

  const STORE_KEY = "keyboard-lab-2";

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { saved = {}; }

  KB.state = saved;
  KB.save = function () {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(KB.state)); } catch (e) { /* private mode */ }
  };

  /* ---------------- helpers ---------------- */

  KB.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  KB.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  KB.el = function (tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  KB.COLORS = ["#ef476f", "#f77f00", "#ffc300", "#06d6a0", "#118ab2", "#8b5cf6", "#e76f51", "#2a9d8f"];

  KB.NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five",
                     "six", "seven", "eight", "nine"];

  KB.PRAISE = ["Great job!", "Yes!", "Brilliant!", "Super!", "Well done!", "Nice one!"];

  /* ---------------- words the game knows ----------------
     Shared by Word Lab, Fix It, Magic Writing and the test, so a
     word only has to be added once.                            */

  KB.WORDS_3 = [["CAT","🐱"],["DOG","🐶"],["SUN","☀️"],["BUS","🚌"],["CUP","☕"],
                ["HAT","🎩"],["BEE","🐝"],["PIG","🐷"],["EGG","🥚"],["CAR","🚗"],
                ["BAT","🦇"],["FOX","🦊"],["COW","🐮"],["BED","🛏️"],["KEY","🔑"]];

  KB.WORDS_4 = [["FISH","🐟"],["STAR","⭐"],["MOON","🌙"],["CAKE","🎂"],["TREE","🌳"],
                ["BIRD","🐦"],["FROG","🐸"],["DUCK","🦆"],["LION","🦁"],["BEAR","🐻"],
                ["BOAT","⛵"],["DOOR","🚪"],["BALL","⚽"],["SHOE","👟"],["RAIN","🌧️"]];

  KB.WORDS_5 = [["HORSE","🐴"],["TRAIN","🚂"],["APPLE","🍎"],["SNAKE","🐍"],["MOUSE","🐭"],
                ["CLOUD","☁️"],["HOUSE","🏠"],["TIGER","🐯"],["ROBOT","🤖"],["PIZZA","🍕"],
                ["WHALE","🐳"],["SHEEP","🐑"],["BREAD","🍞"],["CHAIR","🪑"],["PANDA","🐼"]];

  KB.PHRASES = [["BIG CAT","🐈"],["RED BUS","🚌"],["HOT SUN","☀️"],["MY DOG","🐶"],
                ["BLUE SKY","🌤️"],["TWO CATS","🐈‍⬛"],["OLD TREE","🌳"],["BAD EGG","🥚"]];

  KB.NAMES = [["Sam","🧒"],["Ben","👦"],["Mia","👧"],["Tom","👦"],
              ["Zoe","👧"],["Ali","🧒"],["Max","👦"],["Eva","👧"]];

  /* one lookup for "is this a word, and what does it look like?" */
  KB.PICTURES = {};
  [KB.WORDS_3, KB.WORDS_4, KB.WORDS_5].forEach(list => {
    list.forEach(([w, e]) => { KB.PICTURES[w] = e; });
  });

  KB.pictureFor = function (text) {
    return KB.PICTURES[String(text || "").toUpperCase()] || null;
  };

  /* ---------------- which finger presses which key ----------------
     Standard touch-typing map. hand: "L" | "R" | "T" (thumbs).
     finger: 0 = pointing, 1 = tall, 2 = ring, 3 = little.          */

  const F = (hand, finger) => ({ hand: hand, finger: finger });

  KB.FINGER = {
    "1": F("L", 3), "2": F("L", 2), "3": F("L", 1), "4": F("L", 0), "5": F("L", 0),
    "6": F("R", 0), "7": F("R", 0), "8": F("R", 1), "9": F("R", 2), "0": F("R", 3),

    Q: F("L", 3), W: F("L", 2), E: F("L", 1), R: F("L", 0), T: F("L", 0),
    Y: F("R", 0), U: F("R", 0), I: F("R", 1), O: F("R", 2), P: F("R", 3),

    A: F("L", 3), S: F("L", 2), D: F("L", 1), F: F("L", 0), G: F("L", 0),
    H: F("R", 0), J: F("R", 0), K: F("R", 1), L: F("R", 2),

    Z: F("L", 3), X: F("L", 2), C: F("L", 1), V: F("L", 0), B: F("L", 0),
    N: F("R", 0), M: F("R", 0),

    SPACE: F("T", 0)
  };

  KB.FINGER_NAMES  = ["pointing finger", "tall finger", "ring finger", "little finger"];
  KB.FINGER_SHORT  = ["pointing", "tall", "ring", "little"];
  KB.FINGER_COLORS = ["#ef476f", "#ffc300", "#06d6a0", "#118ab2"];
  KB.HAND_NAMES    = { L: "left", R: "right", T: "thumb" };

  /* ---------------- where the key physically is ----------------
     Written for the Chromebook this is played on: letters are
     printed in lower case, f and j carry the little bumps, there
     is no Caps Lock (the Search key sits in its place), and the
     arrows are the small cluster at the bottom right.          */

  const ROWS = {
    numbers: "1234567890",
    top:     "QWERTYUIOP",
    home:    "ASDFGHJKL",
    bottom:  "ZXCVBNM"
  };

  const ROW_WORDS = {
    numbers: "the numbers along the top",
    top:     "the top row of letters",
    home:    "the middle row",
    bottom:  "the bottom row"
  };

  function rowOf(key) {
    for (const r in ROWS) if (ROWS[r].indexOf(key) !== -1) return r;
    return null;
  }

  KB.whereIs = function (key) {
    if (key === "SPACE") return "the long bar at the bottom";
    if (key === "ENTER") return "the big enter key";
    if (key === "BACK")  return "the top right corner";
    if (key === "LEFT" || key === "RIGHT" || key === "UP" || key === "DOWN") {
      return "the little arrows at the bottom right";
    }
    const row = rowOf(key);
    if (!row) return "";
    if (row === "numbers") return "the numbers along the top";
    if (key === "F" || key === "J") return "the key with the tiny bump";
    return ROW_WORDS[row];
  };

  /* Short, spoken help: which hand, and the small letter to look
     for. No finger names — that is a lot of words for a little
     person. Her eyes go to the real keyboard, not to the screen. */
  KB.fingerHint = function (key) {
    const f = KB.FINGER[key];
    if (key === "SPACE") return "Use your thumb on the long bar at the bottom.";
    const small = /^[A-Z]$/.test(key) ? " Look for a small " + key.toLowerCase() + "." : "";
    if (!f) return small.trim();
    return "It is on your " + KB.HAND_NAMES[f.hand] + " hand." + small;
  };

  /* The Chromebook prints its letters in lower case, so when we
     show a single key we show both faces: the capital the child
     reads, and the small letter actually printed on the key. */
  KB.keyFace = function (key) {
    if (!/^[A-Z]$/.test(key)) return key;
    return '<b class="face-up">' + key + '</b><b class="face-low">' + key.toLowerCase() + "</b>";
  };

  KB.handOf = function (key) {
    const f = KB.FINGER[key];
    return f ? f.hand : null;
  };

  /* ---------------- sound (Web Audio, no files) ---------------- */

  let ctx = null;
  KB.soundOn = KB.state.soundOn !== false;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol) {
    if (!KB.soundOn) return;
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + start);
    gain.gain.linearRampToValueAtTime(vol || 0.16, ac.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + dur + 0.05);
  }

  KB.sfx = {
    pop:   () => tone(480 + Math.random() * 380, 0, 0.11, "triangle", 0.14),
    tick:  () => tone(900, 0, 0.05, "square", 0.07),
    good:  () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.18, "sine", 0.15)),
    great: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.24, "sine", 0.16)),
    nope:  () => tone(210, 0, 0.17, "sine", 0.10),
    step:  () => tone(360, 0, 0.07, "triangle", 0.10)
  };

  /* ---------------- speech ---------------- */

  KB.speak = function (text) {
    if (!KB.soundOn || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.88;
    u.pitch = 1.15;
    speechSynthesis.speak(u);
  };

  KB.hush = function () {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  };

  /* ---------------- sparkles ----------------
     One canvas, capped particles, and the animation loop only
     turns over while something is on screen — a 4 GB Chromebook
     sits at zero CPU the rest of the time.                     */

  const MAX_PARTICLES = 140;
  let canvas = null, cx = null, parts = [], raf = null;

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.getElementById("fx");
    if (!canvas) return;
    cx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function frame() {
    cx.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter(p => p.life > 0);
    if (!parts.length) { raf = null; return; }
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18;
      p.life -= 0.016; p.spin += 0.11;
      cx.save();
      cx.globalAlpha = Math.max(p.life, 0);
      cx.translate(p.x, p.y);
      cx.rotate(p.spin);
      cx.fillStyle = p.color;
      cx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      cx.restore();
    }
    raf = requestAnimationFrame(frame);
  }

  KB.fx = function (x, y, big) {
    ensureCanvas();
    if (!canvas) return;
    const n = big ? 55 : 18;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * (big ? 7 : 4.5);
      parts.push({
        x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3,
        size: 4 + Math.random() * 6,
        color: KB.COLORS[Math.floor(Math.random() * KB.COLORS.length)],
        life: 1, spin: Math.random() * 6
      });
    }
    if (parts.length > MAX_PARTICLES) parts.splice(0, parts.length - MAX_PARTICLES);
    if (raf === null) raf = requestAnimationFrame(frame);
  };

  KB.cheer = function (big) {
    KB.fx(window.innerWidth / 2, window.innerHeight / 2.4, big !== false);
  };

})(window.KB);
