const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Blog = require('../models/Blog');
const Page = require('../models/Page');
const Banner = require('../models/Banner');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Order = require('../models/Order');
const OrderItem = require('../models/OrdeItem');
const Paymentlog = require('../models/Paymentlog');

const AllModels = () => ({
  User,
  Category,
  Product,
  Brand,
  Blog,
  Page,
  Banner,
  Review,
  Cart,
  Address,
  Order,
  OrderItem,
  Paymentlog,
});

module.exports = AllModels;
