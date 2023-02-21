'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.removeColumn('Missions', 'customer_id')
    await queryInterface.addColumn('Missions', 'project_id', {
      type: Sequelize.INTEGER, references: {
        model: 'projects',
        key: 'id'
      }
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Missions', 'project_id')
    await queryInterface.addColumn('Missions', 'customer_id', {
      type: Sequelize.INTEGER, references: {
        model: 'customers',
        key: 'id'
      }
    })
  }
};
