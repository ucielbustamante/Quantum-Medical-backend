const { User, Patient, Doctor } = require("../models");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { is_active: true },
    });

    logger.info(`Usuarios consultados exitosamente. Total: ${users.length}`);

    return res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: users,
    });
  } catch (error) {
    logger.error(`Error al obtener usuarios: ${error.message}`, { stack: error.stack });

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al obtener los usuarios" },
    });
  }
};

exports.getUser = (req, res) => {
  const user = req.user;
  res.status(StatusCodes.OK).json({
    statusCode: StatusCodes.OK,
    data: { user }
  });
};

exports.getUserByEmail = (req, res) => {
  const user = req.user;
  res.status(StatusCodes.OK).json({
    statusCode: StatusCodes.OK,
    data: { user }
  });
};

exports.createUser = async (req, res) => {
  try {
    const { name, lastname, email, password, role, dni } = req.body;
    const user = await User.create({ name, lastname, email, password_hash: password, role, dni });
    if (role === "Patient") {
      await Patient.create({ user_id: user.id });
    } else if (role === "Doctor") {
      await Doctor.create({ user_id: user.id });
    }
    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      data: { user }
    });
  } catch (error) {
    logger.error(`Error al crear el usuario: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al crear el usuario" }
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = req.user;
    await user.update(req.body);
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: {
        message: "Usuario actualizado exitosamente",
        user
      }
    });
  } catch (error) {
    logger.error(`Error al actualizar el usuario: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al actualizar el usuario" }
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = req.user;
    await user.update({ is_active: false });
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: { message: "Usuario desactivado exitosamente" }
    });
  } catch (error) {
    logger.error(`Error al desactivar el usuario: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      data: { message: "Error al desactivar el usuario" }
    });
  }
};
