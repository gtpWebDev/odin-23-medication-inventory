const Prescription = require("../models/prescription");
const Patient = require("../models/patient");
const Medication = require("../models/medication");
const Regimen = require("../models/regimen");
const asyncHandler = require("express-async-handler");

const stockCalculations = require("../utility/stockDataCalcs");

const constants = require("../utility/constants");

const { body, validationResult } = require("express-validator");

// Display list of all Prescriptions.
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
    .populate({
      path: "regimen",
      populate: {
        path: "doses",
      },
    })
    .exec();

  // calculate stock data:
  // - inventory at end of today
  // - full days of inventory left at end of today
  // - final full day from inventory

  // for each prescription, calculate some additional stock information
  // then bring together prescription and stock data in a single object
  const stockData = stockCalculations.calculateStockData(prescription);
  const viewInfo = {
    prescription: prescription,
    stockData: stockData,
  };

  res.render("prescription_detail", {
    title: "Prescription: " + prescription._id,
    viewInfo: viewInfo,
  });
});

// Display Prescription create form on GET.
exports.prescription_create_get = asyncHandler(async (req, res, next) => {
  // Get dependent data - patients, medicines and regimens
  const [allPatients, allMedications, allRegimens] = await Promise.all([
    Patient.find().sort({ family_name: 1 }).exec(),
    Medication.find().sort({ name: 1 }).exec(),
    Regimen.find().sort({ summary: 1 }).exec(),
  ]);

  res.render("prescription_form", {
    title: "Create Prescription",
    statusOptions: constants.prescriptionStatusOptions,
    patients: allPatients,
    medications: allMedications,
    regimens: allRegimens,
    prescription: undefined,
    errors: undefined,
  });
});

// Handle Author create on POST.
exports.prescription_create_post = [
  // Validate and sanitize fields.
  body("status", "Status must be either 'Active' or 'Inactive'.")
    .trim()
    .isIn(constants.prescriptionStatusOptions)
    .isLength({ min: 1 })
    .escape(),
  body("inventory_update_date", "Inventory update date must be date format")
    .isISO8601()
    .toDate(),
  body(
    "inventory_update_quantity_endofday",
    "End of day quantity must be a number."
  )
    .isNumeric()
    .escape(),
  body("patient").escape(),
  body("medication").escape(),
  body("regimen").escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Patient object with escaped and trimmed data.
    const prescription = new Prescription({
      status: req.body.status,
      inventory_update_date: req.body.inventory_update_date,
      inventory_update_quantity_endofday:
        req.body.inventory_update_quantity_endofday,
      patient: req.body.patient,
      medication: req.body.medication,
      regimen: req.body.regimen,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get dependent data - patients, medicines and regimens
      const allPatients = await Patient.find().sort({ family_name: 1 }).exec();
      const allMedications = await Medication.find().sort({ name: 1 }).exec();
      const allRegimens = await Regimen.find().sort({ summary: 1 }).exec();

      // Mark selected patient, medication and regimen as checked.
      for (const patient of allPatients) {
        // use .equals to match mongodb objectIds
        if (prescription.patient.equals(patient._id)) patient.checked = "true";
      }
      for (const medication of allMedications) {
        if (prescription.medication.equals(medication._id))
          medication.checked = "true";
      }
      for (const regimen of allRegimens) {
        if (prescription.regimen.equals(regimen._id)) regimen.checked = "true";
      }

      res.render("prescription_form", {
        title: "Create Prescription",
        statusOptions: constants.prescriptionStatusOptions,
        patients: allPatients,
        medications: allMedications,
        regimens: allRegimens,
        prescription: prescription,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save patient.
      await prescription.save();
      res.redirect(prescription.url);
    }
  }),
];

// Display Prescription delete form on GET.
exports.prescription_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of prescription (which has no structural data dependencies
  const prescription = await Prescription.findById(req.params.id)
    .populate("patient")
    .populate("medication")
    .populate("regimen")
    .exec();

  if (prescription === null) res.redirect("/medications/medications");

  res.render("prescription_delete", {
    title: "Delete Prescription",
    prescription: prescription,
  });
});

// Handle Prescription delete on POST.
exports.prescription_delete_post = asyncHandler(async (req, res, next) => {
  // Prescription has no structural data dependency, so simply delete
  // note prescriptionid received from precription_delete form, hidden input
  await Prescription.findByIdAndDelete(req.body.prescriptionid);
  res.redirect("/medications/prescriptions");
});

// Display Prescription update form on GET.
exports.prescription_update_get = asyncHandler(async (req, res, next) => {
  const [prescription, allPatients, allMedications, allRegimens] =
    await Promise.all([
      Prescription.findById(req.params.id).exec(),
      Patient.find().sort({ family_name: 1 }).exec(),
      Medication.find().sort({ name: 1 }).exec(),
      Regimen.find().sort({ summary: 1 }).exec(),
    ]);

  if (prescription === null) {
    // No results.
    const err = new Error("Prescription not found");
    err.status = 404;
    return next(err);
  }

  // Mark selected patient, medication and regimen as checked.
  allPatients.forEach((patient) => {
    if (prescription.patient.equals(patient._id)) patient.checked = "true";
  });
  allMedications.forEach((medication) => {
    if (prescription.medication.equals(medication._id))
      medication.checked = "true";
  });
  allRegimens.forEach((regimen) => {
    if (prescription.regimen.equals(regimen._id)) regimen.checked = "true";
  });

  res.render("prescription_form", {
    title: "Update Prescription",
    statusOptions: constants.prescriptionStatusOptions,
    patients: allPatients,
    medications: allMedications,
    regimens: allRegimens,
    prescription: prescription,
    errors: undefined,
  });
});

// Handle Prescription update on POST.
exports.prescription_update_post = [
  // Validate and sanitize fields.
  body("status", "Status must be either 'Active' or 'Inactive'.")
    .trim()
    .isIn(constants.prescriptionStatusOptions)
    .isLength({ min: 1 })
    .escape(),
  body("inventory_update_date", "Inventory update date must be date format")
    .isISO8601()
    .toDate(),
  body(
    "inventory_update_quantity_endofday",
    "End of day quantity must be a number."
  )
    .isNumeric()
    .escape(),
  body("patient").escape(),
  body("medication").escape(),
  body("regimen").escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract any validation errors
    const errors = validationResult(req);

    // Create a sanitized Prescription object, keeping the old id
    const prescription = new Prescription({
      status: req.body.status,
      inventory_update_date: req.body.inventory_update_date,
      inventory_update_quantity_endofday:
        req.body.inventory_update_quantity_endofday,
      patient: req.body.patient,
      medication: req.body.medication,
      regimen: req.body.regimen,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      const [allPatients, allMedications, allRegimens] = await Promise.all([
        Patient.find().sort({ family_name: 1 }).exec(),
        Medication.find().sort({ name: 1 }).exec(),
        Regimen.find().sort({ summary: 1 }).exec(),
      ]);

      // Mark selected patient, medication and regimen as checked.
      allPatients.forEach((patient) => {
        if (prescription.patient.equals(patient._id)) patient.checked = "true";
      });
      allMedications.forEach((medication) => {
        if (prescription.medication.equals(medication._id))
          medication.checked = "true";
      });
      allRegimens.forEach((regimen) => {
        if (prescription.regimen.equals(regimen._id)) regimen.checked = "true";
      });
      res.render("prescription_form", {
        title: "Update Prescription",
        statusOptions: constants.prescriptionStatusOptions,
        patients: allPatients,
        medications: allMedications,
        regimens: allRegimens,
        prescription: prescription,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedPrescription = await Prescription.findByIdAndUpdate(
        req.params.id,
        prescription,
        {}
      );
      // Redirect to medication detail page.
      res.redirect(updatedPrescription.url);
    }
  }),
];
