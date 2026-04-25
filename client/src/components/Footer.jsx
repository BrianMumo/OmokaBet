import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo"><span className="logo-omoka">Omoka</span><span className="logo-bet">Bet</span></span>
          <p className="footer-tagline">Bet Big, Win Bigger</p>
          <p className="footer-disclaimer">OmokaBet is a licensed sports betting platform. Must be 18+ to participate. Gambling can be addictive — please play responsibly.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/sports">Sports</Link>
            <Link to="/live">Live Betting</Link>
            <Link to="/my-bets">My Bets</Link>
            <Link to="/transactions">Transactions</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/responsible-gambling">Responsible Gambling</Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:support@omokabet.ke">support@omokabet.ke</a>
            <a href="tel:+254700000000">+254 700 000 000</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 OmokaBet. All rights reserved.</span>
        <span>18+</span>
      </div>
    </footer>
  );
}
