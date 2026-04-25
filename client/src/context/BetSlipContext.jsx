import { createContext, useContext, useState, useCallback } from 'react';

const BetSlipContext = createContext(null);

export function BetSlipProvider({ children }) {
  const [selections, setSelections] = useState([]);
  const [stake, setStake] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const addSelection = useCallback((selection) => {
    setSelections(prev => {
      // Check if same event already selected
      const existingIndex = prev.findIndex(s => s.eventId === selection.eventId);
      if (existingIndex >= 0) {
        // If same outcome, remove (toggle off)
        if (prev[existingIndex].outcomeName === selection.outcomeName) {
          return prev.filter((_, i) => i !== existingIndex);
        }
        // If different outcome on same event, replace
        const updated = [...prev];
        updated[existingIndex] = selection;
        return updated;
      }
      return [...prev, selection];
    });
    setIsOpen(true);
  }, []);

  const removeSelection = useCallback((eventId) => {
    setSelections(prev => prev.filter(s => s.eventId !== eventId));
  }, []);

  const clearSelections = useCallback(() => {
    setSelections([]);
    setStake('');
  }, []);

  const isSelected = useCallback((eventId, outcomeName) => {
    return selections.some(s => s.eventId === eventId && s.outcomeName === outcomeName);
  }, [selections]);

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const potentialWin = stake ? (parseFloat(stake) * totalOdds).toFixed(2) : '0.00';

  return (
    <BetSlipContext.Provider value={{
      selections,
      stake,
      isOpen,
      totalOdds: Math.round(totalOdds * 100) / 100,
      potentialWin,
      setStake,
      setIsOpen,
      addSelection,
      removeSelection,
      clearSelections,
      isSelected,
      selectionCount: selections.length,
    }}>
      {children}
    </BetSlipContext.Provider>
  );
}

export function useBetSlip() {
  const context = useContext(BetSlipContext);
  if (!context) throw new Error('useBetSlip must be used within BetSlipProvider');
  return context;
}
