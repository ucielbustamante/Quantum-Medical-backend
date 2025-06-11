const { ClinicalDocument, ClinicalRecord, Doctor, Patient, User } = require("../models");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");
const fileService = require("../services/file.service");

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                data: { message: "No se proporcionó ningún archivo" }
            });
        }

        const clinical_record = req.clinicalRecord;
        const { description, user_id } = req.body;

        // Verificar que el registro clínico existe
        const clinicalRecord = await ClinicalRecord.findOne({
            where: { id: clinical_record.id }
        });

        if (!clinicalRecord) {
            // Limpiar el archivo temporal
            await fileService.deleteFile(req.file.path).catch(console.error);
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Registro clínico no encontrado o no tienes permiso para modificarlo" }
            });
        }

        const document = await fileService.uploadFile(
            req.file,
            clinical_record.id,
            user_id,
            description
        );

        res.status(StatusCodes.CREATED).json({
            statusCode: StatusCodes.CREATED,
            data: {
                message: "Documento clínico subido exitosamente",
                document
            }
        });
        logger.info(`Documento clínico subido exitosamente: ${document.id}`);
    } catch (error) {
        logger.error(`Error al subir documento clínico: ${error.message}`);
        // Limpiar el archivo temporal en caso de error
        if (req.file) {
            await fileService.deleteFile(req.file.path).catch(console.error);
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al subir documento clínico",
                error: error.message
            }
        });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const clinical_document = req.clinicalDocument;

        // Verificar que el documento existe
        const document = await ClinicalDocument.findOne({
            where: { id: clinical_document.id },
            include: [{
                model: ClinicalRecord,
                required: true
            }]
        });

        if (!document) {
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Documento no encontrado o no tienes permiso para eliminarlo" }
            });
        }

        await fileService.deleteFile(clinical_document.id);

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { message: "Documento clínico eliminado exitosamente" }
        });
        logger.info(`Documento clínico eliminado exitosamente: ${clinical_document.id}`);
    } catch (error) {
        logger.error(`Error al eliminar documento clínico: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al eliminar documento clínico",
                error: error.message
            }
        });
    }
};

exports.getDocument = async (req, res) => {
    try {
        const clinical_document = req.clinicalDocument;
        const requesterId = req.userId;
        const requesterRole = req.userRole;

        const document = await ClinicalDocument.findOne({
            where: { id: clinical_document.id },
            include: [{
                model: ClinicalRecord,
                required: true,
                include: [{
                    model: Patient,
                    required: true,
                    include: [{ model: User, required: true }]
                }]
            }, {
                model: User,
                required: true
            }]
        });

        if (!document) {
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Documento no encontrado" }
            });
        }

        const patientUserId = document.ClinicalRecord.Patient.User.id;
        const isPatientOwner = requesterRole === 'Patient' && requesterId === patientUserId;

        if (!(isPatientOwner || requesterRole === 'Admin' || requesterRole === 'Doctor')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                statusCode: StatusCodes.FORBIDDEN,
                data: { 
                    message: "No tienes permisos para acceder a este documento. Solo el paciente, el doctor asociado o un administrador pueden acceder."
                }
            });
        }

        const downloadUrl = await fileService.getDownloadUrl(clinical_document.id);

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: {
                document,
                downloadUrl
            }
        });
    } catch (error) {
        logger.error(`Error al obtener documento clínico: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al obtener documento clínico",
                error: error.message
            }
        });
    }
};

exports.listDocumentsByRecord = async (req, res) => {
    try {
        const clinical_record = req.clinicalRecord;

        if (!clinical_record) {
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Registro clínico no encontrado o no tienes permiso para acceder a él" }
            });
        }

        const documents = await fileService.listDocumentsByClinicalRecord(clinical_record);

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { documents }
        });
    } catch (error) {
        logger.error(`Error al listar documentos clínicos: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: {
                message: "Error al listar documentos clínicos",
                error: error.message
            }
        });
    }
};
