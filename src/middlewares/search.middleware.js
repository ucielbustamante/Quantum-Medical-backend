const { User, Doctor, Patient } = require('../models');
const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

const modelMap = { User, Doctor, Patient };

function needsUserInclude(name) {
  return name === 'Doctor' || name === 'Patient';
}

/**
 * Middleware genérico para buscar entidades por ID
 * @param {string} modelName - Nombre del modelo a buscar ('Doctor', 'Patient', 'User')
 * @returns {Function} Middleware que busca la entidad y la adjunta a req
 */
exports.findById = modelName => async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: 'ID no proporcionado' }
      });
    }
  
    const Model = modelMap[modelName];
    const options = { where: { id } };
  
    if (needsUserInclude(modelName)) {
      options.include = [{
        model: User,
        attributes: ['name','lastname','email','role','dni','is_active']
      }];
    }
  
    try {
      const entity = await Model.findOne(options);
      if (!entity) {
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: `${modelName} no encontrado` }
        });
      }
      req[modelName.toLowerCase()] = entity;
      next();
    } catch (err) {
      logger.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: `Error al buscar ${modelName}` }
      });
    }
  };


  exports.findByEmail = modelName => async (req, res, next) => {
    const { email } = req.params;
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        statusCode: StatusCodes.BAD_REQUEST,
        data: { message: 'Email no proporcionado' }
      });
    }
  
    const Model = modelMap[modelName];
    try {
      let entity;
  
      if (modelName === 'Doctor' || modelName === 'Patient') {
        const user = await User.findOne({
          where: { email, role: modelName, is_active: true }
        });
        if (!user) throw new Error(`${modelName} no encontrado`);
        entity = await Model.findOne({
          where: { user_id: user.id },
          include: [{
            model: User,
            attributes: ['name','lastname','email','role','dni','is_active']
          }]
        });
      } else {
        entity = await Model.findOne({ where: { email, is_active: true } });
      }
  
      if (!entity) throw new Error(`${modelName} no encontrado`);
      req[modelName.toLowerCase()] = entity;
      next();
    } catch (err) {
      logger.error(err.message);
      const code = err.message.includes('no encontrado')
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(code).json({
        statusCode: code,
        data: { message: err.message }
      });
    }
  };

/**
 * Middleware para buscar entidades por email en el body (para POST requests)
 * @param {string} modelName - Nombre del modelo a buscar
 * @returns {Function} Middleware que busca la entidad y la adjunta a req
 */
exports.findByEmailInBody = (modelName) => {
    return async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) {
                logger.error('Email no proporcionado en el body');
                return res.status(StatusCodes.BAD_REQUEST).json({
                    statusCode: StatusCodes.BAD_REQUEST,
                    data: { message: "Email no proporcionado" }
                });
            }

            const Model = getModelByName(modelName);

            if (!Model) {
                logger.error(`Modelo inválido: ${modelName}`);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    data: { message: "Error en la configuración del servidor" }
                });
            }

            const entity = await Model.findOne({ where: { email } });
            if (!entity) {
                logger.error(`${modelName} no encontrado para el email: ${email}`);
                return res.status(StatusCodes.NOT_FOUND).json({
                    statusCode: StatusCodes.NOT_FOUND,
                    data: { message: `${modelName} no encontrado` }
                });
            }

            req[modelName.toLowerCase()] = entity;
            next();
        } catch (error) {
            logger.error(`Error al buscar ${modelName} por email en body: ${error.message}`);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                data: {
                    message: `Error al buscar ${modelName} por email`,
                    error: error.message
                }
            });
        }
    }
}

/**
 * Obtiene el modelo correspondiente según su nombre
 * @param {string} modelName - Nombre del modelo
 * @returns {Object} Instancia del modelo
 */
function getModelByName(modelName) {
    const models = {
        'Doctor': Doctor,
        'Patient': Patient,
        'User': User
    };

    return models[modelName];
}
