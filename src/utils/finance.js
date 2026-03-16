const Wallet = require('../models/Wallet');
const LedgerEntry = require('../models/LedgerEntry');
const Transaction = require('../models/Transaction');
const { ensureAllowed } = require('./validation');

const financeError = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

const applyWalletDelta = async ({
  userId,
  currency = 'USD',
  amount,
  direction,
  type,
  reference,
  metadata = {},
  allowNegative = false,
}) => {
  if (!userId || amount === undefined || !direction || !type) {
    throw financeError('userId, amount, direction, and type are required');
  }
  ensureAllowed(direction, ['credit', 'debit'], 'direction');

  const normalizedAmount = Number(amount);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw financeError('Invalid amount');
  }

  const delta = direction === 'credit' ? normalizedAmount : -normalizedAmount;

  const wallet = await Wallet.findOne({ user: userId, currency });
  if (!wallet && direction === 'debit' && !allowNegative) {
    throw financeError('Insufficient balance');
  }
  if (wallet && direction === 'debit' && !allowNegative && wallet.balance < normalizedAmount) {
    throw financeError('Insufficient balance');
  }

  const updatedWallet = await Wallet.findOneAndUpdate(
    { user: userId, currency },
    { $inc: { balance: delta } },
    { new: true, upsert: true }
  );

  const ledgerEntry = await LedgerEntry.create({
    user: userId,
    type,
    amount: normalizedAmount,
    currency,
    direction,
    balanceAfter: updatedWallet.balance,
    reference,
  });

  const existingTransaction = reference
    ? await Transaction.findOne({ user: userId, type, reference, direction })
    : null;

  const transaction =
    existingTransaction ||
    (await Transaction.create({
      user: userId,
      type,
      amount: normalizedAmount,
      currency,
      direction,
      status: 'completed',
      reference,
      metadata,
    }));

  return { wallet: updatedWallet, ledgerEntry, transaction };
};

const transferFunds = async ({
  fromUserId,
  toUserId,
  amount,
  currency = 'USD',
  reference,
  allowNegative = false,
}) => {
  const debitResult = await applyWalletDelta({
    userId: fromUserId,
    currency,
    amount,
    direction: 'debit',
    type: 'transfer',
    reference,
    allowNegative,
    metadata: { toUserId },
  });

  const creditResult = await applyWalletDelta({
    userId: toUserId,
    currency,
    amount,
    direction: 'credit',
    type: 'transfer',
    reference,
    metadata: { fromUserId },
  });

  return { debitResult, creditResult };
};

module.exports = { applyWalletDelta, transferFunds };
