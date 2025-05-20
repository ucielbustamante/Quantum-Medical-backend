'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT * FROM "Users" WHERE email IN ('juan.perez@example.com', 'laura.gomez@example.com')`
    );

    if (existingUsers[0].length > 0) {
      console.log('Los usuarios demo ya existen, saltando creación...');
      return;
    }

    // Crear usuarios demo
    await queryInterface.bulkInsert('Users', [{
      id: '015117a8-94cf-41d3-981f-43f46108ec57',
      name: 'Juan',
      lastname: 'Pérez',
      email: 'juan.perez@example.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'Patient',
      dni: '12345678',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: '0e50465d-cae0-4682-8b27-f22cbfe3454b',
      name: 'Laura',
      lastname: 'Gómez',
      email: 'laura.gomez@example.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'Doctor',
      dni: '87654321',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '0e50465d-cae0-4682-8b27-f22cbfe3454c',
      name: 'Admin',
      lastname: 'Admin',
      email: 'admin@example.com',
      password_hash: bcrypt.hashSync('password123', 10),
      role: 'Admin',
      dni: '12345678',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: {
        [Sequelize.Op.in]: ['juan.perez@example.com', 'laura.gomez@example.com', 'admin@example.com']
      }
    }, {});
  }
};
