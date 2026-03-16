const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentPlan', required: true },
    principal: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    accruedInterest: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
