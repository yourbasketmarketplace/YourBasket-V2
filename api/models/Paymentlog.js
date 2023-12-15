const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'payment_log';

const PaymentLog = sequelize.define('PaymentLog', {
  logbody: {
    type: Sequelize.TEXT,
    unique: false,
  },
  logquery: {
    type: Sequelize.TEXT,
    unique: false,
  },
}, {
  tableName,
});

// eslint-disable-next-line
PaymentLog.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = PaymentLog;
