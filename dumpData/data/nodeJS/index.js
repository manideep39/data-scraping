let freeTimeLearning = require("./freeTimeLearning.json").questions;

freeTimeLearning = freeTimeLearning.map((question) => ({
  ...question,
  source: "https://www.freetimelearning.com",
}));

module.exports = freeTimeLearning;
