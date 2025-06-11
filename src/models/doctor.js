module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define("Doctor", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    license_number: DataTypes.STRING
  });

  // Definición de asociaciones
  Doctor.associate = models => {
    // Asociación con User
    Doctor.belongsTo(models.User, { foreignKey: "user_id" });

    // Asociación muchos a muchos con Specialty, utilizando la tabla intermedia "DoctorSpecialties"
    Doctor.belongsToMany(models.Specialty, {
      through: 'DoctorSpecialties',
      foreignKey: 'doctor_id',
      otherKey: 'specialty_id'
    });
    
    // Asociación uno a muchos con DoctorAvailability
    Doctor.hasMany(models.DoctorAvailability, { foreignKey: "doctor_id" });
  };

  return Doctor;
};
