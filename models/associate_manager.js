'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Associate_Manager extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            models.Associate_Manager.belongsTo(models.Associate, {
                as: 'associate',          // Alias pour le collaborateur associé
                foreignKey: 'associate_id'
            });

            models.Associate_Manager.belongsTo(models.Associate, {
                as: 'manager',            // Alias pour le manager associé
                foreignKey: 'manager_id'
            });
        }
    }
    Associate_Manager.init({
        associate_id: DataTypes.INTEGER,
        manager_id: DataTypes.INTEGER,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Associate_Manager',
    });
    Associate_Manager.sync();
    return Associate_Manager;
};