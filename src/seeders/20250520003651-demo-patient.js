'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Consulta para obtener el usuario con email 'juan.perez@example.com'
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'juan.perez@example.com' LIMIT 1;`
    );

    if (users.length === 0) {
      console.error('No se encontró el usuario Juan para crear el paciente');
      return;
    }

    const userId = users[0].id;

    // Verificar si ya existe un registro de paciente para ese usuario
    const [existingPatient] = await queryInterface.sequelize.query(
      `SELECT id FROM "Patients" WHERE user_id = '${userId}' LIMIT 1;`
    );

    if (existingPatient.length > 0) {
      console.log('El paciente ya existe, saltando inserción.');
      return;
    }

    // Inserción del registro en la tabla Patients
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
    // Buscar el usuario Juan nuevamente para identificar el paciente
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'juan.perez@example.com' LIMIT 1;`
    );
    
    if (users.length > 0) {
      const userId = users[0].id;
      // Eliminar el registro del paciente asociado a ese user_id
      await queryInterface.bulkDelete('Patients', { user_id: userId }, {});
    }
  }
};
