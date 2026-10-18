/* ============================================================
   mode-write.js — "Magic Writing"

   A blank page. Whatever the child presses appears; Backspace
   rubs it out; Enter makes the computer read it aloud.

   The hook is the picture: spell a word the game knows and it
   appears. Spell it wrong and it does not — so the child goes
   back and fixes it themselves with Backspace. That is the
   whole point of this mode. Nothing here is marked wrong and
   nothing is blocked; it is a safe place to write and rub out.
   ============================================================ */
(function (KB) {
  "use strict";

  const MAX = 42;

  let text = "", dom = null, settled = false;

  function render() {
    dom.line.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === " ") {
        dom.line.appendChild(KB.el("span", "ch space", "&nbsp;"));
      } else {
        const s = KB.el("span", "ch", ch);
        s.style.color = KB.COLORS[i % KB.COLORS.length];
        dom.line.appendChild(s);
      }
    }
    dom.line.appendChild(KB.el("span", "caret", ""));
    dom.count.textContent = text.length ? text.length + " letter" + (text.length === 1 ? "" : "s") : "";
  }

  /* the last run of letters — that is the word to look up */
  function lastWord() {
    const parts = text.trim().split(/\s+/);
    return parts.length ? parts[parts.length - 1] : "";
  }

  function readItOut() {
    if (!text.trim()) {
      dom.hint.textContent = "Type some letters first, then press Enter.";
      KB.speak("Type some letters first.");
      return;
    }
    settled = true;
    const word = lastWord();
    const pic = KB.pictureFor(word);

    if (pic) {
      dom.picture.textContent = pic;
      dom.picture.classList.add("pop");
      dom.hint.textContent = "Yes! That spells " + word + ".";
      KB.sfx.great();
      KB.cheer(true);
      KB.speak(word.toLowerCase() + "! You spelled " + word.toLowerCase() + ".");
      const seen = KB.state.spelled || {};
      seen[word] = true;
      KB.state.spelled = seen;
      KB.save();
      dom.found.textContent = Object.keys(seen).length
        ? "⭐ words you have spelled: " + Object.keys(seen).length
        : "";
    } else {
      dom.picture.textContent = "🔤";
      dom.picture.classList.remove("pop");
      dom.hint.textContent = "I read it out — that one is not a word I know. " +
                             "Use ⌫ Backspace to change a letter and try again.";
      KB.sfx.pop();
      KB.speak(text.trim().toLowerCase());
    }
  }

  function clearPicture() {
    if (!settled) return;
    settled = false;
    dom.picture.textContent = "";
    dom.picture.classList.remove("pop");
    dom.hint.textContent = "";
  }

  KB.ui.register({
    id: "write",
    icon: "⌨️",
    label: "Magic Writing",

    start(stage) {
      text = "";
      settled = false;
      KB.ui.hideHands();
      KB.ui.backButton(null);
      stage.innerHTML = "";

      dom = {
        picture: KB.el("div", "write-picture"),
        line:    KB.el("div", "write-line"),
        count:   KB.el("div", "write-count"),
        hint:    KB.el("div", "note"),
        found:   KB.el("div", "write-found"),
        keys:    KB.el("div", "cmd-help")
      };

      dom.keys.innerHTML =
        '<span class="cmd"><b>letters</b> write</span>' +
        '<span class="cmd"><b>space</b> gap</span>' +
        '<span class="cmd"><b>Backspace</b> rub out one letter</span>' +
        '<span class="cmd go"><b>Enter</b> read it out loud</span>';

      const seen = KB.state.spelled || {};
      dom.found.textContent = Object.keys(seen).length
        ? "⭐ words you have spelled: " + Object.keys(seen).length
        : "";

      stage.append(dom.picture, dom.line, dom.count, dom.hint, dom.found, dom.keys);
      render();
      KB.speak("Write anything you like. Press enter and I will read it out.");
    },

    stop() { text = ""; },

    onKey(k) {
      if (k === "ENTER") { readItOut(); return; }

      if (k === "BACK") {
        if (!text.length) {
          dom.hint.textContent = "Nothing to rub out yet.";
          return;
        }
        clearPicture();
        text = text.slice(0, -1);
        KB.sfx.pop();
        render();
        return;
      }

      if (k === "SPACE" || /^[A-Z0-9]$/.test(k)) {
        if (text.length >= MAX) {
          dom.hint.textContent = "That is a long one! Press Enter to hear it.";
          return;
        }
        clearPicture();
        text += (k === "SPACE" ? " " : k);
        KB.sfx.tick();
        render();
      }
    },

    /* holding a letter down should repeat, like a real text box */
    onRepeat(k) {
      if (k === "BACK" && text.length) {
        clearPicture();
        text = text.slice(0, -1);
        render();
      }
    }
  });

})(window.KB);
