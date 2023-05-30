// eslint-disable-next-line no-unused-vars
const AllModels = require('../services/model.service');


/** ****************************************************************************
 *                              Userfiled Controller
 ***************************************************************************** */
const UserFieldController = () => {
  const create = async (req, res) => {
    // body is part of a form-data
    const { UserField } = AllModels();

    try {
      let data;
      const userFiled = await UserField.findOne({});
      if (userFiled) {
        const { id } = req.body;
        delete (req.body.id);
        data = await UserField.update(
          req.body,
          {
            where: {
              id,
            },
          },
        );
      } else {
        data = await UserField.create(req.body);
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
        msg: 'Internal server error',
      });
    }
  };
  const get = async (req, res) => {
    // params is part of an url
    const { UserField } = AllModels();
    try {
      const data = await UserField.findOne();

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

  return {
    create,
    get,
  };
};

module.exports = UserFieldController;
