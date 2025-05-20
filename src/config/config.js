require('dotenv').config();

const {
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_HOST,
  DB_PORT = 5432,
  DB_DIALECT = 'postgres'
} = process.env;

// Configuración de pool de conexiones
const poolConfig = {
  max: 20,
  min: 5,
  acquire: 30000,
  idle: 10000,
  evict: 1000
};

// Configuración base compartida
const baseConfig = {
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: DB_DIALECT,
  pool: poolConfig,
  logging: msg => require('./logger').debug(msg)
};

module.exports = {
  development: {
    ...baseConfig
  },
  test: {
    ...baseConfig,
    logging: false
  },
  production: {
    ...baseConfig,
    logging: false
  }
};
