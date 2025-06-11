'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Ejecutando seeder de ClinicalRecords...");

    // IDs predefinidos para los registros clínicos
    const clinicalRecordIds = [
      "a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d",
      "b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e",
      "c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f",
      "d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a",
      "e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b",
      "f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c",
      "a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d",
      "b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e"
    ];

    // Datos de ejemplo para registros clínicos
    const clinicalRecords = [
      {
        id: clinicalRecordIds[0],
        patient_id: "459d9857-d83f-4bb5-a762-f7c1a9b86c83", // Paciente 1
        title: "Consulta de rutina - Control anual",
        body: "Paciente en buen estado general. Presión arterial: 120/80 mmHg. Frecuencia cardíaca: 72 lpm. Peso: 70kg. Se recomienda continuar con dieta balanceada y ejercicio regular. Próximo control en 6 meses.",
        createdAt: new Date('2024-03-15T10:00:00'),
        updatedAt: new Date('2024-03-15T10:00:00')
      },
      {
        id: clinicalRecordIds[1],
        patient_id: "13cf6790-cc14-426a-8a78-54b97582b4fe", // Paciente 2
        title: "Consulta por dolor de garganta",
        body: "Paciente presenta dolor de garganta de 3 días de evolución, sin fiebre. Exploración: faringe eritematosa, sin exudados. Diagnóstico: Faringitis aguda. Tratamiento: Ibuprofeno 400mg cada 8 horas por 5 días. Reposo relativo.",
        createdAt: new Date('2024-03-20T15:30:00'),
        updatedAt: new Date('2024-03-20T15:30:00')
      },
      {
        id: clinicalRecordIds[2],
        patient_id: "ecc00185-2636-4bf5-9629-ba29cd65c90d", // Paciente 3
        title: "Control post-operatorio",
        body: "Paciente en control post-operatorio de apendicectomía. Herida quirúrgica en buen estado, sin signos de infección. Se retiran puntos. Se recomienda continuar con cuidados de la herida y evitar esfuerzos físicos por 2 semanas más.",
        createdAt: new Date('2024-03-18T09:15:00'),
        updatedAt: new Date('2024-03-18T09:15:00')
      },
      {
        id: clinicalRecordIds[3],
        patient_id: "41af675d-05a0-4c7b-a224-37795bcc014c", // Paciente 4
        title: "Evaluación de alergia estacional",
        body: "Paciente refiere síntomas de rinitis alérgica. Se realizan pruebas cutáneas positivas para polen y ácaros. Se indica tratamiento con antihistamínicos y corticoides nasales. Se recomienda evitar exposición a alérgenos.",
        createdAt: new Date('2024-03-22T11:45:00'),
        updatedAt: new Date('2024-03-22T11:45:00')
      },
      {
        id: clinicalRecordIds[4],
        patient_id: "68576161-a177-4b32-b359-78f885819001", // Paciente 5
        title: "Control de diabetes",
        body: "Paciente con diabetes tipo 2. HbA1c: 7.2%. Glucemia en ayunas: 130 mg/dL. Se ajusta medicación y se refuerza educación sobre dieta y ejercicio. Se programa próximo control en 3 meses.",
        createdAt: new Date('2024-03-19T14:20:00'),
        updatedAt: new Date('2024-03-19T14:20:00')
      },
      {
        id: clinicalRecordIds[5],
        patient_id: "fda262b5-29ea-4212-b4a3-f40dd6f1a24b", // Paciente 6
        title: "Evaluación de ansiedad",
        body: "Paciente refiere síntomas de ansiedad y estrés laboral. Se realiza evaluación psicológica. Se recomienda terapia cognitivo-conductual y técnicas de relajación. Se programa seguimiento en 2 semanas.",
        createdAt: new Date('2024-03-21T16:00:00'),
        updatedAt: new Date('2024-03-21T16:00:00')
      },
      {
        id: clinicalRecordIds[6],
        patient_id: "5d8e7b30-fc27-49b4-809b-dce291c91fab", // Paciente 7
        title: "Control de hipertensión",
        body: "Paciente con hipertensión arterial. Presión: 145/90 mmHg. Se ajusta medicación antihipertensiva. Se recomienda reducción de sal en dieta y ejercicio regular. Control en 1 mes.",
        createdAt: new Date('2024-03-17T13:15:00'),
        updatedAt: new Date('2024-03-17T13:15:00')
      },
      {
        id: clinicalRecordIds[7],
        patient_id: "30d7f2f7-0087-49ac-8f88-213f48533a6a", // Paciente 8
        title: "Evaluación de dolor lumbar",
        body: "Paciente con dolor lumbar de 2 semanas de evolución. Exploración: limitación de movimientos, signo de Lasègue negativo. Se indica fisioterapia y analgésicos. Se recomienda evitar esfuerzos y mantener postura correcta.",
        createdAt: new Date('2024-03-23T10:30:00'),
        updatedAt: new Date('2024-03-23T10:30:00')
      }
    ];

    // Verificar si ya existen registros clínicos
    const [existingRecords] = await queryInterface.sequelize.query(
      `SELECT id FROM "ClinicalRecords" WHERE id IN (${clinicalRecordIds.map(id => `'${id}'`).join(', ')});`
    );

    if (existingRecords.length > 0) {
      console.log('Ya existen registros clínicos con estos IDs, saltando inserción.');
      return;
    }

    // Insertar los registros clínicos
    await queryInterface.bulkInsert('ClinicalRecords', clinicalRecords, {});
    console.log(`Se insertaron ${clinicalRecords.length} registros clínicos de ejemplo`);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar los registros clínicos creados por este seeder
    await queryInterface.bulkDelete('ClinicalRecords', {
      id: {
        [Sequelize.Op.in]: [
          "a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d",
          "b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e",
          "c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f",
          "d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a",
          "e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b",
          "f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c",
          "a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d",
          "b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e"
        ]
      }
    }, {});
  }
};
