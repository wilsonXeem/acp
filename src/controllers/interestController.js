const InterestPayout = require('../models/InterestPayout');
const Investment = require('../models/Investment');
const User = require('../models/User');
const { applyWalletDelta } = require('../utils/finance');
const { parsePositiveAmount } = require('../utils/validation');

const listInterest = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const payouts = await InterestPayout.find(filter)
    .populate('user', 'name email role')
    .populate('investment')
    .sort({ createdAt: -1 });
  return res.json({ payouts });
};

const createInterest = async (req, res) => {
  const { investment, user, amount, currency } = req.body;
  const normalizedAmount = parsePositiveAmount(amount);

  if (!investment || !user) {
    return res.status(400).json({ error: 'investment, user, amount are required' });
  }

  const [investmentExists, userExists] = await Promise.all([
    Investment.findById(investment),
    User.findById(user),
  ]);

  if (!investmentExists) {
    return res.status(400).json({ error: 'Invalid investment' });
  }
  if (!userExists) {
    return res.status(400).json({ error: 'Invalid user' });
  }

  const payout = await InterestPayout.create({
    investment,
    user,
    amount: normalizedAmount,
    currency,
  });

  try {
    await applyWalletDelta({
      userId: user,
      currency,
      amount: normalizedAmount,
      direction: 'credit',
      type: 'interest',
      reference: payout._id.toString(),
    });
  } catch (err) {
    await InterestPayout.findByIdAndDelete(payout._id);
    return res.status(400).json({ error: err.message });
  }

  return res.status(201).json({ payout });
};

module.exports = { listInterest, createInterest };
