const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'brands';

const Brand = sequelize.define('Brand', {
  name: {
    type: Sequelize.STRING,
    unique: false,
  },
  file_name: {
    type: Sequelize.STRING,
  },
  file_path: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.TEXT,
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
Brand.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Brand;
