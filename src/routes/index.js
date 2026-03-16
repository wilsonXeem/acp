const { Router } = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./users');
const walletRoutes = require('./wallets');
const transactionRoutes = require('./transactions');
const depositRoutes = require('./deposits');
const withdrawalRoutes = require('./withdrawals');
const transferRoutes = require('./transfers');
const planRoutes = require('./plans');
const investmentRoutes = require('./investments');
const interestRoutes = require('./interest');
const paymentMethodRoutes = require('./payment-methods');
const realEstateRoutes = require('./real-estate');
const auditRoutes = require('./audit');
const ledgerRoutes = require('./ledger');
const settingsRoutes = require('./settings');

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/deposits', depositRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/transfers', transferRoutes);
router.use('/plans', planRoutes);
router.use('/investments', investmentRoutes);
router.use('/interest', interestRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/real-estate', realEstateRoutes);
router.use('/audit', auditRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
