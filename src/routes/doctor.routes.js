const router = require('express').Router();
const { findById } = require('../middlewares/search.middleware');
const doctorController = require('../controllers/doctor.controller');
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");

// Ruta pública: lista todas las Doctores
router.post('/search', verifyToken, isRole("Admin"), doctorController.searchDoctor);

// Rutas protegidas: solo ADMIN tiene acceso
router.put('/:id', verifyToken, isRole("Admin"), findById('Doctor'), doctorController.updateDoctor);
router.delete('/:id', verifyToken, isRole("Admin"), findById('Doctor'), doctorController.deleteDoctor);

module.exports = router;