const Condition = require("../models/condition");
const Regimen = require("../models/regimen");
const Patient = require("../models/patient");

const asyncHandler = require("express-async-handler");

// Display list of all Authors.
exports.index = asyncHandler(async (req, res, next) => {
  const [numConditions, numRegimens, numPatients] = await Promise.all([
    Condition.countDocuments({}).exec(),
    Regimen.countDocuments({}).exec(),
    Patient.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Medication Inventory",
    condition_count: numConditions,
    regimen_count: numRegimens,
    patient_count: numPatients,
  });
});
