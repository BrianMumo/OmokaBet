import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, sportsAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import './Home.css';

const sportIcons = {
  Football: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>
  ),
  Basketball: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/><path d="M19.07 4.93L4.93 19.07"/></svg>
  ),
  Tennis: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/></svg>
  ),
  Cricket: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
  ),
  Rugby: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="7"/><path d="M2 12h20"/></svg>
  ),
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featuredRes, liveRes, sportsRes] = await Promise.allSettled([
        eventsAPI.getFeatured(),
        eventsAPI.getLive(),
        sportsAPI.getAll(),
      ]);
      if (featuredRes.status === 'fulfilled') setFeatured(featuredRes.value.data.events);
      if (liveRes.status === 'fulfilled') setLiveEvents(liveRes.value.data.events);
      if (sportsRes.status === 'fulfilled') setSports(sportsRes.value.data.sports);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const defaultSports = [
    { name: 'Football', icon: '⚽', leagues: [{},{},{},{},{}] },
    { name: 'Basketball', icon: '🏀', leagues: [{},{}] },
    { name: 'Tennis', icon: '🎾', leagues: [{}] },
    { name: 'Cricket', icon: '🏏', leagues: [{}] },
    { name: 'Rugby', icon: '🏉', leagues: [{}] },
  ];

  const sportsList = sports.length > 0 ? sports : defaultSports;

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero" id="hero-banner">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-mesh" />
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge-pill">
              <span className="hero-badge-dot" />
              Kenya's #1 Betting Platform
            </div>
            <h1 className="hero-headline">
              Bet Big,<br />
              <span className="hero-headline-accent">Win Bigger.</span>
            </h1>
            <p className="hero-desc">
              Best odds on Premier League, Champions League & more.
              Instant M-Pesa deposits & cashouts.
            </p>
            <div className="hero-buttons">
              <Link to="/sports" className="btn btn-primary btn-lg hero-cta-btn">
                <span>Start Betting</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/live" className="btn btn-outline btn-lg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="#ef4444"/><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" opacity="0.3"/></svg>
                Live Matches
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-wrapper">
              <img src="/winner.png" alt="OmokaBet Winner Celebrating" className="hero-winner-img" />
              <div className="hero-float-badge hero-float-1">
                <span className="hero-float-icon">🏆</span>
                <div>
                  <span className="hero-float-value">KES 124,500</span>
                  <span className="hero-float-label">Won Today</span>
                </div>
              </div>
              <div className="hero-float-badge hero-float-2">
                <span className="hero-float-icon">⚡</span>
                <div>
                  <span className="hero-float-value">98%</span>
                  <span className="hero-float-label">Payout Rate</span>
                </div>
              </div>
              <div className="hero-float-badge hero-float-3">
                <span className="hero-float-icon">🔥</span>
                <div>
                  <span className="hero-float-value">1,000+</span>
                  <span className="hero-float-label">Daily Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPORT CATEGORIES ===== */}
      <section className="section" id="sport-categories">
        <div className="section-top">
          <h2 className="section-heading">
            Popular Sports
          </h2>
        </div>
        <div className="sport-carousel">
          {sportsList.map((sport, i) => (
            <Link
              to={`/sports/${sport.leagues?.[0]?.key || ''}`}
              key={sport.name}
              className="sport-tile"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="sport-tile-icon">
                {sportIcons[sport.name] || <span style={{ fontSize: '1.5rem' }}>{sport.icon}</span>}
              </div>
              <span className="sport-tile-name">{sport.name}</span>
              <span className="sport-tile-count">{sport.leagues?.length || 0} leagues</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== LIVE NOW ===== */}
      {liveEvents.length > 0 && (
        <section className="section" id="live-section">
          <div className="section-top">
            <h2 className="section-heading">
              <span className="live-dot" />
              Live Now
            </h2>
            <Link to="/live" className="section-action">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="match-grid">
            {liveEvents.slice(0, 6).map((event, i) => (
              <div key={event._id} style={{ animationDelay: `${i * 80}ms` }} className="animate-slide-up">
                <MatchCard event={event} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURED ===== */}
      <section className="section" id="featured-section">
        <div className="section-top">
          <h2 className="section-heading">
            Featured Matches
          </h2>
          <Link to="/sports" className="section-action">
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        {loading ? (
          <div className="match-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 190, borderRadius: 16 }} />)}
          </div>
        ) : featured.length > 0 ? (
          <div className="match-grid">
            {featured.map((event, i) => (
              <div key={event._id} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-up">
                <MatchCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No featured matches right now.</p>
            <Link to="/sports" className="btn btn-outline btn-sm">Browse All Sports</Link>
          </div>
        )}
      </section>

      {/* ===== PROMO ===== */}
      <section className="promo" id="promo-section">
        <div className="promo-glow" />
        <div className="promo-content">
          <div className="promo-tag">LIMITED OFFER</div>
          <h2 className="promo-headline">
            Get a <span className="text-gold">100% Deposit Bonus</span>
          </h2>
          <p className="promo-desc">
            Register today and get up to <strong>KES 10,000</strong> in bonus funds on your first deposit.
          </p>
          <Link to="/auth?mode=register" className="btn btn-gold btn-lg">Claim Your Bonus</Link>
        </div>
      </section>
    </div>
  );
}
