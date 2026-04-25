import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import './LiveBetting.css';

export default function LiveBetting() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLive();
    const interval = setInterval(loadLive, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadLive = async () => {
    try {
      const { data } = await eventsAPI.getLive();
      setEvents(data.events);
    } catch (err) {
      console.error('Failed to load live events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="live-page">
      <div className="live-header">
        <h1><span className="badge badge-live">● LIVE</span> Live Betting</h1>
        <p className="text-muted">Bet on matches in real-time with live-updating odds</p>
      </div>

      {loading ? (
        <div className="events-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      ) : events.length > 0 ? (
        <div className="events-grid">
          {events.map(event => (
            <MatchCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="live-empty">
          <div className="live-empty-icon">📡</div>
          <h3>No Live Events</h3>
          <p>There are no live events at the moment. Check back soon or browse upcoming matches.</p>
        </div>
      )}
    </div>
  );
}
