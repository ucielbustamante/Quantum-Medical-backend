# 🏥 Quantum Medical Backend

> **Sistema de gestión médica inteligente** - Una API REST robusta para la gestión integral de citas médicas, historiales clínicos y administración de personal sanitario.

## 🚀 ¿Qué es Quantum Medical?

Quantum Medical es una plataforma backend moderna que revoluciona la gestión de clínicas y hospitales. Diseñada con arquitectura escalable y tecnologías de vanguardia, ofrece una solución completa para la administración médica digital.

### ✨ Características Principales

- **🔐 Autenticación Multi-rol**: Sistema de autenticación JWT con roles diferenciados (Admin, Doctor, Patient)
- **📅 Gestión Inteligente de Citas**: Generación automática de horarios y citas disponibles
- **📋 Historiales Clínicos Digitales**: Gestión completa de expedientes médicos
- **📁 Documentos Clínicos**: Almacenamiento seguro en Google Drive
- **👥 Gestión de Personal**: Administración de doctores, pacientes y especialidades
- **📊 Monitoreo en Tiempo Real**: Métricas, logs y monitoreo de base de datos
- **🔄 OAuth con Google**: Autenticación social integrada

## 🏗️ Arquitectura del Sistema

### Estructura de Directorios

```
src/
├── 📁 models/          # Modelos de datos (Sequelize)
├── 📁 controllers/     # Lógica de negocio
├── 📁 routes/          # Definición de endpoints
├── 📁 middlewares/     # Interceptores y validaciones
├── 📁 config/          # Configuraciones del sistema
├── 📁 cron/           # Tareas programadas
└── 📁 utils/          # Utilidades y helpers
```

### 🗄️ Modelos de Datos

El sistema utiliza **Sequelize ORM** con PostgreSQL y maneja las siguientes entidades principales:

- **👤 Users**: Usuarios del sistema con roles diferenciados
- **👨‍⚕️ Doctors**: Información de médicos y especialidades
- **🏥 Patients**: Datos de pacientes
- **📅 Appointments**: Citas médicas con estados dinámicos
- **📋 Clinical Records**: Historiales clínicos completos
- **📄 Clinical Documents**: Documentos médicos (Google Drive)
- **⏰ Doctor Availability**: Horarios disponibles de médicos
- **🏷️ Specialties**: Especialidades médicas

## 🔌 API Endpoints

### 🔐 Autenticación
```
POST   /api/auth/register              # Registro de usuarios
POST   /api/auth/login                 # Inicio de sesión
GET    /api/auth/google                # OAuth con Google
POST   /api/auth/reset-password        # Recuperación de contraseña
```

### 👥 Gestión de Usuarios
```
POST   /api/users                      # Crear usuario (Admin)
POST   /api/users/search               # Buscar usuarios (Admin)
PUT    /api/users/:id                  # Actualizar usuario (Admin)
DELETE /api/users/:id                  # Eliminar usuario (Admin)
```

### 👨‍⚕️ Gestión de Doctores
```
POST   /api/doctors/search             # Buscar doctores (Admin, Patient)
PUT    /api/doctors/:id                # Actualizar doctor (Admin)
DELETE /api/doctors/:id                # Eliminar doctor (Admin)
```

### 🏥 Gestión de Pacientes
```
POST   /api/patients/search            # Buscar pacientes (Admin)
PUT    /api/patients/:id               # Actualizar paciente (Admin)
DELETE /api/patients/:id               # Eliminar paciente (Admin)
```

### 📅 Disponibilidad y Citas
```
GET    /api/availability               # Ver todas las disponibilidades
GET    /api/doctors/:id/availability   # Horarios de un doctor
POST   /api/doctors/:id/availability   # Crear disponibilidad (Doctor, Admin)
DELETE /api/availability/:id           # Eliminar disponibilidad (Doctor, Admin)
```

### 📋 Historiales Clínicos
```
POST   /api/clinical-records           # Crear historial (Doctor, Admin)
GET    /api/clinical-records/:id       # Ver historial
PUT    /api/clinical-records/:id       # Actualizar historial (Doctor, Admin)
DELETE /api/clinical-records/:id       # Eliminar historial (Doctor, Admin)
```

### 📄 Documentos Clínicos
```
GET    /api/clinical-documents/:id     # Ver documento
GET    /api/clinical-documents/record/:id  # Listar documentos por historial
POST   /api/clinical-documents/upload/:id  # Subir documento (Doctor, Admin)
DELETE /api/clinical-documents/:id     # Eliminar documento (Doctor, Admin)
```

### 🏷️ Especialidades
```
GET    /api/specialties                # Listar especialidades
POST   /api/specialties                # Crear especialidad (Admin)
PUT    /api/specialties/:id            # Actualizar especialidad (Admin)
DELETE /api/specialties/:id            # Eliminar especialidad (Admin)
```

### Endpoints de Citas (Appointments)

#### Obtener Slots Disponibles de un Doctor
**GET** `/api/doctors/:id/available-slots`

Obtiene todos los turnos disponibles de un doctor en un rango de fechas específico. Los turnos están disponibles cuando `patient_id` es `null` (no reservados) y tienen status `pending`.

**Parámetros de URL:**
- `id` (UUID): ID del doctor

**Query Parameters:**
- `startDate` (string, requerido): Fecha de inicio en formato YYYY-MM-DD
- `endDate` (string, requerido): Fecha de fin en formato YYYY-MM-DD

**Roles permitidos:** Patient, Doctor, Admin

**Ejemplo de uso:**
```bash
GET /api/doctors/123e4567-e89b-12d3-a456-426614174000/available-slots?startDate=2024-01-15&endDate=2024-01-20
```

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "appointment-uuid",
      "date": "2024-01-15",
      "start_time": "09:00:00",
      "end_time": "09:30:00",
      "duration_minutes": 30
    },
    {
      "id": "appointment-uuid-2",
      "date": "2024-01-15",
      "start_time": "09:30:00",
      "end_time": "10:00:00",
      "duration_minutes": 30
    }
  ],
  "total": 2
}
```

**Respuesta cuando no hay turnos disponibles (200):**
```json
{
  "data": [],
  "total": 0
}
```

**Nota:** Los turnos se generan automáticamente mediante un cron job basándose en la configuración de disponibilidad del doctor. Este endpoint solo retorna los appointments que están disponibles para reservar.

**Errores posibles:**
- `400`: Parámetros faltantes o formato de fecha inválido
- `404`: Doctor no encontrado
- `401`: No autenticado
- `403`: Rol no autorizado
- `500`: Error interno del servidor

## 🔧 Configuración y Despliegue

### 📋 Prerrequisitos

- **Node.js** (v16 o superior)
- **PostgreSQL** (v12 o superior)
- **Google Cloud Platform** (para Google Drive API)

### 🚀 Instalación

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
   ```
   
   Configurar las siguientes variables:
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
   ```

4. **Ejecutar migraciones**
   ```bash
   npm run migrate
   ```

5. **Iniciar el servidor**
   ```bash
   npm start
   ```

### 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 🔄 Tareas Programadas

El sistema incluye un **generador automático de citas** que se ejecuta diariamente:

- **Horario**: 00:05 AM (cron: `5 0 * * *`)
- **Función**: Genera citas disponibles para los próximos 7 días
- **Lógica**: Basada en la disponibilidad configurada por los doctores
- **Estados**: `pending`, `confirmed`, `cancelled`

## 🛡️ Seguridad

### Autenticación y Autorización

- **JWT Tokens**: Autenticación stateless con tokens seguros
- **Roles Múltiples**: Admin, Doctor, Patient con permisos diferenciados
- **OAuth 2.0**: Integración con Google para autenticación social
- **Middleware de Verificación**: Validación automática de tokens y roles

### Protección de Datos

- **Validación de Entrada**: Middleware de búsqueda y validación
- **Logs de Seguridad**: Registro de intentos de acceso no autorizados
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS Configurado**: Control de acceso cross-origin

## 📊 Monitoreo y Logs

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

## 🔧 Middlewares Principales

### `authjwt.middleware.js`
- **verifyToken**: Verificación de tokens JWT
- **isRole**: Control de acceso basado en roles

### `search.middleware.js`
- **findById**: Búsqueda automática de entidades
- **findByEmailInBody**: Búsqueda por email en body

### `multer.upload.middleware.js`
- **upload**: Gestión de subida de archivos
- **handleMulterError**: Manejo de errores de upload

### `authorization.middleware.js`
- **patientSelfOrAdmin**: Verifica que el usuario sea el paciente propietario o un Admin
- **doctorSelfOrAdmin**: Verifica que el usuario sea el doctor propietario o un Admin  
- **appointmentDoctorOrAdmin**: Verifica que el usuario sea el doctor de la cita o un Admin

## 🚀 Características Avanzadas

### 🔄 Generación Automática de Citas

El sistema genera automáticamente citas disponibles basándose en:
- Horarios configurados por doctores
- Duración de consultas
- Días de la semana
- Disponibilidad existente

### 📁 Integración con Google Drive

- Almacenamiento seguro de documentos médicos
- Gestión automática de permisos
- Sincronización en tiempo real

### 🔍 Búsqueda Inteligente

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