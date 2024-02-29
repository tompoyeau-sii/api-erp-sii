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
    await queryInterface.addColumn('Projects', 'manager_id', {
      type: Sequelize.INTEGER, references: {
        model: 'Associates',
        key: 'id'
      } 
    })

    await queryInterface.addColumn('Associates', 'isManager', {
      type: Sequelize.BOOLEAN
    })

    await queryInterface.addColumn('Associates', 'tutor_id', {
      type: Sequelize.INTEGER, references: {
        model: 'Associates',
        key: 'id'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Project', 'manager_id')

    await queryInterface.removeColumn('Associate', 'isManager')

    await queryInterface.removeColumn('Associate', 'tutor_id')
  }
};
