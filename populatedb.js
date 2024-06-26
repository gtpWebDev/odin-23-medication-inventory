#! /usr/bin/env node

console.log(
  'This script populates some test data. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line - in this case the database url
const userArgs = process.argv.slice(2);

const Condition = require("./models/condition");

const conditions = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createConditions();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function createConditions() {
  console.log("Adding conditions");
  await Promise.all([
    conditionCreate(0, "Thick Blood", "Thick blood can lead to strokes"),
    conditionCreate(1, "High Cholesterol", "Cholesterol that is high"),
  ]);
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function conditionCreate(index, conditionName, detail) {
  const condition = new Condition({ condition: conditionName, detail: detail });
  await condition.save();
  conditions[index] = condition;
  console.log(`Added condition: ${condition}`);
}
