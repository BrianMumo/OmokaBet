const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bet = require('../models/Bet');
const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/auth');

// All routes require auth + admin
router.use(protect, admin);

// ==================== DASHBOARD ====================
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      todayUsers,
      totalBets,
      activeBets,
      totalDeposits,
      totalWithdrawals,
      todayDeposits,
      todayWithdrawals,
      todayBets,
      todayWins,
      recentBets,
      recentUsers,
      dailyRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Bet.countDocuments(),
      Bet.countDocuments({ status: 'pending' }),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'completed', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Bet.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$stake' }, count: { $sum: 1 } } },
      ]),
      Bet.aggregate([
        { $match: { status: 'won', settledAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$potentialWin' } } },
      ]),
      Bet.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'username phone'),
      User.find().sort({ createdAt: -1 }).limit(10).select('username phone balance createdAt'),
      // Daily revenue for last 7 days
      Transaction.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: weekAgo }, type: { $in: ['deposit', 'withdrawal'] } } },
        {
          $group: {
            _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
    ]);

    const depositsTotal = totalDeposits[0]?.total || 0;
    const withdrawalsTotal = totalWithdrawals[0]?.total || 0;
    const todayDepositTotal = todayDeposits[0]?.total || 0;
    const todayWithdrawalTotal = todayWithdrawals[0]?.total || 0;
    const todayStaked = todayBets[0]?.total || 0;
    const todayBetCount = todayBets[0]?.count || 0;
    const todayPaidOut = todayWins[0]?.total || 0;

    res.json({
      stats: {
        totalUsers,
        todayUsers,
        totalBets,
        activeBets,
        totalRevenue: depositsTotal - withdrawalsTotal,
        depositsTotal,
        withdrawalsTotal,
        todayDeposits: todayDepositTotal,
        todayWithdrawals: todayWithdrawalTotal,
        todayStaked,
        todayBetCount,
        todayPnl: todayStaked - todayPaidOut,
      },
      recentBets,
      recentUsers,
      dailyRevenue,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// ==================== USERS ====================
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 25, search, role, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-__v');

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [bets, transactions] = await Promise.all([
      Bet.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
      Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
    ]);

    res.json({ user, bets, transactions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { role, isVerified } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (typeof isVerified === 'boolean') updates.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.post('/users/:id/credit', async (req, res) => {
  try {
    const { amount, description = 'Admin adjustment' } = req.body;
    if (!amount || amount === 0) return res.status(400).json({ message: 'Amount is required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const balanceBefore = user.balance;
    user.balance = Math.max(0, user.balance + amount);
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: amount > 0 ? 'bonus' : 'refund',
      amount: Math.abs(amount),
      balanceBefore,
      balanceAfter: user.balance,
      description: `[ADMIN] ${description}`,
      reference: `ADM-${Date.now().toString(36).toUpperCase()}`,
      status: 'completed',
    });

    res.json({ user: { id: user._id, balance: user.balance }, adjustment: amount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to credit user' });
  }
});

// ==================== BETS ====================
router.get('/bets', async (req, res) => {
  try {
    const { page = 1, limit = 25, status, userId, sort = '-createdAt' } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (userId) query.userId = userId;

    const total = await Bet.countDocuments(query);
    const bets = await Bet.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'username phone');

    res.json({ bets, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load bets' });
  }
});

router.put('/bets/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['won', 'lost', 'void'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const bet = await Bet.findById(req.params.id);
    if (!bet) return res.status(404).json({ message: 'Bet not found' });

    const prevStatus = bet.status;
    bet.status = status;
    bet.settledAt = new Date();

    // Update all selections to match
    bet.selections.forEach(sel => { sel.result = status === 'void' ? 'void' : status; });

    await bet.save();

    // If won, credit the user
    if (status === 'won') {
      const user = await User.findById(bet.userId);
      if (user) {
        const balanceBefore = user.balance;
        user.balance += bet.potentialWin;
        user.totalWins += 1;
        user.totalWon += bet.potentialWin;
        await user.save();

        await Transaction.create({
          userId: user._id,
          type: 'win',
          amount: bet.potentialWin,
          balanceBefore,
          balanceAfter: user.balance,
          description: `[ADMIN] Manual settlement — ${bet.betCode}`,
          reference: bet.betCode,
          status: 'completed',
        });
      }
    }

    // If voided, refund the stake
    if (status === 'void') {
      const user = await User.findById(bet.userId);
      if (user) {
        const balanceBefore = user.balance;
        user.balance += bet.stake;
        await user.save();

        await Transaction.create({
          userId: user._id,
          type: 'refund',
          amount: bet.stake,
          balanceBefore,
          balanceAfter: user.balance,
          description: `[ADMIN] Bet voided — ${bet.betCode}`,
          reference: bet.betCode,
          status: 'completed',
        });
      }
    }

    res.json({ bet, previousStatus: prevStatus });
  } catch (err) {
    console.error('Admin settle bet error:', err);
    res.status(500).json({ message: 'Failed to settle bet' });
  }
});

// ==================== TRANSACTIONS ====================
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 25, type, status, sort = '-createdAt' } = req.query;
    const query = {};

    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'username phone');

    // Totals
    const [depositSum, withdrawalSum] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      transactions,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      totals: {
        deposits: depositSum[0]?.total || 0,
        withdrawals: withdrawalSum[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load transactions' });
  }
});

// ==================== EVENTS ====================
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 25, status, sort = '-commenceTime' } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;

    const total = await Event.countDocuments(query);
    // Admin sees EVERYTHING including predetermined scores
    const events = await Event.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load events' });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const { status, homeScore, awayScore } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (status) event.status = status;
    if (typeof homeScore === 'number') event.homeScore = homeScore;
    if (typeof awayScore === 'number') event.awayScore = awayScore;

    await event.save();

    // Auto-settle bets when admin marks event as completed
    let settled = [];
    if (status === 'completed' && event.homeScore !== null && event.awayScore !== null) {
      const { settleCompletedBets } = require('../services/betSettlement');
      settled = await settleCompletedBets();
    }

    res.json({ event, settledBets: settled.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// Generate fresh virtual matches
router.post('/events/generate', async (req, res) => {
  try {
    const { generateVirtualMatches } = require('../services/oddsService');
    const count = await generateVirtualMatches();
    res.json({ message: `Generated ${count} virtual matches`, count });
  } catch (err) {
    console.error('Generate events error:', err);
    res.status(500).json({ message: 'Failed to generate events' });
  }
});

module.exports = router;
