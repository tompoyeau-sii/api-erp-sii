'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {
      models.Job.belongsToMany(models.Associate, { through: 'Associate_Job', foreignKey: 'job_id' });
    }
  }
  Job.init({
    label: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "label" ne peut pas être NULL
    }
  }, {
    sequelize,
    modelName: 'Job',
  });
  return Job;
};
