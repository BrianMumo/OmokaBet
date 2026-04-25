import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { betsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './MyBets.css';

export default function MyBets() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [bets, setBets] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    loadBets();
  }, [isAuthenticated, tab]);

  const loadBets = async () => {
    setLoading(true);
    try {
      const { data } = await betsAPI.getAll({ status: tab, limit: 50 });
      setBets(data.bets);
    } catch (err) {
      console.error('Failed to load bets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async (betId) => {
    try {
      const { data } = await betsAPI.cashout(betId);
      toast.success(`Cashed out KES ${data.cashoutAmount}`);
      loadBets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cashout failed');
    }
  };

  const getStatusClass = (status) => {
    const map = { pending: 'badge-pending', won: 'badge-green', lost: 'badge-live', cashout: 'badge-gold', void: '' };
    return map[status] || '';
  };

  return (
    <div className="mybets-page">
      <h1 className="mybets-title">🎫 My Bets</h1>

      <div className="tab-nav">
        {['all', 'active', 'settled'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bets-list">{[1,2,3].map(i => <div key={i} className="skeleton" style={{height:120}} />)}</div>
      ) : bets.length > 0 ? (
        <div className="bets-list">
          {bets.map(bet => (
            <div key={bet._id} className={`bet-card status-${bet.status}`} id={`bet-${bet._id}`}>
              <div className="bet-header">
                <div>
                  <span className="bet-code">{bet.betCode}</span>
                  <span className={`badge ${getStatusClass(bet.status)}`}>{bet.status.toUpperCase()}</span>
                </div>
                <span className="bet-date">{new Date(bet.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="bet-selections">
                {bet.selections.map((sel, i) => (
                  <div key={i} className={`bet-selection ${sel.result}`}>
                    <div className="sel-teams">{sel.homeTeam} vs {sel.awayTeam}</div>
                    <div className="sel-pick">
                      <span className="sel-outcome">{sel.outcomeName}</span>
                      <span className="sel-odds">{sel.odds.toFixed(2)}</span>
                    </div>
                    {sel.result !== 'pending' && (
                      <span className={`sel-result ${sel.result}`}>{sel.result === 'won' ? '✅' : sel.result === 'lost' ? '❌' : '⚪'}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="bet-footer">
                <div className="bet-amounts">
                  <span>Stake: <strong>KES {bet.stake.toLocaleString()}</strong></span>
                  <span>Odds: <strong className="text-green">{bet.totalOdds.toFixed(2)}</strong></span>
                  <span>Win: <strong className="text-gold">KES {bet.potentialWin.toLocaleString()}</strong></span>
                </div>
                {bet.status === 'pending' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleCashout(bet._id)}>
                    💰 Cashout
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No bets found. Start betting to see your history!</p>
        </div>
      )}
    </div>
  );
}
