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

## Tips for parents (research-based)

- Keep sessions short: 5–10 minutes is plenty at age 4.
- Sit with your child the first few times and name the letters together.
- There is no "wrong" way to play — exploration is the goal, not typing speed.
