'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Ejecutando seeder de Specialties...");

    // Definir las especialidades deseadas
    const specialtiesToInsert = [
      { name: 'Cardiología' , id: "ffe545c8-487d-4ea3-8506-fe15eaea621f"},
      { name: 'Traumatología' , id: "d0b77bd2-e8ea-4dc4-b778-22f654e6bbd6"},
      { name: 'Dermatología' , id: "9acab4b5-b29e-4bb3-a3d6-4718e7c47a9f"}
    ];

    // Consultar cuáles de estas especialidades ya existen en la tabla
    const [existingRecords] = await queryInterface.sequelize.query(
      `SELECT name FROM "Specialties" WHERE name IN ('Cardiología', 'Traumatología', 'Dermatología');`
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
    // Puedes revertir borrando las especialidades específicas, si lo deseas
    await queryInterface.bulkDelete('Specialties', {
      name: { [Sequelize.Op.in]: ['Cardiología', 'Traumatología', 'Dermatología'] }
    }, {});
  }
};
