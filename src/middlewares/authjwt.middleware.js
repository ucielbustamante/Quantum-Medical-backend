const jwt = require("jsonwebtoken");
const { secret } = require("../config/auth.config");
const { StatusCodes } = require("http-status-codes");
const logger = require("../config/logger");

/**
 * Middleware para verificar el token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header?.startsWith("Bearer ") && header.slice(7);
  
  if (!token) {
    logger.warn(`Acceso denegado: Token no proporcionado [${req.method} ${req.originalUrl}]`);
    return res.status(StatusCodes.FORBIDDEN).json({
      statusCode: StatusCodes.FORBIDDEN,
      data: { message: "No token proporcionado" }
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      logger.warn(`Token inválido o expirado [${req.method} ${req.originalUrl}]: ${err.message}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        data: { message: "Token inválido o expirado" }
      });
    }
    
    req.userId = decoded.id;
    req.userRole = decoded.role;
    logger.debug(`Usuario autenticado: ID ${decoded.id}, Rol ${decoded.role}, Ruta: ${req.originalUrl}`);
    next();
  });
};

/**
 * Middleware para verificar roles de usuario
 * @param {...string} roles - Roles permitidos
 * @returns {Function} Middleware function
 */
exports.isRole = (...roles) => (req, res, next) => {
  const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
  
  if (!allowedRoles.includes(req.userRole)) {
    logger.warn(`Acceso denegado: Usuario ID ${req.userId} con rol ${req.userRole} intentó acceder a ruta restringida [${req.method} ${req.originalUrl}]`);
    return res.status(StatusCodes.FORBIDDEN).json({
      statusCode: StatusCodes.FORBIDDEN,
      data: { 
        message: `Requiere rol ${allowedRoles.join(",")}` 
      }
    });
  }
  
  logger.debug(`Verificación de rol exitosa: Usuario ID ${req.userId} con rol ${req.userRole} accedió a [${req.method} ${req.originalUrl}]`);
  next();
};
