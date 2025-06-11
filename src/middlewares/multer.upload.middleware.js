const multer = require('multer');
const path = require('path');
const { StatusCodes } = require('http-status-codes');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/temp/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/dicom'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                data: { message: "El archivo excede el tamaño máximo permitido (10MB)" }
            });
        }
        return res.status(StatusCodes.BAD_REQUEST).json({
            statusCode: StatusCodes.BAD_REQUEST,
            data: { message: err.message }
        });
    } else if (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            statusCode: StatusCodes.BAD_REQUEST,
            data: { message: err.message }
        });
    }
    next();
};

module.exports = {
    upload: upload.single('file'),
    handleMulterError
};