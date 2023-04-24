'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Mission.belongsTo(models.Project, {
        foreignKey: 'project_id'
      })
      models.Mission.belongsTo(models.Associate, {
        foreignKey: 'associate_id'
      })
      models.Mission.hasMany(models.TJM, {
        foreignKey: 'mission_id'
      })
      models.Mission.hasMany(models.Imputation, {
        foreignKey: 'mission_id'
      })
    }
  }
  Mission.init({
    label: DataTypes.STRING,
    associate_id: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Mission',
  });
  Mission.sync();
  return Mission;
};