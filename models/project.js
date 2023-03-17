'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
    static associate(models) {
      // define association here
      models.Project.belongsTo(models.Customer, {
        foreignKey: "customer_id",
      })

      models.Project.belongsTo(models.Associate, {
        foreignKey: 'manager_id'
      })

      models.Project.hasMany(models.Mission, {
        foreignKey: 'project_id'
      })
      
    }
  }
  Project.init({
    customer_id: DataTypes.INTEGER,
    label: DataTypes.STRING,
    manager_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Project',
  });
  return Project;
};