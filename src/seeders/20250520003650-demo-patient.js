'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'juan.perez@example.com' LIMIT 1;`
    );

    if (users.length === 0) {
      console.error('No se encontró el usuario Juan para crear el paciente');
      return;
    }

    const userId = users[0].id;

    await queryInterface.bulkInsert('Patients', [{
      id: uuidv4(),
      user_id: userId,
      health_insurance: 'OSDE',
      health_insurance_number: '123456789',
      birthday: new Date('1990-01-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Patients', null, {});
  }
};
