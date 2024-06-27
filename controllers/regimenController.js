const Regimen = require("../models/regimen");
const asyncHandler = require("express-async-handler");

// Display list of all Regimens.
exports.regimen_list = asyncHandler(async (req, res, next) => {
  // collect all conditions, returning condition and detail fields
  const allRegimens = await Regimen.find({}, "summary")
    .sort({ summary: 1 })
    .exec();

  res.render("regimens", {
    title: "Regimen List",
    regimen_list: allRegimens,
  });
});

// Display detail page for a specific Regimen.
exports.regimen_detail = asyncHandler(async (req, res, next) => {
  const regimen = await Regimen.findById(req.params.id).exec();

  console.log("regimen", regimen);

  res.render("regimen_detail", {
    title: "Regimen: " + regimen.summary,
    regimen: regimen,
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
