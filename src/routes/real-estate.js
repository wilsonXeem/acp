const { Router } = require('express');
const {
  listListings,
  createListing,
  updateListing,
  listPurchases,
  purchaseListing,
} = require('../controllers/realEstateController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', listListings);
router.get('/purchases', requireAuth, listPurchases);
router.post('/', requireAuth, requireAdmin, createListing);
router.post('/:id/purchase', requireAuth, purchaseListing);
router.patch('/:id', requireAuth, requireAdmin, updateListing);

module.exports = router;
