const { User, Patient, Doctor } = require("../models");
const jwt    = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { secret, expiresIn } = require("../config/auth.config");
const StatusCodes = require("../constants/statusCodes");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({ 
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Usuario no encontrado" }
      });
    }

    // Si el password_hash es null (usuario de OAuth), no permitir login con password
    if (!user.password_hash) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ 
        statusCode: StatusCodes.UNAUTHORIZED,
        data: { message: "Este usuario debe iniciar sesión con OAuth" }
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ 
        statusCode: StatusCodes.UNAUTHORIZED,
        data: { message: "Contraseña inválida" }
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn });
    return res.status(StatusCodes.OK).send({ 
      statusCode: StatusCodes.OK,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        accessToken: token
      }
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error en el servidor" }
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, lastname, email, password, role, dni } = req.body;
    const user = await User.create({
      name,
      lastname,
      email,
      password_hash: password,
      role,
      dni
    });
    
    if (role === "Patient") {
      await Patient.create({ user_id: user.id });
    } else if (role === "Doctor") {
      await Doctor.create({ user_id: user.id });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn }
    );

    return res.status(StatusCodes.CREATED).send({
      statusCode: StatusCodes.CREATED,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        accessToken: token
      }
    });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).send({ 
      statusCode: StatusCodes.BAD_REQUEST,
      data: { message: err.message }
    });
  }
};