const Condition = require("../models/condition");
const Dose = require("../models/dose");
const Regimen = require("../models/regimen");
const Patient = require("../models/patient");
const Medication = require("../models/medication");
const Prescription = require("../models/prescription");

const asyncHandler = require("express-async-handler");

// Display list of all Authors.
exports.index = asyncHandler(async (req, res, next) => {
  const [
    numConditions,
    numDoses,
    numRegimens,
    numPatients,
    numMedications,
    numPrescriptions,
  ] = await Promise.all([
    Condition.countDocuments({}).exec(),
    Dose.countDocuments({}).exec(),
    Regimen.countDocuments({}).exec(),
    Patient.countDocuments({}).exec(),
    Medication.countDocuments({}).exec(),
    Prescription.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Medication Inventory",
    condition_count: numConditions,
    dose_count: numDoses,
    regimen_count: numRegimens,
    patient_count: numPatients,
    medication_count: numMedications,
    prescription_count: numPrescriptions,
  });
});
