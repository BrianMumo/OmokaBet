const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Bet = require('../models/Bet');
const User = require('../models/User');
const Event = require('../models/Event');
const Transaction = require('../models/Transaction');
const { MIN_BET, MAX_BET, MAX_SELECTIONS } = require('../config/constants');

// @route   POST /api/bets
// @desc    Place a new bet
router.post('/', protect, async (req, res) => {
  try {
    const { selections, stake } = req.body;

    // Validate stake
    if (!stake || stake < MIN_BET) {
      return res.status(400).json({ message: `Minimum bet is KES ${MIN_BET}` });
    }
    if (stake > MAX_BET) {
      return res.status(400).json({ message: `Maximum bet is KES ${MAX_BET.toLocaleString()}` });
    }

    // Validate selections
    if (!selections || selections.length === 0) {
      return res.status(400).json({ message: 'At least one selection is required' });
    }
    if (selections.length > MAX_SELECTIONS) {
      return res.status(400).json({ message: `Maximum ${MAX_SELECTIONS} selections allowed` });
    }

    // Check for duplicate bets on the same event outcome
    const eventIds = selections.map(s => s.eventId);
    const existingBets = await Bet.find({
      userId: req.user._id,
      status: 'pending',
      'selections.eventId': { $in: eventIds },
    });

    for (const sel of selections) {
      const dup = existingBets.find(b =>
        b.selections.some(s =>
          s.eventId.toString() === sel.eventId &&
          s.outcomeName === sel.outcomeName
        )
      );
      if (dup) {
        return res.status(400).json({
          message: `You already have a pending bet on this outcome (${sel.outcomeName}). Bet code: ${dup.betCode}`,
        });
      }
    }

    // Validate all events exist and odds are still valid
    const enrichedSelections = [];
    for (const sel of selections) {
      const event = await Event.findById(sel.eventId);
      if (!event) {
        return res.status(400).json({ message: `Event not found: ${sel.eventId}` });
      }
      if (!['upcoming', 'live'].includes(event.status)) {
        return res.status(400).json({ message: `Betting closed for ${event.homeTeam} vs ${event.awayTeam}` });
      }

      // Find the market and verify odds
      const market = event.markets.find(m => m.key === sel.market);
      if (!market) {
        return res.status(400).json({ message: `Market not available for ${event.homeTeam} vs ${event.awayTeam}` });
      }

      const outcome = market.outcomes.find(o => o.name === sel.outcomeName);
      if (!outcome) {
        return res.status(400).json({ message: `Outcome not available: ${sel.outcomeName}` });
      }

      enrichedSelections.push({
        eventId: event._id,
        eventExternalId: event.externalId,
        sportKey: event.sportKey,
        homeTeam: event.homeTeam,
        awayTeam: event.awayTeam,
        commenceTime: event.commenceTime,
        market: sel.market,
        outcomeName: sel.outcomeName,
        odds: outcome.price, // Use current odds from DB
      });
    }

    // Deduct balance atomically — prevents race conditions / overdraw
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: stake } },
      { $inc: { balance: -stake, totalBets: 1, totalWagered: stake } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const balanceBefore = user.balance + stake; // reverse-calc for transaction log

    // Create bet
    const bet = await Bet.create({
      userId: user._id,
      selections: enrichedSelections,
      stake,
      totalOdds: 1, // Will be calculated in pre-validate hook
      potentialWin: 0, // Will be calculated in pre-validate hook
    });

    // Record transaction
    await Transaction.create({
      userId: user._id,
      type: 'bet',
      amount: -stake,
      balanceBefore,
      balanceAfter: user.balance,
      reference: bet.betCode,
      description: `Bet placed: ${bet.betCode}`,
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${user._id}`).emit('bet:placed', {
        betId: bet._id,
        betCode: bet.betCode,
        stake,
        potentialWin: bet.potentialWin,
        balance: user.balance,
      });
    }

    res.status(201).json({
      bet: {
        id: bet._id,
        betCode: bet.betCode,
        type: bet.type,
        selections: bet.selections,
        stake: bet.stake,
        totalOdds: bet.totalOdds,
        potentialWin: bet.potentialWin,
        status: bet.status,
        createdAt: bet.createdAt,
      },
      balance: user.balance,
    });
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({ message: 'Failed to place bet' });
  }
});

// @route   GET /api/bets
// @desc    Get user's bet history
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };

    if (status && status !== 'all') {
      if (status === 'active') {
        filter.status = 'pending';
      } else if (status === 'settled') {
        filter.status = { $in: ['won', 'lost', 'cashout', 'void'] };
      } else {
        filter.status = status;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Bet.countDocuments(filter);
    const bets = await Bet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      bets,
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

// @route   GET /api/bets/:id
// @desc    Get single bet detail
router.get('/:id', protect, async (req, res) => {
  try {
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    res.json({ bet });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bets/:id/cashout
// @desc    Cash out a pending bet
router.post('/:id/cashout', protect, async (req, res) => {
  try {
    const bet = await Bet.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    if (bet.status !== 'pending') {
      return res.status(400).json({ message: 'Bet cannot be cashed out' });
    }

    // Calculate cashout amount (simplified: percentage of potential win based on settled selections)
    const settledWins = bet.selections.filter(s => s.result === 'won').length;
    const totalSelections = bet.selections.length;
    const pendingSelections = bet.selections.filter(s => s.result === 'pending').length;

    let cashoutMultiplier = 0.5; // Base cashout at 50% of potential
    if (settledWins > 0) {
      cashoutMultiplier = 0.5 + (settledWins / totalSelections) * 0.3;
    }

    const cashoutAmount = Math.round(bet.stake * cashoutMultiplier * 100) / 100;

    // Update bet
    bet.status = 'cashout';
    bet.cashoutAmount = cashoutAmount;
    bet.settledAt = new Date();
    await bet.save();

    // Credit user
    const user = await User.findById(req.user._id);
    const balanceBefore = user.balance;
    user.balance += cashoutAmount;
    await user.save();

    // Record transaction
    await Transaction.create({
      userId: user._id,
      type: 'cashout',
      amount: cashoutAmount,
      balanceBefore,
      balanceAfter: user.balance,
      reference: bet.betCode,
      description: `Cashout: ${bet.betCode}`,
    });

    res.json({
      bet,
      cashoutAmount,
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
