'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Appointments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Doctors',
          key: 'id'
        },
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Patients',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Indices compuestos, para busquedas comunes
    await queryInterface.addIndex('Appointments', 
      ['doctor_id', 'date', 'status', 'start_time'],
      { name: 'appointments_doctor_date_status' }
    );

    await queryInterface.addIndex('Appointments', 
      ['patient_id', 'status', 'date'],
      { name: 'appointments_patient_status' }
    );

    await queryInterface.addIndex('Appointments', 
      ['date', 'status'],
      { name: 'appointments_date_status' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Appointments');
  }
};