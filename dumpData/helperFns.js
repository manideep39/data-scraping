const mongoose = require("mongoose");
require("dotenv").config();

const Topic = require("../resources/models/Topic.js");

mongoose.connect(process.env.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

async function dumpData(filter, update) {
  try {
    const doc = await Topic.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
      },
      (err, doc) => {
        if (err) return console.log(`Error ${err}`);
        console.log(doc);
        db.close();
      }
    );
  } catch (err) {
    console.log(`Error ${err}`);
  }
}

function createNewTopicDocument(language, data) {
  const doc = new Topic({
    name: language,
    icon: " ",
    questions: [...data],
  });
  doc.save((err, doc) => {
    if (err) return console.error(err);
    console.log(`Success ${language}`);
    db.close();
  });
}

module.exports = { dumpData, createNewTopicDocument };
