import { useState, useEffect } from 'react';

export interface VirtualTimeState {
  currentTime: Date;
  cycleIndex: number;
  msInCycle: number;
  isPause: boolean;
  pauseRemainingMs: number;
  currentSlotIndex: number;
  slots: { time: string; isPast: boolean; isCurrent: boolean; isFuture: boolean; cycleOffset: number; slotTimeMs: number }[];
}

export function useVirtualTime() {
  const [state, setState] = useState<VirtualTimeState | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const msSinceEpoch = now.getTime();
      
      const CYCLE_DURATION = 45 * 60 * 1000; // 45 minutes
      const ACTIVE_DURATION = 40 * 60 * 1000; // 40 minutes (20 slots of 2 min)
      const SLOT_DURATION = 2 * 60 * 1000; // 2 minutes
      
      const cycleIndex = Math.floor(msSinceEpoch / CYCLE_DURATION);
      const msInCycle = msSinceEpoch % CYCLE_DURATION;
      
      const isPause = msInCycle >= ACTIVE_DURATION;
      const pauseRemainingMs = isPause ? CYCLE_DURATION - msInCycle : 0;
      
      const currentSlotIndex = isPause ? 20 : Math.floor(msInCycle / SLOT_DURATION);
      
      const cycleStartTime = cycleIndex * CYCLE_DURATION;
      
      const slots = [];
      for (let i = 0; i < 20; i++) {
        const slotStartTimeMs = cycleStartTime + i * SLOT_DURATION;
        const slotTime = new Date(slotStartTimeMs);
        const timeStr = `${slotTime.getHours().toString().padStart(2, '0')}:${slotTime.getMinutes().toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeStr,
          isPast: !isPause && i < currentSlotIndex,
          isCurrent: !isPause && i === currentSlotIndex,
          isFuture: isPause || i > currentSlotIndex,
          cycleOffset: i,
          slotTimeMs: slotStartTimeMs
        });
      }

      setState({
        currentTime: now,
        cycleIndex,
        msInCycle,
        isPause,
        pauseRemainingMs,
        currentSlotIndex,
        slots
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
