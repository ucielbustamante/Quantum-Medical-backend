const { ClinicalRecord, Patient, ClinicalDocument, User } = require("../models");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const logger = require("../config/logger");

exports.createClinicalRecord = async (req, res) => {
    try {
        const { patient_id, title, body } = req.body;

        const patient = await Patient.findOne({
            where: { id: patient_id }
        });
        
        const user = await User.findOne({
            where: { id: req.userId }
        });

        if (!patient || !user || user.is_active === false) {
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "El paciente especificado no existe o el usuario no está activo" }
            });
        }

        const clinicalRecord = await ClinicalRecord.findOne({
            where: { patient_id, is_active: true }
        });

        if (clinicalRecord) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                data: { message: "Ya existe un registro clínico para este paciente" }
            });
        }

        const newClinicalRecord = await ClinicalRecord.create({
            patient_id,
            title,
            body
        });

        const recordWithAssociations = await ClinicalRecord.findOne({
            where: { id: newClinicalRecord.id },
            include: [
                {
                    model: Patient,
                    include: [{ model: User, attributes: ['name', 'lastname', 'email'] }]
                }
            ]
        });

        res.status(StatusCodes.CREATED).json({
            statusCode: StatusCodes.CREATED,
            data: {
                message: "Registro clínico creado exitosamente",
                clinicalRecord: recordWithAssociations
            }
        });
        logger.info(`Registro clínico creado exitosamente: ${newClinicalRecord.id}`);
    } catch (error) {
        logger.error(`Error al crear registro clínico: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al crear registro clínico",
                error: error.message
            }
        });
    }
};

exports.getClinicalRecord = async (req, res) => {
    try {
        const clinical_record = req.clinicalRecord;
        
        // Verificar que el paciente solo puede ver sus propios registros
        if (req.userRole === 'Patient') {
            const patient = await Patient.findOne({
                where: { user_id: req.userId }
            });
            
            if (!patient || clinical_record.patient_id !== patient.id) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    statusCode: StatusCodes.FORBIDDEN,
                    data: { message: "No tienes permiso para ver este registro clínico" }
                });
            }
        }
        
        const clinicalRecord = await ClinicalRecord.findOne({
            where: { id: clinical_record.id },
            include: [
                {
                    model: Patient,
                    include: [{ model: User, attributes: ['name', 'lastname', 'email'] }]
                },
                {
                    model: ClinicalDocument,
                    attributes: ['id', 'file_id', 'mime_type', 'description', 'file_size', 'createdAt']
                }
            ]
        });

        if (!clinicalRecord) {
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Registro clínico no encontrado" }
            });
        }

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { clinicalRecord }
        });
    } catch (error) {
        logger.error(`Error al obtener registro clínico: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al obtener registro clínico",
                error: error.message
            }
        });
    }
};

exports.updateClinicalRecord = async (req, res) => {
    try {
        const clinical_record = req.clinicalRecord;
        const { title, body } = req.body;

        const clinicalRecord = await ClinicalRecord.findOne({
            where: { id: clinical_record.id }
        });

        if (!clinicalRecord) {
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Registro clínico no encontrado o no tienes permiso para modificarlo" }
            });
        }

        await clinicalRecord.update({ title, body });

        const updatedRecord = await ClinicalRecord.findOne({
            where: { id: clinical_record.id },
            include: [
                {
                    model: Patient,
                    include: [{ model: User, attributes: ['name', 'lastname', 'email'] }]
                }
            ]
        });

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: {
                message: "Registro clínico actualizado exitosamente",
                clinicalRecord: updatedRecord
            }
        });
        logger.info(`Registro clínico actualizado exitosamente: ${clinical_record.id}`);
    } catch (error) {
        logger.error(`Error al actualizar registro clínico: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al actualizar registro clínico",
                error: error.message
            }
        });
    }
};

exports.deleteClinicalRecord = async (req, res) => {
    try {
        const clinical_record = req.clinicalRecord;

        const clinicalRecord = await ClinicalRecord.findOne({
            where: { id: clinical_record.id }
        });

        if (!clinicalRecord) {
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Registro clínico no encontrado o no tienes permiso para eliminarlo" }
            });
        }

        await clinicalRecord.update({ is_active: false });

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { message: "Registro clínico eliminado exitosamente" }
        });
        logger.info(`Registro clínico eliminado exitosamente: ${clinical_record.id}`);
    } catch (error) {
        logger.error(`Error al eliminar registro clínico: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al eliminar registro clínico",
                error: error.message
            }
        });
    }
};

exports.searchClinicalRecords = async (req, res) => {
    try {
        const {
            patient_id,
            title,
            limit,
            offset
        } = req.query;

        const where = {};
        
        // Si es un paciente, solo puede ver sus propios registros
        if (req.userRole === 'Patient') {
            const patient = await Patient.findOne({
                where: { user_id: req.userId }
            });
            
            if (!patient) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    statusCode: StatusCodes.NOT_FOUND,
                    data: { message: "Perfil de paciente no encontrado" }
                });
            }
            
            where.patient_id = patient.id;
        } else if (patient_id) {
            // Para doctores y admins, pueden filtrar por patient_id si se especifica
            where.patient_id = patient_id;
        }
        
        if (title) where.title = { [Op.iLike]: `%${title}%` };

        const clinicalRecords = await ClinicalRecord.findAndCountAll({
            where,
            include: [
                {
                    model: Patient,
                    include: [{ model: User, attributes: ['name', 'lastname', 'email'] }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit) || 10,
            offset: parseInt(offset) || 0
        });

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: {
                total: clinicalRecords.count,
                records: clinicalRecords.rows
            }
        });
    } catch (error) {
        logger.error(`Error en búsqueda de registros clínicos: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error en la búsqueda de registros clínicos",
                error: error.message
            }
        });
    }
};
