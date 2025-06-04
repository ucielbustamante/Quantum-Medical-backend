const router = require('express').Router();
const { findById } = require('../middlewares/search.middleware');
const doctorController = require('../controllers/doctor.controller');
const authJwt = require("../middlewares/authjwt.middleware");

// Ruta pública: lista todas las Doctores
router.post('/search',doctorController.searchDoctor);

// Rutas protegidas: solo ADMIN tiene acceso
router.put('/:id', [authJwt.verifyToken, authJwt.isRole("Admin")],findById('Doctor'), doctorController.updateDoctor);
router.delete('/:id', [authJwt.verifyToken, authJwt.isRole("Admin")],findById('Doctor'), doctorController.deleteDoctor);

module.exports = router;