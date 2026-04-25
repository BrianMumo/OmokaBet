import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { load(); }, [page, status]);

  // Auto-refresh every 15 seconds for live updates
  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [page, status]);

  const load = async () => {
    try {
      const { data } = await adminAPI.getEvents({ page, limit: 25, status });
      setEvents(data.events);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await adminAPI.generateEvents();
      alert(`Generated ${data.count} new virtual matches`);
      load();
    } catch (err) {
      alert('Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  // Determine the winner text for display
  const getResultText = (ev) => {
    const h = ev.predeterminedHome;
    const a = ev.predeterminedAway;
    if (h === null || a === null) return '—';
    if (h > a) return ev.homeTeam;
    if (a > h) return ev.awayTeam;
    return 'Draw';
  };

  const getResultClass = (ev) => {
    const h = ev.predeterminedHome;
    const a = ev.predeterminedAway;
    if (h === null) return '';
    if (h > a) return 'text-green';
    if (a > h) return 'text-red';
    return 'text-gold';
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Virtual Events ({total})</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : '+ Generate Matches'}
        </button>
      </div>

      <div className="admin-toolbar">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>League</th>
                <th>Live Score</th>
                <th>Predetermined Result</th>
                <th>Winner</th>
                <th>Status</th>
                <th>Kick-off</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center text-muted">Loading...</td></tr>
              ) : events.length > 0 ? events.map(ev => (
                <tr key={ev._id}>
                  <td>
                    <div style={{ lineHeight: 1.5 }}>
                      <strong>{ev.homeTeam}</strong>
                      <span className="text-muted"> vs </span>
                      <strong>{ev.awayTeam}</strong>
                    </div>
                  </td>
                  <td className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{ev.sportTitle}</td>
                  <td>
                    {ev.status === 'live' || ev.status === 'completed'
                      ? <span className="font-bold">{ev.homeScore} - {ev.awayScore}</span>
                      : <span className="text-muted">—</span>
                    }
                  </td>
                  <td>
                    <span className="font-mono" style={{
                      padding: '4px 10px',
                      background: 'rgba(245, 158, 11, 0.06)',
                      border: '1px solid rgba(245, 158, 11, 0.12)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--gold-500)',
                      fontWeight: 700,
                    }}>
                      {ev.predeterminedHome ?? '?'} - {ev.predeterminedAway ?? '?'}
                    </span>
                  </td>
                  <td className={getResultClass(ev)} style={{ fontWeight: 700 }}>
                    {getResultText(ev)}
                  </td>
                  <td><span className={`status-badge status-${ev.status}`}>{ev.status}</span></td>
                  <td className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>
                    {new Date(ev.commenceTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                    <br />
                    <span style={{ fontSize: 'var(--fs-2xs)' }}>
                      {ev.matchDuration}min
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center text-muted">No events found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
