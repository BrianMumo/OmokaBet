import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

export default function AdminBets() {
  const [bets, setBets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [page, status]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getBets({ page, limit: 25, status });
      setBets(data.bets);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (betId, newStatus) => {
    if (!confirm(`Mark this bet as ${newStatus}?`)) return;
    try {
      await adminAPI.settleBet(betId, { status: newStatus });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to settle');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Bets ({total})</h1>
      </div>

      <div className="admin-toolbar">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="cashout">Cashout</option>
          <option value="void">Void</option>
        </select>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>User</th>
                <th>Type</th>
                <th>Selections</th>
                <th>Stake</th>
                <th>Odds</th>
                <th>Pot. Win</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center text-muted">Loading...</td></tr>
              ) : bets.length > 0 ? bets.map(bet => (
                <tr key={bet._id}>
                  <td className="font-mono">{bet.betCode}</td>
                  <td>{bet.userId?.username || '—'}</td>
                  <td>{bet.type}</td>
                  <td>{bet.selections?.length}</td>
                  <td>KES {bet.stake?.toLocaleString()}</td>
                  <td className="text-green">{bet.totalOdds?.toFixed(2)}</td>
                  <td className="text-gold">KES {bet.potentialWin?.toLocaleString()}</td>
                  <td><span className={`status-badge status-${bet.status}`}>{bet.status}</span></td>
                  <td className="text-muted">
                    {new Date(bet.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    {bet.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--green-400)', border: '1px solid rgba(16,185,129,0.2)' }} onClick={() => handleSettle(bet._id, 'won')}>Won</button>
                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red-500)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleSettle(bet._id, 'lost')}>Lost</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleSettle(bet._id, 'void')}>Void</button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="10" className="text-center text-muted">No bets found</td></tr>
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
