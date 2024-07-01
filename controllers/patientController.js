const Patient = require("../models/patient");
const Condition = require("../models/condition");
const Prescription = require("../models/prescription");
const asyncHandler = require("express-async-handler");

const stockCalculations = require("../utility/stockDataCalcs");

const { body, validationResult } = require("express-validator");

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
  const [patient, patientPrescriptions] = await Promise.all([
    Patient.findById(req.params.id).populate("conditions").exec(),
    Prescription.find({ patient: req.params.id })
      .populate("medication", "name")
      .populate({
        path: "regimen",
        populate: {
          path: "doses",
        },
      })
      .exec(),
  ]);

  // calculate stock data:
  // - inventory at end of today
  // - full days of inventory left at end of today
  // - final full day from inventory

  // for each prescription, calculate some additional stock information
  // then bring together prescription and stock data in a single object
  let patient_prescriptions_viewinfo = [];
  patientPrescriptions.forEach((prescription) => {
    const stockData = stockCalculations.calculateStockData(prescription);

    patient_prescriptions_viewinfo.push({
      prescription: prescription,
      stockData: stockData,
    });
  });

  // calculate new presciption information
  const prescriptionOrderInfo = stockCalculations.calculateNewPrescriptionInfo(
    patient_prescriptions_viewinfo,
    10
  );

  res.render("patient_detail", {
    title: "Patient: " + patient.name,
    patient: patient,
    patient_prescriptions: patient_prescriptions_viewinfo,
    prescription_order_info: prescriptionOrderInfo,
  });
});

// Display Patient create form on GET.
exports.patient_create_get = asyncHandler(async (req, res, next) => {
  // Get dependent data - conditions here
  const allConditions = await Condition.find().sort({ condition: 1 }).exec();

  res.render("patient_form", {
    title: "Create Patient",
    conditions: allConditions,
    patient: undefined,
    errors: undefined,
  });
});

// Handle Patient create on POST.
exports.patient_create_post = [
  // If no conditions have been chosen for the patient, replace undefined with empty array
  (req, res, next) => {
    if (!Array.isArray(req.body.conditions)) {
      req.body.conditions =
        typeof req.body.conditions === "undefined" ? [] : [req.body.conditions];
    }
    next();
  },

  // Validate and sanitize fields.
  body("first_name", "First name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("family_name", "Family name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("date_of_birth", "Date of birth must be date format")
    .isISO8601()
    .toDate(),
  body("conditions.*").escape(), // sanitize all the array elements

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Patient object with escaped and trimmed data.
    const patient = new Patient({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
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
        if (patient.conditions.includes(condition._id)) {
          condition.checked = "true";
        }
      }
      res.render("patient_form", {
        title: "Create Patient",
        conditions: allConditions,
        patient: patient,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save patient.
      await patient.save();
      res.redirect(patient.url);
    }
  }),
];

// Display Patient delete form on GET.
exports.patient_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of patient
  // Also get all prescriptions with this patient
  const [patient, allPrescriptionsWithPatient] = await Promise.all([
    Patient.findById(req.params.id).exec(),
    Prescription.find({ patient: req.params.id })
      .populate("patient")
      .populate("medication")
      .populate("regimen")
      .exec(),
  ]);

  if (patient === null) {
    // No results.
    res.redirect("/medications/patients");
  }

  res.render("patient_delete", {
    title: "Delete Patient",
    patient: patient,
    patient_prescriptions: allPrescriptionsWithPatient,
  });
});

// Handle Patient delete on POST.
exports.patient_delete_post = asyncHandler(async (req, res, next) => {
  const [patient, allPrescriptionsWithPatient] = await Promise.all([
    Patient.findById(req.params.id).exec(),
    Prescription.find({ patient: req.params.id })
      .populate("patient")
      .populate("medication")
      .populate("regimen")
      .exec(),
  ]);

  if (allPrescriptionsWithPatient.length > 0) {
    // Prescription exists with this patient
    res.render("patient_delete", {
      title: "Delete Patient",
      patient: patient,
      patient_prescriptions: allPrescriptionsWithPatient,
    });
    return;
  } else {
    // Patient has no dependent prescription. Delete object and redirect to the list of patients
    // note patientid received from patient_delete form, hidden input
    await Patient.findByIdAndDelete(req.body.patientid);
    res.redirect("/medications/patients");
  }
});

// Display Patient update form on GET.
exports.patient_update_get = asyncHandler(async (req, res, next) => {
  // Get patient, and all conditions for form.
  const [patient, allConditions] = await Promise.all([
    Patient.findById(req.params.id).exec(),
    Condition.find().sort({ name: 1 }).exec(),
  ]);

  if (patient === null) {
    // No results.
    const err = new Error("Patient not found");
    err.status = 404;
    return next(err);
  }

  // Add .checked = true for any condition which is relevant to this patient
  // used in form to populate the form checkboxes
  allConditions.forEach((condition) => {
    if (patient.conditions.includes(condition._id)) condition.checked = "true";
  });

  res.render("patient_form", {
    title: "Update Patient",
    conditions: allConditions,
    patient: patient,
    errors: undefined,
  });
});

// Handle Patient update on POST.
exports.patient_update_post = [
  // Replace undefined with empty array should no conditions be selected
  (req, res, next) => {
    if (!Array.isArray(req.body.conditions)) {
      req.body.conditions =
        typeof req.body.conditions === "undefined" ? [] : [req.body.conditions];
    }
    next();
  },

  // Validate and sanitize fields.
  body("first_name", "First name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("family_name", "Family name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("date_of_birth", "Date of birth must be date format")
    .isISO8601()
    .toDate(),
  body("conditions.*").escape(), // sanitize all the array elements

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract any validation errors
    const errors = validationResult(req);

    // Create a sanitized Patient object, keeping the old id
    const patient = new Patient({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      conditions: req.body.conditions,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all conditions for form
      const allConditions = await Condition.find().sort({ name: 1 }).exec();

      // Mark our selected conditions as checked.
      for (const condition of allConditions) {
        if (patient.conditions.indexOf(condition._id) > -1) {
          condition.checked = "true";
        }
      }
      res.render("patient_form", {
        title: "Update Patient",
        conditions: allConditions,
        patient: patient,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedPatient = await Patient.findByIdAndUpdate(
        req.params.id,
        patient,
        {}
      );
      // Redirect to patient detail page.
      res.redirect(updatedPatient.url);
    }
  }),
];
