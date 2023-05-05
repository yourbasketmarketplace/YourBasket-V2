// eslint-disable-next-line no-unused-vars
const AllModels = require('../services/model.service');
const helperService = require('../services/helper.service');
/** ****************************************************************************
 *                              Agency service Controller
 ***************************************************************************** */
const ReviewController = () => {
  const create = async (req, res) => {
    console.log(req.body)
    // body is part of a form-data
    const { Review } = AllModels();
    const userInfo = req.token;
    try {
      const reuireFiled = ['review'];

      const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
      if (checkField.isMissingParam) {
        return res.status(400).json({ msg: checkField.message });
      }
      if (userInfo && userInfo.id) {
        req.body.user_id = userInfo.id;
      }

      const data = await Review.create(req.body);

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


  return {
    create,
  };
};

module.exports = ReviewController;
