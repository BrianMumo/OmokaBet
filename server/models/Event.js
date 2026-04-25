const mongoose = require('mongoose');

const outcomeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // Decimal odds (e.g., 2.50)
}, { _id: false });

const marketSchema = new mongoose.Schema({
  key: { type: String, required: true }, // h2h, spreads, totals
  lastUpdate: { type: Date },
  outcomes: [outcomeSchema],
}, { _id: false });

const eventSchema = new mongoose.Schema({
  externalId: {
    type: String,
    unique: true,
    required: true,
  },
  sportKey: {
    type: String,
    required: true,
    index: true,
  },
  sportTitle: {
    type: String,
    required: true,
  },
  sportGroup: {
    type: String,
    default: 'Football',
  },
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  commenceTime: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming',
    index: true,
  },
  homeScore: {
    type: Number,
    default: null,
  },
  awayScore: {
    type: Number,
    default: null,
  },
  // Predetermined outcome — set at creation, hidden from public API
  predeterminedHome: {
    type: Number,
    default: null,
  },
  predeterminedAway: {
    type: Number,
    default: null,
  },
  // Match duration in minutes (for auto-completion scheduling)
  matchDuration: {
    type: Number,
    default: 5, // virtual matches complete fast
  },
  markets: [marketSchema],
  bookmaker: {
    type: String,
    default: 'OmokaBet Virtual',
  },
  lastOddsUpdate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Auto-update status based on commence time
eventSchema.methods.updateStatus = function () {
  const now = new Date();
  if (this.status === 'completed' || this.status === 'cancelled') return;
  if (now >= this.commenceTime) {
    this.status = 'live';
  }
};

// Index for efficient queries
eventSchema.index({ sportKey: 1, status: 1, commenceTime: 1 });
eventSchema.index({ status: 1, commenceTime: -1 });

// TTL index: auto-delete events 7 days after completion
eventSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 604800, // 7 days
    partialFilterExpression: { status: 'completed' },
  }
);

module.exports = mongoose.model('Event', eventSchema);
