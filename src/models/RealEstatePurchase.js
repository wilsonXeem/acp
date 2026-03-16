const mongoose = require('mongoose');

const realEstatePurchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'RealEstateListing', required: true, index: true },
    units: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0.01 },
    totalAmount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RealEstatePurchase', realEstatePurchaseSchema);
