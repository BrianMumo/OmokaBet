const Bet = require('../models/Bet');
const User = require('../models/User');
const Event = require('../models/Event');
const Transaction = require('../models/Transaction');

/**
 * Settle all bets for completed events
 */
async function settleCompletedBets() {
  const results = [];

  // Find completed events that have unsettled bets
  const completedEvents = await Event.find({ status: 'completed' });

  if (completedEvents.length === 0) return results;

  const completedEventIds = completedEvents.map(e => e._id.toString());

  // Find pending bets that include completed events
  const pendingBets = await Bet.find({
    status: 'pending',
    'selections.eventId': { $in: completedEventIds },
  });

  for (const bet of pendingBets) {
    let allSettled = true;
    let allWon = true;
    let anyLost = false;

    for (const selection of bet.selections) {
      if (selection.result !== 'pending') continue;

      const event = completedEvents.find(
        e => e._id.toString() === selection.eventId.toString()
      );

      if (!event) {
        allSettled = false;
        continue;
      }

      // Determine winner based on scores
      const result = determineOutcome(event, selection);
      selection.result = result;

      if (result === 'lost') {
        anyLost = true;
        allWon = false;
      } else if (result !== 'won') {
        allWon = false;
      }
    }

    // Check if all selections are settled
    const pendingCount = bet.selections.filter(s => s.result === 'pending').length;
    if (pendingCount > 0) {
      allSettled = false;
    }

    if (allSettled || anyLost) {
      // If any selection lost, the whole multi-bet loses
      if (anyLost) {
        bet.status = 'lost';
      } else if (allWon) {
        bet.status = 'won';

        // Credit winnings
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
            reference: bet.betCode,
            description: `Bet won: ${bet.betCode} — KES ${bet.potentialWin.toLocaleString()}`,
          });

          results.push({
            userId: user._id.toString(),
            betId: bet._id,
            betCode: bet.betCode,
            status: 'won',
            amount: bet.potentialWin,
            balance: user.balance,
          });
        }
      }

      bet.settledAt = new Date();
      await bet.save();

      if (bet.status === 'lost') {
        results.push({
          userId: bet.userId.toString(),
          betId: bet._id,
          betCode: bet.betCode,
          status: 'lost',
          amount: 0,
        });
      }
    }
  }

  if (results.length > 0) {
    console.log(`[SETTLEMENT] Settled ${results.length} bets`);
  }

  return results;
}

/**
 * Determine outcome of a selection based on event result
 */
function determineOutcome(event, selection) {
  if (event.homeScore === null || event.awayScore === null) {
    return 'void';
  }

  if (selection.market === 'h2h') {
    let winner;
    if (event.homeScore > event.awayScore) {
      winner = event.homeTeam;
    } else if (event.awayScore > event.homeScore) {
      winner = event.awayTeam;
    } else {
      winner = 'Draw';
    }

    return selection.outcomeName === winner ? 'won' : 'lost';
  }

  // For other markets (spreads, totals), simplified logic
  return 'void';
}

module.exports = { settleCompletedBets };
