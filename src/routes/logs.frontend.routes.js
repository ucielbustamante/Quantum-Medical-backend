const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { StatusCodes } = require('http-status-codes');

router.post('/', (req, res) => {
  const { message, level, timestamp } = req.body;
  logger.log({ level, message: `[Frontend] ${message}`, timestamp });
  res.status(StatusCodes.NO_CONTENT).json({
    statusCode: StatusCodes.NO_CONTENT,
    data: { message: "Log enviado correctamente" }
  });
});

module.exports = router;
