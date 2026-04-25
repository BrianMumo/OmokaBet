const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  eventExternalId: String,
  sportKey: String,
  homeTeam: String,
  awayTeam: String,
  commenceTime: Date,
  market: {
    type: String,
    required: true, // h2h, spreads, totals
  },
  outcomeName: {
    type: String,
    required: true, // Team name or Over/Under
  },
  odds: {
    type: Number,
    required: true,
  },
  result: {
    type: String,
    enum: ['pending', 'won', 'lost', 'void'],
    default: 'pending',
  },
}, { _id: false });

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  betCode: {
    type: String,
    unique: true,
  },
  type: {
    type: String,
    enum: ['single', 'multi'],
    required: true,
  },
  selections: {
    type: [selectionSchema],
    validate: [arr => arr.length > 0, 'At least one selection is required'],
  },
  stake: {
    type: Number,
    required: true,
    min: 1,
  },
  totalOdds: {
    type: Number,
    required: true,
  },
  potentialWin: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost', 'partial', 'cashout', 'void'],
    default: 'pending',
    index: true,
  },
  cashoutAmount: {
    type: Number,
    default: null,
  },
  settledAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Generate bet code before saving
betSchema.pre('save', function (next) {
  if (!this.betCode) {
    const prefix = 'OMK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.betCode = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Calculate total odds and potential win
betSchema.pre('validate', function (next) {
  if (this.selections && this.selections.length > 0) {
    this.totalOdds = this.selections.reduce((acc, sel) => acc * sel.odds, 1);
    this.totalOdds = Math.round(this.totalOdds * 100) / 100;
    this.potentialWin = Math.round(this.stake * this.totalOdds * 100) / 100;
    this.type = this.selections.length === 1 ? 'single' : 'multi';
  }
  next();
});

betSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Bet', betSchema);
