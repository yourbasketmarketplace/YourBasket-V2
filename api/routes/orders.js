const router = require('express').Router();
const OrderController = require('../controllers/OrderController');
const auth = require('../policies/auth.policy');

router.post('/', auth, (req, res) => OrderController().create(req, res));

module.exports = router;
