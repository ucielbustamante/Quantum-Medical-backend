module.exports = (sequelize, DataTypes) => {
  const DoctorAvailability = sequelize.define("DoctorAvailability", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    weekday: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 6 }
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (this.start_time >= value) {
            throw new Error("end_time debe ser mayor que start_time");
          }
        }
      }
    },
    slot_duration_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    }
  });

  DoctorAvailability.associate = models => {
    DoctorAvailability.belongsTo(models.Doctor, { foreignKey: "doctor_id" });
  };

  return DoctorAvailability;
};
