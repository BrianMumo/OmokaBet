import { Link } from 'react-router-dom';
import './Legal.css';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <h1>Terms & Conditions</h1>
        <p className="legal-updated">Last updated: April 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using OmokaBet ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Platform.</p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>You must be at least <strong>18 years of age</strong> to use OmokaBet. By registering, you confirm that you are of legal gambling age in Kenya. OmokaBet reserves the right to request proof of age at any time.</p>
        </section>

        <section>
          <h2>3. Account Registration</h2>
          <p>Each user may maintain only one account. Providing false or misleading information during registration is prohibited and may result in account suspension. You are responsible for maintaining the confidentiality of your login credentials.</p>
        </section>

        <section>
          <h2>4. Deposits & Withdrawals</h2>
          <ul>
            <li>Deposits are processed via M-Pesa and credited instantly upon confirmation.</li>
            <li>Minimum deposit: KES 10. Maximum deposit: KES 150,000.</li>
            <li>Minimum withdrawal: KES 100. Maximum withdrawal: KES 70,000 per transaction.</li>
            <li>Withdrawals are processed to the registered M-Pesa number within 1-5 minutes.</li>
            <li>OmokaBet reserves the right to verify identity before processing withdrawals.</li>
          </ul>
        </section>

        <section>
          <h2>5. Betting Rules</h2>
          <ul>
            <li>All bets are final once placed and confirmed.</li>
            <li>Minimum bet stake: KES 50. Maximum bet stake: KES 500,000.</li>
            <li>Maximum payout per bet: KES 1,000,000.</li>
            <li>OmokaBet reserves the right to void bets placed in error or resulting from technical malfunctions.</li>
            <li>Cash-out is available on pending bets at OmokaBet's discretion.</li>
          </ul>
        </section>

        <section>
          <h2>6. Prohibited Activities</h2>
          <p>Users may not: use automated systems or bots, exploit technical errors, collude with other users, use funds from illegal sources, or attempt to manipulate odds or outcomes.</p>
        </section>

        <section>
          <h2>7. Account Suspension</h2>
          <p>OmokaBet reserves the right to suspend or terminate accounts that violate these terms, engage in suspicious activity, or fail identity verification.</p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>OmokaBet is not liable for losses arising from service interruptions, technical failures, or events beyond our control. Use of the Platform is at your own risk.</p>
        </section>

        <section>
          <h2>9. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:support@omokabet.ke">support@omokabet.ke</a>.</p>
        </section>

        <div className="legal-nav">
          <Link to="/privacy" className="btn btn-ghost btn-sm">Privacy Policy →</Link>
          <Link to="/responsible-gambling" className="btn btn-ghost btn-sm">Responsible Gambling →</Link>
        </div>
      </div>
    </div>
  );
}
