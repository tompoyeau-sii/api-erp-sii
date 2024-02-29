'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Associate_Manager', {
      associate_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      manager_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        primaryKey: true,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        primaryKey: true,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Associate_Manager');
  }
};
