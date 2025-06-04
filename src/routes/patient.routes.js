const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");
const { findById, findByEmail } = require("../middlewares/search.middleware");
const authJwt = require("../middlewares/authjwt.middleware");

// Rutas protegidas: solo ADMIN tiene acceso
router.post('/search',[authJwt.verifyToken, authJwt.isRole("Admin")],patientController.searchPatient);
router.put('/:id', [authJwt.verifyToken, authJwt.isRole("Admin")] ,findById('Patient'), patientController.updatePatient);
router.delete('/:id',  [authJwt.verifyToken, authJwt.isRole("Admin")],findById('Patient'), patientController.deletePatient);

module.exports = router;