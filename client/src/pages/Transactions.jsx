import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { walletAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Transactions.css';

const TYPE_ICONS = {
  deposit: '💰',
  withdrawal: '💸',
  bet: '🎯',
  win: '🏆',
  cashout: '💵',
  bonus: '🎁',
  refund: '↩️',
};

const TYPE_COLORS = {
  deposit: 'green',
  win: 'green',
  bonus: 'green',
  cashout: 'gold',
  refund: 'blue',
  bet: 'red',
  withdrawal: 'red',
};

export default function Transactions() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return; }
    loadTransactions();
  }, [isAuthenticated, filter, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter !== 'all') params.type = filter;
      const { data } = await walletAPI.getTransactions(params);
      setTransactions(data.transactions);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filterOptions = ['all', 'deposit', 'withdrawal', 'bet', 'win', 'bonus'];

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1 className="transactions-title">📊 Transaction History</h1>
        <p className="text-muted">View all your deposits, withdrawals, bets, and winnings</p>
      </div>

      <div className="transactions-filters">
        {filterOptions.map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f === 'all' ? '🔄 All' : `${TYPE_ICONS[f] || ''} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="txn-list">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
        </div>
      ) : transactions.length > 0 ? (
        <>
          <div className="txn-list">
            {transactions.map(txn => (
              <div key={txn._id} className="txn-card" id={`txn-${txn._id}`}>
                <div className="txn-icon-wrapper">
                  <span className={`txn-icon txn-${TYPE_COLORS[txn.type] || 'default'}`}>
                    {TYPE_ICONS[txn.type] || '📄'}
                  </span>
                </div>
                <div className="txn-details">
                  <div className="txn-type">{txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}</div>
                  <div className="txn-desc">{txn.description || txn.reference}</div>
                  <div className="txn-date">{formatDate(txn.createdAt)}</div>
                </div>
                <div className="txn-amount-col">
                  <span className={`txn-amount ${txn.amount >= 0 ? 'positive' : 'negative'}`}>
                    {txn.amount >= 0 ? '+' : ''}{txn.amount.toLocaleString()} KES
                  </span>
                  <span className="txn-balance">Bal: {txn.balanceAfter?.toLocaleString() || '—'}</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>← Prev</button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No transactions found for this filter.</p>
        </div>
      )}
    </div>
  );
}
