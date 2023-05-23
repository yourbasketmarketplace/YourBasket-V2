const router = require('express').Router();
const OrderController = require('../controllers/OrderController');
const auth = require('../policies/auth.policy');

router.post('/ipn', (req, res) => OrderController().pesaPal(req, res));

module.exports = router;
