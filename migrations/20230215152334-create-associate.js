'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Associates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      birthdate: {
        type: Sequelize.DATEONLY
      },
      telephone: {
        type: Sequelize.INTEGER
      },
      mail: {
        type: Sequelize.STRING
      },
      tauxHoraire: {
        type: Sequelize.INTEGER
      },
      graduation_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Graduations',
          key: 'id'
        }
      },
      gender_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Genders',
          key: 'id'
        }
      },
      pole_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Poles',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Associates');
  }
};