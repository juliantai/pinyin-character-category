var fs = require("fs");
var pinyin = require("pinyin");
var fileName = "characters";
// fileName = "characters_two";
try {
  var data = fs.readFileSync(`./${fileName}.txt`, "utf8");
  const chars = data.split("\n");

  const charsByPy = chars.reduce((h, char) => {
    const py = pinyin(char, { style: pinyin.STYLE_NORMAL })[0];
    const pyTone = pinyin(char, { style: pinyin.STYLE_TONE2 })[0];
    if (py) {
      if (!h[py]) h[py] = [];
      const pyToneNumber = pyTone.toString().slice(-1);
      h[py].push(`${pyToneNumber}${char}`);
    }
    return h;
  }, {});

  console.log(Object.keys(charsByPy).length);

  const charactersToFile = Object.entries(charsByPy)
    .map(([k, v]) => {
      return [k, ...v.sort((a, b) => a[0] - b[0])];
    })
    .sort((a, b) => b.length - a.length)
    .map((item) => item.join(", "));

  const metadata = [`total sound count ${Object.keys(charsByPy).length}`];
  const totalData = [...metadata, ...charactersToFile].join("\n");
  fs.writeFileSync(`./${fileName}_output.txt`, totalData, (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
} catch (e) {
  console.log("Error:", e.stack);
}
