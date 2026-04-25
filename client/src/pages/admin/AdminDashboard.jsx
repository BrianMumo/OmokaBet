import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './Admin.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: res } = await adminAPI.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>
      <div className="kpi-grid">
        {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  const s = data?.stats || {};

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <button className="btn btn-outline btn-sm" onClick={load}>Refresh</button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{s.totalUsers?.toLocaleString()}</span>
            <span className="kpi-label">Total Users</span>
          </div>
          <span className="kpi-sub">+{s.todayUsers} today</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">KES {s.totalRevenue?.toLocaleString()}</span>
            <span className="kpi-label">Net Revenue</span>
          </div>
          <span className="kpi-sub">Deposits - Withdrawals</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{s.activeBets?.toLocaleString()}</span>
            <span className="kpi-label">Active Bets</span>
          </div>
          <span className="kpi-sub">{s.totalBets?.toLocaleString()} total</span>
        </div>

        <div className="kpi-card">
          <div className={`kpi-icon ${s.todayPnl >= 0 ? 'kpi-green' : 'kpi-red'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div className="kpi-data">
            <span className={`kpi-value ${s.todayPnl >= 0 ? 'text-green' : 'text-red'}`}>
              KES {s.todayPnl?.toLocaleString()}
            </span>
            <span className="kpi-label">Today's P&L</span>
          </div>
          <span className="kpi-sub">Staked vs Paid</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V8M5 12l7-8 7 8"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">KES {s.todayDeposits?.toLocaleString()}</span>
            <span className="kpi-label">Today Deposits</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v14M5 12l7 8 7-8"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">KES {s.todayWithdrawals?.toLocaleString()}</span>
            <span className="kpi-label">Today Withdrawals</span>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="admin-tables-row">
        {/* Recent Bets */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3>Recent Bets</h3>
            <Link to="/admin/bets" className="section-action">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>User</th>
                  <th>Stake</th>
                  <th>Odds</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentBets?.map(bet => (
                  <tr key={bet._id}>
                    <td className="font-mono">{bet.betCode}</td>
                    <td>{bet.userId?.username || '—'}</td>
                    <td>KES {bet.stake?.toLocaleString()}</td>
                    <td className="text-green">{bet.totalOdds?.toFixed(2)}</td>
                    <td><span className={`status-badge status-${bet.status}`}>{bet.status}</span></td>
                  </tr>
                ))}
                {(!data?.recentBets || data.recentBets.length === 0) && (
                  <tr><td colSpan="5" className="text-center text-muted">No bets yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3>New Users</h3>
            <Link to="/admin/users" className="section-action">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentUsers?.map(u => (
                  <tr key={u._id}>
                    <td className="font-bold">{u.username}</td>
                    <td>{u.phone}</td>
                    <td>KES {u.balance?.toLocaleString()}</td>
                    <td className="text-muted">{new Date(u.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
                {(!data?.recentUsers || data.recentUsers.length === 0) && (
                  <tr><td colSpan="4" className="text-center text-muted">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
