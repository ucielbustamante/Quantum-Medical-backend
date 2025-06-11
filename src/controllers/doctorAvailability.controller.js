const { DoctorAvailability, Doctor, User } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const logger = require("../config/logger");


// 1) Listar todas las franjas → GET /availability
exports.getAllAvailabilities = async (req, res) => {
  try {
    const rows = await DoctorAvailability.findAll({
      attributes: ["id","weekday","start_time","end_time","slot_duration_min"],
      include:[{
        model: Doctor,
        attributes:['id','license_number'],
        include:[{ model: User, attributes:['name','lastname','email'] }]
      }],
      order:[['weekday','ASC'],['start_time','ASC']]
    });
    if (rows.length===0) {
      return res.status(StatusCodes.OK).json({
        statusCode: 200,
        message: "No hay horarios disponibles cargados aun"
      });
    }
    return res.status(200).json({ statusCode: 200, data: rows });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      statusCode:500,
      message:"Error al obtener las disponibilidades",
      error: err.message
    });
  }
};

// 2) Listar de un doctor → GET /doctors/:id/availability
exports.getAvailability = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const rows = await DoctorAvailability.findAll({
      where:{ doctor_id: doctorId },
      attributes: ["id","weekday","start_time","end_time","slot_duration_min"],
      order:[['weekday','ASC'],['start_time','ASC']]
    });
    if (rows.length===0) {
      return res.status(200).json({
        statusCode: 200,
        message: "No hay horarios disponibles para este doctor"
      });
    }
    return res.status(200).json({ statusCode:200, data: rows });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      statusCode:500,
      message:"Error al obtener la disponibilidad",
      error: err.message
    });
  }
};

// 3) Crear → POST /doctors/:id/availability
exports.createAvailability = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { weekday, start_time, end_time, slot_duration_min } = req.body;

    // Validaciones básicas
    if (
      weekday === undefined ||
      start_time == null ||
      end_time == null ||
      slot_duration_min == null
    ) {
      return res.status(400).json({
        statusCode:400,
        message:"Se requieren weekday, start_time, end_time y slot_duration_min"
      });
    }
    if (![0,1,2,3,4,5,6].includes(weekday)) {
      return res.status(400).json({
        statusCode:400,
        message:"weekday debe ser un número entre 0 y 6"
      });
    }
    if (start_time >= end_time) {
      return res.status(400).json({
        statusCode:400,
        message:"start_time debe ser anterior a end_time"
      });
    }
    if (slot_duration_min < 1) {
      return res.status(400).json({
        statusCode:400,
        message:"slot_duration_min debe ser mayor a 0"
      });
    }

    // Conflicto en la misma jornada
    const conflict = await DoctorAvailability.findOne({
      where: {
        doctor_id: doctorId,
        weekday,
        [Op.and]: [
          { start_time: { [Op.lt]: end_time } },
          { end_time:   { [Op.gt]: start_time } }
        ]
      }
    });
    if (conflict) {
      return res.status(409).json({
        statusCode:409,
        message:"Conflicto: horario solapado en este día"
      });
    }

    const av = await DoctorAvailability.create({
      doctor_id: doctorId,
      weekday,
      start_time,
      end_time,
      slot_duration_min
    });
    return res.status(201).json({
      statusCode:201,
      data:{ id: av.id }
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      statusCode:500,
      message:"Error al crear la disponibilidad",
      error: err.message
    });
  }
};


// 4) BORRAR → DELETE /availability/:id
exports.deleteAvailability = async (req, res) => {
  try {
    const availability = req.doctorAvailability;
    if (!availability) {
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Disponibilidad no encontrada"
      });
    }
    await availability.destroy();
    logger.info(`Disponibilidad eliminada: ${availability.id}`);
    return res.sendStatus(StatusCodes.NO_CONTENT); // 204
  } catch (error) {
    logger.error(`Error en deleteAvailability: ${error.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error al eliminar la disponibilidad",
      error: error.message
    });
  }
};
