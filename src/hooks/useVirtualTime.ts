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
      
      const CYCLE_DURATION = 120 * 1000; // 120 seconds
      const ACTIVE_DURATION = 90 * 1000; // 90 seconds
      const SLOT_DURATION = 30 * 1000; // 30 seconds
      
      const cycleIndex = Math.floor(msSinceEpoch / CYCLE_DURATION);
      const msInCycle = msSinceEpoch % CYCLE_DURATION;
      
      const isPause = msInCycle >= ACTIVE_DURATION;
      const pauseRemainingMs = isPause ? CYCLE_DURATION - msInCycle : 0;
      
      const currentSlotIndex = isPause ? 3 : Math.floor(msInCycle / SLOT_DURATION);
      
      const cycleStartTime = cycleIndex * CYCLE_DURATION;
      
      const slots = [];
      for (let i = 0; i < 3; i++) {
        const slotStartTimeMs = cycleStartTime + i * SLOT_DURATION;
        const slotTime = new Date(slotStartTimeMs);
        const timeStr = `${slotTime.getHours().toString().padStart(2, '0')}:${slotTime.getMinutes().toString().padStart(2, '0')}:${slotTime.getSeconds().toString().padStart(2, '0')}`;
        
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
