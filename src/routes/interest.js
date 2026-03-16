const { Router } = require('express');
const { listInterest, createInterest } = require('../controllers/interestController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, listInterest);
router.post('/', requireAuth, requireAdmin, createInterest);

module.exports = router;
