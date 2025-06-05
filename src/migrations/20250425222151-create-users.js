'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Después
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      lastname: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255) },
      role: {
        type: Sequelize.ENUM("Patient", "Doctor", "Admin"),
        allowNull: false,
        defaultValue: "Patient"
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      dni: { type: Sequelize.STRING(20) },
      reset_password_token: { type: Sequelize.STRING(255), allowNull: true, defaultValue: null },
      reset_password_expires: { type: Sequelize.DATE, allowNull: true, defaultValue: null },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Users");
    // Si quieres seguir usando queryInterface.sequelize:
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Users_role";'
    );
  }
};
