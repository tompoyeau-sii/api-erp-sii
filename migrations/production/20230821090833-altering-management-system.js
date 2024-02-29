'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('AssociateManager', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      associateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Associates',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      managerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Associates',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
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

    await queryInterface.removeColumn('Projects', 'manager_id',)

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('AssociateManager');
  }
};
