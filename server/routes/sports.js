const express = require('express');
const router = express.Router();
const { SUPPORTED_SPORTS } = require('../config/constants');

// @route   GET /api/sports
// @desc    Get list of supported sports
router.get('/', (req, res) => {
  // Group sports by category
  const grouped = {};
  SUPPORTED_SPORTS.forEach(sport => {
    if (!grouped[sport.group]) {
      grouped[sport.group] = {
        name: sport.group,
        icon: sport.icon,
        leagues: [],
      };
    }
    grouped[sport.group].leagues.push({
      key: sport.key,
      title: sport.title,
    });
  });

  res.json({
    sports: Object.values(grouped),
    all: SUPPORTED_SPORTS,
  });
});

module.exports = router;
