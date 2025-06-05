module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password_hash: DataTypes.STRING,
    role: DataTypes.ENUM("Patient", "Doctor", "Admin"),
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    dni: DataTypes.STRING,
    reset_password_token: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    reset_password_expires: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  });

  User.beforeCreate(async user => {
    if (user.password_hash) {
      const bcrypt = require("bcryptjs");
      user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
  });

  User.associate = models => {
    User.hasOne(models.Patient, { foreignKey: "user_id" });
    User.hasOne(models.Doctor, { foreignKey: "user_id" });
    User.hasMany(models.OAuthAccount, { foreignKey: "user_id" });
  };

  return User;
};
