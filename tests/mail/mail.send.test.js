const axios = require('axios');
const mailService = require('../../src/services/mail.service');

jest.mock('axios');

describe('MailService', () => {
    const mockMailData = {
        patient_name: 'Juan Pérez',
        patient_email: 'ucielbustamante987@gmail.com',
        speciality_name: 'Cardiología',
        doctor_name: 'Dr. Smith',
        doctor_email: 'smith@test.com',
        start_date: '2024-04-01T10:00:00',
        end_date: '2024-04-01T11:00:00',
        modality: 'Presencial',
        location: 'Consultorio 3',
        created_at: new Date().toISOString()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully add a mail record', async () => {
        axios.post.mockResolvedValue({
            status: 200,
            data: { success: true }
        });

        const result = await mailService.addRecord(mockMailData);

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/tables/Mails/Action'),
            {
                'Action': 'Add',
                'Properties': {
                    'Locale': 'en-US'
                },
                'Rows': [mockMailData]
            },
            expect.objectContaining({
                headers: expect.objectContaining({
                    'ApplicationAccessKey': expect.any(String),
                    'Content-Type': 'application/json'
                })
            })
        );

        expect(result).toEqual({
            success: true,
            data: { success: true }
        });
    });

    it('should handle API error response', async () => {
        const errorMessage = 'API Error';
        axios.post.mockRejectedValue(new Error(errorMessage));

        const result = await mailService.addRecord(mockMailData);

        expect(result).toEqual({
            success: false,
            error: errorMessage
        });
    });

    it('should handle non-200 status response', async () => {
        axios.post.mockResolvedValue({
            status: 400
        });

        const result = await mailService.addRecord(mockMailData);

        expect(result).toEqual({
            success: false,
            error: 'Error al agregar registro en AppSheet'
        });
    });

    it('should validate required fields', async () => {
        const invalidData = {
            patient_name: 'Juan Pérez',
        };

        axios.post.mockResolvedValue({
            status: 200,
            data: { success: true }
        });

        const result = await mailService.addRecord(invalidData);

        expect(axios.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                Rows: [invalidData]
            }),
            expect.any(Object)
        );
    });

    it('should handle multiple records in sequence', async () => {
        axios.post.mockResolvedValueOnce({
            status: 200,
            data: { success: true, id: 1 }
        }).mockResolvedValueOnce({
            status: 200,
            data: { success: true, id: 2 }
        });

        const secondMailData = {
            ...mockMailData,
            patient_name: 'María López',
            patient_email: 'maria@test.com'
        };

        const result1 = await mailService.addRecord(mockMailData);
        const result2 = await mailService.addRecord(secondMailData);

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
        expect(axios.post).toHaveBeenCalledTimes(2);
    });
});
