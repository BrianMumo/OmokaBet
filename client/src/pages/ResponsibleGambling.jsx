import { Link } from 'react-router-dom';
import './Legal.css';

export default function ResponsibleGambling() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>🎯 Responsible Gambling</h1>
        <p className="legal-updated">OmokaBet is committed to promoting responsible gambling</p>

        <div className="rg-alert">
          <strong>⚠️ Gambling should be fun, not a source of stress.</strong>
          <p>If you feel that gambling is becoming a problem, please reach out for help.</p>
        </div>

        <section>
          <h2>Know the Signs</h2>
          <p>You may have a gambling problem if you:</p>
          <ul>
            <li>Spend more money or time gambling than you can afford.</li>
            <li>Chase losses by increasing your bets.</li>
            <li>Borrow money or sell possessions to gamble.</li>
            <li>Neglect work, school, family, or personal needs because of gambling.</li>
            <li>Feel anxious, stressed, or depressed about gambling.</li>
            <li>Lie to family or friends about your gambling habits.</li>
          </ul>
        </section>

        <section>
          <h2>Tools to Stay in Control</h2>
          <div className="rg-tools">
            <div className="rg-tool-card">
              <span className="rg-tool-icon">💰</span>
              <h3>Deposit Limits</h3>
              <p>Set daily, weekly, or monthly deposit limits to control your spending. Contact support to set up limits.</p>
            </div>
            <div className="rg-tool-card">
              <span className="rg-tool-icon">⏸️</span>
              <h3>Take a Break</h3>
              <p>Request a temporary timeout from your account for 24 hours, 7 days, or 30 days.</p>
            </div>
            <div className="rg-tool-card">
              <span className="rg-tool-icon">🚫</span>
              <h3>Self-Exclusion</h3>
              <p>Permanently exclude yourself from the platform. Contact support to arrange this.</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Tips for Safe Gambling</h2>
          <ul>
            <li>Set a budget before you start and stick to it.</li>
            <li>Only gamble with money you can afford to lose.</li>
            <li>Never chase your losses.</li>
            <li>Take regular breaks.</li>
            <li>Don't gamble when upset, stressed, or under the influence.</li>
            <li>Balance gambling with other activities.</li>
          </ul>
        </section>

        <section>
          <h2>Get Help</h2>
          <p>If you or someone you know has a gambling problem, contact:</p>
          <div className="rg-contacts">
            <div className="rg-contact">
              <strong>Betting Control & Licensing Board (BCLB)</strong>
              <p>📞 +254 20 271 3493</p>
              <p>📧 info@bclb.go.ke</p>
            </div>
            <div className="rg-contact">
              <strong>OmokaBet Support</strong>
              <p>📧 support@omokabet.ke</p>
            </div>
          </div>
        </section>

        <div className="legal-nav">
          <Link to="/terms" className="btn btn-ghost btn-sm">Terms & Conditions →</Link>
          <Link to="/privacy" className="btn btn-ghost btn-sm">Privacy Policy →</Link>
        </div>
      </div>
    </div>
  );
}
