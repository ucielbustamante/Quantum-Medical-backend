const { User, Doctor, Specialty } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const logger = require("../config/logger");

exports.searchDoctor = async (req, res) => {
    try {
        const {
            name,
            lastname,
            email,
            dni,
            license_number,
            specialties,
            limit,
            offset
        } = req.body;

        const validKeys = [
            'name', 'lastname', 'email', 'dni',
            'license_number', 'specialties', 'limit', 'offset'
        ];
        const receivedKeys = Object.keys(req.body);
        const invalidKeys = receivedKeys.filter(key => !validKeys.includes(key));
        if (invalidKeys.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                message: 'Las keys del body deben ser: ' + validKeys.join(', ')
            });
        }

        const doctorWhere = {};
        if (license_number) doctorWhere.license_number = license_number;

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

        if (Array.isArray(specialties) && specialties.length > 0) {
            doctorWhere['$Specialties.id$'] = { [Op.in]: specialties };
        }

        const include = [
            {
                model: User,
                attributes: ['id', 'name', 'lastname', 'email', 'dni', 'is_active'],
                where: userWhere,
                required: true
            },
            {
                model: Specialty,
                attributes: ['id', 'name'],
                through: { attributes: [] },
                required: false
            }
        ];

        if (Array.isArray(specialties) && specialties.length > 0) {
            include[1].required = true;
        }

        const doctors = await Doctor.findAll({
            where: doctorWhere,
            include,
            limit: limit || 5,
            offset: offset || 0
        });

        return res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: 'Doctores encontrados exitosamente',
            data: doctors
        });
    } catch (error) {
        logger.error(`Error en searchDoctor: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Error al buscar doctores',
            error: error.message
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
