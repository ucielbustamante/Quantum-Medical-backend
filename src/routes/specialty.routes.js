const express = require("express");
const router = express.Router();
const specialtyController = require("../controllers/specialty.controller");
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");

// Ruta pública: lista todas las especialidades
router.get("/", specialtyController.getAllSpecialties);

// Rutas protegidas: solo ADMIN tiene acceso
router.post("/", verifyToken, isRole("Admin"), specialtyController.createSpecialty);
router.put("/:id", verifyToken, isRole("Admin"), specialtyController.updateSpecialty);
router.delete("/:id", verifyToken, isRole("Admin"), specialtyController.deleteSpecialty);

module.exports = router;
