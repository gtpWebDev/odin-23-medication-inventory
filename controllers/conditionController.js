const Condition = require("../models/condition");
const asyncHandler = require("express-async-handler");

// Display list of all Conditions.
exports.condition_list = asyncHandler(async (req, res, next) => {
  // collect all conditions, returning condition and detail fields
  const allConditions = await Condition.find({}, "condition")
    .sort({ condition: 1 })
    .exec();

  res.render("conditions", {
    title: "Condition List",
    condition_list: allConditions,
  });
});

// Display detail page for a specific Condition.
exports.condition_detail = asyncHandler(async (req, res, next) => {
  const condition = await Condition.findById(req.params.id).exec();

  res.render("condition_detail", {
    title: condition.condition,
    condition: condition,
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
