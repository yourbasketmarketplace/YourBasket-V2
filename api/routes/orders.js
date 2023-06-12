const router = require('express').Router();
const OrderController = require('../controllers/OrderController');
const auth = require('../policies/auth.policy');

router.post('/', auth, (req, res) => OrderController().create(req, res));
router.post('/mpesa', (req, res) => OrderController().orderWithMpesa(req, res));
router.get('/', auth, (req, res) => OrderController().getAll(req, res));
router.get('/:id', auth, (req, res) => OrderController().get(req, res));
router.post('/mpesaquery', (req, res) => OrderController().mpesaQuery(req, res));
router.post('/ipayafrica', (req, res) => OrderController().orderWithIpay(req, res));

module.exports = router;
