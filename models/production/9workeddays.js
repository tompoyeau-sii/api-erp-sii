'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkedDays extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.WorkedDays.belongsTo(models.Associate, {
        foreignKey: 'associate_id'
      })
    }
  }
  WorkedDays.init({
    associate_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    value: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'WorkedDays',
  });
  return WorkedDays;
};