const jwt = require("jsonwebtoken");
const { secret } = require("../config/auth.config");
const StatusCodes = require("../constants/statusCodes");

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
    return res.status(StatusCodes.FORBIDDEN).json({
      statusCode: StatusCodes.FORBIDDEN,
      data: { message: "No token proporcionado" }
    });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        data: { message: "Token inválido o expirado" }
      });
    }
    
    req.userId = decoded.id;
    req.userRole = decoded.role;
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
    return res.status(StatusCodes.FORBIDDEN).json({
      statusCode: StatusCodes.FORBIDDEN,
      data: { 
        message: `Requiere rol ${allowedRoles.join(",")}` 
      }
    });
  }
  
  next();
};
