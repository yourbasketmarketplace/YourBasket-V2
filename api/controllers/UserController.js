const AllModels = require('../services/model.service');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const helperService = require('../services/helper.service');


const UserController = () => {
  const register = async (req, res) => {
    const { body } = req;
    const { User } = AllModels();
    const reuireFiled = ['email', 'password', 'first_name', 'last_name'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    if (body.password === body.password2) {
      try {
        const user = await User.create({
          email: body.email,
          password: body.password,
          first_name: body.first_name,
          last_name: body.last_name,
          user_name: (body.user_name) ? body.user_name : body.email,
          role: 'vendor',
        });
        const token = authService().issue({ id: user.id });

        return res.status(200).json({ token, user });
      } catch (err) {
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Bad Request: Passwords don\'t match' });
  };

  const addCustomer = async (req, res) => {
    const { body } = req;
    const { User } = AllModels();
    const reuireFiled = ['email', 'password', 'user_name', 'phone'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    try {
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      const user = await User.create({
        email: body.email,
        password: body.password,
        user_name: body.user_name,
        phone: body.phone,
        role: 'user',
        status: 'active',
        file_name: req.body.file_name,
        file_path: req.body.file_path,
      });
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };
  const addVendor = async (req, res) => {
    const { body } = req;
    const { User } = AllModels();
    const reuireFiled = ['email', 'first_name', 'last_name'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    try {
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      body.role = 'vendor';
      body.status = 'active';
      const user = await User.create(req.body);
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };

  const login = async (req, res) => {
    const { email, password, role } = req.body;
    const { User } = AllModels();
    if (email && password) {
      try {
        const user = await User
          .findOne({
            where: {
              email,
              role,
              status: 'active',
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

        return res.status(403).json({ msg: 'Unauthorized' });
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
    const { id } = req.params;
    const userInfo = req.token;
    const { User } = AllModels();
    if (id) {
      try {
        if (req.file && req.file.filename) {
          req.body.file_name = req.file.filename;
          req.body.file_path = req.file.path.replace('public/', '');
        }
        if (userInfo.id == id) {
          const user = await User.findOne({
            where: {
              id,
            },
          });
          if(req.body.password){
            req.body.password =bcryptService().password(req.body.password)
          }
          if (!user) {
            return res.status(400).json({ msg: 'User not found' });
          }
          const updated = await User.update(
            req.body,
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
      const { role } = req.query;
      let query = {
        order: [
          ['id', 'DESC'],
        ],
      };
      // eslint-disable-next-line camelcase
      if (role) {
        query = {
          where: {
            role,
          },
          order: [
            ['id', 'DESC'],
          ],
        };
      }
      const data = await User.findAll(query);
      return res.status(200).json({ data });
    } catch (err) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };

  const myprofile = async (req, res) => {
    try {
      const { User } = AllModels();
      const userInfo = req.token;
      const query = {
        where: {
          id: userInfo.id,
        },
      };
      const data = await User.findOne(query);
      return res.status(200).json({ data });
    } catch (err) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };

  const getUserDetail = async (req, res) => {
    try {
      const { id } = req.params;
      const { User } = AllModels();
      const userInfo = req.token;
      if (userInfo.role === 'admin') {
        const query = {
          where: {
            id,
          },
        };
        const data = await User.findOne(query);
        return res.status(200).json({ data });
      }
      return res.status(403).json({ msg: 'Not authorize to do this action!' });
    } catch (err) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  };
  const updateUserDetail = async (req, res) => {
    const { id } = req.params;
    const userInfo = req.token;
    const { User } = AllModels();
    if (id) {
      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      try {
        if (userInfo.role === 'admin') {
          if(req.body.password){
            //req.body.password =bcryptService().password(req.body.password)
          }
          const user = await User.findOne({
            where: {
              id,
            },
          });

          if (!user) {
            return res.status(400).json({ msg: 'User not found' });
          }
          const updated = await User.update(
            req.body,
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
        console.log(err)
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }
    return res.status(400).json({ msg: 'You are not authorized to access this page' });
  };

  return {
    register,
    login,
    validate,
    getAll,
    update,
    addCustomer,
    addVendor,
    myprofile,
    getUserDetail,
    updateUserDetail,
  };
};


module.exports = UserController;
