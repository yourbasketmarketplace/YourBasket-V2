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
  const searchProduct = async (req, res) => {
    const {
      Product,
    } = AllModels();
    try {
      const query = {};
      const orArray = [];
      if (req.body.mastCatId.length) {
        orArray.push({
          master_category_id: {
            [Op.in]: req.body.mastCatId,
          },
        });
      }
      if (req.body.catId.length) {
        orArray.push({
          category_id: {
            [Op.in]: req.body.catId,
          },
        });
      }
      if (req.body.subCatId.length) {
        orArray.push({
          sub_category_id: {
            [Op.in]: req.body.subCatId,
          },
        });
      }
      if (req.body.brandId.length) {
        query.brand_id = {
          [Op.in]: req.body.brandId,
        };
      }
      if (req.body.minPrice) {
        query.mrp = {
          [Op.lte]: req.body.minPrice,
        };
      }
      if (req.body.maxPrice) {
        query.mrp = {
          [Op.gte]: req.body.maxPrice,
        };
      }
      const products = await Product.findAll({
        where: {
          status: 'Published',
          [Op.or]: orArray,
        },
        order: [
          ['id', 'DESC'],
        ],
      });
      return res.status(200).json({
        products,
      });
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  return {
    getAll,
    searchProduct,
  };
};

module.exports = ProductController;
