module.exports = (sequelize, DataTypes) => {
  const DoctorSpecialty = sequelize.define(
    "DoctorSpecialty",
    {
      doctor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true, // Clave primaria compuesta
      },
      specialty_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true, // Clave primaria compuesta
      }
    },
    {
      tableName: "DoctorSpecialties",
      timestamps: true,
    }
  );

  DoctorSpecialty.associate = models => {
    // Define las asociaciones para acceder a los modelos relacionados,
    // de forma que puedas se pueda consultar el doctor o la especialidad asociados a la relación.
    DoctorSpecialty.belongsTo(models.Doctor, {
      foreignKey: "doctor_id",
      as: "Doctor"
    });
    DoctorSpecialty.belongsTo(models.Specialty, {
      foreignKey: "specialty_id",
      as: "Specialty"
    });
  };

  return DoctorSpecialty;
};
