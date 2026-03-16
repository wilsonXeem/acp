const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    direction: { type: String, enum: ['credit', 'debit'], required: true },
    balanceAfter: { type: Number },
    reference: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
