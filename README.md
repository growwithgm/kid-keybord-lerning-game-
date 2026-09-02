# ABC Keyboard Fun 🎈

A browser-based keyboard learning game for little kids (around age 4), designed to
help them get comfortable with a laptop/computer keyboard while learning letters
and numbers.

**No installation, no ads, no sign-up — just one HTML page.** Works offline once
loaded and runs perfectly on GitHub Pages.

## How to play

Open the page and let your child press keys!

### 🎈 Free Play mode (default)
- Press any **letter** → a big colorful letter appears, with a word and emoji
  (A for Apple 🍎), and the letter is spoken out loud.
- Press any **number** → the number appears with counting stars and is spoken.
- Press any **other key** → fun emoji + confetti, so nothing feels "wrong".

### 🔎 Find the Letter mode
- A big letter is shown and spoken ("Find the letter B!").
- The child hunts for it on the real keyboard.
- Correct → big confetti celebration + a star ⭐.
- After 3 misses, the key glows yellow on the on-screen keyboard as a hint.

### 📝 Tasks mode (small practice missions)
Ten little tasks in two levels, each teaching one keyboard skill. Finishing a
task earns a star (up to ⭐⭐⭐ per task), and stars are **saved on the device**
so progress stays between sessions.

**Level 1 🌱 — first steps**

| Task | What it teaches |
|------|-----------------|
| 🚂 ABC Train | Press A → Z in order (letter positions) |
| 🔢 Number Rocket | Press 1 → 0 in order (number row) |
| 🐱 Little Words | Type CAT, DOG, SUN… one letter at a time |
| 🐸 Space Jump | Find and press the big SPACE bar |
| 🚗 Arrow Roads | Press the matching arrow keys |

**Level 2 🚀 — for kids who mastered Level 1**

| Task | What it teaches |
|------|-----------------|
| 🔡 Small Letters | Lowercase shown on screen → find the matching (uppercase) key |
| 🧩 First Letter | See a picture, think of the word, press its first letter |
| 🍎 Count & Press | Count the things on screen, press that number |
| ⚡ Quick Catch | Press the letter before the friendly 6-second clock runs out (no fail — it just encourages and keeps going) |
| 🐘 Big Words | Type 4-letter words (FISH, STAR, MOON…) |

In every task, if the child can't find the key, the right key starts glowing
yellow on the on-screen keyboard after a few seconds — so they can always
succeed on their own.

### 👩‍🍳 Kitchen mode (make a pizza or a cake)
A free, creative game with no scores and no way to lose. Every topping lives on
the key whose letter it starts with — **M** for Mushroom, **S** for Strawberry —
so decorating is letter practice in disguise.

| Key | What it does |
|-----|--------------|
| Letters | Add that topping (🍕 Cheese, Mushroom, Olive, Tomato, Pepper, Bacon, Egg, Onion, Leaf, Shrimp — 🎂 Strawberry, Blueberry, Cherry, Kiwi, Grapes, Lemon, Heart, Flower, Nut, Melon) |
| 1–9 | On the cake: that many candles 🕯️ (great for "how old are you?"). On the pizza: that many of one topping, counted out loud |
| ← → ↑ ↓ | Sprinkles ✨ |
| Space | 🔥 Bake it! — the food browns, confetti flies, and it says "Yummy!" |
| Backspace | Start a fresh one |

A legend under the food always shows which letter does what, so a child who
can't read yet can still match the shapes.

## Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Toggle fullscreen (the special fullscreen shortcut) |
| **Esc** | Exit fullscreen |
| Any letter/number | Play! |

Fullscreen is recommended — it keeps little fingers away from browser tabs.

## Run it on GitHub Pages

1. Go to the repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select your branch and the **/ (root)** folder, then **Save**.
4. Your game will be live at `https://<username>.github.io/<repo-name>/`.

## Tech notes

- Single `index.html` file — plain HTML/CSS/JS, zero dependencies.
- Voice uses the browser's built-in Speech Synthesis (English).
- Sounds are generated with the Web Audio API (no audio files).
- Works on desktop and touch devices (on-screen keyboard is tappable).
- Task progress is stored in `localStorage` (nothing leaves the device).

### Optimized for low-end devices (e.g. 4GB Chromebooks)
- No images, fonts, or libraries to download — the whole game is one small file.
- The animation loop only runs while confetti is on screen; when idle the game
  uses ~0% CPU.
- Confetti particles are capped, and the canvas renders at 1× resolution.

## Tips for parents (research-based)

- Keep sessions short: 5–10 minutes is plenty at age 4.
- Sit with your child the first few times and name the letters together.
- There is no "wrong" way to play — exploration is the goal, not typing speed.
