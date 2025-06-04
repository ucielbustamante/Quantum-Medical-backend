const { User, Patient } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const logger = require("../config/logger");



exports.searchPatient = async (req, res) => {
    try {
        const {
            name,
            lastname,
            email,
            dni,
            limit,
            offset
        } = req.body;

        const validKeys = [
            'name', 'lastname', 'email', 'dni',
           'limit', 'offset'
        ];
        const receivedKeys = Object.keys(req.body);
        const invalidKeys = receivedKeys.filter(key => !validKeys.includes(key));
        if (invalidKeys.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                message: 'Las keys del body deben ser: ' + validKeys.join(', ')
            });
        }

        const userWhere = { is_active: true };
        if (name) userWhere.name = { [Op.iLike]: `%${name}%` };
        if (lastname) userWhere.lastname = { [Op.iLike]: `%${lastname}%` };
        if (email) userWhere.email = email;
        if (dni) {
            if (typeof dni !== 'string') {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: 'El campo "dni" debe ser texto'
                });
            }
            userWhere.dni = dni;
        }

        const patientWhere = {};

        const include = [
            {
                model: User,
                attributes: ['id', 'name', 'lastname', 'email', 'dni', 'is_active'],
                where: userWhere,
                required: true
            }
        ];

        const patient = await Patient.findAll({
            where: patientWhere,
            include,
            limit: limit || 5,
            offset: offset || 0
        });

        return res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Pacientes encontrados exitosamente',
            data: patient
        });
    } catch (error) {
        logger.error(`Error en searchPatient: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Error al buscar pacientes',
            error: error.message
        });
    }
};

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