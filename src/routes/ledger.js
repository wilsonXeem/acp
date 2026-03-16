const { Router } = require('express');
const { listLedger, createLedgerEntry } = require('../controllers/ledgerController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, listLedger);
router.post('/', requireAuth, requireAdmin, createLedgerEntry);

module.exports = router;
