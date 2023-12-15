const router = require('express').Router();
const ReviewContoller = require('../controllers/ReviewController');
/**
 * @swagger
 * /api/review:
 *   post:
 *     tags:
 *       - Review
 *     name: Add review
 *     summary: Add review
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
 *             rating:
 *               type: string
 *             review:
 *               type: string
 *             name:
 *               type: string
 *             email:
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

router.post('/', (req, res) => ReviewContoller().create(req, res));

module.exports = router;
