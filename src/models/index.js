'use strict';

const fs   = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);
const env      = process.env.NODE_ENV || 'development';
const config   = require(path.join(__dirname, '..', 'config', 'config.js'))[env];

const db = {};

/* ─────────── instanciar Sequelize ─────────── */
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);

} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

/* ─────────── carga dinámica de modelos ─────────── */
fs.readdirSync(__dirname)
  .filter(f =>
    f.indexOf('.') !== 0 &&
    f !== basename &&
    f.slice(-3) === '.js' &&
    !f.endsWith('.test.js')
  )
  .forEach(f => {
    const model = require(path.join(__dirname, f))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(name => {
  if (db[name].associate) db[name].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
