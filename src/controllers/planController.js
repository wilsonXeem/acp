const InvestmentPlan = require('../models/InvestmentPlan');
const { ensureAllowed } = require('../utils/validation');

const listPlans = async (req, res) => {
  const plans = await InvestmentPlan.find({ status: 'active' }).sort({ createdAt: -1 });
  return res.json({ plans });
};

const listAllPlans = async (req, res) => {
  const plans = await InvestmentPlan.find().sort({ createdAt: -1 });
  return res.json({ plans });
};

const createPlan = async (req, res) => {
  const { name, description, roiPercent, termDays, minAmount, maxAmount, status } = req.body;

  if (!name || !roiPercent || !termDays || !minAmount) {
    return res.status(400).json({ error: 'name, roiPercent, termDays, minAmount are required' });
  }

  const payload = {
    name,
    description,
    roiPercent: Number(roiPercent),
    termDays: Number(termDays),
    minAmount: Number(minAmount),
    maxAmount: maxAmount !== undefined ? Number(maxAmount) : undefined,
    status,
  };

  if (!Number.isFinite(payload.roiPercent) || payload.roiPercent <= 0) {
    return res.status(400).json({ error: 'roiPercent must be a positive number' });
  }
  if (!Number.isFinite(payload.termDays) || payload.termDays <= 0) {
    return res.status(400).json({ error: 'termDays must be a positive number' });
  }
  if (!Number.isFinite(payload.minAmount) || payload.minAmount <= 0) {
    return res.status(400).json({ error: 'minAmount must be a positive number' });
  }
  if (payload.maxAmount !== undefined && (!Number.isFinite(payload.maxAmount) || payload.maxAmount <= 0)) {
    return res.status(400).json({ error: 'maxAmount must be a positive number when provided' });
  }
  if (payload.maxAmount && payload.maxAmount < payload.minAmount) {
    return res.status(400).json({ error: 'maxAmount must be greater than or equal to minAmount' });
  }
  if (payload.status) {
    ensureAllowed(payload.status, ['active', 'inactive'], 'status');
  }

  const plan = await InvestmentPlan.create(payload);

  return res.status(201).json({ plan });
};

const updatePlan = async (req, res) => {
  const { id } = req.params;
  const updates = {};

  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.roiPercent !== undefined) updates.roiPercent = Number(req.body.roiPercent);
  if (req.body.termDays !== undefined) updates.termDays = Number(req.body.termDays);
  if (req.body.minAmount !== undefined) updates.minAmount = Number(req.body.minAmount);
  if (req.body.maxAmount !== undefined) updates.maxAmount = Number(req.body.maxAmount);
  if (req.body.status !== undefined) {
    ensureAllowed(req.body.status, ['active', 'inactive'], 'status');
    updates.status = req.body.status;
  }

  if (
    (updates.roiPercent !== undefined && (!Number.isFinite(updates.roiPercent) || updates.roiPercent <= 0)) ||
    (updates.termDays !== undefined && (!Number.isFinite(updates.termDays) || updates.termDays <= 0)) ||
    (updates.minAmount !== undefined && (!Number.isFinite(updates.minAmount) || updates.minAmount <= 0)) ||
    (updates.maxAmount !== undefined && (!Number.isFinite(updates.maxAmount) || updates.maxAmount <= 0))
  ) {
    return res.status(400).json({ error: 'Numeric fields must be positive numbers' });
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No valid fields provided' });
  }

  const plan = await InvestmentPlan.findByIdAndUpdate(id, updates, { new: true });
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  return res.json({ plan });
};

module.exports = { listPlans, listAllPlans, createPlan, updatePlan };
