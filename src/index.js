const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('./config/passport.config');
const logger = require('./config/logger');
const dbMonitor = require('./config/db-monitor');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const doctorRoutes = require('./routes/doctor.routes');
const patientRoutes = require('./routes/patient.routes');
const { metricsMiddleware, metricsEndpoint } = require('./config/metrics');
const frontendLogRoutes = require('./routes/logs.frontend.routes');
const rbacRoutes = require('./routes/rbac.routes');
const { isRole } = require('./middlewares/authjwt.middleware');
const specialtyRoutes = require('./routes/specialty.routes');
const doctorSpecialtyRoutes = require('./routes/doctorSpecialty.routes');
const clinicalRecordRoutes = require('./routes/clinical-record.routes');
const clinicalDocumentRoutes = require('./routes/clinical-document.routes');
const doctorAvailabilityRoutes = require('./routes/doctorAvailability.routes');


const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  dbMonitor.initMonitoring();
}

app.use(passport.initialize());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  logger.info(`📥 Request: ${req.method} ${req.originalUrl}`);
  
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - start;
    logger.info(`📤 Response: ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    return originalJson.call(this, body);
  };
  
  next();
});

app.use(metricsMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/logs/frontend', frontendLogRoutes);
//especialidades
app.use('/api/specialties', specialtyRoutes); 
//especialidades de doctores
app.use('/api/doctor-specialties', doctorSpecialtyRoutes);
// Horarios disponibles de Doctores
app.use('/api', doctorAvailabilityRoutes);
app.use('/api/clinical-records', clinicalRecordRoutes);
app.use('/api/clinical-documents', clinicalDocumentRoutes);
app.get('/metrics', metricsEndpoint);
app.get('/api/admin/db-stats', isRole("Admin"), (req, res) => {
  const stats = dbMonitor.monitorPoolStatus();
  res.json({ status: 'success', data: stats });
});


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hola mundo' });
});

if (require.main === module) {
  app.listen(PORT, () => logger.info(`✅ Servidor iniciado en puerto ${PORT}`));
}

module.exports = app;