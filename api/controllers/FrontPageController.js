// eslint-disable-next-line no-unused-vars
const { Op } = require('sequelize');
const AllModels = require('../services/model.service');

const accountSid = 'AC2df654ce9696b6c0c34e68febbecd139';
const authToken = 'cbd2088b1830d1206db0a47a2c5f9483';
const client = require('twilio')(accountSid, authToken);
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
        limit: 50,
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
          ['id', 'ASC'],
        ],
      });
      const electronics = await Category.findAll({
        where: {
          status: {
            [Op.ne]: 'inactive',
          },
          id: {
            [Op.in]: [31, 51, 100],
          },
        },
        order: [
          ['id', 'DESC'],
        ],
      });
      return res.status(200).json({
        products,
        brands,
        categories,
        masterCategories,
        electronics,
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
      let condition = {
        status: 'Published',
      };
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
      if (orArray.length) {
        condition = {
          status: 'Published',
          [Op.or]: orArray,
        };
      }
      if (req.body.brandId.length) {
        condition.brand_id = {
          [Op.in]: req.body.brandId,
        };
      }
      if (req.body.minPrice) {
        condition.mrp = {
          [Op.lte]: req.body.minPrice,
        };
      }
      if (req.body.maxPrice) {
        condition.mrp = {
          [Op.gte]: req.body.maxPrice,
        };
      }

      const products = await Product.findAll({
        where: condition,
        order: [
          ['id', 'DESC'],
        ],
      });
      return res.status(200).json({
        products,
      });
    } catch (err) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };
  const sendOtp = async (req, res) => {
    try {
      const token = req.body.apikey ? req.body.apikey : null;
      const userInfo = req.token;
      const { User } = AllModels();
      if (!token || token !== 'yourbasket2023') {
        return res.status(400).json({
          msg: 'Internal server error',
        });
      }
      const digits = '0123456789';
      let OTP = '';
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      client.messages
        .create({
          body: `yourbasket otp to confirm your checkout process ${OTP}`,
          from: '+12542724698',
          to: '+254790705672',
        })
      // eslint-disable-next-line no-unused-vars
        .then((message) => {
          User.update(
            { otp: OTP },
            // eslint-disable-next-line no-unused-vars
            { where: { id: userInfo.id } },
          );
          return res.status(200).json({
            msg: 'otp sent',
          });
        })
        .catch((e) => {
          res.status(500).json({
            msg: e,
          });
        });
    } catch (error) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const verifyOtp = async (req, res) => {
    try {
      const userInfo = req.token;
      const { User } = AllModels();
      const user = await User
        .findOne({
          where: {
            id: userInfo.id,
            otp: req.body.otp,
          },
        });

      if (!user) {
        return res.status(400).json({ msg: 'invalid otp' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };
  return {
    getAll,
    searchProduct,
    sendOtp,
    verifyOtp,
  };
};

module.exports = ProductController;
