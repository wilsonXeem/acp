const Investment = require('../models/Investment');
const InvestmentPlan = require('../models/InvestmentPlan');
const { applyWalletDelta } = require('../utils/finance');
const { parsePositiveAmount, ensureAllowed } = require('../utils/validation');

const INVESTMENT_STATUSES = ['active', 'completed', 'cancelled'];

const listInvestments = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const investments = await Investment.find(filter)
    .populate('plan')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
  return res.json({ investments });
};

const createInvestment = async (req, res) => {
  const { planId, principal, currency } = req.body;
  const normalizedPrincipal = parsePositiveAmount(principal, 'principal');

  if (!planId) {
    return res.status(400).json({ error: 'planId and principal are required' });
  }

  const plan = await InvestmentPlan.findById(planId);
  if (!plan || plan.status !== 'active') {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  if (normalizedPrincipal < plan.minAmount || (plan.maxAmount && normalizedPrincipal > plan.maxAmount)) {
    return res.status(400).json({ error: 'Principal outside plan limits' });
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.termDays);

  const investment = await Investment.create({
    user: req.user._id,
    plan: plan._id,
    principal: normalizedPrincipal,
    currency,
    startDate: new Date(),
    endDate,
  });

  try {
    await applyWalletDelta({
      userId: req.user._id,
      currency,
      amount: normalizedPrincipal,
      direction: 'debit',
      type: 'investment',
      reference: investment._id.toString(),
    });
  } catch (err) {
    await Investment.findByIdAndDelete(investment._id);
    return res.status(400).json({ error: err.message });
  }

  return res.status(201).json({ investment });
};

const updateInvestment = async (req, res) => {
  const { id } = req.params;
  const updates = {};

  if (req.body.status) {
    ensureAllowed(req.body.status, INVESTMENT_STATUSES, 'status');
    updates.status = req.body.status;
  }
  if (req.body.endDate) {
    updates.endDate = req.body.endDate;
  }
  if (req.body.accruedInterest !== undefined) {
    const accruedInterest = Number(req.body.accruedInterest);
    if (!Number.isFinite(accruedInterest) || accruedInterest < 0) {
      return res.status(400).json({ error: 'accruedInterest must be 0 or greater' });
    }
    updates.accruedInterest = accruedInterest;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No valid fields provided' });
  }

  const investment = await Investment.findByIdAndUpdate(id, updates, { new: true });
  if (!investment) {
    return res.status(404).json({ error: 'Investment not found' });
  }

  return res.json({ investment });
};

module.exports = { listInvestments, createInvestment, updateInvestment };
