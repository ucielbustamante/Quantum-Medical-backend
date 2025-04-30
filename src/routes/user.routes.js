const r = require("express").Router();
const { verifyToken, isRole } = require("../middlewares/authjwt");
const { User, Patient, Doctor } = require("../models");
const StatusCodes = require("../constants/statusCodes");

r.get("/patient/profile", verifyToken, isRole("Patient"), async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [{
                model: Patient,
                required: true
            }]
        });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Usuario no encontrado" }
            });
        }

        res.status(StatusCodes.OK).send({
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
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { message: "Error al obtener el perfil" }
        });
    }
});

r.get("/doctor/dashboard", verifyToken, isRole("Doctor"), async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ 
            where: { user_id: req.userId },
            include: [{
                model: User,
                attributes: ['name', 'lastname', 'email', 'dni']
            }]
        });

        if (!doctor) {
            return res.status(StatusCodes.NOT_FOUND).send({
                statusCode: StatusCodes.NOT_FOUND,
                data: { message: "Doctor no encontrado" }
            });
        }

        res.status(StatusCodes.OK).send({
            statusCode: StatusCodes.OK,
            data: { doctor }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { message: "Error al obtener el dashboard" }
        });
    }
});

r.get("/admin/users", verifyToken, isRole("Admin"), async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(StatusCodes.OK).send({
            statusCode: StatusCodes.OK,
            data: { users }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            data: { message: "Error al obtener los usuarios" }
        });
    }
});

module.exports = r;
