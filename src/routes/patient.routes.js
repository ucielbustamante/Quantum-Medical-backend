const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");
const { findById, findByEmail } = require("../middlewares/search.middleware");

router.get('/:id', findById('Patient'), patientController.getPatient);
router.get('/email/:email', findByEmail('Patient'), patientController.getPatientByEmail);
router.put('/:id', findById('Patient'), patientController.updatePatient);
router.delete('/:id', findById('Patient'), patientController.deletePatient);

module.exports = router;