'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Pdc extends Model {

    }
    Pdc.init({
        actual_year: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Pdc',
    });
    return Pdc;
};