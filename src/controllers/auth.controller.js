const { User, Patient, Doctor } = require("../models");
const jwt    = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { secret, expiresIn } = require("../config/auth.config");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");
const mailService = require("../services/mail.service");
const { Op } = require("sequelize");

exports.login = async (req, res) => {
  try {
    if (!req.user) {
      logger.error(`User no encontrado para el email: ${req.body?.email}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Usuario no encontrado" }
      });
    }
    

    const user = req.user;
    const { password } = req.body;

    logger.info(`Intento de login para email: ${user.email}`);

    // Si es usuario OAuth (password_hash nulo), no permitir login con contraseña
    if (!user.password_hash) {
      logger.warn(`Intento de login con password para usuario OAuth: ${user.email}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        statusCode: StatusCodes.UNAUTHORIZED,
        data: { message: "Este usuario debe iniciar sesión con OAuth" }
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      logger.warn(`Intento de login fallido - contraseña inválida para: ${user.email}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({ 
        statusCode: StatusCodes.UNAUTHORIZED,
        data: { message: "Contraseña inválida" }
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn });
    logger.info(`Login exitoso para usuario: ${user.email}, rol: ${user.role}`);

    return res.status(StatusCodes.OK).json({ 
      statusCode: StatusCodes.OK,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        accessToken: token
      }
    });
  } catch (error) {
    logger.error(`Error en login: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error en el servidor" }
    });
  }
};

exports.register = async (req, res) => {
  try {
    
    logger.info(`Intento de registro para email: ${req.body.email}, rol: ${req.body.role}`);
    
    const { name, lastname, email, password, role, dni } = req.body;
    if (!name || !lastname || !email || !password || !role || !dni) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "Faltan campos obligatorios" }
      });
    }
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
      logger.debug(`Paciente creado para user_id: ${user.id}`);
    } else if (role === "Doctor") {
      await Doctor.create({ user_id: user.id });
      logger.debug(`Doctor creado para user_id: ${user.id}`);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn }
    );

    logger.info(`Registro exitoso para usuario: ${email}, id: ${user.id}, rol: ${role}`);
    return res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        accessToken: token,
        name: user.name,
        lastname: user.lastname
      }
    });
  } catch (err) {
    logger.error(`Error en registro: ${err.message}`, { stack: err.stack });
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      statusCode: StatusCodes.BAD_REQUEST,
      data: { message: err.message }
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        statusCode: StatusCodes.NOT_FOUND,
        data: { message: "Usuario no encontrado" }
      });
    }
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
    user.reset_password_token = token;
    user.reset_password_expires = new Date(Date.now() + 3600000);
    await user.save();
    logger.info(`Correo de restablecimiento de contraseña enviado a: ${email}, token: ${token}`);
    await mailService.sendResetPasswordEmail(user, token);
    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: { message: "Correo de restablecimiento de contraseña enviado" }
    });
  } catch (error) {
    logger.error(`Error en resetPassword: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: error.message }
    });
  }
};

exports.confirmResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      logger.warn('Intento de reset de contraseña sin token o nueva contraseña');
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "Token y nueva contraseña son requeridos" }
      });
    }

    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      logger.warn(`Intento de reset de contraseña con token inválido o expirado: ${token}`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: "Token inválido o expirado" }
      });
    }

    // Actualizar contraseña
    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    logger.info(`Contraseña actualizada exitosamente para usuario: ${user.email}`);
    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: { message: "Contraseña actualizada exitosamente" }
    });
  } catch (error) {
    logger.error(`Error en confirmResetPassword: ${error.message}`, { stack: error.stack });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al actualizar la contraseña" }
    });
  }
};
