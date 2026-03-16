const { Router } = require('express');
const {
  listPaymentMethods,
  listAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
} = require('../controllers/paymentMethodController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', listPaymentMethods);
router.get('/admin', requireAuth, requireAdmin, listAllPaymentMethods);
router.post('/', requireAuth, requireAdmin, createPaymentMethod);
router.patch('/:id', requireAuth, requireAdmin, updatePaymentMethod);

module.exports = router;
