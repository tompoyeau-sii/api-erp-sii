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
        foreignKey: {
          allowNull: false
        }
      })
      models.Fee.belongsTo(models.Mission, {
        foreignKey: {
          allowNull: false
        }
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
  return Fee;
};