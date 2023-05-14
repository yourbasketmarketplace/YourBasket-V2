const router = require('express').Router();
const FrontpageController = require('../controllers/FrontPageController');
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

module.exports = router;
