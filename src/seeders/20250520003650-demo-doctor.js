'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Consultar el usuario Laura por email
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'laura.gomez@example.com' LIMIT 1;`
    );

    if (users.length === 0) {
      console.error('No se encontró el usuario Laura para crear el doctor');
      return;
    }

    const userId = users[0].id;

    // Verificar si ya existe un doctor con ese user_id y license_number
    const [existingDoctor] = await queryInterface.sequelize.query(
      `SELECT id FROM "Doctors" WHERE user_id = '${userId}' AND license_number = 'DOC-4567' LIMIT 1;`
    );

    if (existingDoctor.length > 0) {
      console.log('El doctor ya existe, saltando inserción.');
      return;
    }

    // Insertar el nuevo registro en la tabla Doctors
    await queryInterface.bulkInsert('Doctors', [{
      id: uuidv4(),
      user_id: userId,
      license_number: 'DOC-4567',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    // Eliminar el doctor insertado según el license_number
    await queryInterface.bulkDelete('Doctors', { license_number: 'DOC-4567' }, {});
  }
};