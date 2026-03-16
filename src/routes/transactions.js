const { Router } = require('express');
const { listTransactions, createTransaction, updateTransaction } = require('../controllers/transactionController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, listTransactions);
router.post('/', requireAuth, requireAdmin, createTransaction);
router.patch('/:id', requireAuth, requireAdmin, updateTransaction);

module.exports = router;
