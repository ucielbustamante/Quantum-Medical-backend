module.exports = (sequelize, DataTypes) => {
    const ClinicalDocument = sequelize.define('ClinicalDocument', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        clinical_record_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        file_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mime_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file_size: {
            type: DataTypes.INTEGER, // en bytes
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
    });

    ClinicalDocument.associate = (models) => {
        ClinicalDocument.belongsTo(models.ClinicalRecord, { foreignKey: 'clinical_record_id' });
        ClinicalDocument.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return ClinicalDocument;
};