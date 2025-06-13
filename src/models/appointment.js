const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Appointment = sequelize.define('Appointment', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        doctor_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        patient_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        }
    });

    Appointment.associate = (models) => {
        Appointment.belongsTo(models.Doctor, { foreignKey: 'doctor_id' });
        Appointment.belongsTo(models.Patient, { foreignKey: 'patient_id' });
    };

    return Appointment;
};

