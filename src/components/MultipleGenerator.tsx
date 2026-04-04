import React, { useState } from 'react';
import { LEAGUES, TEAMS_BY_LEAGUE, getTeamLogo } from '../data';
import { Loader2, RefreshCw, Flame, CheckCircle } from 'lucide-react';

export function MultipleGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [multiples, setMultiples] = useState<any[]>([]);

  const generateMultiples = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newMultiples = [];
      
      for (const league of LEAGUES) {
        const teams = TEAMS_BY_LEAGUE[league.id] || [];
        if (teams.length < 2) continue;
        
        const count = league.id === 'afr' ? 20 : 10;
        const leagueMultiples = [];
        
        for (let i = 0; i < count; i++) {
          const numMatches = Math.floor(Math.random() * 3) + 3; // 3 to 5 matches per multiple
          const matches = [];
          let totalOdd = 1;
          
          for (let j = 0; j < numMatches; j++) {
            const homeIdx = Math.floor(Math.random() * teams.length);
            let awayIdx = Math.floor(Math.random() * teams.length);
            while (awayIdx === homeIdx) awayIdx = Math.floor(Math.random() * teams.length);
            
            const homeTeam = teams[homeIdx];
            const awayTeam = teams[awayIdx];
            
            const odd = Number((Math.random() * 1.5 + 1.2).toFixed(2));
            totalOdd *= odd;
            
            const predictionTypes = ['1', 'X', '2', '1X', '12', 'X2', 'O 1.5', 'O 2.5', 'GG'];
            const prediction = predictionTypes[Math.floor(Math.random() * predictionTypes.length)];
            
            matches.push({ homeTeam, awayTeam, odd, prediction });
          }
          
          leagueMultiples.push({
            id: Math.random().toString(36).substr(2, 9),
            matches,
            totalOdd: totalOdd.toFixed(2),
            isHot: Math.random() > 0.8
          });
        }
        
        newMultiples.push({ league, combinations: leagueMultiples });
      }
      
      setMultiples(newMultiples);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Générateur de Multiples</h3>
        <p className="text-sm text-slate-400 mb-4">Générez automatiquement des combinaisons optimisées par ligue (20 pour la CAN, 10 pour les autres).</p>
        <button 
          onClick={generateMultiples}
          disabled={isGenerating}
          className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isGenerating ? 'Génération en cours...' : 'Générer les Multiples'}
        </button>
      </div>

      {multiples.map((group, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <img src={group.league.logo} alt={group.league.name} className="w-5 h-5 object-contain" />
            <h4 className="font-bold text-white">{group.league.name}</h4>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{group.combinations.length} tickets</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {group.combinations.map((combo: any) => (
              <div key={combo.id} className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden relative">
                {combo.isHot && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg shadow-lg flex items-center gap-1 z-10">
                    <Flame className="w-2.5 h-2.5" /> HOT
                  </div>
                )}
                <div className="bg-slate-800/80 px-3 py-2 border-b border-slate-700/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Ticket #{combo.id.toUpperCase()}</span>
                  <div className="flex items-center gap-1 text-[#eab308] font-bold text-sm">
                    Cote Totale: {combo.totalOdd}
                  </div>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {combo.matches.map((match: any, mIdx: number) => (
                    <div key={mIdx} className="p-2 flex items-center justify-between text-[11px] hover:bg-slate-800/30">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <img src={getTeamLogo(match.homeTeam, group.league.id)} alt="" className="w-3.5 h-3.5" />
                          <span className="text-slate-300 truncate">{match.homeTeam}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <img src={getTeamLogo(match.awayTeam, group.league.id)} alt="" className="w-3.5 h-3.5" />
                          <span className="text-slate-300 truncate">{match.awayTeam}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 min-w-[60px]">
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-center w-full">{match.prediction}</span>
                        <span className="font-bold text-[#eab308]">{match.odd.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-slate-800/30 border-t border-slate-700/50">
                  <button className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Copier le code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
