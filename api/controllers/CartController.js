// eslint-disable-next-line no-unused-vars
const AllModels = require('../services/model.service');
const helperService = require('../services/helper.service');
/** ****************************************************************************
 *                              Agency service Controller
 ***************************************************************************** */
const CartController = () => {
  const create = async (req, res) => {
    // body is part of a form-data
    const { Cart } = AllModels();
    const userInfo = req.token;
    try {
      const reuireFiled = ['price', 'product_id', 'variant'];

      const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
      if (checkField.isMissingParam) {
        return res.status(400).json({ msg: checkField.message });
      }
      req.body.user_id = userInfo.id;
      const cartExist = await Cart.findOne({
        where: {
          user_id: userInfo.id,
          product_id: req.body.product_id,
          variant: req.body.variant,
        },
      });
      let data;
      if (cartExist) {
        let { quantity } = cartExist;
        quantity = req.body.quantity + quantity;
        data = await Cart.update(
          { quantity },
          {
            where: {
              id: cartExist.id,
            },
          },
        );
      } else {
        data = await Cart.create(req.body);
      }

      if (!data) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      return res.status(200).json({
        data,
      });
    } catch (err) {
      return res.status(500).json({
        msg: err,
      });
    }
  };

  const getAll = async (req, res) => {
    try {
      const { Cart, Product, Brand } = AllModels();
      const { type } = req.query;
      const userInfo = req.token;
      const query = {
        where: {
          type,
          user_id: userInfo.id,
          status: 'active',
        },
        order: [
          ['id', 'DESC'],
        ],
        include: [
          {
            model: Product,
            include: [
              {
                model: Brand,
              },
            ],
          },
        ],
      };

      const data = await Cart.findAll(query);
      return res.status(200).json({
        data,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const get = async (req, res) => {
    // params is part of an url
    const { id } = req.params;
    const { Cart, Product } = AllModels();
    try {
      const data = await Cart.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Product,
          },
        ],
      });

      if (!data) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      return res.status(200).json({
        data,
      });
    } catch (err) {
      // better save it to log file
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };


  const update = async (req, res) => {
    // params is part of an url
    const { id } = req.params;
    const { Cart } = AllModels();
    // body is part of form-data
    const {
      body,
    } = req;

    try {
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      const brand = await Cart.findOne({
        where: {
          id,
        },
      });

      if (!brand) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      const data = await Cart.update(
        body,
        {
          where: {
            id,
          },
        },
      );

      return res.status(200).json({
        data,
      });
    } catch (err) {
      // better save it to log file
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };


  const destroy = async (req, res) => {
    // params is part of an url
    const { id } = req.params;
    const { Cart } = AllModels();
    try {
      const data = Cart.findById(id);

      if (!data) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      await data.destroy();

      return res.status(200).json({
        msg: 'Successfully destroyed model',
      });
    } catch (err) {
      // better save it to log file
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  return {
    create,
    getAll,
    get,
    update,
    destroy,
  };
};

module.exports = CartController;
