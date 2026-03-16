const { Router } = require('express');
const { listWithdrawals, createWithdrawal, updateWithdrawal } = require('../controllers/withdrawalController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, listWithdrawals);
router.post('/', requireAuth, createWithdrawal);
router.patch('/:id', requireAuth, requireAdmin, updateWithdrawal);

module.exports = router;
