'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Emails de prueba ampliados
    const demoEmails = [
      // Doctors
      { email: 'dr.alvarez@example.com', id: "e693441a-93bd-4990-8251-61b01d67f675" },
      { email: 'dr.rodriguez@example.com', id: "40a53558-6ec3-49e3-a13e-8cd76f52198b" },
      { email: 'dr.martinez@example.com', id: "e56ffc94-e10c-428c-8fc3-9b24dfee99ea" },
      { email: 'dr.fernandez@example.com', id: "47b33b4e-ef5a-422e-86b0-75e8d043da55" },
      { email: 'dr.garcia@example.com', id: "9ea0c1fb-7fcc-462a-a694-9f47261f3e26" },
      { email: 'dr.perez@example.com', id: "42080f5e-c582-4dcb-ad1c-2903cbcaa12a" },
      { email: 'dr.gomez@example.com', id: "e2318643-dcc8-41a2-bc28-6f5576b013a3" },
      { email: 'dr.sanchez@example.com', id: "9761375d-cbe6-4f23-b00f-1f277ab97b89" },
      { email: 'dr.gonzalez@example.com', id: "bfc7fbc6-b7f6-4147-9657-c14d2b330c85" },
      { email: 'dr.morales@example.com', id: "b0ebdfb7-687a-4a16-a253-407d4b656aea" },
      { email: 'dr.torres@example.com', id: "c1a4740a-9029-4852-8bee-7e4061304cee" },
      { email: 'dr.lopez@example.com', id: "dd605f6a-b655-4567-aa5c-3d03befbf0a9" },
      { email: 'dr.ramirez@example.com', id: "721e3d0a-0fd1-464c-92e7-731a676b93e5" },
      // Patients
      { email: 'patient.sanchez@example.com', id: "037e157d-8c87-4492-bb9e-a3dbdb996810" },
      { email: 'patient.gonzalez@example.com', id: "307e349c-2f72-4af8-a5a1-fea4718d4c50" },
      { email: 'patient.morales@example.com', id: "ddc609ad-8234-4a26-bcc8-64da448415a8" },
      { email: 'patient.torres@example.com', id: "8895c656-4a06-4e5f-9f15-0acef0a8171f" },
      { email: 'patient.lopez@example.com', id: "35996eae-8f02-4677-96f5-a75927759028" },
      { email: 'patient.ramirez@example.com', id: "28116234-8f60-4608-b7e4-9934a7978b42" },
      { email: 'patient.perez@example.com', id: "a4216407-44bf-4607-9228-2b5e4f5c72ea" },
      { email: 'patient.gomez@example.com', id: "3a086878-1372-4c20-94b6-2506bee033c0" },
      // Admins
      { email: 'admin1@example.com', id: "d89c0033-3a14-470e-9297-4ca47146bb2e" },
      { email: 'admin2@example.com', id: "e4bc7b8a-ef81-4d3d-a14a-d4ce7628b9d3" },
      { email: 'admin3@example.com', id: "d0c174ed-d0e7-4899-af48-0d3ca2751c4f" },
      { email: 'admin4@example.com', id: "20abb6a8-a7fc-4f53-95bb-61c4ab625a5e" },
    ];

    // Verifico si ya existen algunos de estos emails para no duplicar
    const [existing] = await queryInterface.sequelize.query(
      `SELECT email FROM "Users" WHERE email IN (${demoEmails.map(e => `'${e}'`).join(', ')})`
    );
    const existingEmails = existing.map(u => u.email);

    // Solo inserto los que no estén ya en la tabla
    const toInsert = demoEmails
      .filter(email => !existingEmails.includes(email))
      .map(email => {
        let role;
        if (email.startsWith('dr.')) {
          role = 'Doctor';
        } else if (email.startsWith('patient.')) {
          role = 'Patient';
        } else {
          role = 'Admin';
        }
        const namePart = email.split('@')[0].split('.');
        const name = namePart[0].charAt(0).toUpperCase() + namePart[0].slice(1);
        const lastname = namePart[1]
          ? namePart[1].charAt(0).toUpperCase() + namePart[1].slice(1)
          : 'Demo';

        return {
          id: email.id,
          name,
          lastname,
          email: email.email,
          password_hash: bcrypt.hashSync('password123', 10),
          role,
          dni: Math.floor(10000000 + Math.random() * 90000000).toString(),
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('Users', toInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Users',
      {
        email: {
          [Sequelize.Op.in]: [
            // Doctors
            'dr.alvarez@example.com',
            'dr.rodriguez@example.com',
            'dr.martinez@example.com',
            'dr.fernandez@example.com',
            'dr.garcia@example.com',
            'dr.perez@example.com',
            'dr.gomez@example.com',
            'dr.sanchez@example.com',
            'dr.gonzalez@example.com',
            'dr.morales@example.com',
            'dr.torres@example.com',
            'dr.lopez@example.com',
            'dr.ramirez@example.com',
            // Patients
            'patient.sanchez@example.com',
            'patient.gonzalez@example.com',
            'patient.morales@example.com',
            'patient.torres@example.com',
            'patient.lopez@example.com',
            'patient.ramirez@example.com',
            'patient.perez@example.com',
            'patient.gomez@example.com',
            // Admins
            'admin1@example.com',
            'admin2@example.com',
            'admin3@example.com',
            'admin4@example.com'
          ]
        }
      },
      {}
    );
  }
};