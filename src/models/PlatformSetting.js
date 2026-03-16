const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'platform', unique: true },
    defaultCurrency: { type: String, default: 'USD' },
    supportEmail: { type: String, default: 'support@acpinvestment.com' },
    roiMultiplier: { type: Number, default: 1, min: 0.01 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
