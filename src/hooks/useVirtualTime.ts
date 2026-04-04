import { useState, useEffect } from 'react';

export interface VirtualTimeState {
  currentTime: Date;
  cycleIndex: number;
  msInCycle: number;
  isLive: boolean; // 0-30s
  slots: { time: string; isPast: boolean; isCurrent: boolean; isFuture: boolean; cycleOffset: number }[];
}

export function useVirtualTime() {
  const [state, setState] = useState<VirtualTimeState | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      const msSinceStartOfDay = now.getTime() - startOfDay.getTime();
      const CYCLE_DURATION = 90000; // 90 seconds
      const LIVE_DURATION = 30000; // 30 seconds
      
      const cycleIndex = Math.floor(msSinceStartOfDay / CYCLE_DURATION);
      const msInCycle = msSinceStartOfDay % CYCLE_DURATION;
      
      const isLive = msInCycle < LIVE_DURATION;
      
      const slots = [];
      // Generate slots: past 5, current, future 10
      for (let i = -5; i <= 10; i++) {
        const slotCycle = cycleIndex + i;
        const virtualMinutes = slotCycle * 2;
        
        const slotTime = new Date(startOfDay.getTime() + virtualMinutes * 60000);
        const slotH = slotTime.getHours();
        const slotM = slotTime.getMinutes();
        const timeStr = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeStr,
          isPast: i < 0 || (i === 0 && !isLive),
          isCurrent: i === 0 && isLive,
          isFuture: i > 0,
          cycleOffset: i
        });
      }

      setState({
        currentTime: now,
        cycleIndex,
        msInCycle,
        isLive,
        slots
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
