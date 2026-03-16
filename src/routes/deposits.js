const { Router } = require('express');
const { listDeposits, createDeposit, updateDeposit } = require('../controllers/depositController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, listDeposits);
router.post('/', requireAuth, createDeposit);
router.patch('/:id', requireAuth, requireAdmin, updateDeposit);

module.exports = router;
