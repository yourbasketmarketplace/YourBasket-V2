const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');

const hooks = {
  beforeCreate(user) {
    user.password = bcryptService().password(user); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'users';

const User = sequelize.define(
  'User',
  {
    user_name: {
      type: Sequelize.STRING,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    first_name: {
      type: Sequelize.STRING,
    },
    last_name: {
      type: Sequelize.STRING,
    },
    middle_name: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    website_link: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    zipcode: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.ENUM,
      values: ['admin', 'vendor', 'user'],
    },
    reset_password_token: {
      type: Sequelize.STRING,
    },
    token_expire_time: {
      type: Sequelize.BIGINT,
    },
    login_first_time: { // use this flag to redirect on change password for invite agency user
      type: Sequelize.ENUM,
      values: ['0', '1'],
      defaultValue: '0',
    },
    status: {
      type: Sequelize.ENUM,
      values: ['active', 'deleted', 'approved', 'reject', 'pending'],
      defaultValue: 'pending',
    },
  },
  { hooks, tableName },
);

// eslint-disable-next-line
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  delete values.password;

  return values;
};


module.exports = User;
