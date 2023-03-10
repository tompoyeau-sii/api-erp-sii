'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Graduation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Graduation.hasMany(models.Associate)
    }
  }
  Graduation.init({
    label: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Graduation',
  });
  return Graduation;
};