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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl border border-slate-200 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-800/80 sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
            <h3 className="font-bold text-white text-sm">{league.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Info */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium bg-slate-800 px-2 py-1 rounded-full text-slate-300 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-[#eab308]" />
              <span>{slot.time}</span>
            </div>
            {slot.isPast && <span className="text-[11px] font-bold text-red-400 uppercase bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">Résultat Final</span>}
            {isLive && <span className="text-[11px] font-bold text-[#2dd4bf] uppercase bg-[#2dd4bf]/10 px-2 py-1 rounded-full border border-[#2dd4bf]/20 animate-pulse">Match en cours</span>}
            {isFuture && <span className="text-[11px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-1 rounded-full border border-slate-200">Prédiction</span>}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-12 h-12 object-contain drop-shadow-lg" />
              <span className="font-bold text-white text-sm text-center leading-tight">{homeTeam}</span>
            </div>
            
            <div className="px-4 flex flex-col items-center justify-center">
              {isResult ? (
                <div className="text-2xl font-black text-white tracking-widest bg-slate-800 px-4 py-2 rounded-xl border-2 border-slate-200 shadow-inner">
                  {homeScore} - {awayScore}
                </div>
              ) : (
                <div className="text-slate-500 font-black text-xl bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">VS</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center gap-2">
              <img src={getTeamLogo(awayTeam, league.id)} alt={awayTeam} className="w-12 h-12 object-contain drop-shadow-lg" />
              <span className="font-bold text-white text-sm text-center leading-tight">{awayTeam}</span>
            </div>
          </div>
        </div>

        {/* Betting Markets -> Replaced with Exact Format */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50">
          <div className="space-y-4 text-sm font-medium text-slate-700">
            <div>
              Mi-temps 1X2: {res.ht1x2}<br/>
              👉 Double Chance: {res.dc}<br/>
              👉 Mi-temps DC: {res.dcHt}<br/>
              👉 Score exact: {res.exactScore}<br/>
              👉 Mi-temps Score: {res.htScore}
            </div>

            <div>
              👉 Over/Under:<br/>
              +0.5 {res.ou05}<br/>
              +1.5 {res.ou15}<br/>
              +2.5 {res.ou25}<br/>
              +3.5 {res.ou35}
            </div>

            <div>
              👉 GG/NG: {res.ggng}<br/>
              👉 Total buts: {res.totalGoals}<br/>
              👉 HT/FT: {res.htft}<br/>
              👉 Pair/Impair: {res.oddEven}<br/>
              👉 First goal: {res.firstGoalMin}
            </div>

            <div>
              👉 Team domicile:<br/>
              +1.5 {res.homeOu15}<br/>
              +2.5 {res.homeOu25}
            </div>

            <div>
              👉 Team extérieur:<br/>
              +0.5 {res.awayOu05}<br/>
              +1.5 {res.awayOu15}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

