const { Router } = require('express');
const { listInvestments, createInvestment, updateInvestment } = require('../controllers/investmentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, listInvestments);
router.post('/', requireAuth, createInvestment);
router.patch('/:id', requireAuth, requireAdmin, updateInvestment);

module.exports = router;
