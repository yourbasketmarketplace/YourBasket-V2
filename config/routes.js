/**
 * Import Route files and set in express middleware
 */

exports.set_routes = (app) => {
  // eslint-disable-next-line global-require
  const users = require('../api/routes/users');
  // eslint-disable-next-line global-require
  const categories = require('../api/routes/category');

  app.use('/api/users', users);
  app.use('/api/categories', categories);
};
