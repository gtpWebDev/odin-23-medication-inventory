const Patient = require("../models/patient");
const asyncHandler = require("express-async-handler");

// Display list of all Regimens.
exports.patient_list = asyncHandler(async (req, res, next) => {
  // collect all patients
  const allPatients = await Patient.find(
    {},
    "first_name family_name date_of_birth"
  )
    .sort({ family_name: 1 })
    .exec();

  res.render("patients", {
    title: "Patient List",
    patient_list: allPatients,
  });
});

// Display detail page for a specific Regimen.
exports.patient_detail = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id)
    .populate("conditions")
    .exec();

  res.render("patient_detail", {
    title: "Patient: " + patient.name,
    patient: patient,
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
