const { Doctor, User, Patient } = require("../models");
const express = require("express");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");
const { verifyToken, isRole } = require("../middlewares/authjwt.middleware");
const router = express.Router();

router.get("/doctor/dashboard", verifyToken, isRole("Doctor"), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ 
            where: { user_id: req.userId },
            include: [{
                model: User,
                attributes: ['name', 'lastname', 'email', 'dni']
            }]
        });

        if (!doctor) {
            logger.error(`Doctor no encontrado para el ID: ${req.userId}`);
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Doctor no encontrado" }
            });
        }

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { doctor }
        });
        logger.info(`Dashboard del doctor obtenido exitosamente: ${doctor.id}`);
    } catch (error) {
        logger.error(`Error al obtener el dashboard del doctor: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { message: "Error al obtener el dashboard" }
        });
    }
});

router.get("/admin/users", verifyToken, isRole("Admin"), async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: { users }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { message: "Error al obtener los usuarios" }
        });
    }
});


router.get("/patient/profile", verifyToken, isRole("Patient"), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [{
                model: Patient,
                required: true
            }]
        });

        if (!user) {
            logger.error(`Usuario no encontrado para el ID: ${req.userId}`);
            return res.status(StatusCodes.NOT_FOUND).json({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Usuario no encontrado" }
            });
        }

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    lastname: user.lastname,
                    email: user.email,
                    role: user.role,
                    dni: user.dni,
                    patient: user.Patient
                }
            }
        });
        logger.info(`Perfil del usuario obtenido exitosamente: ${user.id}`);
    } catch (error) {
        logger.error(`Error al obtener el perfil del usuario: ${error.message}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { message: "Error al obtener el perfil" }
        });
    }
});

module.exports = router;