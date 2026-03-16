const LedgerEntry = require('../models/LedgerEntry');
const { parsePositiveAmount, ensureAllowed } = require('../utils/validation');

const listLedger = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const entries = await LedgerEntry.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
  return res.json({ entries });
};

const createLedgerEntry = async (req, res) => {
  const { type, amount, currency, direction, balanceAfter, reference } = req.body;
  const normalizedAmount = parsePositiveAmount(amount);

  if (!type || !direction) {
    return res.status(400).json({ error: 'type, amount, and direction are required' });
  }
  ensureAllowed(direction, ['credit', 'debit'], 'direction');

  const entry = await LedgerEntry.create({
    user: req.user._id,
    type,
    amount: normalizedAmount,
    currency,
    direction,
    balanceAfter,
    reference,
  });

  return res.status(201).json({ entry });
};

module.exports = { listLedger, createLedgerEntry };
