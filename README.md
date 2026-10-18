# Keyboard Fun 🌈

A gentle browser game for a five-year-old who is learning her way around a
laptop keyboard. Six little games, picked from a home screen of big picture
buttons — no reading needed to choose one.

**One page, no build step, no libraries, no sign-up.** Plain HTML, CSS and
JavaScript, served from GitHub Pages, and light enough for a 4 GB Chromebook.

> There is **no picture of a keyboard on the screen**. She uses the real one
> under her hands. When she is stuck the game says which hand and which small
> letter to look for, so her eyes go down to the keys.

---

## The six games

### ⌨️ Write
A blank page. Any key she presses appears, **⌫** rubs it out, and **Enter**
makes the computer read it aloud.

Spell a word the game knows and its picture appears — C-A-T gives 🐱. Spell it
wrong and it does not, so going back and fixing it is her own idea rather than
the game telling her off. Nothing is marked wrong and no key is ever refused.

### ✏️ Fix It
Three-letter words, written wrong. Make them match the picture.

| Level | What is broken |
|-------|----------------|
| **Rub it out** | Extra letters on the end — ⌫ only |
| **Last one wrong** | Rub one out, write the right one |
| **Finish it** | Letters missing — write the rest |

### 📖 Words
Copy the word: three letters, then four, then two words with a space. Three
words clears a level and opens the next.

**A wrong letter lands on the screen in red and stays there** until she rubs it
out. The game does not do the noticing for her — that is the skill.

### 🤖 Robot
Arrow keys drive a robot around a little grid, collecting stars. Press an arrow
and it moves *straight away*. Working out the route and pressing the keys in
order is the seed of programming; writing the whole plan down first can wait
until she is older.

### 🧠 Teach Robot
Four shapes to sort into box **1** or box **2**, any way she likes — all the red
ones, all the big ones. A real (if tiny) classifier learns her rule, then
guesses on shapes it has not seen, showing how sure it is and why. It learns
from the ones it gets wrong. Put everything in one box and it will notice and
ask for some in the other.

### ⭐ Star Test
Six short questions: press a letter, press the long bar, count some stars, type
a little word, and fix two broken ones. A star is only given when the answer is
right first time, but after two tries the hint tells her what to do, so she is
never stuck. **Five out of six passes.**

---

## Keys

| Key | Does |
|-----|------|
| **⌫ Backspace** | Rubs out one letter |
| **Enter** | Reads it out loud / go |
| **Arrow keys** | Move the robot |
| **1 and 2** | The two boxes in Teach Robot |
| **Tab** | Big screen on and off |
| **Esc** | Leave big screen |

On a Chromebook the **□ key** in the top row is big screen too.

---

## Notes for grown-ups

Built for the HP Chromebook she actually uses:

- Its keys are printed in **lower case**, so hints say "look for a small f"
  rather than naming a capital.
- `f` and `j` have the little bumps, which is how typists find their place.
- There is **no Caps Lock** — the Search key sits in its place. Nothing in the
  game needs capitals, so it never comes up.
- If she hits the Search key by accident the launcher opens; press Esc.

Progress — stars, unlocked levels, words spelled, best test score — is saved in
the browser on that device only. Nothing is uploaded anywhere, and the game
works offline once loaded.

Keep sessions short. Ten minutes is plenty.

**One honest caveat:** a recent (small, short-term) study of five-year-olds
found handwriting beat typing for early letter and word learning. This game
teaches the *keyboard*, not reading and writing. Keep the pencil going too.

---

## Why it looks like this

An earlier version of this game had seven tabs, drills that asked which finger
owned a key, and a robot you had to write a program for. That was too much for
five, so it was pulled back:

- **A home screen of big picture buttons** instead of a strip of tabs.
- **Short words on screen**; the longer explaining is done by the voice.
- **Three or four rounds a level**, not ten.
- **No finger names.** A hint says "it is on your left hand" and shows two
  hands, nothing more.
- **The robot moves on each arrow press** instead of running a typed program.
- **Six test questions**, all things she can actually do.

What stayed is the part the research is clearest about: **Backspace**.
TypingClub's own teaching guide keeps it enabled for beginners, because not
being able to fix a mistake is what makes children give up, and the UK Year 1
computing curriculum gives *adding and removing text* its own lesson well before
any code. So every game here lets a mistake happen, show itself, and be rubbed
out.

---

## Running it

### On GitHub Pages
**Settings → Pages → Deploy from a branch**, pick the branch and the **/ (root)**
folder. It appears at `https://<user>.github.io/<repo>/`.

### On your own machine
```
npx http-server -p 8080 .
```
then open `http://localhost:8080`.

---

## How the code is laid out

```
index.html          the page: a bar, a stage, and the script tags
css/style.css       all the styling
js/core.js          storage, sound, speech, sparkles, the word lists,
                    and the Chromebook-aware "where is that key" hints
js/ui.js            the shell: home screen, house button, key handling
js/mode-write.js    ⌨️ Write
js/mode-fix.js      ✏️ Fix It
js/mode-words.js    📖 Words
js/mode-robot.js    🤖 Robot
js/mode-ai.js       🧠 Teach Robot
js/mode-test.js     ⭐ Star Test
js/main.js          boot
```

Each mode registers itself with `KB.ui.register({ id, icon, label, color,
start, stop, onKey })`, so adding another game means one file and one script
tag. The order of the script tags is the order of the home screen. Plain
`<script>` tags rather than ES modules on purpose: nothing to build, and it
runs from GitHub Pages or straight off the disk.

## What could come next, when she is ready

- Longer words, then a short sentence
- Capitals with Shift
- Moving the cursor with the arrow keys to fix a letter in the middle
- Giving the robot a plan to follow instead of one step at a time
