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
        foreignKey: {
          allowNull: false
        }
      })
      models.Associate.belongsTo(models.Pole, {
        foreignKey: {
          allowNull: false
        }
      })
      models.Associate.belongsTo(models.Gender, {
        foreignKey: {
          allowNull: false
        }
      })
      models.Associate.hasMany(models.Mission)
      models.Associate.belongsToMany(models.Project, { through: 'Associate_Project' });
      models.Associate.belongsToMany(models.Job, { through: 'Associate_Job' });
    }
  }
  Associate.init({
    name: DataTypes.STRING,
    first_name: DataTypes.STRING,
    birthdate: DataTypes.DATEONLY,
    telephone: DataTypes.INTEGER,
    mail: DataTypes.STRING,
    hourRate: DataTypes.INTEGER,
    graduation_id: DataTypes.INTEGER,
    gender_id: DataTypes.INTEGER,
    pole_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Associate',
  });
  return Associate;
};