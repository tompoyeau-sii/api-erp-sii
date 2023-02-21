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
        foreignKey: {
          allowNull: false
        }
      })
      models.Project.hasMany(models.Mission)
    }
  }
  Project.init({
    customer_id: DataTypes.INTEGER,
    label: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Project',
  });
  return Project;
};