const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { MIN_DEPOSIT, MAX_DEPOSIT, MIN_WITHDRAWAL, MAX_WITHDRAWAL } = require('../config/constants');

// @route   GET /api/wallet/balance
// @desc    Get user's wallet balance
router.get('/balance', protect, async (req, res) => {
  res.json({ balance: req.user.balance });
});

// @route   POST /api/wallet/deposit
// @desc    Simulate a deposit (or trigger M-Pesa STK push)
router.post('/deposit', protect, async (req, res) => {
  try {
    const { amount, method = 'mpesa' } = req.body;
    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount < MIN_DEPOSIT) {
      return res.status(400).json({ message: `Minimum deposit is KES ${MIN_DEPOSIT}` });
    }
    if (depositAmount > MAX_DEPOSIT) {
      return res.status(400).json({ message: `Maximum deposit is KES ${MAX_DEPOSIT.toLocaleString()}` });
    }

    if (method === 'mpesa') {
      // Trigger M-Pesa STK Push
      const mpesaService = require('../services/mpesaService');
      try {
        const result = await mpesaService.initiateSTKPush(
          req.user.phone,
          depositAmount,
          `Deposit-${req.user._id}`
        );

        return res.json({
          message: 'M-Pesa payment request sent. Check your phone.',
          checkoutRequestId: result.CheckoutRequestID,
          status: 'pending',
        });
      } catch (mpesaError) {
        console.error('M-Pesa STK push error:', mpesaError);
        // Fall back to simulated deposit for development
        if (process.env.NODE_ENV === 'development') {
          console.log('[DEV] Falling back to simulated deposit');
        } else {
          return res.status(500).json({ message: 'M-Pesa payment request failed. Please try again.' });
        }
      }
    }

    // Simulated deposit (development mode)
    const user = await User.findById(req.user._id);
    const balanceBefore = user.balance;
    user.balance += depositAmount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: depositAmount,
      balanceBefore,
      balanceAfter: user.balance,
      reference: `DEP-${Date.now()}`,
      description: `Deposit via ${method}`,
      status: 'completed',
    });

    // Emit balance update
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${user._id}`).emit('wallet:updated', { balance: user.balance });
    }

    res.json({
      message: 'Deposit successful',
      balance: user.balance,
      amount: depositAmount,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Deposit failed' });
  }
});

// @route   POST /api/wallet/withdraw
// @desc    Request withdrawal
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, phone } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount < MIN_WITHDRAWAL) {
      return res.status(400).json({ message: `Minimum withdrawal is KES ${MIN_WITHDRAWAL}` });
    }
    if (withdrawAmount > MAX_WITHDRAWAL) {
      return res.status(400).json({ message: `Maximum withdrawal is KES ${MAX_WITHDRAWAL.toLocaleString()}` });
    }

    const user = await User.findById(req.user._id);
    if (user.balance < withdrawAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const targetPhone = phone || user.phone;

    // Deduct balance first
    const balanceBefore = user.balance;
    user.balance -= withdrawAmount;
    await user.save();

    // Record pending transaction
    const transaction = await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      amount: -withdrawAmount,
      balanceBefore,
      balanceAfter: user.balance,
      phone: targetPhone,
      reference: `WDR-${Date.now()}`,
      description: `Withdrawal to ${targetPhone}`,
      status: 'pending',
    });

    // Try M-Pesa B2C payout
    try {
      const mpesaService = require('../services/mpesaService');
      const result = await mpesaService.initiateB2C(
        targetPhone,
        withdrawAmount,
        `Withdrawal-${transaction._id}`
      );

      transaction.mpesaTransactionId = result.ConversationID;
      transaction.status = 'completed';
      await transaction.save();
    } catch (mpesaError) {
      console.error('B2C payout error:', mpesaError);
      if (process.env.NODE_ENV === 'development') {
        // In dev mode, mark as completed anyway
        transaction.status = 'completed';
        await transaction.save();
      } else {
        // Refund balance on failure
        user.balance += withdrawAmount;
        await user.save();
        transaction.status = 'failed';
        await transaction.save();
        return res.status(500).json({ message: 'Withdrawal failed. Balance has been refunded.' });
      }
    }

    // Emit balance update
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${user._id}`).emit('wallet:updated', { balance: user.balance });
    }

    res.json({
      message: 'Withdrawal processed successfully',
      balance: user.balance,
      amount: withdrawAmount,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Withdrawal failed' });
  }
});

// @route   GET /api/wallet/transactions
// @desc    Get transaction history
router.get('/transactions', protect, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };

    if (type && type !== 'all') {
      filter.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
