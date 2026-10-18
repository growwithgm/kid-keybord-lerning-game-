# Keyboard Lab 🚀

Version 2 of a browser game for a young child who has already learned where the
keys are. Version 1 taught letter-hunting and finished with a test; this one
picks up from there and heads towards typing properly, writing code, and
understanding how a machine learns.

**One page, no build step, no libraries, no sign-up.** Plain HTML, CSS and
JavaScript, served straight from GitHub Pages, and light enough for a 4 GB
Chromebook.

> There is deliberately **no picture of a keyboard on the screen**. The child
> uses the real keyboard under their hands. When they get stuck, the game says
> which hand and finger to use and where to look — so their eyes go down to the
> keys, not to a drawing of them.

---

## What is in it

Five modes, left to right as a learning path.

### ✋ Two Hands
The step that comes after knowing where the letters are: knowing *whose* key it
is. Nothing here is timed — at this age it is about awareness, not speed.

| Drill | What it teaches |
|-------|-----------------|
| **Left or Right?** | A letter appears; press the ← or → arrow for the hand it belongs to |
| **Find the Bumps** | The two keys with little ridges, `f` and `j`, are how typists find their place without looking |
| **Home Keys** | A S D F · J K L, one at a time, with the right finger shown |

### 📖 Word Lab
Version 1's test found exactly one weak spot — typing words — so this mode
climbs one rung at a time and each level unlocks the next.

Three letters → four letters → five letters → **two words with a space** →
**Shift Power**, where a capital needs the other hand holding Shift. That last
one is the first time both hands have to work together.

### 🤖 Robot Coder
Real programming, typed on a real keyboard. The child writes a line of commands,
presses **Enter**, and watches the robot carry them out one step at a time.

| Key | Command |
|-----|---------|
| `F` | forward one square |
| `L` / `R` | turn left / right |
| `P` | pen down, or up again — the robot draws as it moves |
| `2`–`9` | repeat: `3F` means forward three times |
| `Enter` | run the program |
| `Backspace` | rub out the last command |

Eight levels: straight line → one turn → two turns → around a wall → draw a line
→ *do it in four commands or fewer* → draw a square → free build.

When the robot bumps into a brick it stops and says so, the wrong command stays
on screen, and the child fixes it and runs again. That is debugging, and it is
the point.

### 🧠 Teach the Robot
A first, honest look at machine learning. The child sorts coloured shapes into
box **1** and box **2** by any rule they like — all the red ones, all the big
ones — and a real (if tiny) classifier learns that rule from their examples.

Then it guesses on shapes it has never seen, and for each one it shows:

- **what it thinks** — "I think it goes in box 1"
- **how sure it is** — a confidence bar with a real percentage
- **why** — "it is red, and you put red ones in box 1"

The child says where it really goes, and the robot learns from the ones it got
wrong. Nothing is faked: the guesses genuinely come from what the child taught
it, so the lessons land by themselves — more examples make it better, and it can
still be wrong. Teach it only one box and it will say so and ask for the other.

### 🎓 Lab Test
Twelve questions over the new ground: which hand owns a key, the bumps, the home
keys, a four- and a five-letter word, a phrase with a space, a name with Shift,
the robot's commands, the repeat shortcut, and one question about what a robot
will do with what it was taught.

A point is scored **only when the answer is right first time**, but nobody gets
stuck: after two misses the hint names the hand, the finger and where to look.
Passing is **9 out of 12**, and the result page breaks the score down by skill
(Hands, Words, Code, Robot brain) so a grown-up can see what to practise next.

---

## Shortcuts

| Key | Does |
|-----|------|
| **Enter** | Go / run the robot's program |
| **Backspace** | Rub out |
| **Tab** | Full screen on and off |
| **Esc** | Leave full screen |

On a Chromebook the **□ key** in the top row is full screen too.

---

## Notes for grown-ups

This was built for the HP Chromebook the child actually uses, so:

- Its keys are printed in **lower case**. Where the game shows a single key it
  shows both faces — a big **H** next to a small **h** — so the capital on screen
  and the letter on the key are obviously the same thing.
- `f` and `j` really do have the little bumps, which is what *Find the Bumps*
  is about.
- There is **no Caps Lock** — the Search key sits in its place. Shift is the only
  way to make a capital, which is why Word Lab teaches it.
- If the child hits the Search key by accident the Chromebook launcher opens;
  press Esc to get back.

Progress — stars, unlocked levels, best test score, how much the robot has
learned — is saved in the browser on that device only. Nothing is uploaded
anywhere and the game works offline once the page has loaded.

Keep sessions short. Ten minutes of the robot is worth an hour of being nagged.

---

## Running it

### On GitHub Pages
**Settings → Pages → Deploy from a branch**, pick the branch and the **/ (root)**
folder. The game appears at `https://<user>.github.io/<repo>/`.

### On your own machine
Any static server will do, for example:

```
npx http-server -p 8080 .
```

then open `http://localhost:8080`.

---

## How the code is laid out

Version 1 was a single HTML file. This one is split up, which is a small step
towards a real project:

```
index.html          the page: a top bar, a stage, and the script tags
css/style.css       all the styling
js/core.js          storage, sound, speech, sparkles, the finger map,
                    and the Chromebook-aware "where is that key" hints
js/ui.js            the shell: tabs, stage, hands guide, key handling
js/mode-hands.js    ✋ Two Hands
js/mode-words.js    📖 Word Lab
js/mode-robot.js    🤖 Robot Coder
js/mode-ai.js       🧠 Teach the Robot
js/mode-test.js     🎓 Lab Test
js/main.js          boot
```

Each mode file registers itself with `KB.ui.register({ id, icon, label, start,
stop, onKey })`, so adding a sixth mode means adding one file and one script
tag. The files are plain `<script>` tags rather than ES modules on purpose: it
works on GitHub Pages and straight off the disk, with nothing to build.

## What could come next

- Sentences, then punctuation and the question mark
- `IF` and `REPEAT UNTIL` for the robot — conditionals after loops
- Letting the child train the robot on their own drawings instead of shapes
- A two-player race on the same keyboard
