const { Appointment, DoctorAvailability, Patient } = require('../models');
const { Op } = require('sequelize');
const { StatusCodes } = require('http-status-codes');

/**
 * Verifica si ya existe una cita solapada para un doctor
 * en una fecha y rango horario dado,
 * Además ignora si esta cancelada con el helper
 */
async function hasOverlap(doctorId, date, start, end) {
  const overlap = await Appointment.findOne({
    where: {
      doctor_id: doctorId,
      date,
      status:{ [Op.ne]: 'cancelled' }, // excluyo citas canceladas
      [Op.or]: [
        { start_time: { [Op.between]: [start, end] } },
        { end_time:   { [Op.between]: [start, end] } }
      ]
    }
  });
  return !!overlap;
}

module.exports = {
  /**
   * POST /api/appointments
   * - Patient crea su propia cita.
   * - Admin crea cita para cualquier patient_id que envíe en el body.
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

      //Verificar que no exista solapamiento con citas activas
      if (await hasOverlap(doctor_id, date, start_time, end_time)) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: 'Turno ya ocupado para ese rango horario' });
      }

      //Crear la cita
      const appt = await Appointment.create({
        doctor_id,
        patient_id,
        date,
        start_time,
        end_time
      });

      return res
        .status(StatusCodes.CREATED)
        .json({ data: appt });

    } catch (err) {
      console.error('Error en createAppointment:', err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * GET /api/doctors/:doctorId/appointments
   * Listar todas las citas de un doctor.
   */
  getAppointmentsByDoctor: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const list = await Appointment.findAll({
        where: { doctor_id: doctorId },
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
   * Listar todas las citas de un paciente.
   * Si no hay citas, devolvemos mensaje pero mantenemos data:[]
   */
  getAppointmentsByPatient: async (req, res) => {
    try {
      const { patientId } = req.params;
      const list = await Appointment.findAll({
        where: { patient_id: patientId },
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
   * Solo puede hacerlo el doctor dueño de la cita o Admin.
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
          .json({ message: 'Cita no encontrada' });
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
   * DELETE /api/appointments/:id
   * Eliminar una cita (solo Admin), retorna 204 sin cuerpo.
   */
  cancelAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const appt = await Appointment.findByPk(id);
      if (!appt) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Cita no encontrada' });
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
