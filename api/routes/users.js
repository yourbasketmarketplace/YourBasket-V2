const router = require('express').Router();
const UserContoller = require('../controllers/UserController');

/**
 * @swagger
 * /api/users/authorize:
 *   post:
 *     tags:
 *       - Users
 *     name: Login
 *     summary: Authorize User
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: 'admin@yourbasket.com'
 *             password:
 *               type: string
 *               format: password
 *               example: 'Password123'
 *             role:
 *               type: string
 *               example: 'vendor'
 *         required:
 *           - email
 *           - password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Bad Request, not found in db
 *
 */

router.post('/authorize', (req, res) => UserContoller().login(req, res));


/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     name: Register
 *     summary: Register New User
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
 *             email:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *             password2:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             zip_code:
 *               type: string
 *             main_phone:
 *               type: string
 *         required:
 *           - email
 *           - password
 *           - first_name
 *           - last_name
 *           - phone
 *     responses:
 *       200:
 *         description: Registration successful
 *       401:
 *         description: Bad Request, not found in db
 *
 */

router.post('/register', (req, res) => UserContoller().register(req, res));

/**
 * @swagger
 * /api/users/addcustomer:
 *   post:
 *     tags:
 *       - Users
 *     name: Add customer
 *     summary: Add New Customer
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
 *             email:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *             user_name:
 *               type: string
 *             phone:
 *               type: string
 *         required:
 *           - email
 *           - password
 *           - user_name
 *           - phone
 *     responses:
 *       200:
 *         description: Registration successful
 *       401:
 *         description: Bad Request, not found in db
 *
 */

router.post('/addcustomer', (req, res) => UserContoller().addCustomer(req, res));

/**
 * @swagger
 * /api/users/addvendor:
 *   post:
 *     tags:
 *       - Users
 *     name: Add vendor
 *     summary: Add New Vendor
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
 *             email:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *             user_name:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             middle_name:
 *               type: string
 *             website_link:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             state:
 *               type: string
 *             city:
 *               type: string
 *             zip_code:
 *               type: string
 *             main_phone:
 *               type: string
 *         required:
 *           - email
 *           - password
 *           - first_name
 *           - last_name
 *           - phone
 *     responses:
 *       200:
 *         description: Registration successful
 *       401:
 *         description: Bad Request, not found in db
 *
 */

router.post('/addvendor', (req, res) => UserContoller().addVendor(req, res));

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     name: List Users
 *     summary: List All Users
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
router.get('/', (req, res) => UserContoller().getAll(req, res));


/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     name: Update
 *     summary: Update User
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *         - in: path
 *           name: id
 *           schema:
 *              type: integer
 *         - in: body
 *           schema:
 *              type: object
 *              properties:
 *                  email:
 *                      type: string
 *                  password:
 *                      type: string
 *                      format: password
 *                  first_name:
 *                      type: string
 *                  last_name:
 *                       type: string
 *     responses:
 *       200:
 *         description: Update successful
 *       401:
 *         description: Bad Request, not found in db
 *
 */

router.put('/:id', (req, res) => UserContoller().update(req, res));


module.exports = router;
