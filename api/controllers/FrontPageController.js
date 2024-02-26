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
        Banner,
      } = AllModels();
      const { userId, deals } = req.query;

      const include = [
        {
          model: Category,
          as: 'mastercategory',
          required: true,
        },
        {
          model: Category,
          as: 'category',
          required: true,
        },
        {
          model: Category,
          as: 'subcategory',
          required: true,
        },
      ];
      if (userId) {
        include.push(
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
        );
      }

      if (deals == 1) {
        const products = await Product.findAll({
          where: {
            status: 'Published',
          },
          include,
          order: [
            ['id', 'DESC'],
          ],
          limit: 12,
        });

        const best_sellers = await Product.findAll({
          where: {
            status: 'Published',
            best_seller: 1,
          },
          include,
          order: [
            ['id', 'DESC'],
          ],
          limit: 12,
        });

        return res.status(200).json({
          products,
          best_sellers,
        });
      }
      if (deals == 2) {
        const top_deals = await Product.findAll({
          where: {
            status: 'Published',
            top_deal: 1,
          },
          include,
          order: [
            ['id', 'DESC'],
          ],
          limit: 12,
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

        return res.status(200).json({
          top_deals,
          brands,
        });
      }
      if (deals == 3) {
        const new_arrivals = await Product.findAll({
          where: {
            status: 'Published',
            new_arrival: 1,
          },
          include,
          order: [
            ['id', 'DESC'],
          ],
          limit: 12,
        });

        const electronics = await Category.findAll({
          where: {
            status: {
              [Op.ne]: 'inactive',
            },
            id: {
              [Op.in]: [31, 33, 51, 100],
            },
          },
          order: [
            ['id', 'DESC'],
          ],
        });

        return res.status(200).json({
          new_arrivals,
          electronics,
        });
      }
      const categories = await Category.findAll({
        where: {
          status: {
            [Op.ne]: 'inactive',
          },
          type: 0,
        },
        order: [
          ['cat_order', 'ASC'],
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
            where: {
              status: 'active',
            },
            include: [
              {
                model: Category,
                where: {
                  status: 'active',
                },
              },
            ],
          },
        ],
        order: [
          ['cat_order', 'ASC'],
        ],
      });

      // Find all banners and make array with type..
      const bannersAll = await Banner.findAll({
        where: {
          status: {
            [Op.ne]: 'inactive',
          },
        },
        order: [
          ['banner_order', 'ASC'],
        ],
      });
      const banners = {
        1: bannersAll.filter((banner, i) => (banner.type == 1)),
        2: bannersAll.filter((banner, i) => (banner.type == 2)),
        3: bannersAll.filter((banner, i) => (banner.type == 3)),
        4: bannersAll.filter((banner, i) => (banner.type == 4)),
        5: bannersAll.filter((banner, i) => (banner.type == 5)),
        6: bannersAll.filter((banner, i) => (banner.type == 6)),
      };

      return res.status(200).json({
        categories,
        masterCategories,
        banners,
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
      Cart,
      Category,
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
      if (req.body.minPrice && req.body.maxPrice) {
        condition.offer_price = {
          [Op.between]: [req.body.minPrice, req.body.maxPrice],
        };
      } else {
        if (req.body.minPrice) {
          condition.offer_price = {
            [Op.gte]: req.body.minPrice,
          };
        }
        if (req.body.maxPrice) {
          condition.offer_price = {
            [Op.lte]: req.body.maxPrice,
          };
        }
      }
      if (req.body.dates && req.body.dates.length > 0) {
        if (req.body.dates[0]) {
          var days = req.body.dates[0];
        }
        if (req.body.dates[1]) {
          var days = req.body.dates[1];
        }
        if (req.body.dates[2]) {
          var days = req.body.dates[2];
        }
        const date = new Date();
        const last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
        condition.createdAt = {
          [Op.gte]: last,
        };
      }
      if (req.body.filter) {
        if (req.body.filter == 'best-sellers') {
          condition.best_seller = {
            [Op.in]: [1],
          };
        }
        if (req.body.filter == 'top-deals') {
          condition.top_deal = {
            [Op.in]: [1],
          };
        }
        if (req.body.filter == 'new-arrivals') {
          condition.new_arrival = {
            [Op.in]: [1],
          };
        }
      }
      if (req.body.keyword) {
        condition.name = {
          [Op.like]: `%${req.body.keyword}%`,
        };
      }

      const defaultSort = (req.body.priceSort) ? (req.body.priceSort == 'popularity' ? ['view_count', 'DESC'] : ['offer_price', req.body.priceSort]) : ['id', 'DESC'];
      const defaultLimit = (req.body.limit) ? req.body.limit : 12;
      const defaultOffset = (req.body.page) ? defaultLimit * (req.body.page - 1) : 0;
      const { userId } = req.query;
      const include = [
        {
          model: Category,
          as: 'mastercategory',
          required: true,
        },
        {
          model: Category,
          as: 'category',
          required: true,
        },
        {
          model: Category,
          as: 'subcategory',
          required: true,
        },
      ];
      if (userId) {
        include.push(
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
        );
      }
      const products = await Product.findAll({
        where: condition,
        include,
        order: [
          defaultSort,
        ],
        limit: defaultLimit,
        offset: defaultOffset,
      });
      const products_count = await Product.count({
        where: condition,
      });
      return res.status(200).json({
        products,
        products_count,
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
      const uInfo = await User.findOne({
        where: { id: userInfo.id },
      });
      await client.messages
        .create({
          body: `yourbasket otp to confirm your checkout process ${OTP}`,
          from: '+12542724698',
          to: `+${uInfo.phone}`,
        })
      // eslint-disable-next-line no-unused-vars
        .then((message) => {
          User.update(
            { otp: OTP },
            // eslint-disable-next-line no-unused-vars
            { where: { id: userInfo.id } },
          );
          return res.status(200).json({
            msg: 'OTP sent successfully!',
          });
        })
        .catch((e) => res.status(500).json({
          msg: 'Error while sending OTP, Please try again!',
        }));
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
        return res.status(400).json({ msg: 'Invalid OTP' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const getSetting = async (req, res, setting_key) => {
    try {
      const { Setting } = AllModels();
      const setting = await Setting
        .findOne({
          where: {
            meta_key: setting_key,
          },
        });

      if (!setting) {
        return res.status(400).json({ msg: 'No data found!' });
      }

      const data = JSON.parse(setting.meta_value);

      return res.status(200).json({ data });
    } catch (error) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const updateSetting = async (req, res, setting_key) => {
    try {
      const userInfo = req.token;
      const { Setting } = AllModels();
      const {
        body,
      } = req;

      if (userInfo.role == 'admin') {
        let updateData = {};
        if (setting_key == 'social_links') {
          updateData = {
            facebook: body.facebook,
            instagram: body.instagram,
            twitter: body.twitter,
            linkedin: body.linkedin,
            tiktok: body.tiktok,
          };
        } else if (setting_key == 'contact_page') {
          updateData = {
            address: body.address,
            phone: body.phone,
            email: body.email,
            map_lat: body.map_lat,
            map_lng: body.map_lng,
          };
        }

        if (updateData) {
          const meta = {
            meta_key: setting_key,
            meta_value: JSON.stringify(updateData),
          };

          const setting = await Setting.findOne({
            where: {
              meta_key: setting_key,
            },
          });

          if (!setting) {
            var data = await Setting.create(meta);
          } else {
            var data = await Setting.update(
              meta,
              {
                where: {
                  id: setting.id,
                },
              },
            );
          }

          return res.status(200).json({ data });
        }
        return res.status(400).json({ msg: 'Something went wrong, Please try again!' });
      }
      return res.status(400).json({ msg: 'Unauthorized!' });
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
    getSetting,
    updateSetting,
  };
};

module.exports = ProductController;
