const axios = require('axios');
require('dotenv').config();

class MailService {
    constructor() {
        if (MailService.instance) {
            return MailService.instance;
        }
        
        this.appsheetApiUrl = process.env.APPSHEET_API_URL;
        this.appsheetApiKey = process.env.APPSHEET_API_KEY;
        this.applicationId = process.env.APPSHEET_APPLICATION_ID;
        
        MailService.instance = this;
    }

    async addRecord(modelData) {
        try {
            const headers = {
                'ApplicationAccessKey': this.appsheetApiKey,
                'Content-Type': 'application/json'
            };

            const payload = {
                'Action': 'Add',
                'Properties': {
                    'Locale': 'en-US'
                },
                'Rows': [modelData]
            };

            const response = await axios.post(this.appsheetApiUrl + this.applicationId + '/tables/Mails/Action', payload, { headers });
            
            if (response.status === 200) {
                console.log('Registro agregado exitosamente en AppSheet');
                return {
                    success: true,
                    data: response.data
                };
            }

            return {
                success: false,
                error: 'Error al agregar registro en AppSheet'
            };

        } catch (error) {
            console.error('Error en AppSheet API:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

const mailServiceInstance = new MailService();
Object.freeze(mailServiceInstance);

module.exports = mailServiceInstance;
