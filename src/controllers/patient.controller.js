const { User, Patient } = require("../models");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");

exports.getPatient = async (req, res) => {
    try {
        const patient = req.patient;
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { 
                message: "Paciente encontrado exitosamente",
                patient 
            }
        });
        logger.info(`Paciente encontrado exitosamente: ${patient.id}`);
    } catch (error) {
        logger.error(`Error al obtener el paciente: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al obtener el paciente",
                error: error.message 
            }
        });
    }
};

exports.getPatientByEmail = async (req, res) => {
    try {
        const patient = req.patient;
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { 
                message: "Paciente encontrado exitosamente por email",
                patient 
            }
        });
        logger.info(`Paciente encontrado exitosamente por email: ${req.params.email}`);
    } catch (error) {
        logger.error(`Error al obtener el paciente por email: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al obtener el paciente por email",
                error: error.message 
            }
        });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { health_insurance, health_insurance_number, birthday } = req.body;
        const patient = req.patient;
        await patient.update({ 
            health_insurance, 
            health_insurance_number, 
            birthday 
        });
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { 
                message: "Paciente actualizado exitosamente",
                patient 
            }
        });
        logger.info(`Paciente actualizado exitosamente: ${patient.id}`);
    } catch (error) {
        logger.error(`Error al actualizar el paciente: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al actualizar el paciente",
                error: error.message 
            }
        });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patient = req.patient;
        await User.update({ is_active: false }, { where: { id: patient.user_id } });
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { message: "Paciente eliminado exitosamente" }
        });
        logger.info(`Paciente eliminado exitosamente: ${patient.id}`);
    } catch (error) {
        logger.error(`Error al eliminar el paciente: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { 
                message: "Error al eliminar el paciente",
                error: error.message 
            }
        });
    }
}; 