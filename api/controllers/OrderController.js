/* eslint-disable camelcase */
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
      Tempcart,
      Order,
      Product,
      OrderItem,
      User,
    } = AllModels();
    const userInfo = req.token;
    try {
      const reuireFiled = ['total_amount', 'payment_method', 'address_id'];

      const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
      if (checkField.isMissingParam) {
        return res.status(400).json({ msg: checkField.message });
      }
      let orderContinue = false;
      const user = await User.findOne({
        where: {
          id: userInfo.id,
        },
      });
      const paymentData = {
        totalAmount: req.body.total_amount,
        addressId: req.body.address_id,
        user_id: userInfo.id,
        item_amount: req.body.item_amount,
        tax_amount: req.body.tax_amount,
        payment_method: req.body.payment_method,
        sale_type: (req.body.sale_type) ? req.body.sale_type : 'cart',
        user,
      };
      if (req.body.payment_method === 'Pesapal') {
        const result = await PaymentService.pesapal(paymentData);
        if (result.success) {
          return res.status(200).json({
            data: result.data,
          });
        }
        return res.status(400).json({
          msg: result.error,
        });
      } else if (req.body.payment_method === 'Mpesa') {
        const result = await PaymentService.mpesa(paymentData);
        if (result.error) {
          return res.status(400).json({
            msg: result.data,
          });
        }
        return res.status(200).json({
          data: result.data,
        });
      } else if (req.body.payment_method === 'Ipay') {
        const result = await PaymentService.ipay(paymentData);
        console.log(result);
        return res.status(400).json({
          msg: result.data,
        });
      } else if (req.body.payment_method === 'Cash on delivery') {
        orderContinue = true;
      }
      if (orderContinue) {
        let cartData;
        if (req.body.sale_type && req.body.sale_type === 'buynow') {
          cartData = await Tempcart.findAll({
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
        } else {
          cartData = await Cart.findAll({
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
        }

        if (cartData.length) {
          req.body.user_id = userInfo.id;
          const saleType = req.body.sale_type;
          if (req.body.sale_type) {
            delete (req.body.sale_type);
          }

          const orderCreated = await Order.create(req.body);
          const orderItemdata = cartData.map((row) => ({
            price: row.price,
            variant: row.variant,
            product_title: row.product_title,
            quantity: row.quantity,
            product_sku: row.product_sku,
            vendor_id: row.Product.user_id,
            product_id: row.Product.id,
            order_id: orderCreated.id,
          }));

          if (orderCreated) {
            await OrderItem.bulkCreate(orderItemdata);
            if (saleType && saleType === 'buynow') {
              await Tempcart.destroy({
                where: {
                  user_id: userInfo.id,
                },
              });
            } else {
              await Cart.destroy({
                where: {
                  user_id: userInfo.id,
                },
              });
            }
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

    const {
      Cart,
      Tempcart,
      Order,
      Product,
      OrderItem,
      Paymentlog,
    } = AllModels();
    const logData = {};
    logData.logbody = JSON.stringify(req.body);
    logData.logquery = JSON.stringify(req.query);
    await Paymentlog.create(logData);
    try {
      const {
        user_id, address_id,
        amount, item_amount, tax_amount, sale_type,
      } = req.query;
      const { stkCallback } = req.body.Body;
      const io = req.app.get('socketio');
      io.emit('paymentstatus', { data: stkCallback, user_id });

      if (user_id && address_id && stkCallback.ResultCode === 0) {
        let cartData;
        if (sale_type && sale_type === 'buynow') {
          cartData = await Tempcart.findAll({
            where: {
              user_id,
              status: 'active',
            },
            include: [
              {
                model: Product,
                attribute: ['vendor_id'],
              },
            ],
          });
        } else {
          cartData = await Cart.findAll({
            where: {
              user_id,
              status: 'active',
            },
            include: [
              {
                model: Product,
                attribute: ['vendor_id'],
              },
            ],
          });
        }
        if (cartData.length) {
          req.body.user_id = user_id;
          req.body.address_id = address_id;
          req.body.address_id = address_id;
          req.body.total_amount = amount;
          req.body.item_amount = item_amount;
          req.body.tax_amount = tax_amount;
          req.body.payment_method = 'Mpesa';
          req.body.order_tracking_id = stkCallback.CheckoutRequestID;
          req.body.merchant_reference = stkCallback.MerchantRequestID;
          const orderCreated = await Order.create(req.body);
          const orderItemdata = cartData.map((row) => ({
            price: row.price,
            variant: row.variant,
            product_title: row.product_title,
            quantity: row.quantity,
            product_sku: row.product_sku,
            vendor_id: row.Product.user_id,
            product_id: row.Product.id,
            order_id: orderCreated.id,
          }));
          if (orderCreated) {
            try {
              await OrderItem.bulkCreate(orderItemdata);
              if (sale_type && sale_type === 'buynow') {
                await Tempcart.destroy({
                  where: {
                    user_id,
                  },
                });
              } else {
                await Cart.destroy({
                  where: {
                    user_id,
                  },
                });
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
        return res.status(200).json({
          msg: 'sucess',
        });
      }
      return res.status(400).json({
        msg: 'not allowed',
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const orderWithIpay = async (req, res) => {
    const {
      Paymentlog,
    } = AllModels();
    const logData = {};
    logData.logbody = JSON.stringify(req.body);
    logData.logquery = JSON.stringify(req.query);
    await Paymentlog.create(logData);
  };
  const getAll = async (req, res) => {
    try {
      const {
        Order, OrderItem, Product, Address,
      } = AllModels();
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
      } else if (userInfo.role === 'user') {
        query = {
          were: {
            user_id: userInfo.id,
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

  const pesaPalIpn = async (req, res) => {
    try {
      const {
        Cart,
        Tempcart,
        Order,
        Product,
        OrderItem,
      } = AllModels();
      const {
        user_id, address_id, OrderTrackingId, OrderMerchantReference,
        amount, item_amount, tax_amount, sale_type,
      } = req.query;
      if (user_id && address_id && OrderTrackingId && OrderMerchantReference && amount) {
        const result = await PaymentService.pesapalTransactionSatus(OrderTrackingId);
        console.log(result.data);
        let cartData;
        if (sale_type && sale_type === 'buynow') {
          cartData = await Tempcart.findAll({
            where: {
              user_id,
              status: 'active',
            },
            include: [
              {
                model: Product,
                attribute: ['vendor_id'],
              },
            ],
          });
        } else {
          cartData = await Cart.findAll({
            where: {
              user_id,
              status: 'active',
            },
            include: [
              {
                model: Product,
                attribute: ['vendor_id'],
              },
            ],
          });
        }
        if (cartData.length) {
          req.body.user_id = user_id;
          req.body.address_id = address_id;
          req.body.address_id = address_id;
          req.body.total_amount = amount;
          req.body.item_amount = item_amount;
          req.body.tax_amount = tax_amount;
          req.body.payment_method = 'Pesapal';
          req.body.order_tracking_id = OrderTrackingId;
          req.body.merchant_reference = OrderMerchantReference;
          const orderCreated = await Order.create(req.body);
          const orderItemdata = cartData.map((row) => ({
            price: row.price,
            variant: row.variant,
            product_title: row.product_title,
            quantity: row.quantity,
            product_sku: row.product_sku,
            vendor_id: row.Product.user_id,
            product_id: row.Product.id,
            order_id: orderCreated.id,
          }));
          if (orderCreated) {
            try {
              await OrderItem.bulkCreate(orderItemdata);
              if (sale_type && sale_type === 'buynow') {
                await Tempcart.destroy({
                  where: {
                    user_id,
                  },
                });
              } else {
                await Cart.destroy({
                  where: {
                    user_id,
                  },
                });
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
        return res.status(200).json({
          msg: 'sucess',
        });
      }
      return res.status(400).json({
        msg: 'not allowed',
      });
    } catch (err) {
      return res.status(500).json({
        msg: 'Internal server error',
      });
    }
  };

  const mpesaQuery = async (req, res) => {
    const reuireFiled = ['CheckoutRequestID'];

    const checkField = helperService.checkRequiredParameter(reuireFiled, req.body);
    if (checkField.isMissingParam) {
      return res.status(400).json({ msg: checkField.message });
    }
    const result = await PaymentService.mpesaQuery(req.body.CheckoutRequestID);
    if (result.error) {
      return res.status(400).json({
        msg: result.data,
      });
    }
    return res.status(200).json({
      data: result.data,
    });
  };
  return {
    orderWithMpesa,
    create,
    getAll,
    get,
    pesaPalIpn,
    mpesaQuery,
    orderWithIpay,
  };
};

module.exports = OrderController;
