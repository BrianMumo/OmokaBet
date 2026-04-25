import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({
    phone: '', password: '', identifier: '',
    referralCode: searchParams.get('ref') || '',
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.identifier, form.password);
        toast.success('Welcome back!');
      } else {
        await register({ phone: form.phone, password: form.password, referralCode: form.referralCode });
        toast.success('Account created! Welcome to OmokaBet 🎰');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" id="auth-form">
        <div className="auth-header">
          <img src="/logo.png" alt="OmokaBet" className="auth-logo" />
          <h1>{mode === 'login' ? 'Welcome Back' : 'Join OmokaBet'}</h1>
          <p className="text-muted">{mode === 'login' ? 'Sign in to your account' : 'Enter your phone number to get started'}</p>
        </div>

        <div className="tab-nav auth-tabs">
          <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Log In</button>
          <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-input" placeholder="0712345678" value={form.phone} onChange={handleChange} required id="reg-phone" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required minLength={6} id="reg-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Referral Code <span className="text-muted" style={{fontWeight:400, fontSize:'0.8em'}}>(optional)</span></label>
                <input type="text" name="referralCode" className="form-input" placeholder="e.g. OMKAB1CD" value={form.referralCode} onChange={handleChange} id="reg-referral" />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="identifier" className="form-input" placeholder="0712345678" value={form.identifier} onChange={handleChange} required id="login-identifier" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input" placeholder="Enter your password" value={form.password} onChange={handleChange} required id="login-password" />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} id="auth-submit-btn">
            {loading ? '⏳ Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>Don't have an account? <button className="link-btn" onClick={() => setMode('register')}>Register now</button></p>
          ) : (
            <p>Already have an account? <button className="link-btn" onClick={() => setMode('login')}>Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
