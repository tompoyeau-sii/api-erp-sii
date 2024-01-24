'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      models.Project.belongsTo(models.Customer, {
        foreignKey: "customer_id",
      });

      models.Project.hasMany(models.Mission, {
        foreignKey: 'project_id',
        onDelete: 'CASCADE',
      });
    }
  }
  Project.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Champ "customer_id" ne peut pas être NULL
    },
    adv: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "adv" ne peut pas être NULL
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "label" ne peut pas être NULL
    },
  }, {
    sequelize,
    modelName: 'Project',
  });
  Project.sync();
  return Project;
};
