import { useState } from 'react';
import { useBetSlip } from '../context/BetSlipContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { betsAPI } from '../services/api';
import './BetSlip.css';

const SlipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);

export default function BetSlip() {
  const {
    selections, stake, setStake, isOpen, setIsOpen,
    totalOdds, potentialWin, removeSelection, clearSelections, selectionCount
  } = useBetSlip();
  const { isAuthenticated, user, updateBalance } = useAuth();
  const toast = useToast();
  const [placing, setPlacing] = useState(false);

  const quickStakes = [100, 200, 500, 1000, 2000, 5000];

  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to place a bet');
      return;
    }
    if (selections.length === 0) {
      toast.error('Add at least one selection');
      return;
    }
    if (!stake || parseFloat(stake) < 50) {
      toast.error('Minimum bet is KES 50');
      return;
    }
    if (parseFloat(stake) > (user?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setPlacing(true);
    try {
      const { data } = await betsAPI.place({
        selections: selections.map(s => ({
          eventId: s.eventId,
          market: s.market,
          outcomeName: s.outcomeName,
        })),
        stake: parseFloat(stake),
      });

      updateBalance(data.balance);
      clearSelections();
      setIsOpen(false);
      toast.success(`Bet placed! Code: ${data.bet.betCode} — Potential win: KES ${data.bet.potentialWin.toLocaleString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bet');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      {/* Floating Action Button — always visible when selections exist */}
      {selectionCount > 0 && !isOpen && (
        <button
          className="betslip-fab"
          onClick={() => setIsOpen(true)}
          id="betslip-fab"
        >
          <span className="betslip-fab-icon"><SlipIcon /></span>
          Bet Slip
          <span className="betslip-fab-count">{selectionCount}</span>
        </button>
      )}

      {/* Overlay */}
      {isOpen && <div className="betslip-overlay" onClick={() => setIsOpen(false)} />}

      {/* Slide-in Panel */}
      <div className={`betslip ${isOpen ? 'open' : ''}`} id="bet-slip">
        <div className="betslip-header">
          <h3 className="betslip-title">
            🎫 Bet Slip
            {selectionCount > 0 && (
              <span className="betslip-badge">{selectionCount}</span>
            )}
          </h3>
          <button className="betslip-close-btn" onClick={() => setIsOpen(false)} id="close-betslip">✕</button>
        </div>

        {selections.length === 0 ? (
          <div className="betslip-empty">
            <div className="empty-icon">🎯</div>
            <p>Click on odds to add selections</p>
          </div>
        ) : (
          <div className="betslip-content">
            {/* Selections */}
            <div className="betslip-selections">
              {selections.map(sel => (
                <div key={sel.eventId} className="selection-card" id={`selection-${sel.eventId}`}>
                  <div className="selection-header">
                    <span className="selection-outcome">{sel.outcomeName}</span>
                    <button className="selection-remove" onClick={() => removeSelection(sel.eventId)}>✕</button>
                  </div>
                  <div className="selection-match">
                    {sel.homeTeam} vs {sel.awayTeam}
                  </div>
                  <div className="selection-details">
                    <span className="selection-market">Match Result</span>
                    <span className="selection-odds">{sel.odds.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stake Input */}
            <div className="betslip-stake">
              <div className="stake-label-row">
                <span className="stake-label">Stake (KES)</span>
                {selections.length > 1 && (
                  <span className="stake-type">Accumulator × {totalOdds.toFixed(2)}</span>
                )}
              </div>
              <input
                type="number"
                className="form-input stake-input"
                placeholder="Enter stake"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                min="50"
                id="stake-input"
              />
              <div className="quick-stakes">
                {quickStakes.map(amount => (
                  <button
                    key={amount}
                    className="quick-stake-btn"
                    onClick={() => setStake(amount.toString())}
                  >
                    {amount >= 1000 ? `${amount / 1000}K` : amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="betslip-summary">
              <div className="summary-row">
                <span>Total Odds</span>
                <span className="text-green font-bold">{totalOdds.toFixed(2)}</span>
              </div>
              <div className="summary-row potential-win">
                <span>Potential Win</span>
                <span className="text-gold font-bold">KES {parseFloat(potentialWin).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="betslip-actions">
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handlePlaceBet}
                disabled={placing || !stake}
                id="place-bet-btn"
              >
                {placing ? '⏳ Placing...' : `Place Bet — KES ${stake || '0'}`}
              </button>
              <button className="btn btn-ghost btn-block btn-sm" onClick={clearSelections}>
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
