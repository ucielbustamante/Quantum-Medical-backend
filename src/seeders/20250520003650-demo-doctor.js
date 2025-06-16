'use strict';

const uuids = [
  "04c3c24a-ab08-4632-a2a7-a232ecfa040c",
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
];

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Ejecutando seeder de Doctors...");
    
    //Traer todos los users con rol Doctor
    const [doctors] = await queryInterface.sequelize.query(
      `SELECT id, email
         FROM "Users"
        WHERE role = 'Doctor'
          AND email LIKE 'dr.%';`
    );
    if (!doctors.length) {
      console.log("No hay usuarios con rol Doctor, nada que insertar.");
      return;
    }

    //Saber qué user_id ya existe en la tabla Doctors
    //    (para saltarlos todos de un saque)
    const userIdsList = doctors.map(d => `'${d.id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT user_id
         FROM "Doctors"
        WHERE user_id IN (${userIdsList});`
    );
    const existingUserIds = new Set(existing.map(r => r.user_id));

    //Construir sólo los registros faltantes
    const records = doctors
      .map((doctor, i) => {
        // si ya existe, lo salta
        if (existingUserIds.has(doctor.id)) {
          console.log(`- Omisión: doctor ${doctor.email} ya existe.`);
          return null;
        }
        // caso contrario, preparamos el record
        return {
          id: uuids[i],
          user_id: doctor.id,
          license_number: `DOC-${(1000 + i).toString().padStart(4, '0')}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
      .filter(r => r !== null);

    //Insertar solo los nuevos
    if (records.length) {
      await queryInterface.bulkInsert('Doctors', records, {});
      console.log(`→ Insertados ${records.length} nuevos doctores.`);
    } else {
      console.log("→ No había doctores nuevos que insertar.");
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar únicamente los UUIDs fijos de este seeder
    await queryInterface.bulkDelete('Doctors', {
      id: { [Sequelize.Op.in]: uuids }
    }, {});
    console.log("Seeder Doctors revertido: borrados los IDs fijos.");
  }
};
