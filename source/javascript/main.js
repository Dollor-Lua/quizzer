import QuizInstance from "./quizzer.js";

const quizQuestion = document.getElementById("quiz-question");
const streakElem = document.getElementById("streak");

const quizzer = new QuizInstance();
globalThis.quiz = quizzer;

const options = [document.getElementById("quiz-option-1"), document.getElementById("quiz-option-2"), document.getElementById("quiz-option-3"), document.getElementById("quiz-option-4")];
let wrongLock = false;
let streak = 0;

function checkAnswer(answer) {
    if (wrongLock) return;

    if (quizzer.currentQuestion[answer].answer == quizzer.currentQuestion[quizzer.currentQuestion.answer].answer)
        streak++;
    else {
        streak = 0;
        wrongLock = true;
        options[answer].classList.add("wrong");
        options[quizzer.currentQuestion.answer].classList.add("correct");
        setTimeout(() => {
            document.addEventListener("click", () => {
                console.log("click");
                nextQuestion(quizzer.nextQuestion());
                streakElem.innerText = streak;
                wrongLock = false;
            }, { once: true });
        }, 250);
        return;
    }

    streakElem.innerText = streak;
    nextQuestion(quizzer.nextQuestion());
}

function nextQuestion(question) {
    const font = Math.floor(Math.random() * 3);
    quizQuestion.innerText = question[question.answer].answer;
    quizQuestion.classList.remove("font-0", "font-1", "font-2");
    quizQuestion.classList.add(`font-${font}`);
    for (let i = 0; i < 4; i++) {
        options[i].innerText = question[i].question;
        options[i].classList.remove("font-0", "font-1", "font-2");
        options[i].classList.add(`font-${font}`);
    }
    options.forEach(opt => opt.classList.remove("correct", "wrong"));
}

const seed = "37-59-21-20-4";
quizzer.preload(seed);
quizzer.loadQuiz("jlptN5verbs-fx", 5).then((seed) => {
    console.log(seed);
    nextQuestion(quizzer.nextQuestion());
});

for (let i = 0; i < 4; i++)
    options[i].addEventListener("click", () => checkAnswer(i));