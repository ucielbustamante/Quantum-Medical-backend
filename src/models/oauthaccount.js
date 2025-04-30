module.exports = (sequelize, DataTypes) => {
    const OAuthAccount = sequelize.define("OAuthAccount", {
      id:               { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      provider:         DataTypes.STRING,
      provider_user_id: DataTypes.STRING,
      email:            DataTypes.STRING,
      name:             DataTypes.STRING,
      lastname:         DataTypes.STRING,
      access_token:     DataTypes.STRING,
      refresh_token:    DataTypes.STRING,
      expires_at:       DataTypes.DATE
    });
  
    OAuthAccount.associate = models => {
      OAuthAccount.belongsTo(models.User, { foreignKey: "user_id" });
    };
  
    return OAuthAccount;
  };
  