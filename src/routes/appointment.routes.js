const router = require('express').Router();
const authJwt = require('../middlewares/authjwt.middleware');
const { 
  patientSelfOrAdmin, 
  doctorSelfOrAdmin, 
  appointmentDoctorOrAdmin 
} = require('../middlewares/authorization.middleware');
const { findById } = require('../middlewares/search.middleware');
const ctrl = require('../controllers/appointment.controller');

// POST /appointments
// Roles permitidos: Patient, Admin
// - Si eres Patient, creas cita para ti.
// - Si eres Admin, envia patient_id en el body para crear en nombre de otro.
router.post(
  '/appointments',
  [ authJwt.verifyToken, authJwt.isRole('Patient','Admin') ],
  ctrl.createAppointment
);

// GET /patients/:patientId/appointments
// Roles permitidos: Patient (solo sus propias citas), Admin (cualquiera)
// Lista las citas de ese paciente.
router.get(
  '/patients/:patientId/appointments',
  [ authJwt.verifyToken, patientSelfOrAdmin ],
  ctrl.getAppointmentsByPatient
);

// GET /doctors/:doctorId/appointments
// Roles permitidos: Doctor (solo sus propias citas), Admin (cualquiera)
// Lista las citas de ese doctor.
router.get(
  '/doctors/:doctorId/appointments',
  [ authJwt.verifyToken, doctorSelfOrAdmin ],
  ctrl.getAppointmentsByDoctor
);

// GET /doctors/:doctorId/available-slots
// Roles permitidos: Patient, Doctor, Admin
// Obtiene los turnos disponibles de un doctor en un rango de fechas
router.get(
  '/doctors/:id/available-slots',
  [ authJwt.verifyToken, authJwt.isRole('Patient','Doctor','Admin'), findById('Doctor') ],
  ctrl.getAvailableSlots
);

// PATCH /appointments/:id/status
// Roles permitidos: Doctor (solo de sus propias citas), Admin (cualquiera)
// Actualiza el campo status de una cita (pending, confirmed, cancelled).
router.patch(
  '/appointments/:id/status',
  [ authJwt.verifyToken, authJwt.isRole('Doctor','Admin'), appointmentDoctorOrAdmin ],
  ctrl.updateStatus
);

// DELETE /appointments/:id
// Roles permitidos: Admin
// Elimina (cancela) una cita por su ID.
router.delete(
  '/appointments/:id',
  [ authJwt.verifyToken, authJwt.isRole('Admin') ],
  ctrl.cancelAppointment
);

module.exports = router;
