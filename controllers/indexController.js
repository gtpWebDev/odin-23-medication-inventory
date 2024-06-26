const Condition = require("../models/condition");

const asyncHandler = require("express-async-handler");

// Display list of all Authors.
exports.index = asyncHandler(async (req, res, next) => {
  const [numConditions] = await Promise.all([
    Condition.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Medication Inventory",
    condition_count: numConditions,
  });
});
