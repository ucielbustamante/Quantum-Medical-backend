const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const Specialty = db.Specialty;
const logger = require("../config/logger");

// GET /specialties
exports.getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      where: { is_active: true }
    });
    logger.info(`Especialidades consultadas exitosamente. Total: ${specialties.length}`);
    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: specialties
    });
  } catch (error) {
    logger.error(`Error al obtener especialidades: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al obtener las especialidades" }
    });
  }
};

// POST /specialties  (ADMIN)
exports.createSpecialty = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      logger.warn("El campo 'name' es obligatorio para crear una especialidad");
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "El campo 'name' es requerido" }
      });
    }
    const newSpecialty = await Specialty.create({ name });
    logger.info(`Especialidad creada exitosamente: ID ${newSpecialty.id}`);
    return res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      data: newSpecialty
    });
  } catch (error) {
    logger.error(`Error al crear especialidad: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al crear la especialidad" }
    });
  }
};

// PUT /specialties/:id (ADMIN)
exports.updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      logger.warn("El campo 'name' es obligatorio para actualizar la especialidad");
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "El campo 'name' es requerido para actualizar la especialidad" }
      });
    }
    
    const specialty = await Specialty.findByPk(id);
    if (!specialty) {
      logger.error(`Especialidad no encontrada: ID ${id}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Especialidad no encontrada" }
      });
    }
    
    specialty.name = name;
    await specialty.save();
    logger.info(`Especialidad actualizada exitosamente: ID ${specialty.id}`);
    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: specialty
    });
  } catch (error) {
    logger.error(`Error al actualizar especialidad: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al actualizar la especialidad" }
    });
  }
};

// DELETE /specialties/:id (ADMIN)
exports.deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await Specialty.findByPk(id);

    if (!specialty) {
      logger.error(`Especialidad no encontrada: ID ${id}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Especialidad no encontrada" }
      });
    }

    // Verificar si la especialidad ya se encuentra inactiva
    if (!specialty.is_active) {
      logger.warn(`La especialidad ya se encontraba eliminada: ID ${id}`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "La especialidad ya se encuentra eliminada" }
      });
    }
    
    // Realiza el soft delete actualizando is_active a false
    await specialty.update({ is_active: false });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: { message: "Especialidad eliminada exitosamente" }
    });
    logger.info(`Especialidad eliminada exitosamente (soft delete): ${id}`);
  } catch (error) {
    logger.error(`Error al eliminar la especialidad: ${error.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { 
        message: "Error al eliminar la especialidad",
        error: error.message 
      }
    });
  }
};
