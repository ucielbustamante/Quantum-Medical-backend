'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Patients", {
      id:                         { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      user_id:                    {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE"
      },
      health_insurance:           { type: Sequelize.STRING(255) },
      health_insurance_number:    { type: Sequelize.STRING(255) },
      birthday:                   { type: Sequelize.DATE },
      createdAt:                  { type: Sequelize.DATE, allowNull: false },
      updatedAt:                  { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Patients");
  }
};