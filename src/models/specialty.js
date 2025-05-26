module.exports = (sequelize, DataTypes) => {
    const Specialty = sequelize.define('Specialty', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });
  
    // TODO ASOCIAR con doctores
    Specialty.associate = models => {
      // Ejemplo: Specialty.hasMany(models.Doctor, { foreignKey: "specialty_id" });
      Specialty.belongsToMany(models.Doctor, {
        through: 'DoctorSpecialties', // Nombre de la tabla intermedia
        foreignKey: 'specialty_id',
        otherKey: 'doctor_id'
      });
    };

    return Specialty;
  };
  