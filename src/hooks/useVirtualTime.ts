import { useState, useEffect } from 'react';

export interface VirtualTimeState {
  currentTime: Date;
  liveTime: Date;
  cycleIndex: number;
  msInCycle: number;
  showResult: boolean;
  slots: { time: string; isPast: boolean; isCurrent: boolean; isFuture: boolean; cycleOffset: number; showResult: boolean; matchTime: Date }[];
}

export function useVirtualTime() {
  const [state, setState] = useState<VirtualTimeState | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const liveTime = new Date(now.getTime() + 2 * 60000); // device_time + 2 minutes
      
      const CYCLE_DURATION = 90000; // 90 seconds
      const RESULT_DELAY = 30000; // 30 seconds
      
      const cycleIndex = Math.floor(now.getTime() / CYCLE_DURATION);
      const msInCycle = now.getTime() % CYCLE_DURATION;
      
      const showResult = msInCycle >= RESULT_DELAY;
      
      const slots = [];
      // Generate slots: past 20, current, future 10
      for (let i = -20; i <= 10; i++) {
        const slotCycle = cycleIndex + i;
        const slotRealTimeStart = slotCycle * CYCLE_DURATION;
        const slotMatchTime = new Date(slotRealTimeStart + 2 * 60000);
        
        const slotH = slotMatchTime.getHours();
        const slotM = slotMatchTime.getMinutes();
        const timeStr = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeStr,
          isPast: i < 0,
          isCurrent: i === 0,
          isFuture: i > 0,
          cycleOffset: i,
          showResult: i < 0 || (i === 0 && showResult),
          matchTime: slotMatchTime
        });
      }

      setState({
        currentTime: now,
        liveTime,
        cycleIndex,
        msInCycle,
        showResult,
        slots
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
