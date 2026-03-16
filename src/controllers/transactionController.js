const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { parsePositiveAmount, ensureAllowed } = require('../utils/validation');

const TRANSACTION_TYPES = [
  'deposit',
  'withdrawal',
  'transfer',
  'investment',
  'interest',
  'adjustment',
  'real-estate',
];
const TRANSACTION_DIRECTIONS = ['credit', 'debit'];
const TRANSACTION_STATUSES = ['pending', 'completed', 'failed'];

const listTransactions = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const transactions = await Transaction.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
  return res.json({ transactions });
};

const createTransaction = async (req, res) => {
  const { userId, type, amount, currency, direction, status, reference, metadata } = req.body;
  const normalizedAmount = parsePositiveAmount(amount);

  if (!type || !direction) {
    return res.status(400).json({ error: 'type, amount, and direction are required' });
  }
  ensureAllowed(type, TRANSACTION_TYPES, 'type');
  ensureAllowed(direction, TRANSACTION_DIRECTIONS, 'direction');
  if (status) {
    ensureAllowed(status, TRANSACTION_STATUSES, 'status');
  }

  let targetUserId = req.user._id;
  if (userId) {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    targetUserId = targetUser._id;
  }

  const transaction = await Transaction.create({
    user: targetUserId,
    type,
    amount: normalizedAmount,
    currency,
    direction,
    status,
    reference,
    metadata,
  });

  return res.status(201).json({ transaction });
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { status, reference, metadata } = req.body;

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (status) {
    ensureAllowed(status, TRANSACTION_STATUSES, 'status');
    transaction.status = status;
  }
  if (reference !== undefined) {
    transaction.reference = reference;
  }
  if (metadata !== undefined) {
    transaction.metadata = metadata;
  }

  await transaction.save();
  return res.json({ transaction });
};

module.exports = { listTransactions, createTransaction, updateTransaction };
