const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const AllModels = () => ({
  User,
  Category,
  Product,
});

module.exports = AllModels;
