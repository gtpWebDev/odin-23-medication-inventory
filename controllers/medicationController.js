const Medication = require("../models/medication");
const Condition = require("../models/condition");
const Prescription = require("../models/prescription");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all Medications.
exports.medication_list = asyncHandler(async (req, res, next) => {
  // collect all medications
  const allMedications = await Medication.find({}, "name alias")
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

  res.render("medication_detail", {
    title: "Medication: " + medication.name,
    medication: medication,
  });
});

// Display Medication create form on GET.
exports.medication_create_get = asyncHandler(async (req, res, next) => {
  // Get all conditions, which we can use for adding to our medication.
  const allConditions = await Condition.find().sort({ condition: 1 }).exec();

  res.render("medication_form", {
    title: "Create Medication",
    conditions: allConditions,
    medication: undefined,
    errors: undefined,
  });
});

// Handle Medication create on POST.
exports.medication_create_post = [
  // If no conditions have been chosen for the medication, replace undefined with empty array
  (req, res, next) => {
    if (!Array.isArray(req.body.conditions)) {
      req.body.conditions =
        typeof req.body.conditions === "undefined" ? [] : [req.body.conditions];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("alias", "Alias must not be empty.")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request after validation and sanitization.
  body("conditions.*").escape(), // sanitize all the array elements

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Medication object with escaped and trimmed data.
    const medication = new Medication({
      name: req.body.name,
      alias: req.body.alias,
      conditions: req.body.conditions,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all conditions for form.
      const allConditions = await Condition.find()
        .sort({ condition: 1 })
        .exec();

      // Mark our selected conditions as checked.
      for (const condition of allConditions) {
        if (medication.conditions.includes(condition._id)) {
          condition.checked = "true";
        }
      }
      res.render("medication_form", {
        title: "Create Medication",
        conditions: allConditions,
        medication: medication,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save medication.
      await medication.save();
      res.redirect(medication.url);
    }
  }),
];

// Display Medication delete form on GET.
exports.medication_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of medication
  // Also get all prescriptions with this medication
  const [medication, allPrescriptionsWithMedicine] = await Promise.all([
    Medication.findById(req.params.id).exec(),
    Prescription.find({ medication: req.params.id })
      .populate("patient")
      .populate("medication")
      .populate("regimen")
      .exec(),
  ]);

  if (medication === null) res.redirect("/medications/medications");

  res.render("medication_delete", {
    title: "Delete Medication",
    medication: medication,
    medication_prescriptions: allPrescriptionsWithMedicine,
  });
});

// Handle Medication delete on POST.
exports.medication_delete_post = asyncHandler(async (req, res, next) => {
  const [medication, allPrescriptionsWithMedicine] = await Promise.all([
    Medication.findById(req.params.id).exec(),
    Prescription.find({ medication: req.params.id })
      .populate("patient")
      .populate("medication")
      .populate("regimen")
      .exec(),
  ]);

  if (allPrescriptionsWithMedicine.length > 0) {
    // Prescription exists with this medication
    res.render("medication_delete", {
      title: "Delete Medication",
      medication: medication,
      medication_prescriptions: allPrescriptionsWithMedicine,
    });
    return;
  } else {
    // Medication has no dependent prescription. Delete object and redirect to the list of meds
    // note medicationid received from medication_delete form, hidden input
    await Medication.findByIdAndDelete(req.body.medicationid);
    res.redirect("/medications/medications");
  }
});

// Display Medication update form on GET.
exports.medication_update_get = asyncHandler(async (req, res, next) => {
  // Get medication, and all conditions for form.
  const [medication, allConditions] = await Promise.all([
    Medication.findById(req.params.id).exec(),
    Condition.find().sort({ name: 1 }).exec(),
  ]);

  if (medication === null) {
    // No results.
    const err = new Error("Medication not found");
    err.status = 404;
    return next(err);
  }

  // Add .checked = true for any condition which is relevant to this medication
  // used in form to populate the form checkboxes
  allConditions.forEach((condition) => {
    if (medication.conditions.includes(condition._id))
      condition.checked = "true";
  });

  res.render("medication_form", {
    title: "Update Medication",
    conditions: allConditions,
    medication: medication,
    errors: undefined,
  });
});

// Handle Medication update on POST.
exports.medication_update_post = [
  // Replace undefined with empty array should no conditions be selected
  (req, res, next) => {
    if (!Array.isArray(req.body.conditions)) {
      req.body.conditions =
        typeof req.body.conditions === "undefined" ? [] : [req.body.conditions];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("alias").trim().escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract any validation errors
    const errors = validationResult(req);

    // Create a sanitized Medication object, keeping the old id
    const medication = new Medication({
      name: req.body.name,
      alias: req.body.alias,
      conditions: req.body.conditions,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all conditions for form
      const allConditions = await Condition.find().sort({ name: 1 }).exec();

      // Mark our selected conditions as checked.
      for (const condition of allConditions) {
        if (medication.conditions.indexOf(condition._id) > -1) {
          condition.checked = "true";
        }
      }
      res.render("medication_form", {
        title: "Update Medication",
        conditions: allConditions,
        medication: medication,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedMedication = await Medication.findByIdAndUpdate(
        req.params.id,
        medication,
        {}
      );
      // Redirect to medication detail page.
      res.redirect(updatedMedication.url);
    }
  }),
];
