const AllModels = require('../services/model.service');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');

const UserController = () => {
  const register = async (req, res) => {
    const { body } = req;
    const { User } = AllModels();
    if (body.password === body.password2) {
      try {
        const user = await User.create({
          email: body.email,
          password: body.password,
          first_name: body.first_name,
          last_name: body.last_name,
        });
        const token = authService().issue({ id: user.id });

        return res.status(200).json({ token, user });
      } catch (err) {
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Bad Request: Passwords don\'t match' });
  };

  const login = async (req, res) => {
    const { email, password } = req.body;
    const { User } = AllModels();
    if (email && password) {
      try {
        const user = await User
          .findOne({
            where: {
              email,
            },
          });

        if (!user) {
          return res.status(400).json({ msg: 'Bad Request: User not found' });
        }

        if (bcryptService().comparePassword(password, user.password)) {
          const token = authService().issue({
            id: user.id, role: user.role, first_name: user.first_name, last_name: user.last_name,
          });

          return res.status(200).json({ token, user });
        }

        return res.status(401).json({ msg: 'Unauthorized' });
      } catch (err) {
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Bad Request: Email or password is wrong' });
  };

  /**
 * @description: update login user detail
 * @param {*} req
 * @param {*} res
 * @returns
 */
  // eslint-disable-next-line consistent-return
  const update = async (req, res) => {
    const { body } = req;
    const { id } = req.params;
    const userInfo = req.token;
    const { User } = AllModels();
    if (id) {
      try {
        if (userInfo.id === id) {
          const user = await User.findOne({
            where: {
              id,
            },
          });

          if (!user) {
            return res.status(400).json({ msg: 'User not found' });
          }
          const updated = await User.update(
            body,
            { where: { id } },
          );

          // eslint-disable-next-line no-throw-literal
          if (!updated) throw 'Error while updating';

          return res
            .status(200)
            .json({ success: true, msg: 'Profile updated successfully' });
        }
        return res.status(400).json({ msg: 'You are not authorized to access this page' });
      } catch (err) {
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }
  };

  const validate = (req, res) => {
    const { token } = req.body;

    authService().verify(token, (err) => {
      if (err) {
        return res.status(401).json({ isvalid: false, err: 'Invalid Token!' });
      }

      return res.status(200).json({ isvalid: true });
    });
  };

  const getAll = async (req, res) => {
    try {
      const { User } = AllModels();
      const users = await User.findAll();

      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };


  return {
    register,
    login,
    validate,
    getAll,
    update,
  };
};

module.exports = UserController;
