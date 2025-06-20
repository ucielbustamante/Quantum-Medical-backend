# Quantum Medical Backend

Sistema de gestión médica backend desarrollado con Node.js, Express y PostgreSQL. Proporciona una API REST robusta para la gestión integral de citas médicas, historiales clínicos y administración de personal sanitario con roles diferenciados.

## Características Principales

### Autenticación y Autorización
- Sistema de autenticación JWT con roles diferenciados (Admin, Doctor, Patient)
- Protección de rutas basada en roles y permisos específicos
- Integración con Google OAuth para autenticación social
- Middleware de autorización personalizado para validaciones específicas

### Gestión de Citas Médicas
- Generación automática de horarios disponibles mediante cron jobs
- Sistema de reserva de citas con validación de disponibilidad
- Estados de citas: pending, confirmed, cancelled
- Gestión de slots disponibles por doctor y fecha

### Gestión de Datos Médicos
- Historiales clínicos completos con documentos asociados
- Almacenamiento seguro de documentos en Google Drive
- Sistema de búsqueda y filtrado avanzado
- Validación de acceso por roles y propiedad de datos

### Monitoreo y Logs
- Sistema de logging estructurado con Winston
- Métricas de rendimiento con Prometheus
- Monitoreo de conexiones de base de datos
- Endpoint para logs del frontend

## Arquitectura del Sistema

### Estructura de Directorios

```
src/
├── config/          # Configuraciones del sistema
│   ├── auth.config.js
│   ├── config.js
│   ├── db-monitor.js
│   ├── logger.js
│   ├── metrics.js
│   └── passport.config.js
├── controllers/     # Lógica de negocio
│   ├── appointment.controller.js
│   ├── auth.controller.js
│   ├── clinical-document.controller.js
│   ├── clinical-record.controller.js
│   ├── doctor.controller.js
│   ├── doctorAvailability.controller.js
│   ├── doctorSpecialty.controller.js
│   ├── patient.controller.js
│   ├── specialty.controller.js
│   └── user.controller.js
├── middlewares/     # Interceptores y validaciones
│   ├── authjwt.middleware.js
│   ├── authorization.middleware.js
│   ├── multer.upload.middleware.js
│   └── search.middleware.js
├── models/          # Modelos de datos (Sequelize)
│   ├── appointment.js
│   ├── clinical_document.js
│   ├── clinical_record.js
│   ├── doctor.js
│   ├── doctorAvailability.js
│   ├── doctorSpecialty.js
│   ├── index.js
│   ├── oauthaccount.js
│   ├── patient.js
│   ├── specialty.js
│   └── user.js
├── routes/          # Definición de endpoints
│   ├── appointment.routes.js
│   ├── auth.routes.js
│   ├── clinical-document.routes.js
│   ├── clinical-record.routes.js
│   ├── doctor.routes.js
│   ├── doctorAvailability.routes.js
│   ├── doctorSpecialty.routes.js
│   ├── logs.frontend.routes.js
│   ├── patient.routes.js
│   ├── rbac.routes.js
│   ├── specialty.routes.js
│   └── user.routes.js
├── cron/           # Tareas programadas
│   └── appointment-generator.cron.js
├── services/       # Servicios externos
│   ├── file.service.js
│   └── mail.service.js
├── utils/          # Utilidades y helpers
│   └── check-gdrive-creds.js
└── index.js        # Punto de entrada de la aplicación
```

### Modelos de Datos

El sistema utiliza **Sequelize ORM** con PostgreSQL y maneja las siguientes entidades principales:

- **User**: Usuarios del sistema con roles diferenciados
- **Doctor**: Información de médicos con licencias
- **Patient**: Datos de pacientes con información médica
- **Specialty**: Especialidades médicas
- **DoctorSpecialty**: Asociación muchos a muchos entre doctores y especialidades
- **DoctorAvailability**: Horarios disponibles de médicos por día de la semana
- **Appointment**: Citas médicas con estados dinámicos
- **ClinicalRecord**: Historiales clínicos completos
- **ClinicalDocument**: Documentos médicos asociados a historiales
- **OAuthAccount**: Cuentas de autenticación social

## API Endpoints

### Autenticación (`/api/auth`)
```
POST   /register              # Registro de usuarios
POST   /login                 # Inicio de sesión
GET    /google                # OAuth con Google
GET    /google/callback       # Callback de Google OAuth
POST   /reset-password        # Solicitar reset de contraseña
POST   /reset-password/confirm # Confirmar reset de contraseña
```

### Gestión de Usuarios (`/api/users`)
```
POST   /                      # Crear usuario (Admin)
POST   /search                # Buscar usuarios (Admin)
PUT    /:id                   # Actualizar usuario (Admin)
DELETE /:id                   # Eliminar usuario (Admin)
```

### Gestión de Doctores (`/api/doctors`)
```
POST   /search                # Buscar doctores (Admin, Patient)
PUT    /:id                   # Actualizar doctor (Admin)
DELETE /:id                   # Eliminar doctor (Admin)
```

### Gestión de Pacientes (`/api/patients`)
```
POST   /search                # Buscar pacientes (Admin)
PUT    /:id                   # Actualizar paciente (Admin)
DELETE /:id                   # Eliminar paciente (Admin)
```

### Especialidades (`/api/specialties`)
```
GET    /                      # Listar especialidades (público)
POST   /                      # Crear especialidad (Admin)
PUT    /:id                   # Actualizar especialidad (Admin)
DELETE /:id                   # Eliminar especialidad (Admin)
```

### Asociación Doctor-Especialidad (`/api/doctor-specialties`)
```
GET    /                      # Listar asociaciones (público)
POST   /                      # Crear asociación (Admin)
DELETE /:doctor_id/:specialty_id # Eliminar asociación (Admin)
```

### Disponibilidad de Doctores (`/api`)
```
GET    /availability          # Listar todas las disponibilidades (público)
GET    /doctors/:id/availability # Horarios de un doctor (público)
POST   /doctors/:id/availability # Crear disponibilidad (Doctor, Admin)
DELETE /availability/:id      # Eliminar disponibilidad (Doctor, Admin)
```

### Citas Médicas (`/api`)
```
POST   /appointments          # Crear cita (Patient, Admin)
GET    /patients/:patientId/appointments # Citas de un paciente (Patient propio, Admin)
GET    /doctors/:doctorId/appointments   # Citas de un doctor (Doctor propio, Admin)
GET    /doctors/:id/available-slots      # Turnos disponibles (Patient, Doctor, Admin)
PATCH  /appointments/:id/status          # Actualizar estado (Doctor propietario, Admin)
DELETE /appointments/:id                 # Eliminar cita (Admin)
GET    /appointments                     # Listar todas las citas (Admin)
```

### Historiales Clínicos (`/api/clinical-records`)
```
POST   /                      # Crear historial (Doctor, Admin)
GET    /                      # Buscar historiales (Doctor, Admin)
GET    /:id                   # Obtener historial específico
PUT    /:id                   # Actualizar historial (Doctor, Admin)
DELETE /:id                   # Eliminar historial (Doctor, Admin)
```

### Documentos Clínicos (`/api/clinical-documents`)
```
GET    /:id                   # Obtener documento (Patient propietario, Doctor, Admin)
GET    /record/:id            # Listar documentos por historial
POST   /upload/:id            # Subir documento (Doctor, Admin)
DELETE /:id                   # Eliminar documento (Doctor, Admin)
```

### RBAC y Sistema (`/api/rbac`, `/api/admin`)
```
GET    /rbac/doctor/dashboard # Dashboard del doctor
GET    /rbac/admin/users      # Listar usuarios (Admin)
GET    /rbac/patient/profile  # Perfil del paciente
GET    /admin/db-stats        # Estadísticas de BD (Admin)
```

### Logs y Métricas
```
POST   /api/logs/frontend     # Enviar logs del frontend
GET    /metrics               # Métricas Prometheus
```

## Configuración y Despliegue

### Prerrequisitos

- **Node.js** (v16 o superior)
- **PostgreSQL** (v12 o superior)
- **Google Cloud Platform** (para Google Drive API)

### Variables de Entorno

```env
# Base de datos
DB_USER=tu_usuario
DB_PASS=tu_password
DB_NAME=quantum_medical
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=tu_secreto_jwt

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret

# Google Drive
GOOGLE_DRIVE_CREDENTIALS=path/to/credentials.json

# Frontend
FRONTEND_URL=http://localhost:3000
FRONTEND_KEY=tu_clave_frontend

# Servidor
PORT=5000
NODE_ENV=development
```

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd Quantum-Medical-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con las variables necesarias
   ```

4. **Ejecutar migraciones**
   ```bash
   npm run migrate
   ```

5. **Iniciar el servidor**
   ```bash
   npm start
   ```

## Middlewares Principales

### `authjwt.middleware.js`
- **verifyToken**: Verificación de tokens JWT
- **isRole**: Control de acceso basado en roles

### `authorization.middleware.js`
- **patientSelfOrAdmin**: Verifica que el usuario sea el paciente propietario o un Admin
- **doctorSelfOrAdmin**: Verifica que el usuario sea el doctor propietario o un Admin  
- **appointmentDoctorOrAdmin**: Verifica que el usuario sea el doctor de la cita o un Admin

### `search.middleware.js`
- **findById**: Búsqueda automática de entidades por ID
- **findByEmailInBody**: Búsqueda por email en body de request

### `multer.upload.middleware.js`
- **upload**: Gestión de subida de archivos
- **handleMulterError**: Manejo de errores de upload

## Tareas Programadas

El sistema incluye un **generador automático de citas** que se ejecuta diariamente:

- **Horario**: 00:05 AM (cron: `5 0 * * *`)
- **Función**: Genera citas disponibles para los próximos 7 días
- **Lógica**: Basada en la disponibilidad configurada por los doctores
- **Estados**: `pending`, `confirmed`, `cancelled`

## Seguridad

### Autenticación y Autorización
- **JWT Tokens**: Autenticación stateless con tokens seguros
- **Roles Múltiples**: Admin, Doctor, Patient con permisos diferenciados
- **OAuth 2.0**: Integración con Google para autenticación social
- **Middleware de Verificación**: Validación automática de tokens y roles

### Protección de Datos
- **Validación de Entrada**: Middleware de búsqueda y validación
- **Logs de Seguridad**: Registro de intentos de acceso no autorizados
- **CORS Configurado**: Control de acceso cross-origin
- **Validación de Propiedad**: Verificación de acceso a datos propios

## Monitoreo y Logs

### Métricas del Sistema
- **Endpoint de Métricas**: `/metrics` (Prometheus compatible)
- **Estadísticas de BD**: `/api/admin/db-stats` (solo Admin)
- **Logs Estructurados**: Winston con diferentes niveles
- **Monitoreo de Pool**: Control de conexiones de base de datos

### Logs Frontend
El sistema acepta logs del frontend para debugging centralizado:
```
POST /api/logs/frontend
```

## Características Avanzadas

### Generación Automática de Citas
El sistema genera automáticamente citas disponibles basándose en:
- Horarios configurados por doctores
- Duración de consultas
- Días de la semana
- Disponibilidad existente

### Integración con Google Drive
- Almacenamiento seguro de documentos médicos
- Gestión automática de permisos
- Sincronización en tiempo real

### Búsqueda Inteligente
- Búsqueda por múltiples criterios
- Filtros avanzados
- Paginación automática
- Ordenamiento dinámico

## 📄 Licencia

Este proyecto está bajo la Licencia Creative Commons BY-NC-SA 4.0. Ver el archivo [`LICENSE`](LICENSE.txt) para más detalles.

## 👥 Equipo de Desarrollo

### 🧑‍💻 Desarrolladores

| **Uciel Bustamante** | **Nahuel Martínez** | **Micaela Galeano** | **Juan Iturrart** |
|:---:|:---:|:---:|:---:|
| Tech Lead | Backend Developer | Frontend Developer | Frontend Engineer |
| [📧 Contact](mailto:ucibustamante.a@gmail.com) | [📧 Contact](mailto:martinezsnahu@gmail.com) | [📧 Contact](mailto:galeano94mica@gmail.com) | [📧 Contact](mailto:juaniturrart588@gmail.com) | 
[📘 LinkedIn](https://www.linkedin.com/in/uciel-bustamante/) | [📘 LinkedIn](https://www.linkedin.com/in/nahuel-martinez-7b898a218/) | [📘 LinkedIn](https://www.linkedin.com/in/micaela-alejandra-galeano) | [📘 LinkedIn](https://www.linkedin.com/in/juan-ignacio-iturrart-06027b284/) |
### 🤝 Contribuciones

Este proyecto es el resultado del trabajo colaborativo del equipo de desarrollo, donde cada miembro aportó su experiencia y conocimientos para crear una solución integral de gestión médica.

---

**Desarrollado con ❤️ por el equipo de Quantum Medical**