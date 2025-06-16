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

    //Listar usuarios con rol Doctor
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, email 
         FROM "Users" 
        WHERE role = 'Doctor' AND email LIKE 'dr.%';`
    );
    if (!users.length) {
      console.log('No se encontraron usuarios con rol Doctor');
      return;
    }

    //Saber qué IDs ya existen en la tabla Doctors
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id 
         FROM "Doctors" 
        WHERE id IN (${uuids.map(u => `'${u}'`).join(',')});`
    );
    const existingIds = new Set(existing.map(r => r.id));

    //Construir sólo los registros faltantes
    const records = users
      .map((user, idx) => {
        const id = uuids[idx];
        if (existingIds.has(id)) {
          console.log(`- Omisión: doctor con id ${id} ya existe`);
          return null;
        }
        return {
          id,
          user_id: user.id,
          license_number: `DOC-${(1000 + idx).toString().padStart(4, '0')}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
      .filter(r => r !== null);

    // Insertar sólo si hay algo nuevo
    if (records.length) {
      await queryInterface.bulkInsert('Doctors', records, {});
      console.log(`→ Insertados ${records.length} nuevos doctores`);
    } else {
      console.log('→ No había doctores nuevos para insertar');
    }
  },

  // Eliminar todos los doctores que fueron creados por este seeder
  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      'Doctors',
      { id: { [Op.in]: uuids } },
      {}
    );
    console.log('Seeder de Doctors revertido: eliminados los IDs fijos.');
  }
};