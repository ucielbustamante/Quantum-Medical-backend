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

    _buildHeaders() {
        return {
            'ApplicationAccessKey': this.appsheetApiKey,
            'Content-Type': 'application/json'
        };
    }

    _buildPayload(action, locale, modelData) {
        return {
            Action: action,
            Properties: {
                Locale: locale
            },
            Rows: [modelData]
        };
    }

    async _postToAppSheet(table, payload) {
        try {
            const url = `${this.appsheetApiUrl}${this.applicationId}/tables/${table}/Action`;
            const headers = this._buildHeaders();
            const response = await axios.post(url, payload, { headers });
            if (response.status === 200) {
                return { success: true, data: response.data };
            }
            return { success: false, error: 'No se pudo registrar el email en AppSheet' };
        } catch (error) {
            console.error('Error en _postToAppSheet:', error.message, error.response?.data);
            return { success: false, error: error.message, response: error.response?.data };
        }
    }

    async sendResetPasswordEmail(user, token) {
        try {
            const resetPasswordUrl = `${process.env.FRONTEND_URL}auth/reset-password?token=${token}`;
            const modelData = {
                user_fullname: user.name + ' ' + user.lastname,
                user_email: user.email,
                url_generated: resetPasswordUrl,
                sent_at: new Date().toISOString()
            };
            const payload = this._buildPayload('Add', 'es-AR', modelData);
            const result = await this._postToAppSheet('ResetPasswordMails', payload);
            if (result.success) {
                console.log('ResetPassword email registrado exitosamente en AppSheet');
                return result;
            }
            return result;
        } catch (error) {
            console.error('Error en sendResetPasswordEmail:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendEmailAppointment(modelData) {
        try {
            const payload = this._buildPayload('Add', 'en-US', modelData);
            const result = await this._postToAppSheet('Mails', payload);
            if (result.success) {
                console.log('Registro agregado exitosamente en AppSheet');
                return result;
            }
            return result;
        } catch (error) {
            console.error('Error en sendEmailAppointment:', error.message);
            return { success: false, error: error.message };
        }
    }
}

const mailServiceInstance = new MailService();
Object.freeze(mailServiceInstance);

module.exports = mailServiceInstance;
