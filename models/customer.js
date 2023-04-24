'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Customer.hasMany(models.Project, {
        foreignKey: 'customer_id'
      })
    }
  }
  Customer.init({
    label: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Customer',
  });
  Customer.sync();
  return Customer;
};