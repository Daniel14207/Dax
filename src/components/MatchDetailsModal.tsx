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

  const genResult = () => {
    const pseudoRandom = ((scoreSeed) * 9301 + 49297) % 233280 / 233280;
    
    // Use odds to determine favorite
    const { home, draw, away } = odds;
    let ft1x2 = 'X';
    if (home < away && home < draw) ft1x2 = '1';
    else if (away < home && away < draw) ft1x2 = '2';
    
    let ht1x2 = ft1x2 === 'X' ? 'X' : (pseudoRandom > 0.5 ? ft1x2 : 'X');
    let dc = ft1x2 === '1' ? '1X' : (ft1x2 === '2' ? 'X2' : '1X');
    let dcHt = ht1x2 === '1' ? '1X' : (ht1x2 === '2' ? 'X2' : '1X');
    
    let exactScore = `${homeScore}-${awayScore}`;
    let htHomeScore = Math.floor(homeScore / 2) + (pseudoRandom > 0.7 ? 1 : 0);
    let htAwayScore = Math.floor(awayScore / 2) + (pseudoRandom < 0.3 ? 1 : 0);
    if (htHomeScore > homeScore) htHomeScore = homeScore;
    if (htAwayScore > awayScore) htAwayScore = awayScore;
    let htScore = `${htHomeScore}-${htAwayScore}`;
    
    const totalGoals = homeScore + awayScore;
    const ou05 = totalGoals > 0 ? '✔' : '✖';
    const ou15 = totalGoals > 1 ? '✔' : '✖';
    const ou25 = totalGoals > 2 ? '✔' : '✖';
    const ou35 = totalGoals > 3 ? '✔' : '✖';
    
    const ggng = (homeScore > 0 && awayScore > 0) ? 'GG' : 'NG';
    const htft = `${ht1x2}/${ft1x2}`;
    const oddEven = totalGoals % 2 === 0 ? 'Pair' : 'Impair';
    const firstGoalMin = totalGoals > 0 ? Math.floor(pseudoRandom * 45 + 1) + '’' : 'Pas de but';
    
    const homeOu15 = homeScore > 1 ? '✔' : '✖';
    const homeOu25 = homeScore > 2 ? '✔' : '✖';
    const awayOu05 = awayScore > 0 ? '✔' : '✖';
    const awayOu15 = awayScore > 1 ? '✔' : '✖';

    return {
      ht1x2, dc, dcHt, exactScore, htScore,
      ou05, ou15, ou25, ou35,
      ggng, totalGoals, htft, oddEven, firstGoalMin,
      homeOu15, homeOu25, awayOu05, awayOu15
    };
  };

  const res = genResult();

  return (
    <div className="fixed inset-0 bg-[#0D0D0D]/80 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] w-full max-w-2xl border border-[#E5E7EB] my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB] sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
            <h3 className="font-bold text-[#111827] text-sm">{league.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-xl active:scale-95 transition-transform transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Info */}
        <div className="p-4 bg-white border-b border-[#E5E7EB]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium bg-[#F9FAFB] px-2 py-1 rounded-full text-[#6B7280] border border-[#E5E7EB]">
              <Clock className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>{slot.time}</span>
            </div>
            {slot.isPast && <span className="text-[11px] font-bold text-red-500 uppercase bg-red-50 px-2 py-1 rounded-full border border-red-100">Résultat Final</span>}
            {isLive && <span className="text-[11px] font-bold text-[#22C55E] uppercase bg-[#22C55E]/10 px-2 py-1 rounded-full border border-[#22C55E]/20 animate-pulse">Match en cours</span>}
            {isFuture && <span className="text-[11px] font-bold text-[#6B7280] uppercase bg-[#F9FAFB] px-2 py-1 rounded-full border border-[#E5E7EB]">Prédiction</span>}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-12 h-12 object-contain drop-shadow-sm" />
              <span className="font-bold text-[#111827] text-sm text-center leading-tight">{homeTeam}</span>
            </div>
            
            <div className="px-4 flex flex-col items-center justify-center">
              {isResult ? (
                <div className="text-2xl font-black text-[#111827] tracking-widest bg-[#F9FAFB] px-4 py-2 rounded-xl border-2 border-[#E5E7EB] shadow-inner">
                  {homeScore} - {awayScore}
                </div>
              ) : (
                <div className="text-[#9CA3AF] font-black text-xl bg-[#F9FAFB] px-3 py-1.5 rounded-xl border border-[#E5E7EB]">VS</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(awayTeam, league.id)} alt={awayTeam} className="w-12 h-12 object-contain drop-shadow-sm" />
              <span className="font-bold text-[#111827] text-sm text-center leading-tight">{awayTeam}</span>
            </div>
          </div>
        </div>

        {/* Betting Markets -> Replaced with Exact Format */}
        <div className="p-4 overflow-y-auto flex-1 bg-[#F9FAFB]">
          <div className="space-y-4 text-sm font-medium text-[#6B7280]">
            <div>
              <span className="text-[#111827] font-semibold">Mi-temps 1X2:</span> {res.ht1x2}<br/>
              👉 <span className="text-[#111827] font-semibold">Double Chance:</span> {res.dc}<br/>
              👉 <span className="text-[#111827] font-semibold">Mi-temps DC:</span> {res.dcHt}<br/>
              👉 <span className="text-[#111827] font-semibold">Score exact:</span> {res.exactScore}<br/>
              👉 <span className="text-[#111827] font-semibold">Mi-temps Score:</span> {res.htScore}
            </div>

            <div>
              👉 <span className="text-[#111827] font-semibold">Over/Under:</span><br/>
              +0.5 {res.ou05 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +1.5 {res.ou15 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +2.5 {res.ou25 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +3.5 {res.ou35 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}
            </div>

            <div>
              👉 <span className="text-[#111827] font-semibold">GG/NG:</span> {res.ggng}<br/>
              👉 <span className="text-[#111827] font-semibold">Total buts:</span> {res.totalGoals}<br/>
              👉 <span className="text-[#111827] font-semibold">HT/FT:</span> {res.htft}<br/>
              👉 <span className="text-[#111827] font-semibold">Pair/Impair:</span> {res.oddEven}<br/>
              👉 <span className="text-[#111827] font-semibold">First goal:</span> {res.firstGoalMin}
            </div>

            <div>
              👉 <span className="text-[#111827] font-semibold">Team domicile:</span><br/>
              +1.5 {res.homeOu15 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +2.5 {res.homeOu25 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}
            </div>

            <div>
              👉 <span className="text-[#111827] font-semibold">Team extérieur:</span><br/>
              +0.5 {res.awayOu05 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +1.5 {res.awayOu15 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

