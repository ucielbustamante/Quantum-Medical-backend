const router = require('express').Router();
const ctrl = require('../controllers/doctorAvailability.controller');
const authJwt = require("../middlewares/authjwt.middleware");
const { findById } = require('../middlewares/search.middleware');

// 1) TODOS los horarios + doctores → público
// GET /availability
router.get('/availability', ctrl.getAllAvailabilities);

// 2) Horarios de 1 doctor → público
router.get('/doctors/:id/availability', ctrl.getAvailability);

// 3) Crear (Doctor o Admin)
// POST /doctors/:id/availability → Requiere autenticación y rol DOCTOR o ADMIN
router.post(
  '/doctors/:id/availability',
  [ authJwt.verifyToken, authJwt.isRole("Doctor","Admin") ],
  ctrl.createAvailability
);

// 4) Borrar (Doctor o Admin)
// DELETE /availability/:id → Requiere autenticación y rol DOCTOR o ADMIN
router.delete(
  '/availability/:id',
  [ authJwt.verifyToken, authJwt.isRole("Doctor","Admin"), findById('DoctorAvailability') ],
  ctrl.deleteAvailability
);

module.exports = router;
