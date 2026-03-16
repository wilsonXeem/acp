const { Router } = require('express');
const { listTransfers, createTransfer, updateTransfer } = require('../controllers/transferController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, listTransfers);
router.post('/', requireAuth, createTransfer);
router.patch('/:id', requireAuth, requireAdmin, updateTransfer);

module.exports = router;
