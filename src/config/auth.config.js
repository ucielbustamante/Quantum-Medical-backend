
module.exports = {
    secret: process.env.JWT_SECRET || "clave_super_secreta",
    expiresIn: 86400 // 24h
};
  