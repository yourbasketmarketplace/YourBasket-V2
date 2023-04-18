const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Blog = require('../models/Blog');

const AllModels = () => ({
  User,
  Category,
  Product,
  Brand,
  Blog,
});

module.exports = AllModels;
