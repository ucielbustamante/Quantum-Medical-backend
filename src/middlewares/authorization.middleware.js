const { Doctor, Patient, Appointment } = require('../models');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

exports.patientSelfOrAdmin = async (req, res, next) => {
  try {
    if (req.userRole === 'Admin') {
      logger.info('Admin access granted');
      return next();
    }

    // 2) Si no es Patient, denegar de una
    if (req.userRole !== 'Patient') {
      logger.info('Access denied: user role is not Patient');
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    }

    // 3) Buscar la entidad Patient para este user
    const me = await Patient.findOne({ where: { user_id: req.userId } });    
    if (!me) {
      logger.info(`Patient no encontrado para user_id=${req.userId}`);
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    }

    // 4) Verificar que el param coincide con mi Patient.id
    if (me.id === req.params.patientId) {
      logger.info(`Patient access granted: ${me.id} matches ${req.params.patientId}`);
      return next();
    }
    logger.info(`Access denied: patient ID ${me.id} does not match requested ${req.params.patientId}`);
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: 'Forbidden' });
  } catch (err) {
    logger.error(`Error en patientSelfOrAdmin: ${err.message}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
};

exports.doctorSelfOrAdmin = async (req, res, next) => {
  try {
    if (req.userRole === 'Admin') {
      logger.info('Admin access granted');
      return next();
    }
    
    if (req.userRole !== 'Doctor') {
      logger.info('Access denied: user role is not Doctor');
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    }

    const me = await Doctor.findOne({ where: { user_id: req.userId } });
    if (!me) {
      logger.info(`Doctor no encontrado para user_id=${req.userId}`);
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    }
    
    if (me.id === req.params.doctorId) {
      return next();
    }
    
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: 'Forbidden' });
  } catch (err) {
    logger.error(`Error en doctorSelfOrAdmin: ${err.message}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
};

exports.appointmentDoctorOrAdmin = async (req, res, next) => {
  try {
    // 1) Traer cita con su doctor.user_id
    const appt = await Appointment.findByPk(req.params.id, {
      include: { model: Doctor, attributes: ['user_id'] }
    });
    if (!appt) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Cita no encontrada' });
    }

    // 2) Admin siempre pasa
    if (req.userRole === 'Admin') return next();

    // 3) Sólo el doctor dueño de esa cita
    if (req.userRole === 'Doctor' && appt.Doctor.user_id === req.userId) {
      return next();
    }

    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: 'Forbidden' });
  } catch (err) {
    logger.error(`Error en appointmentDoctorOrAdmin: ${err.message}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
};