import { Link } from 'react-router-dom';
import './Legal.css';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <ul>
            <li><strong>Account Information:</strong> Phone number, username, and password (hashed).</li>
            <li><strong>Transaction Data:</strong> Deposit and withdrawal amounts, M-Pesa transaction receipts, bet history.</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, device type, and IP address.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To operate and maintain your account and process transactions.</li>
            <li>To process deposits and withdrawals via M-Pesa.</li>
            <li>To settle bets and credit winnings.</li>
            <li>To detect and prevent fraud, money laundering, and underage gambling.</li>
            <li>To send important account notifications (e.g., bet outcomes, deposits).</li>
            <li>To improve our services and user experience.</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Sharing</h2>
          <p>We do not sell your personal data. We may share information with:</p>
          <ul>
            <li><strong>Safaricom (M-Pesa):</strong> To process mobile money transactions.</li>
            <li><strong>Regulatory Bodies:</strong> When required by Kenyan law or the BCLB.</li>
            <li><strong>Service Providers:</strong> For hosting, analytics, and security purposes.</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and secure server infrastructure. However, no system is 100% secure.</p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>Account and transaction data is retained for the duration of your account and for a period of 5 years after closure, as required by Kenyan financial regulations.</p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request account deletion (subject to regulatory requirements).</li>
          </ul>
          <p>To exercise these rights, contact <a href="mailto:support@omokabet.ke">support@omokabet.ke</a>.</p>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>We use essential cookies and local storage to maintain your session and preferences. No third-party advertising cookies are used.</p>
        </section>

        <div className="legal-nav">
          <Link to="/terms" className="btn btn-ghost btn-sm">Terms & Conditions →</Link>
          <Link to="/responsible-gambling" className="btn btn-ghost btn-sm">Responsible Gambling →</Link>
        </div>
      </div>
    </div>
  );
}
