function getReviewWords(history) {
    const words = [];

    for (const session of history) {
        for (const word in session.words) {
            if (!words.includes(word)) {
                const lastReview = session.lastReview;
                const daysSinceLastReview = (Date.now() - lastReview) / 1000 / 60 / 60 / 24;
                const reviewInterval = Math.floor(word.easeFactor * 1000 * 60 * 60 * 24);

                if (daysSinceLastReview >= reviewInterval)
                    words.push(word);
            }
        }
    }

    return words
}

function getSuperReview(history) {
    const superReview = [];

    for (const session of history) {
        for (const word in session.words) {
            if (!superReview.includes(word)) {
                superReview.push(word);
            }
        }
    }

    return superReview;
}

export { getReviewWords, getSuperReview };