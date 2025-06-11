'use strict';

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const { v4: uuidv4 } = require('uuid');
const { ClinicalRecord, ClinicalDocument, User } = require('../models');
const logger = require('../config/logger');

class FileService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  async initializeDrive() {
    if (this.drive) return;

    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.join(__dirname, '../../gdrive-key.json'),
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const client = await auth.getClient();
    this.drive = google.drive({ version: 'v3', auth: client });

    console.log('[FileService] Google Drive inicializado');
  }

  async uploadFile(file, clinicalRecordId, user_id, description = '') {
    await this.initializeDrive();

    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;

    try {
      const { data } = await this.drive.files.create({
        resource: {
          name: uniqueName,
          parents: [this.folderId],
          description
        },
        media: {
          mimeType: file.mimetype,
          body: fs.createReadStream(file.path)
        },
        fields: 'id, webViewLink, mimeType, size'
      });

      const doc = await ClinicalDocument.create({
        id: uuidv4(),
        clinical_record_id: clinicalRecordId,
        user_id: user_id,
        file_id: data.id,
        mime_type: data.mimeType,
        description,
        file_size: parseInt(data.size || 0, 10),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      logger.info(`Documento clínico subido exitosamente: ${doc.id}`);
      await fsp.unlink(file.path).catch(() => null);
      return doc;
    } catch (error) {
      logger.error(`Error al subir archivo: ${error.message}`);
      logger.error('Se detuvo la creación del documento clínico');
      throw error;
    }
  }

  async deleteFile(documentId) {
    await this.initializeDrive();

    const doc = await ClinicalDocument.findByPk(documentId);
    if (!doc) throw new Error('Documento no encontrado');

    const driveId = doc.file_id;
    if (!driveId) throw new Error('ID de Google Drive inválido');

    await doc.update({ is_active: false });
    return true;
  }

  async getDownloadUrl(documentId) {
    await this.initializeDrive();

    const doc = await ClinicalDocument.findByPk(documentId);
    if (!doc) throw new Error('Documento no encontrado');

    const driveId = this.extractDriveFileId(doc.file_id);
    if (!driveId) throw new Error('ID de Google Drive inválido');

    const { data } = await this.drive.files.get({
      fileId: driveId,
      fields: 'webContentLink'
    });

    return data.webContentLink;
  }

  /**
   * Devuelve los documentos de una historia clínica con metadatos de Drive.
   * Cada elemento incluye toda la info propia de la BD más una clave `drive`
   * con los campos del archivo en Google Drive.
   */
  async listDocumentsByClinicalRecord(clinicalRecord) {
    await this.initializeDrive();

    const dbDocs = await ClinicalDocument.findAll({
      where: { clinical_record_id: clinicalRecord.id, is_active: true },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name', 'lastname', 'role', 'is_active'] }]
    });

    const { data } = await this.drive.files.list({
      q: `parents in '${this.folderId}'`,
      fields: 'files(id,name,mimeType,size,webContentLink,thumbnailLink,createdTime,modifiedTime)'
    });

    const driveMap = new Map(data.files.map(f => [f.id, f]));

    return dbDocs.map(doc => {
      const driveId = this.extractDriveFileId(doc.file_id);
      return {
        ...doc.toJSON(),
        drive: driveMap.get(driveId) || null
      };
    });
  }

  extractDriveFileId(str = '') {
    if (/^[\w-]{25,}$/.test(str)) return str;

    const m = str.match(/\/d\/([^/]+)/) || str.match(/[?&]id=([^&]+)/);
    return m ? m[1] : null;
  }
}

module.exports = new FileService();
