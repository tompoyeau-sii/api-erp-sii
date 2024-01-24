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
    mission_reference: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "mission_id" ne peut pas être NULL
    },
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    value: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'TJM',
  });
  TJM.sync();
  return TJM;
};