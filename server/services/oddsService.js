const Event = require('../models/Event');
const { SUPPORTED_SPORTS, HOUSE_EDGE } = require('../config/constants');

// =====================================================================
// COMPLETE TEAM ROSTERS — Real teams from every supported league
// Each team has a power rating (1–100) used to generate realistic odds
// =====================================================================

const TEAMS = {
  // ---- FOOTBALL ----
  soccer_epl: [
    { name: 'Manchester City', power: 95 },
    { name: 'Arsenal', power: 93 },
    { name: 'Liverpool', power: 92 },
    { name: 'Manchester United', power: 85 },
    { name: 'Chelsea', power: 84 },
    { name: 'Tottenham', power: 83 },
    { name: 'Newcastle', power: 82 },
    { name: 'Aston Villa', power: 81 },
    { name: 'Brighton', power: 78 },
    { name: 'West Ham', power: 77 },
    { name: 'Brentford', power: 74 },
    { name: 'Crystal Palace', power: 73 },
    { name: 'Fulham', power: 72 },
    { name: 'Wolverhampton', power: 71 },
    { name: 'Bournemouth', power: 70 },
    { name: 'Nottingham Forest', power: 69 },
    { name: 'Everton', power: 68 },
    { name: 'Burnley', power: 64 },
    { name: 'Luton Town', power: 62 },
    { name: 'Sheffield United', power: 60 },
  ],
  soccer_spain_la_liga: [
    { name: 'Real Madrid', power: 96 },
    { name: 'Barcelona', power: 94 },
    { name: 'Atletico Madrid', power: 88 },
    { name: 'Girona', power: 83 },
    { name: 'Athletic Bilbao', power: 81 },
    { name: 'Real Sociedad', power: 80 },
    { name: 'Real Betis', power: 78 },
    { name: 'Villarreal', power: 77 },
    { name: 'Valencia', power: 75 },
    { name: 'Sevilla', power: 74 },
    { name: 'Getafe', power: 71 },
    { name: 'Osasuna', power: 70 },
    { name: 'Celta Vigo', power: 69 },
    { name: 'Mallorca', power: 68 },
    { name: 'Rayo Vallecano', power: 67 },
    { name: 'Las Palmas', power: 65 },
    { name: 'Deportivo Alaves', power: 63 },
    { name: 'Cadiz', power: 61 },
    { name: 'Granada', power: 60 },
    { name: 'Almeria', power: 58 },
  ],
  soccer_germany_bundesliga: [
    { name: 'Bayer Leverkusen', power: 93 },
    { name: 'Bayern Munich', power: 92 },
    { name: 'Borussia Dortmund', power: 88 },
    { name: 'RB Leipzig', power: 86 },
    { name: 'Stuttgart', power: 82 },
    { name: 'Eintracht Frankfurt', power: 79 },
    { name: 'Freiburg', power: 77 },
    { name: 'Wolfsburg', power: 75 },
    { name: 'Hoffenheim', power: 74 },
    { name: 'Union Berlin', power: 73 },
    { name: 'Werder Bremen', power: 71 },
    { name: 'Augsburg', power: 69 },
    { name: 'Borussia Monchengladbach', power: 70 },
    { name: 'Mainz 05', power: 68 },
    { name: 'FC Koln', power: 66 },
    { name: 'Heidenheim', power: 63 },
    { name: 'Darmstadt', power: 60 },
    { name: 'Bochum', power: 59 },
  ],
  soccer_italy_serie_a: [
    { name: 'Inter Milan', power: 93 },
    { name: 'AC Milan', power: 87 },
    { name: 'Juventus', power: 86 },
    { name: 'Napoli', power: 85 },
    { name: 'Atalanta', power: 84 },
    { name: 'Roma', power: 82 },
    { name: 'Lazio', power: 80 },
    { name: 'Bologna', power: 79 },
    { name: 'Fiorentina', power: 78 },
    { name: 'Torino', power: 74 },
    { name: 'Monza', power: 70 },
    { name: 'Genoa', power: 69 },
    { name: 'Udinese', power: 68 },
    { name: 'Cagliari', power: 67 },
    { name: 'Lecce', power: 66 },
    { name: 'Empoli', power: 65 },
    { name: 'Verona', power: 64 },
    { name: 'Sassuolo', power: 63 },
    { name: 'Frosinone', power: 60 },
    { name: 'Salernitana', power: 58 },
  ],
  soccer_france_ligue_one: [
    { name: 'PSG', power: 95 },
    { name: 'Monaco', power: 83 },
    { name: 'Marseille', power: 82 },
    { name: 'Lille', power: 80 },
    { name: 'Lyon', power: 79 },
    { name: 'Nice', power: 78 },
    { name: 'Lens', power: 77 },
    { name: 'Rennes', power: 76 },
    { name: 'Brest', power: 74 },
    { name: 'Strasbourg', power: 71 },
    { name: 'Toulouse', power: 70 },
    { name: 'Reims', power: 69 },
    { name: 'Nantes', power: 68 },
    { name: 'Montpellier', power: 67 },
    { name: 'Le Havre', power: 64 },
    { name: 'Metz', power: 63 },
    { name: 'Clermont', power: 61 },
    { name: 'Lorient', power: 60 },
  ],
  soccer_uefa_champs_league: [
    { name: 'Real Madrid', power: 96 },
    { name: 'Manchester City', power: 95 },
    { name: 'Bayern Munich', power: 92 },
    { name: 'Barcelona', power: 91 },
    { name: 'PSG', power: 90 },
    { name: 'Inter Milan', power: 89 },
    { name: 'Arsenal', power: 88 },
    { name: 'Liverpool', power: 87 },
    { name: 'Borussia Dortmund', power: 85 },
    { name: 'Atletico Madrid', power: 84 },
    { name: 'Napoli', power: 83 },
    { name: 'Juventus', power: 82 },
    { name: 'AC Milan', power: 81 },
    { name: 'Chelsea', power: 80 },
    { name: 'Benfica', power: 79 },
    { name: 'Porto', power: 78 },
  ],

  // ---- BASKETBALL ----
  basketball_nba: [
    { name: 'Boston Celtics', power: 95 },
    { name: 'Denver Nuggets', power: 93 },
    { name: 'Milwaukee Bucks', power: 91 },
    { name: 'Oklahoma City Thunder', power: 90 },
    { name: 'Minnesota Timberwolves', power: 89 },
    { name: 'LA Clippers', power: 87 },
    { name: 'Cleveland Cavaliers', power: 86 },
    { name: 'Dallas Mavericks', power: 85 },
    { name: 'Phoenix Suns', power: 84 },
    { name: 'New York Knicks', power: 83 },
    { name: 'Philadelphia 76ers', power: 82 },
    { name: 'Indiana Pacers', power: 81 },
    { name: 'Orlando Magic', power: 80 },
    { name: 'New Orleans Pelicans', power: 79 },
    { name: 'LA Lakers', power: 78 },
    { name: 'Sacramento Kings', power: 77 },
    { name: 'Golden State Warriors', power: 76 },
    { name: 'Miami Heat', power: 75 },
    { name: 'Houston Rockets', power: 74 },
    { name: 'Chicago Bulls', power: 72 },
    { name: 'Atlanta Hawks', power: 71 },
    { name: 'Brooklyn Nets', power: 68 },
    { name: 'Toronto Raptors', power: 67 },
    { name: 'Utah Jazz', power: 66 },
    { name: 'Memphis Grizzlies', power: 65 },
    { name: 'San Antonio Spurs', power: 63 },
    { name: 'Portland Trail Blazers', power: 62 },
    { name: 'Charlotte Hornets', power: 60 },
    { name: 'Washington Wizards', power: 58 },
    { name: 'Detroit Pistons', power: 55 },
  ],
  basketball_euroleague: [
    { name: 'Real Madrid Baloncesto', power: 93 },
    { name: 'Barcelona Basket', power: 92 },
    { name: 'Olympiacos', power: 88 },
    { name: 'Panathinaikos', power: 87 },
    { name: 'Fenerbahce', power: 86 },
    { name: 'Anadolu Efes', power: 84 },
    { name: 'CSKA Moscow', power: 82 },
    { name: 'Maccabi Tel Aviv', power: 80 },
    { name: 'Bayern Munich Basketball', power: 79 },
    { name: 'Partizan Belgrade', power: 77 },
    { name: 'Virtus Bologna', power: 76 },
    { name: 'Baskonia', power: 75 },
    { name: 'AS Monaco Basket', power: 78 },
    { name: 'Zalgiris Kaunas', power: 73 },
    { name: 'ALBA Berlin', power: 72 },
    { name: 'Crvena Zvezda', power: 74 },
    { name: 'Valencia Basket', power: 71 },
    { name: 'ASVEL Lyon-Villeurbanne', power: 70 },
  ],

  // ---- CRICKET ----
  cricket_ipl: [
    { name: 'Mumbai Indians', power: 90 },
    { name: 'Chennai Super Kings', power: 89 },
    { name: 'Royal Challengers Bangalore', power: 85 },
    { name: 'Kolkata Knight Riders', power: 83 },
    { name: 'Rajasthan Royals', power: 82 },
    { name: 'Delhi Capitals', power: 80 },
    { name: 'Sunrisers Hyderabad', power: 78 },
    { name: 'Punjab Kings', power: 75 },
    { name: 'Gujarat Titans', power: 84 },
    { name: 'Lucknow Super Giants', power: 79 },
  ],
};

// =====================================================================
// VIRTUAL MATCH ENGINE
// =====================================================================

/**
 * Generate realistic odds from power ratings.
 * Higher power diff → more lopsided odds.
 */
function generateOdds(homePower, awayPower, hasDrawMarket) {
  const diff = homePower - awayPower;
  // Convert power diff to implied probabilities
  const homeProb = 0.5 + (diff / 200) + (Math.random() * 0.08 - 0.04);
  const clampedHome = Math.min(0.85, Math.max(0.15, homeProb));

  let drawProb = 0;
  let awayProb;

  if (hasDrawMarket) {
    drawProb = 0.22 + (Math.random() * 0.08); // 22-30% draw chance
    awayProb = 1 - clampedHome - drawProb;
    if (awayProb < 0.08) {
      drawProb -= (0.08 - awayProb);
      awayProb = 0.08;
    }
  } else {
    awayProb = 1 - clampedHome;
  }

  // Convert probabilities to decimal odds, apply house edge
  const toOdds = (prob) => {
    const raw = 1 / Math.max(prob, 0.05);
    const edged = raw * (1 - HOUSE_EDGE);
    return Math.round(Math.max(edged, 1.05) * 100) / 100;
  };

  const outcomes = [
    { name: 'home', price: toOdds(clampedHome) },
    { name: 'away', price: toOdds(awayProb) },
  ];
  if (hasDrawMarket) {
    outcomes.splice(1, 0, { name: 'Draw', price: toOdds(drawProb) });
  }

  return { outcomes, homeProb: clampedHome, awayProb, drawProb };
}

/**
 * Predetermine the final score based on power ratings.
 * Uses weighted randomness so stronger teams win more often.
 */
function predetermineScore(homePower, awayPower, sport) {
  if (sport === 'Basketball') {
    // Basketball: scores 85-130
    const homeBase = 95 + (homePower / 10);
    const awayBase = 95 + (awayPower / 10);
    const home = Math.round(homeBase + (Math.random() * 20 - 10));
    const away = Math.round(awayBase + (Math.random() * 20 - 10));
    // No ties in basketball
    if (home === away) return { home: home + 1, away };
    return { home, away };
  }

  if (sport === 'Cricket') {
    // Cricket: simplified — runs 120-220
    const homeBase = 150 + (homePower / 5);
    const awayBase = 150 + (awayPower / 5);
    const home = Math.round(homeBase + (Math.random() * 50 - 25));
    const away = Math.round(awayBase + (Math.random() * 50 - 25));
    return { home, away };
  }

  // Football: scores 0-5, weighted by power
  const diff = homePower - awayPower;
  const homeStrength = 1.3 + (diff / 80) + (Math.random() * 0.6 - 0.3);
  const awayStrength = 1.3 - (diff / 80) + (Math.random() * 0.6 - 0.3);

  // Poisson-like distribution for goals
  const poissonGoals = (lambda) => {
    let L = Math.exp(-Math.max(lambda, 0.3));
    let k = 0;
    let p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return Math.min(k - 1, 6); // cap at 6
  };

  return {
    home: poissonGoals(homeStrength),
    away: poissonGoals(awayStrength),
  };
}

/**
 * Shuffle array in place
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate virtual matches for all leagues.
 * Called on server start and periodically.
 */
async function generateVirtualMatches() {
  // Clean up old upcoming/live matches to refresh the board
  await Event.deleteMany({
    status: { $in: ['upcoming'] },
    bookmaker: 'OmokaBet Virtual',
  });

  let totalCount = 0;
  const now = new Date();

  for (const sport of SUPPORTED_SPORTS) {
    const teams = TEAMS[sport.key];
    if (!teams || teams.length < 2) continue;

    const isFootball = sport.group === 'Football';
    const hasDrawMarket = isFootball;
    const matchesPerLeague = Math.min(Math.floor(teams.length / 2), 5);

    // Shuffle and pair teams
    const shuffled = shuffle([...teams]);
    const pairs = [];
    for (let i = 0; i < matchesPerLeague * 2 && i + 1 < shuffled.length; i += 2) {
      pairs.push([shuffled[i], shuffled[i + 1]]);
    }

    for (let i = 0; i < pairs.length; i++) {
      const [homeTeam, awayTeam] = pairs[i];

      // Stagger kick-off times: 3-60 min from now
      const minutesAhead = 3 + (i * 8) + Math.floor(Math.random() * 5);
      const commenceTime = new Date(now.getTime() + minutesAhead * 60000);

      // Virtual match duration: 3-5 minutes (fast for virtual)
      const matchDuration = 3 + Math.floor(Math.random() * 3);

      // Generate odds
      const { outcomes } = generateOdds(homeTeam.power, awayTeam.power, hasDrawMarket);

      // Set actual team names on outcomes
      outcomes[0].name = homeTeam.name;
      outcomes[outcomes.length - 1].name = awayTeam.name;

      // Predetermine the score
      const score = predetermineScore(homeTeam.power, awayTeam.power, sport.group);

      const externalId = `virt_${sport.key}_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;

      // Build markets array
      const markets = [{ key: 'h2h', lastUpdate: new Date(), outcomes }];

      // Additional markets for Football
      if (isFootball) {
        const totalGoals = score.home + score.away;

        // Over/Under 2.5
        const overProb = totalGoals > 2.5 ? 0.55 + Math.random() * 0.1 : 0.35 + Math.random() * 0.1;
        const underProb = 1 - overProb;
        const toOddsOU = (p) => Math.round(Math.max((1 / Math.max(p, 0.1)) * (1 - HOUSE_EDGE), 1.10) * 100) / 100;
        markets.push({
          key: 'totals',
          lastUpdate: new Date(),
          outcomes: [
            { name: 'Over 2.5', price: toOddsOU(overProb) },
            { name: 'Under 2.5', price: toOddsOU(underProb) },
          ],
        });

        // GG/NG (Both Teams To Score)
        const bothScore = score.home > 0 && score.away > 0;
        const ggProb = bothScore ? 0.55 + Math.random() * 0.08 : 0.35 + Math.random() * 0.1;
        const ngProb = 1 - ggProb;
        const toOddsGG = (p) => Math.round(Math.max((1 / Math.max(p, 0.1)) * (1 - HOUSE_EDGE), 1.10) * 100) / 100;
        markets.push({
          key: 'btts',
          lastUpdate: new Date(),
          outcomes: [
            { name: 'GG', price: toOddsGG(ggProb) },
            { name: 'NG', price: toOddsGG(ngProb) },
          ],
        });
      }

      await Event.create({
        externalId,
        sportKey: sport.key,
        sportTitle: sport.title,
        sportGroup: sport.group,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        commenceTime,
        status: 'upcoming',
        homeScore: null,
        awayScore: null,
        predeterminedHome: score.home,
        predeterminedAway: score.away,
        matchDuration,
        markets,
        bookmaker: 'OmokaBet Virtual',
        lastOddsUpdate: new Date(),
      });

      totalCount++;
    }
  }

  console.log(`[VIRTUAL] Generated ${totalCount} virtual matches across ${SUPPORTED_SPORTS.length} leagues`);
  return totalCount;
}

/**
 * Process virtual matches:
 * 1. upcoming → live (when commenceTime arrives)
 * 2. live → completed (when match duration elapses, apply predetermined scores)
 */
async function processVirtualMatches() {
  const now = new Date();
  let transitioned = 0;

  // 1. Upcoming → Live
  const readyToStart = await Event.find({
    status: 'upcoming',
    commenceTime: { $lte: now },
    bookmaker: 'OmokaBet Virtual',
  });

  for (const event of readyToStart) {
    event.status = 'live';
    event.homeScore = 0;
    event.awayScore = 0;
    await event.save();
    transitioned++;
  }

  // 2. Live → Completed (match duration elapsed)
  const liveMatches = await Event.find({
    status: 'live',
    bookmaker: 'OmokaBet Virtual',
  });

  for (const event of liveMatches) {
    const matchEnd = new Date(event.commenceTime.getTime() + event.matchDuration * 60000);
    if (now >= matchEnd) {
      event.status = 'completed';
      event.homeScore = event.predeterminedHome;
      event.awayScore = event.predeterminedAway;
      await event.save();
      transitioned++;
    } else {
      // Update live scores gradually (simulate in-progress)
      const elapsed = (now - event.commenceTime) / (event.matchDuration * 60000);
      const progress = Math.min(elapsed, 0.95);
      event.homeScore = Math.floor(event.predeterminedHome * progress);
      event.awayScore = Math.floor(event.predeterminedAway * progress);
      await event.save();
    }
  }

  if (transitioned > 0) {
    console.log(`[VIRTUAL] Transitioned ${transitioned} matches`);
  }

  return transitioned;
}

/**
 * Check if we need more upcoming matches and generate if needed
 */
async function ensureUpcomingMatches() {
  const upcomingCount = await Event.countDocuments({
    status: 'upcoming',
    bookmaker: 'OmokaBet Virtual',
  });

  // If less than 15 upcoming matches, generate more
  if (upcomingCount < 15) {
    console.log(`[VIRTUAL] Only ${upcomingCount} upcoming matches, generating more...`);
    await generateVirtualMatches();
  }
}

// Legacy compatibility
async function refreshOdds() {
  return generateVirtualMatches();
}

module.exports = {
  refreshOdds,
  generateVirtualMatches,
  processVirtualMatches,
  ensureUpcomingMatches,
  TEAMS,
};
