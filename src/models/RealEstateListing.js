const mongoose = require('mongoose');

const realEstateListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String },
    price: { type: Number },
    packagePrice: { type: Number },
    lotAreaSqft: { type: Number },
    totalUnits: { type: Number, default: 1 },
    unitsAvailable: { type: Number, default: 1 },
    status: { type: String, enum: ['available', 'sold', 'coming-soon'], default: 'available' },
    images: { type: [String], default: [] },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RealEstateListing', realEstateListingSchema);
