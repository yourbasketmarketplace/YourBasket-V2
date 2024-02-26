const fs = require('fs');
const mkdirP = require('mkdirp');
const AllModels = require('./model.service');

const accountSid = 'AC2df654ce9696b6c0c34e68febbecd139';
const authToken = 'cbd2088b1830d1206db0a47a2c5f9483';
const client = require('twilio')(accountSid, authToken);

exports.checkRequiredParameter = (requiredParam, paramObj = {}) => {
  if (!(requiredParam instanceof Array)) {
    throw Error('Required parametrs must be an array');
  }
  let isMissingParam = false;
  let message = [];
  const objKeys = Object.keys(paramObj);
  requiredParam.forEach((key) => {
    if (!(objKeys.includes(key))) {
      isMissingParam = true;
      message.push(`${key} is Required.`);
    }
    if (objKeys.includes(key) && (paramObj[key] === undefined || paramObj[key] === '')) {
      isMissingParam = true;
      message.push(`Value of : '${key}' is required.`);
    }
  });
  if (isMissingParam) {
    message = message.join(',');
  }
  return { isMissingParam, message };
};
exports.getBaseDirectory = () => {
  const dir = './public/uploads/';
  if (!fs.existsSync(dir)) {
    mkdirP.sync(dir);
  }
  return dir;
};
exports.sendNotification = async (id, body, sendsms = true, senddb = true, type = null, entity_id = null) => {
  const { User, UserNotification } = AllModels();

  const user = await User.findOne({
    where: {
      id,
    },
  });

  if (user) {
    // Send sms if enabled..
    if (sendsms) {
      if (user.phone && user.phone.length > 7) {
        await client.messages
          .create({
            body: body.replace('_NAME_', [user.first_name, user.last_name].join(' ')),
            from: '+12542724698',
            to: `+${user.phone}`,
          })
        // eslint-disable-next-line no-unused-vars
          .then(async (message) => {
          })
          .catch((e) => {
          });
      }
    }

    // Add to notifications...
    if (senddb) {
      const notice = await UserNotification.create({
        user_id: user.id,
        phone: user.phone,
        body,
        type,
        entity_id,
      });
    }
  }
};
exports.randString = async (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

exports.checkDuplicate = async (email, phone) => {
  const { User } = AllModels();
  let resp = { error: false, msg: '' };
  var userInfo = await User.findOne({
    where: {
      email,
    },
  });
  if (userInfo) {
    resp = { error: true, msg: 'User with same email already exists!' };
  } else if (phone && phone.length > 0) {
    // check if user email already exists...
    var userInfo = await User.findOne({
      where: {
        phone,
      },
    });
    if (userInfo) {
      resp = { error: true, msg: 'User with same phone number already exists!' };
    }
  }
  return resp;
};
