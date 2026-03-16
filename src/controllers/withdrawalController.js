const Withdrawal = require('../models/Withdrawal');
const { applyWalletDelta } = require('../utils/finance');
const { parsePositiveAmount, ensureAllowed } = require('../utils/validation');

const WITHDRAWAL_STATUSES = ['pending', 'completed', 'failed'];

const listWithdrawals = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const withdrawals = await Withdrawal.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
  return res.json({ withdrawals });
};

const createWithdrawal = async (req, res) => {
  const { amount, currency, destination, reference } = req.body;
  const normalizedAmount = parsePositiveAmount(amount);

  if (!destination) {
    return res.status(400).json({ error: 'destination is required' });
  }

  const withdrawal = await Withdrawal.create({
    user: req.user._id,
    amount: normalizedAmount,
    currency,
    destination,
    reference,
    status: 'pending',
  });

  return res.status(201).json({ withdrawal });
};

const updateWithdrawal = async (req, res) => {
  const { id } = req.params;
  const { status, reference } = req.body;

  const withdrawal = await Withdrawal.findById(id);
  if (!withdrawal) {
    return res.status(404).json({ error: 'Withdrawal not found' });
  }

  const previousStatus = withdrawal.status;
  const nextStatus = status || previousStatus;

  if (status) {
    ensureAllowed(status, WITHDRAWAL_STATUSES, 'status');
    if (previousStatus === 'completed' && status !== 'completed') {
      return res.status(400).json({ error: 'Completed withdrawal cannot be changed' });
    }
  }

  if (reference !== undefined) {
    withdrawal.reference = reference;
  }

  if (nextStatus === 'completed' && previousStatus !== 'completed') {
    await applyWalletDelta({
      userId: withdrawal.user,
      currency: withdrawal.currency,
      amount: withdrawal.amount,
      direction: 'debit',
      type: 'withdrawal',
      reference: withdrawal._id.toString(),
      allowNegative: false,
    });
  }

  withdrawal.status = nextStatus;
  await withdrawal.save();

  return res.json({ withdrawal });
};

module.exports = { listWithdrawals, createWithdrawal, updateWithdrawal };
