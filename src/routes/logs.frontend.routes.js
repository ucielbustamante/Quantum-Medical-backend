const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

router.post('/', (req, res) => {
  const { message, level, timestamp } = req.body;
  const key = req.headers['x-quantum-medical-key'];
  if (key !== process.env.FRONTEND_KEY) {
    logger.error(`Unauthorized request from ${req.ip} with key ${key}`);
    return res.status(StatusCodes.UNAUTHORIZED).json({
      statusCode: StatusCodes.UNAUTHORIZED,
      data: { message: "Unauthorized" }
    });
  }
  logger.log({ level, message: `[Frontend] ${message}`, timestamp });
  res.status(StatusCodes.NO_CONTENT).json({
    statusCode: StatusCodes.NO_CONTENT,
    data: { message: "Log enviado correctamente" }
  });
});

module.exports = router;
