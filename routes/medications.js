const express = require("express");
const router = express.Router();

// Require controller modules.
const index_controller = require("../controllers/indexController");
const condition_controller = require("../controllers/conditionController");
const regimen_controller = require("../controllers/regimenController");
const patient_controller = require("../controllers/patientController");
const medication_controller = require("../controllers/medicationController");
const prescription_controller = require("../controllers/prescriptionController");

/// INDEX ROUTE ///

// GET medication home page.
router.get("/", index_controller.index);

/// CONDITION ROUTES ///

/*
// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get("/book/create", index_controller.data_list);

// POST request for creating Book.
router.post("/book/create", book_controller.book_create_post);

// GET request to delete Book.
router.get("/book/:id/delete", book_controller.book_delete_get);

// POST request to delete Book.
router.post("/book/:id/delete", book_controller.book_delete_post);

// GET request to update Book.
router.get("/book/:id/update", book_controller.book_update_get);

// POST request to update Book.
router.post("/book/:id/update", book_controller.book_update_post);
*/

// GET request for one Book.
router.get("/condition/:id", condition_controller.condition_detail);

// GET request for list of all Book items.
router.get("/conditions", condition_controller.condition_list);

/// REGIMEN ROUTES ///

/*
// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get("/author/create", author_controller.author_create_get);

// POST request for creating Author.
router.post("/author/create", author_controller.author_create_post);

// GET request to delete Author.
router.get("/author/:id/delete", author_controller.author_delete_get);

// POST request to delete Author.
router.post("/author/:id/delete", author_controller.author_delete_post);

// GET request to update Author.
router.get("/author/:id/update", author_controller.author_update_get);

// POST request to update Author.
router.post("/author/:id/update", author_controller.author_update_post);
*/

// GET request for one Regimen.
router.get("/regimen/:id", regimen_controller.regimen_detail);

// GET request for list of all Regimens.
router.get("/regimens", regimen_controller.regimen_list);

/// PATIENT ROUTES ///

// GET request for one Patient.
router.get("/patient/:id", patient_controller.patient_detail);

// GET request for list of all Patients.
router.get("/patients", patient_controller.patient_list);

/// MEDICATION ROUTES ///

// GET request for one Medication.
router.get("/medication/:id", medication_controller.medication_detail);

// GET request for list of all Medications.
router.get("/medications", medication_controller.medication_list);

/// PRESCRIPTION ROUTES ///

// GET request for one Prescription.
router.get("/prescription/:id", prescription_controller.prescription_detail);

// GET request for list of all Prescriptions.
router.get("/prescriptions", prescription_controller.prescription_list);

module.exports = router;
