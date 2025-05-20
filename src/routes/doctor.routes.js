const router = require('express').Router();
const { findById, findByEmail } = require('../middlewares/search.middleware');
const doctorController = require('../controllers/doctor.controller');

router.get('/:id', findById('Doctor'), doctorController.getDoctor);
router.get('/email/:email', findByEmail('Doctor'), doctorController.getDoctorByEmail);
router.put('/:id', findById('Doctor'), doctorController.updateDoctor);
router.delete('/:id', findById('Doctor'), doctorController.deleteDoctor);

module.exports = router;