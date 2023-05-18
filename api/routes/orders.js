const router = require('express').Router();
const OrderController = require('../controllers/OrderController');


router.post('/', (req, res) => OrderController().create(req, res));

module.exports = router;
