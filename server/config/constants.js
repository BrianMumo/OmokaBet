module.exports = {
  // Sports configuration — Virtual leagues
  SUPPORTED_SPORTS: [
    { key: 'soccer_epl', title: 'English Premier League', group: 'Football', icon: '⚽' },
    { key: 'soccer_spain_la_liga', title: 'La Liga', group: 'Football', icon: '⚽' },
    { key: 'soccer_germany_bundesliga', title: 'Bundesliga', group: 'Football', icon: '⚽' },
    { key: 'soccer_italy_serie_a', title: 'Serie A', group: 'Football', icon: '⚽' },
    { key: 'soccer_france_ligue_one', title: 'Ligue 1', group: 'Football', icon: '⚽' },
    { key: 'soccer_uefa_champs_league', title: 'UEFA Champions League', group: 'Football', icon: '⚽' },
    { key: 'basketball_nba', title: 'NBA', group: 'Basketball', icon: '🏀' },
    { key: 'basketball_euroleague', title: 'Euroleague', group: 'Basketball', icon: '🏀' },
    { key: 'cricket_ipl', title: 'IPL', group: 'Cricket', icon: '🏏' },
  ],

  // Betting limits
  MIN_BET: 50,        // KES
  MAX_BET: 500000,    // KES
  MAX_SELECTIONS: 30,
  MAX_ODDS: 1000,

  // Wallet limits
  MIN_DEPOSIT: 10,     // KES
  MAX_DEPOSIT: 150000, // KES
  MIN_WITHDRAWAL: 100,
  MAX_WITHDRAWAL: 70000,

  // M-Pesa
  MPESA_PAYBILL: process.env.MPESA_SHORTCODE || '174379',

  // House edge (applied to odds)
  HOUSE_EDGE: 0.06, // 6% margin

  // Virtual match settings
  VIRTUAL_PROCESS_INTERVAL_SECONDS: 30,  // How often to check match lifecycle
  VIRTUAL_REGEN_INTERVAL_MINUTES: 10,    // How often to ensure fresh matches
};
