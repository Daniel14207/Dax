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
      title: "Mi-temps 1X2 (HT 1X2)",
      options: [
        { label: "1", odd: genOdd(2.1, 1.5, 8) },
        { label: "X", odd: genOdd(1.9, 0.6, 9) },
        { label: "2", odd: genOdd(2.5, 1.8, 10) }
      ]
    },
    {
      title: "Double Chance (DC)",
      options: [
        { label: "1X", odd: genOdd(1.1, 0.5, 1) },
        { label: "12", odd: genOdd(1.2, 0.3, 2) },
        { label: "X2", odd: genOdd(1.1, 0.5, 3) }
      ]
    },
    {
      title: "Double Chance Mi-temps (HT DC)",
      options: [
        { label: "1X", odd: genOdd(1.05, 0.4, 21) },
        { label: "12", odd: genOdd(1.3, 0.4, 22) },
        { label: "X2", odd: genOdd(1.15, 0.4, 23) }
      ]
    },
    {
      title: "Score Exact (CS)",
      options: [
        { label: "1-0", odd: genOdd(6.0, 3.0, 15) },
        { label: "0-0", odd: genOdd(8.0, 4.0, 16) },
        { label: "0-1", odd: genOdd(7.0, 3.5, 17) },
        { label: "2-0", odd: genOdd(8.5, 4.0, 18) },
        { label: "1-1", odd: genOdd(5.5, 2.0, 19) },
        { label: "0-2", odd: genOdd(9.5, 5.0, 20) }
      ]
    },
    {
      title: "Plus/Moins (O/U)",
      options: [
        { label: "O 1.5", odd: genOdd(1.2, 0.4, 11) },
        { label: "U 1.5", odd: genOdd(2.8, 1.5, 12) },
        { label: "O 2.5", odd: genOdd(1.6, 1.2, 4) },
        { label: "U 2.5", odd: genOdd(1.5, 1.1, 5) }
      ]
    },
    {
      title: "Les deux marquent (GG/NG)",
      options: [
        { label: "Oui (GG)", odd: genOdd(1.7, 0.8, 6) },
        { label: "Non (NG)", odd: genOdd(1.8, 0.9, 7) }
      ]
    },
    {
      title: "Mi-temps / Fin (HT/FT)",
      options: [
        { label: "1/1", odd: genOdd(2.5, 1.5, 24) },
        { label: "X/1", odd: genOdd(4.5, 2.0, 25) },
        { label: "2/2", odd: genOdd(3.5, 2.0, 26) },
        { label: "X/X", odd: genOdd(4.0, 1.5, 27) }
      ]
    },
    {
      title: "Total Buts Équipe (Team Totals)",
      options: [
        { label: "Home O 1.5", odd: genOdd(1.8, 1.0, 28) },
        { label: "Home U 1.5", odd: genOdd(1.6, 0.8, 29) },
        { label: "Away O 1.5", odd: genOdd(2.2, 1.2, 30) },
        { label: "Away U 1.5", odd: genOdd(1.4, 0.6, 31) }
      ]
    },
    {
      title: "Pair / Impair (Odd/Even)",
      options: [
        { label: "Pair", odd: genOdd(1.85, 0.1, 13) },
        { label: "Impair", odd: genOdd(1.85, 0.1, 14) }
      ]
    },
    {
      title: "Minute 1er But (First Goal Min)",
      options: [
        { label: "1-15", odd: genOdd(2.8, 1.0, 32) },
        { label: "16-30", odd: genOdd(3.5, 1.0, 33) },
        { label: "31-45", odd: genOdd(4.5, 1.5, 34) },
        { label: "Pas de but", odd: genOdd(8.0, 4.0, 16) }
      ]
    },
    {
      title: "Multi-buts (Multi-goals)",
      options: [
        { label: "1-2", odd: genOdd(1.9, 0.5, 35) },
        { label: "1-3", odd: genOdd(1.4, 0.3, 36) },
        { label: "2-3", odd: genOdd(1.9, 0.4, 37) },
        { label: "2-4", odd: genOdd(1.5, 0.3, 38) }
      ]
    },
    {
      title: "1ère Équipe à Marquer (FTTS)",
      options: [
        { label: "Home", odd: genOdd(1.6, 0.6, 39) },
        { label: "Away", odd: genOdd(2.1, 0.8, 40) },
        { label: "Aucun", odd: genOdd(8.0, 4.0, 16) }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-[#1e293b] rounded-xl w-full max-w-2xl border border-slate-700 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
            <h3 className="font-bold text-white text-sm">{league.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Info */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium bg-slate-800 px-2 py-1 rounded-full text-slate-300 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-[#eab308]" />
              <span>{slot.time}</span>
            </div>
            {isResult && <span className="text-[11px] font-bold text-red-400 uppercase bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">Résultat Final</span>}
            {isLive && <span className="text-[11px] font-bold text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 animate-pulse">RÉSULTAT</span>}
            {isFuture && <span className="text-[11px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-1 rounded-full border border-slate-700">Prédiction</span>}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-12 h-12 object-contain drop-shadow-lg" />
              <span className="font-bold text-white text-sm text-center leading-tight">{homeTeam}</span>
            </div>
            
            <div className="px-4 flex flex-col items-center justify-center">
              {(isResult || isLive) ? (
                <div className="text-2xl font-black text-white tracking-widest bg-slate-800 px-4 py-2 rounded-xl border-2 border-slate-700 shadow-inner">
                  {homeScore} - {awayScore}
                </div>
              ) : (
                <div className="text-slate-500 font-black text-xl bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">VS</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(awayTeam, league.id)} alt={awayTeam} className="w-12 h-12 object-contain drop-shadow-lg" />
              <span className="font-bold text-white text-sm text-center leading-tight">{awayTeam}</span>
            </div>
          </div>
        </div>

        {/* Betting Markets */}
        <div className="p-3 overflow-y-auto flex-1 space-y-3">
          {markets.map((market, idx) => (
            <div key={idx} className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="bg-slate-800/80 px-3 py-1.5 border-b border-slate-700/50">
                <h4 className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">{market.title}</h4>
              </div>
              <div className={`grid gap-px bg-slate-700/50 ${market.options.length > 3 ? (market.options.length % 3 === 0 ? 'grid-cols-3' : 'grid-cols-2') : `grid-cols-${market.options.length}`}`}>
                {market.options.map((opt, oIdx) => (
                  <div key={oIdx} className="bg-[#1e293b] p-2 flex justify-between items-center hover:bg-slate-800 transition-colors cursor-pointer group">
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-300">{opt.label}</span>
                    <span className="font-bold text-[#eab308] text-[12px]">{opt.odd}</span>
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

