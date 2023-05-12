// eslint-disable-next-line no-unused-vars
const { Op } = require('sequelize');
const AllModels = require('../services/model.service');
/** ****************************************************************************
 *                              Front page controller to load data on home page
 ***************************************************************************** */
const ProductController = () => {
  const getAll = async (req, res) => {
    try {
      const {
        Product,
        Brand,
        Category,
        Cart,
      } = AllModels();
      const { userId } = req.query;
      let include = [];
      if (userId) {
        include = [
          {
            model: Cart,
            seprate: true,
            attribute: ['product_id'],
            where: {
              type: 'whislist',
              status: 'active',
              user_id: userId,
            },
            required: false,
          },
        ];
      }
      const products = await Product.findAll({
        where: {
          status: 'Published',
        },
        include,
        order: [
          ['id', 'DESC'],
        ],
        limit: 20,
      });
      const brands = await Brand.findAll({
        where: {
          status: 'Published',
        },
        order: [
          ['id', 'DESC'],
        ],
        limit: 8,
      });
      const categories = await Category.findAll({
        where: {
          status: {
            [Op.ne]: 'inactive',
          },
          type: 0,
        },
        order: [
          ['id', 'DESC'],
        ],
        limit: 8,
      });
      const masterCategories = await Category.findAll({
        where: {
          status: {
            [Op.ne]: 'inactive',
          },
          type: 0,
        },
        include: [
          {
            model: Category,
            include: [
              {
                model: Category,
              },
            ],
          },
        ],
        order: [
          ['id', 'DESC'],
        ],
      });
      return res.status(200).json({
        products,
        brands,
        categories,
        masterCategories,
      });
    } catch (err) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };


  return {
    getAll,
  };
};

module.exports = ProductController;
