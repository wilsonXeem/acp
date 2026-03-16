require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const InvestmentPlan = require('../models/InvestmentPlan');
const PaymentMethod = require('../models/PaymentMethod');
const RealEstateListing = require('../models/RealEstateListing');
const PlatformSetting = require('../models/PlatformSetting');

const defaultPlans = [
  {
    name: 'Starter Plan',
    description: 'Entry level plan for new investors.',
    roiPercent: 10,
    termDays: 30,
    minAmount: 100,
    maxAmount: 1000,
  },
  {
    name: 'Growth Plan',
    description: 'Balanced plan for steady growth.',
    roiPercent: 18,
    termDays: 60,
    minAmount: 1000,
    maxAmount: 5000,
  },
  {
    name: 'Premium Plan',
    description: 'High yield plan for serious investors.',
    roiPercent: 30,
    termDays: 90,
    minAmount: 5000,
  },
];

const defaultPaymentMethods = [
  {
    name: 'Bank Transfer',
    type: 'bank',
    details: { instructions: 'Use your reference ID when sending funds.' },
  },
  {
    name: 'Bitcoin',
    type: 'crypto',
    details: { network: 'BTC', address: 'REPLACE_WITH_REAL_ADDRESS' },
  },
];

const defaultListings = [
  {
    title: 'Whispering Pines Oasis',
    location: 'Austin, Texas',
    price: 725000,
    packagePrice: 1450,
    lotAreaSqft: 15000,
    totalUnits: 320,
    unitsAvailable: 320,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Modern single-level luxury residence with expansive private lot.',
  },
  {
    title: 'Sunset Ridge Haven',
    location: 'Scottsdale, Arizona',
    price: 1200000,
    packagePrice: 2400,
    lotAreaSqft: 18000,
    totalUnits: 400,
    unitsAvailable: 400,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Contemporary villa with outdoor entertainment and pool frontage.',
  },
  {
    title: 'Blue Horizon Residences',
    location: 'Portland, Oregon',
    price: 1100000,
    packagePrice: 2200,
    lotAreaSqft: 3000,
    totalUnits: 280,
    unitsAvailable: 280,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Classic residential estate with landscaped grounds and premium finishes.',
  },
  {
    title: 'Meadowlark Estate Villas',
    location: 'Charleston, South Carolina',
    price: 1500000,
    packagePrice: 2600,
    lotAreaSqft: 25000,
    totalUnits: 520,
    unitsAvailable: 520,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'High-value multi-unit villa block in a prime neighborhood.',
  },
  {
    title: 'Crystal Lake Condominiums',
    location: 'Orlando, Florida',
    price: 1450000,
    packagePrice: 2350,
    lotAreaSqft: 2500,
    totalUnits: 360,
    unitsAvailable: 360,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Premium condominium complex with strong occupancy demand.',
  },
  {
    title: 'Serenity Gardens Townhomes',
    location: 'Savannah, Georgia',
    price: 675000,
    packagePrice: 1250,
    lotAreaSqft: 12000,
    totalUnits: 300,
    unitsAvailable: 300,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Townhome community asset with stable rental profile.',
  },
  {
    title: 'Harbor Point Lofts',
    location: 'San Diego, California',
    price: 980000,
    packagePrice: 1900,
    lotAreaSqft: 9200,
    totalUnits: 260,
    unitsAvailable: 260,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Urban loft portfolio minutes from the marina district.',
  },
  {
    title: 'Emerald Grove Estates',
    location: 'Nashville, Tennessee',
    price: 830000,
    packagePrice: 1600,
    lotAreaSqft: 11000,
    totalUnits: 240,
    unitsAvailable: 240,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Greenbelt-adjacent estate homes with high occupancy demand.',
  },
  {
    title: 'Maple Crest Residences',
    location: 'Charlotte, North Carolina',
    price: 910000,
    packagePrice: 1750,
    lotAreaSqft: 8700,
    totalUnits: 220,
    unitsAvailable: 220,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'High-yield suburban residences with strong community amenities.',
  },
  {
    title: 'Silverline Waterfront Homes',
    location: 'Tampa, Florida',
    price: 1320000,
    packagePrice: 2500,
    lotAreaSqft: 21000,
    totalUnits: 340,
    unitsAvailable: 340,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Waterfront home cluster with premium appreciation potential.',
  },
  {
    title: 'Golden Dunes Retreat',
    location: 'Phoenix, Arizona',
    price: 760000,
    packagePrice: 1400,
    lotAreaSqft: 13000,
    totalUnits: 280,
    unitsAvailable: 280,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Desert luxury community with strong rental and resale metrics.',
  },
  {
    title: 'Cedar Valley Terraces',
    location: 'Denver, Colorado',
    price: 1040000,
    packagePrice: 2000,
    lotAreaSqft: 9700,
    totalUnits: 300,
    unitsAvailable: 300,
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Terraced residential project in a fast-growing metro corridor.',
  },
];

const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@acpinvestment.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'ACP Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
    }
    if (existing.status !== 'active') {
      existing.status = 'active';
    }
    await existing.save();
    return existing;
  }

  return User.create({ name, email, passwordHash: password, role: 'admin' });
};

const upsertByName = async (Model, items) => {
  for (const item of items) {
    const existing = await Model.findOne({ name: item.name });
    if (!existing) {
      await Model.create(item);
    }
  }
};

const upsertListingByTitle = async (items) => {
  for (const item of items) {
    await RealEstateListing.findOneAndUpdate({ title: item.title }, item, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
};

const run = async () => {
  await connectDB();

  await ensureAdmin();
  await upsertByName(InvestmentPlan, defaultPlans);
  await upsertByName(PaymentMethod, defaultPaymentMethods);
  await upsertListingByTitle(defaultListings);
  await PlatformSetting.findOneAndUpdate(
    { singleton: 'platform' },
    {
      singleton: 'platform',
      defaultCurrency: 'USD',
      supportEmail: 'support@acpinvestment.com',
      roiMultiplier: 1,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await mongoose.disconnect();
  console.log('Seed complete');
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
