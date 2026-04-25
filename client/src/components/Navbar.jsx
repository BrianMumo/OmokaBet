import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBetSlip } from '../context/BetSlipContext';
import WalletModal from './WalletModal';
import './Navbar.css';

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const SportsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>
);
const LiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
);
const TicketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v6a3 3 0 01-3 3H5a3 3 0 01-3-3z"/><path d="M9 6v12"/><path d="M15 6v12"/></svg>
);
const BetSlipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { selectionCount, setIsOpen } = useBetSlip();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home', icon: <HomeIcon /> },
    { to: '/sports', label: 'Sports', icon: <SportsIcon /> },
    { to: '/live', label: 'Live', icon: <LiveIcon />, badge: 'LIVE' },
    { to: '/my-bets', label: 'My Bets', icon: <TicketIcon /> },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" id="brand-logo">
            <img src="/logo.png" alt="OmokaBet" className="logo-icon" />
            <span className="logo-text">
              <span className="logo-omoka">Omoka</span>
              <span className="logo-bet">Bet</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar-links">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
                {link.badge && <span className="nav-badge">{link.badge}</span>}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="navbar-right">
            {isAuthenticated ? (
              <>
                {/* Balance */}
                <button className="balance-btn" onClick={() => setWalletOpen(true)} id="wallet-btn">
                  <span className="balance-label">KES</span>
                  <span className="balance-amount">{(user?.balance || 0).toLocaleString()}</span>
                  <span className="balance-deposit">+</span>
                </button>

                {/* Bet Slip Toggle (Mobile) */}
                <button
                  className="betslip-toggle-btn"
                  onClick={() => setIsOpen(prev => !prev)}
                  id="betslip-toggle"
                >
                  <BetSlipIcon />
                  {selectionCount > 0 && (
                    <span className="betslip-count">{selectionCount}</span>
                  )}
                </button>

                {/* User Menu */}
                <div className="user-menu-wrapper">
                  <button
                    className="user-btn"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    id="user-menu-btn"
                  >
                    <span className="user-avatar">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="user-dropdown" id="user-dropdown">
                      <div className="dropdown-header">
                        <span className="dropdown-username">{user?.username}</span>
                        <span className="dropdown-email">{user?.email}</span>
                      </div>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item" onClick={() => { setWalletOpen(true); setUserMenuOpen(false); }}>
                        💰 Wallet
                      </button>
                      <button className="dropdown-item" onClick={() => { navigate('/my-bets'); setUserMenuOpen(false); }}>
                        📋 My Bets
                      </button>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item dropdown-logout" onClick={() => { logout(); setUserMenuOpen(false); }}>
                        ↪ Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-btns">
                <Link to="/auth" className="btn btn-ghost btn-sm" id="login-btn">
                  Log In
                </Link>
                <Link to="/auth?mode=register" className="btn btn-primary btn-sm" id="register-btn">
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Hamburger (tablet only) */}
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              id="hamburger-menu"
            >
              <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tablet slide-down Menu */}
        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-link ${isActive(link.to) ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>{link.icon}</span>
                {link.label}
                {link.badge && <span className="nav-badge">{link.badge}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ===== MOBILE BOTTOM TAB BAR ===== */}
      <div className="bottom-tab-bar" id="bottom-tabs">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`bottom-tab ${isActive(link.to) ? 'active' : ''}`}
          >
            <span className="bottom-tab-icon">{link.icon}</span>
            <span className="bottom-tab-label">{link.label}</span>
            {link.badge && <span className="nav-badge">{link.badge}</span>}
          </Link>
        ))}
        {/* Bet Slip tab */}
        <button
          className={`bottom-tab ${selectionCount > 0 ? 'active' : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span className="bottom-tab-icon"><BetSlipIcon /></span>
          <span className="bottom-tab-label">Slip</span>
          {selectionCount > 0 && (
            <span className="nav-badge" style={{ position: 'absolute', top: 2, right: 'calc(50% - 18px)' }}>
              {selectionCount}
            </span>
          )}
        </button>
      </div>

      {/* Wallet Modal */}
      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="dropdown-overlay" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
