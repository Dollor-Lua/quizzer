const lViewDiv = document.getElementById("lesson-view");

const mLessonDiv = document.getElementById("main-lesson");
const lHeader = document.getElementById("lesson-header");
const lQuestion = document.getElementById("lesson-question");
const lSmallText = document.getElementById("lesson-small-text");

const lOptionDiv = document.getElementById("lesson-options");
const multipleChoice = [document.getElementById("lesson-option-1"), document.getElementById("lesson-option-2"), document.getElementById("lesson-option-3"), document.getElementById("lesson-option-4")];

const lTextboxDiv = document.getElementById("lesson-textbox");
const lInput = document.getElementById("lesson-textbox-input");
const lSubmit = document.getElementById("lesson-textbox-submit");

const lMemorizeDiv = document.getElementById("lesson-memorize");
const lMemorizeText = document.getElementById("lesson-memorize-meaning");
const lMemorizeButton = document.getElementById("lesson-memorize-button");

(async () => { globalThis.userData = await (await fetch("/lesson")).json(); reloadStyles() })();

let inLesson = false;

function memorize(word, kana, meaning) {
    lHeader.innerText = "Memorize this word...";
    lQuestion.innerText = word;
    lSmallText.innerText = kana;
    lMemorizeText.innerText = meaning;
    lMemorizeDiv.classList.remove("hidden");

    return new Promise((resolve) => {
        lMemorizeButton.addEventListener("click", () => {
            lMemorizeDiv.classList.add("hidden");
            resolve();
        }, { once: true });
    });
}

function startMultipleChoice(word, smallText, answer, bank) {
    lHeader.innerText = "Which of these is...";
    lQuestion.innerText = word;
    lSmallText.innerText = smallText;
    lOptionDiv.classList.remove("hidden");

    const options = bank.slice();
    options.sort(() => Math.random() - 0.5);
    options.length = 4;
    if (!options.includes(answer)) {
        options[Math.floor(Math.random() * 4)] = answer;
    }

    for (let i = 0; i < 4; i++) {
        multipleChoice[i].innerText = options[i];
    }

    return new Promise((resolve) => {
        for (let i = 0; i < 4; i++) {
            multipleChoice[i].classList.remove("wrong");
            multipleChoice[i].addEventListener("click", () => {
                if (i != options.indexOf(answer)) {
                    multipleChoice[i].classList.add("wrong");
                    return;
                }

                for (let j = 0; j < 4; j++)
                    multipleChoice[j].removeEventListener("click", () => { });
                lOptionDiv.classList.add("hidden");
                resolve(i == options.indexOf(answer));
            }, { once: true });
        }
    });
}

function input(word, smallText, request, answer) {
    lHeader.innerText = "Type the " + request + "...";
    lQuestion.innerText = word;
    lSmallText.innerText = smallText;
    lTextboxDiv.classList.remove("hidden");

    if (request == "kana") {
        lInput.setAttribute("placeholder", "Kana");
        try {
            wanakana.bind(lInput);
        } catch (_) {
            // discard
        }
    } else {
        lInput.setAttribute("placeholder", "Meaning");
        try {
            wanakana.unbind(lInput);
        } catch (_) {
            // discard
        }
    }

    lInput.value = "";
    lInput.focus();

    return new Promise((resolve) => {
        lSubmit.addEventListener("click", () => {
            if (lInput.value == answer) {
                lSubmit.removeEventListener("click", () => { });
                lInput.removeEventListener("keydown", () => { });
                lTextboxDiv.classList.add("hidden");
                resolve(lInput.value == answer);
            }
        });

        lInput.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                if (lInput.value == answer) {
                    lSubmit.removeEventListener("click", () => { });
                    lInput.removeEventListener("keydown", () => { });
                    lTextboxDiv.classList.add("hidden");
                    resolve(lInput.value == answer);
                }
            }
        });
    });
}

function buildBank(data, group, lesson) {
    const bank = [];
    for (let i = 0; i <= group && i < data.length; i++) {
        for (let j = 0; j <= lesson && j < data[i].lessons.length; j++) {
            bank.push(...data[i].lessons[j]);
        }
    }

    return bank;
}

function reloadStyles() {
    for (const h2 of document.getElementsByClassName("lesson-name")) {
        h2.classList.remove("completion-1", "completion-2");
    }

    for (const [key, value] of Object.entries(globalThis.userData)) {
        for (const [key2, value2] of Object.entries(value)) {
            const h2 = document.getElementById("h-g-" + key + "-" + key2);
            if (!h2) continue;

            if (value2 == 1) {
                h2.classList.add("completion-1");
            } else if (value2 > 1) {
                h2.classList.add("completion-2");
            }
        }
    }
}

window.startLesson = async (lessonData, group, lesson) => {
    if (inLesson) return;
    inLesson = true;

    lViewDiv.classList.add("hidden");
    mLessonDiv.classList.remove("hidden");

    const bank = buildBank(window.lessonGroups, group, lesson);
    const kanaBank = bank.map((word) => word.kana);
    const meaningBank = bank.map((word) => word.meaning);

    for (let i = 0; i < lessonData.length; i += 2) {
        const word1 = lessonData[i];
        const word2 = lessonData[i + 1];
        await memorize(word1.kanji, word1.kana, word1.meaning);
        await memorize(word2.kanji, word2.kana, word2.meaning);

        await startMultipleChoice(word1.kanji, "", word1.kana, kanaBank);
        await startMultipleChoice(word1.kanji, word1.kana, word1.meaning, meaningBank);

        await startMultipleChoice(word2.kanji, "", word2.kana, kanaBank);
        await startMultipleChoice(word2.kanji, word2.kana, word2.meaning, meaningBank);
    }

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[i];
        await input(word.kanji, "", "kana", word.kana);
    }

    const order = Array.from({ length: lessonData.length }, (_, i) => i);
    order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[order[i]];
        await startMultipleChoice(word.kanji, "", word.kana, kanaBank);
        await startMultipleChoice(word.kanji, word.kana, word.meaning, meaningBank);
    }

    order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[order[i]];
        await input(word.kanji, "", "kana", word.kana);
    }

    order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[order[i]];
        await input(word.kanji, word.kana, "meaning", word.meaning);
    }

    mLessonDiv.classList.add("hidden");
    lViewDiv.classList.remove("hidden");

    fetch("/lesson", {
        method: "POST",
        body: JSON.stringify({ group: group, lesson: lesson }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!globalThis.userData[group]) {
        globalThis.userData[group] = {};
    }

    if (!globalThis.userData[group][lesson]) {
        globalThis.userData[group][lesson] = 0;
    }

    globalThis.userData[group][lesson]++;

    inLesson = false;
}

