const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @route   POST /api/mpesa/stk-callback
// @desc    M-Pesa STK Push callback
router.post('/stk-callback', async (req, res) => {
  try {
    console.log('[M-PESA] STK Callback received:', JSON.stringify(req.body));

    const { Body } = req.body;
    if (!Body || !Body.stkCallback) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    if (ResultCode !== 0) {
      console.log(`[M-PESA] STK Push failed: ${ResultDesc}`);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Extract metadata
    const metadata = {};
    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach(item => {
        metadata[item.Name] = item.Value;
      });
    }

    const amount = metadata.Amount;
    const mpesaReceipt = metadata.MpesaReceiptNumber;
    const phone = metadata.PhoneNumber?.toString();

    if (!amount || !phone) {
      console.error('[M-PESA] Missing callback data');
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Normalize phone
    let normalizedPhone = phone;
    if (normalizedPhone.startsWith('254')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    // Find user by phone
    const user = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: '0' + phone.substring(3) },
        { phone },
      ]
    });

    if (!user) {
      console.error(`[M-PESA] No user found for phone: ${phone}`);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Credit user balance
    const balanceBefore = user.balance;
    user.balance += parseFloat(amount);
    await user.save();

    // Record transaction
    await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: parseFloat(amount),
      balanceBefore,
      balanceAfter: user.balance,
      reference: `MPESA-${mpesaReceipt}`,
      mpesaReceiptNumber: mpesaReceipt,
      phone: normalizedPhone,
      description: `M-Pesa deposit: ${mpesaReceipt}`,
      status: 'completed',
    });

    console.log(`[M-PESA] Deposit successful: KES ${amount} for ${user.username}`);

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('[M-PESA] STK callback error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// @route   POST /api/mpesa/b2c-callback
// @desc    M-Pesa B2C payout callback
router.post('/b2c-callback', async (req, res) => {
  try {
    console.log('[M-PESA] B2C Callback received:', JSON.stringify(req.body));

    const { Result } = req.body;
    if (!Result) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { ResultCode, ResultDesc, ConversationID } = Result;

    if (ResultCode !== 0) {
      console.log(`[M-PESA] B2C payout failed: ${ResultDesc}`);

      // Find and update failed transaction, refund user
      const transaction = await Transaction.findOne({
        mpesaTransactionId: ConversationID,
        status: 'pending',
      });

      if (transaction) {
        transaction.status = 'failed';
        await transaction.save();

        // Refund user
        const user = await User.findById(transaction.userId);
        if (user) {
          user.balance += Math.abs(transaction.amount);
          await user.save();
          console.log(`[M-PESA] Refunded KES ${Math.abs(transaction.amount)} to ${user.username}`);
        }
      }
    } else {
      // Update transaction to completed
      const transaction = await Transaction.findOne({
        mpesaTransactionId: ConversationID,
      });

      if (transaction) {
        transaction.status = 'completed';
        await transaction.save();
      }

      console.log(`[M-PESA] B2C payout successful: ${ConversationID}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('[M-PESA] B2C callback error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// @route   POST /api/mpesa/b2c-callback/timeout
// @desc    M-Pesa B2C timeout callback
router.post('/b2c-callback/timeout', async (req, res) => {
  console.log('[M-PESA] B2C Timeout:', JSON.stringify(req.body));
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

module.exports = router;
