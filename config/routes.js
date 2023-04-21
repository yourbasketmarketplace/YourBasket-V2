/**
 * Import Route files and set in express middleware
 */

exports.set_routes = (app) => {
  // eslint-disable-next-line global-require
  const users = require('../api/routes/users');
  // eslint-disable-next-line global-require
  const categories = require('../api/routes/category');
  // eslint-disable-next-line global-require
  const products = require('../api/routes/product');
  // eslint-disable-next-line global-require
  const brands = require('../api/routes/brand');
  // eslint-disable-next-line global-require
  const blogs = require('../api/routes/blog');
  // eslint-disable-next-line global-require
  const pages = require('../api/routes/page');

  app.use('/api/users', users);
  app.use('/api/categories', categories);
  app.use('/api/products', products);
  app.use('/api/brands', brands);
  app.use('/api/blog', blogs);
  app.use('/api/pages', pages);
};
