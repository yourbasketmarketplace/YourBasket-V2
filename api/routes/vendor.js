const router = require('express').Router();
const ProductContoller = require('../controllers/ProductController');
const UserContoller = require('../controllers/UserController');
const BrandContoller = require('../controllers/BrandController');
const auth = require('../policies/auth.policy');
/**
 * @swagger
 * /api/vendor/products:
 *   get:
 *     tags:
 *       - Vendor
 *     name: List vendor Products
 *     summary: List vendor All Products
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

router.get('/products', auth, (req, res) => ProductContoller().getVendorProduct(req, res));

/**
 * @swagger
 * /api/vendor/brands:
 *   get:
 *     tags:
 *       - Vendor
 *     name: List Vendor Brand
 *     summary: List All Vendor Brand
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

router.get('/brands', auth, (req, res) => BrandContoller().getVendorBrands(req, res));

/**
 * @swagger
 * /api/vendor/userdetail/:id:
 *   get:
 *     tags:
 *       - Vendor
 *     name: User detail
 *     summary: User detail
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

router.get('/userdetail/:id', auth, (req, res) => UserContoller().getUserDetail(req, res));


/**
 * @swagger
 * /api/vendor/userdetail/:id:
 *   put:
 *     tags:
 *       - Vendor
 *     name: User detail
 *     summary: User detail
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

router.put('/userdetail/:id', auth, (req, res) => UserContoller().updateUserDetail(req, res));

module.exports = router;
