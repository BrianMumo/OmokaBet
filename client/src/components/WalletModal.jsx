import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { walletAPI } from '../services/api';
import './WalletModal.css';

export default function WalletModal({ onClose }) {
  const { user, refreshBalance } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      if (tab === 'deposit') {
        const { data } = await walletAPI.deposit({ amount: parseFloat(amount), method: 'mpesa' });
        toast.success(data.message);
      } else {
        const { data } = await walletAPI.withdraw({ amount: parseFloat(amount), phone });
        toast.success(data.message);
      }
      await refreshBalance();
      setAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || `${tab} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal wallet-modal" id="wallet-modal">
        <div className="modal-header">
          <h2 className="modal-title">💰 Wallet</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="wallet-balance-display">
          <span className="wallet-balance-label">Available Balance</span>
          <span className="wallet-balance-value">KES {(user?.balance || 0).toLocaleString()}</span>
        </div>

        <div className="tab-nav">
          <button className={`tab-btn ${tab === 'deposit' ? 'active' : ''}`} onClick={() => setTab('deposit')}>Deposit</button>
          <button className={`tab-btn ${tab === 'withdraw' ? 'active' : ''}`} onClick={() => setTab('withdraw')}>Withdraw</button>
        </div>

        <div className="quick-amounts">
          {quickAmounts.map(a => (
            <button key={a} className={`quick-amount-btn ${amount === a.toString() ? 'active' : ''}`} onClick={() => setAmount(a.toString())}>
              {a >= 1000 ? `${a/1000}K` : a}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Amount (KES)</label>
          <input type="number" className="form-input" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} id="wallet-amount-input" />
        </div>

        {tab === 'withdraw' && (
          <div className="form-group">
            <label className="form-label">M-Pesa Phone Number</label>
            <input type="text" className="form-input" placeholder="0712345678" value={phone} onChange={e => setPhone(e.target.value)} id="wallet-phone-input" />
          </div>
        )}

        <div className="wallet-info">
          {tab === 'deposit' ? (
            <p>📱 An M-Pesa STK push will be sent to your registered phone number. Enter your PIN to complete.</p>
          ) : (
            <p>💸 Funds will be sent to the M-Pesa number above within 1-5 minutes.</p>
          )}
        </div>

        <button className={`btn btn-block btn-lg ${tab === 'deposit' ? 'btn-primary' : 'btn-gold'}`} onClick={handleSubmit} disabled={loading} id="wallet-submit-btn">
          {loading ? '⏳ Processing...' : tab === 'deposit' ? `Deposit KES ${amount || '0'}` : `Withdraw KES ${amount || '0'}`}
        </button>
      </div>
    </>
  );
}
