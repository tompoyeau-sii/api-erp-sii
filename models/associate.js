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
        foreignKey: "graduation_id",
        onDelete: 'CASCADE',
      })

      models.Associate.belongsTo(models.Gender, {
        foreignKey: 'gender_id',
        onDelete: 'CASCADE',
      })
      models.Associate.hasMany(models.Mission, {
        foreignKey: 'associate_id',
        onDelete: 'CASCADE',
      })

      models.Associate.hasMany(models.PRU, {
        foreignKey: 'associate_id',
        onDelete: 'CASCADE',
      })

      models.Associate.belongsToMany(models.Job, { 
        through: 'Associate_Job', 
        foreignKey: 'associate_id', 
        onDelete: 'CASCADE', 
      });

      // Ajoutez la relation Many-to-Many auto-associée pour les managers
      models.Associate.belongsToMany(models.Associate, {
        as: 'managers',            // Nom de la relation pour récupérer les managers
        through: 'Associate_Manager', // Nom de la table de liaison
        foreignKey: 'associate_id',   // Clé étrangère de cet associé dans la table de liaison
        onDelete: 'CASCADE',
      });

      // Ajoutez la relation Many-to-Many auto-associée pour les managers
      models.Associate.belongsToMany(models.Associate, {
        as: 'associates',            // Nom de la relation pour récupérer les managers
        through: 'Associate_Manager', // Nom de la table de liaison
        foreignKey: 'manager_id',   // Clé étrangère de cet associé dans la table de liaison
        onDelete: 'CASCADE',
      });
    }
  }
  Associate.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "name" ne peut pas être NULL
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "first_name" ne peut pas être NULL
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false, // Champ "birthdate" ne peut pas être NULL
    },
    mail: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "mail" ne peut pas être NULL
    },
    graduation_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Champ "graduation_id" ne peut pas être NULL
    },
    gender_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Champ "gender_id" ne peut pas être NULL
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false, // Champ "start_date" ne peut pas être NULL
    },
    end_date: {
      type: DataTypes.DATEONLY,
    },
  }, {
    sequelize,
    modelName: 'Associate',
  });
  Associate.sync();
  return Associate;
};
