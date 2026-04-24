import { useState, useEffect } from 'react';

export interface VirtualTimeState {
  currentTime: Date;
  liveTime: Date;
  cycleIndex: number;
  msInCycle: number;
  showResult: boolean;
  slots: { time: string; isPast: boolean; isCurrent: boolean; isFuture: boolean; cycleOffset: number; showResult: boolean; matchTime: Date; matchMinute?: number; remainingSeconds?: number }[];
  isPaused: boolean;
}

export function useVirtualTime() {
  const [state, setState] = useState<VirtualTimeState | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Total cycle = 100 seconds
      const CYCLE_DURATION = 100 * 1000;
      
      const currentTimeMs = now.getTime();
      const msInCycle = currentTimeMs % CYCLE_DURATION;
      const cycleIndex = Math.floor(currentTimeMs / CYCLE_DURATION);
      
      // Phase 1: LIVE MATCH (0 to 29 seconds)
      const isLivePhase = msInCycle < 30000;
      
      // Phase 2: BETTING (ODDS) (30 to 100 seconds)
      const isBettingPhase = msInCycle >= 30000;
      
      // At 27-29 seconds -> FREEZE RESULT
      const showResult = isLivePhase && msInCycle >= 27000;
      
      // Animate time progression 0' -> 90'
      const matchMinute = isLivePhase ? Math.min(90, Math.floor((msInCycle / 27000) * 90)) : undefined;
      
      // Countdown for betting phase
      const remainingSeconds = Math.ceil((100000 - msInCycle) / 1000);

      const cycleStartTime = cycleIndex * CYCLE_DURATION;
      const slots = [];
      
      // Generate slots: 5 past, current, 15 future
      for (let i = -5; i <= 15; i++) {
        const slotRealTimeStart = cycleStartTime + i * CYCLE_DURATION;
        const slotMatchTime = new Date(slotRealTimeStart);
        
        const slotH = slotMatchTime.getHours();
        const slotM = slotMatchTime.getMinutes();
        const timeStr = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;
        
        const isPast = i < 0;
        const isCurrentSlot = i === 0;
        const isFutureSlot = i > 0;

        slots.push({
          time: timeStr,
          isPast,
          // Only truly "current/Live" if it's slot 0 and we're in live phase
          isCurrent: isCurrentSlot && isLivePhase,
          // It's in the "future/betting" state if it's a future slot natively, OR if it's the current slot but in the betting phase
          isFuture: isFutureSlot || (isCurrentSlot && isBettingPhase),
          cycleOffset: i,
          showResult: isPast || (isCurrentSlot && showResult),
          matchTime: slotMatchTime,
          matchMinute: isCurrentSlot ? matchMinute : undefined,
          // Add remainingSeconds only to the slot that currently holds the countdown (slot 0 in betting phase)
          // Actually, let's just supply the countdown timer to the CURRENT slot if it's in betting phase
          remainingSeconds: (isCurrentSlot && isBettingPhase) ? remainingSeconds : undefined
        });
      }

      setState({
        currentTime: now,
        liveTime: now,
        cycleIndex,
        msInCycle,
        showResult,
        slots,
        isPaused: false
      });
    };

    updateTime();
    // Update every 100ms or so for smooth matchMinute progression
    const interval = setInterval(updateTime, 100); 
    return () => clearInterval(interval);
  }, []);

  return state;
}
