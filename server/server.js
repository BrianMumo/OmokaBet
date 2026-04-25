const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initSocket = require('./sockets');
const cron = require('node-cron');
const { generateVirtualMatches, processVirtualMatches, ensureUpcomingMatches } = require('./services/oddsService');
const { settleCompletedBets } = require('./services/betSettlement');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const { authLimiter, betLimiter, walletLimiter, apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bets', betLimiter, require('./routes/bets'));
app.use('/api/wallet', walletLimiter, require('./routes/wallet'));
app.use('/api/mpesa', require('./routes/mpesa'));
app.use('/api/sports', require('./routes/sports'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Production: serve React frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  // SPA catch-all — must be after all API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Initialize Socket.IO
const io = initSocket(server);
app.set('io', io);

// ==================== VIRTUAL MATCH LIFECYCLE ====================

// Every 30 seconds: process match transitions (upcoming→live→completed)
cron.schedule('*/30 * * * * *', async () => {
  try {
    const transitioned = await processVirtualMatches();
    if (transitioned > 0) {
      io.emit('events:updated');
    }

    // Also settle completed bets
    const settled = await settleCompletedBets();
    if (settled.length > 0) {
      console.log(`[CRON] Settled ${settled.length} bets`);
      settled.forEach(r => {
        io.to(`user:${r.userId}`).emit('bet:settled', r);
      });
    }
  } catch (err) {
    console.error('[CRON] Virtual processing failed:', err.message);
  }
});

// Every 10 minutes: ensure we always have fresh upcoming matches
cron.schedule('*/10 * * * *', async () => {
  try {
    await ensureUpcomingMatches();
    io.emit('events:updated');
  } catch (err) {
    console.error('[CRON] Match generation failed:', err.message);
  }
});

// ==================== STARTUP ====================

const seedAdmin = async () => {
  const User = require('./models/User');
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    try {
      await User.create({
        username: 'admin',
        email: 'admin@omokabet.com',
        phone: '+254700000000',
        password: 'Admin@1234',
        role: 'admin',
        isVerified: true,
      });
      console.log('[SEED] Default admin created — phone: +254700000000 / password: Admin@1234');
    } catch (err) {
      console.error('[SEED] Admin seed failed:', err.message);
    }
  }
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`\n⚡ OmokaBet Virtual Betting Server — port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  await seedAdmin();
  // Generate initial virtual matches on startup
  await generateVirtualMatches();
});
