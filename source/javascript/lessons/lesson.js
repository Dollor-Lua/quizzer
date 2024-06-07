import * as SRS from "./srs.js";
import * as Data from "./data.js";

const lViewDiv = document.getElementById("lesson-view");

const toReview = document.getElementById("due-for-review");

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

    let wrongAnswers = 0;
    return new Promise((resolve) => {
        for (let i = 0; i < 4; i++) {
            multipleChoice[i].classList.remove("wrong");
            multipleChoice[i].addEventListener("click", () => {
                if (i != options.indexOf(answer)) {
                    multipleChoice[i].classList.add("wrong");
                    wrongAnswers++;
                    return;
                }

                for (let j = 0; j < 4; j++)
                    multipleChoice[j].removeEventListener("click", () => { });
                lOptionDiv.classList.add("hidden");
                resolve(wrongAnswers);
            }, { once: true });
        }
    });
}

function areAnswersMatching(correct, answer) {
    correct = correct.trim();
    answer = answer.trim();
    if (correct == answer) return true;

    if (correct.indexOf(",") != -1 || answer.indexOf(",") != -1) {
        const corrects = correct.split(",");
        for (let i = 0; i < corrects.length; i++) {
            corrects[i] = corrects[i].trim();
        }

        const answers = answer.split(",");
        for (let i = 0; i < answers.length; i++) {
            answers[i] = answers[i].trim();
        }

        for (let i = 0; i < corrects.length; i++) {
            for (let j = 0; j < answers.length; j++) {
                if (areAnswersMatching(corrects[i], answers[j])) return true;
            }
        }

        return false;
    }

    correct = correct.replace(/\(.*\)/g, "").trim();
    answer = answer.replace(/\(.*\)/g, "").trim();
    if (correct == answer) return true;

    // replace all written numbers with digits
    const numbers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    for (let i = 0; i < numbers.length; i++) {
        correct = correct.replace(numbers[i], i + 1);
        answer = answer.replace(numbers[i], i + 1);
    }

    const correctA = correct.replace("'", " ");
    const answerA = answer.replace("'", " ");
    if (correctA == answerA) return true;

    const correctB = correct.replace("'", "");
    const answerB = answer.replace("'", "");
    if (correctB == answerB) return true;

    return correct == answer;
}

globalThis.areAnswersMatching = areAnswersMatching;

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

    let wrongAnswers = 0;
    return new Promise((resolve) => {
        lSubmit.addEventListener("click", () => {
            if (areAnswersMatching(lInput.value, answer)) {
                lSubmit.removeEventListener("click", () => { });
                lInput.removeEventListener("keydown", () => { });
                lTextboxDiv.classList.add("hidden");
                resolve(Math.pow(wrongAnswers, 0.33));
            }

            wrongAnswers++;
        });

        lInput.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                if (areAnswersMatching(lInput.value, answer)) {
                    lSubmit.removeEventListener("click", () => { });
                    lInput.removeEventListener("keydown", () => { });
                    lTextboxDiv.classList.add("hidden");
                    resolve(Math.pow(wrongAnswers, 0.33));
                }

                wrongAnswers++;
            }
        });
    });
}

function easeFactorToColor(easeFactor) {
    if (easeFactor == -1) return "rgb(255, 255, 255)";

    const normalizedEaseFactor = Math.max(0, Math.min(1, (easeFactor - 1) / 13));

    let red, green;
    if (normalizedEaseFactor < 0.5) {
        red = 255;
        green = Math.floor(normalizedEaseFactor * 2 * 255);
    } else {
        red = Math.floor((1 - normalizedEaseFactor) * 2 * 255);
        green = 255;
    }

    return `rgb(${red}, ${green}, 0)`;
}

function reloadReviewData() {
    const due = SRS.getReviewWords(globalThis.userData.reviewHistory);
    const total = SRS.getSuperReview(globalThis.userData.reviewHistory).length;
    toReview.innerText = `You have ${due.length} words to review (of ${total} total words)`;

    const allWords = document.querySelectorAll(".lesson-words span");

    for (const word of allWords) {
        word.style = "color: " + easeFactorToColor(Data.getLastReviewData(word.innerText)?.easeFactor ?? -1) + ";";
    }
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

window.startLesson = async (lessonData, group, lesson) => {
    if (inLesson) return;
    inLesson = true;

    lViewDiv.classList.add("hidden");
    mLessonDiv.classList.remove("hidden");

    const bank = buildBank(window.lessonGroups, group, lesson);
    const kanaBank = bank.map((word) => word.kana);
    const meaningBank = bank.map((word) => word.meaning);

    let wrong = {};

    for (let i = 0; i < lessonData.length; i += 2) {
        const word1 = lessonData[i];
        const word2 = lessonData[i + 1];
        wrong[word1.kanji] = 0;
        wrong[word2.kanji] = 0;

        await memorize(word1.kanji, word1.kana, word1.meaning);
        await memorize(word2.kanji, word2.kana, word2.meaning);

        wrong[word1.kanji] += await startMultipleChoice(word1.kanji, "", word1.kana, kanaBank);
        wrong[word1.kanji] += await startMultipleChoice(word1.kanji, word1.kana, word1.meaning, meaningBank);

        wrong[word2.kanji] += await startMultipleChoice(word2.kanji, "", word2.kana, kanaBank);
        wrong[word2.kanji] += await startMultipleChoice(word2.kanji, word2.kana, word2.meaning, meaningBank);
    }

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[i];
        wrong[word.kanji] += await input(word.kanji, "", "kana", word.kana);
    }

    const order = Array.from({ length: lessonData.length }, (_, i) => i);
    order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[order[i]];
        wrong[word.kanji] += await startMultipleChoice(word.kanji, "", word.kana, kanaBank);
        wrong[word.kanji] += await startMultipleChoice(word.kanji, word.kana, word.meaning, meaningBank);
    }

    order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[order[i]];
        wrong[word.kanji] += await input(word.kanji, "", "kana", word.kana);
    }

    order.sort(() => Math.random() - 0.5);

    for (let i = 0; i < lessonData.length; i++) {
        const word = lessonData[order[i]];
        wrong[word.kanji] += await input(word.kanji, word.kana, "meaning", word.meaning);
    }

    mLessonDiv.classList.add("hidden");
    lViewDiv.classList.remove("hidden");

    const reviewData = [];

    for (const word of lessonData) {
        // 9 correct since thats how many questions they went through
        reviewData.push({ word: word.kanji, wrong: wrong[word.kanji], correct: 9 });
    }

    await Data.reviewed(reviewData);

    reloadReviewData();

    inLesson = false;
}

window.startReviewSession = async () => {
    if (inLesson) return;
    inLesson = true;

    lViewDiv.classList.add("hidden");
    mLessonDiv.classList.remove("hidden");

    let words = SRS.getReviewWords(globalThis.userData.reviewHistory);
    let inSuperReview = false;

    if (words.length == 0) {
        words = SRS.getSuperReview(globalThis.userData.reviewHistory);
        inSuperReview = true;
    }

    if (words.length == 0) {
        lViewDiv.classList.remove("hidden");
        mLessonDiv.classList.add("hidden");
        return;
    }

    let highestGroup = 0;
    let highestLesson = 0;

    for (const word of words) {
        for (let i = 0; i <= group && i < data.length; i++) {
            for (let j = 0; j <= lesson && j < data[i].lessons.length; j++) {
                for (const jword of data[i].lessons[j]) {
                    if (jword.kanji == word && i > highestGroup) {
                        highestGroup = i;
                        highestLesson = 0;
                    }

                    if (jword.kanji == word && j > highestLesson) {
                        highestLesson = j;
                    }
                }
            }
        }
    }

    const lesson = [];

    for (const word of words) {
        for (let i = 0; i <= group && i < data.length; i++) {
            for (let j = 0; j <= lesson && j < data[i].lessons.length; j++) {
                for (const jword of data[i].lessons[j]) {
                    if (jword.kanji == word) {
                        lesson.push(jword);
                    }
                }
            }
        }
    }

    const bank = buildBank(window.lessonGroups, highestGroup, highestLesson);
    const kanaBank = bank.map((word) => word.kana);
    const meaningBank = bank.map((word) => word.meaning);

    const wordData = {};

    const retryMultiple = [];
    const retryInput = [];

    for (const word of lesson) {
        wordData[word.kanji] = { wrong: 0, correct: 0 };

        wordData[word.kanji].wrong += await startMultipleChoice(word.kanji, "", word.kana, kanaBank);
        wordData[word.kanji].wrong += await startMultipleChoice(word.kanji, word.kana, word.meaning, meaningBank);
        wordData[word.kanji].correct += 2;

        if (wordData[word.kanji].wrong > 0) {
            retryMultiple.push(word);
        }
    }

    for (let i = lesson.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * i);
        [lesson[i], lesson[j]] = [lesson[j], lesson[i]];
    }

    for (const word of lesson) {
        const preWrong = wordData[word.kanji].wrong;
        wordData[word.kanji].wrong += await input(word.kanji, "", "kana", word.kana);
        wordData[word.kanji].correct += 1;

        if (wordData[word.kanji].wrong > preWrong) {
            retryInput.push(word);
        }
    }

    for (const word of lesson) {
        const preWrong = wordData[word.kanji].wrong;
        wordData[word.kanji].wrong += await startMultipleChoice(word.kanji, "", word.kana, kanaBank);
        wordData[word.kanji].wrong += await startMultipleChoice(word.kanji, word.kana, word.meaning, meaningBank);
        wordData[word.kanji].correct += 2;
        if (wordData[word.kanji].wrong > preWrong) {
            retryMultiple.push(word);
        }
    }

    for (let i = lesson.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * i);
        [lesson[i], lesson[j]] = [lesson[j], lesson[i]];
    }

    for (const word of lesson) {
        const preWrong = wordData[word.kanji].wrong;
        wordData[word.kanji].wrong += await input(word.kanji, word.kana, "meaning", word.meaning);
        wordData[word.kanji].correct += 1;
        if (wordData[word.kanji].wrong > preWrong) {
            retryInput.push(word);
        }
    }

    for (const word of retryMultiple) {
        wordData[word.kanji].wrong += await startMultipleChoice(word.kanji, "", word.kana, kanaBank);
        wordData[word.kanji].wrong += await startMultipleChoice(word.kanji, word.kana, word.meaning, meaningBank);
        wordData[word.kanji].correct += 2;
    }

    for (const word of retryInput) {
        wordData[word.kanji].wrong += await input(word.kanji, "", "kana", word.kana);
        wordData[word.kanji].wrong += await input(word.kanji, word.kana, "meaning", word.meaning);
        wordData[word.kanji].correct += 2;
    }

    lViewDiv.classList.remove("hidden");
    mLessonDiv.classList.add("hidden");

    if (!inSuperReview) {
        const reviewData = [];
        for (const word in wordData) {
            reviewData.push({ word: word, wrong: wordData[word].wrong, correct: wordData[word].correct });
        }

        await Data.reviewed(reviewData);

        reloadReviewData();
    }

    inLesson = false;
}

async function main() {
    await Data.init();
    reloadReviewData();

    document.getElementById("start-review").onclick = window.startReviewSession;
}

main();