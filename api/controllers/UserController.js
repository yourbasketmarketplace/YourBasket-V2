const crypto = require('crypto');
const { Op } = require('sequelize');
const AllModels = require('../services/model.service');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const helperService = require('../services/helper.service');

const accountSid = 'AC2df654ce9696b6c0c34e68febbecd139';
const authToken = 'cbd2088b1830d1206db0a47a2c5f9483';
const client = require('twilio')(accountSid, authToken);

const UserController = () => {
  const register = async (req, res) => {
    const { body } = req;
    const { User } = AllModels();
    const reuireFiled = ['email', 'password', 'phone'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    if (req.body.role === 'admin') {
      return res.status(400).json({ msg: 'Bad Request: Not allowed' });
    }
    if (body.password === body.password2) {
      try {
        if (req.file && req.file.filename) {
          req.body.file_name = req.file.filename;
          req.body.file_path = req.file.path.replace('public/', '');
        }

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
          file_name: (req.body.file_name) ? req.body.file_name : null,
          file_path: (req.body.file_path) ? req.body.file_path : null,
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
    const reuireFiled = ['email', 'password', 'first_name', 'last_name', 'phone'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    try {
      // check duplicate...
      const userInfo = await helperService.checkDuplicate(body.email, body.phone);
      if (userInfo.error) {
        return res.status(400).json({
          msg: userInfo.msg,
        });
      }

      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      const user = await User.create({
        email: body.email,
        password: body.password,
        user_name: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        role: 'user',
        status: 'active',
        file_name: (req.body.file_name) ? req.body.file_name : null,
        file_path: (req.body.file_path) ? req.body.file_path : null,
      });
      if (user.id) {
        // send sms to user...
        await helperService.sendNotification(user.id, `You have successfully registered as a customer on YourBasket. Please login through yourbasket.co.ke. Your login credentials are: Username: ${user.email} & Password: ${body.password}`, true, false);
      }
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ msg: err });
    }
  };
  const addVendor = async (req, res) => {
    const { body } = req;
    const { User } = AllModels();
    const reuireFiled = ['email', 'password', 'first_name', 'last_name', 'phone'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    try {
      // check duplicate...
      const userInfo = await helperService.checkDuplicate(body.email, body.phone);
      if (userInfo.error) {
        return res.status(400).json({
          msg: userInfo.msg,
        });
      }

      if (req.file && req.file.filename) {
        req.body.file_name = req.file.filename;
        req.body.file_path = req.file.path.replace('public/', '');
      }
      body.role = 'vendor';
      body.status = 'active';
      const user = await User.create(req.body);

      if (user.id) {
        // send sms to user...
        await helperService.sendNotification(user.id, `You have successfully registered as a Vendor on YourBasket. Please login through vendor.yourbasket.co.ke. Your login credentials are: Username: ${user.email} & Password: ${body.password}`, true, false);
      }

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
        if (email.match(/^-?\d+$/)) {
          var user = await User
            .findOne({
              where: {
                phone: email,
                role,
                status: 'active',
              },
            });
        } else {
          var user = await User
            .findOne({
              where: {
                email,
                role,
                status: 'active',
              },
            });
        }

        if (!user) {
          return res.status(400).json({ msg: 'User not found!' });
        }

        if (bcryptService().comparePassword(password, user.password)) {
          const token = authService().issue({
            id: user.id, role: user.role, first_name: user.first_name, last_name: user.last_name,
          });

          return res.status(200).json({ token, user });
        }

        return res.status(403).json({ msg: 'Wrong Password!' });
      } catch (err) {
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Email or password is wrong!' });
  };

  const socialLogin = async (req, res) => {
    const {
      social_type, social_id, email, first_name, last_name, role,
    } = req.body;
    const { User } = AllModels();
    if (email && social_type && social_id) {
      try {
        let user = await User.findOne({
          where: {
            social_type,
            social_id,
          },
        });

        if (!user) {
          // check if user email already exists...
          const userInfo = await User.findOne({
            where: {
              email,
            },
          });
          if (userInfo) {
            return res.status(500).json({
              msg: 'User with same email already exists!',
            });
          }
          // create new user..
          user = await User.create({
            email,
            password: social_id,
            user_name: email,
            first_name,
            last_name,
            social_id,
            social_type,
            role,
            status: 'active',
          });
        }

        const token = authService().issue({
          id: user.id, role: user.role, first_name: user.first_name, last_name: user.last_name,
        });

        return res.status(200).json({ token, user });
      } catch (err) {
        return res.status(500).json({ msg: 'Internal server error' });
      }
    }

    return res.status(400).json({ msg: 'Email or password is wrong' });
  };

  /**
	 * @description: Forgot password
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
  const forgotPassword = async (req, res) => {
    const { User, UserOtp } = AllModels();
    const { body } = req;
    const reuireFiled = ['phone'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    try {
      let sendOtp = false;
      if (body.type == 'register') {
        var userInfo = await User.findOne({
          where: {
            phone: body.phone,
          },
        });
        if (userInfo) {
          return res.status(500).json({
            msg: 'User with same phone number already exists!',
          });
        }
        // check if user email already exists...
        var userInfo = await User.findOne({
          where: {
            email: body.email,
          },
        });
        if (userInfo) {
          return res.status(500).json({
            msg: 'User with same email already exists!',
          });
        }
        sendOtp = true;
      } else {
        var userInfo = await User.findOne({
          where: {
            phone: body.phone,
            role: (body.role) ? body.role : '',
          },
        });
        if (userInfo) {
          sendOtp = true;
        } else {
          return res.status(500).json({
            msg: 'No user data found with this phone!',
          });
        }
      }
      if (sendOtp) {
        // eslint-disable-next-line no-mixed-operators
        const OTP = Math.floor(Math.random() * ((1000 - 9999) + 9999));
        const token = crypto.randomBytes(Math.ceil(60 / 2)).toString('hex').slice(0, 60);
        await client.messages
          .create({
            body: `Welcome! your mobile verification code is: ${OTP}`,
            from: '+12542724698',
            to: `+${body.phone}`,
          })
        // eslint-disable-next-line no-unused-vars
          .then(async (message) => {
            const user = await UserOtp.create({
              otp: OTP,
              phone: body.phone,
              type: body.type,
              user_id: (userInfo && userInfo.id ? userInfo.id : null),
            });

            if (userInfo && body.type == 'forgot') {
              await User.update(
                {
                  reset_password_token: token,
                  token_expire_time: Date.now() + 3600000, // 1 hour,
                },
                // eslint-disable-next-line no-unused-vars
                { where: { id: userInfo.id } },
              );
            }

            return res.status(200).json({
              msg: 'OTP sent successfully!',
            });
          })
          .catch((e) => res.status(500).json({
            msg: 'Error while sending OTP, Please try again!',
          }));
      }
    } catch (error) {
      return res.status(500).json({ msg: 'Oops something went wrong!' });
    }
  };

  // used to verify the user otp from db..
  const verifyOtp = async (req, res) => {
    try {
      const userInfo = req.token;
      const { User, UserOtp } = AllModels();
      const userOtp = await UserOtp
        .findOne({
          where: {
            otp: req.body.otp,
            phone: req.body.phone,
            type: req.body.type,
          },
        });

      if (!userOtp) {
        return res.status(400).json({ msg: 'Invalid OTP' });
      }
      let user = userOtp;
      await userOtp.destroy();

      if (user.user_id) {
        user = await User
          .findOne({
            where: {
              id: user.user_id,
            },
          });
        return res.status(200).json({ user });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({
        msg: error,
      });
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

          // Check if user with same phone exist...
          if (req.body.phone) {
            var eUser = await User.findOne({
              where: {
                id: {
                  [Op.ne]: id,
                },
                phone: req.body.phone,
              },
            });
            if (eUser) {
              return res.status(400).json({ msg: 'User with same phone number already exists!' });
            }
          }

          // Check if user with same email exists..
          if (req.body.email) {
            var eUser = await User.findOne({
              where: {
                id: {
                  [Op.ne]: id,
                },
                email: req.body.email,
              },
            });
            if (eUser) {
              return res.status(400).json({ msg: 'User with same email already exists!' });
            }
          }

          // update user..
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

          // Check if user with same phone exist...
          if (req.body.phone) {
            var eUser = await User.findOne({
              where: {
                id: {
                  [Op.ne]: id,
                },
                phone: req.body.phone,
              },
            });
            if (eUser) {
              return res.status(400).json({ msg: 'User with same phone number already exists!' });
            }
          }

          // Check if user with same email exists..
          if (req.body.email) {
            var eUser = await User.findOne({
              where: {
                id: {
                  [Op.ne]: id,
                },
                email: req.body.email,
              },
            });
            if (eUser) {
              return res.status(400).json({ msg: 'User with same email already exists!' });
            }
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

          /// check if user status is active...
          if (req.body.status && user.status != req.body.status && req.body.status == 'active') {
            // generate pass..
            const newPass = await helperService.randString(8);
            const newEncryptedPass = bcryptService().password({ password: newPass });
            const updated = await User
              .update(
                {
                  password: newEncryptedPass,
                  login_first_time: '0',
                },
                { where: { id } },
              );

            // send sms to user...
            await helperService.sendNotification(id, `You have successfully registered as a Vendor on YourBasket. Please login through vendor.yourbasket.co.ke. Your login credentials are: Username: ${user.email} & Password: ${newPass}`, true, false);
          }

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

  /**
	 * @description: Reset password
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
  const resetPassword = async (req, res) => {
    const { User } = AllModels();
    // eslint-disable-next-line camelcase
    const { password, confirm_password, reset_token } = req.body;
    try {
      const user = await User
        .findOne({
          where: {
            reset_password_token: reset_token,
          },
        });

      if (!user) {
        return res.status(400).json({ success: false, msg: 'User not found' });
      }
      const userId = user.id;
      if (password == confirm_password) {
        const newEncryptedPass = bcryptService().password({ password });
        const updated = await User
          .update(
            {
              password: newEncryptedPass,
              login_first_time: '0',
              token_expire_time: null,
              reset_password_token: null,
            },
            { where: { id: userId } },
          );

        if (!updated) {
          return res.status(400).json({ success: false, msg: 'Problem in updating password' });
        }
        return res.status(200).json({ success: true, msg: 'Password changed successfully!' });
      }
      return res.status(400).json({ success: false, msg: 'Confirm Password don\'t match' });
    } catch (error) {
      return res.status(500).json({ success: false, msg: 'Internal server error' });
    }
  };

  /**
	 * @description: Get all user notifications...
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
  const getNotifications = async (req, res) => {
    const { User, UserNotification } = AllModels();
    const { read } = req.query;
    const userInfo = req.token;

    try {
      if (userInfo.id) {
        // set read if requested..
        if (read && read == 'yes') {
          await UserNotification.update(
            {
              is_read: 1,
            },
            { where: { user_id: userInfo.id } },
          );
        }

        // get all and send back to server...
        const data = await UserNotification.findAll({
          where: {
            user_id: userInfo.id,
          },
          order: [
            ['id', 'DESC'],
          ],
        });

        return res.status(200).json({ data });
      }
      return res.status(400).json({ success: false, msg: 'User not found' });
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
    verifyOtp,
    resetPassword,
    socialLogin,
    getNotifications,
  };
};

module.exports = UserController;
