const express = require("express");
const router = express.Router();
const specialtyController = require("../controllers/specialty.controller");
const authJwt = require("../middlewares/authjwt.middleware");


// Ruta pública: lista todas las especialidades
router.get("/", specialtyController.getAllSpecialties);

// Rutas protegidas: solo ADMIN tiene acceso
router.post("/", [authJwt.verifyToken, authJwt.isRole("Admin")], specialtyController.createSpecialty);
router.put("/:id", [authJwt.verifyToken, authJwt.isRole("Admin")], specialtyController.updateSpecialty);
router.delete("/:id", [authJwt.verifyToken, authJwt.isRole("Admin")], specialtyController.deleteSpecialty);

module.exports = router;
