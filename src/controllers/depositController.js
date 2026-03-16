const Deposit = require('../models/Deposit');
const PaymentMethod = require('../models/PaymentMethod');
const { applyWalletDelta } = require('../utils/finance');
const { parsePositiveAmount, ensureAllowed } = require('../utils/validation');

const DEPOSIT_STATUSES = ['pending', 'completed', 'failed'];

const listDeposits = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const deposits = await Deposit.find(filter)
    .populate('user', 'name email role')
    .populate('method', 'name type status')
    .sort({ createdAt: -1 });
  return res.json({ deposits });
};

const createDeposit = async (req, res) => {
  const { amount, currency, method, reference } = req.body;
  const normalizedAmount = parsePositiveAmount(amount);

  if (method) {
    const exists = await PaymentMethod.findById(method);
    if (!exists || exists.status !== 'active') {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
  }

  const deposit = await Deposit.create({
    user: req.user._id,
    amount: normalizedAmount,
    currency,
    method,
    reference,
    status: 'pending',
  });

  return res.status(201).json({ deposit });
};

const updateDeposit = async (req, res) => {
  const { id } = req.params;
  const { status, reference } = req.body;

  const deposit = await Deposit.findById(id);
  if (!deposit) {
    return res.status(404).json({ error: 'Deposit not found' });
  }

  const previousStatus = deposit.status;
  const nextStatus = status || previousStatus;
  if (status) {
    ensureAllowed(status, DEPOSIT_STATUSES, 'status');
    if (previousStatus === 'completed' && status !== 'completed') {
      return res.status(400).json({ error: 'Completed deposit cannot be changed' });
    }
  }
  if (reference !== undefined) {
    deposit.reference = reference;
  }

  if (nextStatus === 'completed' && previousStatus !== 'completed') {
    await applyWalletDelta({
      userId: deposit.user,
      currency: deposit.currency,
      amount: deposit.amount,
      direction: 'credit',
      type: 'deposit',
      reference: deposit._id.toString(),
    });
  }

  deposit.status = nextStatus;
  await deposit.save();

  return res.json({ deposit });
};

module.exports = { listDeposits, createDeposit, updateDeposit };
