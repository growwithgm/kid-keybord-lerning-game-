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

Seven modes, left to right as a learning path. **Writing and fixing come
first**; the coding modes sit at the end, on purpose — see *Why writing before
code* below.

### ⌨️ Magic Writing
A blank page. Whatever the child presses appears, **Backspace** rubs it out,
and **Enter** makes the computer read it aloud.

The hook is the picture: spell a word the game knows and it appears. Spell it
wrong and it does not — so the child goes back and fixes it themselves. Nothing
here is marked wrong and no key is ever refused; it is a safe place to write,
notice a mistake, and rub it out.

### ✏️ Fix It
One idea, four levels: here is the word it should say, here is what is actually
written — make them match.

| Level | What is broken |
|-------|----------------|
| **Rub it out** | Junk letters on the end — Backspace only |
| **Last one wrong** | Rub out one, type the right one |
| **Finish it** | Letters missing — type the rest |
| **Wrong in the middle** | Go back past the good letters, then retype |

This is what the UK Year 1 computing curriculum calls *adding and removing
text*, and it is the skill a child needs before anything else on a computer.

### ✋ Two Hands
The step that comes after knowing where the letters are: knowing *whose* key it
is. Nothing here is timed — at this age it is about awareness, not speed.

| Drill | What it teaches |
|-------|-----------------|
| **Left or Right?** | A letter appears; press the ← or → arrow for the hand it belongs to |
| **Find the Bumps** | The two keys with little ridges, `f` and `j`, are how typists find their place without looking |
| **Home Keys** | A S D F · J K L, one at a time, with the right finger shown |

### 📖 Word Lab
Copy the word, one rung at a time: three letters → four → five → **two words
with a space** → **Shift Power**, where a capital needs the other hand on Shift.
Each level unlocks the next.

**A wrong letter lands on the screen in red and stays there** until the child
rubs it out. An earlier build quietly refused the wrong key, which meant the
mistake never appeared and Backspace was never needed — the game was doing the
noticing. Now the child does.

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
Twelve questions over the new ground, weighted the same way the modes are:
three on hands, three on typing words, **three on fixing broken text**, two on
the robot's commands, and one on what a robot will do with what it was taught.

A point is scored **only when the answer is right first time**, but nobody gets
stuck: after two misses the hint names the hand, the finger and where to look.
Passing is **9 out of 12**, and the result page breaks the score down by skill
(Hands, Words, Fixing, Code, Robot brain) so a grown-up can see what to
practise next.

---

## Why writing before code

Version 1's test came back 11/12, with the only weak spot in typing words, so
the first build of v2 went for robot programming. That was the wrong order, and
the research says so:

- **TypingClub's own teaching guide** says to leave Backspace enabled for
  beginners, because not being able to correct a mistake is what makes children
  give up. Disabling it is an *advanced* challenge, not a starting point.
- **Oak National Academy** (UK national curriculum) gives *adding and removing
  text* a whole Year 1 lesson, before any programming. It also names the common
  misconception worth heading off: children assume Backspace deletes the whole
  sentence.
- Classroom practice is the same shape as *Fix It*: type some junk, then take it
  out again one letter at a time.

So the typing and editing modes come first and the coding modes went to the end.
Robot Coder and Teach the Robot are still there — the path to programming is the
long-term plan — they are just no longer the first thing the child meets.

One honest caveat: a recent (small, short-term) study of five-year-olds found
**handwriting beat typing** for early letter and word learning. This game
teaches the *keyboard*, not reading and writing. Keep the pencil going too.

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
js/mode-write.js    ⌨️ Magic Writing
js/mode-fix.js      ✏️ Fix It
js/mode-words.js    📖 Word Lab
js/mode-hands.js    ✋ Two Hands
js/mode-robot.js    🤖 Robot Coder
js/mode-ai.js       🧠 Teach the Robot
js/mode-test.js     🎓 Lab Test
js/main.js          boot
```

Each mode file registers itself with `KB.ui.register({ id, icon, label, start,
stop, onKey })`, so adding another mode means adding one file and one script
tag. The order of the script tags in `index.html` is the order of the tabs. The files are plain `<script>` tags rather than ES modules on purpose: it
works on GitHub Pages and straight off the disk, with nothing to build.

## What could come next

- Arrow keys to move the cursor, so a mistake can be fixed without rubbing out
  everything after it
- Short sentences, then the full stop and the question mark
- `IF` and `REPEAT UNTIL` for the robot — conditionals after loops
- Letting the child train the robot on their own drawings instead of shapes
