const Scraper = require("../scraper");

const sourceUrls = [
  [
    "https://www.freetimelearning.com/online-quiz/react-js-quiz.php",
    1,
    "../scrapedData/freeTimeLearning/reactJs.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/java-quiz.php",
    7,
    "../scrapedData/freeTimeLearning/java.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/node-js-quiz.php",
    1,
    "../scrapedData/freeTimeLearning/nodeJs.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/sql-quiz.php",
    1,
    "../scrapedData/freeTimeLearning/sql.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/html-quiz.php",
    6,
    "../scrapedData/freeTimeLearning/html.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/css-quiz.php",
    5,
    "../scrapedData/freeTimeLearning/css.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/javascript-quiz.php",
    5,
    "../scrapedData/freeTimeLearning/javascript.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/bootstrap-quiz.php",
    5,
    "../scrapedData/freeTimeLearning/bootstrap.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/materialize-css-quiz.php",
    3,
    "../scrapedData/freeTimeLearning/materializeCSS.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/jquery-quiz.php",
    5,
    "../scrapedData/freeTimeLearning/jquery.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/ajax-quiz.php",
    3,
    "../scrapedData/freeTimeLearning/ajax.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/angularjs-quiz.php",
    6,
    "../scrapedData/freeTimeLearning/angularJs.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/c-language-quiz.php",
    7,
    "../scrapedData/freeTimeLearning/cLanguage.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/php-quiz.php",
    8,
    "../scrapedData/freeTimeLearning/php.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/python-quiz.php",
    6,
    "../scrapedData/freeTimeLearning/python.json",
  ],
  [
    "https://www.freetimelearning.com/online-quiz/angular-quiz.php",
    1,
    "../scrapedData/freeTimeLearning/angular.json",
  ],
];

sourceUrls.forEach(([url, sections, saveFileTo], ind) => {
  scrapeFreeTimeLearning(url, sections).then((questions) => {
    Scraper.saveFile(saveFileTo, JSON.stringify({ questions }));
  });
});

async function scrapeFreeTimeLearning(url, sections) {
  try {
    const questionsInCategory = [];
    for (let i = 0; i < sections; i++) {
      let sectionUrl = i ? createSectionUrl(url, i + 1) : url;
      const questionsInSection = await scrapeSection(sectionUrl);
      questionsInCategory.push(...questionsInSection);
    }
    return questionsInCategory;
  } catch (err) {
    console.log("scrape free time learning ", err);
  }
}

async function scrapeSection(url) {
  try {
    const pages = await getPages(url);
    console.log(pages);
    const questionsInSection = [];
    for (let i = 1; i <= pages.length; i++) {
      const questionsInPage = await scrapePage(`${url}?page=${i}`);
      questionsInSection.push(...questionsInPage);
    }
    return questionsInSection;
  } catch (err) {
    console.log(`scrape section: ${url}`, err);
  }
}

async function scrapePage(url) {
  try {
    const scraper = new Scraper(undefined, url);
    const htmlStr = await scraper.fetchHtml();
    const document = scraper.createDOM(htmlStr);
    const contentCont = [
      ...document.querySelector("form").children[0].children[0].children,
    ];
    const questionsInPage = [];
    for (let i = 1; i < contentCont.length - 5; i += 3) {
      const question = { type: "MCQ", source: url };
      question.statement = Scraper.html2Markdown(
        contentCont[i].querySelector(".quiz-que-margin")
      );
      const optionsCont = contentCont[i + 1].querySelectorAll(
        ".quiz-ans-margin"
      );
      const correctOption = contentCont[i + 1].querySelector(".ans-text-color");
      const allOptions = [];
      for (let i = 0; i < optionsCont.length; i++) {
        let singleOption = {};
        singleOption.text = Scraper.html2Markdown(optionsCont[i]);
        singleOption.correct = isCorrect(i, correctOption);
        allOptions.push(singleOption);
      }
      question.options = allOptions;
      questionsInPage.push(question);
    }
    return questionsInPage;
  } catch (err) {
    console.log("scrapePage ", err);
  }
}

function createSectionUrl(input, i) {
  input = input.split("/");
  const section = input[4].split(".")[0] + `-section-${i}.php`;
  input.splice(4, 1, section);
  return input.join("/");
}

function isCorrect(index, correctOption) {
  correctOption = correctOption.textContent[8];
  const alphaIndex = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
  };
  return index === alphaIndex[correctOption];
}

async function getPages(url) {
  try {
    const scraper = new Scraper(undefined, url);
    const htmlStr = await scraper.fetchHtml();
    const document = scraper.createDOM(htmlStr);
    return [...document.querySelector(".pagination").children];
  } catch (err) {
    console.log("getPages: ", err);
  }
}
