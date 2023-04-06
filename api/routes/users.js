const router = require('express').Router();
const UserContoller = require('../controllers/UserController')
const auth = require('../policies/auth.policy');

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
 *               example: 'johnperter88@mailinator.com'
 *             password:
 *               type: string
 *               format: password
 *               example: 'Password123'
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
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             domain_url:
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