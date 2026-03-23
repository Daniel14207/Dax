import { useState, useEffect } from 'react';

export interface VirtualTimeState {
  currentTime: Date;
  cycleStartMinutes: number;
  minutesInCycle: number;
  isBreak: boolean;
  currentSlotIndex: number;
  slots: { time: string; isPast: boolean; isCurrent: boolean; isFuture: boolean }[];
}

export function useVirtualTime() {
  const [state, setState] = useState<VirtualTimeState | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      
      const cycleIndex = Math.floor(totalMinutes / 45);
      const cycleStartMinutes = cycleIndex * 45;
      const minutesInCycle = totalMinutes - cycleStartMinutes;
      
      const isBreak = minutesInCycle >= 40;
      const currentSlotIndex = isBreak ? 19 : Math.floor(minutesInCycle / 2);
      
      const slots = [];
      for (let i = 0; i < 20; i++) {
        const slotMinutes = cycleStartMinutes + i * 2;
        const slotH = Math.floor(slotMinutes / 60) % 24;
        const slotM = slotMinutes % 60;
        const timeStr = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeStr,
          isPast: i < currentSlotIndex,
          isCurrent: i === currentSlotIndex && !isBreak,
          isFuture: i > currentSlotIndex || isBreak
        });
      }

      setState({
        currentTime: now,
        cycleStartMinutes,
        minutesInCycle,
        isBreak,
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
