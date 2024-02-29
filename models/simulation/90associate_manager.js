'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Associate_Manager extends Model {
        static associate(models) {
            models.Associate_Manager.belongsTo(models.Associate, {
                as: 'associate',
                foreignKey: 'associate_id'
            });

            models.Associate_Manager.belongsTo(models.Associate, {
                as: 'manager',
                foreignKey: 'manager_id'
            });
        }
    }

    Associate_Manager.init({
        associate_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        manager_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        start_date: {
            type: DataTypes.DATE,
            primaryKey: true
        },
        end_date: {
            type: DataTypes.DATE,
        }
    }, {
        sequelize,
        modelName: 'Associate_Manager',
        primaryKey: ['associate_id', 'manager_id', 'start_date']
    });

    // Synchronisation du modèle avec la base de données
    Associate_Manager.sync();

    return Associate_Manager;
};