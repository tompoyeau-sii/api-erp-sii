'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Imputation extends Model {
    static associate(models) {
      models.Imputation.belongsTo(models.Mission, {
        foreignKey: 'mission_id'
      });
    }
  }
  Imputation.init({
    mission_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Champ "mission_id" ne peut pas être NULL
    },
   
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false, // Champ "start_date" ne peut pas être NULL
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false, // Champ "end_date" ne peut pas être NULL
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false, // Champ "value" ne peut pas être NULL
    }
  }, {
    sequelize,
    modelName: 'Imputation',
  });
  Imputation.sync();
  return Imputation;
};
