const fs = require("node:fs");

function format(json) {
    let res = "";

    res += "return {\n";
    for (let i = 0; i < json.length; i++) {
        res += `    ["${json[i].kanaWithKanji}"] = { "${json[i].meaning}", "${json[i].kana ?? json[i].kanaWithKanji}" },\n`;
    }
    res = res.slice(0, -2);
    res += "\n}";

    return res;
}

function format2(json) {
    let res = "";
    res += "{\n";
    for (let i = 0; i < json.length; i++) {
        res += `    "${json[i].kanaWithKanji}": [ "${json[i].meaning}", "${json[i].kana ?? json[i].kanaWithKanji}" ],\n`;
    }
    res = res.slice(0, -2);
    res += "\n}";

    return res;
}

const fileName = "jlptN5verbs";
fs.readFile(`${fileName}.json`, "utf8", (err, data) => {
    if (err) throw err;
    const parsed = JSON.parse(data);
    const formatted = format(parsed);
    fs.writeFile(`${fileName}.lua`, formatted, (err) => {
        if (err) throw err;
    });

    const formatted2 = format2(parsed);
    fs.writeFile(`${fileName}-fx.json`, formatted2, (err) => {
        if (err) throw err;
    });
});