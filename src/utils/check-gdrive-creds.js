const fs = require('fs');
const logger = require('../config/logger');

const checkGdrive = () => {
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!path) {
        const error = new Error('GOOGLE_APPLICATION_CREDENTIALS no está definido en las variables de entorno');
        logger.error(error.message);
        throw error;
    }

    if (!fs.existsSync(path)) {
        const error = new Error(`Archivo de credenciales no encontrado en: ${path}`);
        logger.error(error.message);
        throw error;
    }

    try {
        const credentials = JSON.parse(fs.readFileSync(path, 'utf8'));
        
        const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !credentials[field]);
        
        if (missingFields.length > 0) {
            const error = new Error(`Credenciales de Google Drive incompletas. Faltan campos: ${missingFields.join(', ')}`);
            logger.error(error.message);
            throw error;
        }

        logger.info('✅ Credenciales de Google Drive validadas correctamente');
        return true;
    } catch (error) {
        if (error instanceof SyntaxError) {
            const newError = new Error(`Archivo de credenciales mal formateado: ${error.message}`);
            logger.error(newError.message);
            throw newError;
        }
        logger.error(`Error al validar credenciales de Google Drive: ${error.message}`);
        throw error;
    }
};

module.exports = checkGdrive;