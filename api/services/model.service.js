const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');

const AllModels = () => ({
  User,
  Category,
  Product,
  Brand,
});

module.exports = AllModels;
