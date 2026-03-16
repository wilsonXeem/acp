const { Router } = require('express');
const { listUsers, updateUser } = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, requireAdmin, listUsers);
router.patch('/:id', requireAuth, requireAdmin, updateUser);

module.exports = router;
