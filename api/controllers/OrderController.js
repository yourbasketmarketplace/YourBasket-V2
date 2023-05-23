// eslint-disable-next-line no-unused-vars
const sequelize = require('sequelize');
const AllModels = require('../services/model.service');
const crypto = require('crypto');
const axios = require('axios');
const { Op } = require('sequelize');
const helperService = require('../services/helper.service');
const PaymentService = require('../services/payment.service');
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
      let orderContinue = false;
      if (req.body.payment_method === 'Pesapal') {
        const result = await PaymentService.pesapal({
          totalAmount: req.body.total_amount,
          addressId: req.body.address_id,
          user_id: 7,
        });
        console.log(result, 'result');
        if (result.success) {
          return res.status(200).json({
            data: result.data,
          });
        }
        return res.status(400).json({
          msg: result.error,
        });
      } else if (req.body.payment_method === 'Cash on delivery') {
        orderContinue = true;
      }
      if (orderContinue) {
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
        });
        if (cartData.length) {
          req.body.user_id = userInfo.id;
          const orderCreated = await Order.create(req.body);
          const orderItemdata = cartData.map((row) => ({
            price: row.price,
            variant: row.variant,
            product_title: row.product_title,
            quantity: row.quantity,
            product_sku: row.product_sku,
            vendor_id: row.Product.user_id,
            order_id: orderCreated.id,
          }));

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
      } else {
        return res.status(400).json({
          msg: 'Method not allowed',
        });
      }
    } catch (err) {
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
      const { Order, OrderItem } = AllModels();
      const userInfo = req.token;
      let query = {
        order: [
          ['id', 'DESC'],
        ],
      };
      if (userInfo.role === 'vendor') {
        query = {
          include: [
            {
              model: OrderItem,
              where: {
                vendor_id: userInfo.id,
              },
              required: true,
            },
          ],
          order: [
            ['id', 'DESC'],
          ],
        };
      } else if (userInfo.role === 'customer') {
        query = {
          were: {
            user_id: userInfo.id,
          },
          include: [
            {
              model: OrderItem,
              required: false,
            },
          ],
          order: [
            ['id', 'DESC'],
          ],
        };
      }
      const data = await Order.findAll(query);
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
    try {
      const { id } = req.params;
      const {
        Order, OrderItem, Product, Address, User,
      } = AllModels();
      const userInfo = req.token;
      let query = {
        where: {
          id,
        },
        include: [
          {
            model: OrderItem,
            required: true,
            include: [
              {
                model: Product,
              },
            ],
          },
          {
            model: Address,
          },
          {
            model: User,
          },
        ],
      };
      if (userInfo.role === 'vendor') {
        query = {
          where: {
            id,
          },
          include: [
            {
              model: OrderItem,
              where: {
                vendor_id: userInfo.id,
              },
              required: true,
              include: [
                {
                  model: Product,
                },
              ],
            },
            {
              model: Address,
            },
            {
              model: User,
            },
          ],
        };
      } else if (userInfo.role === 'customer') {
        query = {
          were: {
            user_id: userInfo.id,
            id,
          },
          include: [
            {
              model: OrderItem,
              required: false,
              include: [
                {
                  model: Product,
                },
              ],
            },
            {
              model: Address,
            },
            {
              model: User,
            },
          ],
        };
      }
      const data = await Order.findOne(query);
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

  const pesaPal = async (req, res) => {
    console.log(req.body);
  };
  return {
    orderWithMpesa,
    create,
    getAll,
    get,
    pesaPal,
  };
};

module.exports = OrderController;
