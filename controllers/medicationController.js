const Medication = require("../models/medication");
const asyncHandler = require("express-async-handler");

// Display list of all Medications.
exports.medication_list = asyncHandler(async (req, res, next) => {
  // collect all medications
  const allMedications = await Medication.find({}, "name dose alias quantity")
    .sort({ name: 1 })
    .exec();

  res.render("medications", {
    title: "Medications List",
    medication_list: allMedications,
  });
});

// Display detail page for a specific medication.
exports.medication_detail = asyncHandler(async (req, res, next) => {
  const medication = await Medication.findById(req.params.id)
    .populate("conditions")
    .exec();

  console.log("medication", medication);

  res.render("medication_detail", {
    title: "Medication: " + medication.name,
    medication: medication,
  });
});

/*
// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create GET");
});

// Handle Author create on POST.
exports.author_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create POST");
});

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});
*/
