'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mission extends Model {
    static associate(models) {
      models.Mission.belongsTo(models.Project, {
        foreignKey: 'project_id',
      });

      models.Mission.belongsTo(models.Associate, {
        foreignKey: 'associate_id',
        onDelete: 'CASCADE',
      });

      models.Mission.hasMany(models.TJM, {
        foreignKey: 'mission_id',
        onDelete: 'CASCADE',
      });
    }
  }
  Mission.init({
    label: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "label" ne peut pas être NULL
    },
    associate_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Champ "associate_id" ne peut pas être NULL
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Champ "project_id" ne peut pas être NULL
    },
    date_range_mission: {
      type: DataTypes.RANGE(DataTypes.DATEONLY),
      allowNull: false, // Champ "start_date" ne peut pas être NULL
    },
    // start_date: {
    //   type: DataTypes.DATEONLY,
    //   allowNull: false, // Champ "start_date" ne peut pas être NULL
    // },
    // end_date: {
    //   type: DataTypes.DATEONLY,
    //   allowNull: false, // Champ "end_date" ne peut pas être NULL
    // },
    
    imputation_value: {
      type: DataTypes.INTEGER,
      allowNull: false, // Champ "project_id" ne peut pas être NULL
    },
    // imputation_start: {
    //   type: DataTypes.DATEONLY,
    //   allowNull: false, // Champ "start_date" ne peut pas être NULL
    // },
    // imputation_end: {
    //   type: DataTypes.DATEONLY,
    //   allowNull: false, // Champ "end_date" ne peut pas être NULL
    // },
  },
   {
    sequelize,
    modelName: 'Mission',
  });
  Mission.sync();
  return Mission;
};
