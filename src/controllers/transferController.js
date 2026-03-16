const Transfer = require('../models/Transfer');
const User = require('../models/User');
const { transferFunds } = require('../utils/finance');
const { parsePositiveAmount, ensureAllowed } = require('../utils/validation');

const TRANSFER_STATUSES = ['pending', 'completed', 'failed'];

const listTransfers = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const transfers = await Transfer.find(filter)
    .populate('user', 'name email role')
    .populate('toUser', 'name email role')
    .sort({ createdAt: -1 });
  return res.json({ transfers });
};

const createTransfer = async (req, res) => {
  const { toUser, amount, currency, note } = req.body;
  const normalizedAmount = parsePositiveAmount(amount);

  if (!toUser) {
    return res.status(400).json({ error: 'toUser and amount are required' });
  }
  if (toUser === req.user._id.toString()) {
    return res.status(400).json({ error: 'Cannot transfer to the same account' });
  }

  const recipient = await User.findById(toUser);
  if (!recipient || recipient.status !== 'active') {
    return res.status(400).json({ error: 'Recipient account is invalid' });
  }

  const transfer = await Transfer.create({
    user: req.user._id,
    toUser,
    amount: normalizedAmount,
    currency,
    note,
    status: 'pending',
  });

  return res.status(201).json({ transfer });
};

const updateTransfer = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const transfer = await Transfer.findById(id);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  const previousStatus = transfer.status;
  const nextStatus = status || previousStatus;

  if (status) {
    ensureAllowed(status, TRANSFER_STATUSES, 'status');
    if (previousStatus === 'completed' && status !== 'completed') {
      return res.status(400).json({ error: 'Completed transfer cannot be changed' });
    }
  }
  if (note !== undefined) {
    transfer.note = note;
  }

  if (nextStatus === 'completed' && previousStatus !== 'completed') {
    if (!transfer.toUser) {
      return res.status(400).json({ error: 'Transfer recipient missing' });
    }

    await transferFunds({
      fromUserId: transfer.user,
      toUserId: transfer.toUser,
      amount: transfer.amount,
      currency: transfer.currency,
      reference: transfer._id.toString(),
      allowNegative: false,
    });
  }

  transfer.status = nextStatus;
  await transfer.save();

  return res.json({ transfer });
};

module.exports = { listTransfers, createTransfer, updateTransfer };
