const { Router } = require('express');
const { getMyWallets, getAllWallets, adjustWallet } = require('../controllers/walletController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/me', requireAuth, getMyWallets);
router.get('/', requireAuth, requireAdmin, getAllWallets);
router.patch('/:id/adjust', requireAuth, requireAdmin, adjustWallet);

module.exports = router;
