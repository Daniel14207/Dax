import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

function Asteroid({ startX, startY, delay = 0, duration = 2.5, angle }: { startX: string, startY: string, delay?: number, duration?: number, angle: number }) {
  return (
    <motion.div
      className="absolute"
      initial={{ x: startX, y: startY, scale: 0.5, opacity: 0 }}
      animate={{ 
        x: "0vw", 
        y: "0vh", 
        scale: [0.5, 1.2, 1],
        opacity: [0, 1, 1]
      }}
      transition={{ 
        duration: duration, 
        delay: delay, 
        ease: "easeIn" 
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Trail */}
        <div 
          className="absolute w-64 h-2 left-1/2 rounded-full bg-gradient-to-r from-white via-orange-500 to-transparent opacity-80 blur-[1px]"
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'left center' }}
        />
        {/* Core */}
        <div className="w-4 h-4 rounded-full bg-white z-10 shadow-[0_0_15px_5px_rgba(255,255,255,0.9)]" />
        {/* Glow */}
        <div className="absolute w-12 h-12 rounded-full bg-orange-500 blur-xl opacity-80" />
        <div className="absolute w-24 h-24 rounded-full bg-red-600 blur-2xl opacity-40" />
      </div>
    </motion.div>
  );
}

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'falling' | 'explosion' | 'text'>('falling');

  useEffect(() => {
    // Timings
    const t1 = setTimeout(() => setPhase('explosion'), 2500); // Asteroids hit center
    const t2 = setTimeout(() => setPhase('text'), 2800);      // Explosion begins fading, text appears
    const t3 = setTimeout(() => onComplete(), 10000);         // Total duration 10 seconds

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black flex items-center justify-center">
      {/* Subtle Sunrise Glow Background */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 4 }}
        style={{
          background: 'radial-gradient(circle at center bottom, rgba(120, 20, 0, 0.4) 0%, rgba(0, 0, 0, 1) 70%)'
        }}
      />
      
      {/* Asteroids (Phase 1) */}
      {phase === 'falling' && (
        <>
          <Asteroid startX="-60vw" startY="-80vh" delay={0} duration={2.5} angle={-145} />
          <Asteroid startX="0vw" startY="-100vh" delay={0.2} duration={2.3} angle={-90} />
          <Asteroid startX="60vw" startY="-80vh" delay={0.4} duration={2.1} angle={-35} />
        </>
      )}

      {/* Merge Explosion */}
      {(phase === 'explosion' || phase === 'text') && (
        <motion.div
           className="absolute z-20 rounded-full bg-white mix-blend-screen"
           initial={{ width: 0, height: 0, opacity: 1, filter: 'blur(0px)' }}
           animate={{ 
             width: ['0vw', '100vw', '150vw'], 
             height: ['0vw', '100vw', '150vw'],
             opacity: [1, 0.8, 0],
             filter: ['blur(10px)', 'blur(50px)', 'blur(100px)']
           }}
           transition={{ duration: 2, ease: "easeOut" }}
        />
      )}

      {/* Main Title and Subtitle */}
      {phase === 'text' && (
        <div className="relative flex flex-col items-center justify-center z-30">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-9xl font-black text-transparent bg-clip-text text-center tracking-tighter"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #DC2626, #22C55E, #DC2626)',
              WebkitTextStroke: '1px rgba(255,255,255,0.2)',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))',
              backgroundSize: '200% auto'
            }}
            initial={{ scale: 0.3, opacity: 0, backgroundPosition: '0% center' }}
            animate={{ 
              scale: [0.3, 1.05, 1], 
              opacity: 1,
              backgroundPosition: ['0% center', '200% center']
            }}
            transition={{ 
              duration: 2, 
              scale: { ease: "easeOut", duration: 1.5 },
              backgroundPosition: { duration: 5, repeat: Infinity, ease: "linear" }
            }}
          >
            PRONOSTIC
            <br />
            VITAL
          </motion.h1>
          
          {/* Continuous Glow Pulse on Title */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
            animate={{ 
              boxShadow: [
                'inset 0 0 0px rgba(220, 38, 38, 0)', 
                'inset 0 0 50px rgba(34, 197, 94, 0.2)', 
                'inset 0 0 0px rgba(220, 38, 38, 0)'
              ] 
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.p
            className="mt-8 text-sm md:text-lg lg:text-xl font-medium text-gray-200 uppercase tracking-[0.4em] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          >
            Analyse à profond sur Bet261
          </motion.p>
        </div>
      )}
    </div>
  );
}
