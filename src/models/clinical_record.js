module.exports = (sequelize, DataTypes) => {
    const ClinicalRecord = sequelize.define('ClinicalRecord', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        patient_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
    });

    ClinicalRecord.associate = (models) => {
        ClinicalRecord.belongsTo(models.Patient, { foreignKey: 'patient_id' });
        ClinicalRecord.hasMany(models.ClinicalDocument, { foreignKey: 'clinical_record_id' });
    };

    return ClinicalRecord;
};