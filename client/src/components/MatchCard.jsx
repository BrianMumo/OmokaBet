import { useState } from 'react';
import { useBetSlip } from '../context/BetSlipContext';
import './MatchCard.css';

const MARKET_LABELS = {
  h2h: '1X2',
  totals: 'O/U 2.5',
  btts: 'GG/NG',
};

export default function MatchCard({ event, compact = false }) {
  const { addSelection, isSelected } = useBetSlip();
  const [activeMarket, setActiveMarket] = useState('h2h');

  if (!event) return null;

  const availableMarkets = event.markets?.map(m => m.key) || ['h2h'];
  const currentMarket = event.markets?.find(m => m.key === activeMarket) || event.markets?.[0];
  const outcomes = currentMarket?.outcomes || [];
  const isLive = event.status === 'live';
  const isLocked = event.status === 'completed';

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const time = date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === now.toDateString()) return `Today ${time}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`;
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) + ` ${time}`;
  };

  const handleOddsClick = (outcome) => {
    if (isLocked) return;
    addSelection({
      eventId: event._id,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      market: activeMarket,
      outcomeName: outcome.name,
      odds: outcome.price,
      sportKey: event.sportKey,
      commenceTime: event.commenceTime,
    });
  };

  // Determine labels: 1, X, 2 for football h2h; 1, 2 for others
  const getLabel = (index, total, marketKey) => {
    if (marketKey === 'totals') return ['O 2.5', 'U 2.5'][index];
    if (marketKey === 'btts') return ['GG', 'NG'][index];
    if (total === 3) return ['1', 'X', '2'][index];
    return ['1', '2'][index];
  };

  return (
    <div className={`match-card ${compact ? 'compact' : ''} ${isLive ? 'live' : ''}`} id={`match-${event._id}`}>
      {/* Match Header */}
      <div className="match-header">
        <span className="match-league">{event.sportTitle}</span>
        <div className="match-time-wrapper">
          {isLive ? (
            <span className="badge badge-live">● LIVE</span>
          ) : (
            <span className="match-time">{formatTime(event.commenceTime)}</span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="match-teams">
        <div className="team-row">
          <span className="team-name">{event.homeTeam}</span>
          {isLive && <span className="team-score">{event.homeScore ?? '-'}</span>}
        </div>
        <div className="team-row">
          <span className="team-name">{event.awayTeam}</span>
          {isLive && <span className="team-score">{event.awayScore ?? '-'}</span>}
        </div>
      </div>

      {/* Market Tabs — only show if multiple markets */}
      {availableMarkets.length > 1 && (
        <div className="market-tabs">
          {availableMarkets.map(key => (
            <button
              key={key}
              className={`market-tab ${activeMarket === key ? 'active' : ''}`}
              onClick={() => setActiveMarket(key)}
            >
              {MARKET_LABELS[key] || key}
            </button>
          ))}
        </div>
      )}

      {/* Odds — locked when completed */}
      {outcomes.length > 0 && (
        <div className={`match-odds ${isLocked ? 'locked' : ''}`}>
          {isLocked ? (
            <div className="odds-locked-msg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Betting Closed
            </div>
          ) : (
            outcomes.map((outcome, idx) => (
              <button
                key={outcome.name}
                className={`odds-btn ${isSelected(event._id, outcome.name) ? 'selected' : ''}`}
                onClick={() => handleOddsClick(outcome)}
                id={`odds-${event._id}-${outcome.name}`}
              >
                <span className="odds-label">{getLabel(idx, outcomes.length, activeMarket)}</span>
                <span className="odds-value">{outcome.price.toFixed(2)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
