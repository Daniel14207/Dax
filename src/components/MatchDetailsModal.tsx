import React from 'react';
import { X, Clock, ShieldAlert } from 'lucide-react';
import { getTeamLogo } from '../data';

interface MatchDetailsModalProps {
  match: any;
  onClose: () => void;
}

export function MatchDetailsModal({ match, onClose }: MatchDetailsModalProps) {
  if (!match) return null;

  const { league, homeTeam, awayTeam, homeScore, awayScore, isResult, isLive, isFuture, odds, slot, scoreSeed } = match;

  // Generate deterministic odds for other markets based on scoreSeed
  const genOdd = (base: number, variance: number, seedOffset: number) => {
    const pseudoRandom = ((scoreSeed + seedOffset) * 9301 + 49297) % 233280 / 233280;
    return (base + pseudoRandom * variance).toFixed(2);
  };

  const markets = [
    {
      title: "1X2 (Temps Réglementaire)",
      options: [
        { label: "1", odd: odds.home.toFixed(2) },
        { label: "X", odd: odds.draw.toFixed(2) },
        { label: "2", odd: odds.away.toFixed(2) }
      ]
    },
    {
      title: "Double Chance",
      options: [
        { label: "1X", odd: genOdd(1.1, 0.5, 1) },
        { label: "12", odd: genOdd(1.2, 0.3, 2) },
        { label: "X2", odd: genOdd(1.1, 0.5, 3) }
      ]
    },
    {
      title: "Total Buts (Plus/Moins 2.5)",
      options: [
        { label: "Plus de 2.5", odd: genOdd(1.6, 1.2, 4) },
        { label: "Moins de 2.5", odd: genOdd(1.5, 1.1, 5) }
      ]
    },
    {
      title: "Les deux équipes marquent (GG/NG)",
      options: [
        { label: "Oui (GG)", odd: genOdd(1.7, 0.8, 6) },
        { label: "Non (NG)", odd: genOdd(1.8, 0.9, 7) }
      ]
    },
    {
      title: "Mi-temps 1X2",
      options: [
        { label: "1", odd: genOdd(2.1, 1.5, 8) },
        { label: "X", odd: genOdd(1.9, 0.6, 9) },
        { label: "2", odd: genOdd(2.5, 1.8, 10) }
      ]
    },
    {
      title: "Total Buts (Plus/Moins 1.5)",
      options: [
        { label: "Plus de 1.5", odd: genOdd(1.2, 0.4, 11) },
        { label: "Moins de 1.5", odd: genOdd(2.8, 1.5, 12) }
      ]
    },
    {
      title: "Pair / Impair",
      options: [
        { label: "Pair", odd: genOdd(1.85, 0.1, 13) },
        { label: "Impair", odd: genOdd(1.85, 0.1, 14) }
      ]
    },
    {
      title: "Score Exact",
      options: [
        { label: "1-0", odd: genOdd(6.0, 3.0, 15) },
        { label: "0-0", odd: genOdd(8.0, 4.0, 16) },
        { label: "0-1", odd: genOdd(7.0, 3.5, 17) },
        { label: "2-0", odd: genOdd(8.5, 4.0, 18) },
        { label: "1-1", odd: genOdd(5.5, 2.0, 19) },
        { label: "0-2", odd: genOdd(9.5, 5.0, 20) }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-[#1e293b] rounded-xl w-full max-w-2xl border border-slate-700 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <img src={league.logo} alt={league.name} className="w-6 h-6 object-contain" />
            <h3 className="font-bold text-white">{league.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Info */}
        <div className="p-6 bg-slate-800/50 border-b border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-xs font-medium bg-slate-800 px-3 py-1.5 rounded-full text-slate-300 border border-slate-700">
              <Clock className="w-4 h-4 text-[#eab308]" />
              <span>{slot.time}</span>
            </div>
            {isResult && <span className="text-xs font-bold text-red-400 uppercase bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">Résultat Final</span>}
            {isLive && <span className="text-xs font-bold text-[#2dd4bf] uppercase bg-[#2dd4bf]/10 px-3 py-1.5 rounded-full border border-[#2dd4bf]/20 animate-pulse">Match en cours</span>}
            {isFuture && <span className="text-xs font-bold text-slate-400 uppercase bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">À venir</span>}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-col items-center gap-3">
              <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-16 h-16 object-contain drop-shadow-lg" />
              <span className="font-bold text-white text-lg text-center">{homeTeam}</span>
            </div>
            
            <div className="px-6 flex flex-col items-center justify-center">
              {isResult ? (
                <div className="text-4xl font-black text-white tracking-widest bg-slate-800 px-6 py-3 rounded-xl border-2 border-slate-700 shadow-inner">
                  {homeScore} - {awayScore}
                </div>
              ) : (
                <div className="text-slate-500 font-black text-2xl bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">VS</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center gap-3">
              <img src={getTeamLogo(awayTeam, league.id)} alt={awayTeam} className="w-16 h-16 object-contain drop-shadow-lg" />
              <span className="font-bold text-white text-lg text-center">{awayTeam}</span>
            </div>
          </div>
        </div>

        {/* Betting Markets */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {markets.map((market, idx) => (
            <div key={idx} className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700/50">
                <h4 className="font-semibold text-slate-300 text-sm">{market.title}</h4>
              </div>
              <div className={`grid gap-px bg-slate-700/50 ${market.options.length > 3 ? 'grid-cols-2 sm:grid-cols-3' : `grid-cols-${market.options.length}`}`}>
                {market.options.map((opt, oIdx) => (
                  <div key={oIdx} className="bg-[#1e293b] p-3 flex justify-between items-center hover:bg-slate-800 transition-colors cursor-pointer group">
                    <span className="text-sm text-slate-400 group-hover:text-slate-300">{opt.label}</span>
                    <span className="font-bold text-[#eab308]">{opt.odd}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
