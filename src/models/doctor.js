module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define("Doctor", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    license_number: DataTypes.STRING
  });

  // Las asociaciones se definen en esta función, que recibe a todos los modelos.
  Doctor.associate = models => {
    // Asociación con User
    Doctor.belongsTo(models.User, { foreignKey: "user_id" });
    
    // Asociación muchos a muchos con Specialty, utilizando la tabla intermedia "DoctorSpecialties"
    Doctor.belongsToMany(models.Specialty, {
      through: 'DoctorSpecialties',
      foreignKey: 'doctor_id',
      otherKey: 'specialty_id'
    });
  };

  return Doctor;
};
