const { Doctor, Patient, Appointment } = require('../models');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

exports.patientSelfOrAdmin = async (req, res, next) => {
  try {
    // 1) Admin siempre pasa
    if (req.userRole === 'Admin') return next();

    // 2) Si no es Patient, denegar de una
    if (req.userRole !== 'Patient') {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    }

    // 3) Buscar la entidad Patient para este user
    const me = await Patient.findOne({ where: { user_id: req.userId } });
    if (!me) {
      logger.warn(`Patient no encontrado para user_id=${req.userId}`);
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    }

    // 4) Verificar que el param coincide con mi Patient.id
    if (me.id === req.params.patientId) {
      return next();
    }
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
    if (req.userRole === 'Admin') return next();
    if (req.userRole !== 'Doctor') {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Forbidden' });
    }

    const me = await Doctor.findOne({ where: { user_id: req.userId } });
    if (!me) {
      logger.warn(`Doctor no encontrado para user_id=${req.userId}`);
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

exports.authorizeClinicalRecordAccess = async (req, res, next) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (userRole === 'Admin' || userRole === 'Doctor') {
      return next();
    }

    // Pacientes: Solo pueden ver sus propios registros
    if (userRole === 'Patient') {
      const patient = await Patient.findOne({ where: { user_id: userId } });

      if (!patient) {
        logger.warn(`Perfil de paciente no encontrado para user_id=${userId}`);
        return res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          data: { message: "No tienes un perfil de paciente asociado." }
        });
      }

      if (!req.query.patient_id || req.query.patient_id === patient.id.toString()) {
        req.query.patient_id = patient.id.toString(); // Aseguramos que solo vea los suyos
        return next();
      } else {
        // Si el paciente intenta acceder a un patient_id que no es el suyo
        logger.warn(`Paciente ${userId} intentó acceder a registros de patient_id=${req.query.patient_id}`);
        return res.status(StatusCodes.FORBIDDEN).json({
          statusCode: StatusCodes.FORBIDDEN,
          data: { message: "Acceso denegado. No tienes permiso para ver registros de otros pacientes." }
        });
      }
    }

    return res.status(StatusCodes.FORBIDDEN).json({
      statusCode: StatusCodes.FORBIDDEN,
      data: { message: "Acceso denegado. Rol no autorizado para esta acción." }
    });
  } catch (err) {
    logger.error(`Error en authorizeClinicalRecordAccess: ${err.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error interno del servidor al verificar permisos." }
    });
  }
};
