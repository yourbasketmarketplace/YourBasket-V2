const router = require('express').Router();
const OrderController = require('../controllers/OrderController');
const auth = require('../policies/auth.policy');

router.post('/', auth, (req, res) => OrderController().create(req, res));
router.get('/', auth, (req, res) => OrderController().getAll(req, res));
router.get('/:id', auth, (req, res) => OrderController().get(req, res));

module.exports = router;
