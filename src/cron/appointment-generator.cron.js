const cron = require('node-cron');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const logger = require('../config/logger');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

const DAYS_TO_GENERATE = 7;
const CRON_SCHEDULE = '5 0 * * *';

const validateAvailability = (av) => {
    if (!av.start_time || !av.end_time) {
      throw new Error(`Invalid time range for availability ${av.id}`);
    }
    if (!av.slot_duration_min || av.slot_duration_min <= 0) {
      throw new Error(`Invalid slot duration for availability ${av.id}`);
    }
    if (av.weekday < 0 || av.weekday > 6) {
      throw new Error(`Invalid weekday for availability ${av.id}`);
    }
  
    const baseDate = '1970-01-01T';
    const start = dayjs.utc(`${baseDate}${av.start_time}`, 'YYYY-MM-DDTHH:mm:ss', true);
    const end   = dayjs.utc(`${baseDate}${av.end_time}`,   'YYYY-MM-DDTHH:mm:ss', true);
  
    if (!start.isValid() || !end.isValid()) {
      logger.error(`Invalid time format for availability ${av.id}. Start: ${av.start_time}, End: ${av.end_time}`);
      throw new Error(`Invalid time format for availability ${av.id}`);
    }
    if (!end.isAfter(start)) {
      throw new Error(`End time must be after start time for availability ${av.id}`);
    }
  };

module.exports = ({ DoctorAvailability, Appointment, sequelize }) => {
    const generateAppointments = async () => {
        const transaction = await sequelize.transaction();
        
        try {
            logger.info('Iniciando generación de citas...');
            const today = dayjs.utc().startOf('day');
            const lastDay = today.add(DAYS_TO_GENERATE, 'day');
            const now = new Date();

            await Appointment.update(   
                { status: 'cancelled' },
                { 
                    where: { 
                        status: 'pending',
                        date: { [Op.lt]: today.toDate() }
                    },
                    transaction 
                }
            );

            const availabilities = await DoctorAvailability.findAll({ transaction });
            const toInsert = [];

            for (const av of availabilities) {
                try {
                    validateAvailability(av);
                } catch (error) {
                    logger.error(`Invalid availability data: ${error.message}`);
                    continue;
                }

                for (let d = 0; d < DAYS_TO_GENERATE; d++) {
                    const date = today.add(d, 'day');
                    if (date.day() !== av.weekday) continue;

                    const slot = av.slot_duration_min;
                    let start = dayjs.utc(`${date.format('YYYY-MM-DD')}T${av.start_time}`);
                    const endLimit = dayjs.utc(`${date.format('YYYY-MM-DD')}T${av.end_time}`);

                    while (start.add(slot, 'minute').isSameOrBefore(endLimit)) {
                        const end = start.add(slot, 'minute');

                        const existingAppointment = await Appointment.findOne({
                            where: {
                                doctor_id: av.doctor_id,
                                date: start.toDate(),
                                start_time: start.format('HH:mm:ss'),
                                end_time: end.format('HH:mm:ss')
                            },
                            transaction
                        });

                        if (!existingAppointment) {
                            toInsert.push({
                                doctor_id: av.doctor_id,
                                date: start.toDate(),
                                start_time: start.format('HH:mm:ss'),
                                end_time: end.format('HH:mm:ss'),
                                status: 'pending',
                                patient_id: null,
                                createdAt: now,
                                updatedAt: now
                            });
                        }

                        start = end;
                    }
                }
            }

            if (toInsert.length) {
                await Appointment.bulkCreate(toInsert, { 
                    transaction,
                    ignoreDuplicates: true 
                });
                logger.info(`Generated ${toInsert.length} new appointments`);
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error generating appointments: ${error.message}`);
            throw error;
        }
    };

    cron.schedule(CRON_SCHEDULE, async () => {
        try {
            await generateAppointments();
        } catch (error) {
            logger.error(`Failed to generate appointments in scheduled run: ${error.message}`);
        }
    });

    return {
        generateAppointments,
        runInitialGeneration: async () => {
            try {
                logger.info('Ejecutando generación inicial de citas...');
                await generateAppointments();
                logger.info('✅ Generación inicial de citas completada');
            } catch (error) {
                logger.error(`Error en generación inicial de citas: ${error.message}`);
                throw error;
            }
        }
    };
};