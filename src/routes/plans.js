const { Router } = require('express');
const { listPlans, listAllPlans, createPlan, updatePlan } = require('../controllers/planController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', listPlans);
router.get('/admin', requireAuth, requireAdmin, listAllPlans);
router.post('/', requireAuth, requireAdmin, createPlan);
router.patch('/:id', requireAuth, requireAdmin, updatePlan);

module.exports = router;
