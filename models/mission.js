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
        foreignKey: {
          allowNull: false
        }
      })
      models.Mission.belongsTo(models.Associate, {
        foreignKey: {
          allowNull: false
        }
      })
    }
  }
  Mission.init({
    project_id: DataTypes.INTEGER,
    associate_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'Mission',
  });
  return Mission;
};