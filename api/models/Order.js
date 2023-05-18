const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'order';

const Order = sequelize.define('Order', {
  total_amount: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  pending_amount: {
    type: Sequelize.INTEGER,
  },
  payment_method: {
    type: Sequelize.STRING,
  },
  tax_amount: {
    type: Sequelize.INTEGER,
  },
  item_amount: {
    type: Sequelize.INTEGER,
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
