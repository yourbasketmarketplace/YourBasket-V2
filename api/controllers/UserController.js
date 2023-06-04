const AllModels = require('../services/model.service');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const helperService = require('../services/helper.service');
const crypto = require('crypto');

const accountSid = 'AC2df654ce9696b6c0c34e68febbecd139';
const authToken = 'cbd2088b1830d1206db0a47a2c5f9483';
const client = require('twilio')(accountSid, authToken);


const UserController = () => {
  const register = async (req, res) => {
    const { body } = req;
    const { User } = AllModels();
    const reuireFiled = ['email', 'password', 'first_name', 'last_name'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    if (req.body.role === 'admin') {
      return res.status(400).json({ msg: 'Bad Request: Not allowed' });
    }
    if (body.password === body.password2) {
      try {
        const user = await User.create({
          email: body.email,
          password: body.password,
          phone: body.phone,
          first_name: body.first_name,
          last_name: body.last_name,
          user_name: (body.user_name) ? body.user_name : body.email,
          middle_name: (body.middle_name) ? body.middle_name : '',
          address: (body.address) ? body.address : '',
          website_link: (body.website_link) ? body.website_link : '',
          state: (body.state) ? body.state : '',
          city: (body.city) ? body.city : '',
          company_name: (body.company_name) ? body.company_name : '',
          referral_name: (body.referral_name) ? body.referral_name : '',
          role: body.role,
          status: body.role === 'user' ? 'active' : 'pending',
        });
        const token = authService().issue({ id: user.id });

        return res.status(200).json({ token, user });
      } catch (err) {
        return res.status(500).json({ msg: err.errors[0].message });
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
        console.log(err);
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Bad Request: Email or password is wrong' });
  };
  /**
 * @description: Forgot password
 * @param {*} req
 * @param {*} res
 * @returns
 */
  const forgotPassword = async (req, res) => {
    const { User } = AllModels();
    const { body } = req;
    const reuireFiled = ['phone'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    try {
      const userInfo = await User.findOne({
        where: {
          phone: body.phone,
        },
      });
      if (userInfo) {
        // eslint-disable-next-line no-mixed-operators
        const OTP = Math.floor(Math.random() * ((1000 - 9999) + 9999));
        const token = crypto.randomBytes(Math.ceil(60 / 2)).toString('hex').slice(0, 60);
        client.messages
          .create({
            body: `Welcome! your mobile verification code is: ${OTP}`,
            from: '+12542724698',
            to: `+254${userInfo.phone}`,
          })
        // eslint-disable-next-line no-unused-vars
          .then((message) => {
            User.update(
              {
                otp: OTP,
                reset_password_token: token,
                token_expire_time: Date.now() + 3600000, // 1 hour,
              },
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
        return res.status(400).json({ msg: 'Invalid email address' });
      }
      return res.status(200).json({ });
    } catch (error) {
      return res.status(500).json({ msg: 'Oops something went wrong!' });
    }
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
          if (req.body.password) {
            req.body.password = bcryptService().password(req.body.password);
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
          if (req.body.password) {
            req.body.password = bcryptService().password({ password: req.body.password });
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
        console.log(err);
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }
    return res.status(400).json({ msg: 'You are not authorized to access this page' });
  };
  /**
 * @description: Change password
 * @param {*} req
 * @param {*} res
 * @returns
 */
  const changePassword = async (req, res) => {
    const { User } = AllModels();
    // eslint-disable-next-line camelcase
    const { password, old_password } = req.body;
    const userInfo = req.token;
    try {
      const user = await User
        .findOne({
          where: {
            id: userInfo.id,
          },
        });

      if (!user) {
        return res.status(400).json({ success: false, msg: 'User not found' });
      }
      const userId = userInfo.id;
      if (bcryptService().comparePassword(old_password, user.password)) {
        // new passwordca not be same as old password
        if (bcryptService().comparePassword(password, user.password)) {
          return res.status(400).json({ success: false, msg: 'New password can not be same as old password' });
        }
        const newEncryptedPass = bcryptService().password({ password });
        const updated = await User
          .update(
            {
              password: newEncryptedPass,
              login_first_time: '0',
            },
            { where: { id: userId } },
          );

        if (!updated) {
          return res.status(400).json({ success: false, msg: 'Problem in updating' });
        }
        return res.status(200).json({ success: true, msg: 'Password changed successfully' });
      }

      return res.status(400).json({ success: false, msg: 'Old Password don\'t match' });
    } catch (error) {
      return res.status(500).json({ success: false, msg: 'Internal server error' });
    }
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
    forgotPassword,
    changePassword,
  };
};


module.exports = UserController;
