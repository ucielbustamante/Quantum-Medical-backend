const router = require('express').Router();
const { findById } = require('../middlewares/search.middleware');
const doctorController = require('../controllers/doctor.controller');

router.post('/search', doctorController.searchDoctor);
router.put('/:id', findById('Doctor'), doctorController.updateDoctor);
router.delete('/:id', findById('Doctor'), doctorController.deleteDoctor);

module.exports = router;