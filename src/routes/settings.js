const { Router } = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, requireAdmin, getSettings);
router.patch('/', requireAuth, requireAdmin, updateSettings);

module.exports = router;
