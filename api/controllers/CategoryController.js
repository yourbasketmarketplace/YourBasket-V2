const Category = require('../models/Category');

const CategoryController = () => {
  const create = async (req, res) => {
    // body is part of a form-data
    try {
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      const category = await Category.create(req.body);

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
      const { type } = req.query;
      let query = {
        order: [
          ['id', 'DESC'],
        ],
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
      };
      if (type) {
        query = {
          where: {
            type,
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
        };
      }
      const categories = await Category.findAll(query);
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

    try {
      const category = await Category.findOne({
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

    // body is part of form-data
    const {
      body,
    } = req;

    try {
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      const category = await Category.findById(id);

      if (!category) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      const updatedCategory = await category.update({
        body,
        where: {
          id,
        },
      });

      return res.status(200).json({
        updatedCategory,
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

    try {
      const category = Category.findById(id);

      if (!category) {
        return res.status(400).json({
          msg: 'Bad Request: Model not found',
        });
      }

      await category.destroy();

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

module.exports = CategoryController;
