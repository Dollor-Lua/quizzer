function xoshiro128ss(a, b, c, d) {
    return function () {
        let t = b << 9, r = b * 5;
        r = (r << 7 | r >>> 25) * 9;
        c ^= a;
        d ^= b;
        b ^= c;
        a ^= d;
        c ^= t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}

const seedgen = () => (Math.random() * 2 ** 32) >>> 0;

class QuizInstance {
    quiz = null;
    template = null;
    pool = null;
    currentQuestion = null;
    quizName = "";
    step = undefined;
    seeds = "";

    preload(seedStr) {
        this.seeds = seedStr;
    }

    async loadQuiz(quizName, size = -1, redo = false) {
        if (redo) {
            this.quiz = [...this.template];
            return;
        }

        const quizReq = await fetch(`/set?set=${(this.quizName = quizName)}`);
        if (quizReq.status != 200)
            return console.warn("Failed to load quiz");

        const quizData = await quizReq.json();
        let quizTbl = Object.entries(quizData).map(([key, value]) => ({ question: key, answer: value }));
        this.pool = [...quizTbl];

        if (this.seeds != "") {
            const qzTblSeeded = [];
            const seedArr = this.seeds.split("-");
            for (let i = 0; i < seedArr.length; i++) {
                if (seedArr[i] == "" || isNaN(seedArr[i]) || parseInt(seedArr[i]) >= quizTbl.length) continue;
                qzTblSeeded.push(quizTbl[parseInt(seedArr[i])]);
            }
            quizTbl = qzTblSeeded;
            this.template = [...quizTbl];
            this.quiz = quizTbl;

            return this.seeds;
        }

        for (let i = 0; i < quizTbl.length; i++) {
            quizTbl[i].idx = i;
        }

        const getRand = xoshiro128ss(seedgen(), seedgen(), seedgen(), seedgen());

        for (let i = quizTbl.length; i >= 2; i--) {
            const j = Math.floor(getRand() * i);
            [quizTbl[i - 1], quizTbl[j]] = [quizTbl[j], quizTbl[i - 1]];
        }

        if (size > 0)
            quizTbl.splice(size);

        this.template = [...quizTbl];
        this.quiz = quizTbl;

        let seed = "";
        for (let i = 0; i < quizTbl.length; i++) {
            seed += quizTbl[i].idx + "-";
        }

        return seed.slice(0, -1);
    }

    nextQuestion() {
        let question = {};

        if (this.step === 0 && this.currentQuestion) {
            const answer = this.currentQuestion.original;
            question.answer = Math.floor(Math.random() * 4);
            this.step = undefined;

            for (let i = 0; i < 4; i++) {
                if (i == question.answer) {
                    question[i] = { question: answer.answer[0], answer: `Define\n${answer.question}` };
                } else {
                    let b = Math.floor(Math.random() * this.pool.length);
                    question[i] = { question: this.pool[b].answer[0], answer: this.pool[b].question };
                }
            }

            this.currentQuestion = question;
            return question;
        }

        if (this.quiz.length <= 1)
            this.loadQuiz(this.quizName, -1, true);

        let a = Math.floor(Math.random() * this.quiz.length), answer = this.quiz[a];
        question.answer = Math.floor(Math.random() * 4);
        this.quiz.splice(a, 1);

        if (typeof answer.answer == "string") {
            this.step = undefined;

            const willFlip = Math.random() >= 0.5;
            for (let i = 0; i < 4; i++) {
                if (i == question.answer) {
                    question[i] = answer;
                } else {
                    let b = Math.floor(Math.random() * this.pool.length);
                    question[i] = this.pool[b];
                }

                if (willFlip)
                    question[i] = { question: question[i].answer, answer: question[i].question };
            }
        } else {
            question.original = answer;
            this.step = 0;

            for (let i = 0; i < 4; i++) {
                if (i == question.answer) {
                    question[i] = { question: answer.answer[1], answer: `Pronounce\n${answer.question}` };
                } else {
                    let b = Math.floor(Math.random() * this.pool.length);
                    question[i] = { question: this.pool[b].answer[1], answer: this.pool[b].question };
                }
            }
        }

        this.currentQuestion = question;
        return question;
    }
}

export default QuizInstance;