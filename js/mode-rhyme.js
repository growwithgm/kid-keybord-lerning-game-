/* ============================================================
   mode-rhyme.js — "Rhymes"

   Word families: the ending stays put and only the first letter
   changes. CAT, BAT, HAT, RAT. This is the usual next rung
   after three-letter words — hearing that they rhyme is as much
   the lesson as typing them.
   ============================================================ */
(function (KB) {
  "use strict";

  KB.makeDrill({
    id: "rhyme",
    icon: "🐱",
    label: "Rhymes",
    color: "#06d6a0",
    title: "Rhymes 🐱",
    lead: "The ending stays the same — only the first letter changes!",

    levels: KB.FAMILIES.map(fam => ({
      id: "fam" + fam.ending,
      icon: "·" + fam.ending.toLowerCase(),
      name: "-" + fam.ending,
      blurb: fam.words.slice(0, 3).map(w => w[0]).join(" · "),
      banner: 'they all end in <b>' + fam.ending + "</b>",
      need: 3,
      dot: "🐱",
      ending: fam.ending,
      items: () => fam.words
    })),

    say(word, level) {
      return word.toLowerCase() + ". It ends in " +
             level.ending.split("").join(" ") + ", like all of them.";
    },

    cheer(word, level) {
      return word.toLowerCase() + "! That rhymes.";
    }
  });

})(window.KB);
