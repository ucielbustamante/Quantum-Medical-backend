'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("OAuthAccounts", {
      id:               { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      user_id:          {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE"
      },
      provider:         { type: Sequelize.STRING(30), allowNull: false },
      provider_user_id: { type: Sequelize.STRING(255), allowNull: false },
      email:            { type: Sequelize.STRING(255) },
      name:             { type: Sequelize.STRING(255) },
      lastname:         { type: Sequelize.STRING(255) },
      access_token:     { type: Sequelize.STRING(255) },
      refresh_token:    { type: Sequelize.STRING(255) },
      expires_at:       { type: Sequelize.DATE },
      createdAt:        { type: Sequelize.DATE, allowNull: false },
      updatedAt:        { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addConstraint("OAuthAccounts", {
      fields: ["provider","provider_user_id"],
      type: "unique",
      name: "uq_oauth_provider_user"
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("OAuthAccounts");
  }
};
