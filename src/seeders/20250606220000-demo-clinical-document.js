'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Ejecutando seeder de ClinicalDocuments...");

    // IDs predefinidos para los documentos clínicos
    const documentIds = [
      "d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a",
      "e2f3a4b5-c6d7-5e8f-9a0b-1c2d3e4f5a6b",
      "f3a4b5c6-d7e8-6f9a-0b1c-2d3e4f5a6b7c",
      "a4b5c6d7-e8f9-7a0b-1c2d-3e4f5a6b7c8d",
      "b5c6d7e8-f9a0-8b1c-2d3e-4f5a6b7c8d9e",
      "c6d7e8f9-a0b1-9c2d-3e4f-5a6b7c8d9e0f",
      "d7e8f9a0-b1c2-0d3e-4f5a-6b7c8d9e0f1a",
      "e8f9a0b1-c2d3-1e4f-5a6b-7c8d9e0f1a2b"
    ];

    // Datos de ejemplo para documentos clínicos
    const clinicalDocuments = [
      {
        id: documentIds[0],
        clinical_record_id: "a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d",
        user_id: "e693441a-93bd-4990-8251-61b01d67f675",
        file_id: "1sgbekgxO970qKvQ_x5-jf1g3TCvCmI0P",
        mime_type: "application/pdf",
        description: "Informe de laboratorio – Patient Sanchez",
        file_size: 1850,
        is_active: true,
        createdAt: new Date('2024-03-15T10:05:00'),
        updatedAt: new Date('2024-03-15T10:05:00')
      },
      {
        id: documentIds[1],
        clinical_record_id: "b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e",
        user_id: "40a53558-6ec3-49e3-a13e-8cd76f52198b",
        file_id: "1Q5dUXAKIvSDE0byXFg1VbDrNL1CEW5UN",
        mime_type: "image/jpeg",
        description: "Fotografía faringe – Patient Gonzalez",
        file_size: 7017,
        is_active: true,
        createdAt: new Date('2024-03-20T15:35:00'),
        updatedAt: new Date('2024-03-20T15:35:00')
      },
      {
        id: documentIds[2],
        clinical_record_id: "c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f",
        file_id: "1lVxz7rBJ8Vx91VOrEMvjgrqOyZKQiq-d",
        user_id: "47b33b4e-ef5a-422e-86b0-75e8d043da55",
        mime_type: "application/pdf",
        description: "Informe quirúrgico – Patient Morales",
        file_size: 1775,
        is_active: true,
        createdAt: new Date('2024-03-18T09:20:00'),
        updatedAt: new Date('2024-03-18T09:20:00')
      },
      {
        id: documentIds[3],
        clinical_record_id: "d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a",
        user_id: "9ea0c1fb-7fcc-462a-a694-9f47261f3e26",
        file_id: "1LUtfU9thqqk6fMbBfx4EeN8WGtxSYeyq",
        mime_type: "application/pdf",
        description: "Pruebas de alergia – Patient Torres",
        file_size: 1781,
        is_active: true,
        createdAt: new Date('2024-03-22T11:50:00'),
        updatedAt: new Date('2024-03-22T11:50:00')
      },
      {
        id: documentIds[4],
        clinical_record_id: "e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b",
        user_id: "42080f5e-c582-4dcb-ad1c-2903cbcaa12a",
        file_id: "1HwMSVoXywjQjjwXy1_4cQlZQqWc5rTbz",
        mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        description: "Curva glucémica – Patient Lopez",
        file_size: 5030,
        is_active: true,
        createdAt: new Date('2024-03-19T14:25:00'),
        updatedAt: new Date('2024-03-19T14:25:00')
      },
      {
        id: documentIds[5],
        clinical_record_id: "f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c",
        user_id: "42080f5e-c582-4dcb-ad1c-2903cbcaa12a",
        file_id: "1f8Czu3oG3Q0IlLX_mce4eYLwCHW8Fogn",
        mime_type: "application/pdf",
        description: "Evaluación psicológica – Patient Ramirez",
        file_size: 1749,
        is_active: true,
        createdAt: new Date('2024-03-21T16:05:00'),
        updatedAt: new Date('2024-03-21T16:05:00')
      },
      {
        id: documentIds[6],
        clinical_record_id: "a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d",
        user_id: "e693441a-93bd-4990-8251-61b01d67f675",
        file_id: "1M5NfSdvbk4lO7vGBzysrIoJXuZRzsB1s",
        mime_type: "application/pdf",
        description: "MAPA – Patient Perez",
        file_size: 1706,
        is_active: true,
        createdAt: new Date('2024-03-17T13:20:00'),
        updatedAt: new Date('2024-03-17T13:20:00')
      },
      {
        id: documentIds[7],
        clinical_record_id: "b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e",
        user_id: "9761375d-cbe6-4f23-b00f-1f277ab97b89",
        file_id: "1S6cQrIkltbeUY8pKa8xVzjg-3XBGwxQE",
        mime_type: "application/dicom",
        description: "RM lumbar – Patient Gomez",
        file_size: 162,
        is_active: true,
        createdAt: new Date('2024-03-23T10:35:00'),
        updatedAt: new Date('2024-03-23T10:35:00')
      }
    ];


    // Verificar si ya existen documentos clínicos
    const [existingDocuments] = await queryInterface.sequelize.query(
      `SELECT id FROM "ClinicalDocuments" WHERE id IN (${documentIds.map(id => `'${id}'`).join(', ')});`
    );

    if (existingDocuments.length > 0) {
      console.log('Ya existen documentos clínicos con estos IDs, saltando inserción.');
      return;
    }

    // Insertar los documentos clínicos
    await queryInterface.bulkInsert('ClinicalDocuments', clinicalDocuments, {});
    console.log(`Se insertaron ${clinicalDocuments.length} documentos clínicos de ejemplo`);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar los documentos clínicos creados por este seeder
    await queryInterface.bulkDelete('ClinicalDocuments', {
      id: {
        [Sequelize.Op.in]: [
          "d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a",
          "e2f3a4b5-c6d7-5e8f-9a0b-1c2d3e4f5a6b",
          "f3a4b5c6-d7e8-6f9a-0b1c-2d3e4f5a6b7c",
          "a4b5c6d7-e8f9-7a0b-1c2d-3e4f5a6b7c8d",
          "b5c6d7e8-f9a0-8b1c-2d3e-4f5a6b7c8d9e",
          "c6d7e8f9-a0b1-9c2d-3e4f-5a6b7c8d9e0f",
          "d7e8f9a0-b1c2-0d3e-4f5a-6b7c8d9e0f1a",
          "e8f9a0b1-c2d3-1e4f-5a6b-7c8d9e0f1a2b"
        ]
      }
    }, {});
  }
};
