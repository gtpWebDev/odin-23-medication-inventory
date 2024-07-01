const Regimen = require("../models/regimen");
const Prescription = require("../models/prescription");
const Dose = require("../models/dose");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

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
  const regimen = await Regimen.findById(req.params.id)
    .populate("doses")
    .exec();

  res.render("regimen_detail", {
    title: "Regimen: " + regimen.summary,
    regimen: regimen,
  });
});

// Display Regimen create form on GET.
exports.regimen_create_get = asyncHandler(async (req, res, next) => {
  // Get all doses, needed when creating our regimen.
  const allDoses = await Dose.find().sort({ time: 1 }).exec();

  res.render("regimen_form", {
    title: "Create Regimen",
    doses: allDoses,
    regimen: undefined,
    errors: undefined,
  });
});

// Handle Regimen create on POST.
exports.regimen_create_post = [
  // If no doses have been chosen for the regimen, replace undefined with empty array
  (req, res, next) => {
    if (!Array.isArray(req.body.doses)) {
      req.body.doses =
        typeof req.body.doses === "undefined" ? [] : [req.body.doses];
    }
    next();
  },

  // Validate and sanitize fields.
  body("summary", "Summary must have at least 3 characters.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // Process request after validation and sanitization.
  body("doses.*").escape(), // sanitize all the array elements

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Regimen object with escaped and trimmed data.
    const regimen = new Regimen({
      summary: req.body.summary,
      doses: req.body.doses,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all doses for form.
      const allDoses = await Dose.find().sort({ time: 1 }).exec();

      // Mark our selected conditions as checked.
      for (const dose of allDoses) {
        if (regimen.doses.includes(dose._id)) {
          dose.checked = "true";
        }
      }
      res.render("regimen_form", {
        title: "Create Regimen",
        doses: allDoses,
        regimen: regimen,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save medication.
      await regimen.save();
      res.redirect(regimen.url);
    }
  }),
];

// Display Regimen delete form on GET.
exports.regimen_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of regimen
  // Also get all prescriptions with this regimen
  const [regimen, allPrescriptionsWithRegimen] = await Promise.all([
    Regimen.findById(req.params.id).exec(),
    Prescription.find({ regimen: req.params.id })
      .populate("patient")
      .populate("medication")
      .populate("regimen")
      .exec(),
  ]);

  if (regimen === null) res.redirect("/medications/regimens");

  res.render("regimen_delete", {
    title: "Delete Regimen",
    regimen: regimen,
    regimen_prescriptions: allPrescriptionsWithRegimen,
  });
});

// Handle Regimen delete on POST.
exports.regimen_delete_post = asyncHandler(async (req, res, next) => {
  const [regimen, allPrescriptionsWithRegimen] = await Promise.all([
    Regimen.findById(req.params.id).exec(),
    Prescription.find({ regimen: req.params.id })
      .populate("patient")
      .populate("medication")
      .populate("regimen")
      .exec(),
  ]);

  if (allPrescriptionsWithRegimen.length > 0) {
    // Prescription exists with this regimen
    res.render("regimen_delete", {
      title: "Delete Regimen",
      regimen: regimen,
      regimen_prescriptions: allPrescriptionsWithRegimen,
    });
    return;
  } else {
    // Regimen has no dependent prescription. Delete object and redirect to the list of meds
    // note medicationid received from medication_delete form, hidden input
    await Regimen.findByIdAndDelete(req.body.regimenid);
    res.redirect("/medications/regimens");
  }
});

// Display Regimen update form on GET.
exports.regimen_update_get = asyncHandler(async (req, res, next) => {
  // Get regimen, and all doses for form.
  const [regimen, allDoses] = await Promise.all([
    Regimen.findById(req.params.id).exec(),
    Dose.find().sort({ time: 1 }).exec(),
  ]);

  if (regimen === null) {
    // No results.
    const err = new Error("Medication not found");
    err.status = 404;
    return next(err);
  }

  // Add .checked = true for any dose which is relevant to this regimen
  // used in form to populate the form checkboxes
  allDoses.forEach((dose) => {
    if (regimen.doses.includes(dose._id)) dose.checked = "true";
  });

  res.render("regimen_form", {
    title: "Update Regimen",
    doses: allDoses,
    regimen: regimen,
    errors: undefined,
  });
});

// Handle Regimen update on POST.
exports.regimen_update_post = [
  // Replace undefined with empty array should no doses be selected
  (req, res, next) => {
    if (!Array.isArray(req.body.doses)) {
      req.body.doses =
        typeof req.body.doses === "undefined" ? [] : [req.body.doses];
    }
    next();
  },

  // Validate and sanitize fields.
  body("summary", "Summary must have at least 3 characters.")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract any validation errors
    const errors = validationResult(req);

    // Create a sanitized Regimen object, keeping the old id
    const regimen = new Regimen({
      summary: req.body.summary,
      doses: req.body.doses,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all doses for form
      const allDoses = await Dose.find().sort({ time: 1 }).exec();

      // Mark our selected doses as checked.
      for (const dose of allDoses) {
        if (regimen.doses.indexOf(dose._id) > -1) {
          dose.checked = "true";
        }
      }
      res.render("regimen_form", {
        title: "Update Regimen",
        doses: allDoses,
        regimen: regimen,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedRegimen = await Regimen.findByIdAndUpdate(
        req.params.id,
        regimen,
        {}
      );
      // Redirect to regimen detail page.
      res.redirect(updatedRegimen.url);
    }
  }),
];
