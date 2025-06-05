const express = require("express");
const router = express.Router();
const doctorSpecialtyController = require("../controllers/doctorSpecialty.controller");
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");

//ruta publica
router.get("/", doctorSpecialtyController.getAllDoctorSpecialties);

// Rutas protegidas: solo ADMIN tiene acceso
router.post("/", verifyToken, isRole("Admin"), doctorSpecialtyController.createDoctorSpecialty);
router.delete("/:doctor_id/:specialty_id", verifyToken, isRole("Admin"), doctorSpecialtyController.deleteDoctorSpecialty);

module.exports = router;
