'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      // Définissez vos associations ici si nécessaire
    }
  }
  Account.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "username" ne peut pas être NULL
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Champ "password" ne peut pas être NULL
    }
  }, {
    sequelize,
    modelName: 'Account',
  });
  Account.sync();
  return Account;
};
