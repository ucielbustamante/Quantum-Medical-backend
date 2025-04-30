const mailService = require('../../src/services/mail.service');

describe('MailService Real API Test', () => {
    it('should send a real mail through AppSheet API', async () => {
        const mailData = {
            patient_name: 'Juan Pérez',
            patient_email: 'ucielbustamante987@gmail.com',
            speciality_name: 'Cardiología',
            doctor_name: 'Dr. Smith',
            doctor_email: 'smith@test.com',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 3600000).toISOString(),
            modality: 'Presencial',
            location: 'Consultorio 3',
            created_at: new Date().toISOString()
        };

        const result = await mailService.addRecord(mailData);
        console.log('API Response:', result);

        expect(result).toHaveProperty('success');
    }, 10000);
}); 