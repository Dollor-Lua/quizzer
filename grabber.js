const fs = require("node:fs")
const axios = require("axios")
const cheerio = require("cheerio")

const url = "https://jlptsensei.com/jlpt-n5-verbs-vocabulary-list/page/"
const task = []
const result = []

try {
    for (let currentPage = 1; currentPage <= 2; currentPage++) {
        task.push(new Promise((resolve) => {
            axios.get(url + currentPage).then((res) => {
                const $ = cheerio.load(res.data)

                const promises = []
                $("tr.jl-row").each(function (_, jlRow) {
                    promises.push(new Promise((res) => {
                        const $$ = cheerio.load(jlRow)

                        setTimeout(() => {
                            result.push({
                                kana: $$("td.jl-td-vr > a > p").text() || undefined,
                                kanaWithKanji: $$("td.jl-td-v > a").text() || undefined,
                                romaji: $$("td.jl-td-vr > a").contents().filter(function () {
                                    return this.type === "text"
                                }).text() || undefined,
                                meaning: $$("td.jl-td-vm").text() || undefined
                            })

                            res();
                        }, 10);
                    }));
                });

                Promise.all(promises).then(() => {
                    resolve();
                });
            })
        }))
    }
} catch (e) {
    console.error(e)
}

console.log("Grabbing the vocab")
console.time("Time taken: ")

Promise.all(task).then(() => {
    fs.writeFileSync("jlptN5.json", JSON.stringify(result))
    console.log("Done!")
    console.timeEnd("Time taken: ")
})