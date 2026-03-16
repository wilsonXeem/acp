const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    roiPercent: { type: Number, required: true },
    termDays: { type: Number, required: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);
