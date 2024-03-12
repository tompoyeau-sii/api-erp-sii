'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PRU extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.PRU.belongsTo(models.Associate, {
        foreignKey: 'associate_id'
      })
    }
  }
  PRU.init({
    associate_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    value: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'PRU',
  });
  return PRU;
};