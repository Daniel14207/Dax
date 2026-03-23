import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(); // This acts as goToLogin()
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-black flex justify-center font-sans">
      <div className="w-full max-w-md bg-[#0f172a] min-h-screen flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-[#2dd4bf] mb-4">Betting Tips</h1>
          <div className="w-16 h-16 border-4 border-[#eab308] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-slate-400 font-medium">Chargement en cours...</p>
        </motion.div>
      </div>
    </div>
  );
}
