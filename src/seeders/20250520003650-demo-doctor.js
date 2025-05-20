'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'laura.gomez@example.com' LIMIT 1;`
    );

    if (users.length === 0) {
      console.error('No se encontró el usuario Laura para crear el doctor');
      return;
    }

    const userId = users[0].id;

    await queryInterface.bulkInsert('Doctors', [{
      id: uuidv4(),
      user_id: userId,
      license_number: 'DOC-4567',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Doctors', null, {});
  }
};
