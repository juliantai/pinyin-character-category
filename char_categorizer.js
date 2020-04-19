var fs = require("fs");
var pinyin = require("pinyin");

function charFilter(fileName) {
  var data = fs.readFileSync(`./${fileName}`, "utf8");
  return data.split("\n");
}

function charBuilder(fileName, outputFileName, filterFileName) {
  try {
    var data = fs.readFileSync(`./${fileName}`, "utf8");
    const chars = data.split("\n");

    let filterChars;
    let soundCount = 0;
    let count = 0;
    if (filterFileName) {
      filterChars = charFilter(filterFileName);
    }

    const charsByPy = chars.reduce((h, char) => {
      const py = pinyin(char, { style: pinyin.STYLE_NORMAL })[0];
      const pyTone = pinyin(char, { style: pinyin.STYLE_TONE2 })[0];
      if (py) {
        if (!h[py]) {
          h[py] = [];
        }
        const pyToneNumber = pyTone.toString().slice(-1);
        if (!filterChars || filterChars.indexOf(char) > -1) {
          count += 1;
          h[py].push(`${pyToneNumber}${char}`);
          if (h[py].length === 1) soundCount += 1;
        }
      }
      return h;
    }, {});

    const charactersToFile = Object.entries(charsByPy)
      .map(([k, v]) => {
        let sortedChars = v.sort((a, b) => a[0] - b[0]);

        return [`${k}(${sortedChars.length})`, ...sortedChars];
      })
      .sort((a, b) => b.length - a.length)
      .map((item) => item.join(", "));

    const metadata = [`soundCount ${soundCount}`, `char count ${count}`];
    const totalData = [...metadata, ...charactersToFile].join("\n");
    fs.writeFileSync(`./${outputFileName}`, totalData, (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  } catch (e) {
    console.log("Error:", e.stack);
  }
}

charBuilder("characters.txt", "output_characters.txt");
charBuilder("characters_two.txt", "output_characters_two.txt");

charBuilder(
  "characters.txt",
  "output_characters_sound.txt",
  "characters_sound.txt"
);
charBuilder(
  "characters_two.txt",
  "output_characters_sound_two.txt",
  "characters_sound.txt"
);
