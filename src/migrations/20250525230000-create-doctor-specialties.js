'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DoctorSpecialties", {
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Doctors",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      specialty_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Specialties",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    //restricción de clave primaria compuesta para evitar la duplicación de registros
    await queryInterface.addConstraint("DoctorSpecialties", {
      fields: ["doctor_id", "specialty_id"],
      type: "primary key",
      name: "pk_doctor_specialties"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("DoctorSpecialties");
  }
};
