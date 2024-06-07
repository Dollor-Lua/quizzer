if (!globalThis.userData) {
    globalThis.userData = {};
}

async function init() {
    globalThis.userData = await (await fetch("/data")).json();
    if (!globalThis.userData.reviewHistory) globalThis.userData.reviewHistory = [];
    if (!globalThis.userData.allWords) globalThis.userData.allWords = {};
}

function getLastReviewData(word) {
    for (const session of globalThis.userData.reviewHistory) {
        if (session.words[word]) {
            return session.words[word];
        }
    }

    return null;
}

/**
 * Adds history for a review session
 * @param {[ { "word": string, "wrong": number, "correct": number } ]} data 
 * @returns 
 */
async function reviewed(data) {
    const session = {
        lastReview: Date.now(),
        words: {}
    };

    for (const { word, wrong, correct } of data) {
        const history = getLastReviewData(word);
        const oldEaseFactor = history ? history.easeFactor : 2;
        const lapses = Math.max(0, Math.min(5, wrong - correct * 0.5));

        const quality = correct / (correct + wrong);

        const easeFactor = Math.max(0, oldEaseFactor * (1 - (lapses * 0.02) + (lapses === 0) * quality));

        session.words[word] = {
            wrong: wrong,
            correct: correct,
            lapses: lapses,
            easeFactor: easeFactor
        }

        globalThis.userData.allWords[word] = easeFactor;
    }

    globalThis.userData.reviewHistory.unshift(session);

    await fetch("/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(globalThis.userData)
    });
}

export { init, getLastReviewData, reviewed };