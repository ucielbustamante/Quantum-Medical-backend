module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define("Doctor", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    license_number: DataTypes.STRING
  });

  Doctor.associate = models => {
    Doctor.belongsTo(models.User, { foreignKey: "user_id" });
    
    Doctor.belongsToMany(models.Specialty, {
      through: 'DoctorSpecialties',
      foreignKey: 'doctor_id',
      otherKey: 'specialty_id'
    });
  };

  return Doctor;
};
