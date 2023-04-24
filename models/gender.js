'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gender extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      models.Gender.hasMany(models.Associate, {

        foreignKey: 'gender_id'
      })
    }
  }
  Gender.init({
    label: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Gender',
  });
  Gender.sync();
  return Gender;
};