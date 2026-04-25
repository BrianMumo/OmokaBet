import { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen({ onFinished }) {
  const [phase, setPhase] = useState('enter'); // enter → hold → exit

  useEffect(() => {
    // Phase 1: Logo animates in (already via CSS)
    // Phase 2: Hold for a moment
    const holdTimer = setTimeout(() => setPhase('exit'), 1800);
    // Phase 3: Fade out and call onFinished
    const exitTimer = setTimeout(() => onFinished(), 2500);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onFinished]);

  return (
    <div className={`splash-screen ${phase}`}>
      {/* Ambient glow */}
      <div className="splash-glow" />

      {/* Logo */}
      <div className="splash-logo-wrapper">
        <img src="/logo.png" alt="OmokaBet" className="splash-logo" />
        <div className="splash-ring" />
      </div>

      {/* Brand text */}
      <div className="splash-brand">
        <span className="splash-omoka">Omoka</span>
        <span className="splash-bet">Bet</span>
      </div>

      {/* Tagline */}
      <p className="splash-tagline">Bet Big, Win Bigger</p>

      {/* Loading bar */}
      <div className="splash-loader">
        <div className="splash-loader-bar" />
      </div>
    </div>
  );
}
