const { User, Doctor } = require("../models");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");

exports.getDoctor = async (req, res) => {
    try {
        const doctor = req.doctor;
        if (!doctor) {
            logger.error('Doctor no encontrado en la request');
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Doctor no encontrado" }
            });
        }

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { 
                message: "Doctor encontrado exitosamente",
                doctor 
            }
        });
        logger.info(`Doctor encontrado exitosamente: ${doctor.id}`);
    } catch (error) {
        logger.error(`Error al obtener el doctor: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al obtener el doctor",
                error: error.message 
            }
        });
    }
};

exports.getDoctorByEmail = async (req, res) => {
    try {
        const doctor = req.doctor;
        if (!doctor) {
            logger.error('Doctor no encontrado en la request');
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Doctor no encontrado" }
            });
        }

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { 
                message: "Doctor encontrado exitosamente por email",
                doctor 
            }
        });
        logger.info(`Doctor encontrado exitosamente por email: ${doctor.User.email}`);
    } catch (error) {
        logger.error(`Error al obtener el doctor por email: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al obtener el doctor por email",
                error: error.message 
            }
        });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const { license_number } = req.body;
        const doctor = req.doctor;
        
        if (!doctor) {
            logger.error('Doctor no encontrado en la request');
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Doctor no encontrado" }
            });
        }

        await doctor.update({ license_number });
        
        const updatedDoctor = await Doctor.findOne({
            where: { id: doctor.id },
            include: [{
                model: User,
                attributes: ['name', 'lastname', 'email', 'role', 'dni', 'is_active']
            }]
        });

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { 
                message: "Doctor actualizado exitosamente",
                doctor: updatedDoctor 
            }
        });
        logger.info(`Doctor actualizado exitosamente: ${doctor.id}`);
    } catch (error) {
        logger.error(`Error al actualizar el doctor: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al actualizar el doctor",
                error: error.message 
            }
        });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = req.doctor;
        
        if (!doctor) {
            logger.error('Doctor no encontrado en la request');
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Doctor no encontrado" }
            });
        }

        await User.update(
            { is_active: false }, 
            { where: { id: doctor.user_id } }
        );

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { message: "Doctor eliminado exitosamente" }
        });
        logger.info(`Doctor eliminado exitosamente: ${doctor.id}`);
    } catch (error) {
        logger.error(`Error al eliminar el doctor: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al eliminar el doctor",
                error: error.message 
            }
        });
    }
};
