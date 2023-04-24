'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Associate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Associate.belongsTo(models.Graduation, {
        foreignKey: "graduation_id"
      })

      models.Associate.belongsTo(models.Gender, {
        foreignKey: 'gender_id'
      })
      models.Associate.hasMany(models.Mission, {
        foreignKey: 'associate_id'
      })

      models.Associate.hasMany(models.Project, {
        foreignKey: 'manager_id'
      })

      models.Associate.hasMany(models.PRU, {
        foreignKey: 'associate_id'
      })
      models.Associate.belongsToMany(models.Job, { through: 'Associate_Job', foreignKey: 'associate_id' });
    }
  }
  Associate.init({
    name: DataTypes.STRING,
    first_name: DataTypes.STRING,
    birthdate: DataTypes.DATEONLY,
    mail: DataTypes.STRING,
    graduation_id: DataTypes.INTEGER,
    gender_id: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    isTutor: DataTypes.BOOLEAN,
    isManager: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Associate',
  });
  Associate.sync();
  return Associate;
};