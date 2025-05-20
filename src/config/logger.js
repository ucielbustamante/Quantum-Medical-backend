const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log(`Directorio de logs creado en: ${logDir}`);
}

const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    db: 4,
    debug: 5,
  },
  format: customFormat,
  transports: [
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    }),
    new transports.File({ 
      filename: path.join(logDir, 'database.log'), 
      level: 'db',
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    }),
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxFiles: 10,
      maxsize: 10485760 // 10MB
    }),
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  db: 'blue',
  debug: 'cyan'
};

require('winston').addColors(colors);

logger.db = (message) => {
  logger.log('db', message);
};

module.exports = logger;
