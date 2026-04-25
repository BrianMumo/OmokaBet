import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creditModal, setCreditModal] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDesc, setCreditDesc] = useState('');

  useEffect(() => { load(); }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 25, search: search || undefined });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCredit = async () => {
    if (!creditAmount) return;
    try {
      await adminAPI.creditUser(creditModal._id, {
        amount: parseFloat(creditAmount),
        description: creditDesc || 'Admin adjustment',
      });
      setCreditModal(null);
      setCreditAmount('');
      setCreditDesc('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.username} to ${newRole}?`)) return;
    try {
      await adminAPI.updateUser(user._id, { role: newRole });
      load();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  let searchTimer;
  const handleSearch = (val) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Users ({total})</h1>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, phone, email..."
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Phone</th>
                <th>Balance</th>
                <th>Bets</th>
                <th>Won</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center text-muted">Loading...</td></tr>
              ) : users.length > 0 ? users.map(u => (
                <tr key={u._id}>
                  <td className="font-bold">{u.username}</td>
                  <td>{u.phone}</td>
                  <td>KES {u.balance?.toLocaleString()}</td>
                  <td>{u.totalBets || 0}</td>
                  <td className="text-green">KES {(u.totalWon || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${u.role === 'admin' ? 'status-live' : 'status-completed'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-muted">
                    {new Date(u.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setCreditModal(u)}>Credit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(u)}>
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="text-center text-muted">No users found</td></tr>
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

      {/* Credit Modal */}
      {creditModal && (
        <>
          <div className="modal-backdrop" onClick={() => setCreditModal(null)} />
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Credit / Debit</h2>
              <button className="modal-close" onClick={() => setCreditModal(null)}>✕</button>
            </div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Adjusting balance for <strong>{creditModal.username}</strong> (current: KES {creditModal.balance?.toLocaleString()})
            </p>
            <div className="form-group">
              <label className="form-label">Amount (positive = credit, negative = debit)</label>
              <input type="number" className="form-input" placeholder="e.g. 500 or -200" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input type="text" className="form-input" placeholder="Bonus, correction, etc." value={creditDesc} onChange={e => setCreditDesc(e.target.value)} />
            </div>
            <div className="admin-modal-actions">
              <button className="btn btn-primary btn-block" onClick={handleCredit}>Apply</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
