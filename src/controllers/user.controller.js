const { User } = require("../models");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");

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
    const user = await User.create(req.body);
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
