const rateLimit = require('express-rate-limit');

/**
 * Auth endpoints: login/register — strict to prevent brute force
 * 10 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Bet placement: moderate limit to prevent API abuse
 * 30 bets per minute per IP
 */
const betLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { message: 'Too many bets placed. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Wallet operations: deposit/withdraw
 * 10 per minute per IP
 */
const walletLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: 'Too many wallet requests. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API limiter for all routes
 * 200 requests per minute per IP
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: 'Rate limit exceeded. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, betLimiter, walletLimiter, apiLimiter };
