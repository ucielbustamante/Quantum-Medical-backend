'use strict';

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

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Ejecutando seeder de Specialties...");

    // Definir las especialidades deseadas
    const specialtiesToInsert = [
      { name: 'Cardiología', id: specialtyIds[0] },
      { name: 'Traumatología', id: specialtyIds[1] },
      { name: 'Dermatología', id: specialtyIds[2] },
      { name: 'Neurología', id: specialtyIds[3] },
      { name: 'Pediatría', id: specialtyIds[4] },
      { name: 'Ginecología', id: specialtyIds[5] },
      { name: 'Urología', id: specialtyIds[6] },
      { name: 'Oncología', id: specialtyIds[7] },
      { name: 'Endocrinología', id: specialtyIds[8] }
    ];

    // Consultar cuáles de estas especialidades ya existen en la tabla
    const [existingRecords] = await queryInterface.sequelize.query(
      `SELECT name FROM "Specialties" WHERE name IN (${specialtiesToInsert.map(s => `'${s.name}'`).join(', ')});`
    );

    // Crear un array con los nombres existentes (si los hay)
    const existingNames = (existingRecords || []).map(record => record.name);

    // Filtrar aquellos que aún no estén insertados
    const specialtiesToBulkInsert = specialtiesToInsert
      .filter(specialty => !existingNames.includes(specialty.name))
      .map(specialty => ({
        id: specialty.id,
        name: specialty.name,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (specialtiesToBulkInsert.length === 0) {
      console.log("Todas las especialidades ya existen. Se omite la inserción.");
      return;
    }

    // Insertar solo las especialidades que no existen
    await queryInterface.bulkInsert('Specialties', specialtiesToBulkInsert, {});
    console.log("Especialidades insertadas:", specialtiesToBulkInsert.map(s => s.name));
  },

  async down(queryInterface, Sequelize) {
    // Eliminar todas las especialidades creadas por este seeder
    await queryInterface.bulkDelete('Specialties', {
      id: {
        [Sequelize.Op.in]: specialtyIds
      }
    }, {});
    console.log("Especialidades eliminadas correctamente");
  }
};
