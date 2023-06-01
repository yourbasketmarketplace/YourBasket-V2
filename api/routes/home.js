const router = require('express').Router();
const FrontpageController = require('../controllers/FrontPageController');
const auth = require('../policies/auth.policy');
/**
 * @swagger
 * /api/home:
 *   get:
 *     tags:
 *       - Home
 *     name: List Home page data
 *     summary: List Home page data
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

router.get('/', (req, res) => FrontpageController().getAll(req, res));

router.post('/search', (req, res) => FrontpageController().searchProduct(req, res));

router.post('/sendotp', auth, (req, res) => FrontpageController().sendOtp(req, res));

router.post('/verifyotp', auth, (req, res) => FrontpageController().verifyOtp(req, res));

module.exports = router;
