/* ============================================================
   mode-sounds.js — "Two Letters"

   sh, ch, th and ng: two letters that make one sound. In the
   usual phonics order these come straight after three-letter
   words, so they are the next thing worth typing.
   ============================================================ */
(function (KB) {
  "use strict";

  KB.makeDrill({
    id: "sounds",
    icon: "🚢",
    label: "Two Letters",
    color: "#118ab2",
    title: "Two Letters, One Sound 🚢",
    lead: "Some sounds need <b>two</b> letters together.",

    levels: KB.DIGRAPHS.map(d => ({
      id: "dig" + d.pair,
      icon: d.words[0][1],
      name: d.pair,
      blurb: 'says "' + d.says + '"',
      banner: "<b>" + d.pair + "</b> says &ldquo;" + d.says + "&rdquo;",
      need: 3,
      dot: "🔊",
      pair: d.pair,
      says: d.says,
      items: () => d.words
    })),

    say(word, level) {
      return word.toLowerCase() + ". " +
             level.pair.split("").join(" ") + " says " + level.says + ".";
    },

    cheer(word) { return word.toLowerCase() + "!"; }
  });

})(window.KB);
