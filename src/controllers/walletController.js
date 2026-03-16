const Wallet = require('../models/Wallet');
const { applyWalletDelta } = require('../utils/finance');

const getMyWallets = async (req, res) => {
  const wallets = await Wallet.find({ user: req.user._id });
  return res.json({ wallets });
};

const getAllWallets = async (req, res) => {
  const wallets = await Wallet.find().populate('user', 'name email role');
  return res.json({ wallets });
};

const adjustWallet = async (req, res) => {
  const { id } = req.params;
  const { balance, pending } = req.body;

  const wallet = await Wallet.findById(id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }

  let updatedWallet = wallet;

  if (typeof balance === 'number' && balance !== wallet.balance) {
    const delta = balance - wallet.balance;
    const direction = delta > 0 ? 'credit' : 'debit';
    const amount = Math.abs(delta);

    updatedWallet = (
      await applyWalletDelta({
        userId: wallet.user,
        currency: wallet.currency,
        amount,
        direction,
        type: 'adjustment',
        reference: `wallet-adjust:${wallet._id.toString()}`,
        allowNegative: false,
      })
    ).wallet;
  }

  if (typeof pending === 'number') {
    if (pending < 0) {
      return res.status(400).json({ error: 'pending must be 0 or greater' });
    }
    updatedWallet.pending = pending;
    await updatedWallet.save();
  }

  return res.json({ wallet: updatedWallet });
};

module.exports = { getMyWallets, getAllWallets, adjustWallet };
