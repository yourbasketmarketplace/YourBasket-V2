const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'address';

const Address = sequelize.define('Address', {
  first_name: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  last_name: {
    type: Sequelize.TEXT,
  },
  product_title: {
    type: Sequelize.STRING,
  },
  gender: {
    type: Sequelize.STRING,
    unique: false,
  },
  phone: {
    type: Sequelize.STRING,
    unique: false,
  },
  address: {
    type: Sequelize.STRING,
    unique: false,
  },
  region: {
    type: Sequelize.STRING,
    unique: false,
  },
  city: {
    type: Sequelize.STRING,
    unique: false,
  },
  type: {
    type: Sequelize.ENUM,
    values: ['cart', 'whislist'],
    defaultValue: 'cart',
  },
  status: {
    type: Sequelize.ENUM,
    values: ['active', 'inactive'],
    defaultValue: 'active',
  },
}, {
  tableName,
});

// eslint-disable-next-line
Address.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Address;
