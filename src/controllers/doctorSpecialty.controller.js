const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const DoctorSpecialty = db.DoctorSpecialty; // Asegúrate de tener definido este modelo
const Doctor = db.Doctor;
const Specialty = db.Specialty;
const logger = require("../config/logger");

/**
 * GET /doctor-specialties
 * Retorna todos los doctores y susespecialidades.
 */
exports.getAllDoctorSpecialties = async (req, res) => {
  try {
    const associations = await DoctorSpecialty.findAll();
    logger.info(`Asociaciones doctor-specialty consultadas exitosamente. Total: ${associations.length}`);
    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: associations
    });
  } catch (error) {
    logger.error(`Error al obtener asociaciones doctor-specialty: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al obtener asociaciones doctor-specialty" }
    });
  }
};

/**
 * POST /doctor-specialties
 * Crea una nueva asociación entre un doctor y una especialidad.
 * Se espera en el body:
 * {
 *   "doctor_id": "uuid-doctor",
 *   "specialty_id": "uuid-especialty"
 * }
 */
exports.createDoctorSpecialty = async (req, res) => {
  try {
    const { doctor_id, specialty_id } = req.body;
    if (!doctor_id || !specialty_id) {
      logger.warn("Los campos 'doctor_id' y 'specialty_id' son obligatorios");
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "Los campos 'doctor_id' y 'specialty_id' son obligatorios" }
      });
    }

    // Verificar existencia del doctor y que esté activo (si aplica)
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      logger.error(`Doctor no encontrado: ID ${doctor_id}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Doctor no encontrado" }
      });
    }

    // Verificar existencia de la especialidad y que esté activa
    const specialty = await Specialty.findByPk(specialty_id);
    if (!specialty) {
      logger.error(`Especialidad no encontrada: ID ${specialty_id}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Especialidad no encontrada" }
      });
    }

    // Verificar si la asociación ya existe
    const existingAssociation = await DoctorSpecialty.findOne({
      where: { doctor_id, specialty_id }
    });
    if (existingAssociation) {
      logger.warn(`La asociación entre doctor ${doctor_id} y especialidad ${specialty_id} ya existe`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "La asociación ya existe" }
      });
    }

    // Crear la asociación
    const newAssociation = await DoctorSpecialty.create({ doctor_id, specialty_id });
    logger.info(`Asociación creada exitosamente: Doctor ${doctor_id} - Especialidad ${specialty_id}`);
    return res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      data: newAssociation
    });
  } catch (error) {
    logger.error(`Error al crear la asociación doctor-specialty: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al crear la asociación doctor-specialty" }
    });
  }
};


/**
 * DELETE /doctor-specialties/:doctor_id/:specialty_id
 * Elimina la asociación entre un doctor y una especialidad.
 */
exports.deleteDoctorSpecialty = async (req, res) => {
  try {
    const { doctor_id, specialty_id } = req.params;
    if (!doctor_id || !specialty_id) {
      logger.warn("Se requieren doctor_id y specialty_id para eliminar la asociación");
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "Se requieren doctor_id y specialty_id" }
      });
    }

    const association = await DoctorSpecialty.findOne({
      where: { doctor_id, specialty_id }
    });
    if (!association) {
      logger.error(`Asociación no encontrada para doctor ${doctor_id} y especialidad ${specialty_id}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Asociación doctor-specialty no encontrada" }
      });
    }

    await association.destroy();
    logger.info(`Asociación eliminada exitosamente: Doctor ${doctor_id} - Especialidad ${specialty_id}`);
    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: { message: "Asociación eliminada exitosamente" }
    });
  } catch (error) {
    logger.error(`Error al eliminar la asociación doctor-specialty: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al eliminar la asociación doctor-specialty" }
    });
  }
};
