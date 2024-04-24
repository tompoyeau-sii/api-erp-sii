'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class workedDay extends Model {
        static associate(models) {
            models.WorkedDays.belongsTo(models.Associate, {
                foreignKey: 'associate_id'
            })
        }
    }
    workedDay.init({
        associate_id: DataTypes.INTEGER,
        month_date: DataTypes.DATEONLY,
        nb_day: DataTypes.FLOAT,
        
    }, {
        sequelize,
        modelName: 'WorkedDays',
    });
    return workedDay;
};