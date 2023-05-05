const router = require('express').Router();
const CartContoller = require('../controllers/CartController');
const auth = require('../policies/auth.policy');
/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags:
 *       - Cart
 *     name: Add to cart
 *     summary: Add to cart
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             price:
 *               type: number
 *             variant:
 *               type: string
 *             product_id:
 *               type: number
 *             product_sku:
 *               type: string
 *         required:
 *           - type
 *     responses:
 *       200:
 *         description: Request completed sucessfully!
 *       401:
 *         description: Bad Request, not found in db
 *       500:
 *         description: Server error
 *       403:
 *         description: not authorize to do this action

 *
 */

router.post('/', auth, (req, res) => CartContoller().create(req, res));

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags:
 *       - Cart
 *     name: List Cart
 *     summary: List All Cart
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Action successful
 *       401:
 *         description: Bad Request, not found in db
 *
 */

router.get('/', (req, res) => CartContoller().getAll(req, res));

module.exports = router;
