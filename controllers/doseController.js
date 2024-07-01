const Dose = require("../models/dose");
const Regimen = require("../models/regimen");

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all Doses.
exports.dose_list = asyncHandler(async (req, res, next) => {
  // collect all doses
  const allDoses = await Dose.find({}).sort({ time: 1 }).exec();

  res.render("doses", {
    title: "Dose List",
    dose_list: allDoses,
  });
});

// Display detail page for a specific Condition.
exports.dose_detail = asyncHandler(async (req, res, next) => {
  const dose = await Dose.findById(req.params.id).exec();

  res.render("dose_detail", {
    title: dose._id,
    dose: dose,
  });
});

// Display Condition create form on GET.
exports.dose_create_get = async (req, res, next) => {
  res.render("dose_form", {
    title: "Create Dose",
    dose: undefined, // ejs seems to need all variables to be defined
    errors: undefined,
  });
};

// Handle Condition create on POST.
exports.dose_create_post = [
  // Validate and sanitize the name field.
  body("time", "Time must have at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("quantity", "Quantity must be a number").isNumeric().escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a condition object with the sanitized and validated data
    const dose = new Dose({
      time: req.body.time,
      quantity: req.body.quantity,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.

      console.log("errors", errors);

      res.render("dose_form", {
        title: "Create Dose",
        dose: dose,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Decided not to do checks on whether already exists
      await dose.save();
      res.redirect(dose.url);
    }
  }),
];

// Display Dose delete form on GET.
exports.dose_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of dose
  // Also get all regimens with this dose
  const [dose, allRegimensWithDose] = await Promise.all([
    Dose.findById(req.params.id).exec(),
    Regimen.find({ doses: req.params.id }).exec(),
  ]);

  if (dose === null) res.redirect("/catalog/doses");

  res.render("dose_delete", {
    title: "Delete Dose",
    dose: dose,
    dose_Regiments: allRegimensWithDose,
  });
});

// Handle Condition delete on POST.
exports.dose_delete_post = asyncHandler(async (req, res, next) => {
  const [dose, allRegimensWithDose] = await Promise.all([
    Dose.findById(req.params.id).exec(),
    Regimen.find({ doses: req.params.id }).exec(),
  ]);

  if (allRegimensWithDose.length > 0) {
    // Regimens exist with this dose.
    res.render("dose_delete", {
      title: "Delete Dose",
      dose: dose,
      dose_Regiments: allRegimensWithDose,
    });
    return;
  } else {
    // Dose has no dependent regimens. Delete object and redirect to the list of doses.
    // note doseid received from dose_delete form, hidden input
    await Dose.findByIdAndDelete(req.body.doseid);
    res.redirect("/medications/doses");
  }
});

// Display Dose update form on GET.
exports.dose_update_get = asyncHandler(async (req, res, next) => {
  // Get dose for form.
  const dose = await Dose.findById(req.params.id).exec();

  if (dose === null) {
    // No results.
    const err = new Error("Dose not found");
    err.status = 404;
    return next(err);
  }

  res.render("dose_form", {
    title: "Update Dose",
    dose: dose,
    errors: undefined,
  });
});

// Handle Condition update on POST.
exports.dose_update_post = [
  // Validate and sanitize fields.
  body("time", "Time must have at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("quantity", "Quantity must be a number").isNumeric().escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Dose object with escaped/trimmed data and old id.
    const dose = new Dose({
      time: req.body.time,
      quantity: req.body.quantity,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("dose_form", {
        title: "Update Dose",
        dose: dose,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedDose = await Dose.findByIdAndUpdate(req.params.id, dose, {});
      // Redirect to dose detail page.
      res.redirect(updatedDose.url);
    }
  }),
];
