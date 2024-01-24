'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Fee.belongsTo(models.Associate, {
        foreignKey: 'associate_id'
      })
      models.Fee.belongsTo(models.Mission, {
        foreignKey: 'mission_id'
      })
    }
  }
  Fee.init({
    associate_id: DataTypes.INTEGER,
    mission_id: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    label: DataTypes.STRING,
    value: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Fee',
  });
  Fee.sync();
  return Fee;
};