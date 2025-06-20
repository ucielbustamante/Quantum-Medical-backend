const { Appointment, DoctorAvailability, Patient, Doctor, User, Specialty } = require('../models');
const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');
const emailService = require('../services/mail.service');

/**
 * Verifica si ya existe una turno solapada para un doctor
 * en una fecha y rango horario dado,
 * Además ignora si esta cancelada con el helper
 */
async function hasOverlap(doctorId, date, start, end) {
  const overlap = await Appointment.findOne({
    where: {
      doctor_id: doctorId,
      date,
      status: { [Op.ne]: 'cancelled' },
      start_time: { [Op.lt]: end },
      end_time:   { [Op.gt]: start }
    }
  });
  return !!overlap;
}

module.exports = {

  getAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.findAll({
        where: {
          patient_id: { [Op.ne]: null }
        },
        include: [
          {
            model: Patient,
            include: [{ model: User, attributes: ['name', 'lastname', 'email'] }]
          },
          {
            model: Doctor,
            include: [{ model: User, attributes: ['name', 'lastname', 'email'] }]
          }
        ],
        order: [['date','ASC'], ['start_time','ASC']]
      });
      return res.status(StatusCodes.OK).json({ data: appointments });
    } catch (err) {
      console.error('Error en getAppointments:', err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error interno del servidor' });
    }
  },
  
  /**
   * POST /api/appointments
   * - Patient crea su propia turno.
   * - Admin crea turno para cualquier patient_id que envíe en el body.
   * - Se pueden volver a tomar los turnos cancelados
   * - El turno debe tener 24js de anticipacion
   */
  createAppointment: async (req, res) => {
    try {
      const {
        doctor_id,
        date,
        start_time,
        end_time,
        patient_id: bodyPatientId
      } = req.body;

      //Validar que la reserva sea con 24 h de anticipación
      const now       = Date.now();
      const minTime   = now + 24 * 60 * 60 * 1000;            // +24 h
      const startDate = new Date(`${date}T${start_time}`).getTime();
      if (startDate < minTime) {
        return res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({
            message: 'Debe pedir el turno con al menos 24 h de anticipación'
          });
      }

      //Determinar patient_id según rol
      let patient_id;
      if (req.userRole === 'Admin') {
        if (!bodyPatientId) {
          return res
            .status(StatusCodes.UNPROCESSABLE_ENTITY)
            .json({ message: 'Admin debe indicar patient_id en el body' });
        }
        const patient = await Patient.findByPk(bodyPatientId);
        if (!patient) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: 'Paciente no encontrado' });
        }
        patient_id = bodyPatientId;

      } else {
        //traducir User.id → Patient.id
        const me = await Patient.findOne({ where: { user_id: req.userId } });
        if (!me) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: 'Perfil de paciente no encontrado' });
        }
        patient_id = me.id;
      }

      //Validar que el doctor tenga disponibilidad en ese día y horario
      const weekday = new Date(date).getDay();
      const av = await DoctorAvailability.findOne({
        where: {
          doctor_id,
          weekday,
          start_time: { [Op.lte]: start_time },
          end_time:   { [Op.gte]: end_time }
        }
      });
      if (!av) {
        return res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({ message: 'Horario no disponible para este doctor' });
      }

      //Verificar que no exista solapamiento con turnos activas
      if (await hasOverlap(doctor_id, date, start_time, end_time)) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: 'Turno ya ocupado para ese rango horario' });
      }

      //Crear la turno
      const appt = await Appointment.create({
        doctor_id,
        patient_id,
        date,
        start_time,
        end_time,
        status: 'confirmed' // Estado por defecto
      });

      // Vuelve a consultar el appointment con las asociaciones necesarias
      const apptFull = await Appointment.findOne({
        where: { id: appt.id },
        include: [
          {
            model: Patient,
            include: [{ model: require('../models').User, attributes: ['name', 'email'] }]
          },
          {
            model: require('../models').Doctor,
            include: [{ model: require('../models').User, attributes: ['name', 'email'] }]
          }
        ]
      });

      const mailData = {
        patient_name: apptFull.Patient?.User?.name,
        patient_email: apptFull.Patient?.User?.email,
        speciality_name: apptFull.Doctor?.speciality,
        doctor_name: apptFull.Doctor?.User?.name,
        doctor_email: apptFull.Doctor?.User?.email,
        start_date: apptFull.date,
        end_date: apptFull.end_time,
        modality: apptFull.modality,
        location: apptFull.location,
        created_at: apptFull.created_at
      };
      emailService.sendEmailAppointment(mailData);
      return res
        .status(StatusCodes.CREATED)
        .json({ data: apptFull });

    } catch (err) {
      console.error('Error en createAppointment:', err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * GET /api/doctors/:doctorId/appointments
   * Listar todas las turnos de un doctor.
   */
  getAppointmentsByDoctor: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const list = await Appointment.findAll({
        where: { 
          doctor_id: doctorId,
          patient_id: { [Op.ne]: null } // Solo citas reales, no turnos disponibles
        },
        include: [
          {
            model: Patient,
            include: [
              { model: User, attributes: ['name', 'lastname', 'email'] }
            ]
          }
        ],
        order: [['date','ASC'], ['start_time','ASC']]
      });
      return res
        .status(StatusCodes.OK)
        .json({ data: list });
    } catch (err) {
      console.error('Error en getAppointmentsByDoctor:', err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * GET /api/patients/:patientId/appointments
   * Listar todas las turnos de un paciente.
   * Si no hay turnos, devolvemos mensaje pero mantenemos data:[]
   */
  getAppointmentsByPatient: async (req, res) => {
    try {
      const { patientId } = req.params;
      const list = await Appointment.findAll({
        where: { patient_id: patientId },
        include: [
          {
            model: Doctor,
            include: [
              { model: User, attributes: ['name', 'lastname', 'email'] },
              { 
                model: Specialty, 
                through: { attributes: [] },
                attributes: ['name'] 
              }
            ]
          }
        ],
        order: [['date','ASC'], ['start_time','ASC']]
      });

      if (list.length === 0) {
        return res
          .status(StatusCodes.OK)
          .json({
            message: 'No se encontraron turnos reservados',
            data: []
          });
      }

      return res
        .status(StatusCodes.OK)
        .json({ data: list });
    } catch (err) {
      console.error('Error en getAppointmentsByPatient:', err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * PATCH /api/appointments/:id/status
   * Actualizar el estado (pending|confirmed|cancelled)
   * Solo puede hacerlo el doctor dueño de la turno o Admin.
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validar presencia de status
      if (!status) {
        return res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({ message: 'Debe indicar un estado válido' });
      }

      const appt = await Appointment.findByPk(id);
      if (!appt) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'turno no encontrada' });
      }

      appt.status = status;
      await appt.save();
      return res
        .status(StatusCodes.OK)
        .json({ data: appt });

    } catch (err) {
      console.error('Error en updateStatus:', err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * GET /api/doctors/:id/available-slots
   * Obtiene los turnos disponibles de un doctor en un rango de fechas
   * Genera los slots basándose en la disponibilidad del doctor
   */
  getAvailableSlots: async (req, res) => {
    try {
      const { doctor } = req;
      const { startDate, endDate } = req.query;

      // Validar parámetros requeridos
      if (!startDate || !endDate) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ 
            message: 'Se requieren los parámetros startDate y endDate (YYYY-MM-DD)' 
          });
      }

      // Validar formato de fechas
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ 
            message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
          });
      }

      if (start > end) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ 
            message: 'startDate debe ser anterior o igual a endDate' 
          });
      }

      // Obtener la disponibilidad del doctor
      const availability = await DoctorAvailability.findAll({
        where: { doctor_id: doctor.id }
      });

      if (availability.length === 0) {
        return res
          .status(StatusCodes.OK)
          .json({ 
            data: [],
            total: 0,
            message: 'El doctor no tiene horarios de disponibilidad configurados'
          });
      }

      // Generar slots disponibles para cada día en el rango
      const availableSlots = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        const weekday = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Buscar disponibilidad para este día de la semana
        const dayAvailability = availability.filter(av => av.weekday === weekday);
        
        for (const av of dayAvailability) {
          // Generar slots de 30 minutos dentro del horario disponible
          const startTime = new Date(`2000-01-01T${av.start_time}`);
          const endTime = new Date(`2000-01-01T${av.end_time}`);
          const slotDuration = av.slot_duration_min || 30; // Default 30 minutos
          
          let currentSlot = new Date(startTime);
          
          while (currentSlot < endTime) {
            const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
            
            if (slotEnd <= endTime) {
              const startTimeStr = currentSlot.toTimeString().slice(0, 5);
              const endTimeStr = slotEnd.toTimeString().slice(0, 5);
              
              // Verificar si este slot ya está reservado
              const existingAppointment = await Appointment.findOne({
                where: {
                  doctor_id: doctor.id,
                  date: dateStr,
                  start_time: startTimeStr,
                  end_time: endTimeStr,
                  status: { [Op.ne]: 'cancelled' }
                }
              });
              
              // Solo incluir slots que no estén reservados
              if (!existingAppointment) {
                availableSlots.push({
                  id: `slot_${dateStr}_${startTimeStr}`,
                  date: dateStr,
                  start_time: startTimeStr,
                  end_time: endTimeStr,
                  duration_minutes: slotDuration
                });
              }
            }
            
            currentSlot = slotEnd;
          }
        }
        
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      return res
        .status(StatusCodes.OK)
        .json({ 
          data: availableSlots,
          total: availableSlots.length
        });

    } catch (err) {
      console.error('Error en getAvailableSlots:', err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * DELETE /api/appointments/:id
   * Eliminar una turno (solo Admin), retorna 204 sin cuerpo.
   */
  cancelAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const appt = await Appointment.findByPk(id);
      if (!appt) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'turno no encontrada' });
      }
      //soft-cancel: desvincula paciente y cambia el estado del turno
      appt.patient_id = null;
      appt.status     = 'cancelled';
      await appt.save();
      //204 sin cuerpo:
      return res.sendStatus(StatusCodes.NO_CONTENT);

    } catch (err) {
      console.error('Error en cancelAppointment:', err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  }
};
