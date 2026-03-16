const PaymentMethod = require('../models/PaymentMethod');
const { ensureAllowed } = require('../utils/validation');

const listPaymentMethods = async (req, res) => {
  const methods = await PaymentMethod.find({ status: 'active' }).sort({ createdAt: -1 });
  return res.json({ methods });
};

const listAllPaymentMethods = async (req, res) => {
  const methods = await PaymentMethod.find().sort({ createdAt: -1 });
  return res.json({ methods });
};

const createPaymentMethod = async (req, res) => {
  const { name, type, details, status } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'name and type are required' });
  }

  if (status) {
    ensureAllowed(status, ['active', 'inactive'], 'status');
  }

  const method = await PaymentMethod.create({ name, type, details, status });
  return res.status(201).json({ method });
};

const updatePaymentMethod = async (req, res) => {
  const { id } = req.params;
  const updates = {};

  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.type !== undefined) updates.type = req.body.type;
  if (req.body.details !== undefined) updates.details = req.body.details;
  if (req.body.status !== undefined) {
    ensureAllowed(req.body.status, ['active', 'inactive'], 'status');
    updates.status = req.body.status;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No valid fields provided' });
  }

  const method = await PaymentMethod.findByIdAndUpdate(id, updates, { new: true });
  if (!method) {
    return res.status(404).json({ error: 'Payment method not found' });
  }

  return res.json({ method });
};

module.exports = { listPaymentMethods, listAllPaymentMethods, createPaymentMethod, updatePaymentMethod };
