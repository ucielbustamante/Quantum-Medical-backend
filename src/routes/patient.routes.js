const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");
const { findById } = require("../middlewares/search.middleware");
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");

// Rutas protegidas: solo ADMIN tiene acceso
router.post('/search', verifyToken, isRole("Admin"), patientController.searchPatient);
router.put('/:id', verifyToken, isRole("Admin"), findById('Patient'), patientController.updatePatient);
router.delete('/:id', verifyToken, isRole("Admin"), findById('Patient'), patientController.deletePatient);

module.exports = router;