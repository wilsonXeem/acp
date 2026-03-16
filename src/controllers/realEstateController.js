const RealEstateListing = require('../models/RealEstateListing');
const RealEstatePurchase = require('../models/RealEstatePurchase');
const { applyWalletDelta } = require('../utils/finance');
const {
  ensureAllowed,
  parsePositiveAmount,
  parsePositiveInteger,
  parseNonNegativeInteger,
} = require('../utils/validation');

const listListings = async (req, res) => {
  const listings = await RealEstateListing.find().sort({ createdAt: -1 });
  return res.json({ listings });
};

const createListing = async (req, res) => {
  const {
    title,
    location,
    price,
    packagePrice,
    lotAreaSqft,
    totalUnits,
    unitsAvailable,
    status,
    images,
    description,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  const payload = {
    title,
    location,
    images,
    description,
  };

  if (status) {
    ensureAllowed(status, ['available', 'sold', 'coming-soon'], 'status');
    payload.status = status;
  }

  if (price !== undefined) {
    payload.price = parsePositiveAmount(price, 'price');
  }
  if (packagePrice !== undefined) {
    payload.packagePrice = parsePositiveAmount(packagePrice, 'packagePrice');
  }

  if (lotAreaSqft !== undefined) {
    const parsedLotArea = Number(lotAreaSqft);
    if (!Number.isFinite(parsedLotArea) || parsedLotArea <= 0) {
      return res.status(400).json({ error: 'lotAreaSqft must be a positive number' });
    }
    payload.lotAreaSqft = parsedLotArea;
  }

  if (totalUnits !== undefined) {
    payload.totalUnits = parsePositiveInteger(totalUnits, 'totalUnits');
  } else {
    payload.totalUnits = 1;
  }
  if (unitsAvailable !== undefined) {
    payload.unitsAvailable = parseNonNegativeInteger(unitsAvailable, 'unitsAvailable');
  } else {
    payload.unitsAvailable = payload.totalUnits;
  }

  if (payload.unitsAvailable > payload.totalUnits) {
    return res.status(400).json({ error: 'unitsAvailable cannot exceed totalUnits' });
  }

  if (payload.packagePrice === undefined && payload.price === undefined) {
    return res.status(400).json({ error: 'price or packagePrice is required' });
  }
  if (payload.packagePrice === undefined) {
    payload.packagePrice = payload.price;
  }

  const listing = await RealEstateListing.create(payload);

  return res.status(201).json({ listing });
};

const updateListing = async (req, res) => {
  const { id } = req.params;
  const updates = {};
  const listing = await RealEstateListing.findById(id);

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.location !== undefined) updates.location = req.body.location;
  if (req.body.price !== undefined) {
    updates.price = parsePositiveAmount(req.body.price, 'price');
  }
  if (req.body.packagePrice !== undefined) {
    updates.packagePrice = parsePositiveAmount(req.body.packagePrice, 'packagePrice');
  }
  if (req.body.lotAreaSqft !== undefined) {
    const parsedLotArea = Number(req.body.lotAreaSqft);
    if (!Number.isFinite(parsedLotArea) || parsedLotArea <= 0) {
      return res.status(400).json({ error: 'lotAreaSqft must be a positive number' });
    }
    updates.lotAreaSqft = parsedLotArea;
  }
  if (req.body.status !== undefined) {
    ensureAllowed(req.body.status, ['available', 'sold', 'coming-soon'], 'status');
    updates.status = req.body.status;
  }
  if (req.body.totalUnits !== undefined) {
    updates.totalUnits = parsePositiveInteger(req.body.totalUnits, 'totalUnits');
  }
  if (req.body.unitsAvailable !== undefined) {
    updates.unitsAvailable = parseNonNegativeInteger(req.body.unitsAvailable, 'unitsAvailable');
  }
  if (req.body.images !== undefined) updates.images = req.body.images;
  if (req.body.description !== undefined) updates.description = req.body.description;

  const finalTotalUnits = updates.totalUnits !== undefined ? updates.totalUnits : listing.totalUnits;
  const finalUnitsAvailable =
    updates.unitsAvailable !== undefined ? updates.unitsAvailable : listing.unitsAvailable;

  if (finalUnitsAvailable > finalTotalUnits) {
    return res.status(400).json({ error: 'unitsAvailable cannot exceed totalUnits' });
  }

  if (updates.packagePrice === undefined && updates.price !== undefined && !listing.packagePrice) {
    updates.packagePrice = updates.price;
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No valid fields provided' });
  }

  const updatedListing = await RealEstateListing.findByIdAndUpdate(id, updates, { new: true });

  return res.json({ listing: updatedListing });
};

const listPurchases = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const purchases = await RealEstatePurchase.find(filter)
    .populate('listing')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
  return res.json({ purchases });
};

const purchaseListing = async (req, res) => {
  const { id } = req.params;
  const units = parsePositiveInteger(req.body.units ?? 1, 'units');

  const listing = await RealEstateListing.findById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.status !== 'available') {
    return res.status(400).json({ error: 'Listing is not available for purchase' });
  }
  if (!listing.unitsAvailable || listing.unitsAvailable < units) {
    return res.status(400).json({ error: 'Not enough package units available' });
  }

  const unitPrice = Number(listing.packagePrice || listing.price);
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return res.status(400).json({ error: 'Listing package price is invalid' });
  }

  const totalAmount = unitPrice * units;
  const previousUnits = listing.unitsAvailable;
  const previousStatus = listing.status;

  listing.unitsAvailable = previousUnits - units;
  if (listing.unitsAvailable === 0) {
    listing.status = 'sold';
  }
  await listing.save();

  const purchase = await RealEstatePurchase.create({
    user: req.user._id,
    listing: listing._id,
    units,
    unitPrice,
    totalAmount,
    currency: 'USD',
    status: 'failed',
  });

  try {
    await applyWalletDelta({
      userId: req.user._id,
      currency: 'USD',
      amount: totalAmount,
      direction: 'debit',
      type: 'real-estate',
      reference: purchase._id.toString(),
      metadata: { listingId: listing._id.toString(), units },
      allowNegative: false,
    });

    purchase.status = 'completed';
    await purchase.save();
  } catch (err) {
    listing.unitsAvailable = previousUnits;
    listing.status = previousStatus;
    await listing.save();
    return res.status(err.status || 400).json({ error: err.message || 'Purchase failed' });
  }

  return res.status(201).json({ purchase, listing });
};

module.exports = { listListings, createListing, updateListing, listPurchases, purchaseListing };
