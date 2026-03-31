import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Flame, CheckCircle, ShieldCheck } from 'lucide-react';

export function MultipleGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [multiples, setMultiples] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const savedResults = localStorage.getItem('virtualAnalyses');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error("Failed to parse saved results", e);
      }
    }
  }, []);

  const generateMultiples = () => {
    if (results.length < 3) {
      alert("Veuillez analyser au moins 3 matchs dans l'onglet BEST LIVE ou ANALYSE MANUELLE pour générer des multiples.");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const newMultiples: any[] = [];
      let currentMultipleId = 0;

      const getOdd = (match: any) => {
          const pick = match.results?.ft1x2;
          if (pick === '1') return match.extractedOdds?.home || 1.5;
          if (pick === '2') return match.extractedOdds?.away || 1.5;
          return match.extractedOdds?.draw || 1.5;
      };

      // Generate all combinations of 3 matches
      const combinations: any[][] = [];
      for (let i = 0; i < results.length; i++) {
          for (let j = i + 1; j < results.length; j++) {
              for (let k = j + 1; k < results.length; k++) {
                  combinations.push([results[i], results[j], results[k]]);
              }
          }
      }

      // Sort combinations by total odds descending to get the best ones first
      combinations.sort((a, b) => {
          const oddA = getOdd(a[0]) * getOdd(a[1]) * getOdd(a[2]);
          const oddB = getOdd(b[0]) * getOdd(b[1]) * getOdd(b[2]);
          return oddB - oddA;
      });

      // Take up to 20 combinations
      const selectedCombinations = combinations.slice(0, 20);

      for (const combo of selectedCombinations) {
          const m1 = combo[0];
          const m2 = combo[1];
          const m3 = combo[2];
          
          const odd1 = getOdd(m1);
          const odd2 = getOdd(m2);
          const odd3 = getOdd(m3);
          
          newMultiples.push({
              id: currentMultipleId++,
              picks: [
                  { match: m1.originalMatchString || `${m1.homeTeam} vs ${m1.awayTeam}`, pick: m1.results.ft1x2, odd: odd1 },
                  { match: m2.originalMatchString || `${m2.homeTeam} vs ${m2.awayTeam}`, pick: m2.results.ft1x2, odd: odd2 },
                  { match: m3.originalMatchString || `${m3.homeTeam} vs ${m3.awayTeam}`, pick: m3.results.ft1x2, odd: odd3 }
              ],
              totalOdds: (odd1 * odd2 * odd3).toFixed(2)
          });
      }

      setMultiples(newMultiples);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800 text-center">
        <h3 className="text-lg font-bold text-white mb-2">Générateur de Multiples</h3>
        <p className="text-sm text-slate-400 mb-4">Générez automatiquement des combinaisons optimisées à partir de vos matchs analysés (jusqu'à 20 tickets).</p>
        <button 
          onClick={generateMultiples}
          disabled={isGenerating || results.length < 3}
          className="w-full bg-[#eab308] hover:bg-[#ca8a04] disabled:opacity-50 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isGenerating ? 'Génération en cours...' : 'Générer les Multiples'}
        </button>
        {results.length < 3 && (
          <p className="text-xs text-red-400 mt-2">Analysez au moins 3 matchs pour utiliser le générateur.</p>
        )}
      </div>

      {multiples.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white">Tickets Multiples</h4>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{multiples.length} tickets</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {multiples.map((mult) => (
              <div key={mult.id} className="bg-[#1e293b] rounded-xl border border-slate-800 overflow-hidden relative">
                <div className="bg-slate-800/80 px-3 py-2 border-b border-slate-700/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">Ticket #{mult.id + 1}</span>
                  <div className="flex items-center gap-1 text-[#eab308] font-bold text-sm">
                    Cote Totale: {mult.totalOdds}
                  </div>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {mult.picks.map((pick: any, mIdx: number) => (
                    <div key={mIdx} className="p-2 flex items-center justify-between text-[11px] hover:bg-slate-800/30">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 truncate">{pick.match}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 min-w-[60px]">
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-center w-full">{pick.pick}</span>
                        <span className="font-bold text-[#eab308]">{pick.odd.toFixed(2)}</span>
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
      )}
    </div>
  );
}
