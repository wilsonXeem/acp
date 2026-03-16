const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    method: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    reference: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deposit', depositSchema);
