'use strict';

// IDs de doctores del seeder demo-doctor.js
const doctorIds = [
  "04c3c24a-ab08-4632-a2a7-a232ecfa040c", // dr.alvarez
  "c70f1747-2735-4401-9895-78585ebdda7b", // dr.rodriguez
  "c381ab7d-df38-4e15-83e4-758e1f0d9117", // dr.martinez
  "e7185944-b0a5-4cf5-89d2-b155c5fb2367", // dr.fernandez
  "7537cefc-d35e-41db-8b08-954030fc3a30", // dr.garcia
  "28d99f2d-9380-46a1-b7c7-e9f8bf5ed862", // dr.perez
  "a32d91f4-fcc2-40af-aafc-74ab07427626", // dr.gomez
  "72fb6dce-efe0-4b01-9c00-07002567dac1", // dr.sanchez
  "19ce50c8-4bad-4aa1-87a7-bd1f1707b10a", // dr.gonzalez
  "808e254c-46db-4efe-bc6d-6a5244a7fe84", // dr.morales
  "2967986b-5556-40e5-8701-ddbceed0a1a2", // dr.torres
  "fd01fbb6-8e5d-45e3-a01c-5effc345a573", // dr.lopez
  "c1d00644-2865-4ef0-b558-52008b20a1e3"  // dr.ramirez
];

// IDs de especialidades del seeder demo-specialty.js
const specialtyIds = [
  "ffe545c8-487d-4ea3-8506-fe15eaea621f", // Cardiología
  "d0b77bd2-e8ea-4dc4-b778-22f654e6bbd6", // Traumatología
  "9acab4b5-b29e-4bb3-a3d6-4718e7c47a9f", // Dermatología
  "a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d", // Neurología
  "b2c3d4e5-f6a7-4b5c-9d8e-0f1a2b3c4d5e", // Pediatría
  "c3d4e5f6-a7b8-4c5d-0e9f-1a2b3c4d5e6f", // Ginecología
  "d4e5f6a7-b8c9-4d5e-1f0a-2b3c4d5e6f7a", // Urología
  "e5f6a7b8-c9d0-4e5f-2a1b-3c4d5e6f7a8b", // Oncología
  "f6a7b8c9-d0e1-4f5a-3b2c-4d5e6f7a8b9c"  // Endocrinología
];

// Distribución de especialidades por doctor (cada doctor tendrá 1-3 especialidades)
const doctorSpecialties = [
  [0, 1],           // Alvarez: Cardiología, Traumatología
  [2, 3, 4],        // Rodriguez: Dermatología, Neurología, Pediatría
  [0, 5],           // Martinez: Cardiología, Ginecología
  [1, 6],           // Fernandez: Traumatología, Urología
  [2, 7],           // Garcia: Dermatología, Oncología
  [3, 8],           // Perez: Neurología, Endocrinología
  [4, 5],           // Gomez: Pediatría, Ginecología
  [6, 7],           // Sanchez: Urología, Oncología
  [0, 8],           // Gonzalez: Cardiología, Endocrinología
  [1, 2, 3],        // Morales: Traumatología, Dermatología, Neurología
  [4, 5, 6],        // Torres: Pediatría, Ginecología, Urología
  [7, 8, 0],        // Lopez: Oncología, Endocrinología, Cardiología
  [1, 3, 5]         // Ramirez: Traumatología, Neurología, Ginecología
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Ejecutando seeder de DoctorSpecialties...");

    // Verificar que existan todos los doctores
    const [existingDoctors] = await queryInterface.sequelize.query(
      `SELECT id FROM "Doctors" WHERE id IN (${doctorIds.map(id => `'${id}'`).join(', ')});`
    );

    if (existingDoctors.length === 0) {
      console.error('No se encontraron doctores para crear las asociaciones.');
      return;
    }

    // Verificar que existan todas las especialidades
    const [existingSpecialties] = await queryInterface.sequelize.query(
      `SELECT id FROM "Specialties" WHERE id IN (${specialtyIds.map(id => `'${id}'`).join(', ')});`
    );

    if (existingSpecialties.length === 0) {
      console.error('No se encontraron especialidades para crear las asociaciones.');
      return;
    }

    // Crear las asociaciones
    const associations = [];
    for (let i = 0; i < doctorIds.length; i++) {
      const doctorId = doctorIds[i];
      const specialtiesForDoctor = doctorSpecialties[i];

      for (const specialtyIndex of specialtiesForDoctor) {
        const specialtyId = specialtyIds[specialtyIndex];
        
        // Verificar si ya existe la asociación
        const [existing] = await queryInterface.sequelize.query(
          `SELECT * FROM "DoctorSpecialties" WHERE doctor_id = '${doctorId}' AND specialty_id = '${specialtyId}' LIMIT 1;`
        );

        if (existing.length === 0) {
          associations.push({
            doctor_id: doctorId,
            specialty_id: specialtyId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    if (associations.length > 0) {
      await queryInterface.bulkInsert('DoctorSpecialties', associations, {});
      console.log(`Se insertaron ${associations.length} asociaciones doctor-especialidad`);
    } else {
      console.log('No se insertaron nuevas asociaciones doctor-especialidad');
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar todas las asociaciones creadas por este seeder
    await queryInterface.bulkDelete('DoctorSpecialties', {
      doctor_id: {
        [Sequelize.Op.in]: doctorIds
      }
    }, {});
    console.log("Asociaciones doctor-especialidad eliminadas correctamente");
  }
};