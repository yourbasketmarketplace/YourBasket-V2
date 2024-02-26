const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Faq = require('../models/Faq');
const Blog = require('../models/Blog');
const Page = require('../models/Page');
const Banner = require('../models/Banner');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Order = require('../models/Order');
const OrderItem = require('../models/OrdeItem');
const Paymentlog = require('../models/Paymentlog');
const Tempcart = require('../models/Tempcart');
const UserField = require('../models/UserField');
const UserOtp = require('../models/UserOtp');
const VendorField = require('../models/VendorField');
const Newsletter = require('../models/Newsletter');
const Setting = require('../models/Setting');
const UserNotification = require('../models/UserNotification');
const Variation = require('../models/Variation');

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
  Tempcart,
  UserField,
  VendorField,
  Faq,
  UserOtp,
  Newsletter,
  Setting,
  UserNotification,
  Variation,
});

module.exports = AllModels;
