const Prescription = require("../models/prescription");
const asyncHandler = require("express-async-handler");

// Display list of all Medications.
exports.prescription_list = asyncHandler(async (req, res, next) => {
  // collect all prescriptions
  const allPrescriptions = await Prescription.find({})
    .populate("patient")
    .populate("medication")
    .populate("regimen")
    .exec();

  res.render("prescriptions", {
    title: "Prescriptions List",
    prescription_list: allPrescriptions,
  });
});

// Display detail page for a specific prescription.
exports.prescription_detail = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate("patient")
    .populate("medication")
    .populate("regimen")
    .exec();

  console.log("prescription", prescription);

  res.render("prescription_detail", {
    title: "Prescription: " + prescription._id,
    prescription: prescription,
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
