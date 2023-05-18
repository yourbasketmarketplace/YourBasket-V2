// eslint-disable-next-line no-unused-vars
const sequelize = require('sequelize');
const AllModels = require('../services/model.service');
const crypto = require('crypto');
const axios = require('axios');

const helperService = require('../services/helper.service');
/** ****************************************************************************
 *                              cart Controller
 ***************************************************************************** */
const OrderController = () => {
  const create = async (req, res) => {
    // body is part of a form-data
    const {
      Cart,
      Order,
      Product,
      OrderItem,
    } = AllModels();
    const userInfo = req.token;
    try {
      const reuireFiled = ['total_amount', 'payment_method', 'address_id'];

      const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
      if (checkField.isMissingParam) {
        return res.status(400).json({ msg: checkField.message });
      }
      const cartData = await Cart.findAll({
        where: {
          user_id: userInfo.id,
          status: 'active',
        },
        include: [
          {
            model: Product,
            attribute: ['vendor_id'],
          },
        ],
        raw: true,
      });
      if (cartData.length) {
        req.body.user_id = userInfo.id;
        const orderCreated = await Order.create(req.body);
        const orderItemdata = cartData.map((row) => {
          delete row.id;
          return {
            ...row,
            vendor_id: row.Product.user_id,
            order_id: orderCreated.id,
          };
        });

        if (orderCreated) {
          await OrderItem.bulkCreate(orderItemdata);
          await Cart.destroy({
            where: {
              user_id: userInfo.id,
            },
          });
          return res.status(200).json({
            orderCreated,
          });
        }
        return res.status(500).json({
          msg: 'order not created',
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: err,
      });
    }
  };
  const orderWithMpesa = async (req, res) => {
    // body is part of a form-data
    const { Cart, Order } = AllModels();
    const userInfo = req.token;
    try {
      const reuireFiled = ['total_amount', 'cart'];

      const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
      if (checkField.isMissingParam) {
        return res.status(400).json({ msg: checkField.message });
      }
      // req.body.user_id = userInfo.id;
      // eslint-disable-next-line no-new
      const iPaySecret = 'demoCHANGED';
      const iPayAlgorithm = 'sha256';
      const iPayData = {
        live: '0',
        vid: 'demo',
        oid: '123222456',
        inv: '112020102292999',
        amount: 900,
        tel: '256712375678',
        eml: 'pawankt5076@gmail.com',
        curr: 'KES',
        p1: 'airtel',
        p2: 'airtel',
        p3: '',
        p4: '900',
        cbk: 'https://yourbasket.co.ke/',
        cst: '1',
        crl: '2',
      };
      // The hash digital signature hash of the data for verification.
      const hashCode = `${iPayData.live}${iPayData.oid}${iPayData.inv}${iPayData.amount}${iPayData.tel}${iPayData.eml}${iPayData.vid}${iPayData.curr}${iPayData.p1}${iPayData.p2}${iPayData.p3}${iPayData.p4}${iPayData.cbk}${iPayData.cst}${iPayData.crl}`;
      const hash = crypto.createHmac(iPayAlgorithm, iPaySecret).update(hashCode).digest('hex');
      iPayData.hash = hash;
      const headers = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
      axios.post('https://apis.ipayafrica.com/payments/v2/transact', iPayData).then((resp) => {
        console.log(resp.data);
      }).catch((err) => {
        console.log(err);
      });
      // creating hmac object

      let data;
      return res.status(200).json({
        iPayData,
        hashCode,
      });
    } catch (err) {
      console.log(err);
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


  return {
    orderWithMpesa,
    create,
    getAll,
  };
};

module.exports = OrderController;
