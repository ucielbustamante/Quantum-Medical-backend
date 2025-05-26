'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener el doctor por su licencia
    const [doctorResult] = await queryInterface.sequelize.query(
      `SELECT id FROM "Doctors" WHERE license_number = 'DOC-4567' LIMIT 1;`
    );

    if (doctorResult.length === 0) {
      console.error('No se encontró el doctor con la licencia "DOC-4567" para crear la asociación.');
      return;
    }
    const doctorId = doctorResult[0].id;

    // Obtener la especialidad por su nombre (Cardiología)
    const [specialtyResult] = await queryInterface.sequelize.query(
      `SELECT id FROM "Specialties" WHERE name = 'Cardiología' LIMIT 1;`
    );

    if (specialtyResult.length === 0) {
      console.error('No se encontró la especialidad "Cardiología" para crear la asociación.');
      return;
    }
    const specialtyId = specialtyResult[0].id;

    // Verificar si ya existe la asociación en la tabla DoctorSpecialties
    const [existingRecord] = await queryInterface.sequelize.query(
      `SELECT * FROM "DoctorSpecialties" WHERE doctor_id = '${doctorId}' AND specialty_id = '${specialtyId}' LIMIT 1;`
    );

    if (existingRecord.length > 0) {
      console.log('La asociación Doctor-Specialty ya existe, saltando la inserción.');
      return;
    }

    // Insertar la asociación en la tabla intermedia
    await queryInterface.bulkInsert('DoctorSpecialties', [{
      doctor_id: doctorId,
      specialty_id: specialtyId,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    console.log('Registro de DoctorSpecialties insertado correctamente.');
  },

  async down(queryInterface, Sequelize) {
    // Revertir la inserción de la asociación
    const [doctorResult] = await queryInterface.sequelize.query(
      `SELECT id FROM "Doctors" WHERE license_number = 'DOC-4567' LIMIT 1;`
    );
    const [specialtyResult] = await queryInterface.sequelize.query(
      `SELECT id FROM "Specialties" WHERE name = 'Cardiología' LIMIT 1;`
    );

    if (doctorResult.length > 0 && specialtyResult.length > 0) {
      const doctorId = doctorResult[0].id;
      const specialtyId = specialtyResult[0].id;
      await queryInterface.bulkDelete('DoctorSpecialties', {
        doctor_id: doctorId,
        specialty_id: specialtyId
      }, {});
    }
  }
};