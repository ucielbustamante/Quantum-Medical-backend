'use strict';

const uuids = [
  "55871770-a67b-4e25-a406-e31b2bae8b8e",
  "c70f1747-2735-4401-9895-78585ebdda7b",
  "c381ab7d-df38-4e15-83e4-758e1f0d9117",
  "e7185944-b0a5-4cf5-89d2-b155c5fb2367",
  "7537cefc-d35e-41db-8b08-954030fc3a30",
  "28d99f2d-9380-46a1-b7c7-e9f8bf5ed862",
  "a32d91f4-fcc2-40af-aafc-74ab07427626",
  "72fb6dce-efe0-4b01-9c00-07002567dac1",
  "19ce50c8-4bad-4aa1-87a7-bd1f1707b10a",
  "808e254c-46db-4efe-bc6d-6a5244a7fe84",
  "2967986b-5556-40e5-8701-ddbceed0a1a2",
  "fd01fbb6-8e5d-45e3-a01c-5effc345a573",
  "c1d00644-2865-4ef0-b558-52008b20a1e3"
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener todos los usuarios con rol Doctor
    const [doctors] = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE role = 'Doctor' AND email LIKE 'dr.%';`
    );

    if (doctors.length === 0) {
      console.log('No se encontraron usuarios con rol Doctor');
      return;
    }

    const doctorRecords = await Promise.all(doctors.map(async (doctor) => {
      let id = -1;
      const [existingDoctor] = await queryInterface.sequelize.query(
        `SELECT id FROM "Doctors" WHERE user_id = '${doctor.id}' LIMIT 1;`
      );

      if (existingDoctor.length > 0) {
        console.log(`El doctor ${doctor.email} ya tiene un registro, saltando inserción.`);
        return null;
      }
      id++;
      const licenseNumber = `DOC-${(1000 + id).toString().padStart(4, '0')}`;
      return {
        id: uuids[id],
        user_id: doctor.id,
        license_number: licenseNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }));

    // Filtrar los registros nulos (doctores que ya existían)
    const validRecords = doctorRecords.filter(record => record !== null);

    if (validRecords.length > 0) {
      await queryInterface.bulkInsert('Doctors', validRecords, {});
      console.log(`Se insertaron ${validRecords.length} registros de doctores`);
    } else {
      console.log('No se insertaron nuevos registros de doctores');
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar todos los doctores que fueron creados por este seeder
    await queryInterface.bulkDelete('Doctors', {
      license_number: {
        [Sequelize.Op.like]: 'DOC-%'
      }
    }, {});
  }
};