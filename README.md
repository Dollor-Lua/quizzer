# Quizzer

Simple quiz webapp with a focus on Japanese and learning kanji vocab

Lessons page is located at localhost:3000/lessons\*, and quiz page is located at localhost:3000

Read below on how to add your own quiz/lessons or how to change between quizes

\*The lesson input has a built in Japanese Kana IME, meaning you do not need a japanese keyboard to type kana

![Lessons Page](https://github.com/Dollor-Lua/quizzer/blob/main/assets/screenshot.png?raw=true)

Originally starting as a test to see if I could remake a quiz app in javascript with as few lines (spoilers: not with server code), I continued onto this by adding the /lessons page as a remake of another paid app. I believe everyone should have the ability to educate themselves for free, and good sources of education should always be available. This app is in no way complete, and doesn't contain all JLPT vocab (in fact, currently it is only N5 _kanji_ vocab), and if you happen to know of the paid app it has around 1300 lessons, all for a one time fee of $10.99 (The app is named Kanji! on the apple app store)

## Installation & Setup

- [node](https://nodejs.org/)
- npm ([yarn](https://yarnpkg.com/getting-started/install) or [pnpm](https://pnpm.io/installation) preferrably)

Clone this repository into the directory of your choice and navigate to it

Inside a command prompt (within this directory) run whichever matches your package manager:

```bash
$ npm install # if you are using npm
$ yarn # if you are using yarn
$ pnpm i # if you are using pnpm
```

This will download the necessary packages to run the project

You can now serve the project onto localhost:3000 (127.0.0.1:3000) by running the following:

```bash
$ npm run start # if you are using npm
$ yarn start # if you are using yarn
$ pnpm start # if you are using pnpm
```

NOTE: the start command in package.json uses npm as the command internally to run other script steps

Navigate to localhost:3000 for the quiz or localhost:3000/lessons for the lessons page

## Adding, Modifying, or Switching Quizes

First, I would recommend getting an understanding of the format for a quiz. All quizes are located in source/sets. If you look at either hiragana.json or katakana.json, the basic format for a quiz is a dictionary in which you write the questions as `"question": "answer"`. This is the simplist form. Do note that the quiz module automatically inverts these at random, meaning the question becomes the answer and vice-versa.

If you look at jlptN5verbs-fx.json, you will notice a different format. It follows the format of `"question": [ "step 2", "step 1" ]`, where it takes a two step approach, first asking for the answer that corresponds to step 1, then the answer that corresponds to step 2 (in the jlptN5verbs-fx.json case, step 1 is the kana and step 2 is the definition). Note that the quiz module will NOT invert these, as the inversion would be ambiguous.

Once you have created your own set, make sure its in the sets folder.

To change the selected set, open source/javascript/main.js and scroll to the bottom, changing the filename (without the extension) inside the loadQuiz function. You can also specify the maximum number of questions it will quiz you on. You may also notice the seed property above, which is helpful if you have the a max question count set, to make sure you get the same questions next time. When you load the page, the seed will be automatically logged into the devtools console, which you can copy and paste into the script for next time.

## Adding and Modifying Lessons

I highly recommend leaving pre-existing lessons alone.

To add onto the lesson groups already provided, modify the All.json file. A lesson group follows the format:

```json
{
  "name": "Example Group Name" /* ex: JLPT N5 Kanji */,
  "lessons": "nameOfLessonData.json" /* ex: N5Kanji.json */
}
```

Note: the lesson data file name is relative to the source/sets/lessons/ path.

You can then add a json file, name of your choice (make sure it matches the lessons value) and populate it with lessons:

```json
[
  {
    "kanji": "一",
    "kana": "いち",
    "meaning": "one"
  },
  {
    "kanji": "二",
    "kana": "に",
    "meaning": "two"
  },
  {
    "kanji": "三",
    "kana": "さん",
    "meaning": "three"
  },
  {
    "kanji": "四",
    "kana": "よん",
    "meaning": "four"
  }
]
```

NOTE: The lesson system is set up for JAPANESE, kanji in specific. The lessons always have a kana typing section.

NOTE 2: I highly recommend doing only 4 kanji/words per lesson, but the system supports groups of 2 if you wish to do more.

As long as the lesson group is specified in All.json, it will automatically be added to the /lessons page.

## License

Copyright 2024 Dollor-Lua (starlitnova)
This code is licensed under the MIT license, view LICENSE.txt for more information.
