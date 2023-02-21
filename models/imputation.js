'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Imputation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Imputation.belongsTo(models.Mission, {
        foreignKey: {
          allowNull: false
        }
      })
    }
  }
  Imputation.init({
    mission_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    value: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Imputation',
  });
  return Imputation;
};