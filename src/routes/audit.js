const { Router } = require('express');
const { listAuditLogs } = require('../controllers/auditController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, requireAdmin, listAuditLogs);

module.exports = router;
