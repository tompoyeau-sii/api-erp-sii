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
    await queryInterface.renameColumn('associatemanager', 'managerId', 'manager_id');
    await queryInterface.renameColumn('associatemanager', 'associateId', 'associate_id');
    await queryInterface.renameColumn('associatemanager', 'startDate', 'start_date');
    await queryInterface.renameColumn('associatemanager', 'endDate', 'end_date');

    await queryInterface.changeColumn('associatemanager', 'start_date', {
      type: Sequelize.DATE,
      // Ajoutez d'autres options de colonne si nécessaire
    });
    await queryInterface.changeColumn('associatemanager', 'end_date', {
      type: Sequelize.DATE,
      // Ajoutez d'autres options de colonne si nécessaire
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
