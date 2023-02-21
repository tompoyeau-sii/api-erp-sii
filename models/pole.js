'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Pole.hasMany(models.Associate)
    }
  }
  Pole.init({
    label: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pole',
  });
  return Pole;
};