var fs = require("fs");
var pinyin = require("pinyin");

class CharBuilder {
  constructor(inputFile, outputFile) {
    this.inputFile = inputFile;
    this.outputFile = outputFile;
    this.chars = {};
    this.count = 0;
    this.soundCount = 0;
  }

  addCharsByPinYin() {
    const chars = this.readFile(this.inputFile);
    this.chars = chars.reduce((h, char) => {
      const py = pinyin(char, { style: pinyin.STYLE_NORMAL })[0];
      if (py) {
        if (!h[py]) {
          h[py] = [];
        }
        h[py].push(char);
      }
      return h;
    }, {});
  }

  filterCharsByFile(inputFile, params = { filterType: "identify" }) {
    const filterChars = this.readFile(inputFile);
    this.chars = Object.entries(this.chars).reduce((h, [py, charItems]) => {
      if (params.filterType === "identify") {
        h[py] = charItems.map((char) => {
          if (filterChars.indexOf(char) < 0) {
            return `${char}*`;
          }
          return char;
        });
        return h;
      } else {
        h[py] = charItems.filter((char) => {
          if (params.filterType === "include") {
            return filterChars.indexOf(char) > -1;
          } else if (params.filterType === "exclude") {
            return filterChars.indexOf(char) < 0;
          }
        });
        return h;
      }
    }, {});
  }

  addStatistics() {
    Object.entries(this.chars).forEach(([py, charItems]) => {
      this.soundCount += 1;
      this.count += charItems.length;
    });
  }

  addToneToChars() {
    this.chars = Object.entries(this.chars).reduce((h, [py, charItems]) => {
      h[py] = charItems.map((char) => {
        const pyTone = pinyin(char, { style: pinyin.STYLE_TONE2 })[0];
        const pyToneNumber = pyTone.toString().slice(-1);
        return `${pyToneNumber}${char}`;
      });
      return h;
    }, {});
  }

  dumpSortedCharsToFile() {
    const charactersToFile = Object.entries(this.chars)
      .map(([k, v]) => {
        let sortedChars = v.sort((a, b) => a[0] - b[0]);

        return [`${k}(${sortedChars.length})`, ...sortedChars];
      })
      .filter((item) => item.length > 1)
      .sort((a, b) => b.length - a.length)
      .map((item) => item.join(", "));

    const metadata = [
      `soundCount ${this.soundCount}`,
      `char count ${this.count}`,
    ];
    const totalData = [...metadata, ...charactersToFile].join("\n");
    fs.writeFileSync(`./${this.outputFile}`, totalData, (err) => {
      // In case of a error throw err.
      if (err) throw err;
    });
  }
  readFile(fileName) {
    var data = fs.readFileSync(`./${fileName}`, "utf8");
    return data.split("\n");
  }
}

let cb = new CharBuilder("characters.txt", "output_characters_all.txt");
cb.addCharsByPinYin();
cb.filterCharsByFile("characters_sound.txt", { filterType: "identify" });
cb.addStatistics();
cb.addToneToChars();
cb.dumpSortedCharsToFile();

cb = new CharBuilder("characters.txt", "output_characters_sound.txt");
cb.addCharsByPinYin();
cb.filterCharsByFile("characters_sound.txt", { filterType: "include" });
cb.addStatistics();
cb.addToneToChars();
cb.dumpSortedCharsToFile();

cb = new CharBuilder("characters.txt", "output_characters_glyph.txt");
cb.addCharsByPinYin();
cb.filterCharsByFile("characters_sound.txt", { filterType: "exclude" });
cb.addStatistics();
cb.addToneToChars();
cb.dumpSortedCharsToFile();

cb = new CharBuilder("characters.txt", "two_output_characters_all.txt");
cb.addCharsByPinYin();
cb.filterCharsByFile("characters_sound.txt", { filterType: "identify" });
cb.addStatistics();
cb.addToneToChars();
cb.dumpSortedCharsToFile();

cb = new CharBuilder("characters_two.txt", "two_output_characters_sound.txt");
cb.addCharsByPinYin();
cb.filterCharsByFile("characters_sound.txt", { filterType: "include" });
cb.addStatistics();
cb.addToneToChars();
cb.dumpSortedCharsToFile();

cb = new CharBuilder("characters_two.txt", "two_output_characters_glyph.txt");
cb.addCharsByPinYin();
cb.filterCharsByFile("characters_sound.txt", { filterType: "exclude" });
cb.addStatistics();
cb.addToneToChars();
cb.dumpSortedCharsToFile();
