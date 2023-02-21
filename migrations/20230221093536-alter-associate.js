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
    await queryInterface.addColumn('Associates', 'start_date', {
      type: Sequelize.DATEONLY,
    })
    await queryInterface.addColumn('Associates', 'end_date', {
      type: Sequelize.DATEONLY,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Associates', 'start_date')
    await queryInterface.removeColumn('Associates', 'end_date')
  }
};
