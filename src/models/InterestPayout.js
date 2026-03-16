const mongoose = require('mongoose');

const interestPayoutSchema = new mongoose.Schema(
  {
    investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterestPayout', interestPayoutSchema);
