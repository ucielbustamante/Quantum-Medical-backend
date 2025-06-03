'use strict';

let ids = ["459d9857-d83f-4bb5-a762-f7c1a9b86c83",
          "13cf6790-cc14-426a-8a78-54b97582b4fe",
          "ecc00185-2636-4bf5-9629-ba29cd65c90d",
          "41af675d-05a0-4c7b-a224-37795bcc014c",
          "68576161-a177-4b32-b359-78f885819001",
          "fda262b5-29ea-4212-b4a3-f40dd6f1a24b",
          "5d8e7b30-fc27-49b4-809b-dce291c91fab",
          "30d7f2f7-0087-49ac-8f88-213f48533a6a"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener todos los usuarios con rol Patient
    const [patients] = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users" WHERE role = 'Patient' AND email LIKE 'patient.%';`
    );

    if (patients.length === 0) {
      console.log('No se encontraron usuarios con rol Patient');
      return;
    }

    // Lista de aseguradoras de ejemplo
    const healthInsurances = ['OSDE', 'Swiss Medical', 'Medicus', 'Galeno', 'Omint', 'SanCor Salud'];
    // Generar registros de pacientes
    const patientRecords = await Promise.all(patients.map(async (patient, i) => {
      // Verificar si ya existe un paciente con ese user_id
      const [existingPatient] = await queryInterface.sequelize.query(
        `SELECT id FROM "Patients" WHERE user_id = '${patient.id}' LIMIT 1;`
      );

      if (existingPatient.length > 0) {
        console.log(`El paciente ${patient.email} ya tiene un registro, saltando inserción.`);
        return null;
      }

      // Generar datos aleatorios para el paciente
      const randomInsurance = healthInsurances[Math.floor(Math.random() * healthInsurances.length)];
      const randomInsuranceNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
      // Generar una fecha de nacimiento aleatoria entre 18 y 80 años
      const today = new Date();
      const minAge = 18;
      const maxAge = 80;
      const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
      const birthday = new Date(today.getFullYear() - randomAge, 
                              Math.floor(Math.random() * 12), 
                              Math.floor(Math.random() * 28) + 1);
      return {
        id: ids[i],
        user_id: patient.id,
        health_insurance: randomInsurance,
        health_insurance_number: randomInsuranceNumber,
        birthday: birthday,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }));

    // Filtrar los registros nulos (pacientes que ya existían)
    const validRecords = patientRecords.filter(record => record !== null);

    if (validRecords.length > 0) {
      await queryInterface.bulkInsert('Patients', validRecords, {});
      console.log(`Se insertaron ${validRecords.length} registros de pacientes`);
    } else {
      console.log('No se insertaron nuevos registros de pacientes');
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar todos los pacientes que fueron creados por este seeder
    await queryInterface.bulkDelete('Patients', {
      health_insurance: {
        [Sequelize.Op.in]: ['OSDE', 'Swiss Medical', 'Medicus', 'Galeno', 'Omint', 'SanCor Salud']
      }
    }, {});
  }
};
