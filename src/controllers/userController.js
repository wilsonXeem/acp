const User = require('../models/User');
const { isEmail, ensureAllowed } = require('../utils/validation');

const listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return res.json({ users });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = {};

  if (req.body.role) {
    ensureAllowed(req.body.role, ['user', 'admin'], 'role');
    updates.role = req.body.role;
  }

  if (req.body.status) {
    ensureAllowed(req.body.status, ['active', 'suspended'], 'status');
    updates.status = req.body.status;
  }

  if (req.body.name) {
    updates.name = req.body.name;
  }

  if (req.body.email) {
    if (!isEmail(req.body.email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    const existing = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existing && existing._id.toString() !== id) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    updates.email = req.body.email.toLowerCase();
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No valid fields provided' });
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user });
};

module.exports = { listUsers, updateUser };
