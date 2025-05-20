const { sequelize } = require('../models');
const logger = require('./logger');

const MONITOR_INTERVAL = 5 * 60 * 1000;

let stats = {
  totalQueries: 0,
  activeConnections: 0,
  peakConnections: 0,
  lastReset: new Date(),
  errors: 0
};


function initMonitoring() {
  logger.info('Iniciando monitoreo de pool de conexiones DB');
  
  setInterval(() => {
    monitorPoolStatus();
  }, MONITOR_INTERVAL);
  
  const originalQuery = sequelize.query.bind(sequelize);
  sequelize.query = function(...args) {
    stats.totalQueries++;
    
    if (process.env.NODE_ENV === 'development' && process.env.LOG_LEVEL === 'debug') {
      const query = args[0];
      if (typeof query === 'string' && query.length < 1000 && !query.toLowerCase().includes('password')) {
        logger.db(`SQL: ${query.substring(0, 500)}`);
      }
    }
    
    stats.activeConnections++;
    if (stats.activeConnections > stats.peakConnections) {
      stats.peakConnections = stats.activeConnections;
    }
    
    return originalQuery(...args)
      .then(result => {
        stats.activeConnections--;
        return result;
      })
      .catch(err => {
        stats.activeConnections--;
        stats.errors++;
        logger.error(`Error en consulta SQL: ${err.message}`);
        throw err;
      });
  };
  
  sequelize.authenticate()
  .then(() => {
    logger.info('🟢 Conexión exitosa a la base de datos');
  })
  .catch(err => {
    logger.error('🔴 Error al conectar a la base de datos:', err);
  });
  
  return stats;
}

function monitorPoolStatus() {
  const pool = sequelize.connectionManager.pool;
  if (pool) {
    const total    = pool.totalCount;
    const idle     = pool.idleCount;
    const waiting  = pool.waitingCount;
    const used     = total - idle;
    
    const poolStatus = {
      total,
      idle,
      used,
      waiting,
      ...stats
    };
    logger.db(`Estado del pool de conexiones: ${JSON.stringify(poolStatus)}`);
    
    if (poolStatus.waiting > 5) {
      logger.warn(`Alto número de conexiones en espera: ${poolStatus.waiting}`);
    }
    
    if (poolStatus.used / poolStatus.total > 0.8) {
      logger.warn(`Uso alto del pool: ${Math.round((poolStatus.used / poolStatus.total) * 100)}%`);
    }
    
    return poolStatus;
  }
  return null;
}

function resetStats() {
  stats = {
    totalQueries: 0,
    activeConnections: 0,
    peakConnections: 0,
    lastReset: new Date(),
    errors: 0
  };
  logger.info('Estadísticas de DB reiniciadas');
  return stats;
}

module.exports = {
  initMonitoring,
  monitorPoolStatus,
  resetStats,
  getStats: () => stats
}; 