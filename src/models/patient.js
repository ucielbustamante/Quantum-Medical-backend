module.exports = (sequelize, DataTypes) => {
    const Patient = sequelize.define("Patient", {
      id:                    { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      health_insurance:      DataTypes.STRING,
      health_insurance_number: DataTypes.STRING,
      birthday:              DataTypes.DATE
    });
  
    Patient.associate = models => {
      Patient.belongsTo(models.User, { foreignKey: "user_id" });
      Patient.hasOne(models.ClinicalRecord, { foreignKey: 'patient_id' });
      Patient.hasMany(models.Appointment, { foreignKey: "patient_id" });
    };
  
    return Patient;
  };
  