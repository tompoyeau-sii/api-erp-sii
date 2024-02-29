'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Fees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      associate_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'associates',
          key: 'id'
        }
      },
      mission_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'missions',
          key: 'id'
        }
      },
      date: {
        type: Sequelize.DATEONLY
      },
      label: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('Fees');
  }
};