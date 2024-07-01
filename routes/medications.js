const express = require("express");
const router = express.Router();

// Require controller modules.
const index_controller = require("../controllers/indexController");
const condition_controller = require("../controllers/conditionController");
const dose_controller = require("../controllers/doseController");
const regimen_controller = require("../controllers/regimenController");
const patient_controller = require("../controllers/patientController");
const medication_controller = require("../controllers/medicationController");
const prescription_controller = require("../controllers/prescriptionController");

/// INDEX ROUTE ///

// GET home page for medication application.
router.get("/", index_controller.index);

/// CONDITION ROUTES ///

// GET request for creating a Condition. NOTE This must come before routes that display Book (uses id).
router.get("/condition/create", condition_controller.condition_create_get);

// POST request for creating Condition.
router.post("/condition/create", condition_controller.condition_create_post);

// GET request to delete Condition.
router.get("/condition/:id/delete", condition_controller.condition_delete_get);

// POST request to delete Condition.
router.post(
  "/condition/:id/delete",
  condition_controller.condition_delete_post
);

// GET request to update Condition.
router.get("/condition/:id/update", condition_controller.condition_update_get);

// POST request to update Condition.
router.post(
  "/condition/:id/update",
  condition_controller.condition_update_post
);

// GET request for one Condition.
router.get("/condition/:id", condition_controller.condition_detail);

// GET request for list of all Condition items.
router.get("/conditions", condition_controller.condition_list);

/// DOSE ROUTES ///

// GET request for creating a Condition. NOTE This must come before routes that display Book (uses id).
router.get("/dose/create", dose_controller.dose_create_get);

// POST request for creating Condition.
router.post("/dose/create", dose_controller.dose_create_post);

// GET request to delete Dose.
router.get("/dose/:id/delete", dose_controller.dose_delete_get);

// POST request to delete Dose.
router.post("/dose/:id/delete", dose_controller.dose_delete_post);

// GET request to update Dose.
router.get("/dose/:id/update", dose_controller.dose_update_get);

// POST request to update Dose.
router.post("/dose/:id/update", dose_controller.dose_update_post);

// GET request for one Condition.
router.get("/dose/:id", dose_controller.dose_detail);

// GET request for list of all Condition items.
router.get("/doses", dose_controller.dose_list);

/// MEDICATION ROUTES ///

// GET request for creating a Medication. NOTE This must come before routes that display Medications (uses id).
router.get("/medication/create", medication_controller.medication_create_get);

// POST request for creating a Medication.
router.post("/medication/create", medication_controller.medication_create_post);

// GET request to delete Medication.
router.get(
  "/medication/:id/delete",
  medication_controller.medication_delete_get
);

// POST request to delete Medication.
router.post(
  "/medication/:id/delete",
  medication_controller.medication_delete_post
);

// GET request to update Medication.
router.get(
  "/medication/:id/update",
  medication_controller.medication_update_get
);

// POST request to update Medication.
router.post(
  "/medication/:id/update",
  medication_controller.medication_update_post
);

// GET request for one Medication.
router.get("/medication/:id", medication_controller.medication_detail);

// GET request for list of all Medications.
router.get("/medications", medication_controller.medication_list);

/// PATIENT ROUTES ///

// GET request for creating a Patient. NOTE This must come before routes that display Medications (uses id).
router.get("/patient/create", patient_controller.patient_create_get);

// POST request for creating a Patient.
router.post("/patient/create", patient_controller.patient_create_post);

// GET request to delete Patient.
router.get("/patient/:id/delete", patient_controller.patient_delete_get);

// POST request to delete Patient.
router.post("/patient/:id/delete", patient_controller.patient_delete_post);

// GET request to update Patient.
router.get("/patient/:id/update", patient_controller.patient_update_get);

// POST request to update Patient.
router.post("/patient/:id/update", patient_controller.patient_update_post);

// GET request for one Patient.
router.get("/patient/:id", patient_controller.patient_detail);

// GET request for list of all Patients.
router.get("/patients", patient_controller.patient_list);

/// PRESCRIPTION ROUTES ///

router.get(
  "/prescription/create",
  prescription_controller.prescription_create_get
);
router.post(
  "/prescription/create",
  prescription_controller.prescription_create_post
);
router.get(
  "/prescription/:id/delete",
  prescription_controller.prescription_delete_get
);
router.post(
  "/prescription/:id/delete",
  prescription_controller.prescription_delete_post
);
router.get(
  "/prescription/:id/update",
  prescription_controller.prescription_update_get
);
router.post(
  "/prescription/:id/update",
  prescription_controller.prescription_update_post
);
router.get("/prescription/:id", prescription_controller.prescription_detail);
router.get("/prescriptions", prescription_controller.prescription_list);

/// REGIMEN ROUTES ///

// GET request for creating Regimen. NOTE This must come before route for id (i.e. display author).
router.get("/regimen/create", regimen_controller.regimen_create_get);

// POST request for creating Regimen.
router.post("/regimen/create", regimen_controller.regimen_create_post);

// GET request to delete Regimen.
router.get("/regimen/:id/delete", regimen_controller.regimen_delete_get);

// POST request to delete Regimen.
router.post("/regimen/:id/delete", regimen_controller.regimen_delete_post);

// GET request to update Regimen.
router.get("/regimen/:id/update", regimen_controller.regimen_update_get);

// POST request to update Regimen.
router.post("/regimen/:id/update", regimen_controller.regimen_update_post);

// GET request for one Regimen.
router.get("/regimen/:id", regimen_controller.regimen_detail);

// GET request for list of all Regimens.
router.get("/regimens", regimen_controller.regimen_list);

module.exports = router;
