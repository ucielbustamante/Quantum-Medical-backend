const { User, Patient, Doctor } = require("../models");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");
const { Op } = require("sequelize");

exports.searchUser = async (req, res) => {
  try {
    const {
      name,
      lastname,
      email,
      role,
      dni,
      limit,
      offset
    } = req.body;

    const validKeys = [
      'name', 'lastname', 'email', 'role', 'dni', 'limit', 'offset'
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
    if (role) userWhere.role = role;
    if (dni) {
      if (typeof dni !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'El campo "dni" debe ser texto'
        });
      }
      userWhere.dni = dni;
    }

    const include = [
      {
        model: Patient,
        attributes: ['id', 'health_insurance', 'health_insurance_number', 'birthday'],
        required: false
      },
      {
        model: Doctor,
        attributes: ['id', 'license_number'],
        required: false
      }
    ];

    const users = await User.findAll({
      where: userWhere,
      attributes: ['id', 'name', 'lastname', 'email', 'role', 'dni', 'is_active'],
      include,
      limit: limit || 5,
      offset: offset || 0
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: 'Usuarios encontrados exitosamente',
      data: users
    });
  } catch (error) {
    logger.error(`Error al buscar el usuario: ${error.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Error al buscar el usuario',
      error: error.message
    });
  }
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
