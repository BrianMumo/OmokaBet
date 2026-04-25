const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { SUPPORTED_SPORTS } = require('../config/constants');

// @route   GET /api/events
// @desc    List events with filtering
router.get('/', async (req, res) => {
  try {
    const { sport, status, date, search, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (sport) filter.sportKey = sport;
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['upcoming', 'live'] };
    }

    if (date === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      filter.commenceTime = { $gte: start, $lte: end };
    } else if (date === 'tomorrow') {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      filter.commenceTime = { $gte: start, $lte: end };
    } else if (date === 'week') {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 7);
      filter.commenceTime = { $gte: start, $lte: end };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { homeTeam: regex },
        { awayTeam: regex },
        { sportTitle: regex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .select('-predeterminedHome -predeterminedAway -matchDuration')
      .sort({ commenceTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Events list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/live
// @desc    Get live events
router.get('/live', async (req, res) => {
  try {
    const events = await Event.find({ status: 'live' })
      .select('-predeterminedHome -predeterminedAway -matchDuration')
      .sort({ commenceTime: -1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/featured
// @desc    Get featured/popular events
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.find({
      status: { $in: ['upcoming', 'live'] },
      sportKey: { $in: ['soccer_epl', 'soccer_uefa_champs_league', 'soccer_spain_la_liga'] },
    })
      .select('-predeterminedHome -predeterminedAway -matchDuration')
      .sort({ commenceTime: 1 })
      .limit(10);

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event with full markets
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('-predeterminedHome -predeterminedAway -matchDuration');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
