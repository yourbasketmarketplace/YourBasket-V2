const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'cart';

const Cart = sequelize.define('Cart', {
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
  product_sku: {
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
Cart.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Cart;
