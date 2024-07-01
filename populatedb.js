#! /usr/bin/env node

console.log(
  'This script populates some test data. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line - in this case the database url
const userArgs = process.argv.slice(2);

const Condition = require("./models/condition");
const Regimen = require("./models/regimen");
const Patient = require("./models/patient");
const Medication = require("./models/medication");
const Prescription = require("./models/prescription");
const Dose = require("./models/dose");

// used to generate link arrays
const conditions = [];
const regimens = [];
const medications = [];
const patients = [];
const prescriptions = [];
const doses = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");

  // delete collections if they exist
  await deleteCollection("patients");
  await deleteCollection("conditions");
  await deleteCollection("medications");
  await deleteCollection("regimens");
  await deleteCollection("prescriptions");
  await deleteCollection("doses");

  await createConditions();
  await createDoses();
  await createRegimens();
  await createPatients();
  await createMedications();
  await createPrescriptions();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function deleteCollection(collectionName) {
  const collections = await mongoose.connection.db
    .listCollections({ name: collectionName })
    .toArray();
  if (collections.length > 0) {
    // Drop the collection
    await mongoose.connection.db.dropCollection(collectionName);
    console.log(`Collection '${collectionName}' deleted successfully.`);
  }
}

async function createConditions() {
  console.log("Adding conditions");
  await Promise.all([
    conditionCreate(0, "Thick Blood", "Thick blood can lead to strokes"),
    conditionCreate(1, "High Cholesterol", "Cholesterol that is high"),
    conditionCreate(
      2,
      "High Blood Pressure",
      "Can lead to heart disease, etc."
    ),
    conditionCreate(3, "Water retention", "Retention of water"),
    conditionCreate(
      4,
      "Underactive thyroid",
      "Uncontrolled energy levels and growth"
    ),
    conditionCreate(
      5,
      "Blood sugar moderation",
      "Avoid hypoglycemia and hyperglycemia"
    ),
    conditionCreate(
      6,
      "Eye inflammation",
      "Reduce imflammation on the surface of the eye"
    ),
    conditionCreate(7, "Inflammation", "Post operation inflammation"),
  ]);
}

// We pass the index to the ...Create functions so that, for example,
// condition[0] will always be the same condition, regardless of the order
// in which the elements of promise.all's argument complete.
async function conditionCreate(index, name, detail) {
  const condition = new Condition({ name: name, detail: detail });
  await condition.save();
  conditions[index] = condition;
}

async function createDoses() {
  console.log("Adding doses");
  await Promise.all([doseCreate(0, "08:00 am", 1)]);
  await Promise.all([doseCreate(1, "10:00 am", 1)]);
  await Promise.all([doseCreate(2, "13:00 pm", 1)]);
  await Promise.all([doseCreate(3, "19:00 pm", 1)]);
  await Promise.all([doseCreate(4, "22:00 pm", 1)]);
}

// Note, the index is used to control links between entities when constructing the data.
async function doseCreate(index, time, quantity) {
  const dose = new Dose({ time, quantity });
  await dose.save();
  doses[index] = dose;
}

async function createRegimens() {
  console.log("Adding regimens");
  await Promise.all([
    regimenCreate(0, "1 per day pre-breakfast", [doses[0]]),
    regimenCreate(1, "1 per day post-breakfast", [doses[1]]),
    regimenCreate(2, "1 per day lunch-time", [doses[2]]),
    regimenCreate(3, "1 per day dinner-time", [doses[3]]),
    regimenCreate(4, "1 per day bed-time", [doses[4]]),
    regimenCreate(5, "3 per day meal times", [doses[0], doses[2], doses[3]]),
    regimenCreate(6, "2 per day post-breakfast and supper", [
      doses[1],
      doses[4],
    ]),
  ]);
}

async function regimenCreate(index, regimenSummary, regimenDoseArray) {
  const regimen = new Regimen({
    summary: regimenSummary,
    doses: regimenDoseArray,
  });
  await regimen.save();
  regimens[index] = regimen;
  // console.log(`Added regimen: ${regimen}`);
}

async function createPatients() {
  console.log("Adding patients");
  await Promise.all([
    // monthIndex used, 0 = January
    patientCreate(0, "Mum", "Pearson", new Date("1944-03-04"), [
      conditions[0],
      conditions[1],
      conditions[2],
      conditions[3],
      conditions[4],
      conditions[5],
      conditions[6],
    ]),
    patientCreate(1, "Glen", "Pearson", new Date("1973-04-05"), [
      conditions[7],
    ]),
  ]);
}

async function patientCreate(
  index,
  firstName,
  familyName,
  dob,
  conditionArray
) {
  const patient = new Patient({
    first_name: firstName,
    family_name: familyName,
    date_of_birth: dob,
  });
  if (conditions != false) patient.conditions = conditionArray;
  await patient.save();
  patients[index] = patient;
  // console.log(`Added patient: ${patient}`);
}

async function createMedications() {
  console.log("Adding medications");
  await Promise.all([
    medicationCreate(0, "Amlodipine 10mg", "", [conditions[2]]),
    medicationCreate(1, "Levothyroxine 50mg", "", [conditions[4]]),
    medicationCreate(2, "Clopidogrel 75mg", "", [conditions[0]]),
    medicationCreate(3, "Spironolactone 25mg", "", [conditions[3]]),
    medicationCreate(4, "Propranalol 10mg", "", [conditions[2]]),
    medicationCreate(5, "Ramipril 5mg", "", [conditions[2]]),
    medicationCreate(6, "Doxazosin 4mg", "Doxy", [conditions[2]]),
    medicationCreate(7, "Simvastatin 20mg", "", [conditions[1]]),
    medicationCreate(8, "Ibuprofen 500mg", "", [conditions[7]]),
  ]);
}

async function medicationCreate(index, name, alias, conditionArray) {
  const medication = new Medication({
    name: name,
    alias: alias,
  });
  if (conditions != false) medication.conditions = conditionArray;
  await medication.save();
  medications[index] = medication;
  // console.log(`Added medication: ${medication}`);
}

async function createPrescriptions() {
  console.log("Adding prescriptions");
  await Promise.all([
    prescriptionCreate(
      0,
      patients[0],
      medications[0],
      regimens[0],
      new Date("2024-06-30"),
      78,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[0],
      medications[1],
      regimens[0],
      new Date("2024-06-30"),
      46,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[0],
      medications[2],
      regimens[1],
      new Date("2024-06-30"),
      58,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[0],
      medications[3],
      regimens[1],
      new Date("2024-06-30"),
      79,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[0],
      medications[4],
      regimens[1],
      new Date("2024-06-30"),
      27,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[0],
      medications[5],
      regimens[6],
      new Date("2024-06-30"),
      75,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[0],
      medications[6],
      regimens[4],
      new Date("2024-06-30"),
      36,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[0],
      medications[7],
      regimens[4],
      new Date("2024-06-30"),
      44,
      "Active"
    ),
    prescriptionCreate(
      0,
      patients[1],
      medications[8],
      regimens[5],
      new Date("2024-06-30"),
      10,
      "Active"
    ),
  ]);
}

async function prescriptionCreate(
  index,
  patient,
  medication,
  regimen,
  inventoryUpdateDate,
  inventoryUpdateQuantityEOD,
  status
) {
  const prescription = new Prescription({
    patient: patient,
    medication: medication,
    regimen: regimen,
    inventory_update_date: inventoryUpdateDate,
    inventory_update_quantity_endofday: inventoryUpdateQuantityEOD,
    status: status,
  });
  await prescription.save();
  prescriptions[index] = prescription;
  // console.log(`Added prescription: ${prescription}`);
}
