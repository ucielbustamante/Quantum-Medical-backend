require("dotenv").config();

const {
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_HOST,
  DB_DIALECT
} = process.env;

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host:     DB_HOST,
    dialect:  DB_DIALECT,
  },
  test: {
    username : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
    host     : process.env.DB_HOST,
    port     : process.env.DB_PORT || 5432,
    dialect  : 'postgres',
    logging  : false,
  },
  production: {
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host:     DB_HOST,
    dialect:  DB_DIALECT,
  }
};
