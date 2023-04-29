// eslint-disable-next-line no-unused-vars
const AllModels = require('../services/model.service');
const helperService = require('../services/helper.service');
/** ****************************************************************************
 *                              Agency service Controller
 ***************************************************************************** */
const ProductController = () => {
  const create = async (req, res) => {
    // body is part of a form-data
    const { Product } = AllModels();
    const userInfo = req.token;
    try {
      const reuireFiled = ['name', 'sku', 'cost_price', 'product_id', 'mrp'];

      const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
      if (checkField.isMissingParam) {
        return res.status(400).json({ msg: checkField.message });
      }
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      req.body.user_id = userInfo.id;
      const category = await Product.create(req.body);

      if (!category) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      return res.status(200).json({
        category,
      });
    } catch (err) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const getAll = async (req, res) => {
    try {
      const { Product } = AllModels();
      const categories = await Product.findAll({
        order: [
          ['id', 'DESC'],
        ],
      });
      return res.status(200).json({
        categories,
      });
    } catch (err) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const getVendorProduct = async (req, res) => {
    try {
      const { Product } = AllModels();
      const userInfo = req.token;
      const categories = await Product.findAll({
        where: {
          user_id: userInfo.id,
        },
        order: [
          ['id', 'DESC'],
        ],
      });
      return res.status(200).json({
        categories,
      });
    } catch (err) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const get = async (req, res) => {
    // params is part of an url
    const { id } = req.params;
    const { Product } = AllModels();
    try {
      const category = await Product.findOne({
        where: {
          id,
        },
      });

      if (!category) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      return res.status(200).json({
        category,
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
    const { Product } = AllModels();
    const userInfo = req.token;
    // body is part of form-data
    const {
      body,
    } = req;

    try {
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      const data = await Product.findOne({
        where: {
          id,
          user_id: userInfo.id,
        },
      });

      if (!data) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      const updated = await Product.update(
        body,
        {
          where: {
            id,
            user_id: userInfo.id,
          },
        },
      );

      return res.status(200).json({
        updated,
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
    const { Product } = AllModels();
    try {
      const category = Product.findById(id);

      if (!category) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      await Product.destroy();

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
    getVendorProduct,
  };
};

module.exports = ProductController;
