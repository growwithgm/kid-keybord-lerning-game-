/* ============================================================
   mode-tricky.js — "Tricky Words"

   The little words that turn up everywhere and cannot be
   sounded out: the, my, you, she. They have to be recognised
   rather than worked out, so the game simply shows one, says
   it, and she copies it. The last level puts one in front of a
   word she already knows, so it is seen in a real phrase.
   ============================================================ */
(function (KB) {
  "use strict";

  const noPicture = list => list.map(w => [w, ""]);

  KB.makeDrill({
    id: "tricky",
    icon: "🪄",
    label: "Tricky Words",
    color: "#8b5cf6",
    title: "Tricky Words 🪄",
    lead: "These little words cannot be sounded out — you just remember them!",

    levels: [
      {
        id: "t1", icon: "🌱", name: "easy ones", blurb: "MY · GO · WE",
        banner: "just remember these!", need: 3, dot: "⭐",
        items: () => noPicture(KB.TRICKY_EASY)
      },
      {
        id: "t2", icon: "🌟", name: "harder ones", blurb: "THE · SHE · YOU",
        banner: "just remember these!", need: 3, dot: "⭐",
        items: () => noPicture(KB.TRICKY_HARD)
      },
      {
        id: "t3", icon: "💬", name: "two words", blurb: "MY CAT · THE SUN",
        banner: "a tricky word and a word you know", need: 3, dot: "⭐",
        items: () => KB.TRICKY_PHRASES
      }
    ],

    say(word) {
      return word.indexOf(" ") === -1
        ? word.toLowerCase() + ". Just remember it: " + word.split("").join(" ") + "."
        : word.toLowerCase() + ". Do not forget the space bar.";
    },

    cheer(word) { return word.toLowerCase() + "!"; }
  });

})(window.KB);
