const database = require('../../config/database');
const AllModels = require('./model.service');

const dbService = (environment, migrate) => {
  const authenticateDB = () => database.authenticate();

  // eslint-disable-next-line no-unused-vars
  const dropDB = () => database.drop();

  const syncDB = () => database.sync();
  // eslint-disable-next-line no-unused-vars
  const association = () => {
    const {
      // eslint-disable-next-line no-unused-vars
      User,
      Category,
      Product,
      Brand,
      Banner,
      Review,
      Cart,
      Address,
    } = AllModels();
    Category.hasMany(Category, { foreignKey: 'parent_id', sourceKey: 'id' });
    Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parentcategory', sourceKey: 'id' });
    Product.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
    Product.belongsTo(Category, { foreignKey: 'master_category_id', as: 'mastercategory', targetKey: 'id' });
    Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category', targetKey: 'id' });
    Product.belongsTo(Category, { foreignKey: 'sub_category_id', as: 'subcategory', targetKey: 'id' });
    Product.belongsTo(Brand, { foreignKey: 'brand_id', targetKey: 'id' });
    Brand.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
    Banner.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
    Review.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
    Review.belongsTo(Product, { foreignKey: 'product_id', targetKey: 'id' });
    Cart.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
    Cart.belongsTo(Product, { foreignKey: 'product_id', targetKey: 'id' });
    Address.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
    Product.hasMany(Cart, { foreignKey: 'product_id', sourceKey: 'id' });
    User.hasMany(Cart, { foreignKey: 'user_id', sourceKey: 'id' });
    // eslint-disable-next-line no-console
    console.log('association....finish');
    return true;
  };
  const successfulDBStart = () => (
    console.info('connection to the database has been established successfully')
  );

  const errorDBStart = (err) => (
    console.info('unable to connect to the database:', err)
  );

  const wrongEnvironment = () => {
    console.warn(`only development, staging, test and production are valid NODE_ENV variables but ${environment} is specified`);
    return process.exit(1);
  };

  const startMigrateTrue = async () => {
    try {
      await syncDB();
      successfulDBStart();
    } catch (err) {
      errorDBStart(err);
    }
  };

  const startMigrateFalse = async () => {
    try {
      // await dropDB();
      await syncDB();
      successfulDBStart();
    } catch (err) {
      errorDBStart(err);
    }
  };

  const startDev = async () => {
    try {
      await authenticateDB();

      if (migrate) {
        return startMigrateTrue();
      }

      return startMigrateFalse();
    } catch (err) {
      return errorDBStart(err);
    }
  };

  const startStage = async () => {
    try {
      await authenticateDB();

      if (migrate) {
        return startMigrateTrue();
      }

      return startMigrateFalse();
    } catch (err) {
      return errorDBStart(err);
    }
  };

  const startTest = async () => {
    try {
      await authenticateDB();
      await startMigrateFalse();
    } catch (err) {
      errorDBStart(err);
    }
  };

  const startProd = async () => {
    try {
      await authenticateDB();
      await startMigrateFalse();
    } catch (err) {
      errorDBStart(err);
    }
  };

  const start = async () => {
    association();
    switch (environment) {
      case 'development':
        await startDev();
        break;
      case 'staging':
        await startStage();
        break;
      case 'testing':
        await startTest();
        break;
      case 'production':
        await startProd();
        break;
      default:
        await wrongEnvironment();
    }
  };

  return {
    start,
  };
};

module.exports = dbService;
