const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'products';

const Product = sequelize.define('Product', {
  name: {
    type: Sequelize.STRING,
    unique: false,
  },
  product_id: {
    type: Sequelize.STRING,
    unique: true,
  },
  description: {
    type: Sequelize.TEXT,
    unique: false,
  },
  group: {
    type: Sequelize.STRING,
    unique: false,
  },
  delivery_time: {
    type: Sequelize.STRING,
    unique: false,
  },
  sku: {
    type: Sequelize.STRING,
    unique: true,
  },
  qunatity: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  cost_price: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  mrp: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  offer_price: {
    type: Sequelize.INTEGER,
    unique: false,
  },
  file_name: {
    type: Sequelize.STRING,
  },
  file_path: {
    type: Sequelize.STRING,
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
Product.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Product;
