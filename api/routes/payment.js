const router = require('express').Router();
const OrderController = require('../controllers/OrderController');
const auth = require('../policies/auth.policy');

router.get('/ipn', (req, res) => OrderController().pesaPalIpn(req, res));

module.exports = router;
