const AuditLog = require('../models/AuditLog');

const listAuditLogs = async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
  return res.json({ logs });
};

module.exports = { listAuditLogs };
