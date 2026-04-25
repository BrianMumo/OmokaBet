import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [type, setType] = useState('all');
  const [totals, setTotals] = useState({ deposits: 0, withdrawals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [page, type]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getTransactions({ page, limit: 25, type });
      setTransactions(data.transactions);
      setTotal(data.total);
      setPages(data.pages);
      setTotals(data.totals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Transactions ({total})</h1>
      </div>

      {/* Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V8M5 12l7-8 7 8"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">KES {totals.deposits?.toLocaleString()}</span>
            <span className="kpi-label">Total Deposits</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v14M5 12l7 8 7-8"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">KES {totals.withdrawals?.toLocaleString()}</span>
            <span className="kpi-label">Total Withdrawals</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">KES {(totals.deposits - totals.withdrawals)?.toLocaleString()}</span>
            <span className="kpi-label">Net</span>
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
          <option value="all">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="bet">Bets</option>
          <option value="win">Wins</option>
          <option value="cashout">Cashouts</option>
          <option value="bonus">Bonuses</option>
          <option value="refund">Refunds</option>
        </select>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Before</th>
                <th>After</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center text-muted">Loading...</td></tr>
              ) : transactions.length > 0 ? transactions.map(tx => (
                <tr key={tx._id}>
                  <td>{tx.userId?.username || '—'}</td>
                  <td>
                    <span className={`status-badge status-${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' ? 'completed' : tx.type === 'withdrawal' ? 'pending' : 'void'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' ? 'text-green' : 'text-red'}>
                    {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' ? '+' : '-'}KES {tx.amount?.toLocaleString()}
                  </td>
                  <td className="text-muted">KES {tx.balanceBefore?.toLocaleString()}</td>
                  <td>KES {tx.balanceAfter?.toLocaleString()}</td>
                  <td className="font-mono">{tx.reference || tx.mpesaReceiptNumber || '—'}</td>
                  <td><span className={`status-badge status-${tx.status}`}>{tx.status}</span></td>
                  <td className="text-muted">
                    {new Date(tx.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="text-center text-muted">No transactions found</td></tr>
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
