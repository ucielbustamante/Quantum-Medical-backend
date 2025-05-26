'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Ejecutando seeder de Specialties...");

    // Definir las especialidades deseadas
    const specialtiesToInsert = [
      { name: 'Cardiología' },
      { name: 'Traumatología' },
      { name: 'Dermatología' }
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
        id: uuidv4(),
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
