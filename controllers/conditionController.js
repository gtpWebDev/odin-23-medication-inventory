const Condition = require("../models/condition");
const Patient = require("../models/patient");
const Medication = require("../models/medication");

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all Conditions.
exports.condition_list = asyncHandler(async (req, res, next) => {
  // collect all conditions, returning condition and detail fields
  const allConditions = await Condition.find({}, "name")
    .sort({ name: 1 })
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
    title: condition.name,
    condition: condition,
  });
});

// Display Condition create form on GET.
exports.condition_create_get = async (req, res, next) => {
  res.render("condition_form", {
    title: "Create Condition",
    condition: undefined, // ejs seems to need all variables to be defined?
    errors: undefined,
  });
};

// Handle Condition create on POST.
exports.condition_create_post = [
  // Validate and sanitize the name field.
  body("name", "Condition name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("detail", "Condition detail must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a condition object with the sanitized and validated data
    const condition = new Condition({
      name: req.body.name,
      detail: req.body.detail,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.

      console.log("errors", errors);

      res.render("condition_form", {
        title: "Create Condition",
        condition: condition,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Condition with same name already exists.
      const conditionExists = await Condition.findOne({
        condition: req.body.name,
      })
        .collation({ locale: "en", strength: 2 }) // basically case insensitive
        .exec();
      if (conditionExists) {
        // Condition exists, redirect to its detail page.
        res.redirect(conditionExists.url);
      } else {
        await condition.save();
        // New condition saved. Redirect to condition detail page.
        res.redirect(condition.url);
      }
    }
  }),
];

// Display Condition delete form on GET.
exports.condition_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of condition
  // Also get all patients with this condition, and all medications used for this condition
  const [condition, allPatientsWithCondition, allMedicationsForCondition] =
    await Promise.all([
      Condition.findById(req.params.id).exec(),
      Patient.find({ conditions: req.params.id }).exec(),
      Medication.find({ conditions: req.params.id }).exec(),
    ]);

  if (condition === null) {
    // No results.
    res.redirect("/catalog/conditions");
  }

  // console.log("condition", condition);
  // console.log("condition_patients", allPatientsWithCondition);
  // console.log("condition_medications", allMedicationsForCondition);

  res.render("condition_delete", {
    title: "Delete Condition",
    condition: condition,
    condition_patients: allPatientsWithCondition,
    condition_medications: allMedicationsForCondition,
  });
});

// Handle Condition delete on POST.
// This carries out the delete
exports.condition_delete_post = asyncHandler(async (req, res, next) => {
  const [condition, allPatientsWithCondition, allMedicationsForCondition] =
    await Promise.all([
      Condition.findById(req.params.id).exec(),
      Patient.find({ conditions: req.params.id }).exec(),
      Medication.find({ conditions: req.params.id }).exec(),
    ]);

  if (
    allPatientsWithCondition.length > 0 ||
    allMedicationsForCondition.length > 0
  ) {
    // Patients exist with this condition, or medications exist which are used for this condition. Render in same way as for GET route.
    res.render("condition_delete", {
      title: "Delete Condition",
      condition: condition,
      condition_patients: allPatientsWithCondition,
      condition_medications: allMedicationsForCondition,
    });
    return;
  } else {
    // Condition has no dependent patients or medications. Delete object and redirect to the list of authors.
    // note conditionid received from condition_delete form, hidden input
    await Condition.findByIdAndDelete(req.body.conditionid);
    res.redirect("/medications/conditions");
  }
});

// Display Condition update form on GET.
exports.condition_update_get = asyncHandler(async (req, res, next) => {
  // Get condition for form.
  const condition = await Condition.findById(req.params.id).exec();

  if (condition === null) {
    // No results.
    const err = new Error("Condition not found");
    err.status = 404;
    return next(err);
  }

  res.render("condition_form", {
    title: "Update Condition",
    condition: condition,
    errors: undefined,
  });
});

// Handle Condition update on POST.
exports.condition_update_post = [
  // Validate and sanitize fields.
  body("name", "Condition name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("detail", "Detail must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Condition object with escaped/trimmed data and old id.
    const condition = new Condition({
      name: req.body.name,
      detail: req.body.detail,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("condition_form", {
        title: "Update Condition",
        condition: condition,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedCondition = await Condition.findByIdAndUpdate(
        req.params.id,
        condition,
        {}
      );
      // Redirect to condition detail page.
      res.redirect(updatedCondition.url);
    }
  }),
];
