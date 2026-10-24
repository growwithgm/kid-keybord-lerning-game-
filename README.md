# Keyboard Fun 🌈

A gentle browser game for a five-year-old. Seven little games, picked from a
home screen of big picture buttons — no reading needed to choose one.

**One page, no build step, no libraries, no sign-up.** Plain HTML, CSS and
JavaScript, served from GitHub Pages, and light enough for a 4 GB Chromebook.

> There is **no picture of a keyboard on the screen**. She uses the real one
> under her hands. When she is stuck the game says which hand and which small
> letter to look for, so her eyes go down to the keys.

---

## Where this sits

She can already find the letters, type three-letter words, use the space bar,
count, and — the important one — notice a mistake and rub it out with
Backspace. She passed the last test 6/6.

This version is the next rung, and it follows the usual phonics order rather
than inventing one:

| New game | Why it comes next |
|----------|-------------------|
| **Rhymes** (word families) | The standard step straight after three-letter words: the ending stays, the first letter changes |
| **Two Letters** (sh, ch, th, ng) | Consonant digraphs are next in the sequence — two letters making one sound |
| **Tricky Words** (the, my, you, she) | The common little words that cannot be sounded out and simply have to be known |
| **First Sound** (a new Balloons round) | Hear a word, find the letter it begins with |

The sources also warn against rushing from three-letter words into blends and
digraphs, so everything here stays short — three words a level — and the
picture and the voice always give the word before she has to type it.

---

## The seven games

### 🎈 Balloons
Balloons drift up with something on each; press the matching key and it pops.
Eight pops earns a star. Three rounds: **Letters**, **Numbers**, and the new
**First Sound**, where the balloon carries a picture and she presses the letter
the word begins with.

Gentle by design: three balloons at a time at most, a slow drift, a wrong key
costs nothing, and a balloon that escapes just floats away. No lives, no game
over.

### 🐱 Rhymes
Word families. `-AT` gives CAT, BAT, HAT, RAT; then `-AN`, `-OP`, `-UN`. The
ending is shown above the word the whole time, so the pattern does the
teaching.

### 🚢 Two Letters
**SH** says "sh". Then CH, TH and NG. Four words a sound — SHIP, SHOP, FISH,
DISH — with the pair named above and spoken before each word.

### 🪄 Tricky Words
MY, GO, WE, then THE, SHE, YOU, then a tricky word in front of one she already
knows: **MY CAT**, **THE SUN**. These are shown and said rather than sounded
out, because that is the only way they work.

### ⌨️ Write
A blank page. Any key appears, **⌫** rubs it out, **Enter** reads it aloud.
Spell a word the game knows and its picture appears — now including the new
ones, so S-H-I-P gives 🚢. Spell it wrong and it does not, so fixing it is her
own idea. Nothing is ever refused or marked wrong.

### ✏️ Fix It
Words written wrong; make them match the picture. **Rub it out** (extra letters
on the end), **Last one wrong**, and **Finish it**, which now stretches to
four-letter words.

### ⭐ Star Test
Six short questions across the new ground: what a picture starts with, which
letter turns CAT into BAT, a word-family word, a two-letter-sound word, a
tricky word, and one broken word to fix. A star is only given when the answer
is right first time, but after two tries the hint says what to do. **Five out
of six passes.**

---

## Keys

**Everything works from the keyboard — no trackpad needed anywhere.** On the
home screen and on every game's menu, each card wears the number to press.

| Key | On a menu | In a game |
|-----|-----------|-----------|
| **1 … 7** | Pick that card | — |
| **Arrows** | Move the highlight | Pop balloons, etc. |
| **Enter** | Pick the highlighted one | Reads your writing out loud |
| **⌫ Backspace** | Go back | Rubs out one letter |
| **Space** | The gap between two words |
| **Tab** | Big screen on and off |
| **Esc** | Leave big screen |

On a Chromebook the **□ key** in the top row is big screen too.

---

## Notes for grown-ups

Built for the HP Chromebook she uses:

- Its keys are printed in **lower case**, so hints say "look for a small f".
- `f` and `j` have the little bumps typists find their place with.
- There is **no Caps Lock** — the Search key sits in its place. Nothing in the
  game needs capitals.
- If she hits the Search key by accident the launcher opens; press Esc.

**On the pictures.** Any game that asks *"what does this start with?"* only
uses pictures a child will name the way we mean — 🐱 cat, 🚌 bus, 🚢 ship. The
word-family pictures include looser ones (🐇 beside HOP, 🎈 beside POP) which
work as a reminder once the word has been said, but those are never used for a
first-sound question. There is no MOTH in the game, because the nearest emoji
is a butterfly and that is a different animal.

Progress is saved in the browser on that device only. Nothing is uploaded, and
the game works offline once loaded.

Keep sessions short. Ten minutes is plenty.

**One honest caveat:** a recent (small, short-term) study of five-year-olds
found handwriting beat typing for early letter and word learning. This game
teaches the *keyboard*. Keep the pencil going too.

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
js/core.js          storage, sound, speech, sparkles, every word list,
                    and the Chromebook-aware "where is that key" hints
js/ui.js            the shell: home screen, house button, key handling
js/drill.js         the shared engine behind the three copying games
js/mode-balloon.js  🎈 Balloons
js/mode-rhyme.js    🐱 Rhymes
js/mode-sounds.js   🚢 Two Letters
js/mode-tricky.js   🪄 Tricky Words
js/mode-write.js    ⌨️ Write
js/mode-fix.js      ✏️ Fix It
js/mode-test.js     ⭐ Star Test
js/main.js          boot
```

Rhymes, Two Letters and Tricky Words are the same game with different word
lists, so they share `drill.js` and are about forty lines each. Every mode
registers itself with `KB.ui.register({ id, icon, label, color, start, stop,
onKey })`, and the order of the script tags is the order of the home screen.
Plain `<script>` tags on purpose: nothing to build, runs from GitHub Pages or
straight off the disk.

## What could come next, when she is ready

- Blends: STOP, FLAG, MILK — two consonants side by side, the rung after these
- Vowel teams: ai, ee, oa
- Capitals with Shift, and her own name
- A short sentence, and the full stop
- The robot and the sorting robot could come back once reading is steadier
