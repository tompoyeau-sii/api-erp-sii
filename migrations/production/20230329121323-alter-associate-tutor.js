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
    await queryInterface.removeColumn('Associates', 'tutor_id')
    await queryInterface.addColumn('Associates', 'isTutor', {
      type: Sequelize.BOOLEAN
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('Associates', 'tutor_id', {
      type: Sequelize.INTEGER
    })
    await queryInterface.removeColumn('Associates', 'isTutor')
  }
};
