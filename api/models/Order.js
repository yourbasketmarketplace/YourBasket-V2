const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'orders';

const Order = sequelize.define('Order', {
  total_amount: {
    type: Sequelize.FLOAT,
    unique: false,
  },
  pending_amount: {
    type: Sequelize.FLOAT,
  },
  payment_method: {
    type: Sequelize.FLOAT,
  },
  tax_amount: {
    type: Sequelize.FLOAT,
  },
  item_amount: {
    type: Sequelize.FLOAT,
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
Order.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Order;
