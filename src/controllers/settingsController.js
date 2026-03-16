const PlatformSetting = require('../models/PlatformSetting');
const { isEmail } = require('../utils/validation');

const DEFAULT_SETTINGS = {
  singleton: 'platform',
  defaultCurrency: 'USD',
  supportEmail: 'support@acpinvestment.com',
  roiMultiplier: 1,
};

const getSettingsDoc = async () =>
  PlatformSetting.findOneAndUpdate({ singleton: 'platform' }, DEFAULT_SETTINGS, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

const getSettings = async (req, res) => {
  const settings = await getSettingsDoc();
  return res.json({ settings });
};

const updateSettings = async (req, res) => {
  const { defaultCurrency, supportEmail, roiMultiplier } = req.body;
  const updates = {};

  if (defaultCurrency) {
    updates.defaultCurrency = String(defaultCurrency).toUpperCase().trim();
  }

  if (supportEmail) {
    if (!isEmail(supportEmail)) {
      return res.status(400).json({ error: 'supportEmail must be a valid email' });
    }
    updates.supportEmail = supportEmail.toLowerCase().trim();
  }

  if (roiMultiplier !== undefined) {
    const parsed = Number(roiMultiplier);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return res.status(400).json({ error: 'roiMultiplier must be a positive number' });
    }
    updates.roiMultiplier = parsed;
  }

  const settings = await PlatformSetting.findOneAndUpdate({ singleton: 'platform' }, updates, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  return res.json({ settings });
};

module.exports = { getSettings, updateSettings };
