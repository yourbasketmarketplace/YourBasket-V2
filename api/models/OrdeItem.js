const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'order-items';

const OrderItem = sequelize.define('OrderItem', {
  price: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  variant: {
    type: Sequelize.TEXT,
  },
  product_title: {
    type: Sequelize.STRING,
  },
  quantity: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  product_sku: {
    type: Sequelize.STRING,
    unique: false,
  },
  cancel_reason: {
    type: Sequelize.STRING,
    unique: false,
  },
  cancel_by: {
    type: Sequelize.INTEGER,
    unique: false,
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
OrderItem.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

module.exports = OrderItem;
