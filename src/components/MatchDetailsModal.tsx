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
    <div className="fixed inset-0 bg-[var(--header-bg)]/80 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-[var(--card-bg)] rounded-2xl theme-shadow w-full max-w-2xl border border-[var(--border-color)] my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--tab-bg)] sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
            <h3 className="font-bold text-[var(--text-primary)] text-sm">{league.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--tab-bg)] rounded-xl active:scale-95 transition-transform transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Info */}
        <div className="p-4 bg-[var(--card-bg)] border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium bg-[var(--tab-bg)] px-2 py-1 rounded-full text-[var(--text-secondary)] border border-[var(--border-color)]">
              <Clock className="w-3.5 h-3.5 text-[var(--btn-primary)]" />
              <span>{slot.time}</span>
            </div>
            {slot.isPast && <span className="text-[11px] font-bold text-[#EF4444] uppercase bg-[#EF4444]/10 px-2 py-1 rounded-full border border-[#EF4444]/20">Résultat Final</span>}
            {isLive && <span className="text-[11px] font-bold text-[#22C55E] uppercase bg-[#22C55E]/10 px-2 py-1 rounded-full border border-[#22C55E]/20 animate-pulse">Match en cours</span>}
            {isFuture && <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase bg-[var(--tab-bg)] px-2 py-1 rounded-full border border-[var(--border-color)]">Prédiction</span>}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-12 h-12 object-contain drop-shadow-sm" />
              <span className="font-bold text-[var(--text-primary)] text-sm text-center leading-tight">{homeTeam}</span>
            </div>
            
            <div className="px-4 flex flex-col items-center justify-center">
              {isResult ? (
                <div className="text-2xl font-black text-[var(--text-primary)] tracking-widest bg-[var(--tab-bg)] px-4 py-2 rounded-xl border-2 border-[var(--border-color)] shadow-inner">
                  {homeScore} - {awayScore}
                </div>
              ) : (
                <div className="text-[var(--text-secondary)] font-black text-xl bg-[var(--tab-bg)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">VS</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(awayTeam, league.id)} alt={awayTeam} className="w-12 h-12 object-contain drop-shadow-sm" />
              <span className="font-bold text-[var(--text-primary)] text-sm text-center leading-tight">{awayTeam}</span>
            </div>
          </div>
        </div>

        {/* Betting Markets -> Replaced with Exact Format */}
        <div className="p-4 overflow-y-auto flex-1 bg-[var(--tab-bg)]">
          <div className="space-y-4 text-sm font-medium text-[var(--text-secondary)]">
            <div>
              <span className="text-[var(--text-primary)] font-semibold">Mi-temps 1X2:</span> {res.ht1x2}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">Double Chance:</span> {res.dc}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">Mi-temps DC:</span> {res.dcHt}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">Score exact:</span> {res.exactScore}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">Mi-temps Score:</span> {res.htScore}
            </div>

            <div>
              👉 <span className="text-[var(--text-primary)] font-semibold">Over/Under:</span><br/>
              +0.5 {res.ou05 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +1.5 {res.ou15 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +2.5 {res.ou25 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +3.5 {res.ou35 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}
            </div>

            <div>
              👉 <span className="text-[var(--text-primary)] font-semibold">GG/NG:</span> {res.ggng}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">Total buts:</span> {res.totalGoals}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">HT/FT:</span> {res.htft}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">Pair/Impair:</span> {res.oddEven}<br/>
              👉 <span className="text-[var(--text-primary)] font-semibold">First goal:</span> {res.firstGoalMin}
            </div>

            <div>
              👉 <span className="text-[var(--text-primary)] font-semibold">Team domicile:</span><br/>
              +1.5 {res.homeOu15 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +2.5 {res.homeOu25 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}
            </div>

            <div>
              👉 <span className="text-[var(--text-primary)] font-semibold">Team extérieur:</span><br/>
              +0.5 {res.awayOu05 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}<br/>
              +1.5 {res.awayOu15 === '✔' ? <span className="text-[#22C55E]">✔</span> : <span className="text-[#EF4444]">✖</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

