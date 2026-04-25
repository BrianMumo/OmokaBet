import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, sportsAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import './Sports.css';

const SPORT_GROUPS = [
  { key: 'soccer_epl', title: 'Premier League', group: 'Football', icon: '⚽' },
  { key: 'soccer_spain_la_liga', title: 'La Liga', group: 'Football', icon: '⚽' },
  { key: 'soccer_germany_bundesliga', title: 'Bundesliga', group: 'Football', icon: '⚽' },
  { key: 'soccer_italy_serie_a', title: 'Serie A', group: 'Football', icon: '⚽' },
  { key: 'soccer_france_ligue_one', title: 'Ligue 1', group: 'Football', icon: '⚽' },
  { key: 'soccer_uefa_champs_league', title: 'Champions League', group: 'Football', icon: '⚽' },
  { key: 'basketball_nba', title: 'NBA', group: 'Basketball', icon: '🏀' },
  { key: 'basketball_euroleague', title: 'Euroleague', group: 'Basketball', icon: '🏀' },
  { key: 'tennis_atp_french_open', title: 'ATP French Open', group: 'Tennis', icon: '🎾' },
  { key: 'cricket_ipl', title: 'IPL', group: 'Cricket', icon: '🏏' },
];

export default function Sports() {
  const { sportKey } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeSport, setActiveSport] = useState(sportKey || '');

  useEffect(() => {
    loadEvents();
  }, [activeSport, filter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (activeSport) params.sport = activeSport;
      if (filter === 'today') params.date = 'today';
      else if (filter === 'tomorrow') params.date = 'tomorrow';
      else if (filter === 'week') params.date = 'week';

      const { data } = await eventsAPI.getAll(params);
      setEvents(data.events);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = search
    ? events.filter(e =>
        e.homeTeam.toLowerCase().includes(search.toLowerCase()) ||
        e.awayTeam.toLowerCase().includes(search.toLowerCase())
      )
    : events;

  // Group by sport
  const grouped = {};
  filteredEvents.forEach(e => {
    const key = e.sportTitle || e.sportKey;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <div className="sports-page">
      {/* Sidebar */}
      <aside className="sports-sidebar" id="sports-sidebar">
        <h3 className="sidebar-title">Sports</h3>
        <button
          className={`sidebar-item ${!activeSport ? 'active' : ''}`}
          onClick={() => setActiveSport('')}
        >
          <span>🏆</span> All Sports
        </button>
        {Object.entries(groupBy(SPORT_GROUPS, 'group')).map(([group, leagues]) => (
          <div key={group} className="sidebar-group">
            <div className="sidebar-group-title">{leagues[0].icon} {group}</div>
            {leagues.map(league => (
              <button
                key={league.key}
                className={`sidebar-item ${activeSport === league.key ? 'active' : ''}`}
                onClick={() => setActiveSport(league.key)}
              >
                {league.title}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <div className="sports-main">
        {/* Filters */}
        <div className="sports-toolbar">
          <div className="tab-nav sports-filter-tabs">
            {['all', 'today', 'tomorrow', 'week'].map(f => (
              <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'tomorrow' ? 'Tomorrow' : 'This Week'}
              </button>
            ))}
          </div>
          <div className="search-wrapper">
            <input type="text" className="form-input search-input" placeholder="🔍 Search teams..." value={search} onChange={e => setSearch(e.target.value)} id="search-teams" />
          </div>
        </div>

        {/* Odds Header */}
        <div className="odds-header">
          <span className="odds-header-match">Match</span>
          <div className="odds-header-labels">
            <span>1</span><span>X</span><span>2</span>
          </div>
        </div>

        {/* Events */}
        {loading ? (
          <div className="events-list">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton match-skeleton-row" />)}
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="events-list">
            {Object.entries(grouped).map(([title, events]) => (
              <div key={title} className="league-section">
                <div className="league-header">{title}</div>
                {events.map(event => (
                  <MatchCard key={event._id} event={event} compact />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No events found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}
