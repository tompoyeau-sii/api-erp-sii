'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TJM extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.TJM.belongsTo(models.Mission, {
        foreignKey: 'mission_id'
      })
    }
  }
  TJM.init({
    mission_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    value: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'TJM',
  });
  return TJM;
};